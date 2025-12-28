// File: ./commands/utility/antideletestatus.js - UPDATED WITH JSON STORAGE & AUTO-CLEAN
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage paths
const STATUS_STORAGE_DIR = './data/antidelete/status';
const STATUS_MEDIA_DIR = path.join(STATUS_STORAGE_DIR, 'media');
const STATUS_CACHE_FILE = path.join(STATUS_STORAGE_DIR, 'status_cache.json');
const SETTINGS_FILE = path.join(STATUS_STORAGE_DIR, 'settings.json');

// Cache cleaning settings
const CACHE_CLEAN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_MEDIA_SIZE_MB = 500; // Maximum storage size

// Global state for status antidelete
let statusAntideleteState = {
    enabled: true,
    mode: 'private',
    ownerJid: null,
    sock: null,
    statusCache: new Map(), // Store status messages
    deletedStatusCache: new Map(), // Store deleted statuses
    mediaCache: new Map(),
    stats: {
        totalStatuses: 0,
        deletedDetected: 0,
        retrieved: 0,
        mediaCaptured: 0,
        sentToDm: 0,
        cacheCleans: 0,
        totalStorageMB: 0
    },
    settings: {
        autoCleanEnabled: true,
        maxAgeHours: 24,
        maxStorageMB: 500,
        ownerOnly: true,
        autoCleanRetrieved: true, // Auto-clean retrieved statuses
        initialized: false
    },
    cleanupInterval: null
};

// Status detection patterns
const STATUS_PATTERNS = {
    STATUS_JID: 'status@broadcast',
    DELETE_STUB_TYPES: {
        REVOKE: 7,
        REVOKE_EVERYONE: 8
    }
};

// Ensure directories exist
async function ensureStatusDirs() {
    try {
        await fs.mkdir(STATUS_STORAGE_DIR, { recursive: true });
        await fs.mkdir(STATUS_MEDIA_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('❌ Status Antidelete: Failed to create directories:', error.message);
        return false;
    }
}

// Load saved data from JSON
async function loadStatusData() {
    try {
        await ensureStatusDirs();
        
        // Load settings first
        if (await fs.access(SETTINGS_FILE).then(() => true).catch(() => false)) {
            const settingsData = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'));
            statusAntideleteState.settings = { ...statusAntideleteState.settings, ...settingsData };
        }
        
        if (await fs.access(STATUS_CACHE_FILE).then(() => true).catch(() => false)) {
            const data = JSON.parse(await fs.readFile(STATUS_CACHE_FILE, 'utf8'));
            
            // Restore mode from saved data if exists
            if (data.mode) {
                statusAntideleteState.mode = data.mode;
            }
            
            // Load status cache from JSON
            if (data.statusCache && Array.isArray(data.statusCache)) {
                statusAntideleteState.statusCache.clear();
                data.statusCache.forEach(([key, value]) => {
                    statusAntideleteState.statusCache.set(key, value);
                });
            }
            
            // Load deleted status cache from JSON
            if (data.deletedStatusCache && Array.isArray(data.deletedStatusCache)) {
                statusAntideleteState.deletedStatusCache.clear();
                data.deletedStatusCache.forEach(([key, value]) => {
                    statusAntideleteState.deletedStatusCache.set(key, value);
                });
            }
            
            // Load media cache from JSON (only metadata, not actual buffer)
            if (data.mediaCache && Array.isArray(data.mediaCache)) {
                statusAntideleteState.mediaCache.clear();
                data.mediaCache.forEach(([key, value]) => {
                    // Only store file path and metadata, not the actual buffer
                    statusAntideleteState.mediaCache.set(key, {
                        filePath: value.filePath,
                        type: value.type,
                        mimetype: value.mimetype,
                        size: value.size,
                        isStatus: value.isStatus,
                        savedAt: value.savedAt
                    });
                });
            }
            
            if (data.stats) {
                statusAntideleteState.stats = { ...statusAntideleteState.stats, ...data.stats };
            }
            
            console.log(`✅ Status Antidelete: Loaded ${statusAntideleteState.statusCache.size} statuses, ${statusAntideleteState.deletedStatusCache.size} deleted statuses from JSON`);
        }
        
        // Calculate total storage
        await calculateStorageSize();
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error loading JSON data:', error.message);
    }
}

// Save data to JSON
async function saveStatusData() {
    try {
        await ensureStatusDirs();
        
        // Prepare data for JSON (exclude buffers to save memory)
        const data = {
            mode: statusAntideleteState.mode,
            statusCache: Array.from(statusAntideleteState.statusCache.entries()),
            deletedStatusCache: Array.from(statusAntideleteleteState.deletedStatusCache.entries()),
            mediaCache: Array.from(statusAntideleteState.mediaCache.entries()).map(([key, value]) => {
                // Only save metadata, not the buffer
                return [key, {
                    filePath: value.filePath,
                    type: value.type,
                    mimetype: value.mimetype,
                    size: value.size,
                    isStatus: value.isStatus,
                    savedAt: value.savedAt
                }];
            }),
            stats: statusAntideleteState.stats,
            savedAt: Date.now()
        };
        
        // Write to JSON file
        await fs.writeFile(STATUS_CACHE_FILE, JSON.stringify(data, null, 2));
        
        // Save settings separately
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(statusAntideleteState.settings, null, 2));
        
        console.log(`💾 Status Antidelete: Saved data to JSON (${statusAntideleteState.statusCache.size} statuses, ${statusAntideleteState.deletedStatusCache.size} deleted)`);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error saving JSON data:', error.message);
    }
}

