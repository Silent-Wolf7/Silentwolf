
import { igdl } from "ruhend-scraper";
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fs from 'fs';

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

export default {
  name: 'instagram',
  description: 'Download Instagram videos/photos',
  category: 'downloader',

  async execute(sock, m, args) {
    console.log('📷 [INSTAGRAM] Command triggered');
    
    const jid = m.key.remoteJid;
    
    // try {
    //   if (!args || !args[0]) {
    //     await sock.sendMessage(jid, { 
    //       text: `📷 *Instagram Downloader*\n\nUsage: ,instagram <url>\n\nExamples:\n• ,instagram https://instagram.com/reel/xyz\n• ,instagram https://instagram.com/p/xyz\n• ,instagram https://instagram.com/tv/xyz` 
    //     }, { quoted: m });
    //     return;
    //   }


    if (!args || !args[0]) {
  const prefix = ','; // Your bot's prefix
  await sock.sendMessage(jid, { 
    text: `📷 *Instagram Downloader*\n💡 *Usage:*\n• \`${prefix}instagram <url>\`\n\n📌 *Examples:*\n• \`${prefix}instagram https://instagram.com/reel/xyz\n\`` 
  }, { quoted: m });
  return;
}
      const url = args[0];
      console.log(`📷 [INSTAGRAM] URL: ${url}`);
      
      // Validate Instagram URL
      const instagramPatterns = [
        /https?:\/\/(?:www\.)?instagram\.com\//,
        /https?:\/\/(?:www\.)?instagr\.am\//,
        /https?:\/\/(?:www\.)?instagram\.com\/p\//,
        /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
        /https?:\/\/(?:www\.)?instagram\.com\/tv\//
      ];

      const isValidUrl = instagramPatterns.some(pattern => pattern.test(url));
      
      if (!isValidUrl) {
        await sock.sendMessage(jid, { 
          text: "❌ Not a valid Instagram link\n\nProvide: instagram.com/p/... or instagram.com/reel/..."
        }, { quoted: m });
        return;
      }

      // Send processing message
      await sock.sendMessage(jid, { 
        text: `📥 *Downloading from Instagram...*` 
      }, { quoted: m });

      // Check if message has already been processed
      if (processedMessages.has(m.key.id)) {
        console.log(`📷 [INSTAGRAM] Message already processed`);
        return;
      }
      
      processedMessages.add(m.key.id);
      
      // Clean up old message IDs after 5 minutes
      setTimeout(() => {
        processedMessages.delete(m.key.id);
      }, 5 * 60 * 1000);

      // Use ruhend-scraper
      const downloadData = await igdl(url);
      
      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
        return await sock.sendMessage(jid, { 
          text: "❌ No media found at this link\n\nPossible reasons:\n• Private account\n• Content removed\n• Invalid URL"
        }, { quoted: m });
      }

      const mediaData = downloadData.data;
      console.log(`📷 [INSTAGRAM] Found ${mediaData.length} media items`);
      
      // Send first 3 media items
      const maxItems = Math.min(3, mediaData.length);
      let successCount = 0;
      
      for (let i = 0; i < maxItems; i++) {
        const media = mediaData[i];
        const mediaUrl = media.url;

        if (!mediaUrl) continue;

        try {
          // Determine if it's video or image
          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                         media.type === 'video' || 
                         url.includes('/reel/') || 
                         url.includes('/tv/');

          if (isVideo) {
            // Download video to temp file first to check size
            const tempDir = './temp/ig';
            if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
            
            const tempFile = `${tempDir}/ig_${Date.now()}_${i}.mp4`;
            
            await downloadToFile(mediaUrl, tempFile);
            
            const fileSize = fs.statSync(tempFile).size;
            const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
            
            if (parseFloat(sizeMB) > 16) {
              await sock.sendMessage(jid, { 
                text: `⚠️ Video ${i+1} too large: ${sizeMB}MB\nSkipping...` 
              });
              if (existsSync(tempFile)) fs.unlinkSync(tempFile);
              continue;
            }
            
            const videoData = fs.readFileSync(tempFile);
            
            await sock.sendMessage(jid, {
              video: videoData,
              mimetype: "video/mp4",
              caption: i === 0 ? "📷 Instagram Video" : `Part ${i+1}`
            });

            if (existsSync(tempFile)) fs.unlinkSync(tempFile);
            
          } else {
            // For images, send directly
            await sock.sendMessage(jid, {
              image: { url: mediaUrl },
              caption: i === 0 ? "📷 Instagram Photo" : `Photo ${i+1}`
            });
          }
          
          successCount++;
          
          // Small delay between sends
          if (i < maxItems - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (mediaError) {
          console.error(`📷 [INSTAGRAM] Error sending media ${i+1}:`, mediaError.message);
          continue;
        }
      }

      if (successCount > 0) {
        await sock.sendMessage(jid, { 
          //text: `✅ Downloaded ${successCount} item${successCount > 1 ? 's' : ''} successfully!` 
        });
      } else {
        await sock.sendMessage(jid, { 
          text: `❌ Could not download any media\n\n💡 Try manually: https://snapinsta.app` 
        });
      }
      console.error('📷 [INSTAGRAM] Command error:', error);
      
      let errorMsg = "❌ An error occurred while processing the request";
      
      if (error.message.includes('timeout')) {
        errorMsg += "\n⏱ Request timed out";
      } else if (error.message.includes('ENOTFOUND')) {
        errorMsg += "\n🌐 Network error";
      } else if (error.message.includes('scraper')) {
        errorMsg += "\n🔧 Scraper failed";
      }
      
      errorMsg += "\n\n💡 Try: https://snapinsta.app manually";
      
      await sock.sendMessage(jid, { 
        text: errorMsg
      }, { quoted: m });
    }
  };
                   

async function downloadToFile(url, filePath) {
  const writer = createWriteStream(filePath);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 45000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.instagram.com/',
      'Accept': 'video/mp4,video/*,image/*,*/*;q=0.8'
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', (err) => {
      if (existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
    response.data.on('error', (err) => {
      if (existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
  });
} 