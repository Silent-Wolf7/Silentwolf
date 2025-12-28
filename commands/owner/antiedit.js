// File: ./commands/utility/antiedit.js - FULLY UPDATED & WORKING
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage paths
const STORAGE_DIR = './data/antiedit';
const MEDIA_DIR = path.join(STORAGE_DIR, 'media');
const CACHE_FILE = path.join(STORAGE_DIR, 'cache.json');

// Global state
let antieditState = {
    enabled: true,
    mode: 'private',
    ownerJid: null,
    sock: null,
    messageHistory: new Map(),
    currentMessages: new Map(),
    mediaCache: new Map(),
    stats: {
        totalMessages: 0,
        editsDetected: 0,
        retrieved: 0,
        mediaCaptured: 0,
        sentToDm: 0,
        sentToChat: 0
    }
};

// Ensure directories exist
async function ensureDirs() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        await fs.mkdir(MEDIA_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('❌ Antiedit: Failed to create directories:', error.message);
        return false;
    }
}

// Load saved data
async function loadData() {
    try {
        await ensureDirs();
        
        if (await fs.access(CACHE_FILE).then(() => true).catch(() => false)) {
            const data = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
            
            if (data.messageHistory && Array.isArray(data.messageHistory)) {
                antieditState.messageHistory.clear();
                data.messageHistory.forEach(([key, value]) => {
                    antieditState.messageHistory.set(key, value);
                });
            }
            
            if (data.currentMessages && Array.isArray(data.currentMessages)) {
                antieditState.currentMessages.clear();
                data.currentMessages.forEach(([key, value]) => {
                    antieditState.currentMessages.set(key, value);
                });
            }
            
            if (data.mediaCache && Array.isArray(data.mediaCache)) {
                antieditState.mediaCache.clear();
                data.mediaCache.forEach(([key, value]) => {
                    antieditState.mediaCache.set(key, value);
                });
            }
            
            if (data.stats) {
                antieditState.stats = data.stats;
            }
            
            console.log(`✅ Antiedit: Loaded ${antieditState.messageHistory.size} history entries, ${antieditState.currentMessages.size} current messages`);
        }
    } catch (error) {
        console.error('❌ Antiedit: Error loading data:', error.message);
    }
}

// Save data
async function saveData() {
    try {
        await ensureDirs();
        
        const data = {
            messageHistory: Array.from(antieditState.messageHistory.entries()),
            currentMessages: Array.from(antieditState.currentMessages.entries()),
            mediaCache: Array.from(antieditState.mediaCache.entries()),
            stats: antieditState.stats,
            savedAt: Date.now()
        };
        
        await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Antiedit: Error saving data:', error.message);
    }
}

// Get file extension from mimetype
function getExtensionFromMime(mimetype) {
    const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'video/mp4': '.mp4',
        'video/3gpp': '.3gp',
        'audio/mpeg': '.mp3',
        'audio/mp4': '.m4a',
        'audio/ogg': '.ogg',
        'audio/aac': '.aac',
        'application/pdf': '.pdf'
    };
    
    return mimeToExt[mimetype] || '.bin';
}

// Download and save media
async function downloadAndSaveMedia(msgId, message, messageType, mimetype, version = 1) {
    try {
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            {
                logger: { level: 'silent' },
                reuploadRequest: antieditState.sock.updateMediaMessage
            }
        );
        
        if (!buffer || buffer.length === 0) {
            return null;
        }
        
        const timestamp = Date.now();
        const extension = getExtensionFromMime(mimetype);
        const filename = `${messageType}_${msgId}_v${version}_${timestamp}${extension}`;
        const filePath = path.join(MEDIA_DIR, filename);
        
        await fs.writeFile(filePath, buffer);
        
        const mediaKey = `${msgId}_v${version}`;
        antieditState.mediaCache.set(mediaKey, {
            filePath: filePath,
            buffer: buffer,
            type: messageType,
            mimetype: mimetype,
            size: buffer.length,
            version: version
        });
        
        antieditState.stats.mediaCaptured++;
        
        console.log(`📸 Antiedit: Saved ${messageType} media v${version}: ${filename} (${Math.round(buffer.length/1024)}KB)`);
        return { filePath, mediaKey };
        
    } catch (error) {
        console.error('❌ Antiedit: Media download error:', error.message);
        return null;
    }
}

