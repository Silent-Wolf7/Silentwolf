// // File: ./commands/utility/antidelete.js - FIXED VERSION
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { downloadMediaMessage, proto } from '@whiskeysockets/baileys';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');
// const STATUS_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_statuses');

// // Owner JID configuration
// let OWNER_JID = null;
// let OWNER_NUMBER = null;

// // Load owner info
// async function loadOwnerInfo() {
//     try {
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
//     description: 'Capture deleted messages and statuses with public/private modes',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX, metadata = {}) {
//         const chatId = msg.key.remoteJid;
        
//         console.log('🚫 Antidelete System - Now with Status Support');
        
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
//                 mode: 'public',
//                 messageCache: new Map(),
//                 statusCache: new Map(),
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
//                     sentToChat: 0,
//                     statusesDetected: 0,
//                     statusesDeleted: 0,
//                     statusesRetrieved: 0,
//                     statusesViewed: 0,
//                     statusesDownloaded: 0
//                 },
//                 seenMessages: new Map(),
//                 seenStatuses: new Map(),
//                 processedDeletions: new Set(),
//                 processedStatusDeletions: new Set(),
//                 mediaStorage: new Map(),
//                 statusStorage: new Map(),
//                 cleanupInterval: null,
//                 lastCleanup: Date.now(),
//                 ownerDmLog: new Map(),
//                 statusDmLog: new Map(),
//                 config: {
//                     autoCleanup: true,
//                     maxStorageHours: 24,
//                     notifyOnModeChange: true,
//                     stealthMode: false,
//                     logToTerminal: true,
//                     captureStatuses: true,
//                     statusPrivacy: 'owner',
//                     autoViewStatuses: true,
//                     statusViewDelay: 2000
//                 },
//                 statusViewQueue: new Map(),
//                 statusViewInterval: null
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // ====== UTILITY FUNCTIONS ======
        
//         // Check if sender is owner
//         function isOwner(msg) {
//             if (!msg) return false;
//             if (msg.key.fromMe) return true;
            
//             const senderJid = msg.key.participant || msg.key.remoteJid;
//             const cleaned = jidManager.cleanJid(senderJid);
            
//             if (OWNER_NUMBER && cleaned.cleanNumber === OWNER_NUMBER) return true;
//             if (jidManager.isOwner) return jidManager.isOwner(msg);
            
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
//                 'mode': '🔄',
//                 'status': '📱'
//             };
            
//             const prefix = prefixes[type] || '📝';
//             console.log(`${prefix} Antidelete: ${message}`);
//         }
        
//         // Ensure media directory
//         async function ensureMediaDir() {
//             try {
//                 await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
//                 await fs.mkdir(STATUS_STORAGE_PATH, { recursive: true });
//                 return true;
//             } catch (error) {
//                 cleanLog(`Directory error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // ====== MESSAGE STORAGE FUNCTIONS ======
        
//         // Store message with media
//         async function storeMessageWithMedia(message) {
//             try {
//                 if (!tracker.active) return;
                
//                 const msgId = message.key?.id;
//                 if (!msgId) return;
                
//                 // Skip if already cached
//                 if (tracker.messageCache.has(msgId)) return;
                
//                 const chatJid = message.key.remoteJid;
//                 const senderJid = message.key.participant || chatJid;
//                 const pushName = message.pushName || 'Unknown';
//                 const timestamp = message.messageTimestamp * 1000 || Date.now();
                
//                 // Extract message content
//                 const msgContent = message.message;
//                 let text = '';
//                 let type = 'text';
//                 let hasMedia = false;
//                 let mimetype = '';
//                 let caption = '';
                
//                 if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 } else if (msgContent?.imageMessage) {
//                     type = 'image';
//                     text = msgContent.imageMessage.caption || '';
//                     mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
//                     hasMedia = true;
//                     caption = text;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     text = msgContent.videoMessage.caption || '';
//                     mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
//                     hasMedia = true;
//                     caption = text;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     mimetype = msgContent.audioMessage.mimetype || 'audio/mpeg';
//                     hasMedia = true;
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     text = msgContent.documentMessage.fileName || 'Document';
//                     mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
//                     hasMedia = true;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
//                     hasMedia = true;
//                 }
                
//                 // Store message in cache
//                 const messageData = {
//                     id: msgId,
//                     chatJid: chatJid,
//                     senderJid: senderJid,
//                     pushName: pushName,
//                     timestamp: timestamp,
//                     type: type,
//                     text: text,
//                     caption: caption,
//                     hasMedia: hasMedia,
//                     mimetype: mimetype,
//                     rawMessage: message
//                 };
                
//                 tracker.messageCache.set(msgId, messageData);
                
//                 // Download media if present
//                 if (hasMedia) {
//                     setTimeout(async () => {
//                         try {
//                             await downloadAndSaveMedia(msgId, messageData, message);
//                         } catch (error) {
//                             cleanLog(`Media download failed: ${error.message}`, 'error');
//                         }
//                     }, 500);
//                 }
                
//                 return messageData;
                
//             } catch (error) {
//                 cleanLog(`Message storage error: ${error.message}`, 'error');
//                 return null;
//             }
//         }
        
//         // Download and save media
//         async function downloadAndSaveMedia(msgId, messageData, originalMessage) {
//             try {
//                 if (!messageData.hasMedia) return false;
                
//                 const buffer = await downloadMediaMessage(
//                     originalMessage,
//                     'buffer',
//                     {},
//                     {
//                         logger: { level: 'silent' },
//                         reuploadRequest: sock.updateMediaMessage
//                     }
//                 );
                
//                 if (!buffer || buffer.length === 0) {
//                     cleanLog('Empty buffer for media', 'warning');
//                     return false;
//                 }
                
//                 // Save to file
//                 await ensureMediaDir();
//                 const timestamp = Date.now();
//                 let extension = '.bin';
                
//                 if (messageData.type === 'image') extension = '.jpg';
//                 else if (messageData.type === 'video') extension = '.mp4';
//                 else if (messageData.type === 'audio') extension = '.mp3';
//                 else if (messageData.type === 'sticker') extension = '.webp';
//                 else if (messageData.mimetype.includes('pdf')) extension = '.pdf';
//                 else if (messageData.mimetype.includes('document')) extension = '.bin';
                
//                 const filename = `${messageData.type}_${timestamp}${extension}`;
//                 const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
//                 await fs.writeFile(filePath, buffer);
                
//                 // Store in media storage
//                 tracker.mediaStorage.set(msgId, {
//                     filePath: filePath,
//                     buffer: buffer,
//                     type: messageData.type,
//                     mimetype: messageData.mimetype,
//                     filename: filename,
//                     size: buffer.length,
//                     timestamp: timestamp
//                 });
                
//                 tracker.stats.mediaDownloaded++;
//                 cleanLog(`Media saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'success');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Media download error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // ====== DELETION HANDLING ======
        
//         // Handle deleted message
//         async function handleDeletedMessage(messageKey) {
//             try {
//                 const msgId = messageKey.id;
//                 const chatJid = messageKey.remoteJid;
                
//                 // Skip if already processed
//                 if (tracker.processedDeletions.has(msgId)) return;
//                 tracker.processedDeletions.add(msgId);
                
//                 cleanLog(`Deletion detected: ${msgId.substring(0, 8)}... in ${chatJid}`, 'deletion');
//                 tracker.stats.deletionsDetected++;
                
//                 // Get cached message
//                 const cachedMessage = tracker.messageCache.get(msgId);
//                 if (!cachedMessage) {
//                     cleanLog(`Message not found in cache: ${msgId.substring(0, 8)}...`, 'warning');
//                     tracker.stats.falsePositives++;
//                     return;
//                 }
                
//                 // Remove from cache
//                 tracker.messageCache.delete(msgId);
                
//                 // Handle based on mode
//                 if (tracker.mode === 'public') {
//                     await sendDeletedMessageToChat(chatJid, cachedMessage);
//                 } else if (tracker.mode === 'private') {
//                     await sendDeletedMessageToOwnerDM(cachedMessage);
//                 }
                
//                 tracker.stats.retrievedSuccessfully++;
                
//             } catch (error) {
//                 cleanLog(`Deletion handling error: ${error.message}`, 'error');
//             }
//         }
        
//         // Send deleted message to chat
//         async function sendDeletedMessageToChat(chatJid, messageData) {
//             try {
//                 const time = new Date(messageData.timestamp).toLocaleString();
//                 const senderNumber = jidManager.cleanJid(messageData.senderJid).cleanNumber;
                
//                 let messageText = `🗑️ *DELETED MESSAGE*\n\n`;
//                 messageText += `👤 From: ${senderNumber} (${messageData.pushName})\n`;
//                 messageText += `🕒 Time: ${time}\n`;
//                 messageText += `💬 Type: ${messageData.type.toUpperCase()}\n`;
                
//                 if (messageData.text) {
//                     messageText += `\n📝 Content:\n${messageData.text.substring(0, 500)}`;
//                     if (messageData.text.length > 500) messageText += '...';
//                 }
                
//                 messageText += `\n\n────────────\n`;
//                 messageText += `🔍 *Captured by antidelete system*`;
                
//                 // Check if we have media
//                 const mediaInfo = tracker.mediaStorage.get(messageData.id);
                
//                 if (messageData.hasMedia && mediaInfo) {
//                     let buffer = mediaInfo.buffer;
//                     if (!buffer) {
//                         buffer = await fs.readFile(mediaInfo.filePath);
//                     }
                    
//                     if (buffer && buffer.length > 0) {
//                         if (messageData.type === 'image') {
//                             await sock.sendMessage(chatJid, {
//                                 image: buffer,
//                                 caption: messageText,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'video') {
//                             await sock.sendMessage(chatJid, {
//                                 video: buffer,
//                                 caption: messageText,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'audio') {
//                             await sock.sendMessage(chatJid, {
//                                 audio: buffer,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'sticker') {
//                             await sock.sendMessage(chatJid, {
//                                 sticker: buffer,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else {
//                             await sock.sendMessage(chatJid, {
//                                 text: messageText + `\n\n📎 Media: ${messageData.type} (${Math.round(mediaInfo.size/1024)}KB)`
//                             });
//                         }
//                         tracker.stats.mediaSent++;
//                     } else {
//                         await sock.sendMessage(chatJid, { text: messageText });
//                     }
//                 } else {
//                     await sock.sendMessage(chatJid, { text: messageText });
//                 }
                
