// import acrcloud from "acrcloud";
// import yts from "yt-search";
// import { downloadMediaMessage } from '@whiskeysockets/baileys';
// import fs from "fs";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Set ffmpeg path
// ffmpeg.setFfmpegPath(ffmpegPath);

// // Function to trim audio to 15 seconds
// function trimTo15Seconds(inputBuffer, outputPath) {
//   return new Promise((resolve, reject) => {
//     const tempDir = path.join(__dirname, '..', 'temp');
//     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//     const inputFile = path.join(tempDir, `input-${Date.now()}.mp4`);
//     const outputFile = outputPath;

//     fs.writeFileSync(inputFile, inputBuffer);

//     ffmpeg(inputFile)
//       .setStartTime(0)
//       .duration(15)
//       .output(outputFile)
//       .on('end', () => {
//         const trimmed = fs.readFileSync(outputFile);
//         fs.unlinkSync(inputFile);
//         fs.unlinkSync(outputFile);
//         resolve(trimmed);
//       })
//       .on('error', (err) => {
//         // Clean up on error
//         if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
//         if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
//         reject(err);
//       })
//       .run();
//   });
// }

// export default {
//   name: 'shazam',
//   aliases: ['whatsong', 'findsong', 'identify', 'musicid'],
//   description: 'Identify a song from a short audio or video and show details.',
//   category: 'Search',

//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
    
//     try {
//       // Check if message is a reply
//       const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
//       const hasAudio = m.message?.audioMessage;
//       const hasVideo = m.message?.videoMessage;
      
//       // If no audio/video and no quoted message, show help
//       if (!quoted && !hasAudio && !hasVideo) {
//         await sock.sendMessage(jid, {
//           text: `🎵 *Music Identification*\n\n` +
//                 `*Identify songs from:*\n` +
//                 `• Voice/audio messages (send or reply)\n` +
//                 `• Video messages (audio will be extracted)\n` +
//                 `• Or search by song name\n\n` +
//                 `*Usage:*\n` +
//                 `• Reply to audio/video with "shazam"\n` +
//                 `• Send audio/video with caption "shazam"\n` +
//                 `• \`shazam song name\` (text search)\n\n` +
//                 `*Examples:*\n` +
//                 `• Reply to song → "shazam"\n` +
//                 `• shazam shape of you\n` +
//                 `• shazam blinding lights the weeknd\n\n` +
//                 `*Note:* Best with 10-15 second clear audio clips`
//         }, { quoted: m });
//         return;
//       }

//       // Send initial status
//       const statusMsg = await sock.sendMessage(jid, {
//         text: `🔍 *Listening to audio...*\n\n` +
//               `🎵 Analyzing audio sample...\n` +
//               `⏳ Please wait 10-15 seconds`
//       }, { quoted: m });

//       let audioBuffer;
//       let searchQuery = '';

//       // Handle text-based search
//       if (args.length > 0 && !quoted && !hasAudio && !hasVideo) {
//         searchQuery = args.join(' ');
//         await sock.sendMessage(jid, {
//           text: `🔍 *Searching for:* "${searchQuery}"\n\n` +
//                 `📡 Looking up song information...`,
//           edit: statusMsg.key
//         });

//         // Search YouTube for the song
//         const searchResults = await yts(searchQuery);
        
//         if (!searchResults.videos || searchResults.videos.length === 0) {
//           await sock.sendMessage(jid, {
//             text: `❌ *No results found for:* "${searchQuery}"\n\n` +
//                   `Try:\n` +
//                   `• More specific search terms\n` +
//                   `• Include artist name\n` +
//                   `• Send audio sample instead`,
//             edit: statusMsg.key
//           });
//           return;
//         }

//         const video = searchResults.videos[0];
//         const resultText = `🎵 *Song Found!*\n\n` +
//                           `*Title:* ${video.title}\n` +
//                           `*Duration:* ${video.timestamp}\n` +
//                           `*Channel:* ${video.author.name}\n` +
//                           `*Views:* ${video.views}\n` +
//                           `*Uploaded:* ${video.ago}\n\n` +
//                           `🔗 *YouTube Link:* ${video.url}\n\n` +
//                           `*Source:* YouTube Search`;