// Extract message content
function extractMessageContent(message) {
    const msgContent = message.message;
    let type = 'text';
    let text = '';
    let hasMedia = false;
    let mimetype = '';
    
    if (msgContent?.conversation) {
        text = msgContent.conversation;
        type = 'text';
    } else if (msgContent?.extendedTextMessage?.text) {
        text = msgContent.extendedTextMessage.text;
        type = 'text';
    } else if (msgContent?.imageMessage) {
        type = 'image';
        text = msgContent.imageMessage.caption || '';
        hasMedia = true;
        mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
    } else if (msgContent?.videoMessage) {
        type = 'video';
        text = msgContent.videoMessage.caption || '';
        hasMedia = true;
        mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
    } else if (msgContent?.audioMessage) {
        type = 'audio';
        hasMedia = true;
        mimetype = msgContent.audioMessage.mimetype || 'audio/mpeg';
        if (msgContent.audioMessage.ptt) {
            type = 'voice';
        }
    } else if (msgContent?.documentMessage) {
        type = 'document';
        text = msgContent.documentMessage.fileName || 'Document';
        hasMedia = true;
        mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
    } else if (msgContent?.stickerMessage) {
        type = 'sticker';
        hasMedia = true;
        mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
    } else if (msgContent?.contactMessage) {
        type = 'contact';
        text = 'Contact Message';
    } else if (msgContent?.locationMessage) {
        type = 'location';
        text = 'Location Message';
    }
    
    return { type, text, hasMedia, mimetype };
}

// Store incoming message
async function storeIncomingMessage(message, isEdit = false, originalMessageData = null) {
    try {
        if (!antieditState.sock || antieditState.mode === 'off') return null;
        
        const msgKey = message.key;
        if (!msgKey || !msgKey.id || msgKey.fromMe) return null;
        
        const msgId = msgKey.id;
        const chatJid = msgKey.remoteJid;
        const senderJid = msgKey.participant || chatJid;
        const pushName = message.pushName || 'Unknown';
        const timestamp = message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now();
        
        // Skip status broadcasts
        if (chatJid === 'status@broadcast') return null;
        
        // Extract message content
        const { type, text, hasMedia, mimetype } = extractMessageContent(message);
        
        // Skip empty messages
        if (!text && !hasMedia && type === 'text') return null;
        
        // Get version number
        let version = 1;
        let history = antieditState.messageHistory.get(msgId) || [];
        
        if (isEdit) {
            version = history.length + 1;
        } else {
            // Check if this is actually an edit of existing message
            const existing = antieditState.currentMessages.get(msgId);
            if (existing) {
                isEdit = true;
                originalMessageData = existing;
                version = history.length + 1;
            }
        }
        
        const messageData = {
            id: msgId,
            chatJid,
            senderJid,
            pushName,
            timestamp,
            type,
            text: text || '',
            hasMedia,
            mimetype,
            version: version,
            isEdit: isEdit,
            editTime: Date.now(),
            originalVersion: originalMessageData?.version || 1
        };
        
        // Store in current messages
        antieditState.currentMessages.set(msgId, messageData);
        
        // Add to history
        history.push({...messageData});
        antieditState.messageHistory.set(msgId, history);
        
        if (!isEdit) {
            antieditState.stats.totalMessages++;
        } else {
            antieditState.stats.editsDetected++;
            
            // Trigger edit alert
            setTimeout(async () => {
                if (antieditState.mode === 'private' && antieditState.ownerJid) {
                    await sendEditAlertToOwnerDM(originalMessageData, messageData, history);
                    antieditState.stats.sentToDm++;
                } else if (antieditState.mode === 'public') {
                    await sendEditAlertToChat(originalMessageData, messageData, history, chatJid);
                    antieditState.stats.sentToChat++;
                }
                antieditState.stats.retrieved++;
            }, 1000);
        }
        
        // Download media if present
        if (hasMedia) {
            setTimeout(async () => {
                try {
                    await downloadAndSaveMedia(msgId, message, type, mimetype, version);
                } catch (error) {
                    console.error('❌ Antiedit: Async media download failed:', error.message);
                }
            }, 1500);
        }
        
        // Save periodically
        if (antieditState.stats.totalMessages % 20 === 0) {
            await saveData();
        }
        
        return { messageData, isEdit, history };
        
    } catch (error) {
        console.error('❌ Antiedit: Error storing message:', error.message);
        return null;
    }
}

