// import fs from 'fs';
// import path from 'path';
// import { downloadMediaMessage } from '@whiskeysockets/baileys';

// // Configuration
// const CONFIG = {
//     SAVE_DIR: './viewonce_stealth',
//     MAX_SIZE_MB: 50,
//     AUTO_CLEANUP: true,
//     CLEANUP_DELAY: 5000,
//     STEALTH_MODE: true,
//     SEND_CONFIRMATION_TO_OWNER: true,
//     SILENT_MODE: true,
//     EMOJI_CONFIG_FILE: './emoji_trigger.json'
// };

// // Default emoji trigger
// const DEFAULT_EMOJI = '🔒';

// // Load emoji trigger from config file
// function loadEmojiTrigger() {
//     try {
//         if (fs.existsSync(CONFIG.EMOJI_CONFIG_FILE)) {
//             const data = JSON.parse(fs.readFileSync(CONFIG.EMOJI_CONFIG_FILE, 'utf8'));
//             return data.emoji || DEFAULT_EMOJI;
//         }
//     } catch (error) {
//         console.error('Error loading emoji trigger:', error);
//     }
//     return DEFAULT_EMOJI;
// }

// // Save emoji trigger to config file
// function saveEmojiTrigger(emoji) {
//     try {
//         const data = { emoji, updated: new Date().toISOString() };
//         fs.writeFileSync(CONFIG.EMOJI_CONFIG_FILE, JSON.stringify(data, null, 2));
//         console.log(`✅ Emoji trigger saved: ${emoji}`);
//         return true;
//     } catch (error) {
//         console.error('Error saving emoji trigger:', error);
//         return false;
//     }
// }

// // Get current emoji trigger
// let CURRENT_EMOJI = loadEmojiTrigger();

// // Ensure save directory exists
// if (!fs.existsSync(CONFIG.SAVE_DIR)) {
//     fs.mkdirSync(CONFIG.SAVE_DIR, { recursive: true });
// }

// // Enhanced jidManager
// const fallbackJidManager = {
//     cleanJid: function(jid) {
//         if (!jid) return { 
//             cleanJid: 'unknown', 
//             cleanNumber: 'unknown', 
//             isLid: false,
//             hasDeviceSuffix: false 
//         };
        
//         let clean = jid.split(':')[0];
//         const hasDeviceSuffix = jid.includes(':') && !jid.includes('@lid');
//         const isLid = clean.includes('@lid');
        
//         let cleanNumber = clean.split('@')[0];
        
//         return {
//             cleanJid: clean,
//             cleanNumber: cleanNumber,
//             isLid: isLid,
//             hasDeviceSuffix: hasDeviceSuffix,
//             original: jid,
//             deviceId: hasDeviceSuffix ? jid.split(':')[1]?.split('@')[0] : null
//         };
//     },
    
//     isOwner: function(msg) {
//         if (!msg) return false;
        
//         if (msg.key.fromMe) {
//             return true;
//         }
        
//         try {
//             if (fs.existsSync('./owner.json')) {
//                 const ownerData = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
//                 const senderJid = msg.key.participant || msg.key.remoteJid;
//                 const cleaned = this.cleanJid(senderJid);
                
//                 const ownerNumber = ownerData.OWNER_NUMBER || 
//                                    ownerData.OWNER_CLEAN_NUMBER || 
//                                    ownerData.ownerNumber ||
//                                    (ownerData.OWNER_CLEAN_JID ? ownerData.OWNER_CLEAN_JID.split('@')[0] : null) ||
//                                    (ownerData.OWNER_JID ? ownerData.OWNER_JID.split('@')[0] : null);
                
//                 if (ownerNumber && cleaned.cleanNumber === ownerNumber) {
//                     return true;
//                 }
                
//                 const ownerJids = [
//                     ownerData.OWNER_JID,
//                     ownerData.OWNER_CLEAN_JID,
//                     ownerData.ownerLID
//                 ].filter(jid => jid);
                
//                 if (ownerJids.some(ownerJid => this.cleanJid(ownerJid).cleanJid === cleaned.cleanJid)) {
//                     return true;
//                 }
//             }
//         } catch (error) {
//             console.error('Error reading owner.json:', error);
//         }
        
//         return false;
//     },
    
//     getOwnerInfo: function() {
//         try {
//             if (fs.existsSync('./owner.json')) {
//                 const ownerData = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                
//                 const hasLinkedDevice = ownerData.ownerLID && ownerData.ownerLID !== 'null' && ownerData.ownerLID !== null;
                
//                 let cleanJid;
//                 let cleanNumber;
                
