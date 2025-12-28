// import fetch from 'node-fetch';
// import axios from 'axios';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Helper function to download file
// async function downloadFile(url, filePath) {
//   try {
//     const response = await axios({
//       method: 'GET',
//       url: url,
//       responseType: 'stream'
//     });

//     const writer = fs.createWriteStream(filePath);
    
//     response.data.pipe(writer);
    
//     return new Promise((resolve, reject) => {
//       writer.on('finish', () => resolve(filePath));
//       writer.on('error', reject);
//     });
//   } catch (error) {
//     throw new Error(`Download failed: ${error.message}`);
//   }
// }

// // Determine file type from URL or content
// function getFileType(url, contentType) {
//   if (contentType) {
//     if (contentType.includes('audio')) return 'audio';
//     if (contentType.includes('video')) return 'video';
//     if (contentType.includes('image')) return 'image';
//     if (contentType.includes('json')) return 'json';
//     if (contentType.includes('text')) return 'text';
//   }
  
//   // Try to determine from URL
//   const urlLower = url.toLowerCase();
//   if (urlLower.includes('.mp3') || urlLower.includes('.wav') || urlLower.includes('.ogg') || urlLower.includes('.m4a')) return 'audio';
//   if (urlLower.includes('.mp4') || urlLower.includes('.mkv') || urlLower.includes('.avi') || urlLower.includes('.mov')) return 'video';
//   if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || urlLower.includes('.gif') || urlLower.includes('.webp')) return 'image';
//   if (urlLower.includes('.json')) return 'json';
  
//   return 'unknown';
// }

// // Format JSON for display
// function formatJSON(data, maxLength = 1500) {
//   try {
//     if (typeof data === 'string') {
//       data = JSON.parse(data);
//     }
    
//     const formatted = JSON.stringify(data, null, 2);
    
//     if (formatted.length > maxLength) {
//       return formatted.substring(0, maxLength) + `\n\n... (truncated, ${formatted.length} characters total)`;
//     }
    
//     return formatted;
//   } catch (error) {
//     return String(data);
//   }
// }

// // Check if URL is valid
// function isValidUrl(string) {
//   try {
//     new URL(string);
//     return true;
//   } catch (_) {
//     return false;
//   }
// }

// export default {
//   name: "fetch",
//   description: "Fetch data from any API endpoint",
//   category: "utility",
  
//   async execute(sock, m, args, prefix) {
//     const jid = m.key.remoteJid;
//     const quoted = m.quoted ? m.quoted : m;
//     const sender = m.key.participant || m.key.remoteJid;
    
//     const helpMessage = `🎯 *FETCH COMMAND*\n\n` +
//       `*Usage:*\n` +
//       `• ${prefix}fetch <url>\n` +
//       `• ${prefix}fetch <url> -d (download media)\n` +
//       `• ${prefix}fetch <url> -j (pretty JSON)\n` +
//       `• ${prefix}fetch <url> -h (headers only)\n` +
//       `• Reply to a message with ${prefix}fetch\n\n` +
//       `*Examples:*\n` +
//       `• ${prefix}fetch https://api.example.com/data\n` +
//       `• ${prefix}fetch https://apiskeith.vercel.app/download/audio?url=https://youtube.com/watch?v=60ItHLz5WEA -d\n` +
//       `• ${prefix}fetch https://jsonplaceholder.typicode.com/posts/1 -j\n\n` +
//       `*Features:*\n` +
//       `• Supports GET requests\n` +
//       `• Auto-detects media (audio/video/image)\n` +
//       `• Can download files\n` +
//       `• Pretty JSON formatting\n` +
//       `• Shows response headers\n` +
//       `• URL validation\n` +
//       `• Timeout handling (30s)\n` +
//       `• Error handling`;
    
//     // Show help if no arguments
//     if (args.length === 0) {
//       await sock.sendMessage(jid, { text: helpMessage }, { quoted: m });
//       return;
//     }
    
