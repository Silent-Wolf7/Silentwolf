import axios from 'axios';

export default {
  name: 'screenshot',
  description: 'Take a screenshot of any website',
  category: 'tools',
  aliases: ['ss', 'webshot', 'webcapture', 'capture', 'snapshot', 'screengrab', 'websnap'],
  usage: 'screenshot [website_url]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const senderJid = m.key.participant || jid;
    
    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === 'help') {
      const helpText = `📸 *WEBSITE SCREENSHOT*\n` +
        `⚡ *Capture any website as an image*\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}screenshot https://website.com\`\n` +
        `• \`${PREFIX}ss google.com\`\n` +
        `• \`${PREFIX}webshot example.com\`\n` +
       ``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    let url = args.join(' ').trim();
    
    // Validate URL
    if (!url) {
      return sock.sendMessage(jid, {
        text: `❌ *URL Required*\n\nPlease provide a website URL.\nExample: ${PREFIX}screenshot https://google.com`
      }, { quoted: m });
    }
    
    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return sock.sendMessage(jid, {
        text: `❌ *Invalid URL*\n\n"${url}" is not a valid URL.\n\nPlease use format: https://example.com`
      }, { quoted: m });
    }

    try {
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `📸 *WEBSITE SCREENSHOT*\n\n` +
              `🚀 *Capturing website...*\n\n` +
              `🔗 ${url}\n\n` +
              `⏳ Please wait...`
      }, { quoted: m });

      // ====== API REQUEST (Using Keith's Screenshot API) ======
      const apiUrl = 'https://apiskeith.vercel.app/tool/screenshot';
      
      console.log(`📸 Screenshot Request for: ${url}`);
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          url: url
        },
        timeout: 45000, // 45 seconds for screenshots
        responseType: 'arraybuffer', // Important for images
        headers: {
          'User-Agent': 'WolfBot-Screenshot/1.0',
          'Accept': 'image/*',
          'X-Requested-With': 'WolfBot',
          'Referer': 'https://apiskeith.vercel.app/',
          'Origin': 'https://apiskeith.vercel.app'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      console.log(`✅ Screenshot Response status: ${response.status}`);
      console.log(`📊 Response size: ${response.data?.length || 0} bytes`);
      
      // Check if response is an image
      const contentType = response.headers['content-type'] || '';
      const isImage = contentType.includes('image/');
      
      if (!isImage) {
        throw new Error('API did not return an image');
      }
      
      // Check image size
      const imageSize = response.data.length;
      if (imageSize < 1000) {
        throw new Error('Screenshot too small or invalid');
      }
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `📸 *WEBSITE SCREENSHOT*\n` +
              `🚀 *Capturing...* ✅\n` +
              `🖼️ *Processing image...*\n` +
              `⚡ *Sending screenshot...*`,
        edit: statusMsg.key
      });

      // ====== DETECT IMAGE FORMAT ======
      let imageFormat = 'jpeg';
      if (contentType.includes('png')) imageFormat = 'png';
      if (contentType.includes('gif')) imageFormat = 'gif';
      if (contentType.includes('webp')) imageFormat = 'webp';
      
      // ====== CREATE CAPTION ======
      const domain = new URL(url).hostname;
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const fileSize = formatBytes(imageSize);
      
      const caption = `📸 *WEBSITE SCREENSHOT*\n\n` +
                     `🌐 *Website:* ${domain}\n` +
                     `🔗 *URL:* ${url}\n` +
                     `📅 *Captured:* ${timestamp}\n` +
                     `💾 *Size:* ${fileSize}\n` +
                     `🖼️ *Format:* ${imageFormat.toUpperCase()}\n\n` +
                     `⚡ *Powered by WolfBot*`;

      // ====== SEND SCREENSHOT ======
      console.log(`📤 Sending screenshot to WhatsApp (${fileSize})`);
      
      await sock.sendMessage(jid, {
        image: response.data,
        caption: caption,
        mimetype: contentType,
        fileName: `screenshot_${domain}_${Date.now()}.${imageFormat}`
      }, { quoted: m });

      console.log(`✅ Screenshot sent successfully for ${domain}`);

    } catch (error) {
      console.error('❌ [Screenshot] ERROR:', error);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = `❌ *SCREENSHOT FAILED*\n\n`;
      
      // Detailed error handling
      if (error.code === 'ECONNREFUSED') {
        errorMessage += `• Screenshot API server is down\n`;
        errorMessage += `• Please try again later\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• Request timed out (45s)\n`;
        errorMessage += `• Website may be loading slowly\n`;
        errorMessage += `• Try smaller/simpler website\n`;
      } else if (error.code === 'ENOTFOUND') {
        errorMessage += `• Cannot connect to website\n`;
        errorMessage += `• Check if website exists: ${url}\n`;
        errorMessage += `• Check internet connection\n`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += `• Connection aborted\n`;
        errorMessage += `• Network issue detected\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Rate limit exceeded\n`;
        errorMessage += `• Too many screenshot requests\n`;
        errorMessage += `• Wait 2-3 minutes\n`;
      } else if (error.response?.status === 404) {
        errorMessage += `• Screenshot endpoint not found\n`;
        errorMessage += `• API may have changed\n`;
      } else if (error.response?.status === 500) {
        errorMessage += `• Screenshot service error\n`;
        errorMessage += `• Website may be blocking screenshots\n`;
      } else if (error.response?.status === 403) {
        errorMessage += `• Access forbidden\n`;
        errorMessage += `• Website blocks screenshots\n`;
        errorMessage += `• Try different website\n`;
      } else if (error.response?.status === 400) {
        errorMessage += `• Bad request\n`;
        errorMessage += `• URL may be invalid: ${url}\n`;
      } else if (error.message?.includes('Invalid URL')) {
        errorMessage += `• Invalid URL format\n`;
        errorMessage += `• Use: https://example.com\n`;
      } else if (error.message?.includes('did not return an image')) {
        errorMessage += `• API returned non-image content\n`;
        errorMessage += `• Screenshot service may be down\n`;
      } else if (error.message?.includes('too small')) {
        errorMessage += `• Screenshot too small\n`;
        errorMessage += `• Website may be empty/blocked\n`;
      } else if (error.message) {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n🔧 *Troubleshooting:*\n`;
      errorMessage += `1. Check URL: ${url}\n`;
      errorMessage += `2. Try without https:// (auto-added)\n`;
      errorMessage += `3. Wait 1-2 minutes before retry\n`;
      errorMessage += `4. Try popular websites first:\n`;
      errorMessage += `   • google.com\n`;
      errorMessage += `   • github.com\n`;
      errorMessage += `   • wikipedia.org\n`;
      errorMessage += `5. Website may block screenshots\n`;
      
      // Try to send error message
      try {
        console.log('📤 Sending error message to user');
        await sock.sendMessage(jid, {
          text: errorMessage
        }, { quoted: m });
      } catch (sendError) {
        console.error('❌ Failed to send error message:', sendError);
      }
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Format bytes to human readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Validate URL (more thorough)
function validateUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    // Check domain
    if (!url.hostname || url.hostname.length < 3) {
      return false;
    }
    
    // Check for common invalid patterns
    if (url.hostname.includes('..')) {
      return false;
    }
    
    return true;
  } catch (err) {
    return false;
  }
}

// Extract domain from URL for display
function getCleanDomain(url) {
  try {
    const domain = new URL(url).hostname;
    
    // Remove www. prefix
    return domain.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}