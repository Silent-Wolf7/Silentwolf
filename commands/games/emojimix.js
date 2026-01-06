























// import axios from 'axios';

// export default {
//   name: 'emojimix',
//   description: 'Mix two emojis together or create stickers',
//   category: 'fun',
//   aliases: ['mixemoji', 'emojifuse', 'emojisticker'],
//   usage: 'emojimix [emoji1] [emoji2] or emojimix sticker [emoji1] [emoji2]',
  
//   async execute(sock, m, args, PREFIX, extra) {
//     const jid = m.key.remoteJid;
    
//     // ====== HELP SECTION (GPT/Copilot style) ======
//     if (args.length === 0 || args[0].toLowerCase() === 'help') {
//       const helpText = `🎭 *EMOJI MIX*\n\n` +
//         `💡 *Usage:*\n` +
//         `• \`${PREFIX}emojimix 😂 😭\`\n` +
//         `• \`${PREFIX}emojimix 🐱 🐶\`\n` +
//         `• \`${PREFIX}emojimix sticker ❤️ ⭐\`\n` +
//         `• \`${PREFIX}emojimix 🍕 🍔\`\n` +
//         ``;
      
//       return sock.sendMessage(jid, { text: helpText }, { quoted: m });
//     }

//     // ====== CHECK FOR STICKER OPTION ======
//     let makeSticker = false;
//     let emoji1, emoji2;
    
//     if (args[0].toLowerCase() === 'sticker' && args.length >= 3) {
//       makeSticker = true;
//       emoji1 = args[1];
//       emoji2 = args[2];
//     } else if (args.length >= 2) {
//       emoji1 = args[0];
//       emoji2 = args[1];
//     } else {
//       return sock.sendMessage(jid, {
//         text: `❌ *Need two emojis!*\n\nUsage: ${PREFIX}emojimix 😂 😭\nFor sticker: ${PREFIX}emojimix sticker 😂 😭`
//       }, { quoted: m });
//     }

//     // ====== VALIDATE EMOJIS ======
//     const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
//     if (!emoji1.match(emojiRegex) || !emoji2.match(emojiRegex)) {
//       return sock.sendMessage(jid, {
//         text: `❌ *Invalid emojis!*\n\nPlease use real emojis.\nExample: ${PREFIX}emojimix 😂 😭`
//       }, { quoted: m });
//     }

//     try {
//       // ====== PROCESSING MESSAGE ======
//       const processText = makeSticker ? 
//         `🎭 *Creating Emoji Sticker...*\n\n${emoji1} + ${emoji2}` :
//         `🎭 *Mixing Emojis...*\n\n${emoji1} + ${emoji2}`;
      
//       const statusMsg = await sock.sendMessage(jid, {
//         text: processText
//       }, { quoted: m });

//       // ====== API REQUEST ======
//       const apiUrl = 'https://iamtkm.vercel.app/tools/emojimix';
      
//       const response = await axios({
//         method: 'GET',
//         url: apiUrl,
//         params: {
//           apikey: 'tkm',
//           emoji1: emoji1,
//           emoji2: emoji2
//         },
//         timeout: 15000,
//         responseType: 'arraybuffer',
//         headers: {
//           'User-Agent': 'WolfBot/1.0',
//           'Accept': 'image/*'
//         }
//       });

//       console.log(`✅ Emoji mix successful: ${emoji1} + ${emoji2}`);
      
//       // ====== SEND RESULT ======
//       const buffer = Buffer.from(response.data);
      
//       if (makeSticker) {
//         // Send as sticker
//         await sock.sendMessage(jid, {
//           sticker: buffer,
//           caption: `${emoji1} + ${emoji2}`
//         });
        
//         // Update status message
//         await sock.sendMessage(jid, {
//           text: `🎭 *Emoji Sticker Created!*\n\n${emoji1} + ${emoji2}\n\n✅ Sent as sticker`,
//           edit: statusMsg.key
//         });
        
//       } else {
//         // Send as image
//         await sock.sendMessage(jid, {
//           image: buffer,
//           caption: `🎭 *Emoji Mix:* ${emoji1} + ${emoji2}\n\n✨ Created with WolfBot`
//         });
        
//         // Update status message
//         await sock.sendMessage(jid, {
//           text: `🎭 *Emoji Mix Complete!*\n\n${emoji1} + ${emoji2}\n\n✅ Image sent successfully`,
//           edit: statusMsg.key
//         });
//       }

//     } catch (error) {
//       console.error('❌ [EMOJIMIX] ERROR:', error);
      
