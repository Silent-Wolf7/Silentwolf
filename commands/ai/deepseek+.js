// commands/ai/deepseek-plus.js
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "deepseek+",
  alias: ["ds+", "deepseekfile", "deepfile"],
  desc: "DeepSeek AI with file upload support 📎 (Images, PDF, TXT, etc.)",
  category: "AI",
  usage: ".deepseek+ <question> [reply to file]",
  async execute(sock, m, args) {
    try {
      const query = args.join(" ");
      
      // Check if there's a quoted message with media
      const quotedMsg = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!query && !quotedMsg) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "📎 *DeepSeek+ with File Support*\n━━━━━━━━━━━━━━━━━\nI can process files and answer questions!\n\n*Usage:*\n• .deepseek+ What's in this image? [reply to image]\n• .deepseek+ Summarize this PDF [reply to document]\n• .deepseek+ Explain this code [reply to text file]\n\n📁 *Supported:* Images, PDF, TXT, Word, Excel, PPT"
        }, { quoted: m });
      }

      // Load API Key
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Please set DEEPSEEK_API_KEY in .env\nGet free credits: https://platform.deepseek.com"
        }, { quoted: m });
      }

      // Prepare messages array
      const messages = [];
      
      // Add system message
      messages.push({
        role: "system",
        content: "You are DeepSeek AI with vision capabilities. Analyze any provided files (images, documents) and answer questions about them thoroughly."
      });

      // Handle file upload if quoted message has media
      if (quotedMsg) {
        const mediaTypes = ['imageMessage', 'documentMessage', 'videoMessage'];
        const mediaType = mediaTypes.find(type => quotedMsg[type]);
        
        if (mediaType) {
          try {
            // Download the media
            const media = await sock.downloadMediaMessage(quotedMsg);
            const buffer = Buffer.from(media);
            
            // Convert to base64
            const base64Media = buffer.toString('base64');
            
            // Determine MIME type
            let mimeType = 'image/jpeg'; // default
            if (mediaType === 'documentMessage') {
              mimeType = quotedMsg.documentMessage.mimetype || 'application/octet-stream';
            } else if (mediaType === 'imageMessage') {
              mimeType = quotedMsg.imageMessage.mimetype || 'image/jpeg';
            } else if (mediaType === 'videoMessage') {
              mimeType = quotedMsg.videoMessage.mimetype || 'video/mp4';
            }
            
            // Add file content to messages
            messages.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text: query || "Please analyze this file and tell me what it contains."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Media}`
                  }
                }
              ]
            });
            
          } catch (fileErr) {
            console.error("File download error:", fileErr);
            // Fallback to text-only if file download fails
            messages.push({
              role: "user",
              content: query || "Analyze the file I sent."
            });
          }
        } else {
          // No media, just text
          messages.push({
            role: "user",
            content: query || "Hello"
          });
        }
      } else {
        // No quoted message, just text query
        messages.push({
          role: "user",
          content: query
        });
      }

      // Show typing indicator
      await sock.sendPresenceUpdate('composing', m.key.remoteJid);

      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat", // Use deepseek-chat for vision capabilities
          messages: messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API Error:", errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || "No response generated.";
      
      // Token usage info
      const usage = data.usage || {};
      const tokenInfo = `📊 Tokens: ${usage.prompt_tokens || '?'} input | ${usage.completion_tokens || '?'} output`;

      const formattedReply = `
🤖 *DeepSeek AI* (With Vision)
━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━
${tokenInfo}
🔗 *Model:* deepseek-chat
⚡ *Free API Available*
`;

      await sock.sendMessage(m.key.remoteJid, { text: formattedReply }, { quoted: m });

    } catch (err) {
      console.error("DeepSeek+ Error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ DeepSeek+ Error:\n${err.message}\n\nMake sure:\n1. API key is valid\n2. File isn't too large\n3. You have API credits`
      }, { quoted: m });
    }
  }
};