// Calculate total storage size
async function calculateStorageSize() {
    try {
        let totalBytes = 0;
        
        // Calculate media file sizes
        const files = await fs.readdir(STATUS_MEDIA_DIR);
        for (const file of files) {
            const filePath = path.join(STATUS_MEDIA_DIR, file);
            const stats = await fs.stat(filePath);
            totalBytes += stats.size;
        }
        
        // Add cache file size
        if (await fs.access(STATUS_CACHE_FILE).then(() => true).catch(() => false)) {
            const stats = await fs.stat(STATUS_CACHE_FILE);
            totalBytes += stats.size;
        }
        
        // Add settings file size
        if (await fs.access(SETTINGS_FILE).then(() => true).catch(() => false)) {
            const stats = await fs.stat(SETTINGS_FILE);
            totalBytes += stats.size;
        }
        
        statusAntideleteState.stats.totalStorageMB = Math.round(totalBytes / 1024 / 1024);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error calculating storage:', error.message);
    }
}

// Clean retrieved statuses from JSON (auto-clean after sending)
async function cleanRetrievedStatus(statusId) {
    try {
        if (!statusAntideleteState.settings.autoCleanRetrieved) {
            return;
        }
        
        // Remove from status cache
        statusAntideleteState.statusCache.delete(statusId);
        
        // Remove media cache entry (but keep the file for now)
        statusAntideleteState.mediaCache.delete(statusId);
        
        // Immediately save to JSON to free memory
        await saveStatusData();
        
        console.log(`🧹 Status Antidelete: Cleaned retrieved status ${statusId} from JSON`);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error cleaning retrieved status:', error.message);
    }
}

