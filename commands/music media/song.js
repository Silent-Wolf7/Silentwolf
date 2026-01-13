// // import axios from "axios";
// // import crypto from "crypto";
// // import yts from "yt-search";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

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
// //   name: "song",
// //   description: "Download and send songs as audio messages",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (args.length === 0) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const searchQuery = args.join(" ");
// //       console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

// //       const statusMsg = await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}"` 
// //       }, { quoted: m });

// //       // Determine if input is YouTube link or search query
// //       let videoUrl = '';
// //       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
// //         videoUrl = searchQuery;
// //       } else {
// //         // Search YouTube for the video
// //         const { videos } = await yts(searchQuery);
// //         if (!videos || videos.length === 0) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ No songs found for "${searchQuery}"`,
// //             edit: statusMsg.key 
// //           });
// //           return;
// //         }
// //         videoUrl = videos[0].url;
// //         console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
// //       }

// //       await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
// //         edit: statusMsg.key 
// //       });

// //       // Download using savetube
// //       let result;
// //       try {
// //         result = await savetube.download(videoUrl, 'mp3');
// //       } catch (err) {
// //         console.error("❌ [SONG] Savetube error:", err);
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Download service failed`,
// //           edit: statusMsg.key 
// //         });
// //         return;
// //       }

// //       if (!result || !result.status || !result.result || !result.result.download) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to get download link`,
// //           edit: statusMsg.key 
// //         });
// //         return;
// //       }

// //       // Send thumbnail preview first
// //       try {
// //         await sock.sendMessage(jid, {
// //           image: { url: result.result.thumbnail },
// //           caption: `🎵 *${result.result.title}*\n⬇️ Downloading audio...`
// //         }, { quoted: m });
// //       } catch (thumbnailError) {
// //         console.log("❌ Could not send thumbnail");
// //       }

// //       await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
// //         edit: statusMsg.key 
// //       });

// //       // Download the audio file
// //       const tempDir = path.join(__dirname, "../temp");
// //       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
// //       const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
// //       try {
// //         const response = await axios({
// //           url: result.result.download,
// //           method: 'GET',
// //           responseType: 'stream',
// //           timeout: 45000
// //         });

// //         if (response.status !== 200) {
// //           throw new Error('Failed to download audio file');
// //         }

// //         const writer = fs.createWriteStream(tempFile);
// //         response.data.pipe(writer);
        
// //         await new Promise((resolve, reject) => {
// //           writer.on('finish', resolve);
// //           writer.on('error', reject);
// //         });

// //         // Read the file into buffer
// //         const audioBuffer = fs.readFileSync(tempFile);
// //         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

// //         // Send as AUDIO MESSAGE (not document)
// //         await sock.sendMessage(jid, {
// //           audio: audioBuffer,
// //           mimetype: 'audio/mpeg',
// //           ptt: false, // Not push-to-talk
// //           contextInfo: {
// //             externalAdReply: {
// //               title: result.result.title,
// //               body: `🎵 Song Audio • ${fileSizeMB}MB`,
// //               mediaType: 2,
// //               thumbnail: await getThumbnailBuffer(result.result.thumbnail),
// //               mediaUrl: videoUrl
// //             }
// //           }
// //         }, { quoted: m });

// //         await sock.sendMessage(jid, { 
// //           text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n🎧 You can play this directly in chat`,
// //           edit: statusMsg.key 
// //         });

// //         console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

// //       } catch (downloadError) {
// //         console.error("❌ [SONG] Download error:", downloadError);
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to download audio file`,
// //           edit: statusMsg.key 
// //         });
// //       } finally {
// //         // Clean up temp file
// //         setTimeout(() => {
// //           try {
// //             if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
// //           } catch (cleanError) {
// //             console.log("Cleanup error:", cleanError);
// //           }
// //         }, 5000);
// //       }

// //     } catch (error) {
// //       console.error("❌ [SONG] ERROR:", error);
// //       await sock.sendMessage(jid, { 
// //         text: `❌ Error: ${error.message}` 
// //       }, { quoted: m });
// //     }
// //   },
// // };

// // // Helper function to get thumbnail buffer for audio message
// // async function getThumbnailBuffer(thumbnailUrl) {
// //   try {
// //     const response = await axios.get(thumbnailUrl, {
// //       responseType: 'arraybuffer',
// //       timeout: 10000
// //     });
// //     return Buffer.from(response.data);
// //   } catch (error) {
// //     console.log("❌ Could not fetch thumbnail");
// //     return null;
// //   }
// // }
































































// import axios from "axios";
// import crypto from "crypto";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
//   name: "song",
//   description: "Download and send songs as audio messages",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
//         videoUrl = searchQuery;
//       } else {
//         // Search YouTube for the video
//         const { videos } = await yts(searchQuery);
//         if (!videos || videos.length === 0) {
//           await sock.sendMessage(jid, { 
//             text: `❌ No songs found for "${searchQuery}"`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//         videoUrl = videos[0].url;
//         console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
//       }

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
//         edit: statusMsg.key 
//       });

//       // Download using savetube
//       let result;
//       try {
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [SONG] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ Download service failed`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Removed the image sending part here
//       // The thumbnail preview image sending has been removed as requested

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
//         edit: statusMsg.key 
//       });

