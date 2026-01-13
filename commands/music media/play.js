












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
//   name: "play",
//   description: "Download and send songs as MP3 documents",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Play Music*\n\ play <song name>\n\nExample: play Home by NF` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [PLAY] Searching for: ${searchQuery}`);

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
//         console.log(`🎵 [PLAY] Found: ${videos[0].title} - ${videoUrl}`);
//       }

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading MP3...*`,
//         edit: statusMsg.key 
//       });

//       // Download using savetube
//       let result;
//       try {
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [PLAY] Savetube error:", err);
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
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading MP3...* ✅\n📤 *Sending MP3 Document...*`,
//         edit: statusMsg.key 
//       });

//       // Download the MP3 file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}.mp3`);
      
//       try {
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 45000
//         });

//         if (response.status !== 200) {
//           throw new Error('Failed to download MP3 file');
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

//         // Clean filename
//         const cleanTitle = result.result.title
//           .replace(/[^\w\s-]/gi, '')
//           .replace(/\s+/g, ' ')
//           .trim()
//           .substring(0, 40);

//         const fileName = `${cleanTitle}.mp3`;

//         // Send as MP3 DOCUMENT (not audio)
//         await sock.sendMessage(jid, {
//           document: audioBuffer,
//           mimetype: 'audio/mpeg',
//           fileName: fileName,
//           caption: `🎵 *${result.result.title}*\n👤 ${result.result.duration || 'Unknown duration'}\n📊 ${fileSizeMB}MB`
//         });

//         // Delete temp file immediately after sending
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [PLAY] Cleaned up temp file: ${tempFile}`);
//         }

//         await sock.sendMessage(jid, { 
//           text: `✅ *MP3 Document Sent!*\n\n"${result.result.title}"\n📁 You can save this file`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [PLAY] Successfully sent MP3 document: ${result.result.title}`);

//       } catch (downloadError) {
//         console.error("❌ [PLAY] Download error:", downloadError);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to download MP3 file`,
//           edit: statusMsg.key 
//         });
        
