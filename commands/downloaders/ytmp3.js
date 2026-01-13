// import axios from "axios";
// import crypto from "crypto";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Reuse your exact savetube code (it's working!)
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
//          const decrypted = await savetube.crypto.decrypt(result.data.data);
//          var dl;
//          try {
//             dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
//                id: id,
//                downloadType: format === 'mp3' ? 'audio' : 'video',
//                quality: format === 'mp3' ? '128' : format,
//                key: decrypted.key
//             });
//          } catch (error) {
//             throw new Error('Failed to get download link. Please try again later.');
//          }  
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
//   name: "ytmp3",
//   description: "Download YouTube audio as MP3 - alias for ytplay",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *YouTube MP3 Downloader*\n\nUsage:\n• \`ytmp3 song name\`\n• \`ytmp3 https://youtube.com/...\`\n• \`ytmp3 artist - song title\`\n`
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [YTMP3] Request: ${searchQuery}`);

//       // Send status message
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching for MP3:* "${searchQuery}"` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       let videoTitle = '';
      
//       // Check if it's a URL
//       const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
//       if (isUrl) {
//         videoUrl = searchQuery;
        
//         // Try to extract title from URL
//         const videoId = savetube.youtube(videoUrl);
//         if (videoId) {
//           try {
//             // Quick title fetch using oembed
//             const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
//               timeout: 5000
//             });
//             videoTitle = oembed.data.title;
//           } catch (e) {
//             videoTitle = "YouTube Audio";
//           }
//         }
//       } else {
//         // Search YouTube for the video
//         try {
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching for MP3:* "${searchQuery}"\n📡 Looking for best match...`,
//             edit: statusMsg.key 
//           });
          
//           const { videos } = await yts(searchQuery);
//           if (!videos || videos.length === 0) {
//             await sock.sendMessage(jid, { 
//               text: `❌ No songs found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
//               edit: statusMsg.key 
//             });
//             return;
//           }
          
//           videoUrl = videos[0].url;
//           videoTitle = videos[0].title;
          
//           console.log(`🎵 [YTMP3] Found: ${videoTitle} - ${videoUrl}`);
          
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching for MP3:* "${searchQuery}" ✅\n🎵 *Found:* ${videoTitle}\n⬇️ *Downloading MP3...*`,
//             edit: statusMsg.key 
//           });
          
//         } catch (searchError) {
//           console.error("❌ [YTMP3] Search error:", searchError);
//           await sock.sendMessage(jid, { 
//             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytmp3 https://youtube.com/watch?v=...`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       // Download using savetube
//       let result;
//       try {
//         console.log(`🎵 [YTMP3] Downloading via savetube: ${videoUrl}`);
//         await sock.sendMessage(jid, { 
//           text: `🔄 *Connecting to MP3 service...*`,
//           edit: statusMsg.key 
//         });
        
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [YTMP3] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ MP3 download service failed\nTry again in a few minutes.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         console.error("❌ [YTMP3] Invalid result:", result);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get MP3 download link\nService might be temporarily unavailable.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Update status
//       await sock.sendMessage(jid, { 
//         text: `⬇️ *Downloading MP3 file...*\n🎵 ${videoTitle || result.result.title}`,
//         edit: statusMsg.key 
//       });

//       // Download the MP3 file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_ytmp3.mp3`);
//       const finalTitle = videoTitle || result.result.title;
      
//       try {
//         // Download the MP3
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 60000,
//           headers: {
//             'User-Agent': 'Mozilla/5.0',
//             'Referer': 'https://yt.savetube.me/'
//           }
//         });

//         if (response.status !== 200) {
//           throw new Error(`Download failed with status: ${response.status}`);
//         }

//         // Stream to file
//         const writer = fs.createWriteStream(tempFile);
//         response.data.pipe(writer);
        
//         await new Promise((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//         });

//         // Read file into buffer
//         const audioBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1);

//         // Check file size (WhatsApp limit ~16MB)
//         if (parseFloat(fileSizeMB) > 16) {
//           await sock.sendMessage(jid, { 
//             text: `❌ MP3 too large: ${fileSizeMB}MB\nMax size: 16MB\nTry a shorter audio or different song.`,
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
//           console.log("ℹ️ [YTMP3] Could not fetch thumbnail");
//         }