//       // Download the audio file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
//       try {
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 45000
//         });

//         if (response.status !== 200) {
//           throw new Error('Failed to download audio file');
//         }

//         const writer = fs.createWriteStream(tempFile);
//         response.data.pipe(writer);
        
//         await new Promise((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//         });

//         // Read the file into buffer
//         const audioBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

//         // Send as AUDIO MESSAGE (not document)
//         await sock.sendMessage(jid, {
//           audio: audioBuffer,
//           mimetype: 'audio/mpeg',
//           ptt: false, // Not push-to-talk
//           contextInfo: {
//             externalAdReply: {
//               title: result.result.title,
//               body: `🎵 Song Audio • ${fileSizeMB}MB`,
//               mediaType: 2,
//               thumbnail: await getThumbnailBuffer(result.result.thumbnail),
//               mediaUrl: videoUrl
//             }
//           }
//         }, { quoted: m });

//         await sock.sendMessage(jid, { 
//           text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

//       } catch (downloadError) {
//         console.error("❌ [SONG] Download error:", downloadError);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to download audio file`,
//           edit: statusMsg.key 
//         });
//       } finally {
//         // Clean up temp file
//         setTimeout(() => {
//           try {
//             if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//           } catch (cleanError) {
//             console.log("Cleanup error:", cleanError);
//           }
//         }, 5000);
//       }

//     } catch (error) {
//       console.error("❌ [SONG] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}` 
//       }, { quoted: m });
//     }
//   },
// };

// // Helper function to get thumbnail buffer for audio message
// async function getThumbnailBuffer(thumbnailUrl) {
//   try {
//     const response = await axios.get(thumbnailUrl, {
//       responseType: 'arraybuffer',
//       timeout: 10000
//     });
//     return Buffer.from(response.data);
//   } catch (error) {
//     console.log("❌ Could not fetch thumbnail");
//     return null;
//   }
// }

















// import axios from "axios";
// import crypto from "crypto";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
//   name: "song",
//   description: "Download and send songs as audio messages",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
//         videoUrl = searchQuery;
//       } else {
//         // Search YouTube for the video
//         const { videos } = await yts(searchQuery);
//         if (!videos || videos.length === 0) {
//           await sock.sendMessage(jid, { 
//             text: `❌ No songs found for "${searchQuery}"`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//         videoUrl = videos[0].url;
//         console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
//       }

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
//         edit: statusMsg.key 
//       });

//       // Download using savetube
//       let result;
//       try {
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [SONG] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ Download service failed`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
//         edit: statusMsg.key 
//       });

//       // Download the audio file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
//       try {
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 45000
//         });

//         if (response.status !== 200) {
//           throw new Error('Failed to download audio file');
//         }

//         const writer = fs.createWriteStream(tempFile);
//         response.data.pipe(writer);
        
//         await new Promise((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//         });

//         // Read the file into buffer
//         const audioBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

//         // Get thumbnail for audio message
//         let thumbnailBuffer = null;
//         try {
//           const thumbnailResponse = await axios.get(result.result.thumbnail, {
//             responseType: 'arraybuffer',
//             timeout: 10000
//           });
//           thumbnailBuffer = Buffer.from(thumbnailResponse.data);
//         } catch (thumbError) {
//           console.log("❌ Could not fetch thumbnail, using default");
//         }

//         // Send as AUDIO MESSAGE (not document)
//         await sock.sendMessage(jid, {
//           audio: audioBuffer,
//           mimetype: 'audio/mpeg',
//           ptt: false, // Not push-to-talk
//           contextInfo: {
//             externalAdReply: {
//               title: result.result.title,
//               body: `🎵 Song Audio • ${fileSizeMB}MB`,
//               mediaType: 2,
//               thumbnail: thumbnailBuffer,
//               mediaUrl: videoUrl
//             }
//           }
//         }, { quoted: m });

//         // Delete temp file immediately after sending
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [SONG] Cleaned up temp file: ${tempFile}`);
//         }