//                 if (hasLinkedDevice) {
//                     cleanJid = ownerData.ownerLID;
//                     cleanNumber = ownerData.OWNER_CLEAN_NUMBER || ownerData.OWNER_NUMBER || cleanJid.split('@')[0];
//                 } else {
//                     cleanJid = ownerData.OWNER_CLEAN_JID || 
//                               (ownerData.OWNER_JID ? ownerData.OWNER_JID.split(':')[0] : null) ||
//                               (ownerData.OWNER_NUMBER ? ownerData.OWNER_NUMBER + '@s.whatsapp.net' : null);
                    
//                     cleanNumber = ownerData.OWNER_CLEAN_NUMBER || 
//                                  ownerData.OWNER_NUMBER ||
//                                  (cleanJid ? cleanJid.split('@')[0] : null);
//                 }
                
//                 if (!cleanJid && ownerData.OWNER_JID) {
//                     cleanJid = ownerData.OWNER_JID.split(':')[0];
//                 }
                
//                 return {
//                     cleanJid: cleanJid || 'Not configured',
//                     cleanNumber: cleanNumber || 'Not configured',
//                     isLid: hasLinkedDevice,
//                     hasDeviceSuffix: ownerData.OWNER_JID ? ownerData.OWNER_JID.includes(':') : false,
//                     ownerData: ownerData
//                 };
//             }
//         } catch (error) {
//             console.error('Error getting owner info:', error);
//         }
        
//         return { 
//             cleanJid: 'Not configured', 
//             cleanNumber: 'Not configured', 
//             isLid: false,
//             hasDeviceSuffix: false 
//         };
//     }
// };

// // Utility functions
// function generateFilename(type, mimetype = '') {
//     const timestamp = Date.now();
//     const random = Math.random().toString(36).substring(2, 8);
    
//     let extension = '.bin';
//     if (mimetype) {
//         const parts = mimetype.split('/');
//         if (parts.length > 1) {
//             const subtype = parts[1].split(';')[0];
//             if (subtype.includes('jpeg') || subtype.includes('jpg')) extension = '.jpg';
//             else if (subtype.includes('png')) extension = '.png';
//             else if (subtype.includes('gif')) extension = '.gif';
//             else if (subtype.includes('webp')) extension = '.webp';
//             else if (subtype.includes('mp4')) extension = '.mp4';
//             else if (subtype.includes('3gp')) extension = '.3gp';
//             else if (subtype.includes('mov')) extension = '.mov';
//             else if (subtype.includes('ogg')) extension = '.ogg';
//             else if (subtype.includes('mpeg') || subtype.includes('mp3')) extension = '.mp3';
//             else if (subtype.includes('aac')) extension = '.aac';
//             else if (subtype.includes('m4a')) extension = '.m4a';
//             else extension = '.' + subtype;
//         }
//     }
    
//     return `${type}_${timestamp}_${random}${extension}`;
// }

// // Check if message is view-once
// function isViewOnceMessage(message) {
//     if (!message?.message) return false;
    
//     if (message.message.imageMessage?.viewOnce) return true;
//     if (message.message.videoMessage?.viewOnce) return true;
//     if (message.message.audioMessage?.viewOnce) return true;
    
//     if (message.message.viewOnceMessageV2) return true;
//     if (message.message.viewOnceMessageV2Extension) return true;
//     if (message.message.viewOnceMessage) return true;
    
//     if (message.message.ephemeralMessage?.message?.viewOnceMessage) return true;
    
//     return false;
// }

// // Extract media from view-once message
// function extractViewOnceMedia(message) {
//     try {
//         if (message.message?.imageMessage?.viewOnce) {
//             return {
//                 type: 'image',
//                 message: message.message.imageMessage,
//                 direct: true
//             };
//         }
//         if (message.message?.videoMessage?.viewOnce) {
//             return {
//                 type: 'video',
//                 message: message.message.videoMessage,
//                 direct: true
//             };
//         }
//         if (message.message?.audioMessage?.viewOnce) {
//             return {
//                 type: 'audio',
//                 message: message.message.audioMessage,
//                 direct: true
//             };
//         }
        
//         let wrappedMessage = null;
//         if (message.message?.viewOnceMessageV2?.message) {
//             wrappedMessage = message.message.viewOnceMessageV2.message;
//         } else if (message.message?.viewOnceMessageV2Extension?.message) {
//             wrappedMessage = message.message.viewOnceMessageV2Extension.message;
//         } else if (message.message?.viewOnceMessage?.message) {
//             wrappedMessage = message.message.viewOnceMessage.message;
//         } else if (message.message?.ephemeralMessage?.message?.viewOnceMessage?.message) {
//             wrappedMessage = message.message.ephemeralMessage.message.viewOnceMessage.message;
//         }
        
