// // import axios from "axios";
// // import crypto from "crypto";
// // import yts from "yt-search";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Reuse your exact savetube code
// // const savetube = {
// //    api: {
// //       base: "https://media.savetube.me/api",
// //       cdn: "/random-cdn",
// //       info: "/v2/info",
// //       download: "/download"
// //    },
// //    headers: {
// //       'accept': '*/*',
// //       'content-type': 'application/json',
// //       'origin': 'https://yt.savetube.me',
// //       'referer': 'https://yt.savetube.me/',
// //       'user-agent': 'Postify/1.0.0'
// //    },
// //    formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
// //    crypto: {
// //       hexToBuffer: (hexString) => {
// //          const matches = hexString.match(/.{1,2}/g);
// //          return Buffer.from(matches.join(''), 'hex');
// //       },
// //       decrypt: async (enc) => {
// //          try {
// //             const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
// //             const data = Buffer.from(enc, 'base64');
// //             const iv = data.slice(0, 16);
// //             const content = data.slice(16);
// //             const key = savetube.crypto.hexToBuffer(secretKey);
// //             const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
// //             let decrypted = decipher.update(content);
// //             decrypted = Buffer.concat([decrypted, decipher.final()]);
// //             return JSON.parse(decrypted.toString());
// //          } catch (error) {
// //             throw new Error(error)
// //          }
// //       }
// //    },
// //    youtube: url => {
// //       if (!url) return null;
// //       const a = [
// //          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
// //          /youtu\.be\/([a-zA-Z0-9_-]{11})/
// //       ];
// //       for (let b of a) {
// //          if (b.test(url)) return url.match(b)[1];
// //       }
// //       return null
// //    },
// //    request: async (endpoint, data = {}, method = 'post') => {
// //       try {
// //          const {
// //             data: response
// //          } = await axios({
// //             method,
// //             url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
// //             data: method === 'post' ? data : undefined,
// //             params: method === 'get' ? data : undefined,
// //             headers: savetube.headers
// //          })
// //          return {
// //             status: true,
// //             code: 200,
// //             data: response
// //          }
// //       } catch (error) {
// //          throw new Error(error)
// //       }
// //    },
// //    getCDN: async () => {
// //       const response = await savetube.request(savetube.api.cdn, {}, 'get');
// //       if (!response.status) throw new Error(response)
// //       return {
// //          status: true,
// //          code: 200,
// //          data: response.data.cdn
// //       }
// //    },
// //    download: async (link, format) => {
// //       if (!link) {
// //          return {
// //             status: false,
// //             code: 400,
// //             error: "No link provided. Please provide a valid YouTube link."
// //          }
// //       }
// //       if (!format || !savetube.formats.includes(format)) {
// //          return {
// //             status: false,
// //             code: 400,
// //             error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
// //             available_fmt: savetube.formats
// //          }
// //       }
// //       const id = savetube.youtube(link);
// //       if (!id) throw new Error('Invalid YouTube link.');
// //       try {
// //          const cdnx = await savetube.getCDN();
// //          if (!cdnx.status) return cdnx;
// //          const cdn = cdnx.data;
// //          const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
// //             url: `https://www.youtube.com/watch?v=${id}`
// //          });
// //          if (!result.status) return result;
// //          const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
// //          try {
// //             dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
// //                id: id,
// //                downloadType: format === 'mp3' ? 'audio' : 'video',
// //                quality: format === 'mp3' ? '128' : format,
// //                key: decrypted.key
// //             });
// //          } catch (error) {
// //             throw new Error('Failed to get download link. Please try again later.');
// //          };
// //          return {
// //             status: true,
// //             code: 200,
// //             result: {
// //                title: decrypted.title || "Unknown Title",
// //                type: format === 'mp3' ? 'audio' : 'video',
// //                format: format,
// //                thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
// //                download: dl.data.data.downloadUrl,
// //                id: id,
// //                key: decrypted.key,
// //                duration: decrypted.duration,
// //                quality: format === 'mp3' ? '128' : format,
// //                downloaded: dl.data.data.downloaded
// //             }
// //          }
// //       } catch (error) {
// //          throw new Error('An error occurred while processing your request. Please try again later.');
// //       }
// //    }
// // };

