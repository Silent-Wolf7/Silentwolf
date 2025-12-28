// File: ./commands/utility/antidelete.js - UPDATED WITH JSON STORAGE & AUTO-CLEAN
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage paths
const STORAGE_DIR = './data/antidelete';
const MEDIA_DIR = path.join(STORAGE_DIR, 'media');
const CACHE_FILE = path.join(STORAGE_DIR, 'antidelete.json'); // CHANGED: Renamed to antidelete.json
const SETTINGS_FILE = path.join(STORAGE_DIR, 'settings.json');

// Cache cleaning settings
const CACHE_CLEAN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Global state
let antideleteState = {
    enabled: true,
    mode: 'private',
    ownerJid: null,
    sock: null,
    messageCache: new Map(),
    mediaCache: new Map(),
    stats: {
        totalMessages: 0,
        deletedDetected: 0,
        retrieved: 0,
        mediaCaptured: 0,
        sentToDm: 0,
        sentToChat: 0,
        cacheCleans: 0,
        totalStorageMB: 0
    },
    settings: {
        autoCleanEnabled: true,
        maxAgeHours: 24,
        maxStorageMB: 500,
        showPhoneNumbers: true,
        ownerOnly: true,
        autoCleanRetrieved: true, // NEW: Auto-clean retrieved messages
        initialized: false
    },
    cleanupInterval: null
};

// Ensure directories exist
async function ensureDirs() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        await fs.mkdir(MEDIA_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('❌ Antidelete: Failed to create directories:', error.message);
        return false;
    }
}

// Calculate total storage size
async function calculateStorageSize() {
    try {
        let totalBytes = 0;
        
        // Calculate media file sizes
        const files = await fs.readdir(MEDIA_DIR);
        for (const file of files) {
            const filePath = path.join(MEDIA_DIR, file);
            const stats = await fs.stat(filePath);
            totalBytes += stats.size;
        }
        
        // Add cache file size
        if (await fs.access(CACHE_FILE).then(() => true).catch(() => false)) {
            const stats = await fs.stat(CACHE_FILE);
            totalBytes += stats.size;
        }
        
        // Add settings file size
        if (await fs.access(SETTINGS_FILE).then(() => true).catch(() => false)) {
            const stats = await fs.stat(SETTINGS_FILE);
            totalBytes += stats.size;
        }
        
        antideleteState.stats.totalStorageMB = Math.round(totalBytes / 1024 / 1024);
        
    } catch (error) {
        console.error('❌ Antidelete: Error calculating storage:', error.message);
    }
}

// Load saved data from JSON
async function loadData() {
    try {
        await ensureDirs();
        
        // Load settings first
        if (await fs.access(SETTINGS_FILE).then(() => true).catch(() => false)) {
            const settingsData = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'));
            antideleteState.settings = { ...antideleteState.settings, ...settingsData };
        }
        
        if (await fs.access(CACHE_FILE).then(() => true).catch(() => false)) {
            const data = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
            
            // Restore mode from saved data if exists
            if (data.mode) {
                antideleteState.mode = data.mode;
            }
            
            // Load message cache from JSON
            if (data.messageCache && Array.isArray(data.messageCache)) {
                antideleteState.messageCache.clear();
                data.messageCache.forEach(([key, value]) => {
                    antideleteState.messageCache.set(key, value);
                });
            }
            
            // Load media cache from JSON (only metadata, not actual buffer)
            if (data.mediaCache && Array.isArray(data.mediaCache)) {
                antideleteState.mediaCache.clear();
                data.mediaCache.forEach(([key, value]) => {
                    // Only store metadata, not the actual buffer
                    antideleteState.mediaCache.set(key, {
                        filePath: value.filePath,
                        type: value.type,
                        mimetype: value.mimetype,
                        size: value.size,
                        savedAt: value.savedAt
                    });
                });
            }
            
            if (data.stats) {
                antideleteState.stats = { ...antideleteState.stats, ...data.stats };
            }
            
            console.log(`✅ Antidelete: Loaded ${antideleteState.messageCache.size} messages, ${antideleteState.mediaCache.size} media from JSON`);
        }
        
        // Calculate total storage
        await calculateStorageSize();
        
    } catch (error) {
        console.error('❌ Antidelete: Error loading JSON data:', error.message);
    }
}

// Save data to JSON
async function saveData() {
    try {
        await ensureDirs();
        
        // Prepare data for JSON (exclude buffers to save memory)
        const data = {
            mode: antideleteState.mode,
            messageCache: Array.from(antideleteState.messageCache.entries()),
            mediaCache: Array.from(antideleteState.mediaCache.entries()).map(([key, value]) => {
                // Only save metadata, not the buffer
                return [key, {
                    filePath: value.filePath,
                    type: value.type,
                    mimetype: value.mimetype,
                    size: value.size,
                    savedAt: value.savedAt
                }];
            }),
            stats: antideleteState.stats,
            savedAt: Date.now()
        };
        
        // Write to JSON file
        await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
        
        // Save settings separately
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(antideleteState.settings, null, 2));
        
        console.log(`💾 Antidelete: Saved data to JSON (${antideleteState.messageCache.size} messages, ${antideleteState.mediaCache.size} media)`);
        
    } catch (error) {
        console.error('❌ Antidelete: Error saving JSON data:', error.message);
    }
}