//         if (wrappedMessage?.imageMessage) {
//             return {
//                 type: 'image',
//                 message: wrappedMessage.imageMessage,
//                 direct: false
//             };
//         }
//         if (wrappedMessage?.videoMessage) {
//             return {
//                 type: 'video',
//                 message: wrappedMessage.videoMessage,
//                 direct: false
//             };
//         }
//         if (wrappedMessage?.audioMessage) {
//             return {
//                 type: 'audio',
//                 message: wrappedMessage.audioMessage,
//                 direct: false
//             };
//         }
//     } catch (error) {
//         console.error('Error extracting view-once media:', error);
//     }
    
//     return null;
// }

// // Get the message being replied to
// function getQuotedMessage(contextInfo) {
//     if (!contextInfo) return null;
    
//     const quotedMessage = {
//         key: {
//             remoteJid: contextInfo.remoteJid,
//             id: contextInfo.stanzaId,
//             participant: contextInfo.participant,
//             fromMe: contextInfo.fromMe
//         },
//         message: contextInfo.quotedMessage
//     };
    
//     return quotedMessage;
// }

// // Check if message is emoji trigger
// function isEmojiTrigger(message) {
//     try {
//         if (!message?.message) return false;
        
//         // Check for text message
//         if (message.message.conversation) {
//             const text = message.message.conversation.trim();
//             return text === CURRENT_EMOJI;
//         }
        
//         // Check for extended text message
//         if (message.message.extendedTextMessage?.text) {
//             const text = message.message.extendedTextMessage.text.trim();
//             return text === CURRENT_EMOJI;
//         }
        
//         return false;
//     } catch (error) {
//         console.error('Error checking emoji trigger:', error);
//         return false;
//     }
// }

// // Delete file after delay
// function cleanupFile(filepath, delay = CONFIG.CLEANUP_DELAY) {
//     if (!CONFIG.AUTO_CLEANUP) return;
    
//     setTimeout(() => {
//         try {
//             if (fs.existsSync(filepath)) {
//                 fs.unlinkSync(filepath);
//                 console.log(`🗑️ Cleaned up: ${path.basename(filepath)}`);
//             }
//         } catch (error) {
//             console.error('Error cleaning up file:', error);
//         }
//     }, delay);
// }

// // Get group info for logging
// async function getGroupInfo(sock, chatId) {
//     try {
//         if (!chatId.endsWith('@g.us')) {
//             return { name: 'Private Chat', isGroup: false };
//         }
        
//         const metadata = await sock.groupMetadata(chatId);
//         return {
//             name: metadata.subject || 'Unknown Group',
//             isGroup: true,
//             participants: metadata.participants?.length || 0
//         };
//     } catch (error) {
//         console.error('Error getting group info:', error);
//         return { name: 'Unknown Chat', isGroup: false };
//     }
// }

// // Get best owner JID
// function getBestOwnerJid(ownerInfo, msg) {
//     console.log(`🎯 Selecting best owner JID...`);
    
//     let selectedJid = null;
    
//     // 1. Use linked device if available
//     if (ownerInfo.isLid && ownerInfo.cleanJid && ownerInfo.cleanJid !== 'Not configured') {
//         selectedJid = ownerInfo.cleanJid;
//         console.log(`✅ Using linked device (LID): ${selectedJid}`);
//     }
//     // 2. If owner is sending from their own chat, use that chat
//     else if (msg.key.fromMe) {
//         // Check if the current chat is the owner's personal chat
//         const cleanedChat = fallbackJidManager.cleanJid(msg.key.remoteJid);
//         const cleanedOwner = fallbackJidManager.cleanJid(ownerInfo.cleanJid);
        
//         if (cleanedChat.cleanNumber === cleanedOwner.cleanNumber) {
//             selectedJid = msg.key.remoteJid;
//             console.log(`✅ Using current personal chat: ${selectedJid}`);
//         } else {
//             // Use clean JID
//             selectedJid = ownerInfo.cleanJid;
//             console.log(`✅ Using owner clean JID: ${selectedJid}`);
//         }
//     }
//     // 3. Use clean JID from owner.json
//     else if (ownerInfo.ownerData?.OWNER_CLEAN_JID) {
//         selectedJid = ownerInfo.ownerData.OWNER_CLEAN_JID;
//         console.log(`✅ Using clean JID from owner.json: ${selectedJid}`);
//     }
//     // 4. Fallback to cleaned version of OWNER_JID
//     else if (ownerInfo.ownerData?.OWNER_JID) {
//         selectedJid = ownerInfo.ownerData.OWNER_JID.split(':')[0];
//         console.log(`✅ Using cleaned OWNER_JID: ${selectedJid}`);
//     }
//     // 5. Construct from number
//     else if (ownerInfo.cleanNumber && ownerInfo.cleanNumber !== 'Not configured') {
//         selectedJid = `${ownerInfo.cleanNumber}@s.whatsapp.net`;
//         console.log(`✅ Constructed from number: ${selectedJid}`);
//     }
    
