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
//   name: "ytplaydoc",
//   description: "Download YouTube audio as document file",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `📁 *YouTube Audio as Document*\n\nUsage:\n• \`ytplaydoc song name\`\n• \`ytplaydoc https://youtube.com/...\`\n• \`ytplaydoc artist - song title\`\n`
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`📁 [YTPLAYDOC] Request: ${searchQuery}`);

//       // Send status message
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching for document:* "${searchQuery}"` 
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
//             text: `🔍 *Searching for document:* "${searchQuery}"\n📡 Looking for best match...`,
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
          
//           console.log(`📁 [YTPLAYDOC] Found: ${videoTitle} - ${videoUrl}`);
          
//           await sock.sendMessage(jid, { 
//             text: `🔍 *Searching for document:* "${searchQuery}" ✅\n🎵 *Found:* ${videoTitle}\n⬇️ *Preparing document download...*`,
//             edit: statusMsg.key 
//           });
          
//         } catch (searchError) {
//           console.error("❌ [YTPLAYDOC] Search error:", searchError);
//           await sock.sendMessage(jid, { 
//             text: `❌ Search failed. Please use direct YouTube link.\nExample: ytplaydoc https://youtube.com/watch?v=...`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       // Download using savetube
//       let result;
//       try {
//         console.log(`📁 [YTPLAYDOC] Downloading via savetube: ${videoUrl}`);
//         await sock.sendMessage(jid, { 
//           text: `🔄 *Connecting to audio service...*`,
//           edit: statusMsg.key 
//         });
        
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [YTPLAYDOC] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ Audio service failed\nTry again in a few minutes.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         console.error("❌ [YTPLAYDOC] Invalid result:", result);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link\nService might be temporarily unavailable.`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Update status
//       await sock.sendMessage(jid, { 
//         text: `⬇️ *Downloading audio file for document...*\n🎵 ${videoTitle || result.result.title}`,
//         edit: statusMsg.key 
//       });

//       // Download the audio file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_ytplaydoc.mp3`);
//       const finalTitle = videoTitle || result.result.title;
      
//       try {
//         // Download the audio
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 120000, // 2 minute timeout for larger files
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

//         // Check file size (WhatsApp document limit ~100MB, but be reasonable)
//         if (parseFloat(fileSizeMB) > 64) {
//           await sock.sendMessage(jid, { 
//             text: `❌ File too large: ${fileSizeMB}MB\nMax recommended: 64MB\nTry a shorter audio or different song.`,
//             edit: statusMsg.key 
//           });
          
//           // Clean up
//           if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//           return;
//         }

//         // Update status before sending
//         await sock.sendMessage(jid, { 
//           text: `📤 *Sending as document...*\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB`,
//           edit: statusMsg.key 
//         }       );

//         // Clean filename for document
//         const cleanFileName = `${finalTitle.substring(0, 100)}.mp3`
//           .replace(/[^\w\s.-]/gi, '')  // Remove special characters
//           .replace(/\s+/g, '_')        // Replace spaces with underscores
//           .replace(/_{2,}/g, '_');     // Replace multiple underscores with single

//         // Send as DOCUMENT (not audio message)
//         await sock.sendMessage(jid, {
//           document: audioBuffer,
//           mimetype: 'audio/mpeg',
//           fileName: cleanFileName,
//           caption: `🎵 ${finalTitle}\n📦 ${fileSizeMB}MB • ⏱ ${result.result.duration || 'N/A'}\n📁 Sent as document file`,
//           quoted: m
//         });

//         // Clean up temp file
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`✅ [YTPLAYDOC] Cleaned up: ${tempFile}`);
//         }

//         // Success message
//         await sock.sendMessage(jid, { 
//           text: `✅ *Document Sent Successfully!*\n\n📁 *File:* ${cleanFileName}\n🎵 ${finalTitle}\n📦 ${fileSizeMB}MB\n⏱ ${result.result.duration || 'N/A'}\n\n💡 *Save as file using menu options*`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [YTPLAYDOC] Success: ${finalTitle} (${fileSizeMB}MB as document)`);

//         } catch (downloadError) {
//         console.error("❌ [YTPLAYDOC] Download error:", downloadError);
        
//         let errorMsg = `❌ Failed to download audio for document`;
        
//         if (downloadError.message.includes('timeout')) {
//           errorMsg += '\n⏱ Download timed out. File might be too large.';
//         } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
//           errorMsg += '\n🌐 Network error. Check your connection.';
//         } else if (downloadError.response && downloadError.response.status === 403) {
//           errorMsg += '\n🔒 Access denied. Video might be restricted.';
//         }
        