// Get raw WhatsApp number from JID
function getRawWhatsAppNumber(jid) {
    if (!jid) return 'Unknown';
    
    try {
        const numberPart = jid.split('@')[0];
        const rawNumber = numberPart.replace(/[^\d+]/g, '');
        
        if (rawNumber && !rawNumber.startsWith('+')) {
            if (rawNumber.length >= 10) {
                return `+${rawNumber}`;
            }
        }
        
        return rawNumber || numberPart || 'Unknown';
        
    } catch (error) {
        console.error('❌ Antidelete: Error extracting number:', error.message);
        return 'Unknown';
    }
}

// Clean retrieved message from JSON (auto-clean after sending)
async function cleanRetrievedMessage(msgId) {
    try {
        if (!antideleteState.settings.autoCleanRetrieved) {
            return;
        }
        
        // Remove from message cache
        antideleteState.messageCache.delete(msgId);
        
        // Remove media cache entry (but keep the file for now)
        antideleteState.mediaCache.delete(msgId);
        
        // Immediately save to JSON to free memory
        await saveData();
        
        console.log(`🧹 Antidelete: Cleaned retrieved message ${msgId} from JSON`);
        
    } catch (error) {
        console.error('❌ Antidelete: Error cleaning retrieved message:', error.message);
    }
}

// Auto-clean old cache from JSON
async function autoCleanCache() {
    try {
        if (!antideleteState.settings.autoCleanEnabled) {
            console.log('🔄 Antidelete: Auto-clean disabled, skipping...');
            return;
        }
        
        console.log('🧹 Antidelete: Starting auto-clean from JSON...');
        const now = Date.now();
        const maxAge = antideleteState.settings.maxAgeHours * 60 * 60 * 1000;
        let cleanedCount = 0;
        let cleanedMedia = 0;
        
        // Clean old messages from cache and JSON
        for (const [key, message] of antideleteState.messageCache.entries()) {
            if (now - message.timestamp > maxAge) {
                antideleteState.messageCache.delete(key);
                cleanedCount++;
            }
        }
        
        // Clean old media files and their JSON entries
        const files = await fs.readdir(MEDIA_DIR);
        for (const file of files) {
            const filePath = path.join(MEDIA_DIR, file);
            const stats = await fs.stat(filePath);
            
            const fileAge = now - stats.mtimeMs;
            if (fileAge > maxAge) {
                try {
                    await fs.unlink(filePath);
                    
                    // Remove from media cache
                    for (const [key, media] of antideleteState.mediaCache.entries()) {
                        if (media.filePath === filePath) {
                            antideleteState.mediaCache.delete(key);
                            break;
                        }
                    }
                    
                    cleanedMedia++;
                } catch (error) {
                    console.error(`❌ Could not delete ${file}:`, error.message);
                }
            }
        }
        
        // Check storage limit
        await calculateStorageSize();
        if (antideleteState.stats.totalStorageMB > antideleteState.settings.maxStorageMB) {
            console.log(`⚠️ Antidelete: Storage limit reached (${antideleteState.stats.totalStorageMB}MB > ${antideleteState.settings.maxStorageMB}MB)`);
            // Force cleanup of oldest files
            await forceCleanup();
        }
        
        if (cleanedCount > 0 || cleanedMedia > 0) {
            antideleteState.stats.cacheCleans++;
            await saveData();
            console.log(`✅ Antidelete: Auto-clean completed. Removed ${cleanedCount} entries and ${cleanedMedia} media files from JSON.`);
        } else {
            console.log('✅ Antidelete: Auto-clean completed (nothing to clean).');
        }
        
    } catch (error) {
        console.error('❌ Antidelete: Auto-clean error:', error.message);
    }
}