//     if (!selectedJid) {
//         console.error(`❌ No valid owner JID found!`);
//         return null;
//     }
    
//     if (!selectedJid.includes('@')) {
//         console.error(`❌ Invalid JID format: ${selectedJid}`);
//         return null;
//     }
    
//     return selectedJid;
// }

// // Download media and send to owner - COMPLETELY STEALTH
// async function downloadAndSendToOwner(sock, message, mediaInfo, originalChatId, originalSender, ownerJid, jidManager) {
//     let filepath = '';
    
//     try {
//         console.log(`\n⬇️ STEALTH DOWNLOAD STARTED`);
//         console.log(`Type: ${mediaInfo.type}`);
//         console.log(`Owner JID (DM): ${ownerJid}`);
//         console.log(`Original Chat: ${originalChatId}`);
        
//         // Download the media
//         const buffer = await downloadMediaMessage(
//             message,
//             'buffer',
//             {},
//             {
//                 logger: { level: 'silent' },
//                 reuploadRequest: sock.updateMediaMessage
//             }
//         );
        
//         if (!buffer || buffer.length === 0) {
//             throw new Error('Download failed: empty buffer');
//         }
        
//         // Check file size
//         const fileSizeMB = buffer.length / (1024 * 1024);
//         if (fileSizeMB > CONFIG.MAX_SIZE_MB) {
//             throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB (max: ${CONFIG.MAX_SIZE_MB}MB)`);
//         }
        
//         // Generate temporary filename
//         const mimetype = mediaInfo.message.mimetype || '';
//         const filename = generateFilename(mediaInfo.type, mimetype);
//         filepath = path.join(CONFIG.SAVE_DIR, filename);
        
//         // Save temporarily
//         fs.writeFileSync(filepath, buffer);
//         const fileSizeKB = (buffer.length / 1024).toFixed(2);
        
//         console.log(`✅ Downloaded: ${filename} (${fileSizeKB} KB)`);
        
//         // Get sender info
//         let senderInfo;
//         if (jidManager && jidManager.cleanJid) {
//             senderInfo = jidManager.cleanJid(originalSender);
//         } else {
//             senderInfo = fallbackJidManager.cleanJid(originalSender);
//         }
        
//         const senderNumber = senderInfo.cleanNumber || 'Unknown';
//         const originalCaption = mediaInfo.message.caption || '';
        
//         // Get chat info
//         const chatInfo = await getGroupInfo(sock, originalChatId);
//         const chatName = chatInfo.name;
//         const isGroup = chatInfo.isGroup;
        
//         // Prepare caption for owner
//         let ownerCaption = `🔒 *Stealth View-Once Capture*\n\n`;
//         ownerCaption += `👤 *Sender:* ${senderNumber}\n`;
//         ownerCaption += `💬 *Chat:* ${chatName}\n`;
//         ownerCaption += `🏷️ *Type:* ${isGroup ? 'Group' : 'Private'}\n`;
//         ownerCaption += `📊 *Size:* ${fileSizeKB} KB\n`;
        
//         if (mediaInfo.type === 'video' && mediaInfo.message.seconds) {
//             ownerCaption += `⏱️ *Duration:* ${mediaInfo.message.seconds}s\n`;
//         }
        
//         if (mediaInfo.message.width && mediaInfo.message.height) {
//             ownerCaption += `📐 *Resolution:* ${mediaInfo.message.width}x${mediaInfo.message.height}\n`;
//         }
        
//         if (originalCaption) {
//             ownerCaption += `📝 *Original Caption:* ${originalCaption}\n`;
//         }
        
//         ownerCaption += `\n🕒 *Captured:* ${new Date().toLocaleString()}`;
        
//         // Read file
//         const fileBuffer = fs.readFileSync(filepath);
        
//         // Send media to owner's DM
//         console.log(`📤 Sending ${mediaInfo.type} to owner's DM...`);
//         let sentMessage = null;
        
//         switch (mediaInfo.type) {
//             case 'image':
//                 sentMessage = await sock.sendMessage(ownerJid, {
//                     image: fileBuffer,
//                     caption: ownerCaption,
//                     mimetype: mimetype || 'image/jpeg'
//                 });
//                 break;
                
