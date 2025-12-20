









// // File: ./commands/utility/antidelete.js - UPDATED WITH PUBLIC/PRIVATE MODES
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { downloadMediaMessage } from '@whiskeysockets/baileys';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');

// // Owner JID configuration
// let OWNER_JID = null;
// let OWNER_NUMBER = null;

// // Load owner info
// async function loadOwnerInfo() {
//     try {
//         // Try multiple possible locations
//         const possiblePaths = [
//             './owner.json',
//             '../owner.json',
//             '../../owner.json',
//             '../../../owner.json',
//             path.join(__dirname, '../../../owner.json')
//         ];
        
//         for (const ownerPath of possiblePaths) {
//             try {
//                 if (await fs.access(ownerPath).then(() => true).catch(() => false)) {
//                     const ownerData = JSON.parse(await fs.readFile(ownerPath, 'utf8'));
//                     OWNER_JID = ownerData.OWNER_JID || ownerData.ownerLID || 
//                                (ownerData.OWNER_NUMBER ? ownerData.OWNER_NUMBER + '@s.whatsapp.net' : null);
//                     OWNER_NUMBER = ownerData.OWNER_NUMBER || ownerData.ownerNumber;
                    
//                     if (OWNER_JID) {
//                         console.log(`👑 Owner loaded: ${OWNER_NUMBER} (${OWNER_JID})`);
//                         break;
//                     }
//                 }
//             } catch (error) {
//                 // Continue to next path
//             }
//         }
//     } catch (error) {
//         console.error('❌ Error loading owner info:', error.message);
//     }
// }

// // Call on import
// loadOwnerInfo();

// export default {
//     name: 'antidelete',
//     alias: ['undelete', 'antidel', 'ad'],
//     description: 'Capture deleted messages with public/private modes',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX, metadata = {}) {
//         const chatId = msg.key.remoteJid;
//         const isGroup = chatId.endsWith('@g.us');
        
//         console.log('🚫 Antidelete System - Public/Private Modes');
        
//         // Extract jidManager if available
//         const jidManager = metadata.jidManager || {
//             cleanJid: (jid) => {
//                 if (!jid) return { cleanJid: 'unknown', cleanNumber: 'unknown', isLid: false };
//                 let clean = jid.split(':')[0];
//                 let cleanNumber = clean.split('@')[0];
//                 return {
//                     cleanJid: clean,
//                     cleanNumber: cleanNumber,
//                     isLid: clean.includes('@lid'),
//                     original: jid
//                 };
//             },
//             isOwner: (msg) => {
//                 const senderJid = msg.key.participant || msg.key.remoteJid;
//                 const cleaned = this.cleanJid(senderJid);
//                 return cleaned.cleanNumber === OWNER_NUMBER || msg.key.fromMe;
//             },
//             getOwnerInfo: () => ({
//                 cleanJid: OWNER_JID || 'Not configured',
//                 cleanNumber: OWNER_NUMBER || 'Not configured',
//                 isLid: OWNER_JID ? OWNER_JID.includes('@lid') : false
//             })
//         };
        
//         // Initialize global tracker
//         if (!global.antideleteTerminal) {
//             global.antideleteTerminal = {
//                 active: false,
//                 mode: 'public', // 'public' or 'private'
//                 messageCache: new Map(),
//                 listenerSetup: false,
//                 notifyInChat: true,
//                 stats: {
//                     deletionsDetected: 0,
//                     retrievedSuccessfully: 0,
//                     mediaRetrieved: 0,
//                     falsePositives: 0,
//                     mediaDownloaded: 0,
//                     mediaSent: 0,
//                     sentToDm: 0,
//                     sentToChat: 0
//                 },
//                 seenMessages: new Map(),
//                 processedDeletions: new Set(),
//                 mediaStorage: new Map(),
//                 cleanupInterval: null,
//                 lastCleanup: Date.now(),
//                 // Track DMs sent to owner
//                 ownerDmLog: new Map(),
//                 // Configuration
//                 config: {
//                     autoCleanup: true,
//                     maxStorageHours: 24,
//                     notifyOnModeChange: true,
//                     stealthMode: false,
//                     logToTerminal: true
//                 }
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // ====== UTILITY FUNCTIONS ======
        
//         // Check if sender is owner
//         function isOwner(msg) {
//             if (!msg) return false;
            
//             // fromMe is always owner
//             if (msg.key.fromMe) return true;
            
//             const senderJid = msg.key.participant || msg.key.remoteJid;
//             const cleaned = jidManager.cleanJid(senderJid);
            
//             // Check against stored owner
//             if (OWNER_NUMBER && cleaned.cleanNumber === OWNER_NUMBER) return true;
            
//             // Check using jidManager
//             if (jidManager.isOwner) {
//                 return jidManager.isOwner(msg);
//             }
            
//             return false;
//         }
        
//         // Get owner JID
//         function getOwnerJid() {
//             if (OWNER_JID) return OWNER_JID;
//             if (jidManager.getOwnerInfo) {
//                 const info = jidManager.getOwnerInfo();
//                 return info.cleanJid !== 'Not configured' ? info.cleanJid : null;
//             }
//             return null;
//         }
        
//         // Log messages
//         function cleanLog(message, type = 'info') {
//             if (!tracker.config.logToTerminal) return;
            
//             const prefixes = {
//                 'info': '📝',
//                 'success': '✅',
//                 'error': '❌',
//                 'warning': '⚠️',
//                 'system': '🚫',
//                 'media': '📷',
//                 'deletion': '🗑️',
//                 'dm': '📨',
//                 'mode': '🔄'
//             };
            
//             const prefix = prefixes[type] || '📝';
//             console.log(`${prefix} Antidelete: ${message}`);
//         }
        
//         // Ensure media directory
//         async function ensureMediaDir() {
//             try {
//                 await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
//                 return true;
//             } catch (error) {
//                 cleanLog(`Directory error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // ====== MEDIA HANDLING FUNCTIONS ======
        
//         // Download media properly
//         async function downloadMediaProperly(message) {
//             try {
//                 const msgId = message.key?.id;
//                 if (!msgId) return null;
                
//                 cleanLog(`Downloading media for: ${msgId.substring(0, 8)}...`, 'media');
                
//                 const buffer = await downloadMediaMessage(
//                     message,
//                     'buffer',
//                     {},
//                     {
//                         logger: { level: 'silent' },
//                         reuploadRequest: sock.updateMediaMessage
//                     }
//                 );
                
//                 if (!buffer || buffer.length === 0) {
//                     cleanLog('Empty buffer returned', 'warning');
//                     return null;
//                 }
                
//                 cleanLog(`Downloaded: ${buffer.length} bytes`, 'success');
//                 return buffer;
                
//             } catch (error) {
//                 cleanLog(`Download error: ${error.message}`, 'error');
//                 return null;
//             }
//         }
        
//         // Save media to file
//         async function saveMediaFile(messageId, buffer, type, mimetype, originalMessage) {
//             try {
//                 await ensureMediaDir();
                
//                 // Generate filename
//                 const timestamp = Date.now();
//                 let extension = getFileExtension(type, mimetype);
//                 const filename = `antidelete_${messageId.substring(0, 8)}_${timestamp}${extension}`;
//                 const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
//                 // Write file
//                 await fs.writeFile(filePath, buffer);
                
//                 // Store metadata
//                 tracker.mediaStorage.set(messageId, {
//                     filePath: filePath,
//                     buffer: buffer,
//                     type: type,
//                     mimetype: mimetype || getMimeType(type),
//                     filename: filename,
//                     size: buffer.length,
//                     timestamp: timestamp,
//                     originalMessage: originalMessage
//                 });
                
//                 cleanLog(`Saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'media');
//                 tracker.stats.mediaDownloaded++;
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Save error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Get file extension
//         function getFileExtension(type, mimetype = '') {
//             switch(type) {
//                 case 'image':
//                     if (mimetype.includes('png')) return '.png';
//                     if (mimetype.includes('gif')) return '.gif';
//                     if (mimetype.includes('webp')) return '.webp';
//                     return '.jpg';
//                 case 'video':
//                     if (mimetype.includes('gif')) return '.gif';
//                     if (mimetype.includes('webm')) return '.webm';
//                     return '.mp4';
//                 case 'audio':
//                     if (mimetype.includes('ogg')) return '.ogg';
//                     if (mimetype.includes('mp3')) return '.mp3';
//                     return '.m4a';
//                 case 'sticker':
//                     return '.webp';
//                 case 'document':
//                     const originalExt = mimetype.split('/')[1];
//                     return originalExt ? `.${originalExt.split(';')[0]}` : '.bin';
//                 default:
//                     return '.dat';
//             }
//         }
        
//         // Get mime type
//         function getMimeType(type) {
//             switch(type) {
//                 case 'image': return 'image/jpeg';
//                 case 'video': return 'video/mp4';
//                 case 'audio': return 'audio/mp4';
//                 case 'sticker': return 'image/webp';
//                 case 'document': return 'application/octet-stream';
//                 default: return 'application/octet-stream';
//             }
//         }
        
//         // Send media to chat (public mode)
//         async function sendMediaToChat(messageDetails) {
//             try {
//                 const messageId = messageDetails.id;
//                 const mediaInfo = tracker.mediaStorage.get(messageId);
                
//                 if (!mediaInfo) {
//                     return sendTextNotification(messageDetails);
//                 }
                
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 let caption = `🚫 *DELETED ${messageDetails.type.toUpperCase()}*\n\n`;
//                 caption += `👤 From: ${senderName}\n`;
//                 caption += `📞 Number: ${messageDetails.senderShort}\n`;
//                 caption += `🕒 Time: ${time}\n`;
                
//                 if (messageDetails.caption) {
//                     caption += `💬 Caption: ${messageDetails.caption}\n`;
//                 }
                