//         errorMsg += `\n\n💡 *Try these instead:*\n• Use \`!ytplay\` for audio message\n• Try different video\n• Manual: y2mate.com`;
        
//         await sock.sendMessage(jid, { 
//           text: errorMsg,
//           edit: statusMsg.key 
//         });
        
//         // Clean up on error
//         if (fs.existsSync(tempFile)) {
//           fs.unlinkSync(tempFile);
//           console.log(`🧹 [YTPLAYDOC] Cleaned up failed: ${tempFile}`);
//         }
//       }

//     } catch (error) {
//       console.error("❌ [YTPLAYDOC] Fatal error:", error);
      
//       let errorText = '❌ An error occurred while processing document request';
//       if (error.message.includes('savetube')) {
//         errorText += '\n🎵 The audio service is currently unavailable';
//         errorText += '\n💡 Try again in a few minutes';
//       } else if (error.message.includes('timeout')) {
//         errorText += '\n⏱ Request timed out. Try shorter audio.';
//       } else {
//         errorText += `\n${error.message.substring(0, 100)}`;
//       }
      
//       errorText += `\n\n📌 *Alternative commands:*\n`;
//       errorText += `• \`!ytplay\` - Audio message\n`;
//       errorText += `• \`!song\` - Audio message\n`;
//       errorText += `• \`!ytmp3\` - Audio message`;
      
//       await sock.sendMessage(jid, { 
//         text: errorText
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

