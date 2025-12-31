import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import fs from 'fs';

export default {
  name: 'toimage',
  description: 'Convert sticker to image using sharp',
  category: 'converter',

  async execute(sock, m, args) {
    console.log('🖼️ [TOIMAGE] Command triggered');
    
    const jid = m.key.remoteJid;
    const prefix = '#';
    
    if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
      await sock.sendMessage(jid, { 
        text: `🖼️ *Sticker to Image*\n💡 *Usage:*\n• Reply to a sticker with \`${prefix}toimage\`` 
      }, { quoted: m });
      return;
    }

    const quoted = m.message.extendedTextMessage.contextInfo;
    
    await sock.sendMessage(jid, { 
      text: `⏳ *Converting sticker to image...*` 
    }, { quoted: m });

    try {
      console.log(`🖼️ [TOIMAGE] Downloading sticker...`);
      
      // Download sticker
      const stream = await downloadContentFromMessage(
        quoted.quotedMessage.stickerMessage, 
        'sticker'
      );
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      console.log(`🖼️ [TOIMAGE] Sticker size: ${buffer.length} bytes`);
      
      // Check if it's animated (WEBP with animation)
      // Simple check for animated webp
      const isAnimated = buffer.toString('hex').includes('414e494d') || // 'ANIM' in hex
                         buffer.includes('ANMF'); // Animation frame marker
      
      if (isAnimated) {
        throw new Error('Animated stickers cannot be converted to static images');
      }

      console.log(`🖼️ [TOIMAGE] Converting with sharp...`);
      
      // Convert directly from buffer without saving to file
      const imageBuffer = await sharp(buffer)
        .png() // Convert to PNG
        .toBuffer();
      
      const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);
      console.log(`✅ [TOIMAGE] Conversion complete: ${fileSizeKB}KB`);
      
      // Send the converted image
      await sock.sendMessage(jid, {
        image: imageBuffer,
        caption: `🖼️ *Sticker Converted*\n📦 *Size:* ${fileSizeKB}KB\n✨ *Format:* PNG`
      }, { quoted: m });
      
      console.log(`✅ [TOIMAGE] Image sent successfully`);

    } catch (error) {
      console.error('❌ [TOIMAGE] Error:', error);
      
      let errorMsg = `❌ *Conversion failed*\n\n⚠️ *Error:* ${error.message}`;
      
      if (error.message.includes('sharp') || error.message.includes('libvips')) {
        errorMsg += "\n• Sharp library issue";
        errorMsg += "\n• Install: `npm install sharp`";
      } else if (error.message.includes('Animated')) {
        errorMsg += "\n• Animated stickers cannot be converted";
        errorMsg += "\n• Use static stickers only";
      }
      
      errorMsg += "\n\n💡 *Tips:*\n• Use static stickers (not animated)\n• Make sure sticker is not corrupted";
      
      await sock.sendMessage(jid, { 
        text: errorMsg
      }, { quoted: m });
    }
  }
};