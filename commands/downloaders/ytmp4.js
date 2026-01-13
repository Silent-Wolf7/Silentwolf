// import axios from "axios";
// import crypto from "crypto";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Reuse your exact savetube code
// const savetube = {
//    api: {
//       base: "https://media.savetube.me/api",
//       cdn: "/random-cdn",
//       info: "/v2/info",
//       download: "/download"
//    },
//    headers: {
//       'accept': '*/*',
//       'content-type': 'application/json',
//       'origin': 'https://yt.savetube.me',
//       'referer': 'https://yt.savetube.me/',
//       'user-agent': 'Postify/1.0.0'
//    },
//    formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
//    crypto: {
//       hexToBuffer: (hexString) => {
//          const matches = hexString.match(/.{1,2}/g);
//          return Buffer.from(matches.join(''), 'hex');
//       },
//       decrypt: async (enc) => {
//          try {
//             const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
//             const data = Buffer.from(enc, 'base64');
//             const iv = data.slice(0, 16);
//             const content = data.slice(16);
//             const key = savetube.crypto.hexToBuffer(secretKey);
//             const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
//             let decrypted = decipher.update(content);
//             decrypted = Buffer.concat([decrypted, decipher.final()]);
//             return JSON.parse(decrypted.toString());
//          } catch (error) {
//             throw new Error(error)
//          }
//       }
//    },
//    youtube: url => {
//       if (!url) return null;
//       const a = [
//          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
//          /youtu\.be\/([a-zA-Z0-9_-]{11})/
//       ];
//       for (let b of a) {
//          if (b.test(url)) return url.match(b)[1];
//       }
//       return null
//    },
//    request: async (endpoint, data = {}, method = 'post') => {
//       try {
//          const {
//             data: response
//          } = await axios({
//             method,
//             url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
//             data: method === 'post' ? data : undefined,
//             params: method === 'get' ? data : undefined,
//             headers: savetube.headers
//          })
//          return {
//             status: true,
//             code: 200,
//             data: response
//          }
//       } catch (error) {
//          throw new Error(error)
//       }
//    },
//    getCDN: async () => {
//       const response = await savetube.request(savetube.api.cdn, {}, 'get');
//       if (!response.status) throw new Error(response)
//       return {
//          status: true,
//          code: 200,
//          data: response.data.cdn
//       }
//    },
//    download: async (link, format) => {
//       if (!link) {
//          return {
//             status: false,
//             code: 400,
//             error: "No link provided. Please provide a valid YouTube link."
//          }
//       }
//       if (!format || !savetube.formats.includes(format)) {
//          return {
//             status: false,
//             code: 400,
//             error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
//             available_fmt: savetube.formats
//          }
//       }
//       const id = savetube.youtube(link);
//       if (!id) throw new Error('Invalid YouTube link.');
//       try {
//          const cdnx = await savetube.getCDN();
//          if (!cdnx.status) return cdnx;
//          const cdn = cdnx.data;
//          const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
//             url: `https://www.youtube.com/watch?v=${id}`
//          });
//          if (!result.status) return result;
//          const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
//          try {
//             dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
//                id: id,
//                downloadType: format === 'mp3' ? 'audio' : 'video',
//                quality: format === 'mp3' ? '128' : format,
//                key: decrypted.key
//             });
//          } catch (error) {
//             throw new Error('Failed to get download link. Please try again later.');
//          };
//          return {
//             status: true,
//             code: 200,
//             result: {
//                title: decrypted.title || "Unknown Title",
//                type: format === 'mp3' ? 'audio' : 'video',
//                format: format,
//                thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
//                download: dl.data.data.downloadUrl,
//                id: id,
//                key: decrypted.key,
//                duration: decrypted.duration,
//                quality: format === 'mp3' ? '128' : format,
//                downloaded: dl.data.data.downloaded
//             }
//          }
//       } catch (error) {
//          throw new Error('An error occurred while processing your request. Please try again later.');
//       }
//    }
// };