//         // Clean up temp file even if sending fails
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [PLAY] Cleaned up failed download: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [PLAY] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}` 
//       }, { quoted: m });
//     }
//   },
// };























// import axios from "axios";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Simple API wrapper for the audio download service
// const audioApi = {
//   download: async (youtubeUrl) => {
//     try {
//       const apiUrl = "https://apiskeith.vercel.app/download/audio";
      
//       console.log(`🎵 [API] Requesting audio from: ${youtubeUrl}`);
      
//       const response = await axios({
//         method: 'GET',
//         url: apiUrl,
//         params: { url: youtubeUrl },
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         },
//         timeout: 30000 // 30 seconds timeout
//       });

//       console.log(`🎵 [API] Response status: ${response.status}`);
      
//       if (!response.data || response.status !== 200) {
//         throw new Error('Invalid response from API');
//       }

//       // The API returns a direct download URL in the "result" field
//       let audioUrl = null;
//       let title = "YouTube Audio";
      
//       if (response.data.result && typeof response.data.result === 'string') {
//         audioUrl = response.data.result;
//       } else if (response.data.downloadUrl) {
//         audioUrl = response.data.downloadUrl;
//       } else if (response.data.url) {
//         audioUrl = response.data.url;
//       }
      
//       // Try to get video title from YouTube
//       try {
//         const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//         if (videoIdMatch) {
//           const searchResult = await yts({ videoId: videoIdMatch[1] });
//           if (searchResult && searchResult.title) {
//             title = searchResult.title;
//           }
//         }
//       } catch (titleError) {
//         console.log("🎵 [API] Could not fetch title:", titleError.message);
//       }

//       if (!audioUrl) {
//         console.log(`🎵 [API] Response data:`, JSON.stringify(response.data, null, 2));
//         throw new Error('No audio URL found in API response');
//       }

//       console.log(`🎵 [API] Audio URL obtained: ${audioUrl}`);
      
//       return {
//         status: true,
//         audioUrl: audioUrl,
//         title: title,
//         rawResponse: response.data
//       };
      
//     } catch (error) {
//       console.error(`🎵 [API] Error:`, error.message);
      
//       let errorMsg = `API Error: ${error.message}`;
//       if (error.response?.status) {
//         errorMsg += ` (Status: ${error.response.status})`;
//       }
      
//       throw new Error(errorMsg);
//     }
//   },
  
//   // Try to extract direct download URL from redirect URL
//   extractDirectUrl: async (redirectUrl) => {
//     try {
//       console.log(`🎵 [REDIRECT] Following: ${redirectUrl}`);
      
//       // First, try to get the final URL after redirects
//       const response = await axios({
//         url: redirectUrl,
//         method: 'HEAD',
//         maxRedirects: 5,
//         timeout: 10000,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//         }
//       });
      
//       // Check if we got redirected to a direct file
//       const finalUrl = response.request?.res?.responseUrl || redirectUrl;
//       console.log(`🎵 [REDIRECT] Final URL: ${finalUrl}`);
      
//       // Check if it's a direct audio file
//       if (finalUrl.match(/\.(mp3|m4a|ogg|wav|aac)$/i)) {
//         return finalUrl;
//       }
      
//       // If not a direct file, try to download and see what we get
//       return redirectUrl;
      
//     } catch (error) {
//       console.log(`🎵 [REDIRECT] Error following URL:`, error.message);
//       return redirectUrl; // Return original URL if we can't follow redirects
//     }
//   }
// };

// export default {
//   name: "play",
//   description: "Download and send songs as MP3 documents",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Play Music*\n\nUsage: play <song name or YouTube URL>\n\nExample: play Home by NF\nExample: play https://youtu.be/dQw4w9WgXcQ` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [PLAY] Searching for: ${searchQuery}`);

//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       let videoTitle = '';
//       let videoId = '';
      
//       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
//         videoUrl = searchQuery;
//         // Extract video ID for thumbnail
//         const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//         if (match) {
//           videoId = match[1];
//         }
//         videoTitle = "YouTube Audio";
//       } else {
//         // Search YouTube for the video
//         await sock.sendMessage(jid, { 
//           text: `🔍 *Searching YouTube*: "${searchQuery}"`,
//           edit: statusMsg.key 
//         });
        
//         const searchResults = await yts(searchQuery);
//         if (!searchResults.videos || searchResults.videos.length === 0) {
//           await sock.sendMessage(jid, { 
//             text: `❌ No songs found for "${searchQuery}"`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
        
//         const video = searchResults.videos[0];
//         videoUrl = video.url;
//         videoTitle = video.title;
//         videoId = video.videoId;
//         console.log(`🎵 [PLAY] Found: ${videoTitle} - ${videoUrl}`);
        
//         await sock.sendMessage(jid, { 
//           text: `✅ *Found*: "${videoTitle}"\n⬇️ *Getting download link...*`,
//           edit: statusMsg.key 
//         });
//       }

//       // Get audio download link from API
//       let audioData;
//       try {
//         audioData = await audioApi.download(videoUrl);
        
//         if (!audioData || !audioData.status || !audioData.audioUrl) {
//           throw new Error('No audio URL received from API');
//         }
        
//         // Try to extract direct URL if it's a redirect
//         console.log(`🎵 [PLAY] Got audio URL: ${audioData.audioUrl}`);
        
//         if (!audioData.audioUrl.match(/\.(mp3|m4a|ogg|wav|aac)$/i)) {
//           console.log(`🎵 [PLAY] URL doesn't look like direct audio, attempting to extract...`);
//           const directUrl = await audioApi.extractDirectUrl(audioData.audioUrl);
//           audioData.audioUrl = directUrl;
//           console.log(`🎵 [PLAY] Using URL: ${directUrl}`);
//         }
        