// // export default {
// //   name: "ytv",
// //   description: "Download YouTube videos with quality selection",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (args.length === 0) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎬 *YouTube Video Downloader*\n\nUsage:\n• \`ytv song name\`\n• \`ytv https://youtube.com/...\`\n• \`ytv 360 song name\` (specify quality)\n\n*Available Qualities:*\n144p, 240p, 360p, 480p, 720p, 1080p\n\n*Examples:*\n• ytv shape of you\n• ytv https://youtu.be/...\n• ytv 720 funny cats`
// //         }, { quoted: m });
// //         return;
// //       }

// //       // Parse arguments for quality specification
// //       let quality = '360'; // Default quality
// //       let searchQuery = args.join(" ");
      
// //       // Check if first argument is a quality specification
// //       const qualityPattern = /^(144|240|360|480|720|1080)$/;
// //       if (qualityPattern.test(args[0])) {
// //         quality = args[0];
// //         searchQuery = args.slice(1).join(" ");
        
// //         if (!searchQuery) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ Please provide video name or URL after quality\nExample: ytv 720 funny cats`
// //           }, { quoted: m });
// //           return;
// //         }
// //       }

// //       console.log(`🎬 [YTV] Request: ${searchQuery} (Quality: ${quality}p)`);

// //       // Send status message
// //       const statusMsg = await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p` 
// //       }, { quoted: m });

// //       // Determine if input is YouTube link or search query
// //       let videoUrl = '';
// //       let videoTitle = '';
      
// //       // Check if it's a URL
// //       const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
// //       if (isUrl) {
// //         videoUrl = searchQuery;
        
// //         // Try to extract title from URL
// //         const videoId = savetube.youtube(videoUrl);
// //         if (videoId) {
// //           try {
// //             const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
// //               timeout: 5000
// //             });
// //             videoTitle = oembed.data.title;
// //           } catch (e) {
// //             videoTitle = "YouTube Video";
// //           }
// //         }
// //       } else {
// //         // Search YouTube for the video
// //         try {
// //           await sock.sendMessage(jid, { 
// //             text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
// //             edit: statusMsg.key 
// //           });
          
// //           const { videos } = await yts(searchQuery);
// //           if (!videos || videos.length === 0) {
// //             await sock.sendMessage(jid, { 
// //               text: `❌ No videos found for "${searchQuery}"\nTry different keywords or use direct YouTube link.`,
// //               edit: statusMsg.key 
// //             });
// //             return;
// //           }
          
// //           videoUrl = videos[0].url;
// //           videoTitle = videos[0].title;
          
// //           console.log(`🎬 [YTV] Found: ${videoTitle} - ${videoUrl}`);
          
// //           await sock.sendMessage(jid, { 
// //             text: `🔍 *Searching*: "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⬇️ *Downloading video...*`,
// //             edit: statusMsg.key 
// //           });
          
// //         } catch (searchError) {
// //           console.error("❌ [YTV] Search error:", searchError);
// //           await sock.sendMessage(jid, { 
// //             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytv https://youtube.com/watch?v=...`,
// //             edit: statusMsg.key 
// //           });
// //           return;
// //         }
// //       }

// //       // Download using savetube
// //       let result;
// //       try {
// //         console.log(`🎬 [YTV] Downloading via savetube: ${videoUrl} (${quality}p)`);
// //         result = await savetube.download(videoUrl, quality);
// //       } catch (err) {
// //         console.error("❌ [YTV] Savetube error:", err);
        
// //         // Check if requested quality is available, try lower quality
// //         if (quality !== '144') {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ ${quality}p not available\n🔄 Trying lower quality...`,
// //             edit: statusMsg.key 
// //           });
          
// //           // Try lower qualities
// //           const qualities = ['360', '240', '144'];
// //           for (const lowerQuality of qualities) {
// //             if (parseInt(lowerQuality) < parseInt(quality)) {
// //               try {
// //                 console.log(`🎬 [YTV] Trying lower quality: ${lowerQuality}p`);
// //                 result = await savetube.download(videoUrl, lowerQuality);
// //                 if (result && result.status) {
// //                   quality = lowerQuality;
// //                   break;
// //                 }
// //               } catch (e) {
// //                 continue;
// //               }
// //             }
// //           }
// //         }
        