// export default {
//   name: "ytmp4",
//   description: "Download YouTube videos as MP4",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎬 *YouTube MP4 Downloader*\n\n*Usage:*\n• \`ytmp4 video name\`\n• \`ytmp4 https://youtube.com/...\`\n• \`ytmp4 720 video name\` (specify quality)\n`
//         }, { quoted: m });
//         return;
//       }

//       // Parse arguments for quality specification
//       let quality = '360'; // Default quality
//       let searchQuery = args.join(" ");
      
//       // Check if first argument is a quality specification
//       const qualityPattern = /^(144|240|360|480|720|1080)$/;
//       if (qualityPattern.test(args[0])) {
//         quality = args[0];
//         searchQuery = args.slice(1).join(" ");
        
//         if (!searchQuery) {
//           await sock.sendMessage(jid, { 
//             text: `❌ Please provide video name or URL after quality\nExample: ytmp4 720 funny cats`
//           }, { quoted: m });
//           return;
//         }
//       }

//       console.log(`🎬 [YTMP4] Request: ${searchQuery} (Quality: ${quality}p)`);

//       // Send status message
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       let videoTitle = '';
//       let videoDuration = '';
      
//       // Check if it's a URL
//       const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
//       if (isUrl) {
//         videoUrl = searchQuery;
        
//         // Try to extract title and duration from URL
//         const videoId = savetube.youtube(videoUrl);
//         if (videoId) {
//           try {
//             const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
//               timeout: 5000
//             });
//             videoTitle = oembed.data.title;
            
//             // Try to get duration via invidious
//             try {
//               const invidious = await axios.get(`https://inv.nadeko.net/api/v1/videos/${videoId}`, {
//                 timeout: 5000
//               });
//               if (invidious.data && invidious.data.lengthSeconds) {
//                 videoDuration = formatDuration(invidious.data.lengthSeconds);
//               }
//             } catch (e) {
//               videoDuration = 'N/A';
//             }
//           } catch (e) {
//             videoTitle = "YouTube Video";
//             videoDuration = 'N/A';
//           }
//         }
//       } else {
//         // Search YouTube for the video
//         try {
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
//             edit: statusMsg.key 
//           });
          
//           const { videos } = await yts(searchQuery);
//           if (!videos || videos.length === 0) {
//             await sock.sendMessage(jid, { 
//               text: `❌ No videos found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
//               edit: statusMsg.key 
//             });
//             return;
//           }
          
//           videoUrl = videos[0].url;
//           videoTitle = videos[0].title;
//           videoDuration = videos[0].timestamp || 'N/A';
          
//           console.log(`🎬 [YTMP4] Found: ${videoTitle} - ${videoUrl}`);
          
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching:* "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n⏱ *Duration:* ${videoDuration}\n📊 *Quality:* ${quality}p\n⬇️ *Downloading MP4...*`,
//             edit: statusMsg.key 
//           });
          
//         } catch (searchError) {
//           console.error("❌ [YTMP4] Search error:", searchError);
//           await sock.sendMessage(jid, { 
//             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytmp4 https://youtube.com/watch?v=...`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       // Download using savetube
//       let result;
//       try {
//         console.log(`🎬 [YTMP4] Downloading via savetube: ${videoUrl} (${quality}p)`);
//         await sock.sendMessage(jid, { 
//           text: `⬇️ *Connecting to download service...*\n📊 *Quality:* ${quality}p`,
//           edit: statusMsg.key 
//         });
        
//         result = await savetube.download(videoUrl, quality);
//       } catch (err) {
//         console.error("❌ [YTMP4] Savetube error:", err);
        
//         // Check if requested quality is available, try lower quality
//         if (quality !== '144') {
//           await sock.sendMessage(jid, { 
//             text: `❌ ${quality}p not available\n🔄 Trying lower quality...`,
//             edit: statusMsg.key 
//           });
          