// Handle message updates (edits detection)
async function handleMessageUpdates(updates) {
    try {
        if (!antieditState.sock || antieditState.mode === 'off') return;
        
        for (const update of updates) {
            const msgKey = update.key;
            if (!msgKey || !msgKey.id) continue;
            
            const msgId = msgKey.id;
            const chatJid = msgKey.remoteJid;
            
            // Check if we have this message stored
            const existingMessage = antieditState.currentMessages.get(msgId);
            if (!existingMessage) continue;
            
            // Check if this update contains new message content (edit)
            const updateContent = update.update;
            if (!updateContent || typeof updateContent !== 'object') continue;
            
            // Get the content type of the update
            const contentType = getContentType(updateContent);
            if (!contentType) continue;
            
            // Check if this is a message edit (has text or media content)
            const isMessageEdit = [
                'extendedTextMessage',
                'conversation',
                'imageMessage',
                'videoMessage',
                'audioMessage',
                'documentMessage'
            ].some(type => updateContent[type]);
            
            if (isMessageEdit) {
                console.log(`🔍 Antiedit: Detected edit for message ${msgId} in ${chatJid}`);
                
                // Create a message object from the update
                const editedMessage = {
                    key: msgKey,
                    message: { [contentType]: updateContent[contentType] },
                    pushName: existingMessage.pushName,
                    messageTimestamp: Math.floor(Date.now() / 1000)
                };
                
                // Store the edit
                await storeIncomingMessage(editedMessage, true, existingMessage);
            }
        }
    } catch (error) {
        console.error('❌ Antiedit: Error handling message updates:', error.message);
    }
}