//                 tracker.stats.sentToChat++;
//                 cleanLog(`Deleted message sent to chat: ${senderNumber}`, 'success');
                
//             } catch (error) {
//                 cleanLog(`Chat send error: ${error.message}`, 'error');
//             }
//         }
        
//         // Send deleted message to owner DM
//         async function sendDeletedMessageToOwnerDM(messageData) {
//             try {
//                 const ownerJid = getOwnerJid();
//                 if (!ownerJid) {
//                     cleanLog('Owner JID not found', 'error');
//                     return false;
//                 }
                
//                 const time = new Date(messageData.timestamp).toLocaleString();
//                 const senderNumber = jidManager.cleanJid(messageData.senderJid).cleanNumber;
//                 const chatNumber = jidManager.cleanJid(messageData.chatJid).cleanNumber;
                
//                 let messageText = `🗑️ *DELETED MESSAGE (PRIVATE)*\n\n`;
//                 messageText += `👤 From: ${senderNumber} (${messageData.pushName})\n`;
//                 messageText += `💬 Chat: ${chatNumber}\n`;
//                 messageText += `🕒 Time: ${time}\n`;
//                 messageText += `📝 Type: ${messageData.type.toUpperCase()}\n`;
                
//                 if (messageData.text) {
//                     messageText += `\n📋 Content:\n${messageData.text.substring(0, 500)}`;
//                     if (messageData.text.length > 500) messageText += '...';
//                 }
                
//                 messageText += `\n\n────────────\n`;
//                 messageText += `🔐 *Private mode - Owner only*`;
                
//                 // Check if we have media
//                 const mediaInfo = tracker.mediaStorage.get(messageData.id);
                
//                 if (messageData.hasMedia && mediaInfo) {
//                     let buffer = mediaInfo.buffer;
//                     if (!buffer) {
//                         buffer = await fs.readFile(mediaInfo.filePath);
//                     }
                    
//                     if (buffer && buffer.length > 0) {
//                         if (messageData.type === 'image') {
//                             await sock.sendMessage(ownerJid, {
//                                 image: buffer,
//                                 caption: messageText,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'video') {
//                             await sock.sendMessage(ownerJid, {
//                                 video: buffer,
//                                 caption: messageText,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'audio') {
//                             await sock.sendMessage(ownerJid, {
//                                 audio: buffer,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else if (messageData.type === 'sticker') {
//                             await sock.sendMessage(ownerJid, {
//                                 sticker: buffer,
//                                 mimetype: mediaInfo.mimetype
//                             });
//                         } else {
//                             await sock.sendMessage(ownerJid, {
//                                 text: messageText + `\n\n📎 Media: ${messageData.type} (${Math.round(mediaInfo.size/1024)}KB)`
//                             });
//                         }
//                         tracker.stats.mediaSent++;
//                     } else {
//                         await sock.sendMessage(ownerJid, { text: messageText });
//                     }
//                 } else {
//                     await sock.sendMessage(ownerJid, { text: messageText });
//                 }
                
//                 tracker.ownerDmLog.set(messageData.id, {
//                     timestamp: Date.now(),
//                     sender: senderNumber,
//                     chat: chatNumber,
//                     type: messageData.type,
//                     hasMedia: messageData.hasMedia
//                 });
                
//                 tracker.stats.sentToDm++;
//                 cleanLog(`Deleted message sent to owner DM: ${senderNumber} → ${chatNumber}`, 'dm');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`DM error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // ====== STATUS VIEWING FUNCTIONS ======
        
//         // Fetch and view status - FIXED VERSION
//         async function fetchAndViewStatus(statusJid) {
//             try {
//                 if (!tracker.config.autoViewStatuses) return;
                
//                 const phoneNumber = statusJid.split('@')[0];
//                 cleanLog(`Fetching status for: ${phoneNumber}`, 'status');
                
//                 // Try to fetch status list
//                 try {
//                     // Use WAP methods to fetch status
//                     const statusResult = await sock.fetchStatus(statusJid);
                    
//                     if (statusResult && statusResult.length > 0) {
//                         cleanLog(`Found ${statusResult.length} status messages for ${phoneNumber}`, 'success');
                        
//                         for (const statusMsg of statusResult) {
//                             await storeStatusFromMessage(statusJid, statusMsg);
//                         }
                        
//                         // Send read receipt for each status
//                         for (const statusMsg of statusResult) {
//                             try {
//                                 const receiptMsg = {
//                                     key: {
//                                         remoteJid: 'status@broadcast',
//                                         fromMe: true,
//                                         id: `status_read_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//                                     },
//                                     message: {
//                                         protocolMessage: {
//                                             type: proto.Message.ProtocolMessage.Type.READ_STATUS,
//                                             key: {
//                                                 remoteJid: statusJid,
//                                                 fromMe: false,
//                                                 id: statusMsg.key?.id || `status_${Date.now()}`
//                                             }
//                                         }
//                                     }
//                                 };
                                
//                                 await sock.relayMessage('status@broadcast', receiptMsg.message, {
//                                     messageId: receiptMsg.key.id
//                                 });
                                
//                                 cleanLog(`Sent status read receipt for: ${phoneNumber}`, 'status');
//                                 tracker.stats.statusesViewed++;
//                             } catch (readError) {
//                                 cleanLog(`Status read error: ${readError.message}`, 'error');
//                             }
//                         }
                        
//                         return true;
//                     } else {
//                         cleanLog(`No status messages found for ${phoneNumber}`, 'warning');
//                         return false;
//                     }
//                 } catch (queryError) {
//                     cleanLog(`Status query error: ${queryError.message}`, 'error');
//                     return false;
//                 }
                
//             } catch (error) {
//                 cleanLog(`Status fetch error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Process status view queue
//         async function processStatusViewQueue() {
//             try {
//                 const now = Date.now();
//                 const maxAge = 5 * 60 * 1000; // 5 minutes
                
//                 for (const [jid, data] of tracker.statusViewQueue.entries()) {
//                     if (now - data.timestamp > maxAge) {
//                         tracker.statusViewQueue.delete(jid);
//                         continue;
//                     }
                    
//                     // Try to fetch status after delay
//                     if (data.attempts < 3) {
//                         setTimeout(async () => {
//                             try {
//                                 await fetchAndViewStatus(jid);
//                             } catch (error) {
//                                 cleanLog(`Queue process error: ${error.message}`, 'error');
//                             }
//                         }, data.attempts * 3000);
                        
//                         data.attempts++;
//                         tracker.statusViewQueue.set(jid, data);
//                     }
//                 }
//             } catch (error) {
//                 cleanLog(`Queue processing error: ${error.message}`, 'error');
//             }
//         }
        
//         // Fetch status content
//         async function fetchStatusContent(statusJid) {
//             try {
//                 const phoneNumber = statusJid.split('@')[0];
//                 cleanLog(`Attempting to fetch status content for: ${phoneNumber}`, 'status');
                
//                 // Try to get status messages
//                 const statusMessages = await sock.fetchStatus(statusJid);
                
//                 if (statusMessages && statusMessages.length > 0) {
//                     cleanLog(`Found ${statusMessages.length} status messages for ${phoneNumber}`, 'success');
                    
//                     for (const statusMsg of statusMessages) {
//                         await storeStatusFromMessage(statusJid, statusMsg);
//                     }
                    
//                     return true;
//                 } else {
//                     cleanLog(`No status messages found for ${phoneNumber}`, 'warning');
//                     return false;
//                 }
                
//             } catch (error) {
//                 cleanLog(`Status content fetch error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Store status from fetched message
//         async function storeStatusFromMessage(statusJid, statusMsg) {
//             try {
//                 const statusId = statusMsg.key?.id || `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//                 const phoneNumber = statusJid.split('@')[0];
                
//                 // Skip if already cached
//                 if (tracker.statusCache.has(statusId)) return;
                
//                 const statusDetails = {
//                     id: statusId,
//                     jid: statusJid,
//                     timestamp: Date.now(),
//                     phoneNumber: phoneNumber,
//                     type: 'text',
//                     hasMedia: false,
//                     text: '',
//                     mediaInfo: null,
//                     metadata: {},
//                     fetched: true
//                 };
                
//                 // Extract status content
//                 const msgContent = statusMsg.message;
                
//                 if (msgContent?.conversation) {
//                     statusDetails.text = msgContent.conversation;
//                     statusDetails.type = 'text';
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     statusDetails.text = msgContent.extendedTextMessage.text;
//                     statusDetails.type = 'text';
//                 }
                
//                 // Check for media
//                 if (msgContent?.imageMessage) {
//                     statusDetails.hasMedia = true;
//                     statusDetails.type = 'image';
//                     statusDetails.caption = msgContent.imageMessage.caption || '';
//                     statusDetails.mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
//                     statusDetails.mediaSize = msgContent.imageMessage.fileLength || 0;
                    
//                     statusDetails.mediaInfo = {
//                         message: statusMsg,
//                         type: 'image'
//                     };
//                 } else if (msgContent?.videoMessage) {
//                     statusDetails.hasMedia = true;
//                     statusDetails.type = 'video';
//                     statusDetails.caption = msgContent.videoMessage.caption || '';
//                     statusDetails.mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
//                     statusDetails.mediaSize = msgContent.videoMessage.fileLength || 0;
                    
//                     statusDetails.mediaInfo = {
//                         message: statusMsg,
//                         type: 'video'
//                     };
//                 }
                
//                 // Store in cache
//                 tracker.statusCache.set(statusId, statusDetails);
//                 tracker.stats.statusesDetected++;
                
//                 cleanLog(`Stored status ${statusDetails.type} from ${phoneNumber}`, 'status');
                
//                 // Download media if present
//                 if (statusDetails.hasMedia && statusDetails.mediaInfo) {
//                     setTimeout(async () => {
//                         try {
//                             await downloadAndSaveStatusMedia(statusId, statusDetails);
//                         } catch (error) {
//                             cleanLog(`Status media download failed: ${error.message}`, 'error');
//                         }
//                     }, 1000);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Status storage error: ${error.message}`, 'error');
//             }
//         }
        
//         // ====== STATUS DETECTION FUNCTIONS ======
        
//         // Detect and store statuses from updates
//         async function storeStatusUpdate(statusUpdate) {
//             try {
//                 if (!tracker.config.captureStatuses) return;
                
//                 const statusData = statusUpdate.status;
//                 if (!statusData) return;
                
//                 const statusJid = statusUpdate.jid;
//                 const phoneNumber = statusJid.split('@')[0];
                
