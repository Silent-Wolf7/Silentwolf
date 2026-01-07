// import axios from 'axios';
// import FormData from 'form-data';
// import { downloadContentFromMessage } from '@whiskeysockets/baileys';

// export default {
//   name: 'remini',
//   description: 'Enhance image quality using AI upscaling',
//   category: 'tools',
//   aliases: ['enhance', 'upscale', 'hq', 'quality'],
//   usage: 'remini [image_url] or reply to image',
  
//   async execute(sock, m, args, PREFIX, extra) {
//     const jid = m.key.remoteJid;
    
//     // ====== HELP SECTION ======
//     if (args.length === 0 || args[0].toLowerCase() === 'help') {
//       const helpText = `🖼️ *WOLFBOT IMAGE ENHANCER*\n\n` +
//         `💡 *Usage:*\n` +
//         `• \`${PREFIX}remini\` (reply to image)\n` +
//         `• \`${PREFIX}remini https://image.com/photo.jpg\`\n` +
//         `• Send image with caption \`${PREFIX}remini\`\n\n` +
        
//         `✨ *Features:*\n` +
//         `• AI-powered enhancement\n` +
//         `• Upscale up to 4K\n` +
//         `• Noise reduction\n` +
//         `• Color correction\n` +
//         `• Face enhancement\n\n` +
        
//         `📊 *Supported Formats:*\n` +
//         `• JPG, PNG, WebP\n` +
//         `• Max size: 10MB\n` +
//         `• Max resolution: 4000px\n\n` +
        
//         `🎯 *Examples:*\n` +
//         `\`${PREFIX}remini\` (reply to blurry image)\n` +
//         `\`${PREFIX}enhance\` (alias)\n` +
//         `\`${PREFIX}hq https://example.com/image.jpg\``;
      
//       return sock.sendMessage(jid, { text: helpText }, { quoted: m });
//     }

//     try {
//       // ====== DETECT IMAGE SOURCE ======
//       let imageBuffer = null;
//       let imageSource = '';
      
//       // Method 1: Check if URL provided
//       if (args[0] && args[0].startsWith('http')) {
//         const imageUrl = args[0];
//         console.log(`🖼️ Downloading image from URL: ${imageUrl}`);
        
//         const response = await axios.get(imageUrl, {
//           responseType: 'arraybuffer',
//           timeout: 15000,
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//           }
//         });
        
//         imageBuffer = Buffer.from(response.data);
//         imageSource = 'url';
        
//         // Validate image
//         if (!isValidImage(imageBuffer)) {
//           throw new Error('Invalid image format or corrupted file');
//         }
        
//       } 
//       // Method 2: Check if replying to message with image
//       else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//         const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        
//         if (quoted.imageMessage) {
//           console.log('🖼️ Downloading quoted image message');
//           const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
//           imageBuffer = await streamToBuffer(stream);
//           imageSource = 'quoted_image';
//         } 
//         else if (quoted.documentMessage?.mimetype?.startsWith('image/')) {
//           console.log('🖼️ Downloading quoted document image');
//           const stream = await downloadContentFromMessage(quoted.documentMessage, 'document');
//           imageBuffer = await streamToBuffer(stream);
//           imageSource = 'quoted_document';
//         }
//       }
//       // Method 3: Check if message itself contains image
//       else if (m.message?.imageMessage) {
//         console.log('🖼️ Downloading image from message');
//         const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
//         imageBuffer = await streamToBuffer(stream);
//         imageSource = 'direct_image';
//       }
//       // Method 4: Check if message contains image document
//       else if (m.message?.documentMessage?.mimetype?.startsWith('image/')) {
//         console.log('🖼️ Downloading image document');
//         const stream = await downloadContentFromMessage(m.message.documentMessage, 'document');
//         imageBuffer = await streamToBuffer(stream);
//         imageSource = 'direct_document';
//       }
      
//       // If no image found
//       if (!imageBuffer) {
//         return sock.sendMessage(jid, {
//           text: `❌ *NO IMAGE FOUND!*\n\n💡 *How to use:*\n1. Reply to an image with \`${PREFIX}remini\`\n2. Send image with caption \`${PREFIX}remini\`\n3. Use URL: \`${PREFIX}remini https://image.com/photo.jpg\``
//         }, { quoted: m });
//       }
      
