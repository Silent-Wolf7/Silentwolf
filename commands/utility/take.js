












// import { downloadMediaMessage } from '@whiskeysockets/baileys';
// import webp from 'node-webpmux';
// import crypto from 'crypto';

// export default {
//   name: "take",
//   description: "Take a sticker and add custom metadata",
//   category: "media",
//   usage: ".take <emoji>\nReply to a sticker with .take to customize its emoji",
  
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
    
//     const sendMessage = async (text) => {
//       return await sock.sendMessage(jid, { text }, { quoted: m });
//     };
    
//     try {
//       // Get pushname (user's display name)
//       const pushname = m.pushName || m.sender.split('@')[0] || "User";
      
//       // Check if message is a reply to a sticker
//       const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
//       if (!quotedMessage?.stickerMessage) {
//         // Alternative check: check m.quoted
//         if (!m.quoted?.message?.stickerMessage) {
//           return await sendMessage("❌ *Reply to a sticker first!*\n\nReply to any sticker with .take to copy it\n\n*Example:* Reply to sticker with: .take 😎");
//         }
//       }
      
//       // Get the actual quoted message
//       const stickerMessage = quotedMessage?.stickerMessage || m.quoted?.message?.stickerMessage;
      
//       if (!stickerMessage) {
//         return await sendMessage("❌ *That's not a sticker!*\n\nPlease reply to a sticker message.");
//       }
      
//       // Get the emoji from args or use default
//       const emoji = args.length > 0 ? args[0] : '🤖';
      
//       // Send processing message
//       // await sendMessage(`📦 *Processing Sticker*\n\n✨ Pack: *WolfBot*\n👤 By: ${pushname}\n🎭 Emoji: ${emoji}\n⏳ Please wait...`);
      
//       try {
//         // Get the message key for download
//         const messageKey = m.quoted?.key || {
//           remoteJid: jid,
//           id: m.message?.extendedTextMessage?.contextInfo?.stanzaId || m.key.id,
//           participant: m.sender
//         };
        
//         // Download the sticker
//         const stickerBuffer = await downloadMediaMessage(
//           {
//             key: messageKey,
//             message: { stickerMessage },
//             messageType: 'stickerMessage'
//           },
//           'buffer',
//           {},
//           {
//             logger: console,
//             reuploadRequest: sock.updateMediaMessage
//           }
//         );
        
//         if (!stickerBuffer) {
//           return await sendMessage("❌ Failed to download sticker\n\n💡 The sticker might be too large or corrupted.");
//         }
        
//         // Add metadata using webpmux
//         const img = new webp.Image();
//         await img.load(stickerBuffer);
        
//         // Create metadata - Always use WolfBot as pack name
//         const json = {
//           'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
//           'sticker-pack-name': 'WolfBot', // Always use WolfBot
//           'sticker-pack-publisher': pushname, // Keep user as publisher
//           'emojis': [emoji] // Use provided emoji or default
//         };
        
//         // Create exif buffer
//         const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
//         const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
//         const exif = Buffer.concat([exifAttr, jsonBuffer]);
//         exif.writeUIntLE(jsonBuffer.length, 14, 4);
        
//         // Set the exif data
//         img.exif = exif;
        
//         // Get the final buffer with metadata
//         const finalBuffer = await img.save(null);
        
//         // Send the sticker
//         await sock.sendMessage(jid, {
//           sticker: finalBuffer
//         }, {
//           quoted: m
//         });
        
//         // Send success message
//         // await sendMessage(`✅ *Sticker Taken Successfully!*\n\n📦 Pack: WolfBot\n👤 By: ${pushname}\n🎭 Emoji: ${emoji}\n\n💡 The sticker now shows under "WolfBot" pack`);
        
//       } catch (error) {
//         console.error('Sticker processing error:', error);
        
//         let errorMsg = "❌ *Sticker Processing Error*\n\n";
//         if (error.message.includes('webp') || error.message.includes('Image')) {
//           errorMsg += "Invalid sticker format or corrupted sticker.\n";
//           errorMsg += "Try with a different sticker.\n";
//         } else if (error.message.includes('download')) {
//           errorMsg += "Failed to download sticker.\n";
//           errorMsg += "The sticker might be too large.\n";
//         } else {
//           errorMsg += `Error: ${error.message}\n`;
//         }
        
//         errorMsg += "\n📌 *Requirements:*\n";
//         errorMsg += "• Install: `npm install node-webpmux`\n";
//         errorMsg += "• Sticker must be WebP format\n";
        
//         await sendMessage(errorMsg);
//       }
      
//     } catch (error) {
//       console.error('Error in take command:', error);
//       await sendMessage(`❌ Command Error: ${error.message}\n\nTry sending the command again.`);
//     }
//   }
// };


