// Video download APIs with quality options
const videoAPIs = {
  keith: {
    getVideo: async (youtubeUrl, quality = "360p") => {
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
            quality: "auto", // Keith API doesn't specify quality
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
    getVideo: async (youtubeUrl, quality = "360p") => {
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
            quality: res.data.data.quality || "auto",
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
    getVideo: async (youtubeUrl, quality = "360p") => {
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
            quality: res.data.result.quality || "auto",
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

// Try different quality APIs
const lowQualityAPIs = {
  // This API supports quality parameters (144p, 240p, 360p, 480p, 720p, 1080p)
  yt5s: {
    getVideo: async (youtubeUrl, quality = "360p") => {
      try {
        // First get the video info to get available qualities
        const infoUrl = `https://yt5s.com/api/ajaxSearch`;
        const infoRes = await axios.post(infoUrl, 
          `q=${encodeURIComponent(youtubeUrl)}&vt=home`,
          {
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Origin': 'https://yt5s.com',
              'Referer': 'https://yt5s.com/'
            }
          }
        );
        
        if (infoRes.data?.links?.mp4) {
          // Try to get lower quality first
          const qualities = ["144", "240", "360", "480", "720", "1080"];
          let selectedQuality = "360"; // Default to 360p
          
          for (const q of qualities) {
            if (infoRes.data.links.mp4[q]) {
              selectedQuality = q;
              break; // Take the first available (lowest)
            }
          }
          
          const downloadLink = infoRes.data.links.mp4[selectedQuality];
          
          if (downloadLink) {
            // Get the actual download URL
            const downloadRes = await axios.post(
              'https://yt5s.com/api/ajaxConvert',
              `vid=${infoRes.data.vid}&k=${downloadLink.k}`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Origin': 'https://yt5s.com',
                  'Referer': 'https://yt5s.com/'
                }
              }
            );
            
            if (downloadRes.data?.dlink) {
              return {
                success: true,
                download: downloadRes.data.dlink,
                title: infoRes.data.title || "YouTube Video",
                quality: `${selectedQuality}p`,
                source: "yt5s"
              };
            }
          }
        }
        throw new Error('YT5s API: No download link');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  // Another low quality API
  ytdl: {
    getVideo: async (youtubeUrl, quality = "lowest") => {
      try {
        const apiUrl = `https://api.ytbvideoly.com/api/videoInfo?url=${encodeURIComponent(youtubeUrl)}`;
        const res = await axios.get(apiUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (res.data?.video?.sources) {
          // Sort by size (smallest first) and take the first one
          const sortedSources = res.data.video.sources
            .filter(source => source.quality && source.url)
            .sort((a, b) => {
              // Try to sort by quality number
              const aQuality = parseInt(a.quality) || 9999;
              const bQuality = parseInt(b.quality) || 9999;
              return aQuality - bQuality;
            });
          
          if (sortedSources.length > 0) {
            return {
              success: true,
              download: sortedSources[0].url,
              title: res.data.video.title || "YouTube Video",
              quality: sortedSources[0].quality || "low",
              source: "ytdl"
            };
          }
        }
        throw new Error('YTDl API: No download link');
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

// Estimate video size based on duration and quality
const estimateVideoSize = (durationSeconds, quality = "360p") => {
  // Approximate bitrates (kbps)
  const bitrates = {
    "144p": 100,
    "240p": 250,
    "360p": 500,
    "480p": 1000,
    "720p": 2000,
    "1080p": 4000,
    "auto": 1000, // Default
    "low": 300,
    "medium": 800,
    "high": 2000
  };
  
  const bitrate = bitrates[quality.toLowerCase()] || 500; // Default to 360p
  // Calculate size: (bitrate * duration) / 8 = size in kilobits, /1024 = MB
  const sizeMB = (bitrate * durationSeconds) / (8 * 1024);
  
  return Math.round(sizeMB * 10) / 10; // Round to 1 decimal
};

// Main command
export default {
  name: "video",
  aliases: ["vid2", "ytv2", "ytvideo2", "video2"],
  description: "Download and send YouTube videos as video files",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    
    try {
      // Add reaction
      await sock.sendMessage(jid, {
        react: { text: '🎬', key: m.key }
      });

      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎬 *YouTube Video Downloader*\n\nUsage:\n• \`video2 song name\`\n• \`video2 https://youtube.com/...\`\n\nAdd \`-low\` for smaller file size\nExample: video2 Not Like Us -low`
        }, { quoted: m });
        return;
      }

      // Check for quality flag
      const qualityFlag = args.includes('-low') ? 'low' : 
                         args.includes('-medium') ? 'medium' : 
                         args.includes('-high') ? 'high' : 'auto';
      
      // Remove flags from search query
      const searchQuery = args.filter(arg => !arg.startsWith('-')).join(" ");
      
      // Check query length
      if (searchQuery.length > 100) {
        await sock.sendMessage(jid, { 
          text: `📝 Input too long! Max 100 characters.`,
          quoted: m 
        });
        return;
      }
      
      console.log(`🎬 [VIDEO2] Request: "${searchQuery}" (Quality: ${qualityFlag})`);

      // Send initial status
      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"\n⚡ Looking for video...`
      }, { quoted: m });

      let videoUrl = '';
      let videoTitle = '';
      let videoThumbnail = '';
      let videoId = '';
      let videoDuration = 0;

      // Check if input is a YouTube URL
      if (searchQuery.match(/(youtube\.com|youtu\.be)/i)) {
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
          console.log("⚠️ [VIDEO2] Could not fetch video info:", infoError.message);
        }
      } else {
        // Search for video
        try {
          await sock.sendMessage(jid, { 
            text: `🔍 *Searching*: "${searchQuery}"\n📡 Looking for best match...`,
            edit: statusMsg.key 
          });
          
          const { videos } = await yts(searchQuery);
          if (!videos || videos.length === 0) {
            await sock.sendMessage(jid, { 
              text: `😕 Couldn't find that video. Try another one!`,
              edit: statusMsg.key 
            });
            return;
          }
          
          videoUrl = videos[0].url;
          videoTitle = videos[0].title;
          videoDuration = videos[0].duration?.seconds || 0;
          videoThumbnail = videos[0].thumbnail;
          videoId = extractYouTubeId(videoUrl);
          
          console.log(`🎬 [VIDEO2] Found: ${videoTitle} (${videoDuration}s) - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [VIDEO2] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: video2 https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Estimate file size
      const estimatedSize = estimateVideoSize(videoDuration, qualityFlag === 'low' ? '240p' : '360p');
      
      if (estimatedSize > 16 && qualityFlag !== 'low') {
        await sock.sendMessage(jid, { 
          text: `⚠️ *Warning:* Estimated size: ${estimatedSize}MB\nThis might exceed WhatsApp limit.\nTry with \`-low\` flag for smaller size.`,
          edit: statusMsg.key 
        });
      }

      // Try multiple APIs sequentially with quality preference
      let videoResult = null;
      let apisToTry;
      
      if (qualityFlag === 'low') {
        // Try low quality APIs first
        apisToTry = [
          () => lowQualityAPIs.ytdl.getVideo(videoUrl, 'lowest'),
          () => lowQualityAPIs.yt5s.getVideo(videoUrl, '240p'),
          () => videoAPIs.keith.getVideo(videoUrl),
          () => videoAPIs.yupra.getVideo(videoUrl),
          () => videoAPIs.okatsu.getVideo(videoUrl)
        ];
      } else {
        // Default: try all APIs
        apisToTry = [
          () => lowQualityAPIs.ytdl.getVideo(videoUrl, 'lowest'),
          () => lowQualityAPIs.yt5s.getVideo(videoUrl, '360p'),
          () => videoAPIs.keith.getVideo(videoUrl),
          () => videoAPIs.yupra.getVideo(videoUrl),
          () => videoAPIs.okatsu.getVideo(videoUrl)
        ];
      }
      
      for (let i = 0; i < apisToTry.length; i++) {
        const apiCall = apisToTry[i];
        const apiName = i < 2 ? Object.keys(lowQualityAPIs)[i] : Object.keys(videoAPIs)[i-2];
        
        try {
          console.log(`🎬 [VIDEO2] Trying ${apiName} API...`);
          
          await sock.sendMessage(jid, { 
            text: `✅ *Found:* ${videoTitle}\n⬇️ *Getting download link...*\n⚡ Using ${apiName} API...`,
            edit: statusMsg.key 
          });
          
          const result = await apiCall();
          
          if (result.success) {
            videoResult = result;
            console.log(`✅ [VIDEO2] Got link from ${result.source} (${result.quality}): ${result.download.substring(0, 50)}...`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [VIDEO2] ${apiName} API failed:`, apiError.message);
          continue;
        }
      }

      if (!videoResult) {
        await sock.sendMessage(jid, { 
          text: `❌ All download services failed!\nPlease try again later.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* ${videoTitle}\n✅ *Download link ready* (${videoResult.quality})\n📥 *Downloading video...*`,
        edit: statusMsg.key 
      });

      // Download the video file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const fileName = `video2_${Date.now()}.mp4`;
      const tempFile = path.join(tempDir, fileName);
      
      try {
        // Download video with progress tracking
        const response = await axios({
          url: videoResult.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 180000, // 3 minute timeout for videos
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
          // Log progress every 1MB
          if (totalBytes && downloadedBytes % (1 * 1024 * 1024) < chunk.length) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            console.log(`📥 [VIDEO2] Download: ${percent}% (${Math.round(downloadedBytes/1024/1024)}MB)`);
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
          throw new Error("Download failed or empty file!");
        }

        // WhatsApp video limit is ~16MB
        if (parseFloat(fileSizeMB) > 16) {
          await sock.sendMessage(jid, { 
            text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 16MB\nTry with \`-low\` flag: \`video2 ${searchQuery} -low\``,
            edit: statusMsg.key 
          });
          
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Send video preview message
        await sock.sendMessage(jid, { 
          text: `_🎥 Playing:_\n _${videoTitle}_`,
          edit: statusMsg.key 
        });

        // Send the video as VIDEO (not document)
        await sock.sendMessage(jid, {
          video: fs.readFileSync(tempFile),
          caption: `🎬 *${videoTitle}*\n📹 ${videoResult.quality} • ${fileSizeMB}MB\n⚡ Source: ${videoResult.source}\n\n> WolfBot`,
          mimetype: 'video/mp4',
          fileName: `${videoTitle.substring(0, 50)}.mp4`.replace(/[^\w\s.-]/gi, ''),
          contextInfo: {
            externalAdReply: {
              title: videoTitle.substring(0, 70),
              body: 'YouTube Video • WolfBot',
              mediaType: 2,
              thumbnailUrl: videoThumbnail,
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
          console.log(`✅ [VIDEO2] Cleaned up: ${tempFile}`);
        }

        // Success message
        console.log(`✅ [VIDEO2] Success: ${videoTitle} (${fileSizeMB}MB, ${videoResult.quality})`);

      } catch (downloadError) {
        console.error("❌ [VIDEO2] Download error:", downloadError);
        
        let errorMsg = `🚫 Error downloading video`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg = `⏱ Download timed out. Video might be too long.`;
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg = `🌐 Network error. Check your connection.`;
        } else if (downloadError.message.includes('file is empty')) {
          errorMsg = `📦 Download failed. Try again.`;
        }
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [VIDEO2] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [VIDEO2] Fatal error:", error);
      
      await sock.sendMessage(jid, { 
        text: `🚫 Error: ${error.message}`,
        quoted: m 
      });
    }
  }
};