// Send edit alert to owner DM
async function sendEditAlertToOwnerDM(originalMsg, editedMsg, history) {
    try {
        if (!antieditState.sock || !antieditState.ownerJid) {
            console.error('❌ Antiedit: Socket or owner JID not set');
            return false;
        }
        
        const ownerJid = antieditState.ownerJid;
        const time = new Date(originalMsg.timestamp).toLocaleString();
        const editTime = new Date(editedMsg.editTime).toLocaleString();
        const senderNumber = originalMsg.senderJid.split('@')[0];
        const chatNumber = originalMsg.chatJid.includes('@g.us') 
            ? 'Group Chat' 
            : originalMsg.chatJid.split('@')[0];
        
        let alertText = `✏️ *MESSAGE EDITED*\n\n`;
        alertText += `👤 From: ${senderNumber} (${originalMsg.pushName})\n`;
        alertText += `💬 Chat: ${chatNumber}\n`;
        alertText += `🕒 Original: ${time}\n`;
        alertText += `✏️ Edited: ${editTime}\n`;
        alertText += `📝 Type: ${originalMsg.type.toUpperCase()}\n`;
        alertText += `🔄 Version: v${originalMsg.version} → v${editedMsg.version}\n`;
        alertText += `📊 Total edits: ${history ? history.length - 1 : 0}\n`;
        
        alertText += `\n─────────────────\n`;
        alertText += `📜 *ORIGINAL MESSAGE*\n`;
        if (originalMsg.text) {
            alertText += `${originalMsg.text.substring(0, 300)}`;
            if (originalMsg.text.length > 300) alertText += '...';
        } else if (originalMsg.hasMedia) {
            alertText += `[${originalMsg.type.toUpperCase()} MEDIA]`;
        } else {
            alertText += `[Empty message]`;
        }
        
        alertText += `\n\n─────────────────\n`;
        alertText += `✏️ *EDITED VERSION*\n`;
        if (editedMsg.text) {
            alertText += `${editedMsg.text.substring(0, 300)}`;
            if (editedMsg.text.length > 300) alertText += '...';
        } else if (editedMsg.hasMedia) {
            alertText += `[${editedMsg.type.toUpperCase()} MEDIA]`;
        } else {
            alertText += `[Empty message]`;
        }
        
        alertText += `\n\n────────────\n`;
        alertText += `🔍 *Captured by antiedit*`;
        
        // Check if we have media
        const originalMediaKey = `${originalMsg.id}_v${originalMsg.version}`;
        const editedMediaKey = `${editedMsg.id}_v${editedMsg.version}`;
        const originalMedia = antieditState.mediaCache.get(originalMediaKey);
        const editedMedia = antieditState.mediaCache.get(editedMediaKey);
        
        let mediaSent = false;
        
        // Try to send edited media
        if (editedMsg.hasMedia && editedMedia) {
            try {
                let buffer = editedMedia.buffer;
                if (!buffer) {
                    buffer = await fs.readFile(editedMedia.filePath);
                }
                
                if (buffer && buffer.length > 0) {
                    if (editedMsg.type === 'sticker') {
                        await antieditState.sock.sendMessage(ownerJid, {
                            sticker: buffer,
                            mimetype: editedMedia.mimetype
                        });
                    } else if (editedMsg.type === 'image') {
                        await antieditState.sock.sendMessage(ownerJid, {
                            image: buffer,
                            caption: alertText,
                            mimetype: editedMedia.mimetype
                        });
                        mediaSent = true;
                    } else if (editedMsg.type === 'video') {
                        await antieditState.sock.sendMessage(ownerJid, {
                            video: buffer,
                            caption: alertText,
                            mimetype: editedMedia.mimetype
                        });
                        mediaSent = true;
                    } else if (editedMsg.type === 'audio' || editedMsg.type === 'voice') {
                        await antieditState.sock.sendMessage(ownerJid, {
                            audio: buffer,
                            mimetype: editedMedia.mimetype,
                            ptt: editedMsg.type === 'voice'
                        });
                    }
                }
            } catch (mediaError) {
                console.error('❌ Antiedit: Media send error:', mediaError.message);
            }
        }
        
        // Send text alert if media wasn't sent or failed
        if (!mediaSent) {
            await antieditState.sock.sendMessage(ownerJid, { text: alertText });
        }
        
        console.log(`📤 Antiedit: Edit alert sent to owner DM: ${senderNumber} → ${chatNumber}`);
        return true;
        
    } catch (error) {
        console.error('❌ Antiedit: Error sending edit alert to owner DM:', error.message);
        return false;
    }
}

// Send edit alert to chat
async function sendEditAlertToChat(originalMsg, editedMsg, history, chatJid) {
    try {
        if (!antieditState.sock) return false;
        
        const time = new Date(originalMsg.timestamp).toLocaleString();
        const editTime = new Date(editedMsg.editTime).toLocaleString();
        const senderNumber = originalMsg.senderJid.split('@')[0];
        
        let alertText = `✏️ *MESSAGE WAS EDITED*\n\n`;
        alertText += `👤 From: ${senderNumber} (${originalMsg.pushName})\n`;
        alertText += `🕒 Original: ${time}\n`;
        alertText += `✏️ Edited: ${editTime}\n`;
        alertText += `📝 Type: ${originalMsg.type.toUpperCase()}\n`;
        alertText += `🔄 Version: v${originalMsg.version} → v${editedMsg.version}\n`;
        
        alertText += `\n─────────────────\n`;
        alertText += `📜 *ORIGINAL MESSAGE*\n`;
        if (originalMsg.text) {
            alertText += `${originalMsg.text.substring(0, 200)}`;
            if (originalMsg.text.length > 200) alertText += '...';
        } else if (originalMsg.hasMedia) {
            alertText += `[${originalMsg.type.toUpperCase()} MEDIA]`;
        } else {
            alertText += `[Empty message]`;
        }
        
        alertText += `\n\n─────────────────\n`;
        alertText += `✏️ *EDITED VERSION*\n`;
        if (editedMsg.text) {
            alertText += `${editedMsg.text.substring(0, 200)}`;
            if (editedMsg.text.length > 200) alertText += '...';
        } else if (editedMsg.hasMedia) {
            alertText += `[${editedMsg.type.toUpperCase()} MEDIA]`;
        } else {
            alertText += `[Empty message]`;
        }
        
        alertText += `\n\n────────────\n`;
        alertText += `🔍 *Detected by antiedit*`;
        
        await antieditState.sock.sendMessage(chatJid, { text: alertText });
        
        console.log(`📤 Antiedit: Edit alert sent to chat ${chatJid}`);
        return true;
        
    } catch (error) {
        console.error('❌ Antiedit: Error sending edit alert to chat:', error.message);
        return false;
    }
}

