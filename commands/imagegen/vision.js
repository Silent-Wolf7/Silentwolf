import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'vision',
  description: 'AI-powered image analysis',
  category: 'ai',
  aliases: ['analyze', 'imgai', 'describe', 'whatisthis'],
  usage: 'vision [prompt] or reply to image',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    // ====== DETECT IF USER IS REPLYING TO AN IMAGE ======
    let isReplyingToImage = false;
    
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
    
    // Check if message itself contains an image (with caption .vision)
    if (m.message?.imageMessage) {
      isReplyingToImage = true;
    } else if (m.message?.documentMessage?.mimetype?.startsWith('image/')) {
      isReplyingToImage = true;
    }
    
    // Check if URL is provided as argument
    const hasUrl = args[0] && args[0].startsWith('http');
    
    // ====== SHOW HELP ONLY IF NO IMAGE SOURCE ======
    if (!isReplyingToImage && !hasUrl && args[0] !== 'help') {
      const helpText = `👁️ *WOLFBOT VISION*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}vision\` (reply to image)\n` +
        `• \`${PREFIX}vision what is this?\` (with prompt)\n` +
        `• Send image with caption \`${PREFIX}vision\`\n\n` +
        
        `✨ *Features:*\n` +
        `• AI image analysis\n` +
        `• Object identification\n` +
        `• Scene description\n` +
        `• Text extraction\n` +
        `• Answer questions about images\n\n` +
        
        `🎯 *Examples:*\n` +
        `\`${PREFIX}vision\` (reply to image)\n` +
        `\`${PREFIX}vision what animals are in this picture?\`\n` +
        `\`${PREFIX}analyze describe this scene\`\n` +
        `\`${PREFIX}whatisthis\` (simple analysis)`;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== SHOW HELP IF EXPLICITLY REQUESTED ======
    if (args[0] === 'help') {
      const helpText = `👁️ *WOLFBOT VISION*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}vision\` (reply to image)\n` +
        `• \`${PREFIX}vision what is this?\` (with prompt)\n` +
        `• Send image with caption \`${PREFIX}vision\`\n\n` +
        
        `✨ *Features:*\n` +
        `• AI image analysis\n` +
        `• Object identification\n` +
        `• Scene description\n` +
        `• Text extraction\n` +
        `• Answer questions about images\n\n` +
        
        `🎯 *Examples:*\n` +
        `\`${PREFIX}vision\` (reply to image)\n` +
        `\`${PREFIX}vision what animals are in this picture?\`\n` +
        `\`${PREFIX}analyze describe this scene\`\n` +
        `\`${PREFIX}whatisthis\` (simple analysis)`;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    try {
      // ====== DETECT IMAGE SOURCE ======
      let imageBuffer = null;
      let imageSource = '';
      
      // Method 1: Check if URL provided
      if (args[0] && args[0].startsWith('http')) {
        const imageUrl = args[0];
        console.log(`👁️ Downloading image from URL: ${imageUrl}`);
        
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        imageBuffer = Buffer.from(response.data);
        imageSource = 'url';
        
      } 
      // Method 2: Check if replying to message with image
      else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quoted.imageMessage) {
          console.log('👁️ Downloading quoted image message');
          const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
          imageBuffer = await streamToBuffer(stream);
          imageSource = 'quoted_image';
        } 
        else if (quoted.documentMessage?.mimetype?.startsWith('image/')) {
          console.log('👁️ Downloading quoted document image');
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
        console.log('👁️ Downloading image from message');
        const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
        imageBuffer = await streamToBuffer(stream);
        imageSource = 'direct_image';
      }
      // Method 4: Check if message contains image document
      else if (m.message?.documentMessage?.mimetype?.startsWith('image/')) {
        console.log('👁️ Downloading image document');
        const stream = await downloadContentFromMessage(m.message.documentMessage, 'document');
        imageBuffer = await streamToBuffer(stream);
        imageSource = 'direct_document';
      }
      
      // If no image found (should not happen with our check above)
      if (!imageBuffer) {
        return sock.sendMessage(jid, {
          text: `❌ *NO IMAGE FOUND!*\n\n💡 *How to use:*\n1. Reply to an image with \`${PREFIX}vision\`\n2. Send image with caption \`${PREFIX}vision\`\n3. Use URL: \`${PREFIX}vision https://image.com/photo.jpg\``
        }, { quoted: m });
      }
      
      // ====== EXTRACT PROMPT ======
      // Remove URL if present
      let promptArgs = args;
      if (args[0] && args[0].startsWith('http')) {
        promptArgs = args.slice(1);
      }
      
      let prompt = promptArgs.join(' ').trim();
      if (!prompt) {
        prompt = "What is this image about?";
      }
      
      console.log(`👁️ Vision analysis with prompt: "${prompt}"`);
      
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
        text: `👁️ *VISION ANALYSIS*\n\n` +
              `📸 *Processing image...*\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `💭 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n` +
              `⏳ *Uploading to server...*`
      }, { quoted: m });
      
      // ====== UPLOAD TO CATBOX ======
      await sock.sendMessage(jid, {
        text: `👁️ *VISION ANALYSIS*\n\n` +
              `📸 *Processing...* ✅\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `💭 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n` +
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
          text: `👁️ *VISION ANALYSIS*\n\n` +
                `📸 *Processing...* ✅\n` +
                `📊 Size: ${imageSizeMB}MB\n` +
                `💭 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n` +
                `⏳ *Upload failed, trying direct method...*`,
          edit: statusMsg.key
        });
        
        throw new Error('Image upload service unavailable');
      }
      
      // ====== ANALYZE WITH GPT-NANO API ======
      await sock.sendMessage(jid, {
        text: `👁️ *VISION ANALYSIS*\n\n` +
              `📸 *Processing...* ✅\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `💭 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n` +
              `⏳ *Uploading...* ✅\n` +
              `🤖 *Analyzing with AI...*`,
        edit: statusMsg.key
      });
      
      const encodedPrompt = encodeURIComponent(prompt);
      const encodedUrl = encodeURIComponent(uploadedUrl);
      const apiUrl = `https://api.ootaizumi.web.id/ai/gptnano?prompt=${encodedPrompt}&imageUrl=${encodedUrl}`;
      
      console.log(`🔗 Calling GPT-Nano API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        timeout: 60000,
        headers: {
          'User-Agent': 'WolfBot-Vision/1.0',
          'Accept': 'application/json',
          'Referer': 'https://wolfbot.com/'
        }
      });
      
      console.log(`✅ GPT-Nano response received`);
      
      // ====== EXTRACT ANALYSIS RESULT ======
      let analysisResult = '';
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.result) {
          analysisResult = response.data.result;
        } else if (response.data.analysis) {
          analysisResult = response.data.analysis;
        } else if (response.data.description) {
          analysisResult = response.data.description;
        } else if (response.data.text) {
          analysisResult = response.data.text;
        } else {
          analysisResult = JSON.stringify(response.data, null, 2);
        }
      } else if (typeof response.data === 'string') {
        analysisResult = response.data;
      } else {
        throw new Error('Invalid API response format');
      }
      
      // Clean up the result
      analysisResult = analysisResult.trim();
      
      // ====== SEND ANALYSIS RESULT ======
      await sock.sendMessage(jid, {
        text: `👁️ *VISION ANALYSIS*\n\n` +
              `📸 *Processing...* ✅\n` +
              `📊 Size: ${imageSizeMB}MB\n` +
              `💭 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n` +
              `⏳ *Uploading...* ✅\n` +
              `🤖 *Analyzing with AI...* ✅\n` +
              `📤 *Sending results...*`,
        edit: statusMsg.key
      });
      
      // Create final analysis message
      let resultText = `👁️ *VISION ANALYSIS*\n\n`;
      
      resultText += `💭 *Your Question:*\n"${prompt}"\n\n`;
      resultText += `📋 *Analysis Results:*\n${analysisResult}\n\n`;
      resultText += `📊 *Image Info:*\n`;
      resultText += `• Size: ${imageSizeMB}MB\n`;
      resultText += `• Source: ${imageSource.replace(/_/g, ' ')}\n`;
      resultText += `• Model: GPT-Nano Vision\n\n`;
      resultText += `✨ *Powered by WolfBot Vision*`;
      
      // Send final result
      await sock.sendMessage(jid, {
        text: resultText,
        edit: statusMsg.key
      });
      
    } catch (error) {
      console.error('❌ [VISION] ERROR:', error);
      
      let errorMessage = `❌ *VISION ANALYSIS FAILED!*\n\n`;
      
      if (error.message.includes('timeout')) {
        errorMessage += `• Analysis timeout (60s)\n`;
        errorMessage += `• Image might be too complex\n`;
        errorMessage += `• Try simpler prompt\n`;
      } else if (error.message.includes('upload')) {
        errorMessage += `• Image upload failed\n`;
        errorMessage += `• Try different image\n`;
      } else if (error.message.includes('Quoted message')) {
        errorMessage += `• The message you replied to doesn't contain an image\n`;
        errorMessage += `• Reply to an actual image\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Too many requests\n`;
        errorMessage += `• Wait 1-2 minutes\n`;
      } else if (error.response?.status === 400) {
        errorMessage += `• Invalid image or prompt\n`;
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n💡 *Try these examples:*\n`;
      errorMessage += `\`${PREFIX}vision describe this image\`\n`;
      errorMessage += `\`${PREFIX}analyze what is this?\`\n`;
      errorMessage += `\`${PREFIX}whatisthis\`\n\n`;
      errorMessage += `🔧 *Help:* \`${PREFIX}vision help\``;
      
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Upload to Catbox.moe (same as remini command)
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
    maxContentLength: 50 * 1024 * 1024,
  });
  
  const result = response.data;
  
  if (!result || !result.includes('http')) {
    throw new Error('Catbox upload failed: ' + (result || 'No URL returned'));
  }
  
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