//     // Parse arguments
//     let url = args[0];
//     const options = {
//       download: args.includes('-d') || args.includes('--download'),
//       json: args.includes('-j') || args.includes('--json'),
//       headers: args.includes('-h') || args.includes('--headers'),
//       raw: args.includes('-r') || args.includes('--raw'),
//       silent: args.includes('-s') || args.includes('--silent')
//     };
    
//     // Check if URL is from quoted message
//     if (!isValidUrl(url) && m.quoted && m.quoted.message) {
//       // Try to extract URL from quoted message
//       const quotedText = m.quoted.message.conversation || 
//                         m.quoted.message.extendedTextMessage?.text ||
//                         m.quoted.message.imageMessage?.caption ||
//                         '';
      
//       const urlMatch = quotedText.match(/https?:\/\/[^\s]+/);
//       if (urlMatch) {
//         url = urlMatch[0];
//       } else {
//         await sock.sendMessage(jid, { text: "❌ Please provide a valid URL or reply to a message containing a URL." }, { quoted: m });
//         return;
//       }
//     }
    
//     // Validate URL
//     if (!isValidUrl(url)) {
//       await sock.sendMessage(jid, { text: "❌ Invalid URL format. Please provide a valid URL starting with http:// or https://" }, { quoted: m });
//       return;
//     }
    
//     // Check if URL has protocol
//     if (!url.startsWith('http://') && !url.startsWith('https://')) {
//       url = 'https://' + url;
//     }
    
//     try {
//       // Send initial message
//       const loadingMsg = await sock.sendMessage(jid, { text: `🔄 Fetching data from:\n\`${url}\`\n\n⏳ Please wait...` }, { quoted: m });
      
