import axios from "axios";
import crypto from "crypto";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reuse your exact savetube code (it's working!)
const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
   },
   formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g);
         return Buffer.from(matches.join(''), 'hex');
      },
      decrypt: async (enc) => {
         try {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
         } catch (error) {
            throw new Error(error)
         }
      }
   },
   youtube: url => {
      if (!url) return null;
      const a = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ];
      for (let b of a) {
         if (b.test(url)) return url.match(b)[1];
      }
      return null
   },
   request: async (endpoint, data = {}, method = 'post') => {
      try {
         const {
            data: response
         } = await axios({
            method,
            url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
            data: method === 'post' ? data : undefined,
            params: method === 'get' ? data : undefined,
            headers: savetube.headers
         })
         return {
            status: true,
            code: 200,
            data: response
         }
      } catch (error) {
         throw new Error(error)
      }
   },
   getCDN: async () => {
      const response = await savetube.request(savetube.api.cdn, {}, 'get');
      if (!response.status) throw new Error(response)
      return {
         status: true,
         code: 200,
         data: response.data.cdn
      }
   },
   download: async (link, format) => {
      if (!link) {
         return {
            status: false,
            code: 400,
            error: "No link provided. Please provide a valid YouTube link."
         }
      }
      if (!format || !savetube.formats.includes(format)) {
         return {
            status: false,
            code: 400,
            error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
            available_fmt: savetube.formats
         }
      }
      const id = savetube.youtube(link);
      if (!id) throw new Error('Invalid YouTube link.');
      try {
         const cdnx = await savetube.getCDN();
         if (!cdnx.status) return cdnx;
         const cdn = cdnx.data;
         const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
            url: `https://www.youtube.com/watch?v=${id}`
         });
         if (!result.status) return result;
         const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
         try {
            dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
               id: id,
               downloadType: format === 'mp3' ? 'audio' : 'video',
               quality: format === 'mp3' ? '128' : format,
               key: decrypted.key
            });
         } catch (error) {
            throw new Error('Failed to get download link. Please try again later.');
         };
         return {
            status: true,
            code: 200,
            result: {
               title: decrypted.title || "Unknown Title",
               type: format === 'mp3' ? 'audio' : 'video',
               format: format,
               thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
               download: dl.data.data.downloadUrl,
               id: id,
               key: decrypted.key,
               duration: decrypted.duration,
               quality: format === 'mp3' ? '128' : format,
               downloaded: dl.data.data.downloaded
            }
         }
      } catch (error) {
         throw new Error('An error occurred while processing your request. Please try again later.');
      }
   }
};