//           // Try lower qualities
//           const qualities = ['360', '240', '144'];
//           for (const lowerQuality of qualities) {
//             if (parseInt(lowerQuality) < parseInt(quality)) {
//               try {
//                 console.log(`🎬 [YTMP4] Trying lower quality: ${lowerQuality}p`);
//                 result = await savetube.download(videoUrl, lowerQuality);
//                 if (result && result.status) {
//                   quality = lowerQuality;
//                   break;
//                 }
//               } catch (e) {
//                 continue;
//               }
//             }
//           }
//         }
        
//         if (!result || !result.status) {
//           await sock.sendMessage(jid, { 
//             text: `❌ Download service failed\nTry again in a few minutes.`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         console.error("❌ [YTMP4] Invalid result:", result);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Update status
//       await sock.sendMessage(jid, { 
//         text: `⬇️ *Downloading MP4 file...*\n🎬 ${videoTitle}\n📊 ${quality}p • Please wait...`,
//         edit: statusMsg.key 
//       });

//       // Download the video file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_ytmp4_${quality}.mp4`);
//       const finalTitle = videoTitle || result.result.title;
//       const finalDuration = videoDuration || result.result.duration || 'N/A';
      
//       try {
//         // Download the video
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 120000, // 2 minute timeout for videos
//           headers: {
//             'User-Agent': 'Mozilla/5.0',
//             'Referer': 'https://yt.savetube.me/',
//             'Accept': '*/*',
//             'Accept-Language': 'en-US,en;q=0.9'
//           }
//         });

//         if (response.status !== 200) {
//           throw new Error(`Download failed with status: ${response.status}`);
//         }

//         // Get content length for progress
//         const contentLength = response.headers['content-length'];
//         const totalSize = contentLength ? parseInt(contentLength) : 0;
        
//         // Stream to file with progress updates
//         const writer = fs.createWriteStream(tempFile);
//         let downloaded = 0;
        
//         response.data.on('data', (chunk) => {
//           downloaded += chunk.length;
          
//           // Update progress every 1MB
//           if (downloaded % (1024 * 1024) < chunk.length) {
//             const percent = totalSize > 0 ? Math.round((downloaded / totalSize) * 100) : 0;
//             const downloadedMB = (downloaded / (1024 * 1024)).toFixed(1);
            
//             if (percent % 25 === 0) { // Update at 25%, 50%, 75%, 100%
//               sock.sendMessage(jid, { 
//                 text: `⬇️ *Downloading...* ${percent}%\n📦 ${downloadedMB}MB / ${totalSize > 0 ? (totalSize / (1024 * 1024)).toFixed(1) + 'MB' : '??MB'}`,
//                 edit: statusMsg.key 
//               }).catch(e => console.log('Progress update failed:', e.message));
//             }
//           }
//         });
        
//         response.data.pipe(writer);
        
//         await new Promise((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//           response.data.on('error', reject);
//         });

//         // Read file into buffer
//         const videoBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(1);

//         // Check file size (WhatsApp video limit ~16MB)
//         if (parseFloat(fileSizeMB) > 16) {
//           await sock.sendMessage(jid, { 
//             text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\n\n💡 Try:\n• Lower quality (144p, 240p)\n• Shorter video (<30 seconds)\n• Download link: ${result.result.download}`,
//             edit: statusMsg.key 
//           });
          
//           // Clean up
//           if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//           return;
//         }

//         // Get thumbnail
//         let thumbnailBuffer = null;
//         try {
//           const thumbnailResponse = await axios.get(result.result.thumbnail, {
//             responseType: 'arraybuffer',
//             timeout: 10000
//           });
//           thumbnailBuffer = Buffer.from(thumbnailResponse.data);
//         } catch (thumbError) {
//           console.log("ℹ️ [YTMP4] Could not fetch thumbnail");
//         }

//         // Update status before sending
//         await sock.sendMessage(jid, { 
//           text: `📤 *Sending MP4 file...*\n🎬 ${finalTitle}\n📊 ${quality}p • ${fileSizeMB}MB`,
//           edit: statusMsg.key 
//         });