//                 caption += `\n🔍 *Captured by antidelete*`;
                
//                 // Read buffer
//                 let buffer = mediaInfo.buffer;
//                 if (!buffer) {
//                     buffer = await fs.readFile(mediaInfo.filePath);
//                 }
                
//                 if (!buffer || buffer.length === 0) {
//                     return sendTextNotification(messageDetails);
//                 }
                
//                 // Send based on type
//                 switch(messageDetails.type) {
//                     case 'image':
//                         await sock.sendMessage(messageDetails.chat, {
//                             image: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'video':
//                         await sock.sendMessage(messageDetails.chat, {
//                             video: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'audio':
//                         await sock.sendMessage(messageDetails.chat, {
//                             audio: buffer,
//                             mimetype: mediaInfo.mimetype,
//                             ptt: mediaInfo.mimetype?.includes('ogg')
//                         });
//                         break;
                        
//                     case 'document':
//                         await sock.sendMessage(messageDetails.chat, {
//                             document: buffer,
//                             fileName: messageDetails.fileName || 'document',
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'sticker':
//                         await sock.sendMessage(messageDetails.chat, {
//                             sticker: buffer,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     default:
//                         return sendTextNotification(messageDetails);
//                 }
                
//                 tracker.stats.mediaSent++;
//                 tracker.stats.sentToChat++;
//                 cleanLog(`Media sent to chat: ${messageDetails.type}`, 'success');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Send to chat error: ${error.message}`, 'error');
//                 return sendTextNotification(messageDetails);
//             }
//         }
        
//         // Send media to owner's DM (private mode)
//         async function sendMediaToOwnerDM(messageDetails) {
//             try {
//                 const ownerJid = getOwnerJid();
//                 if (!ownerJid) {
//                     cleanLog('Owner JID not found', 'error');
//                     return false;
//                 }
                
//                 const messageId = messageDetails.id;
//                 const mediaInfo = tracker.mediaStorage.get(messageId);
                
//                 if (!mediaInfo) {
//                     return sendTextToOwnerDM(messageDetails);
//                 }
                
//                 const time = new Date(messageDetails.timestamp).toLocaleString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
//                 const chatName = messageDetails.chatName || 'Unknown Chat';
                
//                 // Read buffer
//                 let buffer = mediaInfo.buffer;
//                 if (!buffer) {
//                     buffer = await fs.readFile(mediaInfo.filePath);
//                 }
                
//                 if (!buffer || buffer.length === 0) {
//                     return sendTextToOwnerDM(messageDetails);
//                 }
                
//                 // Create detailed caption for owner
//                 let caption = `🔒 *PRIVATE ANTIDELETE - DELETED ${messageDetails.type.toUpperCase()}*\n\n`;
//                 caption += `👤 Sender: ${senderName}\n`;
//                 caption += `📞 Number: ${messageDetails.senderShort}\n`;
//                 caption += `💬 Chat: ${chatName}\n`;
//                 caption += `🏷️ Type: ${messageDetails.chatType}\n`;
//                 caption += `🕒 Time: ${time}\n`;
//                 caption += `📊 Size: ${Math.round(mediaInfo.size/1024)}KB\n`;
                
//                 if (messageDetails.caption) {
//                     caption += `📝 Caption: ${messageDetails.caption}\n`;
//                 }
                
//                 caption += `\n🔐 *Sent to your DM via private antidelete*`;
                
//                 // Send based on type
//                 switch(messageDetails.type) {
//                     case 'image':
//                         await sock.sendMessage(ownerJid, {
//                             image: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'video':
//                         await sock.sendMessage(ownerJid, {
//                             video: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'audio':
//                         await sock.sendMessage(ownerJid, {
//                             audio: buffer,
//                             mimetype: mediaInfo.mimetype,
//                             ptt: mediaInfo.mimetype?.includes('ogg'),
//                             caption: caption
//                         });
//                         break;
                        
//                     case 'document':
//                         await sock.sendMessage(ownerJid, {
//                             document: buffer,
//                             fileName: `${messageDetails.fileName || 'document'}_${Date.now()}`,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         break;
                        
//                     case 'sticker':
//                         await sock.sendMessage(ownerJid, {
//                             sticker: buffer,
//                             mimetype: mediaInfo.mimetype
//                         });
//                         // Send caption separately for stickers
//                         await sock.sendMessage(ownerJid, {
//                             text: caption
//                         });
//                         break;
                        
//                     default:
//                         return sendTextToOwnerDM(messageDetails);
//                 }
                
//                 tracker.stats.mediaSent++;
//                 tracker.stats.sentToDm++;
                
//                 // Log this DM
//                 tracker.ownerDmLog.set(messageId, {
//                     timestamp: Date.now(),
//                     sender: messageDetails.senderShort,
//                     type: messageDetails.type,
//                     chat: chatName
//                 });
                
//                 cleanLog(`Media sent to owner DM: ${messageDetails.type}`, 'dm');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Send to DM error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Send text notification to chat
//         async function sendTextNotification(messageDetails) {
//             const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//             const senderName = messageDetails.pushName || messageDetails.senderShort;
            
//             let textMessage = `🚫 *DELETED MESSAGE*\n\n`;
//             textMessage += `👤 *From:* ${senderName}\n`;
//             textMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//             textMessage += `🕒 *Time:* ${time}\n`;
//             textMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
            
//             if (messageDetails.text) {
//                 textMessage += `\n💬 *Message:*\n${messageDetails.text.substring(0, 500)}`;
//                 if (messageDetails.text.length > 500) textMessage += '...';
//             }
            
//             if (messageDetails.hasMedia) {
//                 textMessage += `\n\n📎 *Media captured but not retrievable*`;
//             }
            
//             textMessage += `\n\n────────────\n`;
//             textMessage += `🔍 *Captured by antidelete*`;
            
//             await sock.sendMessage(messageDetails.chat, { text: textMessage });
//             tracker.stats.sentToChat++;
//             cleanLog('Text notification sent to chat', 'info');
//         }
        
//         // Send text to owner DM
//         async function sendTextToOwnerDM(messageDetails) {
//             try {
//                 const ownerJid = getOwnerJid();
//                 if (!ownerJid) return false;
                
//                 const time = new Date(messageDetails.timestamp).toLocaleString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
//                 const chatName = messageDetails.chatName || 'Unknown Chat';
                
//                 let textMessage = `🔒 *PRIVATE ANTIDELETE - DELETED MESSAGE*\n\n`;
//                 textMessage += `👤 *Sender:* ${senderName}\n`;
//                 textMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//                 textMessage += `💬 *Chat:* ${chatName}\n`;
//                 textMessage += `🏷️ *Type:* ${messageDetails.chatType}\n`;
//                 textMessage += `🕒 *Time:* ${time}\n`;
//                 textMessage += `📊 *Message Type:* ${messageDetails.type.toUpperCase()}\n`;
                
//                 if (messageDetails.text) {
//                     textMessage += `\n📝 *Content:*\n${messageDetails.text.substring(0, 800)}`;
//                     if (messageDetails.text.length > 800) textMessage += '...';
//                 }
                
//                 if (messageDetails.hasMedia) {
//                     textMessage += `\n\n📎 *Media:* ${tracker.mediaStorage.has(messageDetails.id) ? 'Captured ✓' : 'Not retrievable'}`;
//                 }
                
//                 textMessage += `\n\n────────────\n`;
//                 textMessage += `🔐 *Private antidelete capture*`;
                
//                 await sock.sendMessage(ownerJid, { text: textMessage });
//                 tracker.stats.sentToDm++;
                
//                 // Log this DM
//                 tracker.ownerDmLog.set(messageDetails.id, {
//                     timestamp: Date.now(),
//                     sender: messageDetails.senderShort,
//                     type: messageDetails.type,
//                     chat: chatName
//                 });
                
//                 cleanLog('Text sent to owner DM', 'dm');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`DM text error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Clean up media
//         async function cleanupMedia(messageId) {
//             try {
//                 if (tracker.mediaStorage.has(messageId)) {
//                     const mediaInfo = tracker.mediaStorage.get(messageId);
//                     try {
//                         await fs.unlink(mediaInfo.filePath);
//                         cleanLog(`Cleaned: ${mediaInfo.filename}`, 'info');
//                     } catch (error) {
//                         // File might already be deleted
//                     }
//                     tracker.mediaStorage.delete(messageId);
//                 }
//             } catch (error) {
//                 // Silent cleanup
//             }
//         }
        
//         // ====== CORE FUNCTIONS ======
        
//         // Setup cleanup
//         function setupCleanupInterval() {
//             if (tracker.cleanupInterval) {
//                 clearInterval(tracker.cleanupInterval);
//             }
            
//             tracker.cleanupInterval = setInterval(async () => {
//                 await cleanupOldData();
//             }, 10 * 60 * 1000); // Every 10 minutes
//         }
        
//         // Cleanup old data
//         async function cleanupOldData() {
//             const now = Date.now();
//             const maxAge = tracker.config.maxStorageHours * 60 * 60 * 1000;
            
//             // Clean media files
//             for (const [msgId, mediaInfo] of tracker.mediaStorage.entries()) {
//                 if (now - mediaInfo.timestamp > maxAge) {
//                     await cleanupMedia(msgId);
//                 }
//             }
            
//             // Clean old messages
//             for (const [msgId, data] of tracker.messageCache.entries()) {
//                 if (now - data.timestamp > maxAge) {
//                     tracker.messageCache.delete(msgId);
//                 }
//             }
            
//             // Clean old DM logs
//             for (const [msgId, log] of tracker.ownerDmLog.entries()) {
//                 if (now - log.timestamp > maxAge) {
//                     tracker.ownerDmLog.delete(msgId);
//                 }
//             }
            
//             tracker.lastCleanup = now;
//         }
        