//         await sock.sendMessage(jid, {
//           text: resultText,
//           edit: statusMsg.key
//         });

//         // Try to send thumbnail
//         try {
//           const imageResponse = await fetch(video.thumbnail);
//           const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
//           await sock.sendMessage(jid, {
//             image: imageBuffer,
//             caption: `🎵 ${video.title}`
//           });
//         } catch (imageError) {
//           console.log('Could not fetch thumbnail:', imageError.message);
//         }
//         return;
//       }

//       // Handle audio/video recognition
//       let mediaBuffer;
//       let mediaType = '';

//       // Determine media source
//       if (quoted) {
//         // Quoted message
//         if (quoted.audioMessage) {
//           mediaType = 'audio';
//         } else if (quoted.videoMessage) {
//           mediaType = 'video';
//         } else {
//           await sock.sendMessage(jid, {
//             text: `❌ *No audio found in quoted message*\n\n` +
//                   `Please quote an audio or video message.`,
//             edit: statusMsg.key
//           });
//           return;
//         }

//         // Download quoted media
//         mediaBuffer = await downloadMediaMessage(
//           { 
//             key: { 
//               remoteJid: jid, 
//               id: m.message?.extendedTextMessage?.contextInfo?.stanzaId || m.key.id 
//             }, 
//             message: quoted 
//           },
//           'buffer',
//           {},
//           { logger: console }
//         );

//       } else if (hasAudio || hasVideo) {
//         // Direct message with audio/video
//         mediaType = hasAudio ? 'audio' : 'video';
        
//         mediaBuffer = await downloadMediaMessage(
//           { key: m.key, message: m.message },
//           'buffer',
//           {},
//           { logger: console }
//         );
//       }

//       if (!mediaBuffer) {
//         await sock.sendMessage(jid, {
//           text: `❌ *Failed to download media*\n\n` +
//                 `Please try again with a different audio/video.`,
//           edit: statusMsg.key
//         });
//         return;
//       }

//       await sock.sendMessage(jid, {
//         text: `🔍 *Listening to audio...*\n\n` +
//               `${mediaType === 'audio' ? '🎵' : '🎬'} Processing ${mediaType}...\n` +
//               `⏳ Trimming to 15 seconds...`,
//         edit: statusMsg.key
//       });

//       // Trim audio to 15 seconds
//       const tempDir = path.join(__dirname, '..', 'temp');
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const trimmedPath = path.join(tempDir, `trimmed-${Date.now()}.mp4`);
//       audioBuffer = await trimTo15Seconds(mediaBuffer, trimmedPath);

//       await sock.sendMessage(jid, {
//         text: `🔍 *Listening to audio...*\n\n` +
//               `✅ Audio sample ready\n` +
//               `📡 Identifying song...`,
//         edit: statusMsg.key
//       });

//       // Initialize ACRCloud
//       const acr = new acrcloud({
//         host: 'identify-ap-southeast-1.acrcloud.com',
//         access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
//         access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
//       });

//       // Identify song
//       const { status, metadata } = await acr.identify(audioBuffer);

//       if (status.code !== 0 || !metadata?.music?.length) {
//         await sock.sendMessage(jid, {
//           text: `❌ *Could not recognize the song*\n\n` +
//                 `*Possible reasons:*\n` +
//                 `• Audio too short/noisy\n` +
//                 `• Song not in database\n` +
//                 `• Multiple songs in sample\n\n` +
//                 `*Try:*\n` +
//                 `• Longer audio sample (15+ seconds)\n` +
//                 `• Clearer audio quality\n` +
//                 `• Search by text: \`shazam song name\``,
//           edit: statusMsg.key
//         });
//         return;
//       }

//       const music = metadata.music[0];
//       const { title, artists, album, genres, release_date, external_metadata } = music;

//       // Search YouTube for the identified song
//       const query = `${title} ${artists?.[0]?.name || ''}`;
//       const search = await yts(query);

//       // Build result message
//       let result = `🎶 *Song Identified!*\n\n`;
//       result += `🎧 *Title:* ${title || 'Unknown'}\n`;
      