//             case 'video':
//                 sentMessage = await sock.sendMessage(ownerJid, {
//                     video: fileBuffer,
//                     caption: ownerCaption,
//                     mimetype: mimetype || 'video/mp4',
//                     seconds: mediaInfo.message.seconds || 0
//                 });
//                 break;
                
//             case 'audio':
//                 sentMessage = await sock.sendMessage(ownerJid, {
//                     audio: fileBuffer,
//                     mimetype: mimetype || 'audio/mpeg',
//                     caption: ownerCaption
//                 });
//                 break;
//         }
        
//         if (sentMessage) {
//             console.log(`✅ Media sent successfully to owner's DM`);
            
//             // Send confirmation to owner's DM (not original chat)
//             if (CONFIG.SEND_CONFIRMATION_TO_OWNER) {
//                 await sock.sendMessage(ownerJid, {
//                     text: `✅ *Stealth Download Complete*\n\nSuccessfully captured view-once ${mediaInfo.type} from ${senderNumber} in ${chatName}.\n\nTrigger: ${CURRENT_EMOJI}`
//                 });
//                 console.log(`✅ Confirmation sent to owner's DM`);
//             }
            
//             // Clean up file
//             cleanupFile(filepath);
            
//             return {
//                 success: true,
//                 filename,
//                 type: mediaInfo.type,
//                 sizeKB: fileSizeKB,
//                 sender: senderNumber,
//                 chatName,
//                 isGroup,
//                 sentTo: ownerJid,
//                 messageId: sentMessage.key?.id,
//                 triggeredBy: CURRENT_EMOJI
//             };
//         } else {
//             throw new Error('Failed to send media to owner\'s DM');
//         }
        
//     } catch (error) {
//         console.error('❌ STEALTH DOWNLOAD FAILED:', error.message);
        
//         // Clean up file if it exists
//         if (filepath && fs.existsSync(filepath)) {
//             try {
//                 fs.unlinkSync(filepath);
//             } catch (e) {
//                 // Ignore cleanup errors
//             }
//         }
        
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// }

// // Clean old files
// function cleanOldFiles(maxAgeHours = 24) {
//     try {
//         const files = fs.readdirSync(CONFIG.SAVE_DIR);
//         const now = Date.now();
//         const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
//         let deletedCount = 0;
        
//         for (const file of files) {
//             const filepath = path.join(CONFIG.SAVE_DIR, file);
//             const stats = fs.statSync(filepath);
//             const fileAge = now - stats.mtimeMs;
            
//             if (fileAge > maxAgeMs) {
//                 fs.unlinkSync(filepath);
//                 deletedCount++;
//             }
//         }
        
//         if (deletedCount > 0) {
//             console.log(`🧹 Cleaned ${deletedCount} old files`);
//         }
//     } catch (error) {
//         console.error('Error cleaning old files:', error);
//     }
// }

// // Clean old files on startup
// cleanOldFiles();

// // Main command module
// export default {
//     name: 'setvvemoji',
//     description: 'Stealth download view-once media to owner\'s DM (no notifications in chat)',
//     category: 'owner',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, metadata) {
//         const chatId = msg.key.remoteJid;
        
//         // Get jidManager
//         let jidManager = metadata?.jidManager || fallbackJidManager;
        
//         // Check if owner
//         const isOwner = jidManager.isOwner(msg);
        
//         if (!isOwner) {
//             // SILENT MODE: Don't respond at all if not owner
//             if (CONFIG.SILENT_MODE) {
//                 console.log(`❌ Non-owner tried to use vv2: ${chatId}`);
//                 return; // Don't send any message
//             }
            
//             // Only send error to owner's DM if they're in a group
//             const ownerInfo = jidManager.getOwnerInfo();
//             if (ownerInfo.cleanJid !== 'Not configured') {
//                 await sock.sendMessage(ownerInfo.cleanJid, {
//                     text: `⚠️ *Security Alert*\n\nSomeone tried to use .vv2 command in:\nChat: ${chatId}\n\nCommand blocked.`
//                 });
//             }
//             return;
//         }
        
//         // Get owner info
//         const ownerInfo = jidManager.getOwnerInfo();
        
//         // Check if this is a reply
//         const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
//         const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        
//         // Handle subcommands
//         const subCommand = args[0]?.toLowerCase();
        
//         if (!quotedMsg || !contextInfo) {
//             if (subCommand === 'setemoji' || subCommand === 'emoji') {
//                 if (args.length < 2) {
//                     return sock.sendMessage(chatId, { 
//                         text: `❌ Please provide an emoji!\n\nUsage: .vv2 setemoji 🔒\n\nCurrent emoji: ${CURRENT_EMOJI}` 
//                     }, { quoted: msg });
//                 }
                