// Auto-clean old cache from JSON
async function autoCleanCache() {
    try {
        if (!statusAntideleteState.settings.autoCleanEnabled) {
            console.log('🔄 Status Antidelete: Auto-clean disabled, skipping...');
            return;
        }
        
        console.log('🧹 Status Antidelete: Starting auto-clean from JSON...');
        const now = Date.now();
        const maxAge = statusAntideleteState.settings.maxAgeHours * 60 * 60 * 1000;
        let cleanedCount = 0;
        let cleanedMedia = 0;
        
        // Clean old statuses from cache and JSON
        for (const [key, status] of statusAntideleteState.statusCache.entries()) {
            if (now - status.timestamp > maxAge) {
                statusAntideleteState.statusCache.delete(key);
                cleanedCount++;
            }
        }
        
        // Clean old deleted statuses
        for (const [key, deletedStatus] of statusAntideleteState.deletedStatusCache.entries()) {
            if (now - deletedStatus.timestamp > maxAge) {
                statusAntideleteState.deletedStatusCache.delete(key);
                cleanedCount++;
            }
        }
        
        // Clean old media files and their JSON entries
        const files = await fs.readdir(STATUS_MEDIA_DIR);
        for (const file of files) {
            const filePath = path.join(STATUS_MEDIA_DIR, file);
            const stats = await fs.stat(filePath);
            
            const fileAge = now - stats.mtimeMs;
            if (fileAge > maxAge) {
                try {
                    await fs.unlink(filePath);
                    
                    // Remove from media cache
                    for (const [key, media] of statusAntideleteState.mediaCache.entries()) {
                        if (media.filePath === filePath) {
                            statusAntideleteState.mediaCache.delete(key);
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
        if (statusAntideleteState.stats.totalStorageMB > statusAntideleteState.settings.maxStorageMB) {
            console.log(`⚠️ Status Antidelete: Storage limit reached (${statusAntideleteState.stats.totalStorageMB}MB > ${statusAntideleteState.settings.maxStorageMB}MB)`);
            // Force cleanup of oldest files
            await forceCleanup();
        }
        
        if (cleanedCount > 0 || cleanedMedia > 0) {
            statusAntideleteState.stats.cacheCleans++;
            await saveStatusData();
            console.log(`✅ Status Antidelete: Auto-clean completed. Removed ${cleanedCount} entries and ${cleanedMedia} media files from JSON.`);
        } else {
            console.log('✅ Status Antidelete: Auto-clean completed (nothing to clean).');
        }
        
    } catch (error) {
        console.error('❌ Status Antidelete: Auto-clean error:', error.message);
    }
}

// Force cleanup when storage limit reached
async function forceCleanup() {
    try {
        console.log('⚠️ Status Antidelete: Force cleanup initiated...');
        
        // Get all media files sorted by age (oldest first)
        const files = await fs.readdir(STATUS_MEDIA_DIR);
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(STATUS_MEDIA_DIR, file);
                const stats = await fs.stat(filePath);
                return { file, filePath, mtimeMs: stats.mtimeMs, size: stats.size };
            })
        );
        
        fileStats.sort((a, b) => a.mtimeMs - b.mtimeMs); // Sort by oldest first
        
        // Delete oldest files until under limit
        let deletedSize = 0;
        const targetSize = statusAntideleteState.settings.maxStorageMB * 1024 * 1024 * 0.8; // Target 80% of max
        
        for (const fileStat of fileStats) {
            if (statusAntideleteState.stats.totalStorageMB * 1024 * 1024 <= targetSize) {
                break;
            }
            
            try {
                await fs.unlink(fileStat.filePath);
                deletedSize += fileStat.size;
                
                // Remove from media cache
                for (const [key, media] of statusAntideleteState.mediaCache.entries()) {
                    if (media.filePath === fileStat.filePath) {
                        statusAntideleteState.mediaCache.delete(key);
                        break;
                    }
                }
                
                console.log(`🗑️ Force deleted: ${fileStat.file}`);
            } catch (error) {
                console.error(`❌ Could not delete ${fileStat.file}:`, error.message);
            }
        }
        
        // Clear oldest cache entries
        const cacheEntries = Array.from(statusAntideleteState.statusCache.entries());
        cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest
        
        for (let i = 0; i < Math.min(10, cacheEntries.length); i++) {
            statusAntideleteState.statusCache.delete(cacheEntries[i][0]);
        }
        
        await calculateStorageSize();
        await saveStatusData();
        
        console.log(`✅ Force cleanup completed. Freed ${Math.round(deletedSize / 1024 / 1024)}MB`);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Force cleanup error:', error.message);
    }
}

// Start auto-clean interval
function startAutoClean() {
    if (statusAntideleteState.cleanupInterval) {
        clearInterval(statusAntideleteState.cleanupInterval);
    }
    
    statusAntideleteState.cleanupInterval = setInterval(async () => {
        await autoCleanCache();
    }, CACHE_CLEAN_INTERVAL);
    
    console.log(`🔄 Status Antidelete: Auto-clean scheduled every ${CACHE_CLEAN_INTERVAL / 1000 / 60 / 60} hours`);
}

// Stop auto-clean interval
function stopAutoClean() {
    if (statusAntideleteState.cleanupInterval) {
        clearInterval(statusAntideleteState.cleanupInterval);
        statusAntideleteState.cleanupInterval = null;
        console.log('🛑 Status Antidelete: Auto-clean stopped');
    }
}

// Get file extension from mimetype for status media
function getStatusExtensionFromMime(mimetype) {
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
        'image/vnd.wap.wbmp': '.wbmp'
    };
    
    return mimeToExt[mimetype] || '.bin';
}

// Download and save status media (optimized for memory)
async function downloadAndSaveStatusMedia(msgId, message, messageType, mimetype) {
    try {
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            {
                logger: { level: 'silent' },
                reuploadRequest: statusAntideleteState.sock?.updateMediaMessage
            }
        );
        
        if (!buffer || buffer.length === 0) {
            return null;
        }
        
        // Check file size (max 10MB to prevent memory issues)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (buffer.length > maxSize) {
            console.log(`⚠️ Status Antidelete: Media too large (${Math.round(buffer.length/1024/1024)}MB), skipping...`);
            return null;
        }
        
        const timestamp = Date.now();
        const extension = getStatusExtensionFromMime(mimetype);
        const filename = `status_${messageType}_${timestamp}${extension}`;
        const filePath = path.join(STATUS_MEDIA_DIR, filename);
        
        // Write file directly to disk without storing buffer in memory
        await fs.writeFile(filePath, buffer);
        
        // Store only metadata in cache, not the buffer
        statusAntideleteState.mediaCache.set(msgId, {
            filePath: filePath,
            type: messageType,
            mimetype: mimetype,
            size: buffer.length,
            isStatus: true,
            savedAt: timestamp
        });
        
        statusAntideleteState.stats.mediaCaptured++;
        
        // Calculate storage and save to JSON immediately
        await calculateStorageSize();
        
        console.log(`📸 Status Antidelete: Saved status ${messageType} media: ${filename} (${Math.round(buffer.length/1024)}KB)`);
        return filePath;
        
    } catch (error) {
        console.error('❌ Status Antidelete: Media download error:', error.message);
        return null;
    }
}