// //         if (!result || !result.status) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ Download service failed\nTry again in a few minutes.`,
// //             edit: statusMsg.key 
// //           });
// //           return;
// //         }
// //       }

// //       if (!result || !result.status || !result.result || !result.result.download) {
// //         console.error("❌ [YTV] Invalid result:", result);
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
// //           edit: statusMsg.key 
// //         });
// //         return;
// //       }

// //       // Update status
// //       await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading video...* ✅\n🎬 *Sending video...* (${quality}p)`,
// //         edit: statusMsg.key 
// //       });

// //       // Download the video file
// //       const tempDir = path.join(__dirname, "../temp");
// //       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
// //       const tempFile = path.join(tempDir, `${Date.now()}_ytv_${quality}.mp4`);
// //       const finalTitle = videoTitle || result.result.title;
      
// //       try {
// //         // Download the video
// //         const response = await axios({
// //           url: result.result.download,
// //           method: 'GET',
// //           responseType: 'stream',
// //           timeout: 120000, // 2 minute timeout for videos
// //           headers: {
// //             'User-Agent': 'Mozilla/5.0',
// //             'Referer': 'https://yt.savetube.me/'
// //           }
// //         });

// //         if (response.status !== 200) {
// //           throw new Error(`Download failed with status: ${response.status}`);
// //         }

// //         // Stream to file
// //         const writer = fs.createWriteStream(tempFile);
// //         response.data.pipe(writer);
        
// //         await new Promise((resolve, reject) => {
// //           writer.on('finish', resolve);
// //           writer.on('error', reject);
// //         });

// //         // Read file into buffer
// //         const videoBuffer = fs.readFileSync(tempFile);
// //         const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(1);

// //         // Check file size (WhatsApp video limit ~16MB)
// //         if (parseFloat(fileSizeMB) > 16) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\nTry:\n• Lower quality (144p, 240p)\n• Shorter video\n• Download link: ${result.result.download}`,
// //             edit: statusMsg.key 
// //           });
          
// //           // Clean up
// //           if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
// //           return;
// //         }

// //         // Get thumbnail
// //         let thumbnailBuffer = null;
// //         try {
// //           const thumbnailResponse = await axios.get(result.result.thumbnail, {
// //             responseType: 'arraybuffer',
// //             timeout: 10000
// //           });
// //           thumbnailBuffer = Buffer.from(thumbnailResponse.data);
// //         } catch (thumbError) {
// //           console.log("ℹ️ [YTV] Could not fetch thumbnail");
// //         }

// //         // Send as video message
// //         await sock.sendMessage(jid, {
// //           video: videoBuffer,
// //           mimetype: 'video/mp4',
// //           caption: `🎬 ${finalTitle}\n📊 ${quality}p • ${fileSizeMB}MB`,
// //           thumbnail: thumbnailBuffer,
// //           gifPlayback: false
// //         }, { quoted: m });

// //         // Clean up temp file
// //         if (fs.existsSync(tempFile)) {
// //           fs.unlinkSync(tempFile);
// //           console.log(`✅ [YTV] Cleaned up: ${tempFile}`);
// //         }

// //         // Success message
// //         await sock.sendMessage(jid, { 
// //           text: `✅ *Video Sent!*\n\n🎬 ${finalTitle}\n📊 ${quality}p • ${fileSizeMB}MB\n⏱ ${result.result.duration || 'N/A'}`,
// //           edit: statusMsg.key 
// //         });

// //         console.log(`✅ [YTV] Success: ${finalTitle} (${quality}p, ${fileSizeMB}MB)`);

// //       } catch (downloadError) {
// //         console.error("❌ [YTV] Download error:", downloadError);
        
// //         let errorMsg = `❌ Failed to download video`;
        
// //         if (downloadError.message.includes('timeout')) {
// //           errorMsg += '\n⏱ Download timed out. Video might be too large.';
// //         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
// //           errorMsg += '\n🌐 Network error. Check your connection.';
// //         } else if (downloadError.response && downloadError.response.status === 403) {
// //           errorMsg += '\n🔒 Access denied. Video might be restricted.';
// //         }
        