// Force cleanup when storage limit reached
async function forceCleanup() {
    try {
        console.log('⚠️ Antidelete: Force cleanup initiated...');
        
        // Get all media files sorted by age (oldest first)
        const files = await fs.readdir(MEDIA_DIR);
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(MEDIA_DIR, file);
                const stats = await fs.stat(filePath);
                return { file, filePath, mtimeMs: stats.mtimeMs, size: stats.size };
            })
        );
        
        fileStats.sort((a, b) => a.mtimeMs - b.mtimeMs); // Sort by oldest first
        
        // Delete oldest files until under limit
        let deletedSize = 0;
        const targetSize = antideleteState.settings.maxStorageMB * 1024 * 1024 * 0.8; // Target 80% of max
        
        for (const fileStat of fileStats) {
            if (antideleteState.stats.totalStorageMB * 1024 * 1024 <= targetSize) {
                break;
            }
            
            try {
                await fs.unlink(fileStat.filePath);
                deletedSize += fileStat.size;
                
                // Remove from media cache
                for (const [key, media] of antideleteState.mediaCache.entries()) {
                    if (media.filePath === fileStat.filePath) {
                        antideleteState.mediaCache.delete(key);
                        break;
                    }
                }
                
                console.log(`🗑️ Force deleted: ${fileStat.file}`);
            } catch (error) {
                console.error(`❌ Could not delete ${fileStat.file}:`, error.message);
            }
        }
        
        // Clear oldest cache entries
        const cacheEntries = Array.from(antideleteState.messageCache.entries());
        cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest
        
        for (let i = 0; i < Math.min(10, cacheEntries.length); i++) {
            antideleteState.messageCache.delete(cacheEntries[i][0]);
        }
        
        await calculateStorageSize();
        await saveData();
        
        console.log(`✅ Force cleanup completed. Freed ${Math.round(deletedSize / 1024 / 1024)}MB`);
        
    } catch (error) {
        console.error('❌ Antidelete: Force cleanup error:', error.message);
    }
}

// Start auto-clean interval
function startAutoClean() {
    if (antideleteState.cleanupInterval) {
        clearInterval(antideleteState.cleanupInterval);
    }
    
    antideleteState.cleanupInterval = setInterval(async () => {
        await autoCleanCache();
    }, CACHE_CLEAN_INTERVAL);
    
    console.log(`🔄 Antidelete: Auto-clean scheduled every ${CACHE_CLEAN_INTERVAL / 1000 / 60 / 60} hours`);
}

// Stop auto-clean interval
function stopAutoClean() {
    if (antideleteState.cleanupInterval) {
        clearInterval(antideleteState.cleanupInterval);
        antideleteState.cleanupInterval = null;
        console.log('🛑 Antidelete: Auto-clean stopped');
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
        'audio/aac': '.aac'
    };
    
    return mimeToExt[mimetype] || '.bin';
}

// Download and save media (optimized for memory)
async function downloadAndSaveMedia(msgId, message, messageType, mimetype) {
    try {
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            {
                logger: { level: 'silent' },
                reuploadRequest: antideleteState.sock?.updateMediaMessage
            }
        );
        
        if (!buffer || buffer.length === 0) {
            return null;
        }
        
        // Check file size (max 10MB to prevent memory issues)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (buffer.length > maxSize) {
            console.log(`⚠️ Antidelete: Media too large (${Math.round(buffer.length/1024/1024)}MB), skipping...`);
            return null;
        }
        
        const timestamp = Date.now();
        const extension = getExtensionFromMime(mimetype);
        const filename = `${messageType}_${timestamp}${extension}`;
        const filePath = path.join(MEDIA_DIR, filename);
        
        // Write file directly to disk without storing buffer in memory
        await fs.writeFile(filePath, buffer);
        
        // Store only metadata in cache, not the buffer
        antideleteState.mediaCache.set(msgId, {
            filePath: filePath,
            type: messageType,
            mimetype: mimetype,
            size: buffer.length,
            savedAt: timestamp
        });
        
        antideleteState.stats.mediaCaptured++;
        
        // Calculate storage and save to JSON immediately
        await calculateStorageSize();
        
        console.log(`📸 Antidelete: Saved ${messageType} media: ${filename} (${Math.round(buffer.length/1024)}KB)`);
        return filePath;
        
    } catch (error) {
        console.error('❌ Antidelete: Media download error:', error.message);
        return null;
    }
}