import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default {
  name: "take",
  alias: ["steal", "copysticker"],
  description: "Take a sticker and add custom metadata (Owner Only)",
  category: "owner",
  ownerOnly: true,
  usage: ".take <emoji>\nReply to a sticker with .take to customize its emoji",
  
  async execute(sock, m, args, PREFIX, extra) {
    const chatId = m.key.remoteJid;
    const { jidManager } = extra;
    
    const sendMessage = async (text) => {
      return await sock.sendMessage(chatId, { text }, { quoted: m });
    };
    
    // Owner check
    if (!jidManager.isOwner(m)) {
      return sock.sendMessage(chatId, {
        text: `❌ *Owner Only Command!*\n\nOnly the bot owner can use the take command.`
      }, { quoted: m });
    }
    
    try {
      // Get pushname (user's display name)
      const pushname = m.pushName || m.sender.split('@')[0] || "User";
      
      // Check if message is a reply to a sticker
      const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMessage?.stickerMessage) {
        // Alternative check: check m.quoted
        if (!m.quoted?.message?.stickerMessage) {
          return await sendMessage("❌ *Reply to a sticker first!*\n\nReply to any sticker with .take to copy it\n\n*Example:* Reply to sticker with: .take 😎");
        }
      }
      
      // Get the actual quoted message
      const stickerMessage = quotedMessage?.stickerMessage || m.quoted?.message?.stickerMessage;
      
      if (!stickerMessage) {
        return await sendMessage("❌ *That's not a sticker!*\n\nPlease reply to a sticker message.");
      }
      
      // Get the emoji from args or use default
      const emoji = args.length > 0 ? args[0] : '🤖';
      
      // Send processing message (optional)
      // await sendMessage(`📦 *Processing Sticker*\n\n✨ Pack: *WolfBot*\n👤 By: ${pushname}\n🎭 Emoji: ${emoji}\n⏳ Please wait...`);
      
      try {
        // Get the message key for download
        const messageKey = m.quoted?.key || {
          remoteJid: chatId,
          id: m.message?.extendedTextMessage?.contextInfo?.stanzaId || m.key.id,
          participant: m.sender
        };
        
        // Download the sticker
        const stickerBuffer = await downloadMediaMessage(
          {
            key: messageKey,
            message: { stickerMessage },
            messageType: 'stickerMessage'
          },
          'buffer',
          {},
          {
            logger: console,
            reuploadRequest: sock.updateMediaMessage
          }
        );
        
        if (!stickerBuffer) {
          return await sendMessage("❌ Failed to download sticker\n\n💡 The sticker might be too large or corrupted.");
        }
        
        // Add metadata using webpmux
        const img = new webp.Image();
        await img.load(stickerBuffer);
        
        // Create metadata - Always use WolfBot as pack name
        const json = {
          'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
          'sticker-pack-name': 'WolfBot', // Always use WolfBot
          'sticker-pack-publisher': pushname, // Keep user as publisher
          'emojis': [emoji] // Use provided emoji or default
        };
        
        // Create exif buffer
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        
        // Set the exif data
        img.exif = exif;
        
        // Get the final buffer with metadata
        const finalBuffer = await img.save(null);
        
        // Send the sticker
        await sock.sendMessage(chatId, {
          sticker: finalBuffer
        }, {
          quoted: m
        });
        
        // Send success message (optional)
        // await sendMessage(`✅ *Sticker Taken Successfully!*\n\n📦 Pack: WolfBot\n👤 By: ${pushname}\n🎭 Emoji: ${emoji}\n\n💡 The sticker now shows under "WolfBot" pack`);
        
        // Log the action
        const senderJid = m.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        console.log(`✅ Sticker taken by owner: ${cleaned.cleanNumber || 'Unknown'} with emoji: ${emoji}`);
        
      } catch (error) {
        console.error('Sticker processing error:', error);
        
        let errorMsg = "❌ *Sticker Processing Error*\n\n";
        if (error.message.includes('webp') || error.message.includes('Image')) {
          errorMsg += "Invalid sticker format or corrupted sticker.\n";
          errorMsg += "Try with a different sticker.\n";
        } else if (error.message.includes('download')) {
          errorMsg += "Failed to download sticker.\n";
          errorMsg += "The sticker might be too large.\n";
        } else {
          errorMsg += `Error: ${error.message}\n`;
        }
        
        errorMsg += "\n📌 *Requirements:*\n";
        errorMsg += "• Install: `npm install node-webpmux`\n";
        errorMsg += "• Sticker must be WebP format\n";
        
        await sendMessage(errorMsg);
      }
      
    } catch (error) {
      console.error('Error in take command:', error);
      await sendMessage(`❌ Command Error: ${error.message}\n\nTry sending the command again.`);
    }
  }
};