//         // Get chat name
//         async function getChatName(chatId) {
//             try {
//                 if (chatId.endsWith('@g.us')) {
//                     const metadata = await sock.groupMetadata(chatId);
//                     return metadata.subject || 'Group Chat';
//                 }
//                 return 'Private Chat';
//             } catch (error) {
//                 return 'Unknown Chat';
//             }
//         }
        
//         // Store message with media
//         async function storeMessageWithMedia(message) {
//             try {
//                 const msgId = message.key.id;
//                 const msgChat = message.key.remoteJid;
                
//                 if (tracker.messageCache.has(msgId)) return;
                
//                 const sender = message.key.participant || msgChat;
//                 const senderShort = sender.split('@')[0];
                
//                 // Extract message info
//                 let text = '';
//                 let type = 'text';
//                 let fileName = '';
//                 let caption = '';
//                 let hasMedia = false;
//                 let mimetype = '';
                
//                 const msgContent = message.message;
                
//                 // Extract text
//                 if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 }
                
//                 // Detect media type
//                 if (msgContent?.imageMessage) {
//                     type = 'image';
//                     caption = msgContent.imageMessage.caption || '';
//                     mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
//                     hasMedia = true;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     caption = msgContent.videoMessage.caption || '';
//                     mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
//                     hasMedia = true;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     mimetype = msgContent.audioMessage.mimetype || 'audio/mp4';
//                     hasMedia = true;
//                     if (!text) text = 'Audio message';
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     fileName = msgContent.documentMessage.fileName || 'Document';
//                     mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
//                     hasMedia = true;
//                     if (!text) text = fileName;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
//                     hasMedia = true;
//                     if (!text) text = 'Sticker';
//                 }
                
//                 if (!text && caption) text = caption;
                
//                 // Get chat name
//                 const chatName = await getChatName(msgChat);
//                 const chatType = msgChat.endsWith('@g.us') ? 'Group' : 'Private';
                
//                 // Store message details
//                 const messageDetails = {
//                     id: msgId,
//                     chat: msgChat,
//                     sender: sender,
//                     senderShort: senderShort,
//                     timestamp: Date.now(),
//                     messageTimestamp: message.messageTimestamp || Date.now(),
//                     pushName: message.pushName || 'Unknown',
//                     text: text,
//                     type: type,
//                     hasMedia: hasMedia,
//                     fileName: fileName,
//                     caption: caption,
//                     mimetype: mimetype,
//                     originalMessage: message,
//                     mediaDownloaded: false,
//                     chatName: chatName,
//                     chatType: chatType
//                 };
                
//                 tracker.messageCache.set(msgId, messageDetails);
                
//                 // Download media in background if it exists
//                 if (hasMedia) {
//                     setTimeout(async () => {
//                         try {
//                             cleanLog(`Downloading media for ${msgId.substring(0, 8)}...`, 'media');
//                             const buffer = await downloadMediaProperly(message);
                            
//                             if (buffer) {
//                                 await saveMediaFile(msgId, buffer, type, mimetype, message);
//                                 messageDetails.mediaDownloaded = true;
//                                 cleanLog(`Media saved for ${msgId.substring(0, 8)}`, 'success');
//                             } else {
//                                 cleanLog(`Could not download media for ${msgId.substring(0, 8)}`, 'warning');
//                             }
//                         } catch (error) {
//                             cleanLog(`Background download error: ${error.message}`, 'error');
//                         }
//                     }, 1000);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Store error: ${error.message}`, 'error');
//             }
//         }
        
//         // Handle deleted message
//         async function handleDeletedMessage(deletedKey) {
//             try {
//                 const deletedId = deletedKey.id;
                
//                 if (!deletedId || tracker.processedDeletions.has(deletedId)) return;
                
//                 tracker.processedDeletions.add(deletedId);
//                 setTimeout(() => {
//                     tracker.processedDeletions.delete(deletedId);
//                 }, 10000);
                
//                 cleanLog(`Deletion detected: ${deletedId.substring(0, 8)}...`, 'deletion');
//                 tracker.stats.deletionsDetected++;
                
//                 const cachedMessage = tracker.messageCache.get(deletedId);
                
//                 if (cachedMessage) {
//                     tracker.messageCache.delete(deletedId);
                    
//                     // Process based on mode
//                     if (tracker.mode === 'private') {
//                         await sendMediaToOwnerDM(cachedMessage);
//                     } else {
//                         await sendMediaToChat(cachedMessage);
//                     }
                    
//                     tracker.stats.retrievedSuccessfully++;
//                     if (cachedMessage.hasMedia) {
//                         tracker.stats.mediaRetrieved++;
//                     }
                    
//                     // Clean up after delay
//                     setTimeout(() => {
//                         cleanupMedia(deletedId);
//                     }, 30000);
                    
//                 } else {
//                     cleanLog(`Not found in cache: ${deletedId.substring(0, 8)}...`, 'warning');
//                     tracker.stats.falsePositives++;
//                 }
                
//             } catch (error) {
//                 cleanLog(`Retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Setup listener
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog(`Setting up antidelete in ${tracker.mode} mode...`, 'system');
            
//             ensureMediaDir();
//             setupCleanupInterval();
            
//             // Store messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     if (type === 'notify') {
//                         for (const message of messages) {
//                             if (message.key?.fromMe) continue;
                            
//                             const msgId = message.key?.id;
//                             if (!msgId) continue;
                            
//                             tracker.seenMessages.set(msgId, Date.now());
//                             await storeMessageWithMedia(message);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Storage error: ${error.message}`, 'error');
//                 }
//             });
            
//             // Handle deletions
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
//                         const messageId = update.key?.id;
//                         const chatId = update.key?.remoteJid;
                        
//                         if (!messageId || !chatId) continue;
                        
//                         const isDeleted = 
//                             updateData.status === 6 ||
//                             updateData.message === null ||
//                             (updateData.messageStubType === 7) ||
//                             (updateData.messageStubType === 8);
                        
//                         if (isDeleted) {
//                             await handleDeletedMessage(update.key);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Detection error: ${error.message}`, 'error');
//                 }
//             });
            
//             tracker.listenerSetup = true;
//             cleanLog(`Listener ready in ${tracker.mode} mode`, 'success');
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 // Check if user is owner for private mode
//                 if (args[1]?.toLowerCase() === 'private') {
//                     if (!isOwner(msg)) {
//                         return sock.sendMessage(chatId, {
//                             text: `❌ *Owner Only*\n\nOnly the bot owner can enable private mode.\n\nCurrent owner: ${OWNER_NUMBER || 'Not set'}`
//                         }, { quoted: msg });
//                     }
//                     tracker.mode = 'private';
//                 } else {
//                     tracker.mode = 'public';
//                 }
                
//                 tracker.active = true;
                
//                 // Reset stats
//                 Object.keys(tracker.stats).forEach(key => {
//                     tracker.stats[key] = 0;
//                 });
                
//                 setupTerminalListener();
                
//                 const modeText = tracker.mode === 'private' ? 
//                     `🔒 *PRIVATE MODE*\n\nAll deleted messages will be sent to owner's DM:\n${getOwnerJid() || 'Owner not set'}` :
//                     `🌐 *PUBLIC MODE*\n\nDeleted messages will be shown in the original chat.`;
                
//                 cleanLog(`Antidelete ${tracker.mode.toUpperCase()} mode enabled`, 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\n${modeText}\n\nFeatures:\n• Uses proper media download\n• Auto-cleanup after sending\n• Captures all message types\n\nUse \`${PREFIX}antidelete test\` to verify.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'disable':
//             case 'stop':
//                 tracker.active = false;
//                 if (tracker.cleanupInterval) {
//                     clearInterval(tracker.cleanupInterval);
//                     tracker.cleanupInterval = null;
//                 }
                
//                 // Clean up all files
//                 for (const msgId of tracker.mediaStorage.keys()) {
//                     await cleanupMedia(msgId);
//                 }
                
//                 cleanLog('Antidelete disabled', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE DISABLED*\n\nAll media files cleaned up.\nMode was: ${tracker.mode.toUpperCase()}\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'mode':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nOnly the bot owner can change modes.`
//                     }, { quoted: msg });
//                 }
                
//                 const newMode = args[1]?.toLowerCase();
//                 if (!newMode || !['public', 'private'].includes(newMode)) {
//                     return sock.sendMessage(chatId, {
//                         text: `🔧 *Mode Settings*\n\nCurrent mode: ${tracker.mode.toUpperCase()}\n\nAvailable modes:\n• \`${PREFIX}antidelete mode public\` - Show in chat\n• \`${PREFIX}antidelete mode private\` - Send to owner DM\n\nOwner: ${OWNER_NUMBER || 'Not set'}`
//                     }, { quoted: msg });
//                 }
                
//                 const oldMode = tracker.mode;
//                 tracker.mode = newMode;
                
//                 cleanLog(`Mode changed: ${oldMode} → ${newMode}`, 'mode');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔄 *Mode Changed*\n\n${oldMode.toUpperCase()} → ${newMode.toUpperCase()}\n\n${
//                         newMode === 'private' ? 
//                         `Deleted messages will now be sent to your DM.` :
//                         `Deleted messages will now be shown in the original chat.`
//                     }`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//                 if (tracker.mode === 'private' && !isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nPrivate mode tests can only be run by the owner.\n\nCurrent owner: ${OWNER_NUMBER || 'Not set'}`
//                     }, { quoted: msg });
//                 }
                
//                 cleanLog('Sending test messages...', 'info');
                
//                 // Send test messages based on mode
//                 if (tracker.mode === 'private') {
//                     await sock.sendMessage(chatId, {
//                         text: `🔒 *PRIVATE MODE TEST*\n\n1. Send any message in this chat\n2. Delete it\n3. It will be sent to owner's DM\n\nOwner: ${OWNER_NUMBER || 'Not set'}`
//                     });
                    
