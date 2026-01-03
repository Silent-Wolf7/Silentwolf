import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video download APIs
const videoAPIs = {
  izumi: {
    baseURL: "https://api.izumi-slow.xyz",
    getVideo: async (youtubeUrl, quality = "720") => {
      try {
        const apiUrl = `${videoAPIs.izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=${quality}`;
        const res = await axios.get(apiUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        });
        
        if (res?.data?.result?.download) {
          return {
            success: true,
            download: res.data.result.download,
            title: res.data.result.title || "YouTube Video",
            quality: quality,
            source: "izumi"
          };
        }
        throw new Error('Izumi API: No download link');
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
            quality: "720p",
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

// Main command
export default {
  name: "videodoc",
  //aliases: ["vdoc", "docvideo", "ytdoc"],
  description: "Download YouTube videos and send as document (bypasses WhatsApp limits)",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const qualityOptions = ["144", "240", "360", "480", "720", "1080"];
    
    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `📁 *YouTube Video as Document*\n\n*Sends videos as documents for larger size limits*\n\nUsage:\n• \`videodoc [quality] song name\`\n• \`videodoc [quality] https://youtube.com/...\`\n\n*Qualities:* ${qualityOptions.join(", ")}\n\n`
        }, { quoted: m });
        return;
      }

      // Parse quality and search query
      let quality = "720"; // Default
      let searchQuery = args.join(" ");
      
      // Check if first arg is a quality option
      if (qualityOptions.includes(args[0].toLowerCase())) {
        quality = args[0].toLowerCase();
        searchQuery = args.slice(1).join(" ");
      } else if (args[0].startsWith("--quality=") || args[0].startsWith("-q=")) {
        // Alternative format: --quality=720
        const match = args[0].match(/[=](.+)/);
        if (match && qualityOptions.includes(match[1])) {
          quality = match[1];
          searchQuery = args.slice(1).join(" ");
        }
      }

      console.log(`📁 [VIDEODOC] Request: "${searchQuery}" Quality: ${quality}p`);

      // Send initial status
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
        const videoId = extractYouTubeId(videoUrl);
        
        if (!videoId) {
          await sock.sendMessage(jid, { 
            text: `❌ Invalid YouTube URL\nPlease provide a valid YouTube link.`,
            edit: statusMsg.key 
          });
          return;
        }
        
        // Fetch video info
        try {
          await sock.sendMessage(jid, { 
            text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}"\n📊 *Quality:* ${quality}p\n📡 Fetching video info...`,
            edit: statusMsg.key 
          });
          
          const { videos } = await yts({ videoId });
          if (videos && videos.length > 0) {
            videoTitle = videos[0].title;
          } else {
            videoTitle = "YouTube Video";
          }
        } catch (infoError) {
          videoTitle = "YouTube Video";
        }
      } else {
        // Search YouTube
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
          
          console.log(`📁 [VIDEODOC] Found: ${videoTitle} - ${videoUrl}`);
          
          await sock.sendMessage(jid, { 
            text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}" ✅\n🎬 *Found:* ${videoTitle}\n📊 *Quality:* ${quality}p\n⬇️ *Getting download link...*`,
            edit: statusMsg.key 
          });
          
        } catch (searchError) {
          console.error("❌ [VIDEODOC] Search error:", searchError);
          await sock.sendMessage(jid, { 
            text: `❌ Search failed. Please use direct YouTube link.\nExample: videodoc 720 https://youtube.com/watch?v=...`,
            edit: statusMsg.key 
          });
          return;
        }
      }

      // Try multiple APIs sequentially
      let videoResult = null;
      let actualQuality = quality;
      const apisToTry = [
        () => videoAPIs.izumi.getVideo(videoUrl, quality),
        () => videoAPIs.okatsu.getVideo(videoUrl)
      ];
      
      for (const apiCall of apisToTry) {
        try {
          console.log(`📁 [VIDEODOC] Trying API...`);
          const result = await apiCall();
          
          if (result.success) {
            videoResult = result;
            actualQuality = result.quality;
            console.log(`✅ [VIDEODOC] Got link from ${result.source}`);
            break;
          }
        } catch (apiError) {
          console.log(`⚠️ [VIDEODOC] API failed:`, apiError.message);
          continue;
        }
      }

      if (!videoResult) {
        await sock.sendMessage(jid, { 
          text: `❌ All download services failed\nPlease try again later or try different quality.`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status
      await sock.sendMessage(jid, { 
        text: `📁 *Document Mode*\n🔍 *Searching:* "${searchQuery}" ✅\n⬇️ *Getting download link...* ✅\n📥 *Downloading video (${actualQuality})...*`,
        edit: statusMsg.key 
      });

      // Download the video file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const sanitizedTitle = videoTitle.replace(/[^\w\s.-]/gi, '').substring(0, 50);
      const fileName = `${sanitizedTitle}_${actualQuality}.mp4`;
      const tempFile = path.join(tempDir, `${Date.now()}_${fileName}`);
      
      try {
        // Download video
        const response = await axios({
          url: videoResult.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 180000, // 3 minute timeout for larger videos
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
          // Log progress every 10MB
          if (totalBytes && downloadedBytes % (10 * 1024 * 1024) < chunk.length) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            console.log(`📥 [VIDEODOC] Download: ${percent}% (${Math.round(downloadedBytes/1024/1024)}MB)`);
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

        // WhatsApp document limit is around 100MB
        if (parseFloat(fileSizeMB) > 100) {
          await sock.sendMessage(jid, { 
            text: `❌ Video too large: ${fileSizeMB}MB\nMax size: 100MB\nTry lower quality (144-480) or shorter video.`,
            edit: statusMsg.key 
          });
          
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          return;
        }

        // Send as document (no thumbnail)
        await sock.sendMessage(jid, {
          document: fs.readFileSync(tempFile),
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `📁 ${videoTitle}\n📊 ${actualQuality} • ${fileSizeMB}MB\n > WolfBot`
        }, { quoted: m });

        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [VIDEODOC] Cleaned up: ${tempFile}`);
        }

        // Success message
        await sock.sendMessage(jid, { 
          text: `✅ *Video Sent as Document!*\n\n📁 ${videoTitle}\n📊 ${actualQuality} • ${fileSizeMB}MB\n⚡ Source: ${videoResult.source}\n\n*Note:* Open the document to play the video.`,
          edit: statusMsg.key 
        });

        console.log(`✅ [VIDEODOC] Success: ${videoTitle} (${actualQuality}, ${fileSizeMB}MB)`);

      } catch (downloadError) {
        console.error("❌ [VIDEODOC] Download error:", downloadError);
        
        let errorMsg = `❌ Failed to download video (${actualQuality})`;
        
        if (downloadError.message.includes('timeout')) {
          errorMsg += '\n⏱ Download timed out. Try lower quality.';
        } else if (downloadError.message.includes('ENOTFOUND') || downloadError.message.includes('ECONNREFUSED')) {
          errorMsg += '\n🌐 Network error. Check your connection.';
        } else if (downloadError.response?.status === 403) {
          errorMsg += '\n🔒 Access denied. Video might be restricted.';
        } else if (downloadError.message.includes('file is empty')) {
          errorMsg += '\n📦 Downloaded file is empty. Try different quality.';
        }
        
        errorMsg += `\n\n*Tip:* Try lower quality (144, 240, 360) for faster download.`;
        
        await sock.sendMessage(jid, { 
          text: errorMsg,
          edit: statusMsg.key 
        });
        
        // Clean up on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [VIDEODOC] Cleaned up failed: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [VIDEODOC] Fatal error:", error);
      
      await sock.sendMessage(jid, { 
        text: `❌ An error occurred\n💡 Try:\n1. Lower quality (144-480)\n2. Shorter video\n3. Direct YouTube link\n4. Try again later\n\nError: ${error.message.substring(0, 100)}`
      }, { quoted: m });
    }
  },
};