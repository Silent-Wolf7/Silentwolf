// commands/tools/screenshot.js
import fetch from "node-fetch";

export default {
  name: "ss",
  alias: ["screenshot", "capture", "webshot", "sc"],
  desc: "Capture website screenshots 📸",
  category: "Tools",
  usage: ".ss <website-url> [--full/--mobile/--delay=3]",
  cooldown: 10,

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();

    try {
      // Help message
      if (!query || query === 'help') {
        return sock.sendMessage(jid, {
          text: `📸 *WolfBot Screenshot* 🌐\n\n` +
                `Capture screenshots of any website\n\n` +
                `*Usage:*\n` +
                `.ss https://example.com\n` +
                `.ss google.com\n\n` +
                `*Options:*\n` +
                `• --full : Full page screenshot\n` +
                `• --mobile : Mobile view (375px)\n` +
                `• --desktop : Desktop view (1920px)\n` +
                `• --delay=3 : Wait 3 seconds before capture\n` +
                `• --pdf : Capture as PDF\n\n` +
                `*Examples:*\n` +
                `.ss github.com\n` +
                `.ss vercel.app --mobile\n` +
                `.ss netlify.app --full\n` +
                `.ss render.com --delay=5\n\n` +
                `*Supported:*\n` +
                `✅ Vercel, Render, Netlify\n` +
                `✅ Firebase, Heroku, AWS\n` +
                `✅ All public websites\n\n` +
                `🐺 *WolfBot Web Tools*`
        }, { quoted: m });
      }

      // Parse options
      let url = query;
      let options = {
        fullPage: false,
        mobile: false,
        desktop: true,
        delay: 2,
        format: 'image',
        width: 1920,
        height: 1080
      };

      // Parse flags
      if (url.includes('--full')) {
        options.fullPage = true;
        url = url.replace('--full', '').trim();
      }
      if (url.includes('--mobile')) {
        options.mobile = true;
        options.desktop = false;
        options.width = 375;
        url = url.replace('--mobile', '').trim();
      }
      if (url.includes('--desktop')) {
        options.desktop = true;
        options.mobile = false;
        options.width = 1920;
        url = url.replace('--desktop', '').trim();
      }
      if (url.includes('--pdf')) {
        options.format = 'pdf';
        url = url.replace('--pdf', '').trim();
      }
      
      // Parse delay
      const delayMatch = url.match(/--delay=(\d+)/);
      if (delayMatch) {
        options.delay = parseInt(delayMatch[1]);
        url = url.replace(delayMatch[0], '').trim();
      }

      // Validate and clean URL
      url = cleanUrl(url);
      if (!url) {
        return sock.sendMessage(jid, {
          text: `❌ *Invalid URL*\n\n` +
                `Please provide a valid website URL.\n` +
                `Example: .ss google.com`
        }, { quoted: m });
      }

      // Check URL safety (basic)
      if (isBlockedUrl(url)) {
        return sock.sendMessage(jid, {
          text: `🚫 *Blocked URL*\n\n` +
                `This URL cannot be captured for security reasons.\n` +
                `Try a different website.`
        }, { quoted: m });
      }

      // Send processing message
      const processingMsg = await sock.sendMessage(jid, {
        text: `📸 *Capturing screenshot...*\n\n` +
              `Website: ${url}\n` +
              `View: ${options.mobile ? 'Mobile' : 'Desktop'}\n` +
              `Delay: ${options.delay}s\n` +
              `Full page: ${options.fullPage ? 'Yes' : 'No'}\n\n` +
              `Please wait...`
      }, { quoted: m });

      // Capture screenshot using multiple services (fallback)
      const result = await captureScreenshot(url, options);

      if (!result.success) {
        // Try alternative service
        const fallbackResult = await captureScreenshotFallback(url, options);
        
        if (!fallbackResult.success) {
          return sock.sendMessage(jid, {
            text: `❌ *Capture Failed*\n\n` +
                  `*Website:* ${url}\n` +
                  `*Error:* ${result.error || fallbackResult.error}\n\n` +
                  `*Possible Issues:*\n` +
                  `• Website blocked screenshots\n` +
                  `• Site requires authentication\n` +
                  `• URL is private/internal\n` +
                  `• Server timeout\n\n` +
                  `💡 *Try:*\n` +
                  `• Different URL\n` +
                  `• Shorter delay (--delay=1)\n` +
                  `• Mobile view (--mobile)`,
            edit: processingMsg.key
          });
        }
        
        // Use fallback result
        return await sendScreenshot(sock, jid, fallbackResult, url, options, processingMsg, m);
      }

      // Send successful result
      await sendScreenshot(sock, jid, result, url, options, processingMsg, m);

    } catch (err) {
      console.error("❌ [SCREENSHOT ERROR]:", err);
      
      await sock.sendMessage(jid, {
        text: `📸 *Screenshot Error*\n\n` +
              `*Details:* ${err.message}\n\n` +
              `🔧 *Try:*\n` +
              `• Check the URL format\n` +
              `• Use --delay=5 for slow sites\n` +
              `• Try mobile view (--mobile)\n` +
              `• Contact admin if persists`
      }, { quoted: m });
    }
  }
};

