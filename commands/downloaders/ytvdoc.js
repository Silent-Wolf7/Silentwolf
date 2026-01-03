import axios from "axios";
import crypto from "crypto";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reuse your exact savetube code
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

// Okatsu API for video download
const okatsuAPI = {
  getVideo: async (youtubeUrl) => {
    try {
      const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
      const res = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      
      if (res?.data?.result?.mp4) {
        return {
          success: true,
          download: res.data.result.mp4,
          title: res.data.result.title || "YouTube Video",
          quality: "720p",
          source: "okatsu"
        };
      }
      throw new Error('Okatsu API: No mp4 link');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default {
  name: "ytvdoc",
  aliases: ["video-doc", "ytvd", "docvideo"],
  description: "Download YouTube videos and send as document (bypasses size limit)",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `📁 *YouTube Video as Document*\n\nUsage:\n• \`ytvdoc song name\`\n• \`ytvdoc https://youtube.com/...\`\n• \`ytvdoc 720 song name\` (specify quality)\n`
        }, { quoted: m });
        return;
      }

      // Parse arguments for quality specification
      let quality = '360'; // Default quality
      let searchQuery = args.join(" ");
      
      // Check if first argument is a quality specification
      const qualityPattern = /^(144|240|360|480|720|1080)$/;
      if (qualityPattern.test(args[0])) {
        quality = args[0];
        searchQuery = args.slice(1).join(" ");
        
        if (!searchQuery) {
          await sock.sendMessage(jid, { 
            text: `❌ Please provide video name or URL after quality\nExample: ytvdoc 720 funny cats`
          }, { quoted: m });
          return;
        }
      }

      console.log(`📁 [YTV-DOC] Request: ${searchQuery} (Quality: ${quality}p)`);

      // Send status message
      const statusMsg = await sock.sendMessage(jid, { 
        text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p` 
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
            const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
              timeout: 5000
            });
            videoTitle = oembed.data.title;
          } catch (e) {
            videoTitle = "YouTube Video";
          }
        }
      } else {
        // Search YouTube for the video
        try {
          await sock.sendMessage(jid, { 
            text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
            edit: statusMsg.key 
          });
          
          const { videos } = await yts(searchQuery);
          if (!videos || videos.length === 0) {
            await sock.sendMessage(jid, { 
              text: `❌ No videos found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
              edit: statusMsg.key 
            });
            return;
          }
          
          videoUrl = videos[0].url;
          videoTitle = videos[0].title;
          
          console.log(`📁 [YTV-DOC] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⬇️ *Downloading video...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTV-DOC] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytvdoc https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Download using savetube first, then fallback to Okatsu
      let result = null;
      let downloadSource = "savetube";
      let actualQuality = quality;
      
      try {
        console.log(`📁 [YTV-DOC] Trying savetube: ${videoUrl} (${quality}p)`);
        result = await savetube.download(videoUrl, quality);
        
        if (!result || !result.status) {
          throw new Error("Savetube failed");
        }
        
      } catch (err) {
        console.log(`⚠️ [YTV-DOC] Savetube failed: ${err.message}`);
        
        // Try lower qualities first
        const qualities = ['360', '240', '144'];
        let foundAlternative = false;
        
        for (const lowerQuality of qualities) {
          if (parseInt(lowerQuality) < parseInt(quality)) {
            try {
              console.log(`📁 [YTV-DOC] Trying lower quality: ${lowerQuality}p`);
              result = await savetube.download(videoUrl, lowerQuality);
              if (result && result.status) {
                actualQuality = lowerQuality;
                foundAlternative = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
        
        // If savetube completely fails, try Okatsu API
        if (!foundAlternative) {
          await sock.sendMessage(jid, { 
            text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⚠️ *Primary service failed, trying backup...*`,
            edit: statusMsg.key 
          });
          
          console.log(`📁 [YTV-DOC] Trying Okatsu API as backup`);
          const okatsuResult = await okatsuAPI.getVideo(videoUrl);
          
          if (okatsuResult.success) {
            result = {
              status: true,
              result: {
                title: okatsuResult.title,
                download: okatsuResult.download,
                quality: okatsuResult.quality,
                duration: "N/A"
              }
            };
            downloadSource = "okatsu";
            actualQuality = okatsuResult.quality;
            console.log(`✅ [YTV-DOC] Got video from Okatsu API`);
          } else {
            console.error("❌ [YTV-DOC] All services failed");
            await sock.sendMessage(jid, { 
              text: `❌ All download services failed\nPlease try again in a few minutes.`,
              edit: statusMsg.key 
            });
            return;
          }
        }
      }

      if (!result || !result.status || !result.result || !result.result.download) {
        console.error("❌ [YTV-DOC] Invalid result:", result);
        await sock.sendMessage(jid, { 
          text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}" ✅\n⬇️ *Downloading video...* ✅\n📦 *Preparing document...* (${actualQuality}p)`,
        edit: statusMsg.key 
      });

      // Download the video file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const sanitizedTitle = videoTitle.replace(/[^\w\s.-]/gi, '').substring(0, 50);
      const fileName = `${sanitizedTitle}_${actualQuality}p.mp4`;
      const tempFile = path.join(tempDir, `${Date.now()}_${fileName}`);
      
      try {
        // Download the video
        const response = await axios({
          url: result.result.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 180000, // 3 minute timeout for larger videos
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
        const videoBuffer = fs.readFileSync(tempFile);
        const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(1);

        // Check file size (Document limit is higher, but still reasonable)
        if (parseFloat(fileSizeMB) > 100) {
          await sock.sendMessage(jid, { 
            text: `❌ Video too large: ${fileSizeMB}MB\nMax recommended size: 100MB\nTry lower quality (144p, 240p) or shorter video.`,
            edit: statusMsg.key 
          });
          
          // Clean up
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Send as document
        await sock.sendMessage(jid, {
          document: videoBuffer,
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `📁 *${videoTitle}*\n📊 Quality: ${actualQuality}p\n📦 Size: ${fileSizeMB}MB\n⚡ Source: ${downloadSource}\n🔗 ${videoUrl}`
        }, { quoted: m });

        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTV-DOC] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *Video Sent as Document!*\n\n📁 ${videoTitle}\n📊 ${actualQuality}p • ${fileSizeMB}MB\n⚡ Source: ${downloadSource}\n⏱ ${result.result.duration || 'N/A'}\n\n*Note:* Open the document to play the video.`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTV-DOC] Success: ${videoTitle} (${actualQuality}p, ${fileSizeMB}MB, ${downloadSource})`);

      } catch (downloadError) {
        console.error("❌ [YTV-DOC] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download video`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Video might be too large.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response && downloadError.response.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        }
        
        errorMsg += `\n\n💡 Try:\n• Lower quality (144p, 240p)\n• Shorter video`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTV-DOC] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTV-DOC] Fatal error:", error);
      
      let errorText = '❌ An error occurred';
      if (error.message.includes('savetube')) {
        errorText += '\n📁 The video service is currently unavailable';
        errorText += '\n💡 Try again in a few minutes';
      } else {
        errorText += `\n${error.message.substring(0, 100)}`;
      }
      
      await sock.sendMessage(jid, { 
        text: errorText
      }, { quoted: m });
    }
  },
};