// Check if message is a status update
function isStatusMessage(message) {
    try {
        const msgKey = message.key;
        if (!msgKey) return false;
        
        // Check if it's from status broadcast
        if (msgKey.remoteJid === STATUS_PATTERNS.STATUS_JID) {
            return true;
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

// Extract status information from message
function extractStatusInfo(message) {
    try {
        const msgKey = message.key;
        const senderJid = msgKey.participant || msgKey.remoteJid;
        const pushName = message.pushName || 'Unknown Status User';
        const timestamp = message.messageTimestamp * 1000 || Date.now();
        
        const msgContent = message.message;
        let type = 'text';
        let text = '';
        let hasMedia = false;
        let mediaInfo = null;
        let mimetype = '';
        
        if (msgContent?.imageMessage) {
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
        } else if (msgContent?.extendedTextMessage?.text) {
            type = 'text';
            text = msgContent.extendedTextMessage.text;
        } else if (msgContent?.conversation) {
            type = 'text';
            text = msgContent.conversation;
        }
        
        if (!text && !hasMedia) {
            type = 'status_update';
        }
        
        return {
            senderJid,
            pushName,
            timestamp,
            type,
            text,
            hasMedia,
            mediaInfo,
            mimetype,
            isStatus: true
        };
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error extracting status info:', error.message);
        return null;
    }
}

// Store incoming status message (optimized for memory)
async function storeStatusMessage(message) {
    try {
        if (!statusAntideleteState.sock || statusAntideleteState.mode === 'off') return;
        
        if (!isStatusMessage(message)) return;
        
        const msgKey = message.key;
        const msgId = msgKey.id;
        if (!msgId || msgKey.fromMe) return;
        
        const statusInfo = extractStatusInfo(message);
        if (!statusInfo) return;
        
        const statusData = {
            id: msgId,
            chatJid: msgKey.remoteJid,
            senderJid: statusInfo.senderJid,
            pushName: statusInfo.pushName,
            timestamp: statusInfo.timestamp,
            type: statusInfo.type,
            text: statusInfo.text || '',
            hasMedia: statusInfo.hasMedia,
            mimetype: statusInfo.mimetype,
            isStatus: true
        };
        
        // Store in cache
        statusAntideleteState.statusCache.set(msgId, statusData);
        statusAntideleteState.stats.totalStatuses++;
        
        console.log(`📱 Status Antidelete: Stored status from ${statusInfo.pushName} (${statusInfo.type})`);
        
        // Download media if present (with delay to prevent memory spikes)
        if (statusInfo.hasMedia && statusInfo.mediaInfo) {
            // Add random delay to prevent concurrent downloads
            const delay = Math.random() * 2000 + 1000; // 1-3 seconds
            setTimeout(async () => {
                try {
                    await downloadAndSaveStatusMedia(msgId, statusInfo.mediaInfo.message, statusInfo.type, statusInfo.mimetype);
                    await saveStatusData();
                } catch (error) {
                    console.error('❌ Status Antidelete: Async media download failed:', error.message);
                }
            }, delay);
        }
        
        // Save to JSON periodically (but not too often)
        if (statusAntideleteState.statusCache.size % 5 === 0) {
            await saveStatusData();
        }
        
        return statusData;
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error storing status:', error.message);
        return null;
    }
}

// Check if status is deleted
function isStatusDeleted(update) {
    try {
        const msgKey = update.key;
        if (!msgKey || !msgKey.id) return false;
        
        if (msgKey.remoteJid !== STATUS_PATTERNS.STATUS_JID) return false;
        
        const isDeleted = 
            update.message === null ||
            update.update?.status === 6 ||
            update.update?.message === null ||
            update.messageStubType === STATUS_PATTERNS.DELETE_STUB_TYPES.REVOKE ||
            update.messageStubType === STATUS_PATTERNS.DELETE_STUB_TYPES.REVOKE_EVERYONE ||
            update.messageStubParameters?.[0]?.key?.id === msgKey.id;
        
        return isDeleted;
        
    } catch (error) {
        return false;
    }
}

// Handle deleted status (with auto-clean from JSON)
async function handleDeletedStatus(update) {
    try {
        if (!statusAntideleteState.sock || statusAntideleteState.mode === 'off') return;
        
        const msgKey = update.key;
        if (!msgKey || !msgKey.id) return;
        
        const msgId = msgKey.id;
        
        if (!isStatusDeleted(update)) return;
        
        console.log(`🔍 Status Antidelete: Checking deletion for status ${msgId}`);
        
        const cachedStatus = statusAntideleteState.statusCache.get(msgId);
        if (!cachedStatus) {
            console.log(`⚠️ Status Antidelete: Status ${msgId} not found in cache`);
            return;
        }
        
        // Move to deleted cache
        statusAntideleteState.statusCache.delete(msgId);
        statusAntideleteState.deletedStatusCache.set(msgId, {
            ...cachedStatus,
            deletedAt: Date.now()
        });
        
        statusAntideleteState.stats.deletedDetected++;
        
        console.log(`🗑️ Status Antidelete: Status deleted from ${cachedStatus.pushName}`);
        
        // Send to owner DM
        if (statusAntideleteState.mode === 'private') {
            const sent = await sendStatusToOwnerDM(cachedStatus);
            if (sent) {
                statusAntideleteState.stats.sentToDm++;
                
                // Auto-clean retrieved status from JSON
                await cleanRetrievedStatus(msgId);
            }
        }
        
        statusAntideleteState.stats.retrieved++;
        
        // Save to JSON
        await saveStatusData();
        
        console.log(`✅ Status Antidelete: Retrieved deleted status from ${cachedStatus.pushName}`);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error handling deleted status:', error.message);
    }
}

// Extract raw WhatsApp number from JID
function getRawWhatsAppNumber(jid) {
    if (!jid) return 'Unknown';
    
    const numberPart = jid.split('@')[0];
    const rawNumber = numberPart.replace(/[^\d+]/g, '');
    
    if (rawNumber && !rawNumber.startsWith('+')) {
        if (rawNumber.length >= 10) {
            return `+${rawNumber}`;
        }
    }
    
    return rawNumber || numberPart || 'Unknown';
}

// Send deleted status to owner DM (optimized for memory)
async function sendStatusToOwnerDM(statusData) {
    try {
        if (!statusAntideleteState.sock || !statusAntideleteState.ownerJid) {
            console.error('❌ Status Antidelete: Socket or owner JID not set');
            return false;
        }
        
        const ownerJid = statusAntideleteState.ownerJid;
        const time = new Date(statusData.timestamp).toLocaleString();
        const senderNumber = getRawWhatsAppNumber(statusData.senderJid);
        const displayName = statusData.pushName || senderNumber;
        
        let detailsText = `🗑️ *DELETED STATUS UPDATE*\n\n`;
        detailsText += `👤 From: ${senderNumber} (${displayName})\n`;
        detailsText += `📱 Type: STATUS UPDATE\n`;
        detailsText += `🕒 Posted: ${time}\n`;
        detailsText += `📝 Content Type: ${statusData.type.toUpperCase()}\n`;
        
        if (statusData.text) {
            detailsText += `\n📋 Content:\n${statusData.text.substring(0, 500)}`;
            if (statusData.text.length > 500) detailsText += '...';
        }
        
        detailsText += `\n\n────────────\n`;
        detailsText += `🔍 *Captured by Status Antidelete*`;
        
        // Check if we have media
        const mediaCache = statusAntideleteState.mediaCache.get(statusData.id);
        
        if (statusData.hasMedia && mediaCache) {
            try {
                // Read file directly from disk when needed
                const buffer = await fs.readFile(mediaCache.filePath);
                
                if (buffer && buffer.length > 0) {
                    if (statusData.type === 'image') {
                        await statusAntideleteState.sock.sendMessage(ownerJid, {
                            image: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (statusData.type === 'video') {
                        await statusAntideleteState.sock.sendMessage(ownerJid, {
                            video: buffer,
                            caption: detailsText,
                            mimetype: mediaCache.mimetype
                        });
                    } else if (statusData.type === 'audio' || statusData.type === 'voice') {
                        await statusAntideleteState.sock.sendMessage(ownerJid, {
                            audio: buffer,
                            mimetype: mediaCache.mimetype,
                            ptt: statusData.type === 'voice'
                        });
                        await statusAntideleteState.sock.sendMessage(ownerJid, { text: detailsText });
                    } else {
                        await statusAntideleteState.sock.sendMessage(ownerJid, { text: detailsText });
                    }
                } else {
                    await statusAntideleteState.sock.sendMessage(ownerJid, { text: detailsText });
                }
            } catch (mediaError) {
                console.error('❌ Status Antidelete: Media send error:', mediaError.message);
                await statusAntideleteState.sock.sendMessage(ownerJid, { text: detailsText });
            }
        } else {
            await statusAntideleteState.sock.sendMessage(ownerJid, { text: detailsText });
        }
        
        console.log(`📤 Status Antidelete: Sent to owner DM from ${senderNumber}`);
        return true;
        
    } catch (error) {
        console.error('❌ Status Antidelete: Error sending to owner DM:', error.message);
        return false;
    }
}

// Setup listeners for status messages
function setupStatusListeners(sock) {
    if (!sock) {
        console.error('❌ Status Antidelete: No socket provided');
        return;
    }
    
    statusAntideleteState.sock = sock;
    
    console.log('🚀 Status Antidelete: Setting up listeners...');
    
    // Listen for incoming messages and check if they're statuses
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify' || statusAntideleteState.mode === 'off') return;
            
            for (const message of messages) {
                if (isStatusMessage(message)) {
                    await storeStatusMessage(message);
                }
            }
        } catch (error) {
            console.error('❌ Status Antidelete: Status storage error:', error.message);
        }
    });
    
    // Listen for message updates (deletions)
    sock.ev.on('messages.update', async (updates) => {
        try {
            if (statusAntideleteState.mode === 'off') return;
            
            for (const update of updates) {
                await handleDeletedStatus(update);
            }
        } catch (error) {
            console.error('❌ Status Antidelete: Status deletion detection error:', error.message);
        }
    });
    
    console.log('✅ Status Antidelete: Listeners active');
}

// Initialize status antidelete system
async function initializeStatusSystem(sock) {
    try {
        // Load existing data from JSON
        await loadStatusData();
        
        // Set owner JID from socket
        if (sock.user?.id) {
            statusAntideleteState.ownerJid = sock.user.id;
            console.log(`👑 Status Antidelete: Owner set to ${sock.user.id}`);
        }
        
        // Setup listeners if mode is not off
        if (statusAntideleteState.mode !== 'off') {
            setupStatusListeners(sock);
        }
        
        // Start auto-clean if enabled
        if (statusAntideleteState.settings.autoCleanEnabled) {
            startAutoClean();
        }
        
        // Mark as initialized
        statusAntideleteState.settings.initialized = true;
        await saveStatusData();
        
        console.log(`🎯 Status Antidelete: System initialized`);
        console.log(`   Mode: ${statusAntideleteState.mode.toUpperCase()}`);
        console.log(`   Status: ${statusAntideleteState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}`);
        console.log(`   Cached: ${statusAntideleteState.statusCache.size} statuses`);
        console.log(`   Storage: ${statusAntideleteState.stats.totalStorageMB}MB`);
        console.log(`   Auto-clean: ${statusAntideleteState.settings.autoCleanEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`   Clean Retrieved: ${statusAntideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}`);
        
    } catch (error) {
        console.error('❌ Status Antidelete: Initialization error:', error.message);
    }
}

// Export initialization function
export async function initStatusAntidelete(sock) {
    await initializeStatusSystem(sock);
}

// The command module - OWNER-ONLY
export default {
    name: 'antideletestatus',
    alias: ['statusantidelete', 'sad', 'ads'],
    description: 'Capture deleted status updates - owner only command',
    category: 'owner',
    ownerOnly: true,
    
    async execute(sock, msg, args, prefix, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const command = args[0]?.toLowerCase() || 'status';
        
        // OWNER CHECK
        const { jidManager } = metadata || {};
        if (!jidManager || !jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can use status antidelete commands.`
            }, { quoted: msg });
        }
        
        // Ensure system has socket
        if (!statusAntideleteState.sock) {
            statusAntideleteState.sock = sock;
        }
        
        // Set owner from metadata if available
        if (!statusAntideleteState.ownerJid && metadata.OWNER_JID) {
            statusAntideleteState.ownerJid = metadata.OWNER_JID;
        }
        
        switch (command) {
            case 'private':
            case 'on':
            case 'enable':
                statusAntideleteState.mode = 'private';
                setupStatusListeners(sock);
                
                if (statusAntideleteState.settings.autoCleanEnabled) {
                    startAutoClean();
                }
                
                await saveStatusData();
                
                await sock.sendMessage(chatId, {
                    text: `✅ *STATUS ANTIDELETE: ENABLED*\n\nMode: PRIVATE MODE\nDeleted status updates will be sent to your DM only.\n\nStorage: ${statusAntideleteState.stats.totalStorageMB}MB\nAuto-clean: ${statusAntideleteState.settings.autoCleanEnabled ? '✅ ENABLED' : '❌ DISABLED'}\nClean Retrieved: ${statusAntideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}\n\nNote: Data stored in JSON format to save memory.`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
                statusAntideleteState.mode = 'off';
                stopAutoClean();
                statusAntideleteState.sock = null;
                await saveStatusData();
                
                await sock.sendMessage(chatId, {
                    text: `✅ *STATUS ANTIDELETE: DISABLED*\n\nSystem is now OFF. No statuses will be captured or retrieved.`
                }, { quoted: msg });
                break;
                
            case 'status':
            case 'stats':
                const statsText = `
💡 *Usage:*
• \`${prefix}antideletestatus on\`
• \`${prefix}antideletestatus off\`
`;
                
                await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                break;
                
            case 'list':
                const deletedStatuses = Array.from(statusAntideleteState.deletedStatusCache.values())
                    .slice(-10)
                    .reverse();
                
                if (deletedStatuses.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `📭 *Recent Deleted Statuses*\n\nNo deleted statuses recorded yet.`
                    }, { quoted: msg });
                } else {
                    let listText = `📱 *RECENT DELETED STATUSES (Last 10)*\n\n`;
                    
                    deletedStatuses.forEach((status, index) => {
                        const time = new Date(status.timestamp).toLocaleTimeString();
                        const type = status.type.toUpperCase();
                        const preview = status.text 
                            ? status.text.substring(0, 30) + (status.text.length > 30 ? '...' : '')
                            : 'Media only';
                        const senderNumber = getRawWhatsAppNumber(status.senderJid);
                        
                        listText += `${index + 1}. ${senderNumber} [${type}]\n`;
                        listText += `   📅 ${time}\n`;
                        listText += `   📝 ${preview}\n`;
                        listText += `   👤 ${status.pushName}\n`;
                        listText += `   ─────\n`;
                    });
                    
                    listText += `\nTotal deleted statuses: ${statusAntideleteState.deletedStatusCache.size}`;
                    
                    await sock.sendMessage(chatId, { text: listText }, { quoted: msg });
                }
                break;
                
            case 'clear':
            case 'clean':
                const cacheSize = statusAntideleteState.statusCache.size;
                const deletedSize = statusAntideleteState.deletedStatusCache.size;
                const mediaSize = statusAntideleteState.mediaCache.size;
                
                // Clear caches
                statusAntideleteState.statusCache.clear();
                statusAntideleteState.deletedStatusCache.clear();
                statusAntideleteState.mediaCache.clear();
                
                // Reset stats
                statusAntideleteState.stats = {
                    totalStatuses: 0,
                    deletedDetected: 0,
                    retrieved: 0,
                    mediaCaptured: 0,
                    sentToDm: 0,
                    cacheCleans: 0,
                    totalStorageMB: 0
                };
                
                // Delete media files
                try {
                    const files = await fs.readdir(STATUS_MEDIA_DIR);
                    for (const file of files) {
                        await fs.unlink(path.join(STATUS_MEDIA_DIR, file));
                    }
                } catch (error) {
                    console.error('❌ Error deleting media files:', error.message);
                }
                
                // Delete cache files
                try {
                    await fs.unlink(STATUS_CACHE_FILE);
                } catch (error) {}
                
                try {
                    await fs.unlink(SETTINGS_FILE);
                } catch (error) {}
                
                // Recreate with default settings
                await saveStatusData();
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *Status Cache Cleared*\n\n• Statuses: ${cacheSize}\n• Deleted Statuses: ${deletedSize}\n• Media files: ${mediaSize}\n\nAll status data has been cleared from JSON. Storage reset to 0MB.`
                }, { quoted: msg });
                break;
                
            case 'settings':
                const subCommand = args[1]?.toLowerCase();
                
                if (!subCommand) {
                    const settingsText = `
⚙️ *STATUS ANTIDELETE SETTINGS* (Owner Only)

Current Mode: ${statusAntideleteState.mode.toUpperCase()}
Data Storage: JSON Format

🔧 *Configuration:*
• Auto-clean: ${statusAntideleteState.settings.autoCleanEnabled ? '✅ ENABLED' : '❌ DISABLED'}
• Clean Retrieved: ${statusAntideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}
• Max Age: ${statusAntideleteState.settings.maxAgeHours} hours
• Max Storage: ${statusAntideleteState.settings.maxStorageMB}MB
• Owner Only: ${statusAntideleteState.settings.ownerOnly ? '✅' : '❌'}

📊 *Usage:*
• \`${prefix}antideletestatus settings autoclean on/off\`
• \`${prefix}antideletestatus settings cleanretrieved on/off\`
• \`${prefix}antideletestatus settings maxage <hours>\`
• \`${prefix}antideletestatus settings maxstorage <MB>\`
• \`${prefix}antideletestatus settings save\`

💡 Example: \`${prefix}antideletestatus settings cleanretrieved on\`
`;
                    await sock.sendMessage(chatId, { text: settingsText }, { quoted: msg });
                    return;
                }
                
                switch (subCommand) {
                    case 'autoclean':
                        const autocleanValue = args[2]?.toLowerCase();
                        if (autocleanValue === 'on' || autocleanValue === 'enable') {
                            statusAntideleteState.settings.autoCleanEnabled = true;
                            startAutoClean();
                            await saveStatusData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Auto-clean enabled. Cache will be cleaned every 24 hours.`
                            }, { quoted: msg });
                        } else if (autocleanValue === 'off' || autocleanValue === 'disable') {
                            statusAntideleteState.settings.autoCleanEnabled = false;
                            stopAutoClean();
                            await saveStatusData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Auto-clean disabled.`
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(chatId, {
                                text: `Usage: ${prefix}antideletestatus settings autoclean on/off`
                            }, { quoted: msg });
                        }
                        break;
                        
                    case 'cleanretrieved':
                        const cleanRetrievedValue = args[2]?.toLowerCase();
                        if (cleanRetrievedValue === 'on' || cleanRetrievedValue === 'enable') {
                            statusAntideleteState.settings.autoCleanRetrieved = true;
                            await saveStatusData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Clean retrieved statuses enabled. Statuses will be auto-cleaned from JSON after being sent to you.`
                            }, { quoted: msg });
                        } else if (cleanRetrievedValue === 'off' || cleanRetrievedValue === 'disable') {
                            statusAntideleteState.settings.autoCleanRetrieved = false;
                            await saveStatusData();
                            await sock.sendMessage(chatId, {
                                text: `✅ Clean retrieved statuses disabled.`
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(chatId, {
                                text: `Usage: ${prefix}antideletestatus settings cleanretrieved on/off`
                            }, { quoted: msg });
                        }
                        break;
                        
                    case 'maxage':
                        const hours = parseInt(args[2]);
                        if (isNaN(hours) || hours < 1 || hours > 720) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid hours. Use 1-720 (1 hour to 30 days).\nExample: ${prefix}antideletestatus settings maxage 48`
                            }, { quoted: msg });
                            return;
                        }
                        statusAntideleteState.settings.maxAgeHours = hours;
                        await saveStatusData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Max age set to ${hours} hours. Old cache will be cleaned automatically.`
                        }, { quoted: msg });
                        break;
                        
                    case 'maxstorage':
                        const mb = parseInt(args[2]);
                        if (isNaN(mb) || mb < 10 || mb > 5000) {
                            await sock.sendMessage(chatId, {
                                text: `❌ Invalid storage. Use 10-5000MB.\nExample: ${prefix}antideletestatus settings maxstorage 1000`
                            }, { quoted: msg });
                            return;
                        }
                        statusAntideleteState.settings.maxStorageMB = mb;
                        await saveStatusData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Max storage set to ${mb}MB. Force cleanup will trigger at 80% capacity.`
                        }, { quoted: msg });
                        break;
                        
                    case 'save':
                        await saveStatusData();
                        await sock.sendMessage(chatId, {
                            text: `✅ Settings saved successfully to JSON.`
                        }, { quoted: msg });
                        break;
                        
                    default:
                        await sock.sendMessage(chatId, {
                            text: `❌ Unknown setting. Use ${prefix}antideletestatus settings for options.`
                        }, { quoted: msg });
                }
                break;
                
            case 'help':
                const helpText = `
🔍 *STATUS ANTIDELETE SYSTEM* (Owner Only)

🎯 *Purpose:*
Monitor and retrieve DELETED WhatsApp Status Updates
Optimized for memory usage with JSON storage

🚀 *Features:*
• JSON storage format (saves memory)
• Auto-clean retrieved statuses
• Memory-optimized media handling
• Auto-clean every 24 hours
• Storage management with force cleanup
• Raw WhatsApp number display

🔐 *Mode:*
• **PRIVATE ONLY** - Deleted statuses go to your DM only
• **OFF** - System disabled

⚙️ *Commands (Owner Only):*
• \`${prefix}antideletestatus on\` - Enable system
• \`${prefix}antideletestatus off\` - Disable system
• \`${prefix}antideletestatus stats\` - View statistics
• \`${prefix}antideletestatus list\` - Show recent deleted statuses
• \`${prefix}antideletestatus clear\` - Clear all data
• \`${prefix}antideletestatus settings\` - Configure settings
• \`${prefix}antideletestatus help\` - This menu

📱 *Memory Optimization:*
✅ JSON storage format
✅ Media files stored on disk only
✅ Auto-clean retrieved statuses
✅ Buffer cleanup after sending
✅ Delayed media downloads

⚙️ *Settings Commands:*
• \`${prefix}antideletestatus settings autoclean on/off\`
• \`${prefix}antideletestatus settings cleanretrieved on/off\`
• \`${prefix}antideletestatus settings maxage <hours>\`
• \`${prefix}antideletestatus settings maxstorage <MB>\`

📝 *Current Status:*
Mode: ${statusAntideleteState.mode.toUpperCase()}
Active: ${statusAntideleteState.mode === 'off' ? '❌' : '✅'}
Storage: ${statusAntideleteState.stats.totalStorageMB}MB
Clean Retrieved: ${statusAntideleteState.settings.autoCleanRetrieved ? '✅' : '❌'}
`;
                
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `📱 *Status Antidelete System* (Owner Only)\n\nCurrent Mode: ${statusAntideleteState.mode.toUpperCase()}\nStatus: ${statusAntideleteState.mode === 'off' ? '❌ INACTIVE' : '✅ ACTIVE'}\nStorage: ${statusAntideleteState.stats.totalStorageMB}MB\nClean Retrieved: ${statusAntideleteState.settings.autoCleanRetrieved ? '✅ ENABLED' : '❌ DISABLED'}\n\n💡 Use ${prefix}antideletestatus help for commands`
                }, { quoted: msg });
        }
    }
};