//       if (artists && artists.length > 0) {
//         result += `👤 *Artist(s):* ${artists.map(a => a.name).join(', ')}\n`;
//       }
      
//       if (album?.name) {
//         result += `💿 *Album:* ${album.name}\n`;
//       }
      
//       if (genres && genres.length > 0) {
//         result += `🎼 *Genre:* ${genres.map(g => g.name).join(', ')}\n`;
//       }
      
//       if (release_date) {
//         result += `📅 *Released:* ${release_date}\n`;
//       }
      
//       // Add streaming links if available
//       if (external_metadata) {
//         if (external_metadata.youtube?.url) {
//           result += `\n🔗 *YouTube:* ${external_metadata.youtube.url}\n`;
//         }
//         if (external_metadata.spotify?.track?.external_urls?.spotify) {
//           result += `🎵 *Spotify:* ${external_metadata.spotify.track.external_urls.spotify}\n`;
//         }
//         if (external_metadata.apple_music?.url) {
//           result += `🍎 *Apple Music:* ${external_metadata.apple_music.url}\n`;
//         }
//       }
      
//       // Add YouTube search result if no streaming links
//       if (search?.videos?.[0]?.url && !external_metadata?.youtube?.url) {
//         result += `\n🔗 *YouTube Search:* ${search.videos[0].url}\n`;
//       }

//       // Add search links
//       const searchQueryEncoded = encodeURIComponent(`${title} ${artists?.[0]?.name || ''}`);
//       result += `\n*Search Online:*\n`;
//       result += `• Google: https://google.com/search?q=${searchQueryEncoded}\n`;
//       result += `• YouTube: https://youtube.com/results?search_query=${searchQueryEncoded}\n`;
      
//       if (artists?.[0]?.name) {
//         result += `• Deezer: https://deezer.com/search/${searchQueryEncoded}`;
//       }

//       // Send result
//       await sock.sendMessage(jid, {
//         text: result,
//         edit: statusMsg.key
//       });

//       // Try to send album art
//       try {
//         if (album?.cover) {
//           const imageResponse = await fetch(album.cover);
//           const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
//           await sock.sendMessage(jid, {
//             image: imageBuffer,
//             caption: `🎵 ${title} - ${artists?.[0]?.name || 'Unknown Artist'}`
//           });
//         } else if (search?.videos?.[0]?.thumbnail) {
//           const imageResponse = await fetch(search.videos[0].thumbnail);
//           const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
//           await sock.sendMessage(jid, {
//             image: imageBuffer,
//             caption: `🎵 ${title} - ${artists?.[0]?.name || 'Unknown Artist'}`
//           });
//         }
//       } catch (imageError) {
//         console.log('Could not fetch album art:', imageError.message);
//       }

//       console.log(`✅ Song identified: ${title} - ${artists?.[0]?.name || 'Unknown'}`);

//     } catch (error) {
//       console.error("❌ Shazam error:", error);
      
//       let errorMessage = `❌ *Error identifying song*\n\n`;
      
//       if (error.message.includes('timeout')) {
//         errorMessage += `Request timed out.\n`;
//         errorMessage += `Try again with shorter audio.`;
//       } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
//         errorMessage += `Network error.\n`;
//         errorMessage += `Check your internet connection.`;
//       } else if (error.message.includes('ffmpeg')) {
//         errorMessage += `Audio processing failed.\n`;
//         errorMessage += `Try sending audio file instead of video.`;
//       } else if (error.message.includes('downloadMediaMessage')) {
//         errorMessage += `Failed to download media.\n`;
//         errorMessage += `Make sure the audio/video is accessible.`;
//       } else {
//         errorMessage += `Error: ${error.message.substring(0, 100)}`;
//       }
      
//       await sock.sendMessage(jid, {
//         text: errorMessage
//       }, { quoted: m });
//     }
//   }
// };


