// //         errorMsg += `\n\n💡 Try:\n• Lower quality (144p, 240p)\n• Shorter video (<1 minute)\n• Direct link: ${result?.result?.download || 'N/A'}`;
        
// //         await sock.sendMessage(jid, { 
// //           text: errorMsg,
// //           edit: statusMsg.key 
// //         });
        
// //         // Clean up on error
// //         if (fs.existsSync(tempFile)) {
// //           fs.unlinkSync(tempFile);
// //           console.log(`🧹 [YTV] Cleaned up failed: ${tempFile}`);
// //         }
// //       }

// //     } catch (error) {
// //       console.error("❌ [YTV] Fatal error:", error);
      
// //       let errorText = '❌ An error occurred';
// //       if (error.message.includes('savetube')) {
// //         errorText += '\n🎬 The video service is currently unavailable';
// //         errorText += '\n💡 Try again in a few minutes';
// //       } else {
// //         errorText += `\n${error.message.substring(0, 100)}`;
// //       }
      
// //       await sock.sendMessage(jid, { 
// //         text: errorText
// //       }, { quoted: m });
// //     }
// //   },
// // };



















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

// // Okatsu API for video download
// const okatsuAPI = {
//   getVideo: async (youtubeUrl) => {
//     try {
//       const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
//       const res = await axios.get(apiUrl, {
//         timeout: 30000,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//           'Accept': 'application/json'
//         }
//       });
      
//       if (res?.data?.result?.mp4) {
//         return {
//           success: true,
//           download: res.data.result.mp4,
//           title: res.data.result.title || "YouTube Video",
//           quality: "720p",
//           source: "okatsu"
//         };
//       }
//       throw new Error('Okatsu API: No mp4 link');
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
// };

// export default {
//   name: "ytv",
//   description: "Download YouTube videos with quality selection",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎬 *YouTube Video Downloader*\n\nUsage:\n• \`ytv song name\`\n• \`ytv https://youtube.com/...\`\n• \`ytv 360 song name\` (specify quality)\n\n`
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
//             text: `❌ Please provide video name or URL after quality\nExample: ytv 720 funny cats`
//           }, { quoted: m });
//           return;
//         }
//       }

//       console.log(`🎬 [YTV] Request: ${searchQuery} (Quality: ${quality}p)`);

//       // Send status message
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p` 
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
//             const oembed = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
//               timeout: 5000
//             });
//             videoTitle = oembed.data.title;
//           } catch (e) {
//             videoTitle = "YouTube Video";
//           }
//         }
//       } else {
//         // Search YouTube for the video
//         try {
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
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
          
//           console.log(`🎬 [YTV] Found: ${videoTitle} - ${videoUrl}`);
          
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching*: "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⬇️ *Downloading video...*`,
//             edit: statusMsg.key 
//           });
          
//         } catch (searchError) {
//           console.error("❌ [YTV] Search error:", searchError);
//           await sock.sendMessage(jid, { 
//             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytv https://youtube.com/watch?v=...`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       // Download using savetube first, then fallback to Okatsu
//       let result = null;
//       let downloadSource = "savetube";
//       let actualQuality = quality;
      
//       try {
//         console.log(`🎬 [YTV] Trying savetube: ${videoUrl} (${quality}p)`);
//         result = await savetube.download(videoUrl, quality);
        
//         if (!result || !result.status) {
//           throw new Error("Savetube failed");
//         }
        
//       } catch (err) {
//         console.log(`⚠️ [YTV] Savetube failed: ${err.message}`);
        
//         // Try lower qualities first
//         const qualities = ['360', '240', '144'];
//         let foundAlternative = false;
        
//         for (const lowerQuality of qualities) {
//           if (parseInt(lowerQuality) < parseInt(quality)) {
//             try {
//               console.log(`🎬 [YTV] Trying lower quality: ${lowerQuality}p`);
//               result = await savetube.download(videoUrl, lowerQuality);
//               if (result && result.status) {
//                 actualQuality = lowerQuality;
//                 foundAlternative = true;
//                 break;
//               }
//             } catch (e) {
//               continue;
//             }
//           }
//         }
        