//                     // Also send a DM to owner if available
//                     const ownerJid = getOwnerJid();
//                     if (ownerJid) {
//                         await sock.sendMessage(ownerJid, {
//                             text: `🔒 *Private Antidelete Test*\n\nIf someone deletes a message, it will appear here.\n\nCurrent chat: ${await getChatName(chatId)}`
//                         });
//                     }
//                 } else {
//                     await sock.sendMessage(chatId, {
//                         text: `🌐 *PUBLIC MODE TEST*\n\n1. Delete this message\n2. It should reappear in this chat\n3. Try with images/videos too!`
//                     });
//                 }
                
//                 cleanLog('Test instructions sent', 'success');
//                 break;
                
//             case 'stats':
//                 const successRate = tracker.stats.mediaDownloaded > 0 ? 
//                     Math.round((tracker.stats.mediaSent / tracker.stats.mediaDownloaded) * 100) : 0;
                
//                 const statsText = `📊 *Antidelete Statistics*\n\n` +
//                     `Mode: ${tracker.mode.toUpperCase()}\n` +
//                     `Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}\n` +
//                     `Messages cached: ${tracker.messageCache.size}\n` +
//                     `Media files: ${tracker.mediaStorage.size}\n\n` +
//                     `📈 *Performance:*\n` +
//                     `• Deletions detected: ${tracker.stats.deletionsDetected}\n` +
//                     `• Successfully retrieved: ${tracker.stats.retrievedSuccessfully}\n` +
//                     `• Media downloaded: ${tracker.stats.mediaDownloaded}\n` +
//                     `• Media sent: ${tracker.stats.mediaSent}\n` +
//                     `• Success rate: ${successRate}%\n` +
//                     `• Sent to DM: ${tracker.stats.sentToDm}\n` +
//                     `• Sent to chat: ${tracker.stats.sentToChat}\n` +
//                     `• False positives: ${tracker.stats.falsePositives}`;
                
//                 console.log('\n📊 ANTIDELETE STATISTICS');
//                 console.log('─'.repeat(60));
//                 console.log(`Mode: ${tracker.mode}`);
//                 console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Messages cached: ${tracker.messageCache.size}`);
//                 console.log(`Media files: ${tracker.mediaStorage.size}`);
//                 console.log(`Owner DMs sent: ${tracker.stats.sentToDm}`);
//                 console.log(`Chat messages sent: ${tracker.stats.sentToChat}`);
//                 console.log(`Media success rate: ${successRate}%`);
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: statsText
//                 }, { quoted: msg });
//                 break;
                
//             case 'owner':
//             case 'whoami':
//                 const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : {
//                     cleanJid: getOwnerJid(),
//                     cleanNumber: OWNER_NUMBER,
//                     isLid: false
//                 };
                
//                 const isUserOwner = isOwner(msg);
                
//                 await sock.sendMessage(chatId, {
//                     text: `👑 *Owner Information*\n\n` +
//                         `Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n` +
//                         `Owner JID: \`${ownerInfo.cleanJid || 'Not set'}\`\n` +
//                         `You are ${isUserOwner ? '✅ THE OWNER' : '❌ NOT THE OWNER'}\n\n` +
//                         `Current antidelete mode: ${tracker.mode.toUpperCase()}\n` +
//                         `Private mode ${isUserOwner ? 'available ✓' : 'locked 🔒'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nDebug info is only available to the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 console.log('\n🔧 ANTIDELETE DEBUG');
//                 console.log('─'.repeat(70));
//                 console.log(`System: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Mode: ${tracker.mode}`);
//                 console.log(`Messages in cache: ${tracker.messageCache.size}`);
//                 console.log(`Media files: ${tracker.mediaStorage.size}`);
//                 console.log(`Owner JID: ${getOwnerJid()}`);
//                 console.log(`Owner number: ${OWNER_NUMBER}`);
//                 console.log(`Listener setup: ${tracker.listenerSetup}`);
//                 console.log(`Cleanup interval: ${tracker.cleanupInterval ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Last cleanup: ${new Date(tracker.lastCleanup).toLocaleTimeString()}`);
                
//                 // Show recent DMs
//                 if (tracker.ownerDmLog.size > 0) {
//                     console.log('\n📨 RECENT OWNER DMs:');
//                     let index = 1;
//                     for (const [msgId, log] of tracker.ownerDmLog.entries()) {
//                         const age = Math.round((Date.now() - log.timestamp) / 1000);
//                         console.log(`${index}. From: ${log.sender}`);
//                         console.log(`   Chat: ${log.chat}`);
//                         console.log(`   Type: ${log.type}, Age: ${age}s`);
//                         console.log(`   ID: ${msgId.substring(0, 12)}...`);
//                         console.log('   ─'.repeat(20));
//                         index++;
//                         if (index > 5) break;
//                     }
//                 }
                
//                 console.log('─'.repeat(70));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal\n\nMode: ${tracker.mode}\nMedia files: ${tracker.mediaStorage.size}\nOwner DMs: ${tracker.ownerDmLog.size}`
//                 });
//                 break;
                
//             case 'clear':
//             case 'clean':
//                 if (args[1] === 'dm' && !isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nOnly the owner can clear DM logs.`
//                     }, { quoted: msg });
//                 }
                
//                 const msgCount = tracker.messageCache.size;
//                 const fileCount = tracker.mediaStorage.size;
//                 const dmCount = tracker.ownerDmLog.size;
                
//                 // Clean files
//                 for (const msgId of tracker.mediaStorage.keys()) {
//                     await cleanupMedia(msgId);
//                 }
                
//                 tracker.messageCache.clear();
//                 tracker.mediaStorage.clear();
//                 tracker.seenMessages.clear();
//                 tracker.processedDeletions.clear();
                
//                 if (args[1] === 'dm') {
//                     tracker.ownerDmLog.clear();
//                 }
                
//                 cleanLog(`Cleaned: ${msgCount} messages, ${fileCount} files${args[1] === 'dm' ? `, ${dmCount} DM logs` : ''}`, 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧹 *Cache Cleared*\n\nMessages: ${msgCount}\nFiles: ${fileCount}${args[1] === 'dm' ? `\nDM logs: ${dmCount}` : ''}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'config':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nConfiguration can only be changed by the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 const setting = args[1];
//                 const value = args[2];
                
//                 if (!setting) {
//                     // Show current config
//                     let configText = `⚙️ *Antidelete Configuration*\n\n`;
//                     for (const [key, val] of Object.entries(tracker.config)) {
//                         configText += `• ${key}: ${val}\n`;
//                     }
//                     configText += `\nTo change: \`${PREFIX}antidelete config <key> <value>\``;
                    
//                     await sock.sendMessage(chatId, {
//                         text: configText
//                     }, { quoted: msg });
//                     return;
//                 }
                
//                 if (value === undefined) {
//                     await sock.sendMessage(chatId, {
//                         text: `❌ Need value\n\nUsage: \`${PREFIX}antidelete config ${setting} <value>\``
//                     }, { quoted: msg });
//                     return;
//                 }
                
//                 // Parse value
//                 let parsedValue;
//                 if (value.toLowerCase() === 'true') parsedValue = true;
//                 else if (value.toLowerCase() === 'false') parsedValue = false;
//                 else if (!isNaN(value)) parsedValue = Number(value);
//                 else parsedValue = value;
                
//                 if (tracker.config.hasOwnProperty(setting)) {
//                     tracker.config[setting] = parsedValue;
                    
//                     // Special handling
//                     if (setting === 'autoCleanup' && parsedValue === true) {
//                         setupCleanupInterval();
//                     } else if (setting === 'autoCleanup' && parsedValue === false) {
//                         if (tracker.cleanupInterval) {
//                             clearInterval(tracker.cleanupInterval);
//                             tracker.cleanupInterval = null;
//                         }
//                     }
                    
//                     await sock.sendMessage(chatId, {
//                         text: `✅ Config updated\n\n${setting}: ${parsedValue}`
//                     }, { quoted: msg });
//                 } else {
//                     await sock.sendMessage(chatId, {
//                         text: `❌ Invalid setting\n\nAvailable: ${Object.keys(tracker.config).join(', ')}`
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'help':
//                 const helpText = `
// 🚫 *ANTIDELETE SYSTEM HELP*
// ⚡ *Commands:*
// • \`${PREFIX}antidelete on [private/public]\`
// • \`${PREFIX}antidelete off\`
// • \`${PREFIX}antidelete mode <public/private>\`

// 👑 *Owner:* ${OWNER_NUMBER || 'Not set'}
// `.trim();
                
//                 await sock.sendMessage(chatId, {
//                     text: helpText
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 const downloaded = tracker.stats.mediaDownloaded;
//                 const sent = tracker.stats.mediaSent;
//                 const rate = downloaded > 0 ? Math.round((sent / downloaded) * 100) : 0;
                
//                 const statusText = `
// 🚫 *Antidelete System*

// Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
// Mode: ${tracker.mode.toUpperCase()}
// Media files: ${tracker.mediaStorage.size}
// Success rate: ${rate}%

// ${tracker.mode === 'private' ? 
// `🔒 *Private Mode Active*
// Deleted messages sent to owner's DM` : 
// `🌐 *Public Mode Active*
// Deleted messages shown in chat`}

// Owner: ${OWNER_NUMBER || 'Not set'}

// Use \`${PREFIX}antidelete on\` to enable
// Use \`${PREFIX}antidelete help\` for all commands
// `.trim();
                
//                 await sock.sendMessage(chatId, {
//                     text: statusText
//                 }, { quoted: msg });
//         }
//     }
// };


























// File: ./commands/utility/antidelete.js - UPDATED WITH STATUS VIEWING
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage, proto } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');
const STATUS_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_statuses');

// Owner JID configuration
let OWNER_JID = null;
let OWNER_NUMBER = null;

