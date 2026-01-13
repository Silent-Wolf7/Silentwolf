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
//   name: "ytplay",
//   description: "Download YouTube audio - uses same API as song command",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *YouTube Audio Player*\n\nUsage:\n• \`ytplay song name\`\n• \`ytplay https://youtube.com/...\`\n• \`ytplay artist - song title\`\n`
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [YTPLAY] Request: ${searchQuery}`);

//       // Send status message
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"` 
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
//             text: `🔍 *Searching*: "${searchQuery}"\n📡 Looking for best match...`,
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
          
//           console.log(`🎵 [YTPLAY] Found: ${videoTitle} - ${videoUrl}`);
          
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching*: "${searchQuery}" ✅\n🎵 *Found:* ${videoTitle}\n⬇️ *Downloading audio...*`,
//             edit: statusMsg.key 
//           });
          
//         } catch (searchError) {
//           console.error("❌ [YTPLAY] Search error:", searchError);
//           await sock.sendMessage(jid, { 
//             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytplay https://youtube.com/watch?v=...`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       // Download using savetube (same API as song command)
//       let result;
//       try {
//         console.log(`🎵 [YTPLAY] Downloading via savetube: ${videoUrl}`);
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [YTPLAY] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ Download service failed\nTry again in a few minutes.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         console.error("❌ [YTPLAY] Invalid result:", result);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Update status
//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio...*`,
//         edit: statusMsg.key 
//       });

//       // Download the audio file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_ytplay.mp3`);
//       const finalTitle = videoTitle || result.result.title;
      
//       try {
//         // Download the audio
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 60000, // 60 second timeout
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
//             text: `❌ File too large: ${fileSizeMB}MB\nMax size: 16MB\nTry a shorter video.`,
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
//           console.log("ℹ️ [YTPLAY] Could not fetch thumbnail");
//         }

//         // Send as audio message
//         await sock.sendMessage(jid, {
//           audio: audioBuffer,
//           mimetype: 'audio/mpeg',
//           ptt: false,
//           fileName: `${finalTitle.substring(0, 50)}.mp3`.replace(/[^\w\s.-]/gi, ''),
//           contextInfo: {
//             externalAdReply: {
//               title: finalTitle,
//               body: `🎵 YouTube Audio • ${fileSizeMB}MB`,
//               mediaType: 2,
//               thumbnail: thumbnailBuffer,
//               mediaUrl: videoUrl
//             }
//           }
//         }, { quoted: m });

//         // Clean up temp file
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [YTPLAY] Cleaned up: ${tempFile}`);
//         }

//         // Success message
//         await sock.sendMessage(jid, { 
//           text: `✅ *Audio Sent!*\n\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB\n⏱ ${result.result.duration || 'N/A'}`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [YTPLAY] Success: ${finalTitle} (${fileSizeMB}MB)`);

//       } catch (downloadError) {
//         console.error("❌ [YTPLAY] Download error:", downloadError);
        
//         let errorMsg = `❌ Failed to download audio`;
        
//         if (downloadError.message.includes('timeout')) {
//           errorMsg += '\n⏱ Download timed out. Try again.';
//         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
//           errorMsg += '\n🌐 Network error. Check your connection.';
//         } else if (downloadError.response && downloadError.response.status === 403) {
//           errorMsg += '\n🔒 Access denied. Video might be restricted.';
//         }
        
//         await sock.sendMessage(jid, { 
//           text: errorMsg,
//           edit: statusMsg.key 
//         });
        
//         // Clean up on error
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [YTPLAY] Cleaned up failed: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [YTPLAY] Fatal error:", error);
      
//       let errorText = '❌ An error occurred';
//       if (error.message.includes('savetube')) {
//         errorText += '\n🎵 The audio service is currently unavailable';
//         errorText += '\n💡 Try again in a few minutes';
//       } else {
//         errorText += `\n${error.message.substring(0, 100)}`;
//       }
      
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