//                 cleanLog(`Status update detected from: ${phoneNumber}`, 'status');
                
//                 // Auto-view status if enabled
//                 if (tracker.config.autoViewStatuses) {
//                     setTimeout(async () => {
//                         await fetchAndViewStatus(statusJid);
//                     }, tracker.config.statusViewDelay);
//                 }
                
//                 // Create status entry
//                 const statusId = `status_${Date.now()}_${phoneNumber}`;
                
//                 const statusDetails = {
//                     id: statusId,
//                     jid: statusJid,
//                     timestamp: Date.now(),
//                     phoneNumber: phoneNumber,
//                     type: 'unknown',
//                     hasMedia: false,
//                     text: '',
//                     metadata: statusUpdate,
//                     autoViewed: tracker.config.autoViewStatuses
//                 };
                
//                 tracker.statusCache.set(statusId, statusDetails);
//                 tracker.stats.statusesDetected++;
                
//                 // Try to fetch content after delay
//                 if (tracker.config.autoViewStatuses) {
//                     setTimeout(async () => {
//                         try {
//                             await fetchStatusContent(statusJid);
//                         } catch (error) {
//                             cleanLog(`Auto-fetch failed: ${error.message}`, 'error');
//                         }
//                     }, tracker.config.statusViewDelay + 1000);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Status update storage error: ${error.message}`, 'error');
//             }
//         }
        
//         // Download and save status media
//         async function downloadAndSaveStatusMedia(statusId, statusDetails) {
//             try {
//                 if (!statusDetails.mediaInfo) return false;
                
//                 const phoneNumber = statusDetails.phoneNumber;
//                 cleanLog(`Downloading status media for ${phoneNumber}...`, 'status');
                
//                 const buffer = await downloadMediaMessage(
//                     statusDetails.mediaInfo.message,
//                     'buffer',
//                     {},
//                     {
//                         logger: { level: 'silent' },
//                         reuploadRequest: sock.updateMediaMessage
//                     }
//                 );
                
//                 if (!buffer || buffer.length === 0) {
//                     cleanLog('Empty buffer for status media', 'warning');
//                     return false;
//                 }
                
//                 // Save to file
//                 await ensureMediaDir();
//                 const timestamp = Date.now();
//                 const extension = statusDetails.type === 'video' ? '.mp4' : '.jpg';
//                 const filename = `status_${phoneNumber}_${timestamp}${extension}`;
//                 const filePath = path.join(STATUS_STORAGE_PATH, filename);
                
//                 await fs.writeFile(filePath, buffer);
                
//                 // Store in status storage
//                 tracker.statusStorage.set(statusId, {
//                     filePath: filePath,
//                     buffer: buffer,
//                     type: statusDetails.type,
//                     mimetype: statusDetails.mimetype || (statusDetails.type === 'video' ? 'video/mp4' : 'image/jpeg'),
//                     filename: filename,
//                     size: buffer.length,
//                     timestamp: timestamp,
//                     jid: statusDetails.jid,
//                     phoneNumber: phoneNumber
//                 });
                
//                 tracker.stats.statusesDownloaded++;
//                 cleanLog(`Status media saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'success');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Status download error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Handle deleted status
//         async function handleDeletedStatus(deletedStatusId) {
//             try {
//                 if (!tracker.config.captureStatuses) return;
                
//                 cleanLog(`Status deletion detected: ${deletedStatusId}`, 'status');
//                 tracker.stats.statusesDeleted++;
                
//                 const cachedStatus = tracker.statusCache.get(deletedStatusId);
//                 if (!cachedStatus) {
//                     cleanLog(`Status not found in cache: ${deletedStatusId}`, 'warning');
//                     return;
//                 }
                
//                 tracker.statusCache.delete(deletedStatusId);
                
//                 const privacy = tracker.config.statusPrivacy;
//                 const ownerJid = getOwnerJid();
                
//                 if (privacy === 'none') return;
                
//                 if (privacy === 'owner' && ownerJid) {
//                     await sendStatusToOwnerDM(cachedStatus);
//                 } else if (privacy === 'all') {
//                     if (ownerJid) {
//                         await sendStatusToOwnerDM(cachedStatus);
//                     }
//                 }
                
//                 tracker.stats.statusesRetrieved++;
                
//             } catch (error) {
//                 cleanLog(`Status retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Send deleted status to owner DM
//         async function sendStatusToOwnerDM(statusDetails) {
//             try {
//                 const ownerJid = getOwnerJid();
//                 if (!ownerJid) {
//                     cleanLog('Owner JID not found for status DM', 'error');
//                     return false;
//                 }
                
//                 const statusMedia = tracker.statusStorage.get(statusDetails.id);
//                 const time = new Date(statusDetails.timestamp).toLocaleString();
//                 const senderNumber = statusDetails.phoneNumber;
                
//                 let caption = `📱 *DELETED STATUS CAPTURED*\n\n`;
//                 caption += `👤 From: ${senderNumber}\n`;
//                 caption += `🕒 Posted: ${time}\n`;
//                 caption += `📊 Type: ${statusDetails.hasMedia ? statusDetails.type.toUpperCase() : 'TEXT'}\n`;
                
//                 if (statusDetails.text) {
//                     caption += `\n💬 Status Text:\n${statusDetails.text.substring(0, 500)}`;
//                     if (statusDetails.text.length > 500) caption += '...';
//                 }
                
//                 if (statusDetails.caption) {
//                     caption += `\n\n📝 Media Caption:\n${statusDetails.caption}`;
//                 }
                
//                 caption += `\n\n────────────\n`;
//                 caption += `🔍 *Captured by antidelete status monitor*`;
                
//                 if (statusDetails.hasMedia && statusMedia) {
//                     try {
//                         let buffer = statusMedia.buffer;
//                         if (!buffer) {
//                             buffer = await fs.readFile(statusMedia.filePath);
//                         }
                        
//                         if (buffer && buffer.length > 0) {
//                             if (statusDetails.type === 'image') {
//                                 await sock.sendMessage(ownerJid, {
//                                     image: buffer,
//                                     caption: caption,
//                                     mimetype: statusMedia.mimetype
//                                 });
//                             } else if (statusDetails.type === 'video') {
//                                 await sock.sendMessage(ownerJid, {
//                                     video: buffer,
//                                     caption: caption,
//                                     mimetype: statusMedia.mimetype
//                                 });
//                             }
//                         } else {
//                             await sock.sendMessage(ownerJid, { text: caption });
//                         }
//                     } catch (mediaError) {
//                         cleanLog(`Status media send error: ${mediaError.message}`, 'error');
//                         await sock.sendMessage(ownerJid, { text: caption });
//                     }
//                 } else {
//                     await sock.sendMessage(ownerJid, { text: caption });
//                 }
                
//                 tracker.statusDmLog.set(statusDetails.id, {
//                     timestamp: Date.now(),
//                     sender: senderNumber,
//                     type: statusDetails.type,
//                     hasMedia: statusDetails.hasMedia
//                 });
                
//                 cleanLog(`Status sent to owner DM: ${senderNumber}`, 'status');
//                 return true;
                
//             } catch (error) {
//                 cleanLog(`Status DM error: ${error.message}`, 'error');
//                 return false;
//             }
//         }
        
//         // Setup status viewing interval
//         function setupStatusViewInterval() {
//             if (tracker.statusViewInterval) {
//                 clearInterval(tracker.statusViewInterval);
//             }
            
//             tracker.statusViewInterval = setInterval(async () => {
//                 await processStatusViewQueue();
//             }, 10 * 1000); // Process queue every 10 seconds
//         }
        
//         // Setup cleanup
//         function setupCleanupInterval() {
//             if (tracker.cleanupInterval) {
//                 clearInterval(tracker.cleanupInterval);
//             }
            
//             tracker.cleanupInterval = setInterval(async () => {
//                 await cleanupOldData();
//             }, 10 * 60 * 1000);
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
            
//             // Clean status media files
//             for (const [statusId, statusMedia] of tracker.statusStorage.entries()) {
//                 if (now - statusMedia.timestamp > maxAge) {
//                     await cleanupStatusMedia(statusId);
//                 }
//             }
            
//             // Clean old messages
//             for (const [msgId, data] of tracker.messageCache.entries()) {
//                 if (now - data.timestamp > maxAge) {
//                     tracker.messageCache.delete(msgId);
//                 }
//             }
            
//             // Clean old statuses
//             for (const [statusId, data] of tracker.statusCache.entries()) {
//                 if (now - data.timestamp > maxAge) {
//                     tracker.statusCache.delete(statusId);
//                 }
//             }
            
//             tracker.lastCleanup = now;
//         }
        
//         // Clean up status media
//         async function cleanupStatusMedia(statusId) {
//             try {
//                 if (tracker.statusStorage.has(statusId)) {
//                     const statusMedia = tracker.statusStorage.get(statusId);
//                     try {
//                         await fs.unlink(statusMedia.filePath);
//                     } catch (error) {}
//                     tracker.statusStorage.delete(statusId);
//                 }
//             } catch (error) {}
//         }
        
//         // Clean up media
//         async function cleanupMedia(messageId) {
//             try {
//                 if (tracker.mediaStorage.has(messageId)) {
//                     const mediaInfo = tracker.mediaStorage.get(messageId);
//                     try {
//                         await fs.unlink(mediaInfo.filePath);
//                     } catch (error) {}
//                     tracker.mediaStorage.delete(messageId);
//                 }
//             } catch (error) {}
//         }
        
//         // Setup listener
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog(`Setting up antidelete with status support in ${tracker.mode} mode...`, 'system');
            
//             ensureMediaDir();
//             setupCleanupInterval();
//             setupStatusViewInterval();
            
//             // Store regular messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     if (type === 'notify') {
//                         for (const message of messages) {
//                             if (message.key?.fromMe) continue;
                            
//                             // Check if it's a status message
//                             const chatId = message.key.remoteJid;
//                             if (chatId === 'status@broadcast') {
//                                 cleanLog(`Broadcast status detected`, 'status');
//                                 // This is a status message
//                                 await storeStatusFromBroadcast(message);
//                                 continue;
//                             }
                            
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
            
//             // Store status from broadcast
//             async function storeStatusFromBroadcast(message) {
//                 try {
//                     const msgId = message.key?.id || `status_broadcast_${Date.now()}`;
                    
//                     // Extract sender info from status
//                     const pushName = message.pushName || 'Unknown';
//                     const statusContent = message.message;
                    
//                     let text = '';
//                     let type = 'text';
//                     let hasMedia = false;
//                     let mimetype = '';
                    