//       // ====== VALIDATE IMAGE ======
//       const imageSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
//       console.log(`📊 Image size: ${imageSizeMB}MB`);
      
//       if (imageBuffer.length > 10 * 1024 * 1024) {
//         return sock.sendMessage(jid, {
//           text: `❌ *IMAGE TOO LARGE!*\n\nSize: ${imageSizeMB}MB\nMax: 10MB\n\n💡 Compress image first or use smaller file.`
//         }, { quoted: m });
//       }
      
//       if (imageBuffer.length < 1024) {
//         return sock.sendMessage(jid, {
//           text: `❌ *IMAGE TOO SMALL!*\n\nImage appears corrupted or invalid.\n\n💡 Try different image.`
//         }, { quoted: m });
//       }
      
//       // ====== PROCESSING MESSAGE ======
//       const statusMsg = await sock.sendMessage(jid, {
//         text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
//               `⚡ *Processing image...*\n` +
//               `📊 Size: ${imageSizeMB}MB\n` +
//               `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
//               `⏳ *Uploading to server...*`
//       }, { quoted: m });
      
//       // ====== UPLOAD TO CATBOX (TEMP HOSTING) ======
//       await sock.sendMessage(jid, {
//         text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
//               `⚡ *Processing...* ✅\n` +
//               `📊 Size: ${imageSizeMB}MB\n` +
//               `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
//               `⏳ *Uploading to server...* 🔄`,
//         edit: statusMsg.key
//       });
      
//       let uploadedUrl = '';
//       try {
//         uploadedUrl = await uploadToCatbox(imageBuffer);
//         console.log(`✅ Uploaded to Catbox: ${uploadedUrl}`);
//       } catch (uploadError) {
//         console.error('Catbox upload failed:', uploadError);
        
//         // Fallback: Use different upload method or direct API
//         await sock.sendMessage(jid, {
//           text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
//                 `⚡ *Processing...* ✅\n` +
//                 `📊 Size: ${imageSizeMB}MB\n` +
//                 `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
//                 `⏳ *Upload failed, trying direct method...*`,
//           edit: statusMsg.key
//         });
        
//         // Try direct API with buffer (if supported)
//         // For now, we'll continue with the URL method
//         throw new Error('Image upload service unavailable');
//       }
      
//       // ====== ENHANCE WITH REMINI API ======
//       await sock.sendMessage(jid, {
//         text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
//               `⚡ *Processing...* ✅\n` +
//               `📊 Size: ${imageSizeMB}MB\n` +
//               `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
//               `⏳ *Uploading...* ✅\n` +
//               `🎨 *Enhancing with AI...*`,
//         edit: statusMsg.key
//       });
      
//       const encodedUrl = encodeURIComponent(uploadedUrl);
//       const apiUrl = `https://api.elrayyxml.web.id/api/tools/remini?url=${encodedUrl}`;
      
//       console.log(`🔗 Calling Remini API: ${apiUrl}`);
      
//       const response = await axios.get(apiUrl, {
//         responseType: 'arraybuffer',
//         timeout: 45000, // 45 seconds for processing
//         headers: {
//           'User-Agent': 'WolfBot-Remini/1.0',
//           'Accept': 'image/*',
//           'Referer': 'https://www.remini.ai/'
//         }
//       });
      
//       // ====== VERIFY RESPONSE ======
//       const contentType = response.headers['content-type'];
//       if (!contentType || !contentType.includes('image')) {
//         throw new Error(`API returned ${contentType || 'no content type'}, expected image`);
//       }
      
//       const enhancedBuffer = Buffer.from(response.data);
      
//       if (enhancedBuffer.length < 1024) {
//         throw new Error('Enhanced image is too small (possibly corrupted)');
//       }
      
//       const enhancedSizeMB = (enhancedBuffer.length / 1024 / 1024).toFixed(2);
//       console.log(`✅ Enhanced image: ${enhancedSizeMB}MB`);
      
//       // ====== SEND ENHANCED IMAGE ======
//       await sock.sendMessage(jid, {
//         text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
//               `⚡ *Processing...* ✅\n` +
//               `📊 Size: ${imageSizeMB}MB\n` +
//               `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
//               `⏳ *Uploading...* ✅\n` +
//               `🎨 *Enhancing with AI...* ✅\n` +
//               `📤 *Sending result...*`,
//         edit: statusMsg.key
//       });
      
