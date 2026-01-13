import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { pipeline } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const streamPipeline = promisify(pipeline);

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file extension from content type
function getExtensionFromMime(mimeType) {
  const mimeMap = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/quicktime': 'mov',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/json': 'json',
    'text/plain': 'txt',
    'text/html': 'html',
    'application/pdf': 'pdf'
  };
  
  return mimeMap[mimeType?.toLowerCase()] || 'bin';
}

// Check if URL is valid
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9.-]/gi, '_').substring(0, 100);
}

// Download file
async function downloadFile(url, filePath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  
  const writer = fs.createWriteStream(filePath);
  await streamPipeline(response.data, writer);
  return filePath;
}

export default {
  name: "fetch",
  description: "Fetch data from any API endpoint",
  category: "utility",
  usage: ".fetch <url> [options]\nOptions: -d (download), -j (json), -h (headers), -r (raw), -s (silent)",
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    
    // Show help if no arguments
    if (args.length === 0) {
      const helpMessage = `🎯 *FETCH COMMAND - Advanced API Fetcher*\n\n` +
        `*Usage:*\n` +
        `• .fetch <url> - Fetch data from URL\n` +
        `• .fetch <url> -d - Download media files\n` +
        `• .fetch <url> -j - Pretty JSON format\n` +
        `• .fetch <url> -h - Show response headers\n` +
        `• .fetch <url> -r - Raw response\n` +
        `• .fetch <url> -s - Silent mode (no final message)\n` +
        `• Reply to URL with .fetch\n\n` +
        `*Examples:*\n` +
        `• .fetch https://api.github.com/users/octocat\n` +
        `• .fetch https://apiskeith.vercel.app/download/audio?url=https://youtube.com/watch?v=60ItHLz5WEA -d\n` +
        `• .fetch https://jsonplaceholder.typicode.com/posts/1 -j`;
      
      await sock.sendMessage(jid, { text: helpMessage }, { quoted: m });
      return;
    }
    
    // Parse arguments
    let url = args[0];
    const options = {
      download: args.includes('-d'),
      json: args.includes('-j'),
      headers: args.includes('-h'),
      raw: args.includes('-r'),
      silent: args.includes('-s')
    };
    
    // Extract URL from quoted message
    if (!isValidUrl(url) && m.quoted) {
      const quotedMsg = m.quoted.message;
      let extractedText = '';
      
      if (quotedMsg.conversation) {
        extractedText = quotedMsg.conversation;
      } else if (quotedMsg.extendedTextMessage?.text) {
        extractedText = quotedMsg.extendedTextMessage.text;
      } else if (quotedMsg.imageMessage?.caption) {
        extractedText = quotedMsg.imageMessage.caption;
      } else if (quotedMsg.videoMessage?.caption) {
        extractedText = quotedMsg.videoMessage.caption;
      }
      
      const urlMatch = extractedText.match(/https?:\/\/[^\s<>"']+/);
      if (urlMatch) {
        url = urlMatch[0];
      } else {
        await sock.sendMessage(jid, { text: "❌ *Invalid or Missing URL*\n\nPlease provide a valid URL or reply to a message containing a URL.\n\nExample: .fetch https://example.com" }, { quoted: m });
        return;
      }
    }
    
    // Validate URL
    if (!isValidUrl(url)) {
      await sock.sendMessage(jid, { text: "❌ *Invalid URL Format*\n\nURL must start with http:// or https://\n\nExample: .fetch https://api.example.com/data" }, { quoted: m });
      return;
    }
    
    // Add https if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    try {
      // Send initial processing message
      await sock.sendMessage(jid, { text: `🔍 *Processing request...*\n\nFetching: ${url}` }, { quoted: m });
      
      // Setup fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        throw new Error('Request timeout after 30 seconds');
      }, 30000);
      
      try {
        // Start fetching
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          redirect: 'follow',
          follow: 5
        });
        
        clearTimeout(timeout);
        
        // Get response info
        const status = response.status;
        const statusText = response.statusText;
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');
        
        // Handle different content types
        const isAudio = contentType.includes('audio/');
        const isVideo = contentType.includes('video/');
        const isImage = contentType.includes('image/');
        const isJson = contentType.includes('application/json') || options.json;
        const isText = contentType.includes('text/');
        
        // Handle download option for media
        if ((options.download || isAudio || isVideo || isImage) && (isAudio || isVideo || isImage)) {
          const fileSize = contentLength ? parseInt(contentLength) : 0;
          const maxSize = 50 * 1024 * 1024; // 50MB WhatsApp limit
          
          if (fileSize > maxSize) {
            await sock.sendMessage(jid, {
              text: `❌ *File Too Large*\n\n🔗 ${url}\n📁 File size: ${formatFileSize(fileSize)}\n\n⚠️ WhatsApp limit: 50MB\n💡 Try a smaller file or use direct link.`
            }, { quoted: m });
            return;
          }
          
          // Create temp directory
          const tempDir = path.join(process.cwd(), 'temp_fetch');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          // Extract filename
          let filename = 'downloaded_file';
          const urlPath = new URL(url).pathname;
          const urlFilename = urlPath.split('/').pop();
          if (urlFilename && urlFilename.includes('.')) {
            filename = urlFilename;
          } else {
            filename = `download_${Date.now()}.${getExtensionFromMime(contentType)}`;
          }
          
          filename = sanitizeFilename(filename);
          const filePath = path.join(tempDir, filename);
          
          // Download file
          await downloadFile(url, filePath);
          
          // Verify download
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            fs.unlinkSync(filePath);
            throw new Error('Downloaded file is empty');
          }
          
          // Send based on file type
          const fileBuffer = fs.readFileSync(filePath);
          
          if (isAudio) {
            await sock.sendMessage(jid, {
              audio: fileBuffer,
              mimetype: contentType || 'audio/mpeg',
              fileName: filename
            }, { quoted: m });
          } else if (isVideo) {
            await sock.sendMessage(jid, {
              video: fileBuffer,
              mimetype: contentType || 'video/mp4',
              fileName: filename
            }, { quoted: m });
          } else if (isImage) {
    await sock.sendMessage(jid, {
        image: fileBuffer,
        caption: `✅ *Fetch Complete!*\n\n╭━━━━━━━━━━━━━━━━━╮\n│  🖼️ *File:* ${filename}\n│  📏 *Size:* ${formatFileSize(stats.size)}\n│  🎯 *Type:* Image\n│  🔗 *Source:* ${url}\n│  📡 *Status:* ${status} ${statusText}\n│  📊 *Content-Type:* ${contentType.split(';')[0]}\n╰━━━━━━━━━━━━━━━━╯\n\n_Image successfully fetched from API_`
    }, { quoted: m });
} 
          
          // Cleanup
          fs.unlinkSync(filePath);
          
         
          
        } else if (isJson) {
          // Handle JSON response
          const jsonText = await response.text();
          let jsonData;
          try {
            jsonData = JSON.parse(jsonText);
          } catch (parseError) {
            throw new Error(`Invalid JSON: ${parseError.message}`);
          }
          
          const formattedJson = JSON.stringify(jsonData, null, 2);
          const jsonSize = formattedJson.length;
          
          let displayJson = formattedJson;
          let truncationNote = '';
          if (jsonSize > 3000) {
            displayJson = formattedJson.substring(0, 3000);
            truncationNote = `\n\n... (${jsonSize - 3000} more characters truncated)\n💡 Use .fetch ${url} -r for full response`;
          }
          
          await sock.sendMessage(jid, {
            text: `✅ *JSON API Response*\n\n╭━━━━━━━━━━━━━━━━━╮\n│  🔗 *URL:* ${url}\n│  📡 *Status:* ${status} ${statusText}\n│  📊 *Content-Type:* ${contentType.split(';')[0]}\n│  📏 *Size:* ${formatFileSize(jsonSize)}\n│  📅 *Date:* ${new Date().toLocaleTimeString()}\n╰━━━━━━━━━━━━━━━━╯\n\n📄 *Data:*\n\`\`\`json\n${displayJson}\`\`\`${truncationNote}`
          }, { quoted: m });
          
        } else if (isText) {
          // Handle text/HTML response
          const text = await response.text();
          const textSize = text.length;
          
          let displayText = text;
          let contentTypeInfo = contentType;
          let truncationNote = '';
          
          if (contentType.includes('html')) {
            const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
            const pageTitle = titleMatch ? titleMatch[1].trim() : 'No title';
            
            const plainText = text
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 500);
            
            displayText = `📄 *HTML Page:* ${pageTitle}\n\n🔍 *Text Preview:*\n${plainText}${plainText.length === 500 ? '...' : ''}`;
            contentTypeInfo = `HTML - ${pageTitle}`;
          } else {
            if (textSize > 2000) {
              displayText = text.substring(0, 2000);
              truncationNote = `\n\n... (${textSize - 2000} more characters truncated)\n💡 Use .fetch ${url} -r for full response`;
            }
          }
          
          await sock.sendMessage(jid, {
            text: `✅ *Text API Response*\n\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n│  🔗 *URL:* ${url}\n│  📡 *Status:* ${status} ${statusText}\n│  📊 *Content-Type:* ${contentTypeInfo}\n│  📏 *Size:* ${formatFileSize(textSize)}\n│  📅 *Date:* ${new Date().toLocaleTimeString()}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n${options.raw ? '📄 *Raw Response:*\n```\n' + text.substring(0, 1500) + (textSize > 1500 ? '...' : '') + '\n```' : displayText}${truncationNote}`
          }, { quoted: m });
          
        } else {
          // Handle other/binary responses
          const buffer = await response.arrayBuffer();
          const bufferSize = buffer.byteLength;
          
          await sock.sendMessage(jid, {
            text: `⚠️ *Binary API Response*\n\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n│  🔗 *URL:* ${url}\n│  📡 *Status:* ${status} ${statusText}\n│  📊 *Content-Type:* ${contentType || 'Unknown'}\n│  📏 *Size:* ${formatFileSize(bufferSize)}\n│  📅 *Date:* ${new Date().toLocaleTimeString()}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n⚠️ This API returned binary data (not text/JSON).\n\n💡 Try: .fetch ${url} -d to download if it's media\n💡 Or check if the API endpoint is correct.`
          }, { quoted: m });
        }
        
      } catch (fetchError) {
        clearTimeout(timeout);
        
        if (fetchError.name === 'AbortError' || fetchError.message.includes('timeout')) {
          await sock.sendMessage(jid, {
            text: `⏱️ *Request Timeout*\n\n╭━━━━━━━━━━━━━━━━━━━━━━━╮\n│  🔗 *URL:* ${url}\n│  ⏱️ *Timeout:* 30 seconds\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\nThe request timed out.\n\n*Possible issues:*\n• Server is too slow\n• Network connection issue\n• API endpoint not responding\n\n💡 Try again later or use a different endpoint.`
          }, { quoted: m });
        } else {
          throw fetchError;
        }
      }
      
    } catch (error) {
      console.error('Fetch command error:', error);
      
      let errorMessage = `❌ *Fetch Failed*\n\n╭━━━━━━━━━━━━━━━━━━━━━╮\n│  🔗 *URL:* ${url || 'Unknown'}\n│  💥 *Error:* ${error.message}\n╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      
      // Provide specific help based on error
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        errorMessage += `*DNS Resolution Failed*\n\n`;
        errorMessage += `The domain name could not be resolved.\n`;
        errorMessage += `• Check if the URL is correct\n`;
        errorMessage += `• Try without www/https\n`;
        errorMessage += `• Domain might not exist\n`;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage += `*Connection Refused*\n\n`;
        errorMessage += `The server refused the connection.\n`;
        errorMessage += `• Server might be down\n`;
        errorMessage += `• Port might be blocked\n`;
        errorMessage += `• Check firewall settings\n`;
      } else if (error.message.includes('CERT') || error.message.includes('SSL')) {
        errorMessage += `*SSL Certificate Error*\n\n`;
        errorMessage += `There's an issue with the SSL certificate.\n`;
        errorMessage += `• Certificate might be expired\n`;
        errorMessage += `• Try using http:// instead of https://\n`;
        errorMessage += `• Website might be insecure\n`;
      } else if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        errorMessage += `*Invalid JSON Response*\n\n`;
        errorMessage += `The API returned invalid JSON.\n`;
        errorMessage += `• Use .fetch <url> -r for raw response\n`;
        errorMessage += `• Check API documentation\n`;
        errorMessage += `• Might be HTML instead of JSON\n`;
      } else if (error.message.includes('404')) {
        errorMessage += `*Endpoint Not Found (404)*\n\n`;
        errorMessage += `The requested URL was not found.\n`;
        errorMessage += `• Check if the URL is correct\n`;
        errorMessage += `• API endpoint might have changed\n`;
        errorMessage += `• Try a different path\n`;
      } else if (error.message.includes('403')) {
        errorMessage += `*Access Forbidden (403)*\n\n`;
        errorMessage += `You don't have permission to access this.\n`;
        errorMessage += `• API might require authentication\n`;
        errorMessage += `• Check API documentation\n`;
        errorMessage += `• Might be rate limited\n`;
      }
      
      errorMessage += `\n💡 *Tip:* Use .fetch -h for help with the command`;
      
      await sock.sendMessage(jid, { text: errorMessage }, { quoted: m });
    }
  }
};






