//         // Update status before sending
//         await sock.sendMessage(jid, { 
//           text: `📤 *Sending MP3 file...*\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB`,
//           edit: statusMsg.key 
//         });

//         // Send as MP3 audio message
//         await sock.sendMessage(jid, {
//           audio: audioBuffer,
//           mimetype: 'audio/mpeg',
//           ptt: false,
//           fileName: `${finalTitle.substring(0, 50)}.mp3`.replace(/[^\w\s.-]/gi, ''),
//           contextInfo: {
//             externalAdReply: {
//               title: finalTitle,
//               body: `🎵 YouTube MP3 • ${fileSizeMB}MB`,
//               mediaType: 2,
//               thumbnail: thumbnailBuffer,
//               mediaUrl: videoUrl
//             }
//           }
//         }, { quoted: m });

//         // Clean up temp file
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [YTMP3] Cleaned up: ${tempFile}`);
//         }

//         // Success message
//         await sock.sendMessage(jid, { 
//           text: `✅ *MP3 Sent Successfully!*\n\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB\n⏱ ${result.result.duration || 'N/A'}\n\n💡 Use \`!ytv\` for video version`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [YTMP3] Success: ${finalTitle} (${fileSizeMB}MB)`);

//       } catch (downloadError) {
//         console.error("❌ [YTMP3] Download error:", downloadError);
        
//         let errorMsg = `❌ Failed to download MP3`;
        
//         if (downloadError.message.includes('timeout')) {
//           errorMsg += '\n⏱ Download timed out. Try again.';
//         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
//           errorMsg += '\n🌐 Network error. Check your connection.';
//         } else if (downloadError.response && downloadError.response.status === 403) {
//           errorMsg += '\n🔒 Access denied. Video might be restricted.';
//         }
        
//         errorMsg += `\n\n💡 *Alternative:*\n• Use \`!song\` command\n• Try different video\n• Manual: y2mate.com`;
        
//         await sock.sendMessage(jid, { 
//           text: errorMsg,
//           edit: statusMsg.key 
//         });
        
//         // Clean up on error
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [YTMP3] Cleaned up failed: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [YTMP3] Fatal error:", error);
      
//       let errorText = '❌ An error occurred while processing MP3 request';
//       if (error.message.includes('savetube')) {
//         errorText += '\n🎵 The MP3 service is currently unavailable';
//         errorText += '\n💡 Try again in a few minutes';
//       } else if (error.message.includes('timeout')) {
//         errorText += '\n⏱ Request timed out. Try shorter audio.';
//       } else {
//         errorText += `\n${error.message.substring(0, 100)}`;
//       }
      
//       errorText += `\n\n📌 *For immediate download:*\n`;
//       errorText += `• Use \`!song\` command (alternative)\n`;
//       errorText += `• y2mate.com\n• ytmp3.cc`;
      
//       await sock.sendMessage(jid, { 
//         text: errorText
//       }, { quoted: m });
//     }
//   },
// };







































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
         const decrypted = await savetube.crypto.decrypt(result.data.data);
         var dl;
         try {
            dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
               id: id,
               downloadType: format === 'mp3' ? 'audio' : 'video',
               quality: format === 'mp3' ? '128' : format,
               key: decrypted.key
            });
         } catch (error) {
            throw new Error('Failed to get download link. Please try again later.');
         }  
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