//                     if (statusContent?.conversation) {
//                         text = statusContent.conversation;
//                     } else if (statusContent?.extendedTextMessage?.text) {
//                         text = statusContent.extendedTextMessage.text;
//                     } else if (statusContent?.imageMessage) {
//                         type = 'image';
//                         text = statusContent.imageMessage.caption || '';
//                         mimetype = statusContent.imageMessage.mimetype || 'image/jpeg';
//                         hasMedia = true;
//                     } else if (statusContent?.videoMessage) {
//                         type = 'video';
//                         text = statusContent.videoMessage.caption || '';
//                         mimetype = statusContent.videoMessage.mimetype || 'video/mp4';
//                         hasMedia = true;
//                     }
                    
//                     // Try to get sender JID from status
//                     let senderJid = null;
//                     if (message.key?.participant) {
//                         senderJid = message.key.participant;
//                     }
                    
//                     if (senderJid) {
//                         const statusDetails = {
//                             id: msgId,
//                             jid: senderJid,
//                             timestamp: Date.now(),
//                             phoneNumber: senderJid.split('@')[0],
//                             pushName: pushName,
//                             type: type,
//                             hasMedia: hasMedia,
//                             text: text,
//                             mimetype: mimetype,
//                             fromBroadcast: true,
//                             mediaInfo: hasMedia ? { message: message, type: type } : null
//                         };
                        
//                         tracker.statusCache.set(msgId, statusDetails);
//                         tracker.stats.statusesDetected++;
                        
//                         cleanLog(`Broadcast status stored: ${pushName} (${type})`, 'status');
                        
//                         // Download media if present
//                         if (hasMedia) {
//                             setTimeout(async () => {
//                                 try {
//                                     await downloadAndSaveStatusMedia(msgId, statusDetails);
//                                 } catch (error) {
//                                     cleanLog(`Broadcast media download failed: ${error.message}`, 'error');
//                                 }
//                             }, 1000);
//                         }
//                     }
                    
//                 } catch (error) {
//                     cleanLog(`Broadcast status error: ${error.message}`, 'error');
//                 }
//             }
            
//             // Handle message deletions
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
//                         const messageId = update.key?.id;
//                         const chatId = update.key?.remoteJid;
                        
//                         if (!messageId || !chatId) continue;
                        
//                         // Check if it's a status update
//                         if (updateData.status !== undefined) {
//                             const statusValue = updateData.status;
//                             const jid = chatId;
                            
//                             cleanLog(`Status update: ${jid} → ${statusValue}`, 'status');
                            
//                             if (statusValue === 2) { // Status posted
//                                 await storeStatusUpdate({
//                                     jid: jid,
//                                     status: { id: messageId }
//                                 });
//                             } else if (statusValue === 3) { // Status deleted
//                                 await handleDeletedStatus(messageId);
//                             }
//                             continue;
//                         }
                        
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
            
//             // Listen for presence updates (status deletions)
//             sock.ev.on('presence.update', async (update) => {
//                 try {
//                     if (!tracker.active || !tracker.config.captureStatuses) return;
                    
//                     if (update.type === 'unavailable' && update.id) {
//                         const statusId = update.id;
//                         if (tracker.statusCache.has(statusId)) {
//                             await handleDeletedStatus(statusId);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Status presence error: ${error.message}`, 'error');
//                 }
//             });
            
//             tracker.listenerSetup = true;
//             cleanLog(`Listener ready with status support in ${tracker.mode} mode`, 'success');
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
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
                
//                 const modeDescription = tracker.mode === 'private' ? 
//                     `🔒 *PRIVATE MODE*\n\nAll deleted messages will be sent to owner's DM:\n${getOwnerJid() || 'Owner not set'}` :
//                     `🌐 *PUBLIC MODE*\n\nDeleted messages will be shown in the original chat.`;
                
//                 const statusConfig = tracker.config.captureStatuses ? 
//                     `📱 *Status Monitoring:* ✅ ENABLED\n• Auto-view: ${tracker.config.autoViewStatuses ? 'ON' : 'OFF'}\n• Privacy: ${tracker.config.statusPrivacy}` :
//                     `📱 *Status Monitoring:* ❌ DISABLED`;
                
//                 cleanLog(`Antidelete ${tracker.mode.toUpperCase()} mode enabled`, 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\n${modeDescription}\n\n${statusConfig}\n\nFeatures:\n• Message/media antidelete\n• Status monitoring & auto-view\n• Auto-cleanup system\n\nUse \`${PREFIX}antidelete test\` to verify.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//                 tracker.active = false;
//                 if (tracker.cleanupInterval) {
//                     clearInterval(tracker.cleanupInterval);
//                     tracker.cleanupInterval = null;
//                 }
//                 if (tracker.statusViewInterval) {
//                     clearInterval(tracker.statusViewInterval);
//                     tracker.statusViewInterval = null;
//                 }
                
//                 cleanLog('Antidelete disabled', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE DISABLED*\n\nMode was: ${tracker.mode.toUpperCase()}\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nStatus monitoring settings can only be changed by the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 const subCmd = args[1]?.toLowerCase();
                
//                 if (!subCmd) {
//                     const statusInfo = `
// 📱 *Status Monitoring Settings*

// Capture: ${tracker.config.captureStatuses ? '✅ ENABLED' : '❌ DISABLED'}
// Auto-view: ${tracker.config.autoViewStatuses ? '✅ ON' : '❌ OFF'}
// Privacy: ${tracker.config.statusPrivacy.toUpperCase()}
// View Delay: ${tracker.config.statusViewDelay}ms

// 📊 *Statistics:*
// Detected: ${tracker.stats.statusesDetected}
// Viewed: ${tracker.stats.statusesViewed}
// Downloaded: ${tracker.stats.statusesDownloaded}
// Deleted: ${tracker.stats.statusesDeleted}
// Retrieved: ${tracker.stats.statusesRetrieved}
// Cached: ${tracker.statusCache.size}
// Queue: ${tracker.statusViewQueue.size}

// 💡 *Commands:*
// • \`${PREFIX}antidelete status on/off\` - Toggle capture
// • \`${PREFIX}antidelete status view on/off\` - Auto-view
// • \`${PREFIX}antidelete status privacy <owner/all/none>\`
// • \`${PREFIX}antidelete status delay <ms>\` - Set view delay
// • \`${PREFIX}antidelete status fetch <number>\` - Fetch specific status
// • \`${PREFIX}antidelete status clear\` - Clear cache
// `;
                    
//                     await sock.sendMessage(chatId, { text: statusInfo }, { quoted: msg });
//                     return;
//                 }
                
//                 switch (subCmd) {
//                     case 'on':
//                         tracker.config.captureStatuses = true;
//                         await sock.sendMessage(chatId, {
//                             text: `✅ *Status Capture ENABLED*\n\nDeleted statuses will be captured.`
//                         }, { quoted: msg });
//                         break;
                        
//                     case 'off':
//                         tracker.config.captureStatuses = false;
//                         await sock.sendMessage(chatId, {
//                             text: `✅ *Status Capture DISABLED*\n\nStatus monitoring turned off.`
//                         }, { quoted: msg });
//                         break;
                        
//                     case 'view':
//                         const viewMode = args[2]?.toLowerCase();
//                         if (viewMode === 'on') {
//                             tracker.config.autoViewStatuses = true;
//                             setupStatusViewInterval();
//                             await sock.sendMessage(chatId, {
//                                 text: `✅ *Auto-view ENABLED*\n\nStatuses will be automatically viewed and downloaded.`
//                             }, { quoted: msg });
//                         } else if (viewMode === 'off') {
//                             tracker.config.autoViewStatuses = false;
//                             if (tracker.statusViewInterval) {
//                                 clearInterval(tracker.statusViewInterval);
//                                 tracker.statusViewInterval = null;
//                             }
//                             await sock.sendMessage(chatId, {
//                                 text: `✅ *Auto-view DISABLED*\n\nStatus auto-viewing turned off.`
//                             }, { quoted: msg });
//                         } else {
//                             await sock.sendMessage(chatId, {
//                                 text: `❓ Usage: \`${PREFIX}antidelete status view on/off\``
//                             }, { quoted: msg });
//                         }
//                         break;
                        
//                     case 'fetch':
//                         const number = args[2];
//                         if (!number) {
//                             await sock.sendMessage(chatId, {
//                                 text: `❓ Usage: \`${PREFIX}antidelete status fetch <number>\``
//                             }, { quoted: msg });
//                             return;
//                         }
                        
//                         const fetchJid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
                        
//                         await sock.sendMessage(chatId, {
//                             text: `⏳ Fetching status for ${number}...`
//                         }, { quoted: msg });
                        
//                         try {
//                             const success = await fetchStatusContent(fetchJid);
//                             if (success) {
//                                 await sock.sendMessage(chatId, {
//                                     text: `✅ Status fetched successfully for ${number}`
//                                 });
//                             } else {
//                                 await sock.sendMessage(chatId, {
//                                     text: `❌ Could not fetch status for ${number}`
//                                 });
//                             }
//                         } catch (error) {
//                             await sock.sendMessage(chatId, {
//                                 text: `❌ Error fetching status: ${error.message}`
//                             });
//                         }
//                         break;
                        
//                     case 'delay':
//                         const delayMs = parseInt(args[2]);
//                         if (!delayMs || delayMs < 0) {
//                             await sock.sendMessage(chatId, {
//                                 text: `❓ Usage: \`${PREFIX}antidelete status delay <milliseconds>\``
//                             }, { quoted: msg });
//                             return;
//                         }
                        
//                         tracker.config.statusViewDelay = delayMs;
//                         await sock.sendMessage(chatId, {
//                             text: `✅ *View delay updated*\n\nDelay set to: ${delayMs}ms`
//                         }, { quoted: msg });
//                         break;
                        
//                     case 'privacy':
//                         const privacyMode = args[2]?.toLowerCase();
//                         if (!privacyMode || !['owner', 'all', 'none'].includes(privacyMode)) {
//                             await sock.sendMessage(chatId, {
//                                 text: `🔒 *Status Privacy*\n\nCurrent: ${tracker.config.statusPrivacy}\n\nOptions:\n• owner - Send to owner DM\n• all - Show in chat\n• none - Don't retrieve\n\nUsage: \`${PREFIX}antidelete status privacy <mode>\``
//                             }, { quoted: msg });
//                             return;
//                         }
                        