// Store incoming message (optimized for memory)
async function storeIncomingMessage(message) {
    try {
        if (!antideleteState.sock || antideleteState.mode === 'off') return;
        
        const msgKey = message.key;
        if (!msgKey || !msgKey.id || msgKey.fromMe) return;
        
        const msgId = msgKey.id;
        const chatJid = msgKey.remoteJid;
        const senderJid = msgKey.participant || chatJid;
        const pushName = message.pushName || 'Unknown';
        const timestamp = message.messageTimestamp * 1000 || Date.now();
        
        // Skip status broadcasts (handled by status antidelete)
        if (chatJid === 'status@broadcast') return;
        
        // Extract message content
        const msgContent = message.message;
        let type = 'text';
        let text = '';
        let hasMedia = false;
        let mediaInfo = null;
        let mimetype = '';
        
        if (msgContent?.conversation) {
            text = msgContent.conversation;
        } else if (msgContent?.extendedTextMessage?.text) {
            text = msgContent.extendedTextMessage.text;
        } else if (msgContent?.imageMessage) {
            type = 'image';
            text = msgContent.imageMessage.caption || '';
            hasMedia = true;
            mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
            mediaInfo = { message, type: 'image', mimetype };
        } else if (msgContent?.videoMessage) {
            type = 'video';
            text = msgContent.videoMessage.caption || '';
            hasMedia = true;
            mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
            mediaInfo = { message, type: 'video', mimetype };
        } else if (msgContent?.audioMessage) {
            type = 'audio';
            hasMedia = true;
            mimetype = msgContent.audioMessage.mimetype || 'audio/mpeg';
            if (msgContent.audioMessage.ptt) {
                type = 'voice';
            }
            mediaInfo = { message, type: 'audio', mimetype };
        } else if (msgContent?.documentMessage) {
            type = 'document';
            text = msgContent.documentMessage.fileName || 'Document';
            hasMedia = true;
            mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
            mediaInfo = { message, type: 'document', mimetype };
        } else if (msgContent?.stickerMessage) {
            type = 'sticker';
            hasMedia = true;
            mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
            mediaInfo = { message, type: 'sticker', mimetype };
        }
        
        // Skip empty messages
        if (!text && !hasMedia) return;
        
        // Get WhatsApp number
        const whatsappNumber = getRawWhatsAppNumber(senderJid);
        
        const messageData = {
            id: msgId,
            chatJid,
            senderJid,
            whatsappNumber,
            pushName,
            timestamp,
            type,
            text: text || '',
            hasMedia,
            mimetype
        };
        
        // Store in cache
        antideleteState.messageCache.set(msgId, messageData);
        antideleteState.stats.totalMessages++;
        
        console.log(`📱 Antidelete: Stored message from ${pushName} (${type})`);
        
        // Download media if present (with delay to prevent memory spikes)
        if (hasMedia && mediaInfo) {
            // Add random delay to prevent concurrent downloads
            const delay = Math.random() * 2000 + 1000; // 1-3 seconds
            setTimeout(async () => {
                try {
                    await downloadAndSaveMedia(msgId, mediaInfo.message, type, mediaInfo.mimetype);
                    await saveData();
                } catch (error) {
                    console.error('❌ Antidelete: Async media download failed:', error.message);
                }
            }, delay);
        }
        
        // Save to JSON periodically (but not too often)
        if (antideleteState.messageCache.size % 10 === 0) {
            await saveData();
        }
        
        return messageData;
        
    } catch (error) {
        console.error('❌ Antidelete: Error storing message:', error.message);
        return null;
    }
}

// Handle deleted message (with auto-clean from JSON)
async function handleDeletedMessage(update) {
    try {
        if (!antideleteState.sock || antideleteState.mode === 'off') return;
        
        const msgKey = update.key;
        if (!msgKey || !msgKey.id) return;
        
        const msgId = msgKey.id;
        const chatJid = msgKey.remoteJid;
        
        // Check if message was deleted
        const isDeleted = 
            update.message === null ||
            update.update?.status === 6 ||
            update.update?.message === null ||
            update.messageStubType === 7 || // REVOKE
            update.messageStubType === 8;   // REVOKE_EVERYONE
        
        if (!isDeleted) return;
        
        console.log(`🔍 Antidelete: Checking deletion for ${msgId} in ${chatJid}`);
        
        // Get cached message
        const cachedMessage = antideleteState.messageCache.get(msgId);
        if (!cachedMessage) {
            console.log(`⚠️ Antidelete: Message ${msgId} not found in cache`);
            return;
        }
        
        // Remove from cache
        antideleteState.messageCache.delete(msgId);
        antideleteState.stats.deletedDetected++;
        
        // Send based on mode
        let sent = false;
        if (antideleteState.mode === 'private') {
            sent = await sendToOwnerDM(cachedMessage);
            if (sent) {
                antideleteState.stats.sentToDm++;
                
                // Auto-clean retrieved message from JSON
                await cleanRetrievedMessage(msgId);
            }
        } else if (antideleteState.mode === 'public') {
            sent = await sendToChat(cachedMessage, chatJid);
            if (sent) {
                antideleteState.stats.sentToChat++;
                
                // Auto-clean retrieved message from JSON
                await cleanRetrievedMessage(msgId);
            }
        }
        
        if (sent) {
            antideleteState.stats.retrieved++;
            // Save to JSON (without the retrieved message)
            await saveData();
            console.log(`✅ Antidelete: Retrieved deleted message from ${cachedMessage.pushName}`);
        }
        
    } catch (error) {
        console.error('❌ Antidelete: Error handling deleted message:', error.message);
    }
}

