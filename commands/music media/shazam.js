import acrcloud from "acrcloud";
import yts from "yt-search";
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to trim audio to 15 seconds
function trimTo15Seconds(inputBuffer, outputPath) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const inputFile = path.join(tempDir, `input-${Date.now()}.mp4`);
    const outputFile = outputPath;

    fs.writeFileSync(inputFile, inputBuffer);

    ffmpeg(inputFile)
      .setStartTime(0)
      .duration(15)
      .output(outputFile)
      .on('end', () => {
        const trimmed = fs.readFileSync(outputFile);
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
        resolve(trimmed);
      })
      .on('error', (err) => {
        // Clean up on error
        if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        reject(err);
      })
      .run();
  });
}

export default {
  name: 'shazam',
  aliases: ['whatsong', 'findsong', 'identify', 'musicid'],
  description: 'Identify a song from a short audio or video and show details.',
  category: 'Search',

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    
    try {
      // Check if message is a reply
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const hasAudio = m.message?.audioMessage;
      const hasVideo = m.message?.videoMessage;
      
      // If no audio/video and no quoted message, show help
      if (!quoted && !hasAudio && !hasVideo) {
        await sock.sendMessage(jid, {
          text: `🎵 *Music Identification*\n\n` +
                `*Identify songs from:*\n` +
                `• Voice/audio messages (send or reply)\n` +
                `• Video messages (audio will be extracted)\n` +
                `• Or search by song name\n\n` +
                `*Usage:*\n` +
                `• Reply to audio/video with "shazam"\n` +
                `• Send audio/video with caption "shazam"\n` +
                `• \`shazam song name\` (text search)\n\n` +
                `*Examples:*\n` +
                `• Reply to song → "shazam"\n` +
                `• shazam shape of you\n` +
                `• shazam blinding lights the weeknd\n\n` +
                `*Note:* Best with 10-15 second clear audio clips`
        }, { quoted: m });
        return;
      }

      // Send initial status
      const statusMsg = await sock.sendMessage(jid, {
        text: `🔍 *Listening to audio...*\n\n` +
              `🎵 Analyzing audio sample...\n` +
              `⏳ Please wait 10-15 seconds`
      }, { quoted: m });

      let audioBuffer;
      let searchQuery = '';

      // Handle text-based search
      if (args.length > 0 && !quoted && !hasAudio && !hasVideo) {
        searchQuery = args.join(' ');
        await sock.sendMessage(jid, {
          text: `🔍 *Searching for:* "${searchQuery}"\n\n` +
                `📡 Looking up song information...`,
          edit: statusMsg.key
        });

        // Search YouTube for the song
        const searchResults = await yts(searchQuery);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
          await sock.sendMessage(jid, {
            text: `❌ *No results found for:* "${searchQuery}"\n\n` +
                  `Try:\n` +
                  `• More specific search terms\n` +
                  `• Include artist name\n` +
                  `• Send audio sample instead`,
            edit: statusMsg.key
          });
          return;
        }

        const video = searchResults.videos[0];
        const resultText = `🎵 *Song Found!*\n\n` +
                          `*Title:* ${video.title}\n` +
                          `*Duration:* ${video.timestamp}\n` +
                          `*Channel:* ${video.author.name}\n` +
                          `*Views:* ${video.views}\n` +
                          `*Uploaded:* ${video.ago}\n\n` +
                          `🔗 *YouTube Link:* ${video.url}\n\n` +
                          `*Source:* YouTube Search`;

        await sock.sendMessage(jid, {
          text: resultText,
          edit: statusMsg.key
        });

        // Try to send thumbnail
        try {
          const imageResponse = await fetch(video.thumbnail);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
          await sock.sendMessage(jid, {
            image: imageBuffer,
            caption: `🎵 ${video.title}`
          });
        } catch (imageError) {
          console.log('Could not fetch thumbnail:', imageError.message);
        }
        return;
      }

      // Handle audio/video recognition
      let mediaBuffer;
      let mediaType = '';

      // Determine media source
      if (quoted) {
        // Quoted message
        if (quoted.audioMessage) {
          mediaType = 'audio';
        } else if (quoted.videoMessage) {
          mediaType = 'video';
        } else {
          await sock.sendMessage(jid, {
            text: `❌ *No audio found in quoted message*\n\n` +
                  `Please quote an audio or video message.`,
            edit: statusMsg.key
          });
          return;
        }

        // Download quoted media
        mediaBuffer = await downloadMediaMessage(
          { 
            key: { 
              remoteJid: jid, 
              id: m.message?.extendedTextMessage?.contextInfo?.stanzaId || m.key.id 
            }, 
            message: quoted 
          },
          'buffer',
          {},
          { logger: console }
        );

      } else if (hasAudio || hasVideo) {
        // Direct message with audio/video
        mediaType = hasAudio ? 'audio' : 'video';
        
        mediaBuffer = await downloadMediaMessage(
          { key: m.key, message: m.message },
          'buffer',
          {},
          { logger: console }
        );
      }

      if (!mediaBuffer) {
        await sock.sendMessage(jid, {
          text: `❌ *Failed to download media*\n\n` +
                `Please try again with a different audio/video.`,
          edit: statusMsg.key
        });
        return;
      }

      await sock.sendMessage(jid, {
        text: `🔍 *Listening to audio...*\n\n` +
              `${mediaType === 'audio' ? '🎵' : '🎬'} Processing ${mediaType}...\n` +
              `⏳ Trimming to 15 seconds...`,
        edit: statusMsg.key
      });

      // Trim audio to 15 seconds
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const trimmedPath = path.join(tempDir, `trimmed-${Date.now()}.mp4`);
      audioBuffer = await trimTo15Seconds(mediaBuffer, trimmedPath);

      await sock.sendMessage(jid, {
        text: `🔍 *Listening to audio...*\n\n` +
              `✅ Audio sample ready\n` +
              `📡 Identifying song...`,
        edit: statusMsg.key
      });

      // Initialize ACRCloud
      const acr = new acrcloud({
        host: 'identify-ap-southeast-1.acrcloud.com',
        access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
        access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
      });

      // Identify song
      const { status, metadata } = await acr.identify(audioBuffer);

      if (status.code !== 0 || !metadata?.music?.length) {
        await sock.sendMessage(jid, {
          text: `❌ *Could not recognize the song*\n\n` +
                `*Possible reasons:*\n` +
                `• Audio too short/noisy\n` +
                `• Song not in database\n` +
                `• Multiple songs in sample\n\n` +
                `*Try:*\n` +
                `• Longer audio sample (15+ seconds)\n` +
                `• Clearer audio quality\n` +
                `• Search by text: \`shazam song name\``,
          edit: statusMsg.key
        });
        return;
      }

      const music = metadata.music[0];
      const { title, artists, album, genres, release_date, external_metadata } = music;

      // Search YouTube for the identified song
      const query = `${title} ${artists?.[0]?.name || ''}`;
      const search = await yts(query);

      // Build result message
      let result = `🎶 *Song Identified!*\n\n`;
      result += `🎧 *Title:* ${title || 'Unknown'}\n`;
      
      if (artists && artists.length > 0) {
        result += `👤 *Artist(s):* ${artists.map(a => a.name).join(', ')}\n`;
      }
      
      if (album?.name) {
        result += `💿 *Album:* ${album.name}\n`;
      }
      
      if (genres && genres.length > 0) {
        result += `🎼 *Genre:* ${genres.map(g => g.name).join(', ')}\n`;
      }
      
      if (release_date) {
        result += `📅 *Released:* ${release_date}\n`;
      }
      
      // Add streaming links if available
      if (external_metadata) {
        if (external_metadata.youtube?.url) {
          result += `\n🔗 *YouTube:* ${external_metadata.youtube.url}\n`;
        }
        if (external_metadata.spotify?.track?.external_urls?.spotify) {
          result += `🎵 *Spotify:* ${external_metadata.spotify.track.external_urls.spotify}\n`;
        }
        if (external_metadata.apple_music?.url) {
          result += `🍎 *Apple Music:* ${external_metadata.apple_music.url}\n`;
        }
      }
      
      // Add YouTube search result if no streaming links
      if (search?.videos?.[0]?.url && !external_metadata?.youtube?.url) {
        result += `\n🔗 *YouTube Search:* ${search.videos[0].url}\n`;
      }

      // Add search links
      const searchQueryEncoded = encodeURIComponent(`${title} ${artists?.[0]?.name || ''}`);
      result += `\n*Search Online:*\n`;
      result += `• Google: https://google.com/search?q=${searchQueryEncoded}\n`;
      result += `• YouTube: https://youtube.com/results?search_query=${searchQueryEncoded}\n`;
      
      if (artists?.[0]?.name) {
        result += `• Deezer: https://deezer.com/search/${searchQueryEncoded}`;
      }

      // Send result
      await sock.sendMessage(jid, {
        text: result,
        edit: statusMsg.key
      });

      // Try to send album art
      try {
        if (album?.cover) {
          const imageResponse = await fetch(album.cover);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
          await sock.sendMessage(jid, {
            image: imageBuffer,
            caption: `🎵 ${title} - ${artists?.[0]?.name || 'Unknown Artist'}`
          });
        } else if (search?.videos?.[0]?.thumbnail) {
          const imageResponse = await fetch(search.videos[0].thumbnail);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
          await sock.sendMessage(jid, {
            image: imageBuffer,
            caption: `🎵 ${title} - ${artists?.[0]?.name || 'Unknown Artist'}`
          });
        }
      } catch (imageError) {
        console.log('Could not fetch album art:', imageError.message);
      }

      console.log(`✅ Song identified: ${title} - ${artists?.[0]?.name || 'Unknown'}`);

    } catch (error) {
      console.error("❌ Shazam error:", error);
      
      let errorMessage = `❌ *Error identifying song*\n\n`;
      
      if (error.message.includes('timeout')) {
        errorMessage += `Request timed out.\n`;
        errorMessage += `Try again with shorter audio.`;
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        errorMessage += `Network error.\n`;
        errorMessage += `Check your internet connection.`;
      } else if (error.message.includes('ffmpeg')) {
        errorMessage += `Audio processing failed.\n`;
        errorMessage += `Try sending audio file instead of video.`;
      } else if (error.message.includes('downloadMediaMessage')) {
        errorMessage += `Failed to download media.\n`;
        errorMessage += `Make sure the audio/video is accessible.`;
      } else {
        errorMessage += `Error: ${error.message.substring(0, 100)}`;
      }
      
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  }
};