// Show message history
async function showMessageHistory(msgId, chatJid) {
    try {
        if (!antieditState.sock) return false;
        
        const history = antieditState.messageHistory.get(msgId);
        if (!history || history.length < 1) {
            await antieditState.sock.sendMessage(chatJid, { 
                text: `❌ No history found for this message.` 
            });
            return false;
        }
        
        const firstMessage = history[0];
        const latestMessage = history[history.length - 1];
        
        let historyText = `📜 *MESSAGE HISTORY*\n\n`;
        historyText += `👤 From: ${firstMessage.pushName}\n`;
        historyText += `📅 Total versions: ${history.length}\n`;
        historyText += `🕒 First sent: ${new Date(firstMessage.timestamp).toLocaleString()}\n`;
        historyText += `✏️ Last edit: ${new Date(latestMessage.editTime || latestMessage.timestamp).toLocaleString()}\n`;
        
        historyText += `\n─────────────────\n`;
        
        history.forEach((msg, index) => {
            const version = index + 1;
            const time = new Date(msg.editTime || msg.timestamp).toLocaleTimeString();
            const prefix = msg.isEdit ? '✏️' : '📝';
            
            historyText += `\n${prefix} v${version} [${time}]: `;
            if (msg.text && msg.text.trim()) {
                historyText += `${msg.text.substring(0, 80)}`;
                if (msg.text.length > 80) historyText += '...';
            } else if (msg.hasMedia) {
                historyText += `[${msg.type.toUpperCase()} MEDIA]`;
            } else {
                historyText += `[Empty]`;
            }
        });
        
        historyText += `\n\n────────────\n`;
        historyText += `🔍 *History retrieved by antiedit*`;
        
        await antieditState.sock.sendMessage(chatJid, { text: historyText });
        return true;
        
    } catch (error) {
        console.error('❌ Antiedit: Error showing message history:', error.message);
        return false;
    }
}

// Setup listeners
function setupListeners(sock) {
    if (!sock) {
        console.error('❌ Antiedit: No socket provided');
        return;
    }
    
    antieditState.sock = sock;
    
    console.log('🚀 Antiedit: Setting up listeners...');
    
    // Listen for incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify' || antieditState.mode === 'off') return;
            
            for (const message of messages) {
                await storeIncomingMessage(message, false);
            }
        } catch (error) {
            console.error('❌ Antiedit: Message storage error:', error.message);
        }
    });
    
    // Listen for message updates (edits)
    sock.ev.on('messages.update', async (updates) => {
        try {
            if (antieditState.mode === 'off') return;
            
            await handleMessageUpdates(updates);
        } catch (error) {
            console.error('❌ Antiedit: Edit detection error:', error.message);
        }
    });
    
    // Listen for connection updates
    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
            console.log('✅ Antiedit: Connected and ready');
        }
    });
    
    console.log('✅ Antiedit: Listeners active');
}

// Initialize system
async function initializeSystem(sock) {
    try {
        await loadData();
        
        if (sock.user?.id) {
            antieditState.ownerJid = sock.user.id;
            console.log(`👑 Antiedit: Owner set to ${sock.user.id}`);
        }
        
        setupListeners(sock);
        
        console.log(`🎯 Antiedit: System initialized`);
        console.log(`   Mode: ${antieditState.mode.toUpperCase()}`);
        console.log(`   Status: ${antieditState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}`);
        console.log(`   Tracking: ${antieditState.currentMessages.size} messages`);
        console.log(`   History: ${antieditState.messageHistory.size} entries`);
        
        // Auto-save every 5 minutes
        setInterval(async () => {
            if (antieditState.stats.totalMessages > 0) {
                await saveData();
            }
        }, 5 * 60 * 1000);
        
    } catch (error) {
        console.error('❌ Antiedit: Initialization error:', error.message);
    }
}