//       let errorMessage = `❌ *Failed to mix ${emoji1} + ${emoji2}*\n\n`;
      
//       if (error.code === 'ECONNREFUSED') {
//         errorMessage += `• API server is down\n`;
//       } else if (error.code === 'ETIMEDOUT') {
//         errorMessage += `• Request timeout\n`;
//       } else if (error.response?.status === 404) {
//         errorMessage += `• Emoji combination not found\n`;
//         errorMessage += `• Try different emojis\n`;
//       } else if (error.response?.status === 400) {
//         errorMessage += `• Invalid emoji format\n`;
//       } else {
//         errorMessage += `• Error: ${error.message}\n`;
//       }
      
//       errorMessage += `\n💡 *Try these popular combinations:*\n`;
//       errorMessage += `• ${PREFIX}emojimix 😂 😭\n`;
//       errorMessage += `• ${PREFIX}emojimix ❤️ ⭐\n`;
//       errorMessage += `• ${PREFIX}emojimix 🐱 🐶\n`;
//       errorMessage += `• ${PREFIX}emojimix sticker 😂 😭 (for sticker)`;
      
//       // Send error message
//       try {
//         await sock.sendMessage(jid, {
//           text: errorMessage,
//           edit: m.messageId || null
//         });
//       } catch (editError) {
//         await sock.sendMessage(jid, {
//           text: errorMessage
//         }, { quoted: m });
//       }
//     }
//   },
// };






















