import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "reshare",
  aliases: ["repost", "share", "forward"],
  description: "Reshare status updates with emoji reaction",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    
    try {
      // Check if message is a reply
      if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        await sock.sendMessage(jid, {
          text: `📤 *Reshare Status Command*\n\nTo reshare a status update:\n1. Reply to the status message\n2. Type: \`reshare 😘\` (with any emoji)\n\nExample:\nReply to status → \`reshare 🔥\`\n\nAfter resharing, your "reshare" text will be replaced with the emoji.`
        }, { quoted: m });
        return;
      }

      // Parse emoji from args
      let emoji = "🔄"; // Default emoji
      if (args.length > 0) {
        // Check if first arg is an emoji
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
        if (emojiRegex.test(args[0])) {
          emoji = args[0];
        } else if (args[0].startsWith(":")) {
          // Convert :emoji_name: to actual emoji
          const emojiMap = {
            ":heart:": "❤️",
            ":fire:": "🔥",
            ":star:": "⭐",
            ":clap:": "👏",
            ":laugh:": "😂",
            ":like:": "👍",
            ":love:": "😍",
            ":wow:": "😮",
            ":sad:": "😢",
            ":angry:": "😠",
            ":kiss:": "😘",
            ":share:": "🔄",
            ":forward:": "⏩"
          };
          const lowerArg = args[0].toLowerCase();
          if (emojiMap[lowerArg]) {
            emoji = emojiMap[lowerArg];
          }
        }
      }

      console.log(`📤 [RESHARE] User ${sender} wants to reshare with emoji: ${emoji}`);

      // Send initial response
      const statusMsg = await sock.sendMessage(jid, {
        text: `${emoji} *Resharing status...*`,
        quoted: m
      });

      // Get the quoted message
      const quotedMsg = m.message.extendedTextMessage.contextInfo;
      const quotedContent = quotedMsg.quotedMessage;
      
      if (!quotedContent) {
        await sock.sendMessage(jid, {
          text: "❌ Could not retrieve the quoted status. It may have been deleted.",
          edit: statusMsg.key
        });
        return;
      }

      // Determine message type and reshare accordingly
      try {
        // Check for image status
        if (quotedContent.imageMessage) {
          await reshareImageStatus(sock, jid, quotedContent.imageMessage, emoji, statusMsg);
        }
        // Check for video status
        else if (quotedContent.videoMessage) {
          await reshareVideoStatus(sock, jid, quotedContent.videoMessage, emoji, statusMsg);
        }
        // Check for text status
        else if (quotedContent.conversation || quotedContent.extendedTextMessage) {
          await reshareTextStatus(sock, jid, quotedContent, emoji, statusMsg);
        }
        // Check for document (PDF, etc.) status
        else if (quotedContent.documentMessage) {
          await reshareDocumentStatus(sock, jid, quotedContent.documentMessage, emoji, statusMsg);
        }
        else {
          await sock.sendMessage(jid, {
            text: `❌ Unsupported status type. Can only reshare images, videos, text, and documents.`,
            edit: statusMsg.key
          });
          return;
        }

        // Now edit the original "reshare" command message to just the emoji
        try {
          // Send reaction to the original message
          await sock.sendMessage(jid, {
            react: {
              text: emoji,
              key: m.key
            }
          });

          // Also update our status message
          await sock.sendMessage(jid, {
            text: `${emoji} *Status reshared successfully!*\n\nYour "reshare" command has been replaced with this emoji reaction.`,
            edit: statusMsg.key
          });

          console.log(`✅ [RESHARE] Successfully reshared and added emoji reaction`);

        } catch (editError) {
          console.error("❌ [RESHARE] Error editing message:", editError);
          // Even if we can't edit, still confirm reshare was successful
          await sock.sendMessage(jid, {
            text: `${emoji} *Status reshared successfully!*`,
            edit: statusMsg.key
          });
        }

      } catch (reshareError) {
        console.error("❌ [RESHARE] Error during reshare:", reshareError);
        await sock.sendMessage(jid, {
          text: `❌ Failed to reshare status: ${reshareError.message}`,
          edit: statusMsg.key
        });
      }

    } catch (error) {
      console.error("❌ [RESHARE] Fatal error:", error);
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}\n\nMake sure you're replying to a valid status update.`
      }, { quoted: m });
    }
  }
};