//       // Send enhanced image
//       await sock.sendMessage(jid, {
//         image: enhancedBuffer,
//         caption: `✨ *ENHANCED IMAGE*\n\n` +
//                 `📊 *Original:* ${imageSizeMB}MB\n` +
//                 `📈 *Enhanced:* ${enhancedSizeMB}MB\n` +
//                 `⚡ *Quality:* AI Upscaled\n` +
//                 `🎨 *Tool:* Remini AI\n\n` +
//                 `✅ *Enhancement complete!*\n` +
//                 `💡 Use \`${PREFIX}remini\` for more images`
//       });
      
//       // Update status to complete
//       await sock.sendMessage(jid, {
//         text: `✅ *ENHANCEMENT COMPLETE!*\n\n` +
//               `📊 Original: ${imageSizeMB}MB → Enhanced: ${enhancedSizeMB}MB\n` +
//               `⚡ Quality improved with AI\n` +
//               `🎨 Image sent successfully!`,
//         edit: statusMsg.key
//       });
      
//     } catch (error) {
//       console.error('❌ [REMINI] ERROR:', error);
      
//       let errorMessage = `❌ *ENHANCEMENT FAILED!*\n\n`;
      
//       if (error.message.includes('timeout')) {
//         errorMessage += `• Processing timeout (45s)\n`;
//         errorMessage += `• Image might be too complex\n`;
//         errorMessage += `• Try smaller image\n`;
//       } else if (error.message.includes('upload')) {
//         errorMessage += `• Upload service failed\n`;
//         errorMessage += `• Try different image\n`;
//       } else if (error.message.includes('Invalid image')) {
//         errorMessage += `• Invalid/corrupted image\n`;
//         errorMessage += `• Use JPG/PNG format\n`;
//       } else if (error.message.includes('API returned')) {
//         errorMessage += `• Enhancement API error\n`;
//         errorMessage += `• Service might be down\n`;
//       } else if (error.response?.status === 429) {
//         errorMessage += `• Too many requests\n`;
//         errorMessage += `• Wait 1 minute\n`;
//       } else {
//         errorMessage += `• Error: ${error.message}\n`;
//       }
      
//       errorMessage += `\n💡 *Tips:*\n`;
//       errorMessage += `• Use images under 5MB\n`;
//       errorMessage += `• JPG/PNG format works best\n`;
//       errorMessage += `• Avoid animated images\n`;
//       errorMessage += `• Try again in 1 minute\n\n`;
//       errorMessage += `🔧 *Try:* ${PREFIX}remini help`;
      
//       await sock.sendMessage(jid, {
//         text: errorMessage
//       }, { quoted: m });
//     }
//   },
// };

// // ====== HELPER FUNCTIONS ======

// // Upload to Catbox.moe (temporary hosting)
// async function uploadToCatbox(buffer) {
//   console.log('📤 Uploading to Catbox...');
  
//   const form = new FormData();
//   form.append('reqtype', 'fileupload');
//   form.append('fileToUpload', buffer, {
//     filename: `image_${Date.now()}.jpg`,
//     contentType: 'image/jpeg'
//   });
  
//   const response = await axios.post('https://catbox.moe/user/api.php', form, {
//     headers: {
//       ...form.getHeaders(),
//       'User-Agent': 'WolfBot/1.0'
//     },
//     timeout: 30000,
//     maxContentLength: 50 * 1024 * 1024, // 50MB
//   });
  
//   const result = response.data;
  
//   if (!result || !result.includes('http')) {
//     throw new Error('Catbox upload failed: ' + (result || 'No URL returned'));
//   }
  
//   // Clean URL
//   const url = result.trim();
//   console.log(`✅ Catbox URL: ${url}`);
//   return url;
// }

// // Convert stream to buffer
// async function streamToBuffer(stream) {
//   const chunks = [];
//   for await (const chunk of stream) {
//     chunks.push(chunk);
//   }
//   return Buffer.concat(chunks);
// }

// // Validate image buffer
// function isValidImage(buffer) {
//   if (!buffer || buffer.length < 4) return false;
  
//   // Check magic numbers for common image formats
//   const magic = buffer.slice(0, 4).toString('hex');
  