//                 const emoji = args[1].trim();
                
//                 // Validate emoji (simple check)
//                 if (emoji.length === 0) {
//                     return sock.sendMessage(chatId, { 
//                         text: `❌ Invalid emoji! Please provide a single emoji character.` 
//                     }, { quoted: msg });
//                 }
                
//                 // Save the emoji
//                 const saved = saveEmojiTrigger(emoji);
//                 if (saved) {
//                     CURRENT_EMOJI = emoji;
//                     return sock.sendMessage(chatId, { 
//                         text: `✅ *Emoji Trigger Set*\n\nNow you can reply with *${CURRENT_EMOJI}* to download view-once media.\n\n🔧 Configuration saved to: ${CONFIG.EMOJI_CONFIG_FILE}` 
//                     }, { quoted: msg });
//                 } else {
//                     return sock.sendMessage(chatId, { 
//                         text: `❌ Failed to save emoji trigger.` 
//                     }, { quoted: msg });
//                 }
//             } 
//             else if (subCommand === 'getemoji' || subCommand === 'currentemoji') {
//                 return sock.sendMessage(chatId, { 
//                     text: `🔧 *Current Emoji Trigger*\n\nEmoji: ${CURRENT_EMOJI}\n\nReply to any view-once media with this emoji to download it.` 
//                 }, { quoted: msg });
//             }
//             else if (subCommand === 'clean' || subCommand === 'clear') {
//                 try {
//                     const files = fs.readdirSync(CONFIG.SAVE_DIR);
//                     let deletedCount = 0;
                    
//                     for (const file of files) {
//                         const filepath = path.join(CONFIG.SAVE_DIR, file);
//                         fs.unlinkSync(filepath);
//                         deletedCount++;
//                     }
                    
//                     return sock.sendMessage(chatId, { 
//                         text: `🗑️ *Cleared Stealth Files*\n\nDeleted ${deletedCount} files from stealth storage.` 
//                     }, { quoted: msg });
                    
//                 } catch (error) {
//                     return sock.sendMessage(chatId, { 
//                         text: `❌ Error clearing files: ${error.message}` 
//                     }, { quoted: msg });
//                 }
//             } 
//             else if (subCommand === 'owner' || subCommand === 'whoami') {
//                 return sock.sendMessage(chatId, { 
//                     text: `👑 *Bot Owner*\n\nNumber: ${ownerInfo.cleanNumber}\nLinked: ${ownerInfo.isLid ? '✅ Yes' : '❌ No'}\nEmoji Trigger: ${CURRENT_EMOJI}\n\nReply to a view-once with .vv2 or ${CURRENT_EMOJI} to stealth download.` 
//                 }, { quoted: msg });
//             }
//             else if (subCommand === 'debug') {
//                 let debugText = `🐛 *VV2 Debug Info*\n\n`;
//                 debugText += `👤 *Your Info:*\n`;
//                 debugText += `├─ JID: ${msg.key.participant || chatId}\n`;
//                 debugText += `├─ From Me: ${msg.key.fromMe ? '✅ YES' : '❌ NO'}\n`;
//                 debugText += `└─ Is Owner: ${isOwner ? '✅ YES' : '❌ NO'}\n\n`;
                
//                 debugText += `👑 *Owner Info:*\n`;
//                 debugText += `├─ Number: ${ownerInfo.cleanNumber}\n`;
//                 debugText += `├─ JID: ${ownerInfo.cleanJid}\n`;
//                 debugText += `└─ Is LID: ${ownerInfo.isLid ? '✅ YES' : '❌ NO'}\n\n`;
                
//                 debugText += `🔧 *Emoji Trigger:*\n`;
//                 debugText += `├─ Current: ${CURRENT_EMOJI}\n`;
//                 debugText += `└─ Config File: ${CONFIG.EMOJI_CONFIG_FILE}\n\n`;
                
//                 debugText += `⚙️ *Config:*\n`;
//                 debugText += `├─ Stealth Mode: ${CONFIG.STEALTH_MODE ? '✅ ON' : '❌ OFF'}\n`;
//                 debugText += `├─ Silent Mode: ${CONFIG.SILENT_MODE ? '✅ ON' : '❌ OFF'}\n`;
//                 debugText += `└─ Max Size: ${CONFIG.MAX_SIZE_MB}MB`;
                
//                 return sock.sendMessage(chatId, { text: debugText }, { quoted: msg });
//             }
//             else if (subCommand === 'help') {
//                 const helpText = `
// 🔒 *Stealth View-Once Downloader (VV2)*

// Secretly download view-once media to your DM using commands or emoji.