// Export initialization function
export async function initAntiedit(sock) {
    await initializeSystem(sock);
}

// The command module
export default {
    name: 'antiedit',
    alias: ['editdetect', 'edited', 'ae'],
    description: 'Capture edited messages - public/private/off modes',
    category: 'utility',
    
    async execute(sock, msg, args, prefix, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const command = args[0]?.toLowerCase() || 'status';
        
        // Ensure system has socket
        if (!antieditState.sock) {
            antieditState.sock = sock;
            setupListeners(sock);
        }
        
        // Set owner from metadata if available
        if (!antieditState.ownerJid && metadata.OWNER_JID) {
            antieditState.ownerJid = metadata.OWNER_JID;
        }
        if (!antieditState.ownerJid && sock.user?.id) {
            antieditState.ownerJid = sock.user.id;
        }
        
        switch (command) {
            case 'public':
                antieditState.mode = 'public';
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIEDIT: PUBLIC MODE*\n\nEdited messages will be shown in the chat where they were edited.\n\nCurrent status: ✅ ACTIVE`
                }, { quoted: msg });
                break;
                
            case 'private':
                antieditState.mode = 'private';
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIEDIT: PRIVATE MODE*\n\nEdited messages will be sent to your DM only.\n\nCurrent status: ✅ ACTIVE\nOwner: ${antieditState.ownerJid ? '✅ SET' : '⚠️ NOT SET'}`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
                antieditState.mode = 'off';
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIEDIT: DISABLED*\n\nSystem is now OFF. No message edits will be captured.`
                }, { quoted: msg });
                break;
                
            case 'on':
            case 'enable':
                antieditState.mode = 'private';
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIEDIT: ENABLED*\n\nSystem is now ON in PRIVATE mode.`
                }, { quoted: msg });
                break;
                
            case 'status':
            case 'stats':
                const statsText = `
📊 *ANTIEDIT STATISTICS*

Mode: ${antieditState.mode.toUpperCase()}
Status: ${antieditState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}
Owner: ${antieditState.ownerJid ? '✅ SET' : '⚠️ NOT SET'}
Socket: ${antieditState.sock ? '✅ CONNECTED' : '❌ DISCONNECTED'}

📈 *Statistics:*
• Total messages: ${antieditState.stats.totalMessages}
• Edits detected: ${antieditState.stats.editsDetected}
• Media captured: ${antieditState.stats.mediaCaptured}
• Alerts sent to DM: ${antieditState.stats.sentToDm}
• Alerts sent to chat: ${antieditState.stats.sentToChat}
• Currently tracking: ${antieditState.currentMessages.size} messages

💡 *Commands:*
• \`${prefix}antiedit public\`
• \`${prefix}antiedit private\`
• \`${prefix}antiedit off\`
• \`${prefix}antiedit history <reply to message>\`
• \`${prefix}antiedit test\`
• \`${prefix}antiedit clear\`
`;
                
                await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                break;
                
            case 'history':
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
                
                let targetMsgId;
                if (quotedId) {
                    targetMsgId = quotedId;
                } else if (args[1]) {
                    targetMsgId = args[1];
                }
                
                if (!targetMsgId) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ Please reply to a message to see its edit history.\n\nUsage: Reply to a message with ${prefix}antiedit history`
                    }, { quoted: msg });
                }
                
                await showMessageHistory(targetMsgId, chatId);
                break;
                
            case 'test':
                // Send a test message
                const testText = `🧪 *Test Message for Antiedit*\n\nMode: ${antieditState.mode.toUpperCase()}\nStatus: ${antieditState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}\n\nEdit this message to test the system!`;
                
                const testMsg = await sock.sendMessage(chatId, { 
                    text: testText 
                });
                
                // Store test message
                if (testMsg?.key) {
                    const testData = {
                        id: testMsg.key.id,
                        chatJid: testMsg.key.remoteJid,
                        senderJid: antieditState.ownerJid || sock.user.id,
                        pushName: 'Antiedit Test',
                        timestamp: Date.now(),
                        type: 'text',
                        text: testText,
                        hasMedia: false,
                        version: 1,
                        isEdit: false
                    };
                    
                    antieditState.currentMessages.set(testMsg.key.id, testData);
                    antieditState.messageHistory.set(testMsg.key.id, [{...testData}]);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ Test message stored (ID: ${testMsg.key.id})!\n\nNow edit the previous message to test antiedit.`
                    });
                }
                break;
                
            case 'clear':
            case 'clean':
            case 'reset':
                const historySize = antieditState.messageHistory.size;
                const currentSize = antieditState.currentMessages.size;
                const mediaSize = antieditState.mediaCache.size;
                
                antieditState.messageHistory.clear();
                antieditState.currentMessages.clear();
                antieditState.mediaCache.clear();
                antieditState.stats.totalMessages = 0;
                antieditState.stats.editsDetected = 0;
                antieditState.stats.retrieved = 0;
                antieditState.stats.mediaCaptured = 0;
                antieditState.stats.sentToDm = 0;
                antieditState.stats.sentToChat = 0;
                
                // Delete media files
                try {
                    const files = await fs.readdir(MEDIA_DIR);
                    for (const file of files) {
                        await fs.unlink(path.join(MEDIA_DIR, file)).catch(() => {});
                    }
                } catch (error) {}
                
                await saveData();
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *Cache Cleared*\n\n• History entries: ${historySize}\n• Current messages: ${currentSize}\n• Media files: ${mediaSize}\n\nAll data has been cleared.`
                }, { quoted: msg });
                break;
                
            case 'debug':
                const debugText = `