//         await sock.sendMessage(jid, { 
//           text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

//       } catch (downloadError) {
//         console.error("❌ [SONG] Download error:", downloadError);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to download audio file`,
//           edit: statusMsg.key 
//         });
        
//         // Clean up temp file even if sending fails
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [SONG] Cleaned up failed download: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [SONG] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}` 
//       }, { quoted: m });
//     }
//   },
// };
























import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple API wrapper for the new audio download service
const audioApi = {
  download: async (youtubeUrl) => {
    try {
      const apiUrl = "https://apiskeith.vercel.app/download/audio";
      
      console.log(`🎵 [API] Requesting audio from: ${youtubeUrl}`);
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: { url: youtubeUrl },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log(`🎵 [API] Response status: ${response.status}`);
      console.log(`🎵 [API] Full response:`, JSON.stringify(response.data, null, 2));
      
      if (!response.data || response.status !== 200) {
        throw new Error('Invalid response from API');
      }

      // The API returns a direct download URL in the "result" field
      let audioUrl = null;
      let title = "YouTube Audio";
      
      if (response.data.result && typeof response.data.result === 'string') {
        audioUrl = response.data.result;
      } else if (response.data.downloadUrl) {
        audioUrl = response.data.downloadUrl;
      } else if (response.data.url) {
        audioUrl = response.data.url;
      } else if (response.data.data && response.data.data.url) {
        audioUrl = response.data.data.url;
      }
      
      // Try to get video title from YouTube
      try {
        const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch) {
          const searchResult = await yts({ videoId: videoIdMatch[1] });
          if (searchResult && searchResult.title) {
            title = searchResult.title;
          }
        }
      } catch (titleError) {
        console.log("🎵 [API] Could not fetch title:", titleError.message);
      }

      if (!audioUrl) {
        console.log(`🎵 [API] No audio URL found in response`);
        throw new Error('No audio URL found in API response');
      }

      console.log(`🎵 [API] Audio URL obtained: ${audioUrl}`);
      
      return {
        status: true,
        audioUrl: audioUrl,
        title: title,
        rawResponse: response.data
      };
      
    } catch (error) {
      console.error(`🎵 [API] Error:`, error.message);
      console.error(`🎵 [API] Error details:`, error.response?.data || 'No response data');
      
      let errorMsg = `API Error: ${error.message}`;
      if (error.response?.status) {
        errorMsg += ` (Status: ${error.response.status})`;
      }
      
      throw new Error(errorMsg);
    }
  },
  
  // Try to extract direct download URL from redirect URL
  extractDirectUrl: async (redirectUrl) => {
    try {
      console.log(`🎵 [REDIRECT] Following: ${redirectUrl}`);
      
      // First, try to get the final URL after redirects
      const response = await axios({
        url: redirectUrl,
        method: 'HEAD',
        maxRedirects: 5,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Check if we got redirected to a direct file
      const finalUrl = response.request?.res?.responseUrl || redirectUrl;
      console.log(`🎵 [REDIRECT] Final URL: ${finalUrl}`);
      
      // Check if it's a direct audio file
      if (finalUrl.match(/\.(mp3|m4a|ogg|wav|aac)$/i)) {
        return finalUrl;
      }
      
      // If not a direct file, try to download and see what we get
      return redirectUrl;
      
    } catch (error) {
      console.log(`🎵 [REDIRECT] Error following URL:`, error.message);
      return redirectUrl; // Return original URL if we can't follow redirects
    }
  }
};

export default {
  name: "song",
  description: "Download and send songs as audio messages",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Song Audio*\n\nUsage: song <song name or YouTube URL>\n\nExample: song Home by NF\nExample: song https://youtu.be/dQw4w9WgXcQ` 
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      let videoTitle = '';
      let videoId = '';
      
      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        videoUrl = searchQuery;
        // Extract video ID for thumbnail
        const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
          videoId = match[1];
        }
        videoTitle = "YouTube Audio";
      } else {
        // Search YouTube for the video
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching YouTube*: "${searchQuery}"`,
          edit: statusMsg.key 
        });
        
        const searchResults = await yts(searchQuery);
        if (!searchResults.videos || searchResults.videos.length === 0) {
          await sock.sendMessage(jid, { 
            text: `❌ No songs found for "${searchQuery}"`,
            edit: statusMsg.key 
          });
          return;
        }
        
        const video = searchResults.videos[0];
        videoUrl = video.url;
        videoTitle = video.title;
        videoId = video.videoId;
        console.log(`🎵 [SONG] Found: ${videoTitle} - ${videoUrl}`);
        
        await sock.sendMessage(jid, { 
          text: `✅ *Found*: "${videoTitle}"\n⬇️ *Getting download link...*`,
          edit: statusMsg.key 
        });
      }

      // Get audio download link from API
      let audioData;
      try {
        audioData = await audioApi.download(videoUrl);
        
        if (!audioData || !audioData.status || !audioData.audioUrl) {
          throw new Error('No audio URL received from API');
        }
        
        // Try to extract direct URL if it's a redirect
        console.log(`🎵 [SONG] Got audio URL: ${audioData.audioUrl}`);
        
        if (!audioData.audioUrl.match(/\.(mp3|m4a|ogg|wav|aac)$/i)) {
          console.log(`🎵 [SONG] URL doesn't look like direct audio, attempting to extract...`);
          const directUrl = await audioApi.extractDirectUrl(audioData.audioUrl);
          audioData.audioUrl = directUrl;
          console.log(`🎵 [SONG] Using URL: ${directUrl}`);
        }
        
      } catch (apiError) {
        console.error("❌ [SONG] API error:", apiError.message);
        await sock.sendMessage(jid, { 
          text: `❌ API Error: ${apiError.message}\n\nPlease try again with a different song.`,
          edit: statusMsg.key 
        });
        return;
      }

      await sock.sendMessage(jid, { 
        text: `✅ *Found*: "${audioData.title || videoTitle}"\n⬇️ *Downloading audio...*`,
        edit: statusMsg.key 
      });

      // Download the audio file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
      try {
        console.log(`🎵 [SONG] Downloading from: ${audioData.audioUrl}`);
        
        // Try with different approaches
        let audioBuffer;
        try {
          // Approach 1: Direct download as buffer
          const response = await axios({
            url: audioData.audioUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
              'Referer': 'https://www.youtube.com/'
            },
            timeout: 45000, // 45 seconds
            maxRedirects: 5
          });

          if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          audioBuffer = Buffer.from(response.data);
          
        } catch (directError) {
          console.log(`🎵 [SONG] Direct download failed: ${directError.message}`);
          
          // Approach 2: Stream download
          const response = await axios({
            url: audioData.audioUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 45000
          });

          const writer = fs.createWriteStream(tempFile);
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          audioBuffer = fs.readFileSync(tempFile);
        }

        // Check if we got valid audio data
        if (!audioBuffer || audioBuffer.length === 0) {
          throw new Error('Downloaded audio is empty');
        }

        const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
        
        console.log(`🎵 [SONG] Downloaded: ${fileSizeMB}MB`);

        // Get thumbnail
        let thumbnailBuffer = null;
        try {
          if (videoId) {
            const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            console.log(`🎵 [SONG] Getting thumbnail: ${thumbnailUrl}`);
            const thumbnailResponse = await axios.get(thumbnailUrl, {
              responseType: 'arraybuffer',
              timeout: 10000
            });
            thumbnailBuffer = Buffer.from(thumbnailResponse.data);
          }
        } catch (thumbError) {
          console.log("🎵 [SONG] Could not fetch thumbnail:", thumbError.message);
        }

        // Send as AUDIO MESSAGE
        await sock.sendMessage(jid, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: audioData.title || videoTitle || "Song Audio",
              body: `🎵 ${fileSizeMB}MB • Downloaded`,
              mediaType: 2,
              thumbnail: thumbnailBuffer,
              mediaUrl: videoUrl
            }
          }
        }, { quoted: m });

        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [SONG] Cleaned up temp file`);
        }

        await sock.sendMessage(jid, { 
          text: `✅ *Audio Sent!*\n\n"${audioData.title || videoTitle}"\n📦 Size: ${fileSizeMB}MB`,
          edit: statusMsg.key 
        });

        console.log(`✅ [SONG] Successfully sent audio`);

      } catch (downloadError) {
        console.error("❌ [SONG] Download error:", downloadError.message);
        await sock.sendMessage(jid, { 
          text: `❌ Download failed: ${downloadError.message}\n\nThe download link may have expired or requires a browser to access.`,
          edit: statusMsg.key 
        });
        
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [SONG] Cleaned up failed download`);
        }
      }

    } catch (error) {
      console.error("❌ [SONG] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\nPlease try again with a different song.` 
      }, { quoted: m });
    }
  },
};