//                         tracker.config.statusPrivacy = privacyMode;
//                         await sock.sendMessage(chatId, {
//                             text: `✅ *Privacy Updated*\n\nMode: ${privacyMode.toUpperCase()}`
//                         }, { quoted: msg });
//                         break;
                        
//                     case 'clear':
//                         const statusCount = tracker.statusCache.size;
//                         const mediaCount = tracker.statusStorage.size;
//                         const queueCount = tracker.statusViewQueue.size;
                        
//                         tracker.statusCache.clear();
//                         tracker.statusStorage.clear();
//                         tracker.statusViewQueue.clear();
//                         tracker.seenStatuses.clear();
//                         tracker.processedStatusDeletions.clear();
//                         tracker.statusDmLog.clear();
                        
//                         // Clean files
//                         try {
//                             const files = await fs.readdir(STATUS_STORAGE_PATH);
//                             for (const file of files) {
//                                 await fs.unlink(path.join(STATUS_STORAGE_PATH, file));
//                             }
//                         } catch (error) {}
                        
//                         await sock.sendMessage(chatId, {
//                             text: `🧹 *Status Cache Cleared*\n\nStatuses: ${statusCount}\nMedia: ${mediaCount}\nQueue: ${queueCount}`
//                         }, { quoted: msg });
//                         break;
                        
//                     default:
//                         await sock.sendMessage(chatId, {
//                             text: `❓ *Invalid Status Command*\n\nUse \`${PREFIX}antidelete status\` for options.`
//                         }, { quoted: msg });
//                 }
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
//                 console.log(`Status capture: ${tracker.config.captureStatuses}`);
//                 console.log(`Auto-view: ${tracker.config.autoViewStatuses}`);
//                 console.log(`View delay: ${tracker.config.statusViewDelay}ms`);
//                 console.log(`Status cache: ${tracker.statusCache.size}`);
//                 console.log(`Status storage: ${tracker.statusStorage.size}`);
//                 console.log(`View queue: ${tracker.statusViewQueue.size}`);
//                 console.log(`Status viewed: ${tracker.stats.statusesViewed}`);
//                 console.log(`Status downloaded: ${tracker.stats.statusesDownloaded}`);
                
//                 // Show status view queue
//                 if (tracker.statusViewQueue.size > 0) {
//                     console.log('\n📋 STATUS VIEW QUEUE:');
//                     let index = 1;
//                     for (const [jid, data] of tracker.statusViewQueue.entries()) {
//                         const age = Math.round((Date.now() - data.timestamp) / 1000);
//                         console.log(`${index}. ${data.phoneNumber}`);
//                         console.log(`   Attempts: ${data.attempts}, Age: ${age}s`);
//                         index++;
//                         if (index > 5) break;
//                     }
//                 }
                
//                 // Show recent statuses
//                 if (tracker.statusCache.size > 0) {
//                     console.log('\n📱 RECENT STATUSES:');
//                     let index = 1;
//                     const sortedStatuses = Array.from(tracker.statusCache.entries())
//                         .sort((a, b) => b[1].timestamp - a[1].timestamp)
//                         .slice(0, 5);
                    
//                     for (const [id, status] of sortedStatuses) {
//                         const age = Math.round((Date.now() - status.timestamp) / 1000);
//                         console.log(`${index}. ${status.phoneNumber} (${status.type})`);
//                         console.log(`   Text: ${status.text?.substring(0, 30) || 'None'}...`);
//                         console.log(`   Media: ${status.hasMedia ? 'Yes' : 'No'}, Age: ${age}s`);
//                         console.log(`   ID: ${id.substring(0, 12)}...`);
//                         index++;
//                     }
//                 }
                
//                 console.log('─'.repeat(70));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal\n\nStatus viewed: ${tracker.stats.statusesViewed}\nStatus downloaded: ${tracker.stats.statusesDownloaded}\nQueue: ${tracker.statusViewQueue.size}`
//                 });
//                 break;
                
//             case 'test':
//                 const testMessage = `
// ✅ *Antidelete Test*

// System: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}
// Mode: ${tracker.mode.toUpperCase()}
// Status Support: ${tracker.config.captureStatuses ? '✅ ENABLED' : '❌ DISABLED'}

// 📊 *Cache Status:*
// Messages: ${tracker.messageCache.size}
// Statuses: ${tracker.statusCache.size}
// Media: ${tracker.mediaStorage.size}
// Status Media: ${tracker.statusStorage.size}

// 📈 *Stats:*
// Viewed: ${tracker.stats.statusesViewed}
// Detected: ${tracker.stats.statusesDetected}
// Queue: ${tracker.statusViewQueue.size}

// 💡 *Try deleting a message to test!*
// `;
                
//                 await sock.sendMessage(chatId, { text: testMessage }, { quoted: msg });
//                 break;
                
//             case 'clear':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nCache can only be cleared by the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 const msgCount = tracker.messageCache.size;
//                 const statusCount = tracker.statusCache.size;
//                 const mediaCount = tracker.mediaStorage.size;
//                 const statusMediaCount = tracker.statusStorage.size;
                
//                 tracker.messageCache.clear();
//                 tracker.statusCache.clear();
//                 tracker.mediaStorage.clear();
//                 tracker.statusStorage.clear();
//                 tracker.seenMessages.clear();
//                 tracker.seenStatuses.clear();
//                 tracker.processedDeletions.clear();
//                 tracker.processedStatusDeletions.clear();
//                 tracker.ownerDmLog.clear();
//                 tracker.statusDmLog.clear();
                
//                 // Clean files
//                 try {
//                     const mediaFiles = await fs.readdir(MEDIA_STORAGE_PATH);
//                     for (const file of mediaFiles) {
//                         await fs.unlink(path.join(MEDIA_STORAGE_PATH, file));
//                     }
                    
//                     const statusFiles = await fs.readdir(STATUS_STORAGE_PATH);
//                     for (const file of statusFiles) {
//                         await fs.unlink(path.join(STATUS_STORAGE_PATH, file));
//                     }
//                 } catch (error) {}
                
//                 cleanLog('Cache cleared', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧹 *Cache Cleared*\n\nMessages: ${msgCount}\nStatuses: ${statusCount}\nMedia: ${mediaCount}\nStatus Media: ${statusMediaCount}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//             case 'menu':
//                 const helpText = `
// 🚫 *ANTIDELETE COMMANDS*

// 📌 *Core Commands:*
// • \`${PREFIX}antidelete on\` - Enable public mode
// • \`${PREFIX}antidelete on private\` - Enable private mode (owner only)
// • \`${PREFIX}antidelete off\` - Disable system
// • \`${PREFIX}antidelete test\` - Test functionality
// • \`${PREFIX}antidelete stats\` - View statistics

// 📱 *Status Commands (Owner only):*
// • \`${PREFIX}antidelete status\` - Status settings
// • \`${PREFIX}antidelete status on/off\` - Toggle capture
// • \`${PREFIX}antidelete status view on/off\` - Auto-view
// • \`${PREFIX}antidelete status fetch <number>\` - Fetch status
// • \`${PREFIX}antidelete status privacy <owner/all/none>\`
// • \`${PREFIX}antidelete status clear\` - Clear cache

// 🔧 *Admin Commands (Owner only):*
// • \`${PREFIX}antidelete debug\` - Debug info
// • \`${PREFIX}antidelete clear\` - Clear all cache
// • \`${PREFIX}antidelete stealth on/off\` - Stealth mode
// • \`${PREFIX}antidelete cleanup <hours>\` - Set cleanup hours

// 📊 *Current Status:*
// • Active: ${tracker.active ? '✅' : '❌'}
// • Mode: ${tracker.mode}
// • Status Capture: ${tracker.config.captureStatuses ? '✅' : '❌'}
// • Messages cached: ${tracker.messageCache.size}
// • Statuses cached: ${tracker.statusCache.size}
// `;
                
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'stats':
//                 const statsText = `
// 📊 *ANTIDELETE STATISTICS*

// 🔹 *Messages:*
// Detected: ${tracker.stats.deletionsDetected}
// Retrieved: ${tracker.stats.retrievedSuccessfully}
// False positives: ${tracker.stats.falsePositives}
// Media retrieved: ${tracker.stats.mediaRetrieved}
// Media sent: ${tracker.stats.mediaSent}
// Sent to DM: ${tracker.stats.sentToDm}
// Sent to chat: ${tracker.stats.sentToChat}

// 🔹 *Statuses:*
// Detected: ${tracker.stats.statusesDetected}
// Viewed: ${tracker.stats.statusesViewed}
// Downloaded: ${tracker.stats.statusesDownloaded}
// Deleted: ${tracker.stats.statusesDeleted}
// Retrieved: ${tracker.stats.statusesRetrieved}

// 🔹 *Cache:*
// Messages: ${tracker.messageCache.size}
// Statuses: ${tracker.statusCache.size}
// Media files: ${tracker.mediaStorage.size}
// Status media: ${tracker.statusStorage.size}
// View queue: ${tracker.statusViewQueue.size}

// 🕒 Last cleanup: ${new Date(tracker.lastCleanup).toLocaleTimeString()}
// `;
                
//                 await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
//                 break;
                
//             case 'stealth':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nStealth mode can only be changed by the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 const stealthMode = args[1]?.toLowerCase();
//                 if (stealthMode === 'on') {
//                     tracker.config.stealthMode = true;
//                     tracker.config.notifyInChat = false;
//                     tracker.config.logToTerminal = false;
//                     await sock.sendMessage(chatId, {
//                         text: `✅ *Stealth Mode ENABLED*\n\nSystem will operate silently.`
//                     }, { quoted: msg });
//                 } else if (stealthMode === 'off') {
//                     tracker.config.stealthMode = false;
//                     tracker.config.notifyInChat = true;
//                     tracker.config.logToTerminal = true;
//                     await sock.sendMessage(chatId, {
//                         text: `✅ *Stealth Mode DISABLED*\n\nSystem will show notifications.`
//                     }, { quoted: msg });
//                 } else {
//                     await sock.sendMessage(chatId, {
//                         text: `❓ Usage: \`${PREFIX}antidelete stealth on/off\``
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'cleanup':
//                 if (!isOwner(msg)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Owner Only*\n\nCleanup settings can only be changed by the owner.`
//                     }, { quoted: msg });
//                 }
                