//       } catch (apiError) {
//         console.error("❌ [PLAY] API error:", apiError.message);
//         await sock.sendMessage(jid, { 
//           text: `❌ API Error: ${apiError.message}\n\nPlease try again with a different song.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       await sock.sendMessage(jid, { 
//         text: `✅ *Found*: "${audioData.title || videoTitle}"\n⬇️ *Downloading MP3...*`,
//         edit: statusMsg.key 
//       });

//       // Download the MP3 file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//       }
      
//       const tempFile = path.join(tempDir, `${Date.now()}_play.mp3`);
      
//       try {
//         console.log(`🎵 [PLAY] Downloading from: ${audioData.audioUrl}`);
        
//         // Try with different approaches
//         let audioBuffer;
//         try {
//           // Approach 1: Direct download as buffer
//           const response = await axios({
//             url: audioData.audioUrl,
//             method: 'GET',
//             responseType: 'arraybuffer',
//             headers: {
//               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//               'Accept': '*/*',
//               'Referer': 'https://www.youtube.com/'
//             },
//             timeout: 45000, // 45 seconds
//             maxRedirects: 5
//           });

//           if (response.status !== 200) {
//             throw new Error(`HTTP ${response.status}`);
//           }
          
//           audioBuffer = Buffer.from(response.data);
          
//         } catch (directError) {
//           console.log(`🎵 [PLAY] Direct download failed: ${directError.message}`);
          
//           // Approach 2: Stream download
//           const response = await axios({
//             url: audioData.audioUrl,
//             method: 'GET',
//             responseType: 'stream',
//             headers: {
//               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//             },
//             timeout: 45000
//           });

//           const writer = fs.createWriteStream(tempFile);
//           response.data.pipe(writer);
          
//           await new Promise((resolve, reject) => {
//             writer.on('finish', resolve);
//             writer.on('error', reject);
//           });

//           audioBuffer = fs.readFileSync(tempFile);
//         }

//         // Check if we got valid audio data
//         if (!audioBuffer || audioBuffer.length === 0) {
//           throw new Error('Downloaded audio is empty');
//         }

//         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
        
//         console.log(`🎵 [PLAY] Downloaded: ${fileSizeMB}MB`);

//         // Create a clean filename
//         const cleanTitle = (audioData.title || videoTitle || "audio")
//           .replace(/[^\w\s-]/gi, '') // Remove special characters
//           .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
//           .trim()                    // Trim whitespace
//           .substring(0, 40);         // Limit to 40 characters

//         const fileName = `${cleanTitle}.mp3`;

//         await sock.sendMessage(jid, { 
//           text: `✅ *Found*: "${audioData.title || videoTitle}"\n⬇️ *Downloading MP3...* ✅\n📤 *Sending MP3 Document...*`,
//           edit: statusMsg.key 
//         });

//         // Send as MP3 DOCUMENT (not audio message)
//         await sock.sendMessage(jid, {
//           document: audioBuffer,
//           mimetype: 'audio/mpeg',
//           fileName: fileName,
//           caption: `🎵 *${audioData.title || videoTitle}*\n📊 Size: ${fileSizeMB}MB\n\n✅ Downloaded successfully`
//         });

//         // Clean up
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [PLAY] Cleaned up temp file`);
//         }

//         await sock.sendMessage(jid, { 
//           text: `✅ *MP3 Document Sent!*\n\n"${audioData.title || videoTitle}"\n📁 You can save this file to your device`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [PLAY] Successfully sent MP3 document`);

//       } catch (downloadError) {
//         console.error("❌ [PLAY] Download error:", downloadError.message);
//         await sock.sendMessage(jid, { 
//           text: `❌ Download failed: ${downloadError.message}\n\nThe download link may have expired or requires a browser to access.`,
//           edit: statusMsg.key 
//         });
        
//         // Clean up
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [PLAY] Cleaned up failed download`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [PLAY] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}\n\nPlease try again with a different song.` 
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

