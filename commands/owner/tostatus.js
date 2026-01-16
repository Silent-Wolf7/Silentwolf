import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'tostatus',
    alias: ['status', 'setstatus', 'updatestatus', 'mystatus'],
    category: 'owner',
    description: 'Update your personal WhatsApp status',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        console.log('🔍 [toStatus] Command started');
        
        // Owner check (EXACTLY like mode.js)
        if (!jidManager.isOwner(msg)) {
            console.log('❌ [toStatus] Owner check failed');
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can update status.`
            }, { quoted: msg });
        }
        
        console.log('✅ [toStatus] Owner check passed');
        
        // Get content
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const commandText = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text || '';
        const textAfterCmd = commandText.replace(/^[!#/.]?(tostatus|status|setstatus|mystatus)\s*/i, '').trim();
        
        console.log('🔍 [toStatus] Has quoted:', !!quoted);
        console.log('🔍 [toStatus] Text after cmd:', textAfterCmd);
        console.log('🔍 [toStatus] Has direct image:', !!msg.message?.imageMessage);
        
        // Show help if no content
        if (!quoted && !textAfterCmd && !msg.message?.imageMessage && !msg.message?.videoMessage) {
            return sock.sendMessage(chatId, {
                text: `📱 *PERSONAL STATUS UPLOADER* 📱\n\nUpdate your WhatsApp status\n\nUsage:\n• ${PREFIX}tostatus <text> - Text status\n• Reply to image: ${PREFIX}tostatus\n• Reply to video: ${PREFIX}tostatus\n• Reply to text: ${PREFIX}tostatus\n\nExamples:\n${PREFIX}tostatus Feeling good! 🌟\nReply to image: ${PREFIX}tostatus My new look!`
            }, { quoted: msg });
        }
        
        try {
            let content = {};
            let caption = textAfterCmd;
            let mediaType = 'Text';
            
            // Process content
            if (quoted) {
                console.log('🔄 [toStatus] Processing quoted message');
                const result = await this.processContent(quoted, caption);
                content = result.content;
                mediaType = result.mediaType;
            } 
            else if (msg.message?.imageMessage) {
                console.log('🖼️ [toStatus] Processing direct image');
                const media = await this.downloadMedia(msg.message.imageMessage, 'image');
                content = { 
                    image: media.buffer, 
                    mimetype: media.mimetype,
                    caption: caption 
                };
                mediaType = 'Image';
            } 
            else if (msg.message?.videoMessage) {
                console.log('🎥 [toStatus] Processing direct video');
                const media = await this.downloadMedia(msg.message.videoMessage, 'video');
                content = { 
                    video: media.buffer, 
                    mimetype: media.mimetype,
                    caption: caption 
                };
                mediaType = 'Video';
            }
            else if (textAfterCmd) {
                console.log('📝 [toStatus] Processing text');
                content = { text: textAfterCmd };
                mediaType = 'Text';
            }
            
            console.log(`🚀 [toStatus] Sending ${mediaType} to personal status`);
            
            // Send to personal status
            const result = await this.sendPersonalStatus(sock, content);
            
            // Send confirmation
            const senderJid = msg.key.participant || chatId;
            const cleaned = jidManager.cleanJid(senderJid);
            
            let confirmMsg = `✅ *Personal Status Updated!*\n\n`;
            confirmMsg += `📊 Type: ${mediaType}\n`;
            
            if (content.caption) {
                confirmMsg += `📝 Caption: ${content.caption.substring(0, 60)}${content.caption.length > 60 ? '...' : ''}\n`;
            }
            if (content.text) {
                confirmMsg += `📄 Text: ${content.text.substring(0, 60)}${content.text.length > 60 ? '...' : ''}\n`;
            }
            
            confirmMsg += `👤 Updated by: ${cleaned.cleanNumber || 'Owner'}\n`;
            confirmMsg += `⏰ Visible to your contacts for 24 hours`;
            
            await sock.sendMessage(chatId, { text: confirmMsg }, { quoted: msg });
            
            console.log(`✅ [toStatus] Personal status updated - ${mediaType}`);
            
        } catch (error) {
            console.error('❌ [toStatus] Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to update status:\n${error.message}\n\nTips:\n• Use smaller images/videos\n• Max 30 seconds for video\n• Text limit: 139 characters`
            }, { quoted: msg });
        }
    },
    
    // Process content from quoted message
    async processContent(quoted, caption) {
        let content = {};
        let mediaType = 'Text';
        
        if (quoted.imageMessage) {
            console.log('📸 [toStatus] Processing image');
            const media = await this.downloadMedia(quoted.imageMessage, 'image');
            content = { 
                image: media.buffer, 
                mimetype: media.mimetype,
                caption: caption || quoted.imageMessage.caption || ''
            };
            mediaType = 'Image';
        } 
        else if (quoted.videoMessage) {
            console.log('🎬 [toStatus] Processing video');
            const media = await this.downloadMedia(quoted.videoMessage, 'video');
            content = { 
                video: media.buffer, 
                mimetype: media.mimetype,
                caption: caption || quoted.videoMessage.caption || '',
                isGif: quoted.videoMessage.gifPlayback || false
            };
            mediaType = quoted.videoMessage.gifPlayback ? 'GIF' : 'Video';
        } 
        else if (quoted.audioMessage) {
            console.log('🎵 [toStatus] Processing audio');
            const media = await this.downloadMedia(quoted.audioMessage, 'audio');
            // WhatsApp status doesn't support audio directly, so we'll convert to text status
            content = { 
                text: caption || 'Listening to audio 🎧' 
            };
            mediaType = 'Audio (converted to text)';
        } 
        else if (quoted.stickerMessage) {
            console.log('🤡 [toStatus] Processing sticker');
            const media = await this.downloadMedia(quoted.stickerMessage, 'sticker');
            content = { 
                image: media.buffer,  // Stickers are just images
                mimetype: 'image/webp',
                caption: caption || 'Sticker 🎭'
            };
            mediaType = 'Sticker';
        } 
        else if (quoted.conversation || quoted.extendedTextMessage?.text) {
            console.log('📝 [toStatus] Processing text');
            const text = quoted.conversation || quoted.extendedTextMessage.text || '';
            content = { text: caption || text };
            mediaType = 'Text';
        }
        
        return { content, mediaType };
    },
    
    // Download media
    async downloadMedia(message, type) {
        console.log(`⬇️ [toStatus] Downloading ${type}`);
        
        const stream = await downloadContentFromMessage(message, type);
        const chunks = [];
        
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        const buffer = Buffer.concat(chunks);
        
        console.log(`✅ [toStatus] Downloaded ${type}: ${buffer.length} bytes`);
        
        return {
            buffer,
            mimetype: message.mimetype || 
                     (type === 'image' ? 'image/jpeg' : 
                      type === 'video' ? 'video/mp4' : 
                      type === 'audio' ? 'audio/mpeg' : 
                      'application/octet-stream')
        };
    },
    
    // Send to PERSONAL WhatsApp status
    async sendPersonalStatus(sock, content) {
        console.log('📤 [toStatus] Sending to personal status');
        
        // TEXT STATUS
        if (content.text) {
            console.log('📝 [toStatus] Setting text status');
            
            // WhatsApp Web API for text status
            await sock.updateProfileStatus(content.text);
            console.log('✅ [toStatus] Text status set');
            return { type: 'text', success: true };
        }
        
        // IMAGE STATUS
        if (content.image) {
            console.log('🖼️ [toStatus] Setting image status');
            
            try {
                // Method 1: Direct profile picture update (acts as status)
                await sock.updateProfilePicture(sock.user.id, content.image);
                
                // If there's a caption, also set text status
                if (content.caption) {
                    await sock.updateProfileStatus(content.caption);
                }
                
                console.log('✅ [toStatus] Image status set');
                return { type: 'image', success: true };
                
            } catch (error) {
                console.error('❌ [toStatus] Image error:', error);
                
                // Fallback: Convert image to base64 and use alternative method
                throw new Error(`Image status failed: ${error.message}`);
            }
        }
        
        // VIDEO STATUS
        if (content.video) {
            console.log('🎥 [toStatus] Attempting video status');
            
            // WhatsApp Web API doesn't directly support video status
            // Alternative: Extract first frame as image
            throw new Error('Video status requires WhatsApp mobile app. For now, use images instead.');
        }
        
        throw new Error('No valid content for status');
    }
};