//   // JPEG: FF D8 FF
//   if (magic.startsWith('ffd8ff')) return true;
  
//   // PNG: 89 50 4E 47
//   if (magic === '89504e47') return true;
  
//   // GIF: 47 49 46 38
//   if (magic.startsWith('47494638')) return true;
  
//   // WebP: 52 49 46 46
//   if (magic.startsWith('52494646')) {
//     // Check for WEBP header
//     const webpHeader = buffer.slice(8, 12).toString();
//     return webpHeader === 'WEBP';
//   }
  
//   return false;
// }






























import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'remini',
  description: 'Enhance image quality using AI upscaling',
  category: 'tools',
  aliases: ['enhance', 'upscale', 'hq', 'quality'],
  usage: 'remini [image_url] or reply to image',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    // ====== DETECT IF USER IS REPLYING TO AN IMAGE ======
    let isReplyingToImage = false;
    let imageBuffer = null;
    let imageSource = '';
    
    // Check if message is a reply
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
      
      // Check if quoted message contains an image
      if (quoted.imageMessage) {
        isReplyingToImage = true;
      } else if (quoted.documentMessage?.mimetype?.startsWith('image/')) {
        isReplyingToImage = true;
      }
    }
    
    // Check if message itself contains an image (with caption .remini)
    if (m.message?.imageMessage) {
      isReplyingToImage = true;
    } else if (m.message?.documentMessage?.mimetype?.startsWith('image/')) {
      isReplyingToImage = true;
    }
    
    // Check if URL is provided as argument
    const hasUrl = args[0] && args[0].startsWith('http');
    
    // ====== SHOW HELP ONLY IF NO IMAGE SOURCE ======
    if (!isReplyingToImage && !hasUrl && args[0] !== 'help') {
      const helpText = `🖼️ *WOLFBOT IMAGE ENHANCER*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}remini\` (reply to image)\n` +
        `• \`${PREFIX}remini https://image.com/photo.jpg\`\n` +
        `• Send image with caption \`${PREFIX}remini\`\n\n` +
        
        `✨ *Features:*\n` +
        `• AI-powered enhancement\n` +
        `• Upscale up to 4K\n` +
        `• Noise reduction\n` +
        `• Color correction\n` +
        `• Face enhancement\n\n` +
        
        `📊 *Supported Formats:*\n` +
        `• JPG, PNG, WebP\n` +
        `• Max size: 10MB\n` +
        `• Max resolution: 4000px\n\n` +
        
        `🎯 *Examples:*\n` +
        `\`${PREFIX}remini\` (reply to blurry image)\n` +
        `\`${PREFIX}enhance\` (alias)\n` +
        `\`${PREFIX}hq https://example.com/image.jpg\``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== SHOW HELP IF EXPLICITLY REQUESTED ======
    if (args[0] === 'help') {
      const helpText = `🖼️ *WOLFBOT IMAGE ENHANCER*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}remini\` (reply to image)\n` +
        `• \`${PREFIX}remini https://image.com/photo.jpg\`\n` +
        `• Send image with caption \`${PREFIX}remini\`` +
      ``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    try {
      // ====== DETECT IMAGE SOURCE ======
      let imageBuffer = null;
      let imageSource = '';
      
      // Method 1: Check if URL provided
      if (args[0] && args[0].startsWith('http')) {
        const imageUrl = args[0];
        console.log(`🖼️ Downloading image from URL: ${imageUrl}`);
        
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        imageBuffer = Buffer.from(response.data);
        imageSource = 'url';
        
        // Validate image
        if (!isValidImage(imageBuffer)) {
          throw new Error('Invalid image format or corrupted file');
        }
        
      } 
      // Method 2: Check if replying to message with image
      else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quoted.imageMessage) {
          console.log('🖼️ Downloading quoted image message');
          const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
          imageBuffer = await streamToBuffer(stream);
          imageSource = 'quoted_image';
        } 
        else if (quoted.documentMessage?.mimetype?.startsWith('image/')) {
          console.log('🖼️ Downloading quoted document image');
          const stream = await downloadContentFromMessage(quoted.documentMessage, 'document');
          imageBuffer = await streamToBuffer(stream);
          imageSource = 'quoted_document';
        }
        else {
          throw new Error('Quoted message does not contain an image');
        }
      }
      // Method 3: Check if message itself contains image
      else if (m.message?.imageMessage) {
        console.log('🖼️ Downloading image from message');
        const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
        imageBuffer = await streamToBuffer(stream);
        imageSource = 'direct_image';
      }
      // Method 4: Check if message contains image document
      else if (m.message?.documentMessage?.mimetype?.startsWith('image/')) {
        console.log('🖼️ Downloading image document');
        const stream = await downloadContentFromMessage(m.message.documentMessage, 'document');
        imageBuffer = await streamToBuffer(stream);
        imageSource = 'direct_document';
      }
      
      // If no image found (should not happen with our check above)
      if (!imageBuffer) {
        return sock.sendMessage(jid, {
          text: `❌ *NO IMAGE FOUND!*\n\n💡 *How to use:*\n1. Reply to an image with \`${PREFIX}remini\`\n2. Send image with caption \`${PREFIX}remini\`\n3. Use URL: \`${PREFIX}remini https://image.com/photo.jpg\``
        }, { quoted: m });
      }
      
      // ====== VALIDATE IMAGE ======
      const imageSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
      console.log(`📊 Image size: ${imageSizeMB}MB`);
      
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return sock.sendMessage(jid, {
          text: `❌ *IMAGE TOO LARGE!*\n\nSize: ${imageSizeMB}MB\nMax: 10MB\n\n💡 Compress image first or use smaller file.`
        }, { quoted: m });
      }
      
      if (imageBuffer.length < 1024) {
        return sock.sendMessage(jid, {
          text: `❌ *IMAGE TOO SMALL!*\n\nImage appears corrupted or invalid.\n\n💡 Try different image.`
        }, { quoted: m });
      }
      
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
              `⚡ *Processing image...*\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
              `⏳ *Uploading to server...*`
      }, { quoted: m });
      
      // ====== UPLOAD TO CATBOX (TEMP HOSTING) ======
      await sock.sendMessage(jid, {
        text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
              `⚡ *Processing...* ✅\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
              `⏳ *Uploading to server...* 🔄`,
        edit: statusMsg.key
      });
      
      let uploadedUrl = '';
      try {
        uploadedUrl = await uploadToCatbox(imageBuffer);
        console.log(`✅ Uploaded to Catbox: ${uploadedUrl}`);
      } catch (uploadError) {
        console.error('Catbox upload failed:', uploadError);
        
        await sock.sendMessage(jid, {
          text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
                `⚡ *Processing...* ✅\n` +
                `📊 Size: ${imageSizeMB}MB\n` +
                `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
                `⏳ *Upload failed, trying direct method...*`,
          edit: statusMsg.key
        });
        
        throw new Error('Image upload service unavailable');
      }
      
      // ====== ENHANCE WITH REMINI API ======
      await sock.sendMessage(jid, {
        text: `🖼️ *IMAGE ENHANCEMENT*\n\n` +
              `⚡ *Processing...* ✅\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `🔧 Source: ${imageSource.replace(/_/g, ' ')}\n\n` +
              `⏳ *Uploading...* ✅\n` +
              `🎨 *Enhancing with AI...*`,
        edit: statusMsg.key
      });
      
      const encodedUrl = encodeURIComponent(uploadedUrl);
      const apiUrl = `https://api.elrayyxml.web.id/api/tools/remini?url=${encodedUrl}`;
      
      console.log(`🔗 Calling Remini API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 45000, // 45 seconds for processing
        headers: {
          'User-Agent': 'WolfBot-Remini/1.0',
          'Accept': 'image/*',
          'Referer': 'https://www.remini.ai/'
        }
      });
      
      // ====== VERIFY RESPONSE ======
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('image')) {
        throw new Error(`API returned ${contentType || 'no content type'}, expected image`);
      }
      
      const enhancedBuffer = Buffer.from(response.data);
      
      if (enhancedBuffer.length < 1024) {
        throw new Error('Enhanced image is too small (possibly corrupted)');
      }
      
      const enhancedSizeMB = (enhancedBuffer.length / 1024 / 1024).toFixed(2);
      console.log(`✅ Enhanced image: ${enhancedSizeMB}MB`);
      
      // ====== SEND ENHANCED IMAGE ======
      await sock.sendMessage(jid, {
        text: `🖼️ *IMAGE ENHANCEMENT*` +
              `⚡ *Processing...* ✅` +
              `📊 Size: ${imageSizeMB}MB` +
              `🔧 Source: ${imageSource.replace(/_/g, ' ')}` +
              `⏳ *Uploading...* ✅` +
              `🎨 *Enhancing with AI...* ✅` +
              `📤 *Sending result...*`,
        edit: statusMsg.key
      });
      
      // Send enhanced image
      await sock.sendMessage(jid, {
        image: enhancedBuffer,
        caption: `✨ *ENHANCED IMAGE*\n\n` +
                `📊 *Original:* ${imageSizeMB}MB\n` +
                `📈 *Enhanced:* ${enhancedSizeMB}MB\n` +
                `⚡ *Quality:* AI Upscaled\n` +
                `🎨 *Tool:* Remini AI\n\n` +
                `✅ *Enhancement complete!*\n` +
                `💡 Use \`${PREFIX}remini\` for more images`
      });
      
      // Update status to complete
      await sock.sendMessage(jid, {
        text: `✅ *ENHANCEMENT COMPLETE!*\n\n` +
              `📊 Original: ${imageSizeMB}MB → Enhanced: ${enhancedSizeMB}MB\n` +
              `⚡ Quality improved with AI\n` +
              `🎨 Image sent successfully!`,
        edit: statusMsg.key
      });
      
    } catch (error) {
      console.error('❌ [REMINI] ERROR:', error);
      
      let errorMessage = `❌ *ENHANCEMENT FAILED!*\n\n`;
      
      if (error.message.includes('timeout')) {
        errorMessage += `• Processing timeout (45s)\n`;
        errorMessage += `• Image might be too complex\n`;
        errorMessage += `• Try smaller image\n`;
      } else if (error.message.includes('upload')) {
        errorMessage += `• Upload service failed\n`;
        errorMessage += `• Try different image\n`;
      } else if (error.message.includes('Invalid image')) {
        errorMessage += `• Invalid/corrupted image\n`;
        errorMessage += `• Use JPG/PNG format\n`;
      } else if (error.message.includes('API returned')) {
        errorMessage += `• Enhancement API error\n`;
        errorMessage += `• Service might be down\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Too many requests\n`;
        errorMessage += `• Wait 1 minute\n`;
      } else if (error.message.includes('Quoted message')) {
        errorMessage += `• The message you replied to doesn't contain an image\n`;
        errorMessage += `• Reply to an actual image\n`;
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n💡 *Tips:*\n`;
      errorMessage += `• Use images under 5MB\n`;
      errorMessage += `• JPG/PNG format works best\n`;
      errorMessage += `• Avoid animated images\n`;
      errorMessage += `• Try again in 1 minute\n\n`;
      errorMessage += `🔧 *Try:* ${PREFIX}remini help`;
      
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Upload to Catbox.moe (temporary hosting)
async function uploadToCatbox(buffer) {
  console.log('📤 Uploading to Catbox...');
  
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, {
    filename: `image_${Date.now()}.jpg`,
    contentType: 'image/jpeg'
  });
  
  const response = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'WolfBot/1.0'
    },
    timeout: 30000,
    maxContentLength: 50 * 1024 * 1024, // 50MB
  });
  
  const result = response.data;
  
  if (!result || !result.includes('http')) {
    throw new Error('Catbox upload failed: ' + (result || 'No URL returned'));
  }
  
  // Clean URL
  const url = result.trim();
  console.log(`✅ Catbox URL: ${url}`);
  return url;
}

// Convert stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Validate image buffer
function isValidImage(buffer) {
  if (!buffer || buffer.length < 4) return false;
  
  // Check magic numbers for common image formats
  const magic = buffer.slice(0, 4).toString('hex');
  
  // JPEG: FF D8 FF
  if (magic.startsWith('ffd8ff')) return true;
  
  // PNG: 89 50 4E 47
  if (magic === '89504e47') return true;
  
  // GIF: 47 49 46 38
  if (magic.startsWith('47494638')) return true;
  
  // WebP: 52 49 46 46
  if (magic.startsWith('52494646')) {
    // Check for WEBP header
    const webpHeader = buffer.slice(8, 12).toString();
    return webpHeader === 'WEBP';
  }
  
  return false;
}