//                 const hours = parseInt(args[1]);
//                 if (!hours || hours < 1) {
//                     await sock.sendMessage(chatId, {
//                         text: `🧹 *Cleanup Settings*\n\nCurrent: ${tracker.config.maxStorageHours} hours\nAuto-cleanup: ${tracker.config.autoCleanup ? '✅ ON' : '❌ OFF'}\n\nUsage: \`${PREFIX}antidelete cleanup <hours>\``
//                     }, { quoted: msg });
//                     return;
//                 }
                
//                 tracker.config.maxStorageHours = hours;
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Cleanup Updated*\n\nFiles older than ${hours} hours will be automatically cleaned.`
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 const statusSummary = tracker.config.captureStatuses ? 
//                     `📱 Status: ✅ ON (Viewed: ${tracker.stats.statusesViewed})` : 
//                     `📱 Status: ❌ OFF`;
                
//                 const defaultResponse = `
// 🚫 *Antidelete System*

// Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
// Mode: ${tracker.mode.toUpperCase()}
// ${statusSummary}

// 📊 *Performance:*
// Messages cached: ${tracker.messageCache.size}
// Statuses cached: ${tracker.statusCache.size}
// Media files: ${tracker.mediaStorage.size}

// ${tracker.mode === 'private' ? 
// `🔒 *Private Mode Active*
// Deleted messages sent to owner's DM` : 
// `🌐 *Public Mode Active*
// Deleted messages shown in chat`}

// Owner: ${OWNER_NUMBER || 'Not set'}

// Use \`${PREFIX}antidelete help\` for all commands
// `.trim();
                
//                 await sock.sendMessage(chatId, {
//                     text: defaultResponse
//                 }, { quoted: msg });
//         }
//     }
// };
































// File: ./commands/utility/antidelete.js - OWNER ONLY & BACKGROUND PROCESS
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
                        console.log(`👑 Antidelete: Owner loaded: ${OWNER_NUMBER}`);
                        break;
                    }
                }
            } catch (error) {
                // Continue to next path
            }
        }
    } catch (error) {
        console.error('❌ Antidelete: Error loading owner info:', error.message);
    }
}

// Call on import
loadOwnerInfo();

// Background process manager
class BackgroundProcess {
    constructor() {
        this.active = false;
        this.logs = [];
        this.maxLogs = 100;
        this.lastActivity = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        // Store log
        this.logs.push({ timestamp: Date.now(), message: logEntry, type });
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Only show errors in terminal by default
        if (type === 'error') {
            console.error(`❌ Antidelete: ${message}`);
        } else if (type === 'system') {
            console.log(`🔧 Antidelete: ${message}`);
        } else if (type === 'start') {
            console.log(`🚀 Antidelete: ${message}`);
        } else if (type === 'stop') {
            console.log(`🛑 Antidelete: ${message}`);
        }
        
        this.lastActivity = Date.now();
    }

    getRecentLogs(count = 10) {
        return this.logs.slice(-count).map(log => log.message).join('\n');
    }

    getStats() {
        const errors = this.logs.filter(log => log.type === 'error').length;
        const warnings = this.logs.filter(log => log.type === 'warning').length;
        const infos = this.logs.filter(log => log.type === 'info').length;
        
        return {
            totalLogs: this.logs.length,
            errors,
            warnings,
            infos,
            lastActivity: new Date(this.lastActivity).toLocaleString(),
            uptime: this.active ? Date.now() - this.lastActivity : 0
        };
    }
}

// Global background process
if (!global.antideleteBackground) {
    global.antideleteBackground = new BackgroundProcess();
}