// 👑 *Owner:* ${ownerInfo.cleanNumber}
// 🔧 *Emoji Trigger:* ${CURRENT_EMOJI}

// ⚡ *How to use:*
// 1. Someone sends a view-once photo/video/audio
// 2. *Option 1:* Reply to it with \`.vv2\`
// 3. *Option 2:* Reply to it with \`${CURRENT_EMOJI}\` (emoji only)
// 4. Media is secretly downloaded and sent to YOUR DM
// 5. Original chat sees NOTHING

// ✨ *Features:*
// • Completely stealth - no notifications in original chat
// • Media sent directly to your DM only
// • Customizable emoji trigger
// • Shows detailed info (sender, chat, size, etc.)
// • Files auto-delete after sending
// • Only you (owner) can use this

// 🔧 *Commands:*
// • \`.vv2\` - Reply to view-once to download stealthily
// • \`${CURRENT_EMOJI}\` - Reply to view-once (emoji trigger)
// • \`.vv2 setemoji 🔒\` - Change emoji trigger
// • \`.vv2 getemoji\` - Show current emoji
// • \`.vv2 owner\` - Show owner info
// • \`.vv2 debug\` - Debug info
// • \`.vv2 clean\` - Clear temporary files
// • \`.vv2 help\` - Show this help

// ⚠️ *Note:* All download results are sent to your DM only.
// `.trim();
                
//                 return sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//             }
            
//             return sock.sendMessage(chatId, { 
//                 text: `🔒 *Stealth VV2*\n\nReply to a view-once message with:\n• \`.vv2\` OR\n• \`${CURRENT_EMOJI}\`\n\nto secretly download it to your DM.\n\nOnly you (owner) can use this.\n\nUse \`.vv2 help\` for more info.` 
//             }, { quoted: msg });
//         }
        
//         // --- STEALTH MODE ACTIVE FROM HERE ---
//         // No more messages in the original chat
        
//         // Get the quoted message
//         const quotedMessage = getQuotedMessage(contextInfo);
//         if (!quotedMessage) {
//             // Send error to owner's DM only
//             await sock.sendMessage(ownerInfo.cleanJid, {
//                 text: `❌ *Stealth Error*\n\nCould not retrieve the quoted message.\n\nChat: ${chatId}`
//             });
//             return;
//         }
        
//         // Check if quoted message is view-once
//         if (!isViewOnceMessage(quotedMessage)) {
//             await sock.sendMessage(ownerInfo.cleanJid, {
//                 text: `❌ *Stealth Error*\n\nThe quoted message is not a view-once media.\n\nChat: ${chatId}\n\nReply only to view-once photos, videos, or audio messages.`
//             });
//             return;
//         }
        
//         // Extract media info
//         const mediaInfo = extractViewOnceMedia(quotedMessage);
//         if (!mediaInfo) {
//             await sock.sendMessage(ownerInfo.cleanJid, {
//                 text: `❌ *Stealth Error*\n\nCould not extract media from the view-once message.\n\nChat: ${chatId}`
//             });
//             return;
//         }
        
//         // Get best owner JID
//         const bestOwnerJid = getBestOwnerJid(ownerInfo, msg);
        
//         if (!bestOwnerJid) {
//             await sock.sendMessage(ownerInfo.cleanJid, {
//                 text: `❌ *Stealth Error*\n\nCannot determine your JID for sending DM.\n\nCheck your owner.json file.`
//             });
//             return;
//         }
        
//         console.log(`🎯 Stealth download to: ${bestOwnerJid}`);
        
//         try {
//             // Download and send to owner's DM
//             const originalSender = quotedMessage.key.participant || quotedMessage.key.remoteJid;
//             const result = await downloadAndSendToOwner(sock, quotedMessage, mediaInfo, chatId, originalSender, bestOwnerJid, jidManager);
            
//             if (result.success) {
//                 // Success message already sent in downloadAndSendToOwner
//                 console.log(`✅ Stealth download successful to owner's DM`);
                
//                 // SILENT MODE: Don't send anything in original chat
//                 if (!CONFIG.SILENT_MODE) {
//                     // Optional: React to the command message with ✅
//                     try {
//                         await sock.sendMessage(chatId, {
//                             react: {
//                                 text: '✅',
//                                 key: msg.key
//                             }
//                         });
//                     } catch (e) {
//                         // Ignore if can't react
//                     }
//                 }
                
//             } else {
//                 // Send error to owner's DM only
//                 await sock.sendMessage(bestOwnerJid, {
//                     text: `❌ *Stealth Download Failed*\n\nError: ${result.error}\n\nChat: ${chatId}`
//                 });
                