// Helper functions for different media types
async function reshareImageStatus(sock, jid, imageMessage, emoji, statusMsg) {
  console.log("📤 [RESHARE] Processing image status");
  
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const tempFile = path.join(tempDir, `status_image_${Date.now()}.jpg`);
  
  try {
    // Download image
    const buffer = await downloadMediaMessage(sock, { message: { imageMessage } });
    
    fs.writeFileSync(tempFile, buffer);
    
    // Get caption if exists
    const caption = imageMessage.caption || `${emoji} Reshared status`;
    
    // Reshare the image
    await sock.sendMessage(jid, {
      image: fs.readFileSync(tempFile),
      caption: caption,
      mimetype: 'image/jpeg',
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    });
    
    // Clean up
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    
  } catch (error) {
    throw error;
  }
}

async function reshareVideoStatus(sock, jid, videoMessage, emoji, statusMsg) {
  console.log("📤 [RESHARE] Processing video status");
  
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const tempFile = path.join(tempDir, `status_video_${Date.now()}.mp4`);
  
  try {
    // Download video
    const buffer = await downloadMediaMessage(sock, { message: { videoMessage } });
    
    fs.writeFileSync(tempFile, buffer);
    
    // Get caption if exists
    const caption = videoMessage.caption || `${emoji} Reshared status`;
    
    // Reshare the video
    await sock.sendMessage(jid, {
      video: fs.readFileSync(tempFile),
      caption: caption,
      mimetype: 'video/mp4',
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    });
    
    // Clean up
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    
  } catch (error) {
    throw error;
  }
}

async function reshareTextStatus(sock, jid, textMessage, emoji, statusMsg) {
  console.log("📤 [RESHARE] Processing text status");
  
  // Extract text from message
  let text = "";
  if (textMessage.conversation) {
    text = textMessage.conversation;
  } else if (textMessage.extendedTextMessage?.text) {
    text = textMessage.extendedTextMessage.text;
  }
  
  // Add emoji and reshare indicator
  const resharedText = `${emoji} *Reshared Status*\n\n${text}\n\n_🔁 Reshared via WolfBot_`;
  
  // Reshare the text
  await sock.sendMessage(jid, {
    text: resharedText,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  });
}

async function reshareDocumentStatus(sock, jid, documentMessage, emoji, statusMsg) {
  console.log("📤 [RESHARE] Processing document status");
  
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const fileName = documentMessage.fileName || `document_${Date.now()}`;
  const tempFile = path.join(tempDir, fileName);
  
  try {
    // Download document
    const buffer = await downloadMediaMessage(sock, { message: { documentMessage } });
    
    fs.writeFileSync(tempFile, buffer);
    
    // Get caption if exists
    const caption = documentMessage.caption || `${emoji} Reshared document`;
    
    // Reshare the document
    await sock.sendMessage(jid, {
      document: fs.readFileSync(tempFile),
      caption: caption,
      mimetype: documentMessage.mimetype || 'application/octet-stream',
      fileName: fileName,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    });
    
    // Clean up
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    
  } catch (error) {
    throw error;
  }
}

// Helper function to download media
async function downloadMediaMessage(sock, message) {
  try {
    // First try the modern way (for baileys)
    if (sock.downloadAndSaveMediaMessage) {
      const { buffer } = await sock.downloadAndSaveMediaMessage(message, {});
      return buffer;
    }
    
    // Fallback method for older versions
    if (sock.downloadMediaMessage) {
      const stream = await sock.downloadMediaMessage(message);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    
    // Alternative: if the library provides message as a buffer directly
    throw new Error("No download method available on sock object");
    
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}