//         // If savetube completely fails, try Okatsu API
//         if (!foundAlternative) {
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching*: "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⚠️ *Primary service failed, trying backup...*`,
//             edit: statusMsg.key 
//           });
          
//           console.log(`🎬 [YTV] Trying Okatsu API as backup`);
//           const okatsuResult = await okatsuAPI.getVideo(videoUrl);
          
//           if (okatsuResult.success) {
//             result = {
//               status: true,
//               result: {
//                 title: okatsuResult.title,
//                 download: okatsuResult.download,
//                 quality: okatsuResult.quality,
//                 duration: "N/A"
//               }
//             };
//             downloadSource = "okatsu";
//             actualQuality = okatsuResult.quality;
//             console.log(`✅ [YTV] Got video from Okatsu API`);
//           } else {
//             console.error("❌ [YTV] All services failed");
//             await sock.sendMessage(jid, { 
//               text: `❌ All download services failed\nPlease try again in a few minutes.`,
//               edit: statusMsg.key 
//             });
//             return;
//           }
//         }
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         console.error("❌ [YTV] Invalid result:", result);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Update status
//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading video...* ✅\n🎬 *Sending video...* (${actualQuality}p)`,
//         edit: statusMsg.key 
//       });

//       // Download the video file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_ytv_${actualQuality}.mp4`);
//       const finalTitle = videoTitle || result.result.title;
      
//       try {
//         // Download the video
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 120000, // 2 minute timeout for videos
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
//         const videoBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(1);

//         // Check file size (WhatsApp video limit ~16MB)
//         if (parseFloat(fileSizeMB) > 16) {
//           await sock.sendMessage(jid, { 
//             text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\nTry:\n• Lower quality (144p, 240p)\n• Shorter video\n• Direct link: ${result.result.download.substring(0, 50)}...`,
//             edit: statusMsg.key 
//           });
          
//           // Clean up
//           if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//           return;
//         }

//         // Send as video message (no thumbnail)
//         await sock.sendMessage(jid, {
//           video: videoBuffer,
//           mimetype: 'video/mp4',
//           caption: `🎬 ${finalTitle}\n📊 ${actualQuality}p • ${fileSizeMB}MB\n⚡ Source: ${downloadSource}`,
//           gifPlayback: false
//         }, { quoted: m });

//         // Clean up temp file
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [YTV] Cleaned up: ${tempFile}`);
//         }

//         // Success message
//         await sock.sendMessage(jid, { 
//           text: `✅ *Video Sent!*\n\n🎬 ${finalTitle}\n📊 ${actualQuality}p • ${fileSizeMB}MB\n⚡ Source: ${downloadSource}\n⏱ ${result.result.duration || 'N/A'}`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [YTV] Success: ${finalTitle} (${actualQuality}p, ${fileSizeMB}MB, ${downloadSource})`);

//       } catch (downloadError) {
//         console.error("❌ [YTV] Download error:", downloadError);
        
//         let errorMsg = `❌ Failed to download video`;
        
//         if (downloadError.message.includes('timeout')) {
//           errorMsg += '\n⏱ Download timed out. Video might be too large.';
//         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
//           errorMsg += '\n🌐 Network error. Check your connection.';
//         } else if (downloadError.response && downloadError.response.status === 403) {
//           errorMsg += '\n🔒 Access denied. Video might be restricted.';
//         }
        
//         errorMsg += `\n\n💡 Try:\n• Lower quality (144p, 240p)\n• Shorter video (<1 minute)`;
        
//         await sock.sendMessage(jid, { 
//           text: errorMsg,
//           edit: statusMsg.key 
//         });
        
//         // Clean up on error
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [YTV] Cleaned up failed: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [YTV] Fatal error:", error);
      
//       let errorText = '❌ An error occurred';
//       if (error.message.includes('savetube')) {
//         errorText += '\n🎬 The video service is currently unavailable';
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

// Reuse your exact savetube code (keeping this as primary)
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