// Multiple audio download APIs for reliability
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
  name: "play",
  aliases: ["song", "music", "audio", "mp3"],
  description: "Download and send songs as MP3 documents with thumbnails",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      // // Add reaction
      // await sock.sendMessage(jid, {
      //   react: { text: '🎵', key: m.key }
      // });

      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Play Music*\n\nUsage: play <song name or YouTube URL>\n\nExample: play Not Like Us\nExample: play https://youtu.be/dQw4w9WgXcQ`
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`🎵 [PLAY] Searching for: "${searchQuery}"`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"\n⚡ Using Keith API...` 
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
          
          console.log(`🎵 [PLAY] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* "${videoTitle}"\n🎤 Artist: ${videoAuthor}\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [PLAY] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: play https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Try multiple APIs sequentially
      let audioResult = null;
      const apisToTry = [
        () => audioAPIs.keith.getAudio(videoUrl),
        () => audioAPIs.yupra.getAudio(videoUrl),
        () => audioAPIs.okatsu.getAudio(videoUrl)
      ];
      
      for (let i = 0; i < apisToTry.length; i++) {
        const apiCall = apisToTry[i];
        const apiName = Object.keys(audioAPIs)[i];
        
        try {
          console.log(`🎵 [PLAY] Trying ${apiName} API...`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* "${videoTitle}"\n⬇️ *Getting download link...*\n⚡ Using ${apiName} API...`,
            edit: statusMsg.key 
          });
          
          const result = await apiCall();
          
          if (result.success) {
            audioResult = result;
            console.log(`✅ [PLAY] Got link from ${result.source}`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [PLAY] ${apiName} API failed:`, apiError.message);
          continue;
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
      
      const fileName = `play_${Date.now()}.mp3`;
      const tempFile = path.join(tempDir, fileName);
      
      try {
        console.log(`🎵 [PLAY] Downloading from: ${audioResult.audioUrl}`);
        
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
            console.log(`📥 [PLAY] Download: ${percent}% (${Math.round(downloadedBytes/1024/1024)}MB)`);
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

        console.log(`🎵 [PLAY] Downloaded: ${fileSizeMB}MB`);

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
          text: `✅ *Found:* "${videoTitle}"\n✅ *Download complete*\n📤 *Sending MP3 Document...*`,
          edit: statusMsg.key 
        });

        // Send as MP3 document with thumbnail
        await sock.sendMessage(jid, {
          document: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: finalFileName,
          caption: `🎵 *${videoTitle}*\n🎤 Artist: ${videoAuthor}\n⏱ Duration: ${videoDuration}\n📊 Size: ${fileSizeMB}MB\n⚡ Source: ${audioResult.source}`,
          contextInfo: {
            externalAdReply: {
              title: videoTitle.substring(0, 70),
              body: `By ${videoAuthor} • ${videoDuration}`,
              mediaType: 2,
              thumbnailUrl: videoThumbnail,
              mediaUrl: videoUrl,
              sourceUrl: videoUrl,
              showAdAttribution: false,
              renderLargerThumbnail: false
            }
          }
        });

        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [PLAY] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *MP3 Sent!*\n\n🎵 ${videoTitle}\n🎤 ${videoAuthor}\n📊 ${fileSizeMB}MB • ⏱ ${videoDuration}\n⚡ Source: ${audioResult.source}\n\n📁 You can save this file to your device.`,
          edit: statusMsg.key 
        });

        console.log(`✅ [PLAY] Success: ${videoTitle} (${fileSizeMB}MB, ${audioResult.source})`);

      } catch (downloadError) {
        console.error("❌ [PLAY] Download error:", downloadError);
        
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
          console.log(`🧹 [PLAY] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [PLAY] Fatal error:", error);
      
      await sock.sendMessage(jid, { 
        text: `❌ An error occurred\n💡 Try:\n1. Direct YouTube link\n2. Different song\n3. Try again later\n\nError: ${error.message.substring(0, 100)}`
      }, { quoted: m });
    }
  }
};