// ============================================
// SCREENSHOT CAPTURE FUNCTIONS
// ============================================

async function captureScreenshot(url, options = {}) {
  // Try multiple screenshot services with fallbacks
  
  const services = [
    {
      name: "ScreenshotAPI.net",
      function: captureWithScreenshotAPI,
      priority: 1
    },
    {
      name: "ScreenshotLayer",
      function: captureWithScreenshotLayer,
      priority: 2
    },
    {
      name: "APIFlash",
      function: captureWithAPIFlash,
      priority: 3
    },
    {
      name: "html2canvas (self-hosted)",
      function: captureWithHtml2Canvas,
      priority: 4
    }
  ];

  // Try services in priority order
  for (const service of services.sort((a, b) => a.priority - b.priority)) {
    try {
      console.log(`Trying screenshot service: ${service.name}`);
      const result = await service.function(url, options);
      
      if (result.success) {
        result.service = service.name;
        return result;
      }
      
      console.log(`${service.name} failed: ${result.error}`);
    } catch (error) {
      console.log(`${service.name} error: ${error.message}`);
    }
  }

  return {
    success: false,
    error: "All screenshot services failed"
  };
}

// Service 1: ScreenshotAPI.net (Free tier available)
async function captureWithScreenshotAPI(url, options) {
  try {
    // You can get a free API key from https://screenshotapi.net
    const apiKey = getScreenshotAPIKey(); // Embedded or from env
    
    const params = new URLSearchParams({
      url: url,
      full_page: options.fullPage ? 'true' : 'false',
      width: options.width.toString(),
      delay: options.delay.toString(),
      format: 'png',
      fresh: 'true'
    });

    if (options.mobile) {
      params.append('user_agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    }

    const response = await fetch(
      `https://shot.screenshotapi.net/screenshot?${params.toString()}`,
      {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
        timeout: 30000
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const buffer = await response.buffer();
    
    if (buffer.length < 100) {
      throw new Error("Received empty/invalid image");
    }

    return {
      success: true,
      image: buffer,
      format: 'png',
      size: buffer.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Service 2: ScreenshotLayer (Alternative)
async function captureWithScreenshotLayer(url, options) {
  try {
    // Free tier: https://screenshotlayer.com
    const accessKey = "YOUR_ACCESS_KEY"; // Get from screenshotlayer.com
    
    const params = new URLSearchParams({
      url: url,
      viewport: `${options.width}x${options.height}`,
      delay: options.delay,
      fullpage: options.fullPage ? 1 : 0,
      format: 'PNG'
    });

    const response = await fetch(
      `http://api.screenshotlayer.com/api/capture?access_key=${accessKey}&${params.toString()}`,
      { timeout: 30000 }
    );

    const buffer = await response.buffer();
    
    if (buffer.length < 100 || buffer.toString().includes('error')) {
      throw new Error("ScreenshotLayer error");
    }

    return {
      success: true,
      image: buffer,
      format: 'png'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Service 3: APIFlash (High quality)
async function captureWithAPIFlash(url, options) {
  try {
    // Free trial: https://apiflash.com
    const apiKey = "YOUR_API_KEY"; // Get from apiflash.com
    
    const params = new URLSearchParams({
      url: url,
      width: options.width,
      height: options.height,
      delay: options.delay,
      full_page: options.fullPage,
      format: 'png',
      freshness: 'no_cache',
      user_agent: options.mobile ? 
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' : 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const response = await fetch(
      `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&${params.toString()}`,
      { timeout: 30000 }
    );

    const buffer = await response.buffer();
    
    return {
      success: true,
      image: buffer,
      format: 'png'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Service 4: Self-hosted html2canvas alternative
async function captureWithHtml2Canvas(url, options) {
  try {
    // Use a public html2canvas service
    const response = await fetch("https://html2canvas.vercel.app/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url,
        options: {
          width: options.width,
          height: options.height,
          scale: 1,
          useCORS: true,
          allowTaint: true
        }
      }),
      timeout: 45000
    });

    if (!response.ok) {
      throw new Error(`Self-hosted error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.image) {
      const buffer = Buffer.from(data.image.split(',')[1], 'base64');
      return {
        success: true,
        image: buffer,
        format: 'png'
      };
    }

    throw new Error("No image in response");

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Fallback service
async function captureScreenshotFallback(url, options) {
  try {
    // Try a different approach - use browserless.io style
    const response = await fetch(
      `https://r.jina.ai/${url}`,
      {
        headers: {
          'Accept': 'image/png',
          'X-With-Screenshot': 'true',
          'X-Viewport-Width': options.width.toString(),
          'X-Viewport-Height': options.height.toString(),
          'X-Wait-For': options.delay.toString()
        },
        timeout: 30000
      }
    );

    if (response.ok) {
      const buffer = await response.buffer();
      return {
        success: true,
        image: buffer,
        format: 'png',
        service: 'Jina AI'
      };
    }

    return {
      success: false,
      error: "Fallback service failed"
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function cleanUrl(input) {
  if (!input) return null;
  
  // Remove any command prefixes
  input = input.replace(/^\.ss\s*/, '').replace(/^\.screenshot\s*/, '');
  
  // Add https:// if missing
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    input = 'https://' + input;
  }
  
  // Validate URL format
  try {
    const url = new URL(input);
    
    // Block certain protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    
    // Block localhost/internal IPs
    if (url.hostname === 'localhost' || 
        url.hostname.startsWith('127.') || 
        url.hostname.startsWith('192.168.') ||
        url.hostname.startsWith('10.')) {
      return null;
    }
    
    return url.toString();
  } catch {
    return null;
  }
}

function isBlockedUrl(url) {
  const blockedDomains = [
    'localhost',
    '127.0.0.1',
    '192.168.',
    '10.',
    '172.16.',
    'admin.',
    'internal.',
    'intranet.',
    '.local'
  ];
  
  const lowerUrl = url.toLowerCase();
  return blockedDomains.some(domain => lowerUrl.includes(domain));
}

async function sendScreenshot(sock, jid, result, url, options, processingMsg, originalMessage) {
  const fileSizeMB = (result.size || result.image.length) / (1024 * 1024);
  const caption = `📸 *Website Screenshot*\n\n` +
                  `🌐 *URL:* ${url}\n` +
                  `📱 *View:* ${options.mobile ? 'Mobile' : 'Desktop'}\n` +
                  `📏 *Size:* ${options.width}×${options.height}\n` +
                  `📄 *Full page:* ${options.fullPage ? 'Yes' : 'No'}\n` +
                  `⏱️ *Delay:* ${options.delay}s\n` +
                  `💾 *File size:* ${fileSizeMB.toFixed(2)} MB\n` +
                  `🔧 *Service:* ${result.service || 'Screenshot API'}\n\n` +
                  `🐺 *WolfBot Web Tools*`;
  
  try {
    // Send as image
    await sock.sendMessage(
      jid,
      {
        image: result.image,
        caption: caption,
        mimetype: 'image/png'
      },
      { quoted: originalMessage }
    );
    
    // Try to delete processing message (if supported)
    try {
      await sock.sendMessage(
        jid,
        { delete: processingMsg.key }
      );
    } catch (deleteError) {
      // Ignore delete errors
      console.log("Could not delete processing message:", deleteError.message);
    }
    
  } catch (sendError) {
    console.error("Send error:", sendError);
    
    // Try alternative send method
    await sock.sendMessage(
      jid,
      {
        text: `${caption}\n\n⚠️ *Could not send image, here's text result:*\n\n` +
              `✅ Screenshot captured successfully!\n` +
              `📸 URL: ${url}\n` +
              `📊 Size: ${fileSizeMB.toFixed(2)} MB\n` +
              `🔧 Use browser to view: ${url}`
      },
      { quoted: originalMessage }
    );
  }
}

// ============================================
// API KEY MANAGEMENT
// ============================================

function getScreenshotAPIKey() {
  // You can embed an API key here or use environment variable
  // Get free key from: https://screenshotapi.net/pricing (free tier available)
  
  // Method 1: Embedded key (obfuscated)
  const keyParts = [
    // Example: "your_api_key_here"
    [121, 111, 117, 114, 95, 97, 112, 105, 95, 107, 101, 121, 95, 104, 101, 114, 101]
  ];
  
  const apiKey = keyParts.map(part => 
    part.map(c => String.fromCharCode(c)).join('')
  ).join('');
  
  return apiKey || process.env.SCREENSHOT_API_KEY;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const screenshotUtils = {
  capture: async (url, options = {}) => {
    return await captureScreenshot(url, options);
  },

  supportedServices: () => {
    return [
      { name: "ScreenshotAPI.net", free: true, limit: "100/month free" },
      { name: "ScreenshotLayer", free: true, limit: "100/month free" },
      { name: "APIFlash", free: true, limit: "100 free trial" },
      { name: "Self-hosted", free: true, limit: "Unlimited" }
    ];
  },

  testService: async (service = "screenshotapi") => {
    try {
      const testUrl = "https://example.com";
      const options = { width: 1024, height: 768, delay: 2 };
      
      let result;
      switch(service) {
        case "screenshotlayer":
          result = await captureWithScreenshotLayer(testUrl, options);
          break;
        case "apiflash":
          result = await captureWithAPIFlash(testUrl, options);
          break;
        default:
          result = await captureWithScreenshotAPI(testUrl, options);
      }
      
      return {
        success: result.success,
        service: service,
        message: result.success ? 'Service working' : result.error
      };
    } catch (error) {
      return {
        success: false,
        service: service,
        message: error.message
      };
    }
  },

  getUrlInfo: (url) => {
    try {
      const urlObj = new URL(url);
      return {
        hostname: urlObj.hostname,
        protocol: urlObj.protocol,
        port: urlObj.port,
        pathname: urlObj.pathname,
        isSecure: urlObj.protocol === 'https:',
        isPublic: !isBlockedUrl(url)
      };
    } catch {
      return null;
    }
  },

  // Batch capture multiple URLs
  batchCapture: async (urls, options = {}) => {
    const results = [];
    for (const url of urls) {
      const result = await captureScreenshot(url, options);
      results.push({ url, ...result });
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return results;
  }
};