import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'shazam',
  description: 'Identify music from audio or video',
  category: 'tools',
  aliases: ['identify', 'whatmusic', 'whatsong', 'songid', 'musicid', 'findmusic', 'recognize'],
  usage: 'shazam [reply to audio/video]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const senderJid = m.key.participant || jid;
    
    // Get quoted message
    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // ====== HELP SECTION ======
    if (!quotedMsg && args.length === 0) {
      const helpText = `🎵 *MUSIC IDENTIFIER*\n\n` +
        `⚡ *Identify songs from audio clips*\n\n` +
        `💡 *Usage:*\n` +
        `• Reply to audio message with .shazam\n` +
        `• Reply to video with .shazam\n` +
        `• Upload audio/video with .shazam\n\n` +
        `✨ *All Available Commands:*\n` +
        `• \`${PREFIX}shazam\` - Main command\n` +
        `• \`${PREFIX}identify\` - Identify\n` +
        `• \`${PREFIX}whatmusic\` - What music\n` +
        `• \`${PREFIX}whatsong\` - What song\n` +
        `• \`${PREFIX}songid\` - Song ID\n` +
        `• \`${PREFIX}musicid\` - Music ID\n` +
        `• \`${PREFIX}findmusic\` - Find music\n` +
        `• \`${PREFIX}recognize\` - Recognize\n\n` +
        `🎯 *Supported Media:*\n` +
        `• Audio messages (voice notes)\n` +
        `• Music files (MP3, etc.)\n` +
        `• Videos with audio\n` +
        `• Short audio clips (10-30 seconds)\n\n` +
        `📝 *Tips:*\n` +
        `• Use clear audio\n` +
        `• 10-30 second clips work best\n` +
        `• Minimize background noise\n` +
        `• Higher quality = better results`;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
    
    // Check if media is present in current message (not quoted)
    const hasDirectAudio = m.message?.audioMessage;
    const hasDirectVideo = m.message?.videoMessage;
    
    let mediaType = 'unknown';
    let mediaMessage = null;
    
    if (quotedMsg) {
      mediaType = this.getMediaType(quotedMsg);
      mediaMessage = quotedMsg;
    } else if (hasDirectAudio) {
      mediaType = 'audio';
      mediaMessage = m.message;
    } else if (hasDirectVideo) {
      mediaType = 'video';
      mediaMessage = m.message;
    }
    
    if (mediaType === 'unknown') {
      return sock.sendMessage(jid, {
        text: `❌ *UNSUPPORTED MEDIA*\n\nPlease reply to or send:\n• Audio message (voice note)\n• Music file\n• Video with audio\n\nOr use: ${PREFIX}shazam help`
      }, { quoted: m });
    }

    try {
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `🎵 *MUSIC IDENTIFIER*\n\n` +
              `🔍 *Analyzing audio...*\n\n` +
              `📊 Media type: ${mediaType.toUpperCase()}\n` +
              `⏳ Identifying song...`
      }, { quoted: m });

      // ====== DOWNLOAD MEDIA ======
      console.log(`🎵 Downloading ${mediaType} for Shazam analysis`);
      
      let mediaBuffer;
      
      if (quotedMsg) {
        if (mediaType === 'audio') {
          mediaBuffer = await this.downloadMedia(quotedMsg.audioMessage, 'audio');
        } else if (mediaType === 'video') {
          mediaBuffer = await this.downloadMedia(quotedMsg.videoMessage, 'video');
        }
      } else if (hasDirectAudio) {
        mediaBuffer = await this.downloadMedia(m.message.audioMessage, 'audio');
      } else if (hasDirectVideo) {
        mediaBuffer = await this.downloadMedia(m.message.videoMessage, 'video');
      }
      
      if (!mediaBuffer || mediaBuffer.length < 1000) {
        throw new Error('Audio too short or corrupted (min 1KB required)');
      }
      
      console.log(`✅ Downloaded ${mediaType}: ${formatBytes(mediaBuffer.length)}`);
      
      // Check if audio is too long (Shazam works best with 10-30 seconds)
      const estimatedDuration = mediaBuffer.length / 16000; // rough estimate
      if (estimatedDuration > 60) {
        await sock.sendMessage(jid, {
          text: `⚠️ *AUDIO TOO LONG*\n\nYour audio is ~${Math.round(estimatedDuration)} seconds.\nShazam works best with 10-30 second clips.\nTry with a shorter clip.`,
          edit: statusMsg.key
        });
        return;
      }
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `🎵 *MUSIC IDENTIFIER*\n` +
              `🔍 *Analyzing...* ✅\n` +
              `🎶 *Processing audio sample...*\n` +
              `🔬 *Identifying song...*`,
        edit: statusMsg.key
      });

      // ====== PREPARE AUDIO FOR API ======
      // Convert to base64 for API
      const base64Audio = mediaBuffer.toString('base64');
      
      // ====== CALL SHAZAM API (MULTIPLE METHODS) ======
      console.log(`🎵 Calling Shazam API...`);
      
      let songData = null;
      
      // Method 1: Direct base64 to Keith API
      try {
        const apiUrl = 'https://apiskeith.vercel.app/ai/shazam';
        
        const response = await axios({
          method: 'POST',
          url: apiUrl,
          data: {
            audio: base64Audio
          },
          timeout: 25000,
          headers: {
            'User-Agent': 'WolfBot-Shazam/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'WolfBot'
          }
        });
        
        console.log(`📊 API Response:`, JSON.stringify(response.data).substring(0, 200));
        
        if (response.data) {
          songData = this.parseShazamResponse(response.data);
        }
      } catch (apiError) {
        console.log('Method 1 failed:', apiError.message);
      }
      
      // Method 2: Alternative Shazam API if first fails
      if (!songData) {
        try {
          console.log('Trying alternative method...');
          
          // Use alternative Shazam-like service
          const alternativeResponse = await axios.post('https://api.audd.io/', {
            api_token: 'test', // This would need a real token
            audio: base64Audio,
            return: 'spotify'
          }, {
            timeout: 20000
          });
          
          if (alternativeResponse.data?.status === 'success') {
            songData = this.parseAuddResponse(alternativeResponse.data);
          }
        } catch (altError) {
          console.log('Alternative method failed:', altError.message);
        }
      }
      
      // ====== CHECK IF SONG WAS IDENTIFIED ======
      if (!songData) {
        throw new Error('Could not identify the song. Try with clearer audio.');
      }
      
      if (!songData.title || songData.title === 'Unknown') {
        throw new Error('Song not recognized. Try different audio clip.');
      }
      
      // ====== FORMAT AND SEND RESULT ======
      const resultText = this.formatResultText(songData);
      
      await sock.sendMessage(jid, {
        text: resultText,
        edit: statusMsg.key
      });

      console.log(`✅ Song identified: ${songData.title} - ${songData.artist}`);

    } catch (error) {
      console.error('❌ [Shazam] ERROR:', error);
      
      let errorMessage = `❌ *SONG IDENTIFICATION FAILED*\n\n`;
      
      // User-friendly error messages
      if (error.message.includes('too short')) {
        errorMessage += `• Audio is too short\n`;
        errorMessage += `• Use 10-30 second audio clip\n`;
      } else if (error.message.includes('not recognized') || 
                 error.message.includes('Could not identify')) {
        errorMessage += `• Song not recognized\n`;
        errorMessage += `• Try:\n`;
        errorMessage += `   - Clearer audio\n`;
        errorMessage += `   - Different part of song\n`;
        errorMessage += `   - Less background noise\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• Request timed out\n`;
        errorMessage += `• Audio may be too long\n`;
        errorMessage += `• Try shorter clip (10-20 seconds)\n`;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage += `• Shazam service unavailable\n`;
        errorMessage += `• Try again later\n`;
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n🔧 *Tips for better results:*\n`;
      errorMessage += `1. Use 10-30 second clip\n`;
      errorMessage += `2. Clear audio with minimal noise\n`;
      errorMessage += `3. Popular songs work better\n`;
      errorMessage += `4. Try chorus or recognizable part\n`;
      errorMessage += `5. Wait 30 seconds between tries\n`;
      
      // Try to send error message
      try {
        await sock.sendMessage(jid, {
          text: errorMessage
        }, { quoted: m });
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
  },
  
  // ====== HELPER METHODS ======
  
  // Get media type from message
  getMediaType(message) {
    if (message.audioMessage) return 'audio';
    if (message.videoMessage) return 'video';
    if (message.documentMessage?.mimetype?.includes('audio')) return 'audio';
    if (message.documentMessage?.mimetype?.includes('video')) return 'video';
    return 'unknown';
  },
  
  // Download media to buffer
  async downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    const chunks = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  },
  
  // Parse Shazam API response
  parseShazamResponse(data) {
    console.log('Parsing Shazam response:', JSON.stringify(data).substring(0, 300));
    
    // Try different response formats
    let songInfo = {
      title: 'Unknown',
      artist: 'Unknown',
      album: null,
      year: null,
      genre: null,
      duration: null,
      confidence: 'Unknown'
    };
    
    // Format 1: Keith API format (from your example)
    if (data.status === true && data.result) {
      const result = data.result;
      songInfo.title = result.title || 'Unknown';
      songInfo.artist = result.artists?.join(', ') || result.artist || 'Unknown';
      songInfo.album = result.album;
      songInfo.year = result.release_date;
      songInfo.genre = result.genre?.join(', ') || result.genre;
      songInfo.duration = result.duration;
      songInfo.confidence = result.confidence ? `${result.confidence}%` : 'High';
    }
    // Format 2: Direct result object
    else if (data.title) {
      songInfo.title = data.title;
      songInfo.artist = data.artist || data.artists?.join(', ') || 'Unknown';
      songInfo.album = data.album;
      songInfo.year = data.year || data.release_date;
      songInfo.genre = data.genre;
      songInfo.duration = data.duration;
    }
    // Format 3: Track object
    else if (data.track) {
      const track = data.track;
      songInfo.title = track.title || track.song?.title || 'Unknown';
      songInfo.artist = track.subtitle || track.artists?.join(', ') || 'Unknown';
      songInfo.album = track.album?.name;
      songInfo.year = track.release_date;
      songInfo.genre = track.genres?.primary;
      songInfo.duration = track.duration;
    }
    // Format 4: matches array
    else if (data.matches && data.matches[0]) {
      const match = data.matches[0];
      songInfo.title = match.track?.title || 'Unknown';
      songInfo.artist = match.track?.subtitle || 'Unknown';
      songInfo.album = match.track?.sections?.[0]?.metadata?.find(m => m.title === 'Album')?.text;
      songInfo.year = match.track?.sections?.[0]?.metadata?.find(m => m.title === 'Released')?.text;
    }
    
    return songInfo;
  },
  
  // Parse alternative API response
  parseAuddResponse(data) {
    if (data.result) {
      const result = data.result;
      return {
        title: result.title || 'Unknown',
        artist: result.artist || 'Unknown',
        album: result.album,
        year: result.release_date,
        genre: result.genre,
        duration: result.timecode,
        confidence: data.score ? `${Math.round(data.score * 100)}%` : 'Unknown'
      };
    }
    return null;
  },
  
  // Format result text
  formatResultText(songInfo) {
    let text = `🎵 *SONG IDENTIFIED!*\n\n`;
    text += `🎶 *Title:* ${songInfo.title}\n`;
    text += `🎤 *Artist:* ${songInfo.artist}\n`;
    
    if (songInfo.album && songInfo.album !== 'Unknown') {
      text += `💿 *Album:* ${songInfo.album}\n`;
    }
    
    if (songInfo.year) {
      text += `📅 *Year:* ${songInfo.year}\n`;
    }
    
    if (songInfo.genre) {
      text += `🎷 *Genre:* ${songInfo.genre}\n`;
    }
    
    if (songInfo.duration) {
      const duration = typeof songInfo.duration === 'number' 
        ? formatDuration(songInfo.duration)
        : songInfo.duration;
      text += `⏱️ *Duration:* ${duration}\n`;
    }
    
    text += `🎯 *Confidence:* ${songInfo.confidence}\n`;
    text += `\n⚡ *Powered by WolfBot*\n`;
    text += `🎧 *Music Identification Service*`;
    
    return text;
  }
};

// ====== HELPER FUNCTIONS ======

// Format bytes to human readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format duration in seconds to MM:SS
function formatDuration(seconds) {
  if (!seconds || typeof seconds !== 'number') return 'Unknown';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}