export default {
  name: "ytplaydoc",
  description: "Download YouTube audio as document file",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `📁 *YouTube Audio as Document*\n\nUsage:\n• \`ytplaydoc song name\`\n• \`ytplaydoc https://youtube.com/...\`\n• \`ytplaydoc artist - song title\`\n`
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`📁 [YTPLAYDOC] Request: ${searchQuery}`);

      // Send status message
      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching for document:* "${searchQuery}"` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      let videoTitle = '';
      
      // Check if it's a URL
      const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
      if (isUrl) {
        videoUrl = searchQuery;
        
        // Try to extract title from URL
        const videoId = savetube.youtube(videoUrl);
        if (videoId) {
          try {
            // Quick title fetch using oembed
            const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
              timeout: 5000
            });
            videoTitle = oembed.data.title;
          } catch (e) {
            videoTitle = "YouTube Audio";
          }
        }
      } else {
        // Search YouTube for the video
        try {
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching for document:* "${searchQuery}"\n📡 Looking for best match...`,
            edit: statusMsg.key 
          });
          
          const { videos } = await yts(searchQuery);
          if (!videos || videos.length === 0) {
            await sock.sendMessage(jid, { 
              text: `❌ No songs found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
              edit: statusMsg.key 
            });
            return;
          }
          
          videoUrl = videos[0].url;
          videoTitle = videos[0].title;
          
          console.log(`📁 [YTPLAYDOC] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching for document:* "${searchQuery}" ✅\n🎵 *Found:* ${videoTitle}\n⬇️ *Preparing document download...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTPLAYDOC] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytplaydoc https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Download using savetube
      let result;
      try {
        console.log(`📁 [YTPLAYDOC] Downloading via savetube: ${videoUrl}`);
        await sock.sendMessage(jid, { 
          text: `🔄 *Connecting to audio service...*`,
          edit: statusMsg.key 
        });
        
        result = await savetube.download(videoUrl, 'mp3');
      } catch (err) {
        console.error("❌ [YTPLAYDOC] Savetube error:", err);
        await sock.sendMessage(jid, { 
          text: `❌ Audio service failed\nTry again in a few minutes.`,
          edit: statusMsg.key 
        });
        return;
      }

      if (!result || !result.status || !result.result || !result.result.download) {
        console.error("❌ [YTPLAYDOC] Invalid result:", result);
        await sock.sendMessage(jid, { 
          text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `⬇️ *Downloading audio file for document...*\n🎵 ${videoTitle || result.result.title}`,
        edit: statusMsg.key 
      });

      // Download the audio file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempFile = path.join(tempDir, `${Date.now()}_ytplaydoc.mp3`);
      const finalTitle = videoTitle || result.result.title;
      
      try {
        // Download the audio
        const response = await axios({
          url: result.result.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 120000, // 2 minute timeout for larger files
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://yt.savetube.me/'
          }
        });

        if (response.status !== 200) {
          throw new Error(`Download failed with status: ${response.status}`);
        }

        // Stream to file
        const writer = fs.createWriteStream(tempFile);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Read file into buffer
        const audioBuffer = fs.readFileSync(tempFile);
        const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1);

        // Check file size (WhatsApp document limit ~100MB, but be reasonable)
        if (parseFloat(fileSizeMB) > 64) {
          await sock.sendMessage(jid, { 
            text: `❌ File too large: ${fileSizeMB}MB\nMax recommended: 64MB\nTry a shorter audio or different song.`,
            edit: statusMsg.key 
          });
          
          // Clean up
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Update status before sending
        await sock.sendMessage(jid, { 
          text: `📤 *Sending as document...*\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB`,
          edit: statusMsg.key 
        }       );

        // Clean filename for document
        const cleanFileName = `${finalTitle.substring(0, 100)}.mp3`
          .replace(/[^\w\s.-]/gi, '')  // Remove special characters
          .replace(/\s+/g, '_')        // Replace spaces with underscores
          .replace(/_{2,}/g, '_');     // Replace multiple underscores with single

        // Send as DOCUMENT (not audio message)
        await sock.sendMessage(jid, {
          document: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: cleanFileName,
          caption: `🎵 ${finalTitle}\n📦 ${fileSizeMB}MB • ⏱ ${result.result.duration || 'N/A'}\n📁 Sent as document file`,
          quoted: m
        });

        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTPLAYDOC] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *Document Sent Successfully!*\n\n📁 *File:* ${cleanFileName}\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB\n⏱ ${result.result.duration || 'N/A'}\n\n💡 *Save as file using menu options*`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTPLAYDOC] Success: ${finalTitle} (${fileSizeMB}MB as document)`);

        } catch (downloadError) {
        console.error("❌ [YTPLAYDOC] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download audio for document`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. File might be too large.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response && downloadError.response.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        }
        
        errorMsg += `\n\n💡 *Try these instead:*\n• Use \`!ytplay\` for audio message\n• Try different video\n• Manual: y2mate.com`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTPLAYDOC] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTPLAYDOC] Fatal error:", error);
      
      let errorText = '❌ An error occurred while processing document request';
      if (error.message.includes('savetube')) {
        errorText += '\n🎵 The audio service is currently unavailable';
        errorText += '\n💡 Try again in a few minutes';
      } else if (error.message.includes('timeout')) {
        errorText += '\n⏱ Request timed out. Try shorter audio.';
      } else {
        errorText += `\n${error.message.substring(0, 100)}`;
      }
      
      errorText += `\n\n📌 *Alternative commands:*\n`;
      errorText += `• \`!ytplay\` - Audio message\n`;
      errorText += `• \`!song\` - Audio message\n`;
      errorText += `• \`!ytmp3\` - Audio message`;
      
      await sock.sendMessage(jid, { 
        text: errorText
      }, { quoted: m });
    }
  },
};