//         // Send as video message
//         await sock.sendMessage(jid, {
//           video: videoBuffer,
//           mimetype: 'video/mp4',
//           caption: `🎬 ${finalTitle}\n📊 ${quality}p • ${fileSizeMB}MB • ⏱ ${finalDuration}`,
//           fileName: `${finalTitle.substring(0, 50)}_${quality}p.mp4`.replace(/[^\w\s.-]/gi, ''),
//           thumbnail: thumbnailBuffer,
//           gifPlayback: false
//         }, { quoted: m });

//         // Clean up temp file
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [YTMP4] Cleaned up: ${tempFile}`);
//         }

//         // Success message
//         await sock.sendMessage(jid, { 
//           text: `✅ *MP4 Sent Successfully!*\n\n🎬 ${finalTitle}\n📊 ${quality}p • ${fileSizeMB}MB\n⏱ ${finalDuration}\n\n💡 Use !ytplay for audio version`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [YTMP4] Success: ${finalTitle} (${quality}p, ${fileSizeMB}MB)`);

//       } catch (downloadError) {
//         console.error("❌ [YTMP4] Download error:", downloadError);
        
//         let errorMsg = `❌ Failed to download MP4`;
        
//         if (downloadError.message.includes('timeout')) {
//           errorMsg += '\n⏱ Download timed out. Video might be too large.';
//         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
//           errorMsg += '\n🌐 Network error. Check your connection.';
//         } else if (downloadError.response && downloadError.response.status === 403) {
//           errorMsg += '\n🔒 Access denied. Video might be restricted.';
//         } else if (downloadError.message.includes('socket hang up')) {
//           errorMsg += '\n🔌 Connection interrupted. Try again.';
//         }
        
//         errorMsg += `\n\n💡 *Try these solutions:*\n`;
//         errorMsg += `• Lower quality (144p, 240p)\n`;
//         errorMsg += `• Shorter video (<1 minute)\n`;
//         errorMsg += `• Try audio instead (!ytplay)\n`;
        
//         if (result?.result?.download) {
//           errorMsg += `\n🔗 *Direct download link:*\n${result.result.download}`;
//         }
        
//         await sock.sendMessage(jid, { 
//           text: errorMsg,
//           edit: statusMsg.key 
//         });
        
//         // Clean up on error
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [YTMP4] Cleaned up failed: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [YTMP4] Fatal error:", error);
      
//       let errorText = '❌ An error occurred while processing your request';
//       if (error.message.includes('savetube')) {
//         errorText += '\n🎬 The MP4 download service is currently unavailable';
//         errorText += '\n💡 Try again in a few minutes';
//       } else if (error.message.includes('timeout')) {
//         errorText += '\n⏱ Request timed out. Video might be too large.';
//       } else {
//         errorText += `\n${error.message.substring(0, 100)}`;
//       }
      
//       errorText += `\n\n📌 *For immediate download:*\n`;
//       errorText += `• y2mate.com\n• savetik.co\n• ytmp3.cc`;
      
//       await sock.sendMessage(jid, { 
//         text: errorText
//       }, { quoted: m });
//     }
//   },
// };

// // Format duration from seconds to HH:MM:SS or MM:SS
// function formatDuration(seconds) {
//   if (!seconds || isNaN(seconds)) return 'N/A';
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   }
//   return `${minutes}:${secs.toString().padStart(2, '0')}`;
// }

















import axios from "axios";
import crypto from "crypto";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Savetube API (your working code)
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