// Updated APIs from the second example
const videoAPIs = {
  keith: {
    getVideo: async (youtubeUrl) => {
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
            quality: "HD",
            source: "keith"
          };
        }
        throw new Error('Keith API: No download link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  yupra: {
    getVideo: async (youtubeUrl) => {
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
            source: "yupra"
          };
        }
        throw new Error('Yupra API: No download link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  okatsu: {
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
            quality: res.data.result.quality || "HD",
            source: "okatsu"
          };
        }
        throw new Error('Okatsu API: No mp4 link');
      } catch (error) {
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
  name: "ytv",
  aliases: ["video", "vid", "ytvideo"],
  description: "Download YouTube videos with quality selection and multiple APIs",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      // Add reaction
      await sock.sendMessage(jid, {
        react: { text: '🎬', key: m.key }
      });

      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎬 *YouTube Video Downloader*\n\nUsage:\n• \`ytv song name\`\n• \`ytv https://youtube.com/...\`\n• \`ytv 360 song name\` (specify quality)\n\nAvailable qualities: 144, 240, 360, 480, 720, 1080`
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
            text: `❌ Please provide video name or URL after quality\nExample: ytv 720 funny cats`
          }, { quoted: m });
          return;
        }
      }

      console.log(`🎬 [YTV] Request: "${searchQuery}" (Quality: ${quality}p)`);

      // Send initial status
      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p\n⚡ Using savetube...` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      let videoTitle = '';
      let videoThumbnail = '';
      
      // Check if it's a URL
      const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      
      if (isUrl) {
        videoUrl = searchQuery;
        const videoId = extractYouTubeId(videoUrl);
        
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
            videoThumbnail = videos[0].thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          } else {
            videoTitle = "YouTube Video";
            videoThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          }
        } catch (infoError) {
          videoTitle = "YouTube Video";
          videoThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } else {
        // Search YouTube for the video
        try {
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching*: "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Looking for best match...`,
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
          videoThumbnail = videos[0].thumbnail;
          
          console.log(`🎬 [YTV] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [YTV] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: ytv https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Try savetube first (with quality selection)
      let videoResult = null;
      let downloadSource = "savetube";
      let actualQuality = quality;
      
      try {
        console.log(`🎬 [YTV] Trying savetube: ${videoUrl} (${quality}p)`);
        const result = await savetube.download(videoUrl, quality);
        
        if (result?.status && result?.result?.download) {
          videoResult = {
            success: true,
            download: result.result.download,
            title: result.result.title || videoTitle,
            quality: result.result.quality,
            source: "savetube",
            thumbnail: result.result.thumbnail
          };
          actualQuality = result.result.quality;
          console.log(`✅ [YTV] Got video from savetube: ${actualQuality}p`);
        } else {
          throw new Error("Savetube returned no download link");
        }
      } catch (savetubeError) {
        console.log(`⚠️ [YTV] Savetube failed: ${savetubeError.message}`);
        
        // Try lower qualities in savetube
        const qualities = ['360', '240', '144'];
        let foundAlternative = false;
        
        for (const lowerQuality of qualities) {
          if (parseInt(lowerQuality) < parseInt(quality)) {
            try {
              console.log(`🎬 [YTV] Trying savetube lower quality: ${lowerQuality}p`);
              const lowerResult = await savetube.download(videoUrl, lowerQuality);
              
              if (lowerResult?.status && lowerResult?.result?.download) {
                videoResult = {
                  success: true,
                  download: lowerResult.result.download,
                  title: lowerResult.result.title || videoTitle,
                  quality: lowerResult.result.quality,
                  source: "savetube",
                  thumbnail: lowerResult.result.thumbnail
                };
                actualQuality = lowerResult.result.quality;
                foundAlternative = true;
                console.log(`✅ [YTV] Got video from savetube: ${actualQuality}p (lower quality)`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
        
        // If savetube completely fails, try the new APIs
        if (!foundAlternative) {
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⚠️ *Savetube failed, trying backup APIs...*`,
            edit: statusMsg.key 
          });
          
          // Try new APIs sequentially
          const apisToTry = [
            () => videoAPIs.keith.getVideo(videoUrl),
            () => videoAPIs.yupra.getVideo(videoUrl),
            () => videoAPIs.okatsu.getVideo(videoUrl)
          ];
          
          for (let i = 0; i < apisToTry.length; i++) {
            const apiCall = apisToTry[i];
            const apiName = Object.keys(videoAPIs)[i];
            
            try {
              console.log(`🎬 [YTV] Trying ${apiName} API...`);
              
              await sock.sendMessage(jid, { 
                text: `✅ *Found:* ${videoTitle}\n⬇️ *Trying ${apiName} API...*`,
                edit: statusMsg.key 
              });
              
              const result = await apiCall();
              
              if (result.success) {
                videoResult = result;
                downloadSource = result.source;
                console.log(`✅ [YTV] Got video from ${result.source}`);
                break;
              }
            } catch (apiError) {
              console.log(`⚠️ [YTV] ${apiName} API failed:`, apiError.message);
              continue;
            }
          }
        }
      }

      if (!videoResult) {
        await sock.sendMessage(jid, { 
          text: `❌ All download services failed!\nPlease try again later or try different quality.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* ${videoTitle}\n✅ *Download link ready*\n📥 *Downloading video (${actualQuality || videoResult.quality})...*`,
        edit: statusMsg.key 
      });

      // Download the video file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const fileName = `ytv_${Date.now()}.mp4`;
      const tempFile = path.join(tempDir, fileName);
      
      try {
        // Download video with progress tracking
        const response = await axios({
          url: videoResult.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 180000, // 3 minute timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.youtube.com/'
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
          // Log progress every 5MB
          if (totalBytes && downloadedBytes % (5 * 1024 * 1024) < chunk.length) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            console.log(`📥 [YTV] Download: ${percent}% (${Math.round(downloadedBytes/1024/1024)}MB)`);
          }
        });
        
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Check file
        const stats = fs.statSync(tempFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        if (stats.size === 0) {
          throw new Error("Downloaded file is empty");
        }

        // WhatsApp video limit is ~16MB
        if (parseFloat(fileSizeMB) > 16) {
          await sock.sendMessage(jid, { 
            text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\nTry:\n• Lower quality (144p, 240p)\n• Shorter video\n• Use .audio for music only`,
            edit: statusMsg.key 
          });
          
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Send video with context info
        await sock.sendMessage(jid, {
          video: fs.readFileSync(tempFile),
          caption: `🎬 *${videoResult.title}*\n📊 ${actualQuality || videoResult.quality} • ${fileSizeMB}MB\n⚡ Source: ${videoResult.source}\n\n> WolfBot`,
          mimetype: 'video/mp4',
          fileName: `${videoResult.title.substring(0, 50)}.mp4`.replace(/[^\w\s.-]/gi, ''),
          contextInfo: {
            externalAdReply: {
              title: videoResult.title.substring(0, 70),
              body: 'YouTube Video • WolfBot',
              mediaType: 2,
              thumbnailUrl: videoThumbnail || videoResult.thumbnail || `https://i.ytimg.com/vi/${extractYouTubeId(videoUrl)}/hqdefault.jpg`,
              mediaUrl: videoUrl,
              sourceUrl: videoUrl,
              showAdAttribution: false,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m });

        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [YTV] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *Video Sent!*\n\n🎬 ${videoResult.title}\n📊 ${actualQuality || videoResult.quality} • ${fileSizeMB}MB\n⚡ Source: ${videoResult.source}`,
          edit: statusMsg.key 
        });

        console.log(`✅ [YTV] Success: ${videoResult.title} (${fileSizeMB}MB, ${videoResult.source})`);

      } catch (downloadError) {
        console.error("❌ [YTV] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download video`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Try lower quality.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response?.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        } else if (downloadError.message.includes('file is empty')) {
          errorMsg += '\n📦 Downloaded file is empty. Try different quality.';
        }
        
        errorMsg += `\n\n💡 Try lower quality (144, 240, 360) for faster download.`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [YTV] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [YTV] Fatal error:", error);
      
      await sock.sendMessage(jid, { 
        text: `❌ An error occurred\n💡 Try:\n1. Lower quality (144-480)\n2. Shorter video\n3. Direct YouTube link\n4. Try again later\n\nError: ${error.message.substring(0, 100)}`
      }, { quoted: m });
    }
  }
};