import axios from 'axios';
import sharp from 'sharp';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default {
  name: 'emojimix',
  description: 'Mix two emojis together or create stickers with WolfBot metadata',
  category: 'fun',
  aliases: ['mixemoji', 'emojifuse', 'emojisticker', 'emix'],
  usage: 'emojimix [emoji1] [emoji2] or emojimix sticker [emoji1] [emoji2]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === 'help') {
      const helpText = `🎭 *WOLFBOT EMOJI MIX*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}emojimix 😂 😭\` - Get mixed emoji image\n` +
        `• \`${PREFIX}emojimix sticker ❤️ ⭐\` - Get as WolfBot sticker\n` +
        `• \`${PREFIX}emojimix 🐱 🐶\` - Get image\n` +
        `• \`${PREFIX}emix -s 🍕 🍔\` - Sticker with flag\n` +
      ``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== PARSE ARGUMENTS ======
    let makeSticker = false;
    let emoji1, emoji2;
    
    // Check for sticker flag
    if ((args[0].toLowerCase() === 'sticker' || args[0] === '-s') && args.length >= 3) {
      makeSticker = true;
      emoji1 = args[1];
      emoji2 = args[2];
    } else if (args.length >= 2) {
      // Regular image mode
      emoji1 = args[0];
      emoji2 = args[1];
    } else {
      return sock.sendMessage(jid, {
        text: `❌ *Need two emojis!*\n\nUsage: ${PREFIX}emojimix 😂 😭\nFor sticker: ${PREFIX}emojimix sticker 😂 😭`
      }, { quoted: m });
    }

    // ====== VALIDATE EMOJIS ======
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    if (!emoji1.match(emojiRegex) || !emoji2.match(emojiRegex)) {
      return sock.sendMessage(jid, {
        text: `❌ *Invalid emojis!*\n\n"${emoji1}" and "${emoji2}" don't look like valid emojis.\n\n💡 Try: ${PREFIX}emojimix 😂 😭`
      }, { quoted: m });
    }

    // ====== POPULAR COMBINATIONS INFO ======
    const popularCombos = {
      '😂😭': 'Extreme laughter',
      '❤️⭐': 'Sparkling love',
      '🐱🐶': 'Pet combo',
      '🍕🍔': 'Fast food',
      '☀️🌙': 'Day & night',
      '🔥💧': 'Steam',
      '⚡🌩️': 'Storm',
      '🌹🌷': 'Flowers'
    };
    
    const comboKey = emoji1 + emoji2;
    const comboInfo = popularCombos[comboKey] || '';

    try {
      // ====== PROCESSING MESSAGE ======
      const modeText = makeSticker ? 'WolfBot Sticker' : 'Image';
      const statusText = `🎭 *Creating ${modeText}...*\n\n` +
                        `🔤 *Emojis:* ${emoji1} + ${emoji2}\n` +
                        (comboInfo ? `📝 *${comboInfo}*\n\n` : '\n') +
                        `⚡ *Mixing with API...*`;
      
      const statusMsg = await sock.sendMessage(jid, {
        text: statusText
      }, { quoted: m });

      // ====== GET EMOJI MIX FROM API ======
      const apiUrl = 'https://iamtkm.vercel.app/tools/emojimix';
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          apikey: 'tkm',
          emoji1: emoji1,
          emoji2: emoji2
        },
        timeout: 20000,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'WolfBot-EmojiMix/1.0',
          'Accept': 'image/*'
        }
      });

      console.log(`✅ Emoji mix API success: ${emoji1} + ${emoji2} (${response.data.length} bytes)`);
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `🎭 *Creating ${modeText}...* ✅\n⚡ *Processing image...*`,
        edit: statusMsg.key
      });

      const imageBuffer = Buffer.from(response.data);
      
      if (makeSticker) {
        // ====== CONVERT TO STICKER WITH WOLFBOT METADATA ======
        try {
          console.log(`🎨 Converting to WolfBot sticker...`);
          
          // Process image with sharp (similar to tosticker command)
          let processedImage = sharp(imageBuffer);
          
          // Auto-rotate based on EXIF
          processedImage = processedImage.rotate();
          
          // Get metadata for resizing
          const metadata = await sharp(imageBuffer).metadata().catch(() => ({ width: 0, height: 0 }));
          
          // Resize for WhatsApp stickers (max 512x512)
          const maxSize = 512;
          if (metadata.width > maxSize || metadata.height > maxSize) {
            processedImage = processedImage.resize(maxSize, maxSize, {
              fit: 'inside',
              withoutEnlargement: true,
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            });
          }
          
          // Convert to WebP
          const webpBuffer = await processedImage
            .webp({ 
              quality: 85,
              lossless: false,
              nearLossless: true,
              alphaQuality: 85,
              effort: 4
            })
            .toBuffer();
          
          console.log(`✅ WebP created: ${(webpBuffer.length / 1024).toFixed(1)}KB`);
          
          // Add WolfBot metadata to sticker
          console.log(`🎨 Adding WolfBot metadata...`);
          
          // Create combined emoji for sticker pack
          const combinedEmoji = getCombinedEmoji(emoji1, emoji2);
          const packName = 'WolfBot Emojis';
          const authorName = m.pushName || 'WolfBot User';
          
          const finalSticker = await addStickerMetadata(webpBuffer, {
            packName: packName,
            authorName: authorName,
            emoji: combinedEmoji
          });
          
          const finalSizeKB = (finalSticker.length / 1024).toFixed(1);
          console.log(`✅ Sticker with metadata: ${finalSizeKB}KB`);
          
          // Send the sticker
          await sock.sendMessage(jid, {
            sticker: finalSticker
          });
          
          // Success message
        //   const successText = `✅ *WolfBot Sticker Created!*\n\n` +
        //                      `🎭 *Emojis:* ${emoji1} + ${emoji2}\n` +
        //                      `🔤 *Combined:* ${combinedEmoji}\n` +
        //                      `📦 *Pack:* ${packName}\n` +
        //                      `👤 *By:* ${authorName}\n` +
        //                      `📊 *Size:* ${finalSizeKB}KB\n\n` +
        //                      `💡 *To save:*\n` +
        //                      `1. Long press sticker\n` +
        //                      `2. Tap "Add to sticker pack"\n` +
        //                      `3. It will appear under "WolfBot Emojis"`;
          
        //   await sock.sendMessage(jid, {
        //     text: successText
        //   });
          
        } catch (stickerError) {
          console.error('❌ Sticker creation error:', stickerError);
          
          // Fallback: Send as regular image if sticker creation fails
          await sock.sendMessage(jid, {
            image: imageBuffer,
            caption: `🎭 *Emoji Mix (Fallback):* ${emoji1} + ${emoji2}\n\n⚠️ Sticker creation failed. Sent as image instead.`
          });
          
          await sock.sendMessage(jid, {
            text: `⚠️ *Sticker Creation Failed*\n\nError: ${stickerError.message}\n\nSent as image instead.`
          });
        }
        
      } else {
        // ====== SEND AS REGULAR IMAGE ======
        const caption = `🎭 *Emoji Mix Result*\n\n` +
                       `🔤 *Combination:* ${emoji1} + ${emoji2}\n` +
                       (comboInfo ? `📝 *${comboInfo}*\n\n` : '\n') +
                       `✨ *Created with WolfBot*\n` +
                       `⚡ *Use \`${PREFIX}emojimix sticker ${emoji1} ${emoji2}\` for sticker`;
        
        await sock.sendMessage(jid, {
          image: imageBuffer,
          caption: caption
        });
        
        // Update status
        await sock.sendMessage(jid, {
          text: `✅ *Emoji Mix Complete!*\n\n${emoji1} + ${emoji2}\n\nImage sent successfully`,
          edit: statusMsg.key
        });
      }

    } catch (error) {
      console.error('❌ [EMOJIMIX] ERROR:', error);
      
      // ====== ERROR HANDLING ======
      let errorMessage = `❌ *Emoji Mix Failed!*\n\n` +
                        `🎭 *Attempted:* ${emoji1} + ${emoji2}\n\n`;
      
      if (error.response?.status === 404) {
        errorMessage += `⚠️ *Error:* This emoji combination doesn't work\n\n`;
        errorMessage += `💡 *Try these instead:*\n`;
        
        // Suggest popular combinations
        Object.entries(popularCombos).forEach(([combo, desc]) => {
          const [e1, e2] = combo.split('');
          errorMessage += `• ${PREFIX}emojimix ${e1} ${e2} - ${desc}\n`;
        });
        
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `⚠️ *Error:* Request timeout\n`;
        errorMessage += `• API is taking too long\n`;
        errorMessage += `• Try again in a moment\n\n`;
        errorMessage += `💡 *Quick fix:* ${PREFIX}emojimix 😂 😭`;
        
      } else if (error.message.includes('sharp')) {
        errorMessage += `⚠️ *Error:* Image processing failed\n`;
        errorMessage += `• Sharp module not installed\n`;
        errorMessage += `• Install: \`npm install sharp\`\n\n`;
        errorMessage += `💡 *Without sharp:* ${PREFIX}emojimix 😂 😭 (image only)`;
        
      } else if (error.message.includes('node-webpmux')) {
        errorMessage += `⚠️ *Error:* Sticker metadata failed\n`;
        errorMessage += `• WebP module not installed\n`;
        errorMessage += `• Install: \`npm install node-webpmux\`\n\n`;
        errorMessage += `💡 *Without metadata:* ${PREFIX}emojimix 😂 😭 (image only)`;
        
      } else {
        errorMessage += `⚠️ *Error:* ${error.message || 'Unknown error'}\n\n`;
        errorMessage += `🔧 *Troubleshooting:*\n`;
        errorMessage += `1. Check your internet\n`;
        errorMessage += `2. Try different emojis\n`;
        errorMessage += `3. Wait 1 minute\n`;
        errorMessage += `4. Use popular combinations\n\n`;
        errorMessage += `🎯 *Popular:* ${PREFIX}emojimix 😂 😭`;
      }
      
      // Send error message
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Function to add sticker metadata (WolfBot pack name)
async function addStickerMetadata(webpBuffer, metadata) {
  try {
    const { packName, authorName, emoji } = metadata;
    
    // Create webp image object
    const img = new webp.Image();
    await img.load(webpBuffer);
    
    // Create metadata JSON
    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': packName,
      'sticker-pack-publisher': authorName,
      'emojis': [emoji]
    };
    
    // Create EXIF buffer with metadata
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    
    // Set the EXIF data
    img.exif = exif;
    
    // Get final buffer with metadata
    const finalBuffer = await img.save(null);
    return finalBuffer;
    
  } catch (error) {
    console.error('❌ [METADATA] Error adding metadata:', error);
    // Return original buffer if metadata addition fails
    return webpBuffer;
  }
}

// Function to get combined emoji for sticker
function getCombinedEmoji(emoji1, emoji2) {
  // Try to create a logical combined emoji
  const combinations = {
    '😂😭': '🤣', // Laughing + Crying = Extremely funny
    '❤️⭐': '💫', // Heart + Star = Sparkling heart
    '🐱🐶': '🐈‍⬛', // Cat + Dog = Black cat
    '🍕🍔': '🍟', // Pizza + Burger = Fries
    '☀️🌙': '🌞', // Sun + Moon = Sun with face
    '🔥💧': '💨', // Fire + Water = Steam
    '⚡🌩️': '🌪️', // Lightning + Cloud = Tornado
    '🌹🌷': '💐', // Rose + Tulip = Bouquet
  };
  
  const key = emoji1 + emoji2;
  if (combinations[key]) {
    return combinations[key];
  }
  
  // Default: use first emoji
  return emoji1;
}

// Fallback function if sharp is not available
async function convertToWebPFallback(buffer) {
  // Simple conversion without sharp
  // This is a minimal fallback
  return buffer;
}