// Keith API for videos
const keithAPI = {
  getVideo: async (youtubeUrl, quality = "360") => {
    try {
      const apiUrl = `https://apiskeith.vercel.app/download/video?url=${encodeURIComponent(youtubeUrl)}`;
      const res = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      
      if (res?.data?.result) {
        return {
          success: true,
          download: res.data.result,
          title: res.data.title || "YouTube Video",
          quality: "HD", // Keith API doesn't specify exact quality
          source: "keith",
          type: "mp4"
        };
      }
      throw new Error('Keith API: No download link');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Yupra API for videos
const yupraAPI = {
  getVideo: async (youtubeUrl, quality = "360") => {
    try {
      const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
      const res = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      
      if (res?.data?.success && res?.data?.data?.download_url) {
        return {
          success: true,
          download: res.data.data.download_url,
          title: res.data.data.title || "YouTube Video",
          quality: res.data.data.quality || "HD",
          source: "yupra",
          type: "mp4"
        };
      }
      throw new Error('Yupra API: No download link');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Helper to extract YouTube ID
const extractYouTubeId = (url) => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(url)) {
      return url.match(pattern)[1];
    }
  }
  return null;
};

// Main command
export default {
  name: "ytmp4",
  aliases: ["video", "ytv", "vid"],
  description: "Download YouTube videos as MP4 with multiple fallback APIs",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎬 *YouTube Video Downloader*\n\n*Usage:*\n• \`ytmp4 video name\`\n• \`ytmp4 https://youtube.com/...\`\n• \`ytmp4 720 video name\` (specify quality)\n\n*Supported Qualities:* 144p, 240p, 360p, 480p, 720p\n`
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
            text: `❌ Please provide video name or URL after quality\nExample: ytmp4 720 funny cats`
          }, { quoted: m });
          return;
        }
      }

      console.log(`🎬 [YTMP4] Request: ${searchQuery} (Quality: ${quality}p)`);

      // Send status message
      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      let videoTitle = '';
      let videoThumbnail = '';
      let videoId = '';
      let videoDuration = 0;
      
      // Check if it's a URL
      const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
      if (isUrl) {
        videoUrl = searchQuery;
        videoId = extractYouTubeId(videoUrl);
        
        if (!videoId) {
          await sock.sendMessage(jid, { 
            text: `❌ Invalid YouTube URL!\nPlease provide a valid YouTube link.`,
            edit: statusMsg.key 
          });
          return;
        }
        
        videoTitle = "YouTube Video";
        videoThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        
        // Try to get video info
        try {
          const { videos } = await yts({ videoId });
          if (videos && videos.length > 0) {
            videoTitle = videos[0].title;
            videoDuration = videos[0].duration?.seconds || 0;
            videoThumbnail = videos[0].thumbnail || videoThumbnail;
          }
        } catch (infoError) {
          console.log("⚠️ [YTMP4] Could not fetch video info:", infoError.message);
        }
      } else {
        // Search YouTube for the video
        try {
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
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
          videoDuration = videos[0].duration?.seconds || 0;
          videoThumbnail = videos[0].thumbnail;
          videoId = extractYouTubeId(videoUrl);
          
          console.log(`🎬 [YTMP4] Found: ${videoTitle} (${videoDuration}s) - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTMP4] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytmp4 https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Format duration for display
      const videoDurationStr = formatDuration(videoDuration);

      // Try multiple APIs sequentially
      let videoResult = null;
      let apiSource = "";
      const apisToTry = [
        // Primary: Savetube (your original) - with specific quality
        async () => {
          console.log(`🎬 [YTMP4] Trying Savetube API (${quality}p)...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*\n⚡ Using Savetube API (${quality}p)...`,
            edit: statusMsg.key 
          });
          
          try {
            const result = await savetube.download(videoUrl, quality);
            if (result?.status && result?.result?.download) {
              return {
                success: true,
                download: result.result.download,
                title: result.result.title || videoTitle,
                quality: `${quality}p`,
                source: "savetube",
                type: "mp4",
                thumbnail: result.result.thumbnail || videoThumbnail,
                duration: result.result.duration || videoDuration
              };
            }
            return { success: false, error: "Savetube failed" };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
        
        // Fallback 1: Keith API (auto quality)
        async () => {
          console.log(`🎬 [YTMP4] Trying Keith API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*\n⚡ Using Keith API...`,
            edit: statusMsg.key 
          });
          
          return await keithAPI.getVideo(videoUrl, quality);
        },
        
        // Fallback 2: Yupra API (auto quality)
        async () => {
          console.log(`🎬 [YTMP4] Trying Yupra API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*\n⚡ Using Yupra API...`,
            edit: statusMsg.key 
          });
          
          return await yupraAPI.getVideo(videoUrl, quality);
        }
      ];
      
      // Try APIs in sequence
      for (let i = 0; i < apisToTry.length; i++) {
        try {
          const result = await apisToTry[i]();
          
          if (result.success) {
            videoResult = result;
            apiSource = result.source;
            console.log(`✅ [YTMP4] Got video link from ${apiSource}: ${result.download.substring(0, 50)}...`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [YTMP4] API ${i+1} failed:`, apiError.message);
          
          // If Savetube fails with requested quality, try lower qualities
          if (i === 0 && quality !== '144') {
            await sock.sendMessage(jid, { 
              text: `❌ ${quality}p not available on Savetube\n🔄 Trying lower qualities...`,
              edit: statusMsg.key 
            });
            
            // Try lower qualities with Savetube
            const qualities = ['360', '240', '144'];
            for (const lowerQuality of qualities) {
              if (parseInt(lowerQuality) < parseInt(quality)) {
                try {
                  console.log(`🎬 [YTMP4] Trying lower quality: ${lowerQuality}p`);
                  const lowerResult = await savetube.download(videoUrl, lowerQuality);
                  if (lowerResult && lowerResult.status) {
                    videoResult = {
                      success: true,
                      download: lowerResult.result.download,
                      title: lowerResult.result.title || videoTitle,
                      quality: `${lowerQuality}p`,
                      source: "savetube",
                      type: "mp4",
                      thumbnail: lowerResult.result.thumbnail || videoThumbnail,
                      duration: lowerResult.result.duration || videoDuration
                    };
                    apiSource = "savetube";
                    quality = lowerQuality;
                    console.log(`✅ [YTMP4] Got ${lowerQuality}p from Savetube`);
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
            }
            
            if (videoResult) break; // Found a working quality
          }
          
          continue; // Try next API
        }
      }

      if (!videoResult) {
        await sock.sendMessage(jid, { 
          text: `❌ All video download services failed!\n💡 Try:\n• Different video\n• Lower quality\n• Direct download link\n• Try !ytmp3 for audio only`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* ${videoTitle}\n✅ *Video link ready* (${videoResult.quality})\n📥 *Downloading video...*`,
        edit: statusMsg.key 
      });

      // Download the video file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempFile = path.join(tempDir, `${Date.now()}_ytmp4_${quality}.mp4`);
      const finalTitle = videoResult.title || videoTitle;
      const finalDuration = formatDuration(videoResult.duration || videoDuration);
      
      try {
        // Download the video
        const response = await axios({
          url: videoResult.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 180000, // 3 minute timeout for videos
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.youtube.com/',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });

        if (response.status !== 200) {
          throw new Error(`Download failed with status: ${response.status}`);
        }

        // Get content length for progress
        const contentLength = response.headers['content-length'];
        const totalSize = contentLength ? parseInt(contentLength) : 0;
        
        // Stream to file with progress updates
        const writer = fs.createWriteStream(tempFile);
        let downloaded = 0;
        
        response.data.on('data', (chunk) => {
          downloaded += chunk.length;
          
          // Update progress every 2MB
          if (downloaded % (2 * 1024 * 1024) < chunk.length) {
            const percent = totalSize > 0 ? Math.round((downloaded / totalSize) * 100) : 0;
            const downloadedMB = (downloaded / (1024 * 1024)).toFixed(1);
            
            if (percent % 25 === 0 && percent > 0) { // Update at 25%, 50%, 75%, 100%
              console.log(`📥 [YTMP4] Download: ${percent}% (${downloadedMB}MB)`);
            }
          }
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
          response.data.on('error', reject);
        });

        // Check file size
        const stats = fs.statSync(tempFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (stats.size === 0) {
          throw new Error("Download failed or empty file!");
        }

        // WhatsApp video limit is ~16MB
        if (parseFloat(fileSizeMB) > 16) {
          await sock.sendMessage(jid, { 
            text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\n\n💡 Try:\n• Lower quality (144p, 240p)\n• Shorter video (<30 seconds)\n• Use \`!ytmp3\` for audio only`,
            edit: statusMsg.key 
          });
          
          // Clean up
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Get thumbnail
        let thumbnailBuffer = null;
        const thumbnailUrl = videoResult.thumbnail || videoThumbnail;
        
        try {
          const thumbnailResponse = await axios.get(thumbnailUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          thumbnailBuffer = Buffer.from(thumbnailResponse.data);
        } catch (thumbError) {
          console.log("ℹ️ [YTMP4] Could not fetch thumbnail, using default");
        }

        // Update status before sending
        await sock.sendMessage(jid, { 
          text: `📤 *Sending MP4 file...*\n🎬 ${finalTitle}\n📊 ${videoResult.quality} • ${fileSizeMB}MB`,
          edit: statusMsg.key 
        });

        // Send as video message
        await sock.sendMessage(jid, {
          video: fs.readFileSync(tempFile),
          mimetype: 'video/mp4',
          caption: `🎬 ${finalTitle}\n📊 ${videoResult.quality} • ${fileSizeMB}MB • ⏱ ${finalDuration}\n⚡ Source: ${apiSource}`,
          fileName: `${finalTitle.substring(0, 50)}.mp4`.replace(/[^\w\s.-]/gi, ''),
          thumbnail: thumbnailBuffer,
          gifPlayback: false
        }, { quoted: m });

        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTMP4] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *MP4 Sent Successfully!*\n\n🎬 ${finalTitle}\n📊 ${videoResult.quality} • ${fileSizeMB}MB\n⏱ ${finalDuration}\n⚡ Source: ${apiSource}\n\n💡 Use \`!ytmp3\` for audio version`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTMP4] Success: ${finalTitle} (${videoResult.quality}, ${fileSizeMB}MB, ${apiSource})`);

      } catch (downloadError) {
        console.error("❌ [YTMP4] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download video from ${apiSource}`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Video might be too large.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response && downloadError.response.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        } else if (downloadError.message.includes('socket hang up')) {
          errorMsg += '\n🔌 Connection interrupted. Try again.';
        }
        
        errorMsg += `\n\n💡 *Try these solutions:*\n`;
        errorMsg += `• Use lower quality (144p, 240p)\n`;
        errorMsg += `• Choose shorter video\n`;
        errorMsg += `• Use \`!ytmp3\` for audio only\n`;
        errorMsg += `• Try different video`;
        
        if (videoResult?.download) {
          errorMsg += `\n\n🔗 *Direct link (copy to browser):*\n${videoResult.download.substring(0, 100)}...`;
        }
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTMP4] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTMP4] Fatal error:", error);
      
      let errorText = '❌ An error occurred while processing your request';
      if (error.message.includes('savetube')) {
        errorText += '\n🎬 The video download service is currently unavailable';
        errorText += '\n💡 Try again in a few minutes';
      } else if (error.message.includes('timeout')) {
        errorText += '\n⏱ Request timed out. Video might be too large.';
      } else {
        errorText += `\n${error.message.substring(0, 100)}`;
      }
      
      errorText += `\n\n📌 *Alternative methods:*\n`;
      errorText += `• Use \`!ytmp3\` for audio only\n`;
      errorText += `• y2mate.com\n• savetik.co`;
      
      await sock.sendMessage(jid, { 
        text: errorText
      }, { quoted: m });
    }
  },
};

// Format duration from seconds to HH:MM:SS or MM:SS
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}