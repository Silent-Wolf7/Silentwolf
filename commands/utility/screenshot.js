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
        `• \`${PREFIX}screenshot google.com\`\n` +
        `• \`${PREFIX}screenshot example.com\`\n\n` +
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

    // Extract domain for display
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      domain = url;
    }

    try {
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `📸 *WEBSITE SCREENSHOT*\n\n` +
              `🚀 *Preparing to capture...*\n\n` +
              `🔗 ${domain}\n` +
              `⏳ This may take 10-20 seconds...`
      }, { quoted: m });

      // ====== TRY MULTIPLE SCREENSHOT SERVICES ======
      let screenshotBuffer = null;
      let serviceUsed = '';
      let attempts = [];
      
      // List of screenshot services to try (in order)
      const screenshotServices = [
        {
          name: 'Keith API',
          url: 'https://apiskeith.vercel.app/tool/screenshot',
          method: 'GET',
          params: { url: url },
          timeout: 15000, // 15 seconds max per attempt
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/*',
            'Referer': 'https://apiskeith.vercel.app/'
          }
        },
        {
          name: 'ScreenshotAPI.net',
          url: `https://shot.screenshotapi.net/screenshot`,
          method: 'GET',
          params: {
            url: url,
            token: 'SCREENSHOTAPI-TOKEN', // Free tier works without token for limited requests
            output: 'image',
            file_type: 'png',
            wait_for_event: 'load'
          },
          timeout: 20000
        },
        {
          name: 'PhantomJSCloud (Alternative)',
          url: 'https://phantomjscloud.com/api/browser/v2/demo/',
          method: 'POST',
          data: {
            url: url,
            renderType: 'png',
            width: 1280,
            height: 800
          },
          timeout: 25000
        }
      ];

      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `📸 *WEBSITE SCREENSHOT*\n` +
              `🔗 ${domain}\n` +
              `🔍 *Trying service 1/3...*\n` +
              `⏳ Please wait...`,
        edit: statusMsg.key
      });

      // Try each service until one works
      for (let i = 0; i < screenshotServices.length; i++) {
        const service = screenshotServices[i];
        
        try {
          console.log(`📸 Trying screenshot service ${i+1}: ${service.name}`);
          
          await sock.sendMessage(jid, {
            text: `📸 *WEBSITE SCREENSHOT*\n` +
                  `🔗 ${domain}\n` +
                  `🔍 *Trying service ${i+1}/3: ${service.name}...*\n` +
                  `⏳ ${i === 0 ? 'First attempt...' : 'Alternative service...'}`,
            edit: statusMsg.key
          });
          
          const response = await axios({
            method: service.method,
            url: service.url,
            params: service.params,
            data: service.data,
            timeout: service.timeout || 15000,
            responseType: 'arraybuffer',
            headers: service.headers || {
              'User-Agent': 'WolfBot-Screenshot/1.0',
              'Accept': 'image/*'
            }
          });

          // Check if response is an image
          const contentType = response.headers['content-type'] || '';
          const isImage = contentType.includes('image/');
          
          if (!isImage) {
            console.log(`❌ Service ${service.name} returned non-image: ${contentType}`);
            attempts.push(`${service.name}: Wrong content type (${contentType})`);
            continue;
          }
          
          // Check image size (should be reasonable)
          if (response.data.length < 5000) {
            console.log(`❌ Service ${service.name} returned tiny image: ${response.data.length} bytes`);
            attempts.push(`${service.name}: Image too small (${response.data.length} bytes)`);
            continue;
          }
          
          // Success!
          screenshotBuffer = response.data;
          serviceUsed = service.name;
          console.log(`✅ Service ${service.name} worked! Image size: ${response.data.length} bytes`);
          break;
          
        } catch (serviceError) {
          console.log(`❌ Service ${service.name} failed:`, serviceError.message);
          attempts.push(`${service.name}: ${serviceError.message.substring(0, 50)}`);
          
          // Continue to next service
          continue;
        }
      }

      // ====== CHECK IF ANY SERVICE WORKED ======
      if (!screenshotBuffer) {
        throw new Error(`All screenshot services failed:\n${attempts.join('\n')}`);
      }
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `📸 *WEBSITE SCREENSHOT*\n` +
              `✅ *Capture successful!*\n` +
              `🖼️ *Processing image...*\n` +
              `📤 *Sending to WhatsApp...*`,
        edit: statusMsg.key
      });

      // ====== CREATE CAPTION ======
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const fileSize = formatBytes(screenshotBuffer.length);
      
      const caption = `📸 *WEBSITE SCREENSHOT*\n\n` +
                     `🌐 *Website:* ${domain}\n` +
                     `🔗 *URL:* ${url}\n` +
                     `📅 *Captured:* ${timestamp}\n` +
                     `💾 *Size:* ${fileSize}\n` +
                     `🔧 *Service:* ${serviceUsed}\n` +
                     `⏱️ *Time:* ${now.getTime() - statusMsg.messageTimestamp * 1000}ms\n\n` +
                     `⚡ *Powered by WolfBot*`;

      // ====== SEND SCREENSHOT ======
      console.log(`📤 Sending screenshot to WhatsApp (${fileSize}, ${serviceUsed})`);
      
      await sock.sendMessage(jid, {
        image: screenshotBuffer,
        caption: caption,
        mimetype: 'image/png',
        fileName: `screenshot_${domain}_${Date.now()}.png`
      }, { quoted: m });

      console.log(`✅ Screenshot sent successfully for ${domain} using ${serviceUsed}`);

    } catch (error) {
      console.error('❌ [Screenshot] ERROR:', error.message);
      
      let errorMessage = `❌ *SCREENSHOT FAILED*\n\n`;
      
      // Detailed error handling
      if (error.message.includes('All screenshot services failed')) {
        errorMessage += `• All screenshot services are unavailable\n`;
        errorMessage += `• Common reasons:\n`;
        errorMessage += `   - Website blocks screenshots\n`;
        errorMessage += `   - Services rate-limited\n`;
        errorMessage += `   - Website requires JavaScript\n`;
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage += `• Request timed out\n`;
        errorMessage += `• Website may be:\n`;
        errorMessage += `   - Loading slowly\n`;
        errorMessage += `   - Too complex\n`;
        errorMessage += `   - Blocking bots\n`;
      } else if (error.code === 'ENOTFOUND') {
        errorMessage += `• Website not found: ${domain}\n`;
        errorMessage += `• Check if website exists\n`;
        errorMessage += `• Try: google.com, github.com\n`;
      } else if (error.response?.status === 403 || error.response?.status === 429) {
        errorMessage += `• Access blocked/rate-limited\n`;
        errorMessage += `• Website may block screenshots\n`;
        errorMessage += `• Try different website\n`;
      } else {
        errorMessage += `• Error: ${error.message.substring(0, 100)}\n`;
      }
      
      errorMessage += `\n🔧 *Troubleshooting:*\n`;
      errorMessage += `1. Try simpler websites:\n`;
      errorMessage += `   • google.com\n`;
      errorMessage += `   • wikipedia.org\n`;
      errorMessage += `   • github.com\n`;
      errorMessage += `2. Wait 1 minute before retry\n`;
      errorMessage += `3. Try without https://\n`;
      errorMessage += `4. Some sites block screenshots\n`;
      
      // Add attempts log if available
      if (error.message.includes('All screenshot services failed') && error.message.includes('\n')) {
        const attemptsLog = error.message.split('\n').slice(1).join('\n');
        errorMessage += `\n📊 *Attempts:*\n${attemptsLog.substring(0, 200)}`;
      }
      
      // Try to send error message
      try {
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

// Alternative screenshot function using browserless
async function tryBrowserlessScreenshot(url) {
  try {
    // This would require browserless.io API key
    // Leaving as example for future implementation
    const response = await axios.post('https://chrome.browserless.io/screenshot', {
      url: url,
      options: {
        type: 'png',
        fullPage: true,
        encoding: 'binary'
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer',
      timeout: 20000
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}