// Additional MP3 APIs as fallback
const mp3APIs = {
  // Keith API for MP3
  keith: {
    getMP3: async (youtubeUrl) => {
      try {
        const apiUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(youtubeUrl)}`;
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
            title: res.data.title || "YouTube Audio",
            quality: "128kbps",
            source: "keith",
            type: "mp3"
          };
        }
        throw new Error('Keith API: No MP3 link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  // Yupra API for MP3
  yupra: {
    getMP3: async (youtubeUrl) => {
      try {
        const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
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
            title: res.data.data.title || "YouTube Audio",
            quality: res.data.data.quality || "128kbps",
            source: "yupra",
            type: "mp3"
          };
        }
        throw new Error('Yupra API: No MP3 link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  // YouTube to MP3 API (another fallback)
  ytmp3: {
    getMP3: async (youtubeUrl) => {
      try {
        const apiUrl = `https://api.ytbvideoly.com/api/videoInfo?url=${encodeURIComponent(youtubeUrl)}`;
        const res = await axios.get(apiUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (res.data?.video?.audio && res.data.video.audio.length > 0) {
          // Get the best audio quality available
          const audioSources = res.data.video.audio.sort((a, b) => {
            const aQuality = parseInt(a.quality) || 0;
            const bQuality = parseInt(b.quality) || 0;
            return bQuality - aQuality; // Descending (highest first)
          });
          
          return {
            success: true,
            download: audioSources[0].url,
            title: res.data.video.title || "YouTube Audio",
            quality: audioSources[0].quality + "kbps",
            source: "ytmp3api",
            type: "mp3"
          };
        }
        throw new Error('YTMP3 API: No audio link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};

// Helper function to extract YouTube ID
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

export default {
  name: "ytmp3",
  aliases: ["mp3", "audio", "song"],
  description: "Download YouTube audio as MP3 with multiple fallback APIs",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *YouTube MP3 Downloader*\n\nUsage:\n• \`ytmp3 song name\`\n• \`ytmp3 https://youtube.com/...\`\n• \`ytmp3 artist - song title\`\n`
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`🎵 [YTMP3] Request: ${searchQuery}`);

      // Send status message
      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching for MP3:* "${searchQuery}"` 
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
        
        videoTitle = "YouTube Audio";
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
          console.log("⚠️ [YTMP3] Could not fetch video info:", infoError.message);
        }
      } else {
        // Search YouTube for the video
        try {
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching for MP3:* "${searchQuery}"\n📡 Looking for best match...`,
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
          videoDuration = videos[0].duration?.seconds || 0;
          videoThumbnail = videos[0].thumbnail;
          videoId = extractYouTubeId(videoUrl);
          
          console.log(`🎵 [YTMP3] Found: ${videoTitle} (${videoDuration}s) - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting MP3 download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTMP3] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytmp3 https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Try multiple APIs sequentially
      let mp3Result = null;
      let apiSource = "";
      const apisToTry = [
        // Primary: Savetube (your original)
        async () => {
          console.log(`🎵 [YTMP3] Trying Savetube API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting MP3 link...*\n⚡ Using Savetube API...`,
            edit: statusMsg.key 
          });
          
          try {
            const result = await savetube.download(videoUrl, 'mp3');
            if (result?.status && result?.result?.download) {
              return {
                success: true,
                download: result.result.download,
                title: result.result.title || videoTitle,
                quality: "128kbps",
                source: "savetube",
                type: "mp3",
                thumbnail: result.result.thumbnail || videoThumbnail
              };
            }
            return { success: false, error: "Savetube failed" };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
        
        // Fallback 1: Keith API
        async () => {
          console.log(`🎵 [YTMP3] Trying Keith API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting MP3 link...*\n⚡ Using Keith API...`,
            edit: statusMsg.key 
          });
          
          return await mp3APIs.keith.getMP3(videoUrl);
        },
        
        // Fallback 2: Yupra API
        async () => {
          console.log(`🎵 [YTMP3] Trying Yupra API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting MP3 link...*\n⚡ Using Yupra API...`,
            edit: statusMsg.key 
          });
          
          return await mp3APIs.yupra.getMP3(videoUrl);
        },
        
        // Fallback 3: YTMP3 API
        async () => {
          console.log(`🎵 [YTMP3] Trying YTMP3 API...`);
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting MP3 link...*\n⚡ Using YTMP3 API...`,
            edit: statusMsg.key 
          });
          
          return await mp3APIs.ytmp3.getMP3(videoUrl);
        }
      ];
      
      for (let i = 0; i < apisToTry.length; i++) {
        try {
          const result = await apisToTry[i]();
          
          if (result.success) {
            mp3Result = result;
            apiSource = result.source;
            console.log(`✅ [YTMP3] Got MP3 link from ${apiSource}: ${result.download.substring(0, 50)}...`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [YTMP3] API ${i+1} failed:`, apiError.message);
          continue;
        }
      }

      if (!mp3Result) {
        await sock.sendMessage(jid, { 
          text: `❌ All MP3 download services failed!\n💡 Try again later or use video link directly.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* ${videoTitle}\n✅ *MP3 link ready* (${mp3Result.quality})\n📥 *Downloading audio...*`,
        edit: statusMsg.key 
      });

      // Download the MP3 file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempFile = path.join(tempDir, `${Date.now()}_ytmp3.mp3`);
      const finalTitle = mp3Result.title || videoTitle;
      
      try {
        // Download the MP3
        const response = await axios({
          url: mp3Result.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.youtube.com/',
            'Accept': '*/*'
          }
        });

        if (response.status !== 200) {
          throw new Error(`Download failed with status: ${response.status}`);
        }

        // Stream to file
        const writer = fs.createWriteStream(tempFile);
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length']) || 0;
        
        response.data.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          // Log progress every 500KB
          if (totalBytes && downloadedBytes % (0.5 * 1024 * 1024) < chunk.length) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            console.log(`📥 [YTMP3] Download: ${percent}% (${Math.round(downloadedBytes/1024)}KB)`);
          }
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Read file into buffer
        const audioBuffer = fs.readFileSync(tempFile);
        const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);

        // Check file size (WhatsApp limit ~16MB)
        if (parseFloat(fileSizeMB) > 16) {
          await sock.sendMessage(jid, { 
            text: `❌ MP3 too large: ${fileSizeMB}MB\nMax size: 16MB\nTry a shorter audio or different song.`,
            edit: statusMsg.key 
          });
          
          // Clean up
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Get thumbnail if not provided by API
        let thumbnailBuffer = null;
        const thumbnailUrl = mp3Result.thumbnail || videoThumbnail;
        
        try {
          const thumbnailResponse = await axios.get(thumbnailUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          thumbnailBuffer = Buffer.from(thumbnailResponse.data);
        } catch (thumbError) {
          console.log("ℹ️ [YTMP3] Could not fetch thumbnail, using default");
          // Use a default music thumbnail
          thumbnailBuffer = null;
        }

        // Update status before sending
        await sock.sendMessage(jid, { 
          text: `📤 *Sending MP3 file...*\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB • ${mp3Result.quality}\n⚡ Source: ${apiSource}`,
          edit: statusMsg.key 
        });

        // Format duration
        const durationStr = videoDuration > 0 
          ? `${Math.floor(videoDuration / 60)}:${String(videoDuration % 60).padStart(2, '0')}`
          : 'N/A';

        // Send as MP3 audio message
        await sock.sendMessage(jid, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${finalTitle.substring(0, 50)}.mp3`.replace(/[^\w\s.-]/gi, ''),
          contextInfo: thumbnailBuffer ? {
            externalAdReply: {
              title: finalTitle.substring(0, 70),
              body: `🎵 MP3 • ${durationStr} • ${fileSizeMB}MB`,
              mediaType: 2,
              thumbnail: thumbnailBuffer,
              mediaUrl: videoUrl,
              sourceUrl: videoUrl
            }
          } : undefined
        }, { quoted: m });

        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTMP3] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *MP3 Sent Successfully!*\n\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB • ${mp3Result.quality}\n⏱ ${durationStr}\n⚡ Source: ${apiSource}\n\n💡 Use \`!ytv\` for video version`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTMP3] Success: ${finalTitle} (${fileSizeMB}MB, ${apiSource})`);

      } catch (downloadError) {
        console.error("❌ [YTMP3] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download MP3 from ${apiSource}`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Try again.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response && downloadError.response.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        }
        
        errorMsg += `\n\n💡 *Try:*\n• Use different video\n• Use \`!video\` for video download\n• Manual: y2mate.com`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTMP3] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTMP3] Fatal error:", error);
      
      let errorText = '❌ An error occurred while processing MP3 request';
      if (error.message.includes('savetube')) {
        errorText += '\n🎵 The MP3 service is currently unavailable';
        errorText += '\n💡 Try again in a few minutes';
      } else if (error.message.includes('timeout')) {
        errorText += '\n⏱ Request timed out. Try shorter audio.';
      } else {
        errorText += `\n${error.message.substring(0, 100)}`;
      }
      
      errorText += `\n\n📌 *Alternative methods:*\n`;
      errorText += `• Use \`!video\` command\n`;
      errorText += `• y2mate.com\n• ytmp3.cc`;
      
      await sock.sendMessage(jid, { 
        text: errorText
      }, { quoted: m });
    }
  },
};