// Send to owner DM (PRIVATE mode) - optimized for memory
async function sendToOwnerDM(messageData) {
    try {
        if (!antideleteState.sock || !antideleteState.ownerJid) {
            console.error('❌ Antidelete: Socket or owner JID not set');
            return false;
        }
        
        const ownerJid = antideleteState.ownerJid;
        const time = new Date(messageData.timestamp).toLocaleString();
        
        // Use raw WhatsApp number
        const whatsappNumber = messageData.whatsappNumber || getRawWhatsAppNumber(messageData.senderJid);
        
        const chatNumber = messageData.chatJid.includes('@g.us') 
            ? 'Group Chat' 
            : getRawWhatsAppNumber(messageData.chatJid);
        
        let detailsText = `🗑️ *DELETED MESSAGE*\n\n`;
        detailsText += `👤 From: ${whatsappNumber} (${messageData.pushName})\n`;
        detailsText += `💬 Chat: ${chatNumber}\n`;
        detailsText += `🕒 Time: ${time}\n`;
        detailsText += `📝 Type: ${messageData.type.toUpperCase()}\n`;
        
        if (messageData.text) {
            detailsText += `\n📋 Content:\n${messageData.text.substring(0, 500)}`;
            if (messageData.text.length > 500) detailsText += '...';
        }
        
        detailsText += `\n\n────────────\n`;
        detailsText += `🔍 *Captured by Antidelete*`;
        
        // Check if we have media
        const mediaCache = antideleteState.mediaCache.get(messageData.id);
        
        if (messageData.hasMedia && mediaCache) {
            try {
                // Read file directly from disk when needed
                const buffer = await fs.readFile(mediaCache.filePath);
                
                if (buffer && buffer.length > 0) {
                    if (messageData.type === 'sticker') {
                        // Send sticker first
                        const stickerMsg = await antideleteState.sock.sendMessage(ownerJid, {
                            sticker: buffer,
                            mimetype: mediaCache.mimetype
                        });
                        
                        // Then reply with details
                        await antideleteState.sock.sendMessage(ownerJid, { 
                            text: detailsText 
                        }, { 
                            quoted: stickerMsg 
                        });
                        
                    } else if (messageData.type === 'image') {
                        await antideleteState.sock.sendMessage(ownerJid, {
                            image: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (messageData.type === 'video') {
                        await antideleteState.sock.sendMessage(ownerJid, {
                            video: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (messageData.type === 'audio' || messageData.type === 'voice') {
                        await antideleteState.sock.sendMessage(ownerJid, {
                            audio: buffer,
                            mimetype: mediaCache.mimetype,
                            ptt: messageData.type === 'voice'
                        });
                        // Send details separately
                        await antideleteState.sock.sendMessage(ownerJid, { text: detailsText });
                    } else {
                        // For documents or unknown types
                        await antideleteState.sock.sendMessage(ownerJid, {
                            text: detailsText + `\n\n📎 Media type: ${messageData.type}`
                        });
                    }
                } else {
                    await antideleteState.sock.sendMessage(ownerJid, { text: detailsText });
                }
            } catch (mediaError) {
                console.error('❌ Antidelete: Media send error:', mediaError.message);
                await antideleteState.sock.sendMessage(ownerJid, { text: detailsText });
            }
        } else {
            await antideleteState.sock.sendMessage(ownerJid, { text: detailsText });
        }
        
        console.log(`📤 Antidelete: Sent to owner DM: ${whatsappNumber} → ${chatNumber}`);
        return true;
        
    } catch (error) {
        console.error('❌ Antidelete: Error sending to owner DM:', error.message);
        return false;
    }
}

// Send to chat (PUBLIC mode) - optimized for memory
async function sendToChat(messageData, chatJid) {
    try {
        if (!antideleteState.sock) return false;
        
        const time = new Date(messageData.timestamp).toLocaleString();
        
        // Use raw WhatsApp number
        const whatsappNumber = messageData.whatsappNumber || getRawWhatsAppNumber(messageData.senderJid);
        
        let detailsText = `🗑️ *DELETED MESSAGE RETRIEVED*\n\n`;
        detailsText += `👤 From: ${whatsappNumber} (${messageData.pushName})\n`;
        detailsText += `🕒 Original time: ${time}\n`;
        detailsText += `📝 Type: ${messageData.type.toUpperCase()}\n`;
        
        if (messageData.text) {
            detailsText += `\n📋 Content:\n${messageData.text.substring(0, 500)}`;
            if (messageData.text.length > 500) detailsText += '...';
        }
        
        detailsText += `\n\n────────────\n`;
        detailsText += `🔍 *Retrieved by Antidelete*`;
        
        // Check if we have media
        const mediaCache = antideleteState.mediaCache.get(messageData.id);
        
        if (messageData.hasMedia && mediaCache) {
            try {
                // Read file directly from disk when needed
                const buffer = await fs.readFile(mediaCache.filePath);
                
                if (buffer && buffer.length > 0) {
                    if (messageData.type === 'sticker') {
                        // Send sticker first
                        const stickerMsg = await antideleteState.sock.sendMessage(chatJid, {
                            sticker: buffer,
                            mimetype: mediaCache.mimetype
                        });
                        
                        // Then reply with details
                        await antideleteState.sock.sendMessage(chatJid, { 
                            text: detailsText 
                        }, { 
                            quoted: stickerMsg 
                        });
                        
                    } else if (messageData.type === 'image') {
                        await antideleteState.sock.sendMessage(chatJid, {
                            image: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (messageData.type === 'video') {
                        await antideleteState.sock.sendMessage(chatJid, {
                            video: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (messageData.type === 'audio' || messageData.type === 'voice') {
                        await antideleteState.sock.sendMessage(chatJid, {
                            audio: buffer,
                            mimetype: mediaCache.mimetype,
                            ptt: messageData.type === 'voice'
                        });
                        // Send details separately
                        await antideleteState.sock.sendMessage(chatJid, { text: detailsText });
                    } else {
                        // For documents or unknown types
                        await antideleteState.sock.sendMessage(chatJid, {
                            text: detailsText + `\n\n📎 Media type: ${messageData.type}`
                        });
                    }
                } else {
                    await antideleteState.sock.sendMessage(chatJid, { text: detailsText });
                }
            } catch (mediaError) {
                console.error('❌ Antidelete: Media send error:', mediaError.message);
                await antideleteState.sock.sendMessage(chatJid, { text: detailsText });
            }
        } else {
            await antideleteState.sock.sendMessage(chatJid, { text: detailsText });
        }
        
        console.log(`📤 Antidelete: Sent to chat ${chatJid}`);
        return true;
        
    } catch (error) {
        console.error('❌ Antidelete: Error sending to chat:', error.message);
        return false;
    }
}

// Setup listeners
function setupListeners(sock) {
    if (!sock) {
        console.error('❌ Antidelete: No socket provided');
        return;
    }
    
    antideleteState.sock = sock;
    
    console.log('🚀 Antidelete: Setting up listeners...');
    
    // Listen for incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify' || antideleteState.mode === 'off') return;
            
            for (const message of messages) {
                await storeIncomingMessage(message);
            }
        } catch (error) {
            console.error('❌ Antidelete: Message storage error:', error.message);
        }
    });
    
    // Listen for message updates (deletions)
    sock.ev.on('messages.update', async (updates) => {
        try {
            if (antideleteState.mode === 'off') return;
            
            for (const update of updates) {
                await handleDeletedMessage(update);
            }
        } catch (error) {
            console.error('❌ Antidelete: Deletion detection error:', error.message);
        }
    });
    
    console.log('✅ Antidelete: Listeners active');
}

// Initialize system
async function initializeSystem(sock) {
    try {
        // Load existing data from JSON
        await loadData();
        
        // Set owner JID from socket
        if (sock.user?.id) {
            antideleteState.ownerJid = sock.user.id;
            console.log(`👑 Antidelete: Owner set to ${sock.user.id}`);
        }
        
        // Setup listeners if mode is not off
        if (antideleteState.mode !== 'off') {
            setupListeners(sock);
        }
        
        // Start auto-clean if enabled
        if (antideleteState.settings.autoCleanEnabled) {
            startAutoClean();
        }
        
        // Mark as initialized
        antideleteState.settings.initialized = true;
        await saveData();
        
        console.log(`🎯 Antidelete: System initialized`);
        console.log(`   Mode: ${antideleteState.mode.toUpperCase()} (Default: Private)`);
        console.log(`   Status: ${antideleteState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}`);
        console.log(`   Owner Only: ${antideleteState.settings.ownerOnly ? '✅' : '❌'}`);
        console.log(`   Auto-clean: ${antideleteState.settings.autoCleanEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`   Clean Retrieved: ${antideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`   Cached: ${antideleteState.messageCache.size} messages`);
        console.log(`   Storage: ${antideleteState.stats.totalStorageMB}MB`);
        console.log(`   Show Numbers: ${antideleteState.settings.showPhoneNumbers ? '✅' : '❌'}`);
        
    } catch (error) {
        console.error('❌ Antidelete: Initialization error:', error.message);
    }
}

// Export initialization function
export async function initAntidelete(sock) {
    await initializeSystem(sock);
}

// The command module - UPDATED TO OWNER-ONLY WITH JSON STORAGE
export default {
    name: 'antidelete',
    alias: ['undelete', 'antidel', 'ad'],
    description: 'Capture deleted messages - owner only command',
    category: 'owner',
    ownerOnly: true,
    
    async execute(sock, msg, args, prefix, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const command = args[0]?.toLowerCase() || 'status';
        
        // OWNER CHECK
        const { jidManager } = metadata || {};
        if (!jidManager || !jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can use antidelete commands.`
            }, { quoted: msg });
        }
        
        // Ensure system has socket
        if (!antideleteState.sock) {
            antideleteState.sock = sock;
            setupListeners(sock);
        }
        
        // Set owner from metadata if available
        if (!antideleteState.ownerJid && metadata.OWNER_JID) {
            antideleteState.ownerJid = metadata.OWNER_JID;
        }
        
        switch (command) {
            case 'public':
                if (!antideleteState.settings.ownerOnly) {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Public mode disabled*\n\nAntidelete is set to owner-only mode. Only private mode is available.`
                    }, { quoted: msg });
                    return;
                }
                
                antideleteState.mode = 'public';
                setupListeners(sock);
                await saveData();
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE: PUBLIC MODE*\n\nDeleted messages will be shown in the chat where they were deleted.\n\nCurrent status: ✅ ACTIVE\nStorage: ${antideleteState.stats.totalStorageMB}MB\nData Storage: JSON Format`
                }, { quoted: msg });
                break;
                
            case 'private':
            case 'on':
            case 'enable':
                antideleteState.mode = 'private';
                setupListeners(sock);
                await saveData();
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE: PRIVATE MODE*\n\nDeleted messages will be sent to your DM only.\n\nCurrent status: ✅ ACTIVE\nStorage: ${antideleteState.stats.totalStorageMB}MB\nData Storage: JSON Format\nAuto-clean: ${antideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
                antideleteState.mode = 'off';
                stopAutoClean();
                await saveData();
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE: DISABLED*\n\nSystem is now OFF. No messages will be captured or retrieved.\n\nStorage: ${antideleteState.stats.totalStorageMB}MB`
                }, { quoted: msg });
                break;
                
            case 'status':
            case 'stats':
                const statsText = `
💡 *Usage:*
• \`${prefix}antidelete private\`
• \`${prefix}antidelete public\`
• \`${prefix}antidelete off\`
`;
                
                await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                break;
                
            case 'clear':
            case 'clean':
                const cacheSize = antideleteState.messageCache.size;
                const mediaSize = antideleteState.mediaCache.size;
                
                // Clear caches
                antideleteState.messageCache.clear();
                antideleteState.mediaCache.clear();
                
                // Reset stats
                antideleteState.stats = {
                    totalMessages: 0,
                    deletedDetected: 0,
                    retrieved: 0,
                    mediaCaptured: 0,
                    sentToDm: 0,
                    sentToChat: 0,
                    cacheCleans: 0,
                    totalStorageMB: 0
                };
                
                // Delete media files
                try {
                    const files = await fs.readdir(MEDIA_DIR);
                    for (const file of files) {
                        await fs.unlink(path.join(MEDIA_DIR, file));
                    }
                } catch (error) {
                    console.error('❌ Error deleting media files:', error.message);
                }
                
                // Delete cache files
                try {
                    await fs.unlink(CACHE_FILE);
                } catch (error) {}
                
                try {
                    await fs.unlink(SETTINGS_FILE);
                } catch (error) {}
                
                // Recreate with default settings
                await saveData();
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *Cache Cleared*\n\n• Messages: ${cacheSize}\n• Media files: ${mediaSize}\n\nAll data has been cleared from JSON. Storage reset to 0MB.`
                }, { quoted: msg });
                break;
                
            case 'settings':
                const subCommand = args[1]?.toLowerCase();
                
                if (!subCommand) {
                    const settingsText = `
⚙️ *ANTIDELETE SETTINGS* (Owner Only)

Current Mode: ${antideleteState.mode.toUpperCase()}
Data Storage: JSON Format

🔧 *Configuration:*
• Auto-clean: ${antideleteState.settings.autoCleanEnabled ? '✅ ENABLED' : '❌ DISABLED'}
• Clean Retrieved: ${antideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}
• Max Age: ${antideleteState.settings.maxAgeHours} hours
• Max Storage: ${antideleteState.settings.maxStorageMB}MB
• Show Numbers: ${antideleteState.settings.showPhoneNumbers ? '✅' : '❌'}
• Owner Only: ${antideleteState.settings.ownerOnly ? '✅' : '❌'}

📊 *Usage:*
• \`${prefix}antidelete settings autoclean on/off\`
• \`${prefix}antidelete settings cleanretrieved on/off\`
• \`${prefix}antidelete settings maxage <hours>\`
• \`${prefix}antidelete settings maxstorage <MB>\`
• \`${prefix}antidelete settings shownumbers on/off\`
• \`${prefix}antidelete settings owneronly on/off\`
• \`${prefix}antidelete settings save\`

💡 Example: \`${prefix}antidelete settings cleanretrieved on\`
`;
                    await sock.sendMessage(chatId, { text: settingsText }, { quoted: msg });
                    return;
                }
                
                switch (subCommand) {
                    case 'autoclean':
                        const autocleanValue = args[2]?.toLowerCase();
                        if (autocleanValue === 'on' || autocleanValue === 'enable') {
                            antideleteState.settings.autoCleanEnabled = true;
                            startAutoClean();
                            await saveData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Auto-clean enabled. Cache will be cleaned every 24 hours.`
                            }, { quoted: msg });
                        } else if (autocleanValue === 'off' || autocleanValue === 'disable') {
                            antideleteState.settings.autoCleanEnabled = false;
                            stopAutoClean();
                            await saveData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Auto-clean disabled.`
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(chatId, {
                                text: `Usage: ${prefix}antidelete settings autoclean on/off`
                            }, { quoted: msg });
                        }
                        break;
                        
                    case 'cleanretrieved':
                        const cleanRetrievedValue = args[2]?.toLowerCase();
                        if (cleanRetrievedValue === 'on' || cleanRetrievedValue === 'enable') {
                            antideleteState.settings.autoCleanRetrieved = true;
                            await saveData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Clean retrieved messages enabled. Messages will be auto-cleaned from JSON after being sent to you.`
                            }, { quoted: msg });
                        } else if (cleanRetrievedValue === 'off' || cleanRetrievedValue === 'disable') {
                            antideleteState.settings.autoCleanRetrieved = false;
                            await saveData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Clean retrieved messages disabled.`
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(chatId, {
                                text: `Usage: ${prefix}antidelete settings cleanretrieved on/off`
                            }, { quoted: msg });
                        }
                        break;
                        
                    case 'maxage':
                        const hours = parseInt(args[2]);
                        if (isNaN(hours) || hours < 1 || hours > 720) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid hours. Use 1-720 (1 hour to 30 days).\nExample: ${prefix}antidelete settings maxage 48`
                            }, { quoted: msg });
                            return;
                        }
                        antideleteState.settings.maxAgeHours = hours;
                        await saveData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Max age set to ${hours} hours. Old cache will be cleaned automatically.`
                        }, { quoted: msg });
                        break;
                        
                    case 'maxstorage':
                        const mb = parseInt(args[2]);
                        if (isNaN(mb) || mb < 10 || mb > 5000) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid storage. Use 10-5000MB.\nExample: ${prefix}antidelete settings maxstorage 1000`
                            }, { quoted: msg });
                            return;
                        }
                        antideleteState.settings.maxStorageMB = mb;
                        await saveData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Max storage set to ${mb}MB. Force cleanup will trigger at 80% capacity.`
                        }, { quoted: msg });
                        break;
                        
                    case 'save':
                        await saveData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Settings saved successfully to JSON.`
                        }, { quoted: msg });
                        break;
                        
                    default:
                        await sock.sendMessage(chatId, {
                            text: `❌ Unknown setting. Use ${prefix}antidelete settings for options.`
                        }, { quoted: msg });
                }
                break;
                
            case 'help':
                const helpText = `
🔍 *ANTIDELETE SYSTEM* (Owner Only)

🎯 *Purpose:*
Monitor and retrieve DELETED WhatsApp messages
Optimized for memory usage with JSON storage

🚀 *Features:*
• JSON storage format (saves memory)
• Auto-clean retrieved messages
• Memory-optimized media handling
• Auto-clean every 24 hours
• Storage management with force cleanup
• Raw WhatsApp number display

🔐 *Mode:*
• **PRIVATE** - Deleted messages go to your DM only (DEFAULT)
• **PUBLIC** - Deleted messages shown in the chat
• **OFF** - System disabled

⚙️ *Commands (Owner Only):*
• \`${prefix}antidelete private\` - Enable PRIVATE mode
• \`${prefix}antidelete public\` - Enable PUBLIC mode
• \`${prefix}antidelete off\` - Disable system
• \`${prefix}antidelete stats\` - View statistics
• \`${prefix}antidelete test\` - Send test message
• \`${prefix}antidelete clear\` - Clear all data
• \`${prefix}antidelete settings\` - Configure settings
• \`${prefix}antidelete help\` - This menu

📱 *Memory Optimization:*
✅ JSON storage format
✅ Media files stored on disk only
✅ Auto-clean retrieved messages
✅ Buffer cleanup after sending
✅ Delayed media downloads

⚙️ *Settings Commands:*
• \`${prefix}antidelete settings autoclean on/off\`
• \`${prefix}antidelete settings cleanretrieved on/off\`
• \`${prefix}antidelete settings maxage <hours>\`
• \`${prefix}antidelete settings maxstorage <MB>\`

📝 *Current Status:*
Mode: ${antideleteState.mode.toUpperCase()}
Default: Private
Active: ${antideleteState.mode === 'off' ? '❌' : '✅'}
Storage: ${antideleteState.stats.totalStorageMB}MB
Clean Retrieved: ${antideleteState.settings.autoCleanRetrieved ? '✅' : '❌'}
`;
                
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `🔧 *Antidelete System* (Owner Only)\n\nCurrent Mode: ${antideleteState.mode.toUpperCase()}\nStatus: ${antideleteState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}\nStorage: ${antideleteState.stats.totalStorageMB}MB\nClean Retrieved: ${antideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}\n\n💡 Use ${prefix}antidelete help for commands`
                }, { quoted: msg });
        }
    }
};