export default {
    name: 'antidelete',
    alias: ['undelete', 'antidel', 'ad'],
    description: 'OWNER ONLY - Capture deleted messages and statuses in background',
    category: 'owner',
    
    async execute(sock, msg, args, PREFIX, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const bg = global.antideleteBackground;
        
        // Check if sender is owner
        const isOwner = (() => {
            if (msg.key.fromMe) return true;
            
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const cleanNumber = senderJid.split('@')[0]?.split(':')[0];
            
            if (OWNER_NUMBER && cleanNumber === OWNER_NUMBER) return true;
            if (!OWNER_JID && !OWNER_NUMBER) {
                console.error('⚠️ Antidelete: Owner not configured');
                return false;
            }
            
            return false;
        })();
        
        // Reject if not owner
        if (!isOwner) {
            return sock.sendMessage(chatId, {
                text: `❌ *OWNER ONLY COMMAND*\n\nThis command is restricted to the bot owner.\n\nOwner: ${OWNER_NUMBER || 'Not configured'}`
            }, { quoted: msg });
        }
        
        bg.log('Command received from owner', 'system');
        
        // Get owner JID
        function getOwnerJid() {
            return OWNER_JID || (OWNER_NUMBER ? `${OWNER_NUMBER}@s.whatsapp.net` : null);
        }
        
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
            }
        };
        
        // Initialize global tracker
        if (!global.antideleteTerminal) {
            global.antideleteTerminal = {
                active: false,
                mode: 'private', // Default to private for owner
                messageCache: new Map(),
                statusCache: new Map(),
                listenerSetup: false,
                notifyInChat: false, // Don't notify in chat by default
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
                    statusesViewed: 0,
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
                    notifyOnModeChange: false,
                    stealthMode: true, // Stealth mode enabled by default
                    logToTerminal: false, // Don't log to terminal by default
                    captureStatuses: true,
                    statusPrivacy: 'owner',
                    autoViewStatuses: true,
                    statusViewDelay: 2000,
                    backgroundMode: true // Run in background
                },
                statusViewQueue: new Map(),
                statusViewInterval: null
            };
        }
        
        const tracker = global.antideleteTerminal;
        const command = args[0]?.toLowerCase() || 'help';
        
        // ====== UTILITY FUNCTIONS ======
        
        // Log messages to background process
        function backgroundLog(message, type = 'info') {
            bg.log(message, type);
        }
        
        // Ensure media directory
        async function ensureMediaDir() {
            try {
                await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
                await fs.mkdir(STATUS_STORAGE_PATH, { recursive: true });
                return true;
            } catch (error) {
                backgroundLog(`Directory error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // ====== MESSAGE STORAGE FUNCTIONS ======
        
        // Store message with media
        async function storeMessageWithMedia(message) {
            try {
                if (!tracker.active) return;
                
                const msgId = message.key?.id;
                if (!msgId) return;
                
                // Skip if already cached
                if (tracker.messageCache.has(msgId)) return;
                
                const chatJid = message.key.remoteJid;
                const senderJid = message.key.participant || chatJid;
                const pushName = message.pushName || 'Unknown';
                const timestamp = message.messageTimestamp * 1000 || Date.now();
                
                // Extract message content
                const msgContent = message.message;
                let text = '';
                let type = 'text';
                let hasMedia = false;
                let mimetype = '';
                let caption = '';
                
                if (msgContent?.conversation) {
                    text = msgContent.conversation;
                } else if (msgContent?.extendedTextMessage?.text) {
                    text = msgContent.extendedTextMessage.text;
                } else if (msgContent?.imageMessage) {
                    type = 'image';
                    text = msgContent.imageMessage.caption || '';
                    mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
                    hasMedia = true;
                    caption = text;
                } else if (msgContent?.videoMessage) {
                    type = 'video';
                    text = msgContent.videoMessage.caption || '';
                    mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
                    hasMedia = true;
                    caption = text;
                } else if (msgContent?.audioMessage) {
                    type = 'audio';
                    mimetype = msgContent.audioMessage.mimetype || 'audio/mpeg';
                    hasMedia = true;
                } else if (msgContent?.documentMessage) {
                    type = 'document';
                    text = msgContent.documentMessage.fileName || 'Document';
                    mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
                    hasMedia = true;
                } else if (msgContent?.stickerMessage) {
                    type = 'sticker';
                    mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
                    hasMedia = true;
                }
                
                // Store message in cache
                const messageData = {
                    id: msgId,
                    chatJid: chatJid,
                    senderJid: senderJid,
                    pushName: pushName,
                    timestamp: timestamp,
                    type: type,
                    text: text,
                    caption: caption,
                    hasMedia: hasMedia,
                    mimetype: mimetype,
                    rawMessage: message
                };
                
                tracker.messageCache.set(msgId, messageData);
                backgroundLog(`Stored message from ${pushName} (${type})`, 'info');
                
                // Download media if present
                if (hasMedia) {
                    setTimeout(async () => {
                        try {
                            await downloadAndSaveMedia(msgId, messageData, message);
                        } catch (error) {
                            backgroundLog(`Media download failed: ${error.message}`, 'error');
                        }
                    }, 500);
                }
                
                return messageData;
                
            } catch (error) {
                backgroundLog(`Message storage error: ${error.message}`, 'error');
                return null;
            }
        }
        
        // Download and save media
        async function downloadAndSaveMedia(msgId, messageData, originalMessage) {
            try {
                if (!messageData.hasMedia) return false;
                
                backgroundLog(`Downloading ${messageData.type} media...`, 'info');
                
                const buffer = await downloadMediaMessage(
                    originalMessage,
                    'buffer',
                    {},
                    {
                        logger: { level: 'silent' },
                        reuploadRequest: sock.updateMediaMessage
                    }
                );
                
                if (!buffer || buffer.length === 0) {
                    backgroundLog('Empty buffer for media', 'warning');
                    return false;
                }
                
                // Save to file
                await ensureMediaDir();
                const timestamp = Date.now();
                let extension = '.bin';
                
                if (messageData.type === 'image') extension = '.jpg';
                else if (messageData.type === 'video') extension = '.mp4';
                else if (messageData.type === 'audio') extension = '.mp3';
                else if (messageData.type === 'sticker') extension = '.webp';
                else if (messageData.mimetype.includes('pdf')) extension = '.pdf';
                else if (messageData.mimetype.includes('document')) extension = '.bin';
                
                const filename = `${messageData.type}_${timestamp}${extension}`;
                const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
                await fs.writeFile(filePath, buffer);
                
                // Store in media storage
                tracker.mediaStorage.set(msgId, {
                    filePath: filePath,
                    buffer: buffer,
                    type: messageData.type,
                    mimetype: messageData.mimetype,
                    filename: filename,
                    size: buffer.length,
                    timestamp: timestamp
                });
                
                tracker.stats.mediaDownloaded++;
                backgroundLog(`Media saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'success');
                return true;
                
            } catch (error) {
                backgroundLog(`Media download error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // ====== DELETION HANDLING ======
        
        // Handle deleted message
        async function handleDeletedMessage(messageKey) {
            try {
                const msgId = messageKey.id;
                const chatJid = messageKey.remoteJid;
                
                // Skip if already processed
                if (tracker.processedDeletions.has(msgId)) return;
                tracker.processedDeletions.add(msgId);
                
                backgroundLog(`Deletion detected in ${chatJid}`, 'info');
                tracker.stats.deletionsDetected++;
                
                // Get cached message
                const cachedMessage = tracker.messageCache.get(msgId);
                if (!cachedMessage) {
                    backgroundLog(`Message not found in cache`, 'warning');
                    tracker.stats.falsePositives++;
                    return;
                }
                
                // Remove from cache
                tracker.messageCache.delete(msgId);
                
                // Always send to owner in private mode
                await sendDeletedMessageToOwnerDM(cachedMessage);
                
                tracker.stats.retrievedSuccessfully++;
                
            } catch (error) {
                backgroundLog(`Deletion handling error: ${error.message}`, 'error');
            }
        }
        
        // Send deleted message to owner DM
        async function sendDeletedMessageToOwnerDM(messageData) {
            try {
                const ownerJid = getOwnerJid();
                if (!ownerJid) {
                    backgroundLog('Owner JID not found', 'error');
                    return false;
                }
                
                const time = new Date(messageData.timestamp).toLocaleString();
                const senderNumber = jidManager.cleanJid(messageData.senderJid).cleanNumber;
                const chatNumber = jidManager.cleanJid(messageData.chatJid).cleanNumber;
                
                let messageText = `🗑️ *DELETED MESSAGE*\n\n`;
                messageText += `👤 From: ${senderNumber} (${messageData.pushName})\n`;
                messageText += `💬 Chat: ${chatNumber}\n`;
                messageText += `🕒 Time: ${time}\n`;
                messageText += `📝 Type: ${messageData.type.toUpperCase()}\n`;
                
                if (messageData.text) {
                    messageText += `\n📋 Content:\n${messageData.text.substring(0, 500)}`;
                    if (messageData.text.length > 500) messageText += '...';
                }
                
                messageText += `\n\n────────────\n`;
                messageText += `🔍 *Captured by antidelete*`;
                
                // Check if we have media
                const mediaInfo = tracker.mediaStorage.get(messageData.id);
                
                if (messageData.hasMedia && mediaInfo) {
                    let buffer = mediaInfo.buffer;
                    if (!buffer) {
                        buffer = await fs.readFile(mediaInfo.filePath);
                    }
                    
                    if (buffer && buffer.length > 0) {
                        if (messageData.type === 'image') {
                            await sock.sendMessage(ownerJid, {
                                image: buffer,
                                caption: messageText,
                                mimetype: mediaInfo.mimetype
                            });
                        } else if (messageData.type === 'video') {
                            await sock.sendMessage(ownerJid, {
                                video: buffer,
                                caption: messageText,
                                mimetype: mediaInfo.mimetype
                            });
                        } else if (messageData.type === 'audio') {
                            await sock.sendMessage(ownerJid, {
                                audio: buffer,
                                mimetype: mediaInfo.mimetype
                            });
                        } else if (messageData.type === 'sticker') {
                            await sock.sendMessage(ownerJid, {
                                sticker: buffer,
                                mimetype: mediaInfo.mimetype
                            });
                        } else {
                            await sock.sendMessage(ownerJid, {
                                text: messageText + `\n\n📎 Media: ${messageData.type} (${Math.round(mediaInfo.size/1024)}KB)`
                            });
                        }
                        tracker.stats.mediaSent++;
                    } else {
                        await sock.sendMessage(ownerJid, { text: messageText });
                    }
                } else {
                    await sock.sendMessage(ownerJid, { text: messageText });
                }
                
                tracker.ownerDmLog.set(messageData.id, {
                    timestamp: Date.now(),
                    sender: senderNumber,
                    chat: chatNumber,
                    type: messageData.type,
                    hasMedia: messageData.hasMedia
                });
                
                tracker.stats.sentToDm++;
                backgroundLog(`Deleted message sent to owner: ${senderNumber} → ${chatNumber}`, 'info');
                return true;
                
            } catch (error) {
                backgroundLog(`DM error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // ====== STATUS HANDLING FUNCTIONS ======
        
        // Fetch and view status
        async function fetchAndViewStatus(statusJid) {
            try {
                if (!tracker.config.autoViewStatuses) return;
                
                const phoneNumber = statusJid.split('@')[0];
                backgroundLog(`Fetching status for: ${phoneNumber}`, 'info');
                
                try {
                    const statusResult = await sock.fetchStatus(statusJid);
                    
                    if (statusResult && statusResult.length > 0) {
                        backgroundLog(`Found ${statusResult.length} status messages`, 'success');
                        
                        for (const statusMsg of statusResult) {
                            await storeStatusFromMessage(statusJid, statusMsg);
                        }
                        
                        tracker.stats.statusesViewed++;
                        return true;
                    } else {
                        backgroundLog(`No status messages found`, 'warning');
                        return false;
                    }
                } catch (queryError) {
                    backgroundLog(`Status query error: ${queryError.message}`, 'error');
                    return false;
                }
                
            } catch (error) {
                backgroundLog(`Status fetch error: ${error.message}`, 'error');
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
                    fetched: true
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
                
                backgroundLog(`Stored status ${statusDetails.type} from ${phoneNumber}`, 'info');
                
                // Download media if present
                if (statusDetails.hasMedia && statusDetails.mediaInfo) {
                    setTimeout(async () => {
                        try {
                            await downloadAndSaveStatusMedia(statusId, statusDetails);
                        } catch (error) {
                            backgroundLog(`Status media download failed: ${error.message}`, 'error');
                        }
                    }, 1000);
                }
                
            } catch (error) {
                backgroundLog(`Status storage error: ${error.message}`, 'error');
            }
        }
        
        // Download and save status media
        async function downloadAndSaveStatusMedia(statusId, statusDetails) {
            try {
                if (!statusDetails.mediaInfo) return false;
                
                const phoneNumber = statusDetails.phoneNumber;
                backgroundLog(`Downloading status media for ${phoneNumber}...`, 'info');
                
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
                    backgroundLog('Empty buffer for status media', 'warning');
                    return false;
                }
                
                // Save to file
                await ensureMediaDir();
                const timestamp = Date.now();
                const extension = statusDetails.type === 'video' ? '.mp4' : '.jpg';
                const filename = `status_${phoneNumber}_${timestamp}${extension}`;
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
                    phoneNumber: phoneNumber
                });
                
                tracker.stats.statusesDownloaded++;
                backgroundLog(`Status media saved: ${filename}`, 'success');
                return true;
                
            } catch (error) {
                backgroundLog(`Status download error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Handle deleted status
        async function handleDeletedStatus(deletedStatusId) {
            try {
                if (!tracker.config.captureStatuses) return;
                
                backgroundLog(`Status deletion detected`, 'info');
                tracker.stats.statusesDeleted++;
                
                const cachedStatus = tracker.statusCache.get(deletedStatusId);
                if (!cachedStatus) {
                    backgroundLog(`Status not found in cache`, 'warning');
                    return;
                }
                
                tracker.statusCache.delete(deletedStatusId);
                await sendStatusToOwnerDM(cachedStatus);
                tracker.stats.statusesRetrieved++;
                
            } catch (error) {
                backgroundLog(`Status retrieval error: ${error.message}`, 'error');
            }
        }
        
        // Send deleted status to owner DM
        async function sendStatusToOwnerDM(statusDetails) {
            try {
                const ownerJid = getOwnerJid();
                if (!ownerJid) {
                    backgroundLog('Owner JID not found for status DM', 'error');
                    return false;
                }
                
                const statusMedia = tracker.statusStorage.get(statusDetails.id);
                const time = new Date(statusDetails.timestamp).toLocaleString();
                const senderNumber = statusDetails.phoneNumber;
                
                let caption = `📱 *DELETED STATUS*\n\n`;
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
                caption += `🔍 *Captured by antidelete*`;
                
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
                        backgroundLog(`Status media send error: ${mediaError.message}`, 'error');
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
                
                backgroundLog(`Status sent to owner: ${senderNumber}`, 'info');
                return true;
                
            } catch (error) {
                backgroundLog(`Status DM error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Setup cleanup interval
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
            backgroundLog(`Cleanup completed`, 'system');
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
        
        // Setup listener (background mode)
        function setupBackgroundListener() {
            if (tracker.listenerSetup) return;
            
            backgroundLog(`Starting background listener in stealth mode...`, 'start');
            
            ensureMediaDir();
            setupCleanupInterval();
            
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
                                backgroundLog(`Broadcast status detected`, 'info');
                                continue;
                            }
                            
                            const msgId = message.key?.id;
                            if (!msgId) continue;
                            
                            tracker.seenMessages.set(msgId, Date.now());
                            await storeMessageWithMedia(message);
                        }
                    }
                } catch (error) {
                    backgroundLog(`Storage error: ${error.message}`, 'error');
                }
            });
            
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
                            
                            if (statusValue === 2) { // Status posted
                                setTimeout(async () => {
                                    try {
                                        await fetchAndViewStatus(jid);
                                    } catch (error) {
                                        backgroundLog(`Status fetch failed: ${error.message}`, 'error');
                                    }
                                }, 2000);
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
                    backgroundLog(`Detection error: ${error.message}`, 'error');
                }
            });
            
            tracker.listenerSetup = true;
            bg.active = true;
            backgroundLog(`Background listener ready`, 'success');
        }
        
        // Stop background listener
        function stopBackgroundListener() {
            if (tracker.cleanupInterval) {
                clearInterval(tracker.cleanupInterval);
                tracker.cleanupInterval = null;
            }
            
            tracker.listenerSetup = false;
            tracker.active = false;
            bg.active = false;
            backgroundLog(`Background listener stopped`, 'stop');
        }
        
        // ====== COMMAND HANDLER ======
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                tracker.active = true;
                tracker.mode = args[1]?.toLowerCase() === 'public' ? 'public' : 'private';
                
                // Reset stats
                Object.keys(tracker.stats).forEach(key => {
                    tracker.stats[key] = 0;
                });
                
                setupBackgroundListener();
                
                backgroundLog(`System enabled in ${tracker.mode} mode`, 'start');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE ENABLED*\n\nMode: ${tracker.mode.toUpperCase()}\nStatus: ✅ ACTIVE\nStealth: ✅ ON\n\nAll deleted content will be sent to your DM.\n\nUse \`${PREFIX}antidelete stats\` to monitor.`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
            case 'stop':
                stopBackgroundListener();
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE DISABLED*\n\nSystem stopped. No longer capturing deletions.`
                }, { quoted: msg });
                break;
                
            case 'status':
                const subCmd = args[1]?.toLowerCase();
                
                if (!subCmd) {
                    const statusInfo = `