// Working Audio APIs from play command
const audioAPIs = {
  keith: {
    getAudio: async (youtubeUrl) => {
      try {
        const apiUrl = "https://apiskeith.vercel.app/download/audio";
        
        console.log(`🎵 [KEITH] Requesting audio from: ${youtubeUrl}`);
        
        const response = await axios({
          method: 'GET',
          url: apiUrl,
          params: { url: youtubeUrl },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        if (!response.data || response.status !== 200) {
          throw new Error('Invalid response from Keith API');
        }

        let audioUrl = null;
        
        if (response.data.result && typeof response.data.result === 'string') {
          audioUrl = response.data.result;
        } else if (response.data.downloadUrl) {
          audioUrl = response.data.downloadUrl;
        } else if (response.data.url) {
          audioUrl = response.data.url;
        }
        
        if (!audioUrl) {
          throw new Error('No audio URL found in Keith API response');
        }

        console.log(`🎵 [KEITH] Audio URL obtained`);
        
        return {
          success: true,
          audioUrl: audioUrl,
          source: "keith"
        };
        
      } catch (error) {
        console.error(`🎵 [KEITH] Error:`, error.message);
        return { success: false, error: error.message };
      }
    }
  },
  
  yupra: {
    getAudio: async (youtubeUrl) => {
      try {
        const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
        
        console.log(`🎵 [YUPRA] Requesting audio from: ${youtubeUrl}`);
        
        const response = await axios({
          method: 'GET',
          url: apiUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        if (!response.data || response.status !== 200) {
          throw new Error('Invalid response from Yupra API');
        }

        if (response.data?.success && response.data?.data?.download_url) {
          console.log(`🎵 [YUPRA] Audio URL obtained`);
          return {
            success: true,
            audioUrl: response.data.data.download_url,
            source: "yupra"
          };
        }
        
        throw new Error('No audio URL found in Yupra API response');
        
      } catch (error) {
        console.error(`🎵 [YUPRA] Error:`, error.message);
        return { success: false, error: error.message };
      }
    }
  },
  
  okatsu: {
    getAudio: async (youtubeUrl) => {
      try {
        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
        
        console.log(`🎵 [OKATSU] Requesting audio from: ${youtubeUrl}`);
        
        const response = await axios({
          method: 'GET',
          url: apiUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        if (!response.data || response.status !== 200) {
          throw new Error('Invalid response from Okatsu API');
        }

        if (response.data?.result?.mp3) {
          console.log(`🎵 [OKATSU] Audio URL obtained`);
          return {
            success: true,
            audioUrl: response.data.result.mp3,
            source: "okatsu"
          };
        }
        
        throw new Error('No audio URL found in Okatsu API response');
        
      } catch (error) {
        console.error(`🎵 [OKATSU] Error:`, error.message);
        return { success: false, error: error.message };
      }
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

export default {
  name: "ytplay",
  aliases: ["ytaudio", "ytmusic", "ytsong"],
  description: "Download YouTube audio with multiple working APIs",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      // Add reaction
      await sock.sendMessage(jid, {
        react: { text: '🎵', key: m.key }
      });

      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *YouTube Audio Player*\n\nUsage:\n• \`ytplay song name\`\n• \`ytplay https://youtube.com/...\`\n\nExample: ytplay Not Like Us\nExample: ytplay https://youtu.be/dQw4w9WgXcQ`
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`🎵 [YTPLAY] Request: "${searchQuery}"`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"\n⚡ Trying multiple APIs...` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      let videoTitle = '';
      let videoThumbnail = '';
      let videoId = '';
      let videoDuration = '';
      let videoAuthor = '';
      
      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        videoUrl = searchQuery;
        videoId = extractYouTubeId(videoUrl);
        
        if (!videoId) {
          await sock.sendMessage(jid, { 
            text: `❌ Invalid YouTube URL\nPlease provide a valid YouTube link.`,
            edit: statusMsg.key 
          });
          return;
        }
        
        // Try to get video info
        try {
          const { videos } = await yts({ videoId });
          if (videos && videos.length > 0) {
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
            videoDuration = videos[0].duration?.toString() || 'N/A';
            videoAuthor = videos[0].author?.name || 'Unknown Artist';
          } else {
            videoTitle = "YouTube Audio";
            videoThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            videoAuthor = 'Unknown Artist';
          }
        } catch (infoError) {
          videoTitle = "YouTube Audio";
          videoThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          videoAuthor = 'Unknown Artist';
        }
      } else {
        // Search YouTube for the video
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching*: "${searchQuery}"\n📡 Looking for best match...`,
          edit: statusMsg.key 
        });
        
        try {
          const { videos } = await yts(searchQuery);
          if (!videos || videos.length === 0) {
            await sock.sendMessage(jid, { 
              text: `❌ No songs found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
              edit: statusMsg.key 
            });
            return;
          }
          
          const video = videos[0];
          videoUrl = video.url;
          videoTitle = video.title;
          videoThumbnail = video.thumbnail;
          videoId = video.videoId;
          videoDuration = video.duration?.toString() || 'N/A';
          videoAuthor = video.author?.name || 'Unknown Artist';
          
          console.log(`🎵 [YTPLAY] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* "${videoTitle}"\n🎤 Artist: ${videoAuthor}\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTPLAY] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytplay https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Try multiple APIs sequentially
      let audioResult = null;
      let usedSavetube = false;
      
      // First try the new APIs (Keith, Yupra, Okatsu)
      const apisToTry = [
        () => audioAPIs.keith.getAudio(videoUrl),
        () => audioAPIs.yupra.getAudio(videoUrl),
        () => audioAPIs.okatsu.getAudio(videoUrl)
      ];
      
      for (let i = 0; i < apisToTry.length; i++) {
        const apiCall = apisToTry[i];
        const apiName = Object.keys(audioAPIs)[i];
        
        try {
          console.log(`🎵 [YTPLAY] Trying ${apiName} API...`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* "${videoTitle}"\n⬇️ *Getting download link...*\n⚡ Using ${apiName} API...`,
            edit: statusMsg.key 
          });
          
          const result = await apiCall();
          
          if (result.success) {
            audioResult = result;
            console.log(`✅ [YTPLAY] Got link from ${result.source}`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [YTPLAY] ${apiName} API failed:`, apiError.message);
          continue;
        }
      }

      // If new APIs fail, try savetube as fallback
      if (!audioResult) {
        await sock.sendMessage(jid, { 
          text: `✅ *Found:* "${videoTitle}"\n⚠️ *New APIs failed, trying savetube...*`,
          edit: statusMsg.key 
        });
        
        try {
          console.log(`🎵 [YTPLAY] Trying savetube as fallback...`);
          const savetubeResult = await savetube.download(videoUrl, 'mp3');
          
          if (savetubeResult?.status && savetubeResult?.result?.download) {
            audioResult = {
              success: true,
              audioUrl: savetubeResult.result.download,
              source: "savetube"
            };
            usedSavetube = true;
            videoDuration = savetubeResult.result.duration || videoDuration;
            console.log(`✅ [YTPLAY] Got link from savetube`);
          } else {
            throw new Error("Savetube returned no download link");
          }
        } catch (savetubeError) {
          console.error(`❌ [YTPLAY] Savetube also failed:`, savetubeError.message);
        }
      }

      if (!audioResult) {
        await sock.sendMessage(jid, { 
          text: `❌ All download services failed!\nPlease try again later.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* "${videoTitle}"\n✅ *Download link ready*\n⬇️ *Downloading MP3...*`,
        edit: statusMsg.key 
      });

      // Download the MP3 file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileName = `ytplay_${Date.now()}.mp3`;
      const tempFile = path.join(tempDir, fileName);
      
      try {
        console.log(`🎵 [YTPLAY] Downloading from: ${audioResult.audioUrl}`);
        
        // Download audio with stream
        const response = await axios({
          url: audioResult.audioUrl,
          method: 'GET',
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Referer': 'https://www.youtube.com/'
          },
          timeout: 60000, // 1 minute timeout
          maxRedirects: 5
        });

        if (response.status !== 200) {
          throw new Error(`Download failed with status: ${response.status}`);
        }

        // Stream to file with progress tracking
        const writer = fs.createWriteStream(tempFile);
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length']) || 0;
        
        response.data.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          // Log progress every 1MB
          if (totalBytes && downloadedBytes % (1024 * 1024) < chunk.length) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            console.log(`📥 [YTPLAY] Download: ${percent}% (${Math.round(downloadedBytes/1024/1024)}MB)`);
          }
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Check file
        const stats = fs.statSync(tempFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        if (stats.size === 0) {
          throw new Error("Downloaded audio is empty");
        }

        console.log(`🎵 [YTPLAY] Downloaded: ${fileSizeMB}MB`);

        // Read the audio file
        const audioBuffer = fs.readFileSync(tempFile);

        // Clean title for filename
        const cleanTitle = videoTitle
          .replace(/[^\w\s-]/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 40);

        const finalFileName = `${cleanTitle}.mp3`;

        // Update status
        await sock.sendMessage(jid, { 
          text: `✅ *Found:* "${videoTitle}"\n✅ *Download complete*\n🎵 *Sending audio...*`,
          edit: statusMsg.key 
        });

        // Send as audio message (not document)
        await sock.sendMessage(jid, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: finalFileName,
          contextInfo: {
            externalAdReply: {
              title: videoTitle.substring(0, 70),
              body: `By ${videoAuthor} • ${videoDuration}`,
              mediaType: 2,
              thumbnailUrl: videoThumbnail,
              mediaUrl: videoUrl,
              sourceUrl: videoUrl,
              showAdAttribution: false
            }
          }
        }, { quoted: m });

        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTPLAY] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *Audio Sent!*\n\n🎵 ${videoTitle}\n🎤 ${videoAuthor}\n📊 ${fileSizeMB}MB • ⏱ ${videoDuration}\n⚡ Source: ${audioResult.source}`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTPLAY] Success: ${videoTitle} (${fileSizeMB}MB, ${audioResult.source})`);

      } catch (downloadError) {
        console.error("❌ [YTPLAY] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download audio`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Try again.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response?.status === 403) {
          errorMsg += '\n🔒 Access denied. Audio might be restricted.';
        } else if (downloadError.message.includes('file is empty')) {
          errorMsg += '\n📦 Downloaded file is empty. Try again.';
        }
        
        errorMsg += `\n\n💡 Try:\n• Different song\n• Direct YouTube link\n• Shorter audio`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTPLAY] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTPLAY] Fatal error:", error);
      
      await sock.sendMessage(jid, { 
        text: `❌ An error occurred\n💡 Try:\n1. Direct YouTube link\n2. Different song\n3. Try again later\n\nError: ${error.message.substring(0, 100)}`
      }, { quoted: m });
    }
  }
};