//       // Fetch with timeout
//       const controller = new AbortController();
//       const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
//       try {
//         const response = await fetch(url, {
//           signal: controller.signal,
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': '*/*',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'Connection': 'keep-alive'
//           },
//           redirect: 'follow'
//         });
        
//         clearTimeout(timeout);
        
//         // Get response info
//         const status = response.status;
//         const statusText = response.statusText;
//         const contentType = response.headers.get('content-type') || '';
//         const contentLength = response.headers.get('content-length');
//         const fileType = getFileType(url, contentType);
        
//         // Handle different response types
//         if (options.download && (fileType === 'audio' || fileType === 'video' || fileType === 'image')) {
//           // Download media file
//           await sock.sendMessage(jid, { 
//             text: `📥 Downloading ${fileType}...\n📊 Size: ${contentLength ? `${Math.round(parseInt(contentLength) / 1024)}KB` : 'Unknown'}` 
//           }, { quoted: m });
          
//           // Create temp file path
//           const tempDir = path.join(__dirname, '..', '..', 'temp');
//           if (!fs.existsSync(tempDir)) {
//             fs.mkdirSync(tempDir, { recursive: true });
//           }
          
//           const fileName = `download_${Date.now()}.${fileType === 'audio' ? 'mp3' : fileType === 'video' ? 'mp4' : 'jpg'}`;
//           const filePath = path.join(tempDir, fileName);
          
//           // Download file
//           await downloadFile(url, filePath);
          
//           // Check file size
//           const stats = fs.statSync(filePath);
//           const fileSizeMB = stats.size / (1024 * 1024);
          
//           if (fileSizeMB > 50) { // WhatsApp limit ~50MB
//             fs.unlinkSync(filePath);
//             await sock.sendMessage(jid, { 
//               text: `❌ File too large (${fileSizeMB.toFixed(2)}MB). WhatsApp limit is ~50MB.` 
//             }, { quoted: m });
//             return;
//           }
          
//           // Send file based on type
//           if (fileType === 'audio') {
//             await sock.sendMessage(jid, {
//               audio: fs.readFileSync(filePath),
//               mimetype: 'audio/mpeg',
//               fileName: fileName
//             }, { quoted: m });
//           } else if (fileType === 'video') {
//             await sock.sendMessage(jid, {
//               video: fs.readFileSync(filePath),
//               mimetype: 'video/mp4',
//               fileName: fileName
//             }, { quoted: m });
//           } else if (fileType === 'image') {
//             await sock.sendMessage(jid, {
//               image: fs.readFileSync(filePath),
//               caption: `📸 Image downloaded from:\n${url}`
//             }, { quoted: m });
//           }
          
//           // Cleanup
//           fs.unlinkSync(filePath);
          
//           if (!options.silent) {
//             await sock.sendMessage(jid, { 
//               text: `✅ Download complete!\n📁 Type: ${fileType}\n📊 Size: ${fileSizeMB.toFixed(2)}MB` 
//             }, { quoted: m });
//           }
          
//         } else if (contentType.includes('application/json') || options.json) {
//           // Handle JSON response
//           const data = await response.json();
          
//           let responseText = `✅ *API Response*\n\n`;
//           responseText += `🔗 *URL:* ${url}\n`;
//           responseText += `📡 *Status:* ${status} ${statusText}\n`;
//           responseText += `📊 *Type:* JSON\n`;
//           responseText += `🕐 *Date:* ${new Date().toLocaleString()}\n\n`;
          
//           if (options.headers) {
//             responseText += `📋 *Headers:*\n`;
//             response.headers.forEach((value, key) => {
//               responseText += `  ${key}: ${value}\n`;
//             });
//             responseText += `\n`;
//           }
          
//           responseText += `📄 *Data:*\n\`\`\`json\n${formatJSON(data, 2000)}\`\`\``;
          
//           await sock.sendMessage(jid, { text: responseText }, { quoted: m });
          
//         } else if (contentType.includes('text/') || contentType.includes('text/html')) {
//           // Handle text response
//           const text = await response.text();
          
//           let responseText = `✅ *API Response*\n\n`;
//           responseText += `🔗 *URL:* ${url}\n`;
//           responseText += `📡 *Status:* ${status} ${statusText}\n`;
//           responseText += `📊 *Type:* ${contentType}\n`;
//           responseText += `📏 *Length:* ${text.length} characters\n`;
//           responseText += `🕐 *Date:* ${new Date().toLocaleString()}\n\n`;
          
//           if (options.headers) {
//             responseText += `📋 *Headers:*\n`;
//             response.headers.forEach((value, key) => {
//               responseText += `  ${key}: ${value}\n`;
//             });
//             responseText += `\n`;
//           }
          
//           if (options.raw) {
//             responseText += `📄 *Raw Response:*\n\`\`\`\n${text.substring(0, 2000)}\`\`\``;
//           } else {
//             // Try to extract useful info from HTML
//             if (contentType.includes('html')) {
//               // Remove HTML tags for cleaner display
//               const cleanText = text
//                 .replace(/<[^>]*>/g, ' ')
//                 .replace(/\s+/g, ' ')
//                 .trim()
//                 .substring(0, 1500);
              
//               responseText += `📄 *Content Preview:*\n${cleanText}`;
              
//               // Try to extract title
//               const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
//               if (titleMatch) {
//                 responseText = `📄 *Title:* ${titleMatch[1]}\n\n` + responseText;
//               }
//             } else {
//               responseText += `📄 *Content:*\n${text.substring(0, 1500)}`;
//             }
            
//             if (text.length > 1500) {
//               responseText += `\n\n... (truncated, ${text.length} characters total)`;
//             }
//           }
          
//           await sock.sendMessage(jid, { text: responseText }, { quoted: m });
          
//         } else if (contentType.includes('image/')) {
//           // Handle image response
//           const buffer = await response.arrayBuffer();
          
//           await sock.sendMessage(jid, {
//             image: Buffer.from(buffer),
//             caption: `🖼️ Image fetched from API\n🔗 URL: ${url}\n📡 Status: ${status} ${statusText}`
//           }, { quoted: m });
          
//         } else {
//           // Handle other response types
//           let responseText = `📡 *API Response*\n\n`;
//           responseText += `🔗 *URL:* ${url}\n`;
//           responseText += `📡 *Status:* ${status} ${statusText}\n`;
//           responseText += `📊 *Content Type:* ${contentType || 'Unknown'}\n`;
//           responseText += `📏 *Size:* ${contentLength ? `${contentLength} bytes` : 'Unknown'}\n`;
//           responseText += `🕐 *Date:* ${new Date().toLocaleString()}\n\n`;
          
//           if (options.headers) {
//             responseText += `📋 *Headers:*\n`;
//             response.headers.forEach((value, key) => {
//               responseText += `  ${key}: ${value}\n`;
//             });
//           }
          
//           if (status >= 400) {
//             responseText = `❌ *Error Response*\n\n` + responseText;
//           }
          
//           await sock.sendMessage(jid, { text: responseText }, { quoted: m });
          
//           // Try to get text if possible
//           try {
//             const text = await response.text();
//             if (text && text.length > 0 && text.length < 500) {
//               await sock.sendMessage(jid, { 
//                 text: `📄 *Response Body:*\n\`\`\`\n${text}\`\`\`` 
//               }, { quoted: m });
//             }
//           } catch (textError) {
//             // Ignore - can't read as text
//           }
//         }
        
//       } catch (fetchError) {
//         clearTimeout(timeout);
        
//         if (fetchError.name === 'AbortError') {
//           await sock.sendMessage(jid, { 
//             text: `⏱️ *Request Timeout*\n\nThe request to \`${url}\` timed out after 30 seconds.\n\nTry again or check if the API is available.` 
//           }, { quoted: m });
//         } else {
//           throw fetchError;
//         }
//       }
      
//     } catch (error) {
//       console.error('Fetch error:', error);
      
//       let errorMessage = `❌ *Fetch Failed*\n\n`;
//       errorMessage += `🔗 *URL:* ${url}\n\n`;
//       errorMessage += `💥 *Error:* ${error.message}\n\n`;
      
//       // Provide helpful suggestions
//       if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
//         errorMessage += `*Possible issues:*\n`;
//         errorMessage += `• Domain doesn't exist\n`;
//         errorMessage += `• DNS resolution failed\n`;
//         errorMessage += `• Check URL spelling\n`;
//       } else if (error.message.includes('ECONNREFUSED')) {
//         errorMessage += `*Possible issues:*\n`;
//         errorMessage += `• Server is down\n`;
//         errorMessage += `• Port is blocked\n`;
//         errorMessage += `• API endpoint not available\n`;
//       } else if (error.message.includes('CERT_HAS_EXPIRED') || error.message.includes('SSL')) {
//         errorMessage += `*Possible issues:*\n`;
//         errorMessage += `• SSL certificate error\n`;
//         errorMessage += `• Try http:// instead of https://\n`;
//       } else if (error.message.includes('Unexpected token')) {
//         errorMessage += `*Possible issues:*\n`;
//         errorMessage += `• Invalid JSON response\n`;
//         errorMessage += `• Use -r flag for raw response\n`;
//       }
      
//       errorMessage += `\n💡 *Try:* ${prefix}fetch -h for help`;
      
//       await sock.sendMessage(jid, { text: errorMessage }, { quoted: m });
//     }
//   }
// };








































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

// Progress bar function (same as update command)
function getProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

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

// Download file with progress
async function downloadWithProgress(url, filePath, onProgress) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const totalLength = response.headers['content-length'];
  let downloadedLength = 0;
  
  const writer = fs.createWriteStream(filePath);
  
  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    if (totalLength && onProgress) {
      const percentage = Math.round((downloadedLength / totalLength) * 100);
      onProgress(percentage, downloadedLength, totalLength);
    }
  });
  
  await streamPipeline(response.data, writer);
  return filePath;
}

export default {
  name: "fetch",
  description: "Fetch data from any API endpoint with real-time progress",
  category: "utility",
  usage: ".fetch <url> [options]\nOptions: -d (download), -j (json), -h (headers), -r (raw), -s (silent)",
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    
    // Store message key for editing
    let currentMessageKey = null;
    
    // Helper function to send/update messages
    const sendUpdate = async (text, isEdit = false) => {
      try {
        if (isEdit && currentMessageKey) {
          await sock.sendMessage(jid, { 
            text,
            edit: currentMessageKey
          }, { quoted: m });
        } else {
          const newMsg = await sock.sendMessage(jid, { text }, { quoted: m });
          currentMessageKey = newMsg.key;
        }
      } catch (error) {
        console.log("Message error:", error.message);
        // Send new message if edit fails
        const newMsg = await sock.sendMessage(jid, { text }, { quoted: m });
        currentMessageKey = newMsg.key;
      }
    };
    
    // Progress animation
    const animateProgress = async (baseText, progress = 0, extraInfo = '') => {
      const bar = getProgressBar(progress);
      const emoji = progress < 30 ? "🔍" : 
                   progress < 60 ? "📥" : 
                   progress < 90 ? "🔄" : "✅";
      const progressText = `${emoji} ${baseText}\n${bar} ${progress}%\n${extraInfo}`;
      await sendUpdate(progressText, true);
    };
    
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
        `• .fetch https://jsonplaceholder.typicode.com/posts/1 -j\n\n` +
        `*Features:*\n` +
        `• Real-time progress bar\n` +
        `• Auto media detection & download\n` +
        `• Smart JSON/Text/HTML parsing\n` +
        `• File size limits (50MB)\n` +
        `• 30s timeout protection\n` +
        `• URL validation & sanitization`;
      
      await sendUpdate(helpMessage);
      return;
    }
    
    try {
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
          await animateProgress("Extracted URL from quoted message", 10, `🔗 ${url}`);
        } else {
          await sendUpdate("❌ *Invalid or Missing URL*\n\nPlease provide a valid URL or reply to a message containing a URL.\n\nExample: .fetch https://example.com");
          return;
        }
      }
      
      // Validate URL
      if (!isValidUrl(url)) {
        await sendUpdate("❌ *Invalid URL Format*\n\nURL must start with http:// or https://\n\nExample: .fetch https://api.example.com/data");
        return;
      }
      
      // Add https if missing
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Initial message
      await animateProgress("Initializing fetch request", 5, `🔗 ${url}\n\n⏳ Preparing connection...`);
      
      // Setup fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        throw new Error('Request timeout after 30 seconds');
      }, 30000);
      
      try {
        await animateProgress("Connecting to server", 15, `🌐 ${new URL(url).hostname}\n📡 Establishing connection...`);
        
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
        const contentDisposition = response.headers.get('content-disposition');
        
        await animateProgress("Receiving response", 40, 
          `📡 Status: ${status} ${statusText}\n` +
          `📊 Type: ${contentType.split(';')[0]}\n` +
          `📏 Size: ${contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown'}`);
        
        // Handle different content types
        const isAudio = contentType.includes('audio/');
        const isVideo = contentType.includes('video/');
        const isImage = contentType.includes('image/');
        const isJson = contentType.includes('application/json') || options.json;
        const isText = contentType.includes('text/');
        
        // Extract filename from headers or URL
        let filename = 'downloaded_file';
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/i);
          if (match) filename = match[1];
        } else {
          const urlPath = new URL(url).pathname;
          const urlFilename = urlPath.split('/').pop();
          if (urlFilename && urlFilename.includes('.')) {
            filename = urlFilename;
          } else {
            filename = `download_${Date.now()}.${getExtensionFromMime(contentType)}`;
          }
        }
        
        filename = sanitizeFilename(filename);
        
        // Handle download option for media
        if ((options.download || isAudio || isVideo || isImage) && (isAudio || isVideo || isImage)) {
          const fileSize = contentLength ? parseInt(contentLength) : 0;
          const maxSize = 50 * 1024 * 1024; // 50MB WhatsApp limit
          
          if (fileSize > maxSize) {
            await sendUpdate(`❌ *File Too Large*\n\n📁 ${filename}\n📏 ${formatFileSize(fileSize)}\n\n⚠️ WhatsApp limit: 50MB\n💡 Try a smaller file or use direct link.`);
            return;
          }
          
          // Create temp directory
          const tempDir = path.join(process.cwd(), 'temp_fetch');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const filePath = path.join(tempDir, filename);
          
          // Download with progress
          let lastProgress = 40;
          await downloadWithProgress(url, filePath, (percentage, downloaded, total) => {
            if (percentage >= lastProgress + 5 || percentage === 100) {
              lastProgress = percentage;
              const progress = 40 + Math.round(percentage * 0.5); // 40-90% range
              const speed = formatFileSize(downloaded / 5) + '/s'; // Rough estimate
              
              animateProgress(
                `Downloading ${isAudio ? '🎵' : isVideo ? '🎬' : '🖼️'} ${filename}`,
                progress,
                `📥 ${formatFileSize(downloaded)} / ${formatFileSize(total)}\n` +
                `⚡ Speed: ${speed}\n` +
                `${getProgressBar(percentage, 15)} ${percentage}%`
              ).catch(console.error);
            }
          });
          
          // Verify download
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            fs.unlinkSync(filePath);
            throw new Error('Downloaded file is empty');
          }
          
          await animateProgress("Processing downloaded file", 95, 
            `✅ Download complete!\n` +
            `📁 ${filename}\n` +
            `📏 ${formatFileSize(stats.size)}\n` +
            `🎯 Preparing to send...`);
          
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
              caption: `🖼️ Image fetched from API\n🔗 ${url}\n📏 ${formatFileSize(stats.size)}`
            }, { quoted: m });
          }
          
          // Cleanup
          fs.unlinkSync(filePath);
          
          if (!options.silent) {
            await sendUpdate(`✅ *Download Complete!*\n\n` +
              `📁 *File:* ${filename}\n` +
              `📏 *Size:* ${formatFileSize(stats.size)}\n` +
              `🎯 *Type:* ${isAudio ? 'Audio' : isVideo ? 'Video' : 'Image'}\n` +
              `🔗 *Source:* ${url}\n\n` +
              `_File sent successfully!_`, true);
          }
          
        } else if (isJson) {
          // Handle JSON response
          await animateProgress("Parsing JSON data", 70, `📄 Reading JSON response...`);
          
          const jsonText = await response.text();
          let jsonData;
          try {
            jsonData = JSON.parse(jsonText);
          } catch (parseError) {
            throw new Error(`Invalid JSON: ${parseError.message}`);
          }
          
          await animateProgress("Formatting JSON response", 85, `✨ Beautifying JSON output...`);
          
          // Format JSON nicely
          const formattedJson = JSON.stringify(jsonData, null, 2);
          const jsonSize = formattedJson.length;
          
          let displayJson = formattedJson;
          if (jsonSize > 3000) {
            displayJson = formattedJson.substring(0, 3000) + 
              `\n\n... (${jsonSize - 3000} more characters truncated)\n` +
              `💡 Use .fetch ${url} -r for full response`;
          }
          
          const responseMessage = `✅ *JSON API Response*\n\n` +
            `🔗 *URL:* \`${url}\`\n` +
            `📡 *Status:* ${status} ${statusText}\n` +
            `📊 *Content-Type:* ${contentType}\n` +
            `📏 *Size:* ${formatFileSize(jsonSize)}\n` +
            `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
            (options.headers ? `📋 *Headers:*\n${Array.from(response.headers.entries()).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\n` : '') +
            `📄 *Data:*\n\`\`\`json\n${displayJson}\`\`\``;
          
          await sendUpdate(responseMessage, true);
          
        } else if (isText) {
          // Handle text/HTML response
          await animateProgress("Reading text response", 70, `📄 Fetching text content...`);
          
          const text = await response.text();
          const textSize = text.length;
          
          await animateProgress("Processing text content", 85, `🔍 Analyzing ${textSize} characters...`);
          
          let displayText = text;
          let contentTypeInfo = contentType;
          
          // Clean HTML if needed
          if (contentType.includes('html')) {
            // Extract title
            const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
            const pageTitle = titleMatch ? titleMatch[1].trim() : 'No title';
            
            // Extract meta description
            const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
            const pageDesc = descMatch ? descMatch[1].trim() : '';
            
            // Get plain text preview (first 500 chars without tags)
            const plainText = text
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 500);
            
            displayText = `📄 *HTML Page:* ${pageTitle}\n`;
            if (pageDesc) displayText += `📝 *Description:* ${pageDesc}\n\n`;
            displayText += `🔍 *Text Preview:*\n${plainText}${plainText.length === 500 ? '...' : ''}`;
            
            contentTypeInfo = `HTML - ${pageTitle}`;
          } else {
            if (textSize > 2000) {
              displayText = text.substring(0, 2000) + 
                `\n\n... (${textSize - 2000} more characters truncated)\n` +
                `💡 Use .fetch ${url} -r for full response`;
            }
          }
          
          const responseMessage = `✅ *Text API Response*\n\n` +
            `🔗 *URL:* \`${url}\`\n` +
            `📡 *Status:* ${status} ${statusText}\n` +
            `📊 *Content-Type:* ${contentTypeInfo}\n` +
            `📏 *Size:* ${formatFileSize(textSize)}\n` +
            `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
            (options.headers ? `📋 *Headers:*\n${Array.from(response.headers.entries()).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\n` : '') +
            `${options.raw ? '📄 *Raw Response:*\n```\n' + text.substring(0, 1500) + (textSize > 1500 ? '...' : '') + '\n```' : displayText}`;
          
          await sendUpdate(responseMessage, true);
          
        } else {
          // Handle other/binary responses
          await animateProgress("Processing binary response", 70, `📦 Handling ${contentType || 'binary'} data...`);
          
          const buffer = await response.arrayBuffer();
          const bufferSize = buffer.byteLength;
          
          const responseMessage = `📡 *API Response*\n\n` +
            `🔗 *URL:* \`${url}\`\n` +
            `📡 *Status:* ${status} ${statusText}\n` +
            `📊 *Content-Type:* ${contentType || 'Unknown'}\n` +
            `📏 *Size:* ${formatFileSize(bufferSize)}\n` +
            `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
            (options.headers ? `📋 *Headers:*\n${Array.from(response.headers.entries()).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\n` : '') +
            `⚠️ *Binary Response*\n\n` +
            `This API returned binary data (not text/JSON).\n` +
            `💡 Try: .fetch ${url} -d to download if it's media\n` +
            `💡 Or check if the API endpoint is correct.`;
          
          if (bufferSize < 1024 * 1024 && !options.silent) { // If < 1MB, try to show hex preview
            const hexPreview = Buffer.from(buffer).toString('hex').substring(0, 100);
            responseMessage += `\n\n🔍 *Hex Preview:* ${hexPreview}...`;
          }
          
          await sendUpdate(responseMessage, true);
        }
        
      } catch (fetchError) {
        clearTimeout(timeout);
        
        if (fetchError.name === 'AbortError' || fetchError.message.includes('timeout')) {
          await sendUpdate(`⏱️ *Request Timeout*\n\n` +
            `The request to \`${url}\` timed out after 30 seconds.\n\n` +
            `*Possible issues:*\n` +
            `• Server is too slow\n` +
            `• Network connection issue\n` +
            `• API endpoint not responding\n\n` +
            `💡 Try again later or use a different endpoint.`, true);
        } else {
          throw fetchError;
        }
      }
      
    } catch (error) {
      console.error('Fetch command error:', error);
      
      let errorMessage = `❌ *Fetch Failed*\n\n`;
      errorMessage += `🔗 *URL:* \`${url || 'Unknown'}\`\n\n`;
      errorMessage += `💥 *Error:* ${error.message}\n\n`;
      
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
      
      await sendUpdate(errorMessage, true);
    }
  }
};