// Load owner info
async function loadOwnerInfo() {
    try {
        const possiblePaths = [
            './owner.json',
            '../owner.json',
            '../../owner.json',
            '../../../owner.json',
            path.join(__dirname, '../../../owner.json')
        ];
        
        for (const ownerPath of possiblePaths) {
            try {
                if (await fs.access(ownerPath).then(() => true).catch(() => false)) {
                    const ownerData = JSON.parse(await fs.readFile(ownerPath, 'utf8'));
                    OWNER_JID = ownerData.OWNER_JID || ownerData.ownerLID || 
                               (ownerData.OWNER_NUMBER ? ownerData.OWNER_NUMBER + '@s.whatsapp.net' : null);
                    OWNER_NUMBER = ownerData.OWNER_NUMBER || ownerData.ownerNumber;
                    
                    if (OWNER_JID) {
                        console.log(`👑 Owner loaded: ${OWNER_NUMBER} (${OWNER_JID})`);
                        break;
                    }
                }
            } catch (error) {
                // Continue to next path
            }
        }
    } catch (error) {
        console.error('❌ Error loading owner info:', error.message);
    }
}

// Call on import
loadOwnerInfo();

export default {
    name: 'antidelete',
    alias: ['undelete', 'antidel', 'ad'],
    description: 'Capture deleted messages and statuses with public/private modes',
    category: 'utility',
    
    async execute(sock, msg, args, PREFIX, metadata = {}) {
        const chatId = msg.key.remoteJid;
        
        console.log('🚫 Antidelete System - Now with Status Support');
        
        // Extract jidManager if available
        const jidManager = metadata.jidManager || {
            cleanJid: (jid) => {
                if (!jid) return { cleanJid: 'unknown', cleanNumber: 'unknown', isLid: false };
                let clean = jid.split(':')[0];
                let cleanNumber = clean.split('@')[0];
                return {
                    cleanJid: clean,
                    cleanNumber: cleanNumber,
                    isLid: clean.includes('@lid'),
                    original: jid
                };
            },
            isOwner: (msg) => {
                const senderJid = msg.key.participant || msg.key.remoteJid;
                const cleaned = this.cleanJid(senderJid);
                return cleaned.cleanNumber === OWNER_NUMBER || msg.key.fromMe;
            },
            getOwnerInfo: () => ({
                cleanJid: OWNER_JID || 'Not configured',
                cleanNumber: OWNER_NUMBER || 'Not configured',
                isLid: OWNER_JID ? OWNER_JID.includes('@lid') : false
            })
        };
        
        // Initialize global tracker
        if (!global.antideleteTerminal) {
            global.antideleteTerminal = {
                active: false,
                mode: 'public',
                messageCache: new Map(),
                statusCache: new Map(),
                listenerSetup: false,
                notifyInChat: true,
                stats: {
                    deletionsDetected: 0,
                    retrievedSuccessfully: 0,
                    mediaRetrieved: 0,
                    falsePositives: 0,
                    mediaDownloaded: 0,
                    mediaSent: 0,
                    sentToDm: 0,
                    sentToChat: 0,
                    statusesDetected: 0,
                    statusesDeleted: 0,
                    statusesRetrieved: 0,
                    statusesViewed: 0, // New: Track viewed statuses
                    statusesDownloaded: 0
                },
                seenMessages: new Map(),
                seenStatuses: new Map(),
                processedDeletions: new Set(),
                processedStatusDeletions: new Set(),
                mediaStorage: new Map(),
                statusStorage: new Map(),
                cleanupInterval: null,
                lastCleanup: Date.now(),
                ownerDmLog: new Map(),
                statusDmLog: new Map(),
                config: {
                    autoCleanup: true,
                    maxStorageHours: 24,
                    notifyOnModeChange: true,
                    stealthMode: false,
                    logToTerminal: true,
                    captureStatuses: true,
                    statusPrivacy: 'owner',
                    autoViewStatuses: true, // New: Auto view statuses
                    statusViewDelay: 2000 // New: Delay before viewing status (ms)
                },
                // New: Status viewing queue
                statusViewQueue: new Map(),
                statusViewInterval: null
            };
        }
        
        const tracker = global.antideleteTerminal;
        const command = args[0]?.toLowerCase() || 'help';
        
        // ====== STATUS VIEWING FUNCTIONS ======
        
        // Fetch and view status
        async function fetchAndViewStatus(statusJid) {
            try {
                if (!tracker.config.autoViewStatuses) return;
                
                const phoneNumber = statusJid.split('@')[0];
                cleanLog(`Fetching status for: ${phoneNumber}`, 'status');
                
                // Send status read receipt
                try {
                    const statusReadMessage = {
                        key: {
                            remoteJid: 'status@broadcast',
                            fromMe: true,
                            id: `status_read_${Date.now()}`
                        },
                        message: {
                            protocolMessage: {
                                type: proto.Message.ProtocolMessage.Type.READ_STATUS,
                                key: {
                                    remoteJid: statusJid,
                                    fromMe: false
                                }
                            }
                        }
                    };
                    
                    await sock.relayMessage('status@broadcast', statusReadMessage.message, {
                        messageId: statusReadMessage.key.id
                    });
                    
                    cleanLog(`Sent status read receipt for: ${phoneNumber}`, 'status');
                    tracker.stats.statusesViewed++;
                } catch (readError) {
                    cleanLog(`Status read error: ${readError.message}`, 'error');
                }
                
                // Try to fetch status list
                try {
                    // This attempts to fetch the status list
                    const query = ['query', { type: 'status', epoch: '1' }, null];
                    await sock.query(query);
                    cleanLog(`Status query sent for: ${phoneNumber}`, 'status');
                } catch (queryError) {
                    cleanLog(`Status query error: ${queryError.message}`, 'error');
                }
                
                // Store in queue for later processing
                tracker.statusViewQueue.set(statusJid, {
                    timestamp: Date.now(),
                    phoneNumber: phoneNumber,
                    attempts: 1
                });
                
            } catch (error) {
                cleanLog(`Status fetch error: ${error.message}`, 'error');
            }
        }
        
        // Process status view queue
        async function processStatusViewQueue() {
            try {
                const now = Date.now();
                const maxAge = 5 * 60 * 1000; // 5 minutes
                
                for (const [jid, data] of tracker.statusViewQueue.entries()) {
                    if (now - data.timestamp > maxAge) {
                        tracker.statusViewQueue.delete(jid);
                        continue;
                    }
                    
                    // Try to fetch status after delay
                    if (data.attempts < 3) {
                        setTimeout(async () => {
                            try {
                                await fetchStatusContent(jid);
                            } catch (error) {
                                cleanLog(`Queue process error: ${error.message}`, 'error');
                            }
                        }, data.attempts * 3000); // Incremental delay
                        
                        data.attempts++;
                        tracker.statusViewQueue.set(jid, data);
                    }
                }
            } catch (error) {
                cleanLog(`Queue processing error: ${error.message}`, 'error');
            }
        }
        
        // Fetch status content
        async function fetchStatusContent(statusJid) {
            try {
                const phoneNumber = statusJid.split('@')[0];
                cleanLog(`Attempting to fetch status content for: ${phoneNumber}`, 'status');
                
                // Try to get status messages
                const statusMessages = await sock.fetchStatus(statusJid);
                
                if (statusMessages && statusMessages.length > 0) {
                    cleanLog(`Found ${statusMessages.length} status messages for ${phoneNumber}`, 'success');
                    
                    for (const statusMsg of statusMessages) {
                        await storeStatusFromMessage(statusJid, statusMsg);
                    }
                    
                    return true;
                } else {
                    cleanLog(`No status messages found for ${phoneNumber}`, 'warning');
                    return false;
                }
                
            } catch (error) {
                cleanLog(`Status content fetch error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Store status from fetched message
        async function storeStatusFromMessage(statusJid, statusMsg) {
            try {
                const statusId = statusMsg.key?.id || `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const phoneNumber = statusJid.split('@')[0];
                
                // Skip if already cached
                if (tracker.statusCache.has(statusId)) return;
                
                const statusDetails = {
                    id: statusId,
                    jid: statusJid,
                    timestamp: Date.now(),
                    phoneNumber: phoneNumber,
                    type: 'text',
                    hasMedia: false,
                    text: '',
                    mediaInfo: null,
                    metadata: {},
                    fetched: true // Mark as actively fetched
                };
                
                // Extract status content
                const msgContent = statusMsg.message;
                
                if (msgContent?.conversation) {
                    statusDetails.text = msgContent.conversation;
                    statusDetails.type = 'text';
                } else if (msgContent?.extendedTextMessage?.text) {
                    statusDetails.text = msgContent.extendedTextMessage.text;
                    statusDetails.type = 'text';
                }
                
                // Check for media
                if (msgContent?.imageMessage) {
                    statusDetails.hasMedia = true;
                    statusDetails.type = 'image';
                    statusDetails.caption = msgContent.imageMessage.caption || '';
                    statusDetails.mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
                    statusDetails.mediaSize = msgContent.imageMessage.fileLength || 0;
                    
                    statusDetails.mediaInfo = {
                        message: statusMsg,
                        type: 'image'
                    };
                } else if (msgContent?.videoMessage) {
                    statusDetails.hasMedia = true;
                    statusDetails.type = 'video';
                    statusDetails.caption = msgContent.videoMessage.caption || '';
                    statusDetails.mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
                    statusDetails.mediaSize = msgContent.videoMessage.fileLength || 0;
                    
                    statusDetails.mediaInfo = {
                        message: statusMsg,
                        type: 'video'
                    };
                }
                
                // Store in cache
                tracker.statusCache.set(statusId, statusDetails);
                tracker.stats.statusesDetected++;
                
                cleanLog(`Stored status ${statusDetails.type} from ${phoneNumber}`, 'status');
                
                // Download media if present
                if (statusDetails.hasMedia && statusDetails.mediaInfo) {
                    setTimeout(async () => {
                        try {
                            await downloadAndSaveStatusMedia(statusId, statusDetails);
                        } catch (error) {
                            cleanLog(`Status media download failed: ${error.message}`, 'error');
                        }
                    }, 1000);
                }
                
            } catch (error) {
                cleanLog(`Status storage error: ${error.message}`, 'error');
            }
        }
        
        // ====== STATUS DETECTION FUNCTIONS ======
        
        // Detect and store statuses from updates
        async function storeStatusUpdate(statusUpdate) {
            try {
                if (!tracker.config.captureStatuses) return;
                
                const statusData = statusUpdate.status;
                if (!statusData) return;
                
                const statusJid = statusUpdate.jid;
                const phoneNumber = statusJid.split('@')[0];
                
                cleanLog(`Status update detected from: ${phoneNumber}`, 'status');
                
                // Auto-view status if enabled
                if (tracker.config.autoViewStatuses) {
                    setTimeout(async () => {
                        await fetchAndViewStatus(statusJid);
                    }, tracker.config.statusViewDelay);
                }
                
                // Create status entry
                const statusId = `status_${Date.now()}_${phoneNumber}`;
                
                const statusDetails = {
                    id: statusId,
                    jid: statusJid,
                    timestamp: Date.now(),
                    phoneNumber: phoneNumber,
                    type: 'unknown',
                    hasMedia: false,
                    text: '',
                    metadata: statusUpdate,
                    autoViewed: tracker.config.autoViewStatuses
                };
                
                tracker.statusCache.set(statusId, statusDetails);
                tracker.stats.statusesDetected++;
                
                // Try to fetch content after delay
                if (tracker.config.autoViewStatuses) {
                    setTimeout(async () => {
                        try {
                            await fetchStatusContent(statusJid);
                        } catch (error) {
                            cleanLog(`Auto-fetch failed: ${error.message}`, 'error');
                        }
                    }, tracker.config.statusViewDelay + 1000);
                }
                
            } catch (error) {
                cleanLog(`Status update storage error: ${error.message}`, 'error');
            }
        }
        
        // Download and save status media
        async function downloadAndSaveStatusMedia(statusId, statusDetails) {
            try {
                if (!statusDetails.mediaInfo) return false;
                
                cleanLog(`Downloading status media for ${phoneNumber}...`, 'status');
                
                const buffer = await downloadMediaMessage(
                    statusDetails.mediaInfo.message,
                    'buffer',
                    {},
                    {
                        logger: { level: 'silent' },
                        reuploadRequest: sock.updateMediaMessage
                    }
                );
                
                if (!buffer || buffer.length === 0) {
                    cleanLog('Empty buffer for status media', 'warning');
                    return false;
                }
                
                // Save to file
                await ensureMediaDir();
                const timestamp = Date.now();
                const extension = statusDetails.type === 'video' ? '.mp4' : '.jpg';
                const filename = `status_${statusDetails.phoneNumber}_${timestamp}${extension}`;
                const filePath = path.join(STATUS_STORAGE_PATH, filename);
                
                await fs.writeFile(filePath, buffer);
                
                // Store in status storage
                tracker.statusStorage.set(statusId, {
                    filePath: filePath,
                    buffer: buffer,
                    type: statusDetails.type,
                    mimetype: statusDetails.mimetype || (statusDetails.type === 'video' ? 'video/mp4' : 'image/jpeg'),
                    filename: filename,
                    size: buffer.length,
                    timestamp: timestamp,
                    jid: statusDetails.jid,
                    phoneNumber: statusDetails.phoneNumber
                });
                
                tracker.stats.statusesDownloaded++;
                cleanLog(`Status media saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'success');
                return true;
                
            } catch (error) {
                cleanLog(`Status download error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // ====== EXISTING FUNCTIONS ======
        
        // Check if sender is owner
        function isOwner(msg) {
            if (!msg) return false;
            if (msg.key.fromMe) return true;
            
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const cleaned = jidManager.cleanJid(senderJid);
            
            if (OWNER_NUMBER && cleaned.cleanNumber === OWNER_NUMBER) return true;
            if (jidManager.isOwner) return jidManager.isOwner(msg);
            
            return false;
        }
        
        // Get owner JID
        function getOwnerJid() {
            if (OWNER_JID) return OWNER_JID;
            if (jidManager.getOwnerInfo) {
                const info = jidManager.getOwnerInfo();
                return info.cleanJid !== 'Not configured' ? info.cleanJid : null;
            }
            return null;
        }
        
        // Log messages
        function cleanLog(message, type = 'info') {
            if (!tracker.config.logToTerminal) return;
            
            const prefixes = {
                'info': '📝',
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'system': '🚫',
                'media': '📷',
                'deletion': '🗑️',
                'dm': '📨',
                'mode': '🔄',
                'status': '📱'
            };
            
            const prefix = prefixes[type] || '📝';
            console.log(`${prefix} Antidelete: ${message}`);
        }
        
        // Ensure media directory
        async function ensureMediaDir() {
            try {
                await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
                await fs.mkdir(STATUS_STORAGE_PATH, { recursive: true });
                return true;
            } catch (error) {
                cleanLog(`Directory error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Handle deleted status
        async function handleDeletedStatus(deletedStatusId) {
            try {
                if (!tracker.config.captureStatuses) return;
                
                cleanLog(`Status deletion detected: ${deletedStatusId}`, 'status');
                tracker.stats.statusesDeleted++;
                
                const cachedStatus = tracker.statusCache.get(deletedStatusId);
                if (!cachedStatus) {
                    cleanLog(`Status not found in cache: ${deletedStatusId}`, 'warning');
                    return;
                }
                
                tracker.statusCache.delete(deletedStatusId);
                
                const privacy = tracker.config.statusPrivacy;
                const ownerJid = getOwnerJid();
                
                if (privacy === 'none') return;
                
                if (privacy === 'owner' && ownerJid) {
                    await sendStatusToOwnerDM(cachedStatus);
                } else if (privacy === 'all') {
                    if (ownerJid) {
                        await sendStatusToOwnerDM(cachedStatus);
                    }
                }
                
                tracker.stats.statusesRetrieved++;
                
            } catch (error) {
                cleanLog(`Status retrieval error: ${error.message}`, 'error');
            }
        }
        
        // Send deleted status to owner DM
        async function sendStatusToOwnerDM(statusDetails) {
            try {
                const ownerJid = getOwnerJid();
                if (!ownerJid) {
                    cleanLog('Owner JID not found for status DM', 'error');
                    return false;
                }
                
                const statusMedia = tracker.statusStorage.get(statusDetails.id);
                const time = new Date(statusDetails.timestamp).toLocaleString();
                const senderNumber = statusDetails.phoneNumber;
                
                let caption = `📱 *DELETED STATUS CAPTURED*\n\n`;
                caption += `👤 From: ${senderNumber}\n`;
                caption += `🕒 Posted: ${time}\n`;
                caption += `📊 Type: ${statusDetails.hasMedia ? statusDetails.type.toUpperCase() : 'TEXT'}\n`;
                
                if (statusDetails.text) {
                    caption += `\n💬 Status Text:\n${statusDetails.text.substring(0, 500)}`;
                    if (statusDetails.text.length > 500) caption += '...';
                }
                
                if (statusDetails.caption) {
                    caption += `\n\n📝 Media Caption:\n${statusDetails.caption}`;
                }
                
                caption += `\n\n────────────\n`;
                caption += `🔍 *Captured by antidelete status monitor*`;
                
                if (statusDetails.hasMedia && statusMedia) {
                    try {
                        let buffer = statusMedia.buffer;
                        if (!buffer) {
                            buffer = await fs.readFile(statusMedia.filePath);
                        }
                        
                        if (buffer && buffer.length > 0) {
                            if (statusDetails.type === 'image') {
                                await sock.sendMessage(ownerJid, {
                                    image: buffer,
                                    caption: caption,
                                    mimetype: statusMedia.mimetype
                                });
                            } else if (statusDetails.type === 'video') {
                                await sock.sendMessage(ownerJid, {
                                    video: buffer,
                                    caption: caption,
                                    mimetype: statusMedia.mimetype
                                });
                            }
                        } else {
                            await sock.sendMessage(ownerJid, { text: caption });
                        }
                    } catch (mediaError) {
                        cleanLog(`Status media send error: ${mediaError.message}`, 'error');
                        await sock.sendMessage(ownerJid, { text: caption });
                    }
                } else {
                    await sock.sendMessage(ownerJid, { text: caption });
                }
                
                tracker.statusDmLog.set(statusDetails.id, {
                    timestamp: Date.now(),
                    sender: senderNumber,
                    type: statusDetails.type,
                    hasMedia: statusDetails.hasMedia
                });
                
                cleanLog(`Status sent to owner DM: ${senderNumber}`, 'status');
                return true;
                
            } catch (error) {
                cleanLog(`Status DM error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Setup status viewing interval
        function setupStatusViewInterval() {
            if (tracker.statusViewInterval) {
                clearInterval(tracker.statusViewInterval);
            }
            
            tracker.statusViewInterval = setInterval(async () => {
                await processStatusViewQueue();
            }, 10 * 1000); // Process queue every 10 seconds
        }
        
        // Setup cleanup
        function setupCleanupInterval() {
            if (tracker.cleanupInterval) {
                clearInterval(tracker.cleanupInterval);
            }
            
            tracker.cleanupInterval = setInterval(async () => {
                await cleanupOldData();
            }, 10 * 60 * 1000);
        }
        
        // Cleanup old data
        async function cleanupOldData() {
            const now = Date.now();
            const maxAge = tracker.config.maxStorageHours * 60 * 60 * 1000;
            
            // Clean media files
            for (const [msgId, mediaInfo] of tracker.mediaStorage.entries()) {
                if (now - mediaInfo.timestamp > maxAge) {
                    await cleanupMedia(msgId);
                }
            }
            
            // Clean status media files
            for (const [statusId, statusMedia] of tracker.statusStorage.entries()) {
                if (now - statusMedia.timestamp > maxAge) {
                    await cleanupStatusMedia(statusId);
                }
            }
            
            // Clean old messages
            for (const [msgId, data] of tracker.messageCache.entries()) {
                if (now - data.timestamp > maxAge) {
                    tracker.messageCache.delete(msgId);
                }
            }
            
            // Clean old statuses
            for (const [statusId, data] of tracker.statusCache.entries()) {
                if (now - data.timestamp > maxAge) {
                    tracker.statusCache.delete(statusId);
                }
            }
            
            tracker.lastCleanup = now;
        }
        
        // Clean up status media
        async function cleanupStatusMedia(statusId) {
            try {
                if (tracker.statusStorage.has(statusId)) {
                    const statusMedia = tracker.statusStorage.get(statusId);
                    try {
                        await fs.unlink(statusMedia.filePath);
                    } catch (error) {}
                    tracker.statusStorage.delete(statusId);
                }
            } catch (error) {}
        }
        
        // Clean up media
        async function cleanupMedia(messageId) {
            try {
                if (tracker.mediaStorage.has(messageId)) {
                    const mediaInfo = tracker.mediaStorage.get(messageId);
                    try {
                        await fs.unlink(mediaInfo.filePath);
                    } catch (error) {}
                    tracker.mediaStorage.delete(messageId);
                }
            } catch (error) {}
        }
        
        // Setup listener
        function setupTerminalListener() {
            if (tracker.listenerSetup) return;
            
            cleanLog(`Setting up antidelete with status support in ${tracker.mode} mode...`, 'system');
            
            ensureMediaDir();
            setupCleanupInterval();
            setupStatusViewInterval();
            
            // Store regular messages
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                try {
                    if (!tracker.active) return;
                    
                    if (type === 'notify') {
                        for (const message of messages) {
                            if (message.key?.fromMe) continue;
                            
                            // Check if it's a status message
                            const chatId = message.key.remoteJid;
                            if (chatId === 'status@broadcast') {
                                cleanLog(`Broadcast status detected`, 'status');
                                // This is a status message
                                await storeStatusFromBroadcast(message);
                                continue;
                            }
                            
                            const msgId = message.key?.id;
                            if (!msgId) continue;
                            
                            tracker.seenMessages.set(msgId, Date.now());
                            await storeMessageWithMedia(message);
                        }
                    }
                } catch (error) {
                    cleanLog(`Storage error: ${error.message}`, 'error');
                }
            });
            
            // Store status from broadcast
            async function storeStatusFromBroadcast(message) {
                try {
                    const msgId = message.key?.id || `status_broadcast_${Date.now()}`;
                    
                    // Extract sender info from status
                    const pushName = message.pushName || 'Unknown';
                    const statusContent = message.message;
                    
                    let text = '';
                    let type = 'text';
                    let hasMedia = false;
                    let mimetype = '';
                    
                    if (statusContent?.conversation) {
                        text = statusContent.conversation;
                    } else if (statusContent?.extendedTextMessage?.text) {
                        text = statusContent.extendedTextMessage.text;
                    } else if (statusContent?.imageMessage) {
                        type = 'image';
                        text = statusContent.imageMessage.caption || '';
                        mimetype = statusContent.imageMessage.mimetype || 'image/jpeg';
                        hasMedia = true;
                    } else if (statusContent?.videoMessage) {
                        type = 'video';
                        text = statusContent.videoMessage.caption || '';
                        mimetype = statusContent.videoMessage.mimetype || 'video/mp4';
                        hasMedia = true;
                    }
                    
                    // Try to get sender JID from status
                    let senderJid = null;
                    if (message.key?.participant) {
                        senderJid = message.key.participant;
                    }
                    
                    if (senderJid) {
                        const statusDetails = {
                            id: msgId,
                            jid: senderJid,
                            timestamp: Date.now(),
                            phoneNumber: senderJid.split('@')[0],
                            pushName: pushName,
                            type: type,
                            hasMedia: hasMedia,
                            text: text,
                            mimetype: mimetype,
                            fromBroadcast: true,
                            mediaInfo: hasMedia ? { message: message, type: type } : null
                        };
                        
                        tracker.statusCache.set(msgId, statusDetails);
                        tracker.stats.statusesDetected++;
                        
                        cleanLog(`Broadcast status stored: ${pushName} (${type})`, 'status');
                        
                        // Download media if present
                        if (hasMedia) {
                            setTimeout(async () => {
                                try {
                                    await downloadAndSaveStatusMedia(msgId, statusDetails);
                                } catch (error) {
                                    cleanLog(`Broadcast media download failed: ${error.message}`, 'error');
                                }
                            }, 1000);
                        }
                    }
                    
                } catch (error) {
                    cleanLog(`Broadcast status error: ${error.message}`, 'error');
                }
            }
            
            // Handle message deletions
            sock.ev.on('messages.update', async (updates) => {
                try {
                    if (!tracker.active) return;
                    
                    for (const update of updates) {
                        const updateData = update.update || {};
                        const messageId = update.key?.id;
                        const chatId = update.key?.remoteJid;
                        
                        if (!messageId || !chatId) continue;
                        
                        // Check if it's a status update
                        if (updateData.status !== undefined) {
                            const statusValue = updateData.status;
                            const jid = chatId;
                            
                            cleanLog(`Status update: ${jid} → ${statusValue}`, 'status');
                            
                            if (statusValue === 2) { // Status posted
                                await storeStatusUpdate({
                                    jid: jid,
                                    status: { id: messageId }
                                });
                            } else if (statusValue === 3) { // Status deleted
                                await handleDeletedStatus(messageId);
                            }
                            continue;
                        }
                        
                        const isDeleted = 
                            updateData.status === 6 ||
                            updateData.message === null ||
                            (updateData.messageStubType === 7) ||
                            (updateData.messageStubType === 8);
                        
                        if (isDeleted) {
                            await handleDeletedMessage(update.key);
                        }
                    }
                } catch (error) {
                    cleanLog(`Detection error: ${error.message}`, 'error');
                }
            });
            
            // Listen for presence updates (status deletions)
            sock.ev.on('presence.update', async (update) => {
                try {
                    if (!tracker.active || !tracker.config.captureStatuses) return;
                    
                    if (update.type === 'unavailable' && update.id) {
                        const statusId = update.id;
                        if (tracker.statusCache.has(statusId)) {
                            await handleDeletedStatus(statusId);
                        }
                    }
                } catch (error) {
                    cleanLog(`Status presence error: ${error.message}`, 'error');
                }
            });
            
            tracker.listenerSetup = true;
            cleanLog(`Listener ready with status support in ${tracker.mode} mode`, 'success');
        }
        
        // ====== EXISTING MESSAGE HANDLING FUNCTIONS ======
        // (Keep all existing storeMessageWithMedia, handleDeletedMessage, sendMediaToChat, etc.)
        // ... [All the existing message handling functions remain the same]
        
        // ====== COMMAND HANDLER ======
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                if (args[1]?.toLowerCase() === 'private') {
                    if (!isOwner(msg)) {
                        return sock.sendMessage(chatId, {
                            text: `❌ *Owner Only*\n\nOnly the bot owner can enable private mode.\n\nCurrent owner: ${OWNER_NUMBER || 'Not set'}`
                        }, { quoted: msg });
                    }
                    tracker.mode = 'private';
                } else {
                    tracker.mode = 'public';
                }
                
                tracker.active = true;
                
                // Reset stats
                Object.keys(tracker.stats).forEach(key => {
                    tracker.stats[key] = 0;
                });
                
                setupTerminalListener();
                
                const modeDescription = tracker.mode === 'private' ? 
                    `🔒 *PRIVATE MODE*\n\nAll deleted messages will be sent to owner's DM:\n${getOwnerJid() || 'Owner not set'}` :
                    `🌐 *PUBLIC MODE*\n\nDeleted messages will be shown in the original chat.`;
                
                const statusConfig = tracker.config.captureStatuses ? 
                    `📱 *Status Monitoring:* ✅ ENABLED\n• Auto-view: ${tracker.config.autoViewStatuses ? 'ON' : 'OFF'}\n• Privacy: ${tracker.config.statusPrivacy}` :
                    `📱 *Status Monitoring:* ❌ DISABLED`;
                
                cleanLog(`Antidelete ${tracker.mode.toUpperCase()} mode enabled`, 'success');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE ENABLED*\n\n${modeDescription}\n\n${statusConfig}\n\nFeatures:\n• Message/media antidelete\n• Status monitoring & auto-view\n• Auto-cleanup system\n\nUse \`${PREFIX}antidelete test\` to verify.`
                }, { quoted: msg });
                break;
                
            case 'off':
                tracker.active = false;
                if (tracker.cleanupInterval) {
                    clearInterval(tracker.cleanupInterval);
                    tracker.cleanupInterval = null;
                }
                if (tracker.statusViewInterval) {
                    clearInterval(tracker.statusViewInterval);
                    tracker.statusViewInterval = null;
                }
                
                cleanLog('Antidelete disabled', 'system');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE DISABLED*\n\nMode was: ${tracker.mode.toUpperCase()}\n\nUse \`${PREFIX}antidelete on\` to enable.`
                }, { quoted: msg });
                break;
                
            case 'status':
                if (!isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nStatus monitoring settings can only be changed by the owner.`
                    }, { quoted: msg });
                }
                
                const subCmd = args[1]?.toLowerCase();
                
                if (!subCmd) {
                    const statusInfo = `
📱 *Status Monitoring Settings*

Capture: ${tracker.config.captureStatuses ? '✅ ENABLED' : '❌ DISABLED'}
Auto-view: ${tracker.config.autoViewStatuses ? '✅ ON' : '❌ OFF'}
Privacy: ${tracker.config.statusPrivacy.toUpperCase()}
View Delay: ${tracker.config.statusViewDelay}ms

📊 *Statistics:*
Detected: ${tracker.stats.statusesDetected}
Viewed: ${tracker.stats.statusesViewed}
Downloaded: ${tracker.stats.statusesDownloaded}
Deleted: ${tracker.stats.statusesDeleted}
Retrieved: ${tracker.stats.statusesRetrieved}
Cached: ${tracker.statusCache.size}
Queue: ${tracker.statusViewQueue.size}

💡 *Commands:*
• \`${PREFIX}antidelete status on/off\` - Toggle capture
• \`${PREFIX}antidelete status view on/off\` - Auto-view
• \`${PREFIX}antidelete status privacy <owner/all/none>\`
• \`${PREFIX}antidelete status delay <ms>\` - Set view delay
• \`${PREFIX}antidelete status fetch <number>\` - Fetch specific status
• \`${PREFIX}antidelete status clear\` - Clear cache
`;
                    
                    await sock.sendMessage(chatId, { text: statusInfo }, { quoted: msg });
                    return;
                }
                
                switch (subCmd) {
                    case 'on':
                        tracker.config.captureStatuses = true;
                        await sock.sendMessage(chatId, {
                            text: `✅ *Status Capture ENABLED*\n\nDeleted statuses will be captured.`
                        }, { quoted: msg });
                        break;
                        
                    case 'off':
                        tracker.config.captureStatuses = false;
                        await sock.sendMessage(chatId, {
                            text: `✅ *Status Capture DISABLED*\n\nStatus monitoring turned off.`
                        }, { quoted: msg });
                        break;
                        
                    case 'view':
                        const viewMode = args[2]?.toLowerCase();
                        if (viewMode === 'on') {
                            tracker.config.autoViewStatuses = true;
                            setupStatusViewInterval();
                            await sock.sendMessage(chatId, {
                                text: `✅ *Auto-view ENABLED*\n\nStatuses will be automatically viewed and downloaded.`
                            }, { quoted: msg });
                        } else if (viewMode === 'off') {
                            tracker.config.autoViewStatuses = false;
                            if (tracker.statusViewInterval) {
                                clearInterval(tracker.statusViewInterval);
                                tracker.statusViewInterval = null;
                            }
                            await sock.sendMessage(chatId, {
                                text: `✅ *Auto-view DISABLED*\n\nStatus auto-viewing turned off.`
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(chatId, {
                                text: `❓ Usage: \`${PREFIX}antidelete status view on/off\``
                            }, { quoted: msg });
                        }
                        break;
                        
                    case 'fetch':
                        const number = args[2];
                        if (!number) {
                            await sock.sendMessage(chatId, {
                                text: `❓ Usage: \`${PREFIX}antidelete status fetch <number>\``
                            }, { quoted: msg });
                            return;
                        }
                        
                        const fetchJid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
                        
                        await sock.sendMessage(chatId, {
                            text: `⏳ Fetching status for ${number}...`
                        }, { quoted: msg });
                        
                        try {
                            const success = await fetchStatusContent(fetchJid);
                            if (success) {
                                await sock.sendMessage(chatId, {
                                    text: `✅ Status fetched successfully for ${number}`
                                });
                            } else {
                                await sock.sendMessage(chatId, {
                                    text: `❌ Could not fetch status for ${number}`
                                });
                            }
                        } catch (error) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Error fetching status: ${error.message}`
                            });
                        }
                        break;
                        
                    case 'delay':
                        const delayMs = parseInt(args[2]);
                        if (!delayMs || delayMs < 0) {
                            await sock.sendMessage(chatId, {
                                text: `❓ Usage: \`${PREFIX}antidelete status delay <milliseconds>\``
                            }, { quoted: msg });
                            return;
                        }
                        
                        tracker.config.statusViewDelay = delayMs;
                        await sock.sendMessage(chatId, {
                            text: `✅ *View delay updated*\n\nDelay set to: ${delayMs}ms`
                        }, { quoted: msg });
                        break;
                        
                    case 'privacy':
                        const privacyMode = args[2]?.toLowerCase();
                        if (!privacyMode || !['owner', 'all', 'none'].includes(privacyMode)) {
                            await sock.sendMessage(chatId, {
                                text: `🔒 *Status Privacy*\n\nCurrent: ${tracker.config.statusPrivacy}\n\nOptions:\n• owner - Send to owner DM\n• all - Show in chat\n• none - Don't retrieve\n\nUsage: \`${PREFIX}antidelete status privacy <mode>\``
                            }, { quoted: msg });
                            return;
                        }
                        
                        tracker.config.statusPrivacy = privacyMode;
                        await sock.sendMessage(chatId, {
                            text: `✅ *Privacy Updated*\n\nMode: ${privacyMode.toUpperCase()}`
                        }, { quoted: msg });
                        break;
                        
                    case 'clear':
                        const statusCount = tracker.statusCache.size;
                        const mediaCount = tracker.statusStorage.size;
                        const queueCount = tracker.statusViewQueue.size;
                        
                        tracker.statusCache.clear();
                        tracker.statusStorage.clear();
                        tracker.statusViewQueue.clear();
                        tracker.seenStatuses.clear();
                        tracker.processedStatusDeletions.clear();
                        tracker.statusDmLog.clear();
                        
                        // Clean files
                        try {
                            const files = await fs.readdir(STATUS_STORAGE_PATH);
                            for (const file of files) {
                                await fs.unlink(path.join(STATUS_STORAGE_PATH, file));
                            }
                        } catch (error) {}
                        
                        await sock.sendMessage(chatId, {
                            text: `🧹 *Status Cache Cleared*\n\nStatuses: ${statusCount}\nMedia: ${mediaCount}\nQueue: ${queueCount}`
                        }, { quoted: msg });
                        break;
                        
                    default:
                        await sock.sendMessage(chatId, {
                            text: `❓ *Invalid Status Command*\n\nUse \`${PREFIX}antidelete status\` for options.`
                        }, { quoted: msg });
                }
                break;
                
            case 'debug':
                if (!isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nDebug info is only available to the owner.`
                    }, { quoted: msg });
                }
                
                console.log('\n🔧 ANTIDELETE DEBUG');
                console.log('─'.repeat(70));
                console.log(`System: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
                console.log(`Mode: ${tracker.mode}`);
                console.log(`Status capture: ${tracker.config.captureStatuses}`);
                console.log(`Auto-view: ${tracker.config.autoViewStatuses}`);
                console.log(`View delay: ${tracker.config.statusViewDelay}ms`);
                console.log(`Status cache: ${tracker.statusCache.size}`);
                console.log(`Status storage: ${tracker.statusStorage.size}`);
                console.log(`View queue: ${tracker.statusViewQueue.size}`);
                console.log(`Status viewed: ${tracker.stats.statusesViewed}`);
                console.log(`Status downloaded: ${tracker.stats.statusesDownloaded}`);
                
                // Show status view queue
                if (tracker.statusViewQueue.size > 0) {
                    console.log('\n📋 STATUS VIEW QUEUE:');
                    let index = 1;
                    for (const [jid, data] of tracker.statusViewQueue.entries()) {
                        const age = Math.round((Date.now() - data.timestamp) / 1000);
                        console.log(`${index}. ${data.phoneNumber}`);
                        console.log(`   Attempts: ${data.attempts}, Age: ${age}s`);
                        index++;
                        if (index > 5) break;
                    }
                }
                
                // Show recent statuses
                if (tracker.statusCache.size > 0) {
                    console.log('\n📱 RECENT STATUSES:');
                    let index = 1;
                    const sortedStatuses = Array.from(tracker.statusCache.entries())
                        .sort((a, b) => b[1].timestamp - a[1].timestamp)
                        .slice(0, 5);
                    
                    for (const [id, status] of sortedStatuses) {
                        const age = Math.round((Date.now() - status.timestamp) / 1000);
                        console.log(`${index}. ${status.phoneNumber} (${status.type})`);
                        console.log(`   Text: ${status.text?.substring(0, 30) || 'None'}...`);
                        console.log(`   Media: ${status.hasMedia ? 'Yes' : 'No'}, Age: ${age}s`);
                        console.log(`   ID: ${id.substring(0, 12)}...`);
                        index++;
                    }
                }
                
                console.log('─'.repeat(70));
                
                await sock.sendMessage(chatId, {
                    text: `🔧 Debug info sent to terminal\n\nStatus viewed: ${tracker.stats.statusesViewed}\nStatus downloaded: ${tracker.stats.statusesDownloaded}\nQueue: ${tracker.statusViewQueue.size}`
                });
                break;
                
            // ... [Keep other commands the same]
            
            default:
                const statusSummary = tracker.config.captureStatuses ? 
                    `📱 Status: ✅ ON (Viewed: ${tracker.stats.statusesViewed})` : 
                    `📱 Status: ❌ OFF`;
                
                const defaultResponse = `
🚫 *Antidelete System*

Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
Mode: ${tracker.mode.toUpperCase()}
${statusSummary}

📊 *Performance:*
Messages cached: ${tracker.messageCache.size}
Statuses cached: ${tracker.statusCache.size}
Media files: ${tracker.mediaStorage.size}

${tracker.mode === 'private' ? 
`🔒 *Private Mode Active*
Deleted messages sent to owner's DM` : 
`🌐 *Public Mode Active*
Deleted messages shown in chat`}

Owner: ${OWNER_NUMBER || 'Not set'}

Use \`${PREFIX}antidelete on\` to enable
Use \`${PREFIX}antidelete help\` for all commands
`.trim();
                
                await sock.sendMessage(chatId, {
                    text: defaultResponse
                }, { quoted: msg });
        }
    }
};