📱 *Status Monitoring*

Active: ${tracker.active ? '✅' : '❌'}
Capture: ${tracker.config.captureStatuses ? '✅' : '❌'}
Auto-view: ${tracker.config.autoViewStatuses ? '✅' : '❌'}

📊 *Statistics:*
Detected: ${tracker.stats.statusesDetected}
Viewed: ${tracker.stats.statusesViewed}
Downloaded: ${tracker.stats.statusesDownloaded}
Deleted: ${tracker.stats.statusesDeleted}
Retrieved: ${tracker.stats.statusesRetrieved}

💡 *Commands:*
• \`${PREFIX}antidelete status on/off\` - Toggle
• \`${PREFIX}antidelete status view on/off\` - Auto-view
• \`${PREFIX}antidelete status fetch <number>\` - Fetch status
• \`${PREFIX}antidelete status clear\` - Clear cache
`;
                    
                    await sock.sendMessage(chatId, { text: statusInfo }, { quoted: msg });
                    return;
                }
                
                switch (subCmd) {
                    case 'on':
                        tracker.config.captureStatuses = true;
                        await sock.sendMessage(chatId, {
                            text: `✅ *Status Capture ENABLED*`
                        }, { quoted: msg });
                        break;
                        
                    case 'off':
                        tracker.config.captureStatuses = false;
                        await sock.sendMessage(chatId, {
                            text: `✅ *Status Capture DISABLED*`
                        }, { quoted: msg });
                        break;
                        
                    case 'view':
                        const viewMode = args[2]?.toLowerCase();
                        if (viewMode === 'on') {
                            tracker.config.autoViewStatuses = true;
                            await sock.sendMessage(chatId, {
                                text: `✅ *Auto-view ENABLED*`
                            }, { quoted: msg });
                        } else if (viewMode === 'off') {
                            tracker.config.autoViewStatuses = false;
                            await sock.sendMessage(chatId, {
                                text: `✅ *Auto-view DISABLED*`
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
                            const success = await fetchAndViewStatus(fetchJid);
                            await sock.sendMessage(chatId, {
                                text: success ? `✅ Status fetched` : `❌ No status found`
                            });
                        } catch (error) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Error: ${error.message}`
                            });
                        }
                        break;
                        
                    case 'clear':
                        const statusCount = tracker.statusCache.size;
                        const mediaCount = tracker.statusStorage.size;
                        
                        tracker.statusCache.clear();
                        tracker.statusStorage.clear();
                        tracker.statusDmLog.clear();
                        
                        try {
                            const files = await fs.readdir(STATUS_STORAGE_PATH);
                            for (const file of files) {
                                await fs.unlink(path.join(STATUS_STORAGE_PATH, file));
                            }
                        } catch (error) {}
                        
                        await sock.sendMessage(chatId, {
                            text: `🧹 Cleared ${statusCount} statuses, ${mediaCount} media files`
                        }, { quoted: msg });
                        break;
                }
                break;
                
            case 'logs':
                const logCount = parseInt(args[1]) || 10;
                const logs = bg.getRecentLogs(logCount);
                const stats = bg.getStats();
                
                const logText = `
📋 *BACKGROUND LOGS* (${stats.totalLogs} total)

${logs || 'No logs available'}

📊 *Log Statistics:*
Errors: ${stats.errors}
Warnings: ${stats.warnings}
Infos: ${stats.infos}
Last activity: ${stats.lastActivity}
`;
                
                await sock.sendMessage(chatId, { text: logText }, { quoted: msg });
                break;
                
            case 'debug':
                const debugInfo = `
🔧 *ANTIDELETE DEBUG*

System: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
Mode: ${tracker.mode.toUpperCase()}
Stealth: ${tracker.config.stealthMode ? '✅ ON' : '❌ OFF'}

📊 *Cache:*
Messages: ${tracker.messageCache.size}
Statuses: ${tracker.statusCache.size}
Media files: ${tracker.mediaStorage.size}
Status media: ${tracker.statusStorage.size}

⚙️ *Configuration:*
Auto-cleanup: ${tracker.config.autoCleanup ? 'ON' : 'OFF'}
Cleanup hours: ${tracker.config.maxStorageHours}
Status capture: ${tracker.config.captureStatuses ? 'ON' : 'OFF'}
Status auto-view: ${tracker.config.autoViewStatuses ? 'ON' : 'OFF'}

🕒 Last cleanup: ${new Date(tracker.lastCleanup).toLocaleTimeString()}
`;
                
                await sock.sendMessage(chatId, { text: debugInfo }, { quoted: msg });
                break;
                
            case 'test':
                await sock.sendMessage(chatId, {
                    text: `✅ *Test Message*\n\nSystem: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\nMode: ${tracker.mode}\n\nDelete this message to test antidelete.`
                }, { quoted: msg });
                break;
                
            case 'clear':
            case 'clean':
                const msgCount = tracker.messageCache.size;
                const statusCount = tracker.statusCache.size;
                const mediaCount = tracker.mediaStorage.size;
                const statusMediaCount = tracker.statusStorage.size;
                
                tracker.messageCache.clear();
                tracker.statusCache.clear();
                tracker.mediaStorage.clear();
                tracker.statusStorage.clear();
                tracker.seenMessages.clear();
                tracker.seenStatuses.clear();
                tracker.processedDeletions.clear();
                tracker.processedStatusDeletions.clear();
                tracker.ownerDmLog.clear();
                tracker.statusDmLog.clear();
                
                // Clean files
                try {
                    const mediaFiles = await fs.readdir(MEDIA_STORAGE_PATH);
                    for (const file of mediaFiles) {
                        await fs.unlink(path.join(MEDIA_STORAGE_PATH, file));
                    }
                    
                    const statusFiles = await fs.readdir(STATUS_STORAGE_PATH);
                    for (const file of statusFiles) {
                        await fs.unlink(path.join(STATUS_STORAGE_PATH, file));
                    }
                } catch (error) {}
                
                backgroundLog(`Cache cleared by owner`, 'system');
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *Cache Cleared*\n\n• Messages: ${msgCount}\n• Statuses: ${statusCount}\n• Media files: ${mediaCount}\n• Status media: ${statusMediaCount}`
                }, { quoted: msg });
                break;
                
            case 'stats':
            case 'stat':
                const statsText = `
📊 *ANTIDELETE STATISTICS*

🔹 *Messages:*
Detected: ${tracker.stats.deletionsDetected}
Retrieved: ${tracker.stats.retrievedSuccessfully}
Media sent: ${tracker.stats.mediaSent}
Sent to DM: ${tracker.stats.sentToDm}

🔹 *Statuses:*
Detected: ${tracker.stats.statusesDetected}
Viewed: ${tracker.stats.statusesViewed}
Downloaded: ${tracker.stats.statusesDownloaded}
Deleted: ${tracker.stats.statusesDeleted}
Retrieved: ${tracker.stats.statusesRetrieved}

🔹 *Background:*
Active: ${bg.active ? '✅' : '❌'}
Log entries: ${bg.getStats().totalLogs}
Last activity: ${bg.getStats().lastActivity}
`;
                
                await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                break;
                
            case 'stealth':
                const stealthMode = args[1]?.toLowerCase();
                if (stealthMode === 'on') {
                    tracker.config.stealthMode = true;
                    tracker.config.logToTerminal = false;
                    await sock.sendMessage(chatId, {
                        text: `✅ *Stealth Mode ON*\n\nRunning silently in background.`
                    }, { quoted: msg });
                } else if (stealthMode === 'off') {
                    tracker.config.stealthMode = false;
                    tracker.config.logToTerminal = true;
                    await sock.sendMessage(chatId, {
                        text: `✅ *Stealth Mode OFF*\n\nShowing logs in terminal.`
                    }, { quoted: msg });
                }
                break;
                
            case 'mode':
                const mode = args[1]?.toLowerCase();
                if (mode === 'public') {
                    tracker.mode = 'public';
                    await sock.sendMessage(chatId, {
                        text: `✅ *Mode set to PUBLIC*\n\nDeleted messages will be shown in chat.`
                    }, { quoted: msg });
                } else if (mode === 'private') {
                    tracker.mode = 'private';
                    await sock.sendMessage(chatId, {
                        text: `✅ *Mode set to PRIVATE*\n\nDeleted messages sent to your DM only.`
                    }, { quoted: msg });
                }
                break;
                
            case 'help':
            case 'menu':
                const helpText = `
👑 *ANTIDELETE (OWNER ONLY)*

🚀 *Core Commands:*
• \`${PREFIX}antidelete on\` - Enable (private mode)
• \`${PREFIX}antidelete on public\` - Enable public mode
• \`${PREFIX}antidelete off\` - Disable system
• \`${PREFIX}antidelete test\` - Send test message
• \`${PREFIX}antidelete stats\` - View statistics

📱 *Status Commands:*
• \`${PREFIX}antidelete status\` - Status settings
• \`${PREFIX}antidelete status on/off\` - Toggle capture
• \`${PREFIX}antidelete status fetch <number>\` - Fetch status
• \`${PREFIX}antidelete status clear\` - Clear cache

🔧 *Management:*
• \`${PREFIX}antidelete logs\` - View background logs
• \`${PREFIX}antidelete debug\` - Debug information
• \`${PREFIX}antidelete clear\` - Clear all cache
• \`${PREFIX}antidelete stealth on/off\` - Toggle stealth
• \`${PREFIX}antidelete mode <public/private>\` - Change mode

📊 *Current Status:*
• System: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
• Mode: ${tracker.mode}
• Stealth: ${tracker.config.stealthMode ? 'ON' : 'OFF'}
• Messages cached: ${tracker.messageCache.size}
`;
                
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            default:
                const defaultResponse = `
👑 *Antidelete System*

Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
Mode: ${tracker.mode.toUpperCase()}
Stealth: ${tracker.config.stealthMode ? '✅ ON' : '❌ OFF'}

📊 *Performance:*
Messages cached: ${tracker.messageCache.size}
Statuses cached: ${tracker.statusCache.size}
Last retrieved: ${tracker.stats.retrievedSuccessfully}

💡 *Use \`${PREFIX}antidelete help\` for commands*
`;
                
                await sock.sendMessage(chatId, {
                    text: defaultResponse
                }, { quoted: msg });
        }
    }
};