🔧 *ANTIEDIT DEBUG INFO*

Mode: ${antieditState.mode}
Owner JID: ${antieditState.ownerJid || 'Not set'}
Socket: ${antieditState.sock ? 'Present' : 'Missing'}

Storage:
• Current messages: ${antieditState.currentMessages.size}
• Message history: ${antieditState.messageHistory.size}
• Media cache: ${antieditState.mediaCache.size}

Listeners active: ✅
Auto-save: ✅
`;
                await sock.sendMessage(chatId, { text: debugText }, { quoted: msg });
                break;
                
            case 'help':
            case 'menu':
                const helpText = `
🔍 *ANTIEDIT SYSTEM*

🎯 *Three Modes:*
1. **PUBLIC** - Shows edited messages in the chat where they were edited
2. **PRIVATE** - Sends edited messages to your DM only  
3. **OFF** - System is disabled

🚀 *Commands:*
• \`${prefix}antiedit public\` - Enable PUBLIC mode
• \`${prefix}antiedit private\` - Enable PRIVATE mode
• \`${prefix}antiedit on\` - Enable system (private mode)
• \`${prefix}antiedit off\` - Disable system
• \`${prefix}antiedit status\` - View statistics
• \`${prefix}antiedit history <reply>\` - Show edit history of a message
• \`${prefix}antiedit test\` - Send test message
• \`${prefix}antiedit clear\` - Clear all cache
• \`${prefix}antiedit debug\` - Debug information
• \`${prefix}antiedit help\` - This menu

⚙️ *Features:*
✅ Captures all edits (text changes)
✅ Tracks message versions (v1, v2, v3...)
✅ Shows original vs edited content
✅ Works with media messages
✅ History tracking for each message
✅ Private DM alerts or public chat alerts

📝 *Current Status:*
Mode: ${antieditState.mode.toUpperCase()}
Active: ${antieditState.mode === 'off' ? '❌' : '✅'}
Tracking: ${antieditState.currentMessages.size} messages
Owner: ${antieditState.ownerJid ? '✅ SET' : '⚠️ NOT SET'}
`;
                
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `🔧 *Antiedit System*\n\nCurrent Mode: ${antieditState.mode.toUpperCase()}\nStatus: ${antieditState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}\nTracking: ${antieditState.currentMessages.size} messages\n\n💡 Use ${prefix}antiedit help for commands`
                }, { quoted: msg });
        }
        
        // Save state after command
        await saveData();
    }
};