//                 console.log(`❌ Stealth download failed: ${result.error}`);
//             }
            
//         } catch (error) {
//             console.error('🔥 Stealth error:', error);
            
//             // Send error to owner's DM only
//             await sock.sendMessage(ownerInfo.cleanJid, {
//                 text: `🔥 *Stealth Error*\n\nUnexpected error: ${error.message}\n\nChat: ${chatId}`
//             });
//         }
//     }
// };

// // Function to handle emoji trigger messages
// export async function handleEmojiTrigger(sock, msg, metadata) {
//     // Check if message is from owner
//     let jidManager = metadata?.jidManager || fallbackJidManager;
//     const isOwner = jidManager.isOwner(msg);
    
//     if (!isOwner) {
//         return; // Only owner can use emoji trigger
//     }
    
//     // Check if message is an emoji trigger
//     if (!isEmojiTrigger(msg)) {
//         return; // Not our emoji trigger
//     }
    
//     // Check if this is a reply to something
//     const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
//     if (!contextInfo) {
//         // If someone just sends the emoji without replying, ignore or send help
//         const ownerInfo = jidManager.getOwnerInfo();
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `ℹ️ *Emoji Trigger Help*\n\nReply with *${CURRENT_EMOJI}* to a view-once message to download it.\n\nCurrent emoji: ${CURRENT_EMOJI}`
//         });
//         return;
//     }
    
//     const quotedMsg = contextInfo.quotedMessage;
//     if (!quotedMsg) {
//         return;
//     }
    
//     // Get owner info
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     // Get the quoted message
//     const quotedMessage = getQuotedMessage(contextInfo);
//     if (!quotedMessage) {
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `❌ *Emoji Trigger Error*\n\nCould not retrieve the quoted message.\n\nChat: ${msg.key.remoteJid}`
//         });
//         return;
//     }
    
//     // Check if quoted message is view-once
//     if (!isViewOnceMessage(quotedMessage)) {
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `❌ *Emoji Trigger Error*\n\nThe quoted message is not a view-once media.\n\nChat: ${msg.key.remoteJid}`
//         });
//         return;
//     }
    
//     // Extract media info
//     const mediaInfo = extractViewOnceMedia(quotedMessage);
//     if (!mediaInfo) {
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `❌ *Emoji Trigger Error*\n\nCould not extract media from the view-once message.\n\nChat: ${msg.key.remoteJid}`
//         });
//         return;
//     }
    
//     // Get best owner JID
//     const bestOwnerJid = getBestOwnerJid(ownerInfo, msg);
    
//     if (!bestOwnerJid) {
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `❌ *Emoji Trigger Error*\n\nCannot determine your JID for sending DM.\n\nCheck your owner.json file.`
//         });
//         return;
//     }
    
//     console.log(`🎯 Emoji trigger detected: ${CURRENT_EMOJI}`);
//     console.log(`📥 Downloading from: ${msg.key.remoteJid}`);
    
//     try {
//         // Download and send to owner's DM
//         const originalSender = quotedMessage.key.participant || quotedMessage.key.remoteJid;
//         const result = await downloadAndSendToOwner(sock, quotedMessage, mediaInfo, msg.key.remoteJid, originalSender, bestOwnerJid, jidManager);
        
//         if (result.success) {
//             console.log(`✅ Emoji trigger download successful`);
//         } else {
//             await sock.sendMessage(bestOwnerJid, {
//                 text: `❌ *Emoji Trigger Failed*\n\nError: ${result.error}\n\nChat: ${msg.key.remoteJid}\n\nTrigger: ${CURRENT_EMOJI}`
//             });
            
//             console.log(`❌ Emoji trigger download failed: ${result.error}`);
//         }
        
//     } catch (error) {
//         console.error('🔥 Emoji trigger error:', error);
        
//         await sock.sendMessage(ownerInfo.cleanJid, {
//             text: `🔥 *Emoji Trigger Error*\n\nUnexpected error: ${error.message}\n\nChat: ${msg.key.remoteJid}\n\nTrigger: ${CURRENT_EMOJI}`
//         });
//     }
// }

// // Auto-cleanup every hour
// setInterval(() => {
//     cleanOldFiles(1);
// }, 60 * 60 * 1000);

// console.log('🔒 Stealth View-Once Downloader (VV2) module loaded');
// console.log(`📁 Stealth storage: ${path.resolve(CONFIG.SAVE_DIR)}`);
// console.log(`🔧 Emoji trigger: ${CURRENT_EMOJI}`);
// console.log(`⚡ Silent mode: ${CONFIG.SILENT_MODE ? 'ON (no chat responses)' : 'OFF'}`);