// ====== SILENT WOLFBOT - ULTIMATE EDITION ======
// Features: Real-time prefix changes, UltimateFix, Status Detection
// Date: 2024 | Version: 3.1.0

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';

// ====== ENVIRONMENT SETUP ======
dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====== CONFIGURATION ======
const SESSION_DIR = './session';
const BOT_NAME = process.env.BOT_NAME || 'WOLFBOT';
const VERSION = '3.1.0';
const DEFAULT_PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_SETTINGS_FILE = './bot_settings.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';

// ====== CLEAN CONSOLE SETUP ======
console.clear();

// Suppress unwanted logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('buffer timeout') || 
        message.includes('transaction failed') ||
        message.includes('failed to decrypt') ||
        message.includes('received error in ack') ||
        message.includes('sessionerror') ||
        message.includes('bad mac') ||
        message.includes('stream errored') ||
        message.includes('baileys') ||
        message.includes('whatsapp') ||
        message.includes('ws')) {
        return;
    }
    originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('fatal') || message.includes('critical')) {
        originalConsoleError.apply(console, args);
    }
};

// ====== DYNAMIC PREFIX SYSTEM (REAL-TIME & PERSISTENT) ======
let prefixCache = DEFAULT_PREFIX;
let prefixHistory = [];

function getCurrentPrefix() {
    return prefixCache;
}

function savePrefixToFile(newPrefix) {
    try {
        // Save to prefix_config.json
        const config = {
            prefix: newPrefix,
            setAt: new Date().toISOString(),
            timestamp: Date.now(),
            version: VERSION,
            previousPrefix: prefixCache
        };
        fs.writeFileSync(PREFIX_CONFIG_FILE, JSON.stringify(config, null, 2));
        
        // Also save to bot_settings.json for compatibility
        const settings = {
            prefix: newPrefix,
            prefixSetAt: new Date().toISOString(),
            prefixChangedAt: Date.now(),
            previousPrefix: prefixCache,
            version: VERSION
        };
        fs.writeFileSync(BOT_SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        console.log(chalk.magenta(`📁 Prefix saved to files`));
        return true;
    } catch (error) {
        console.log(chalk.red(`❌ Error saving prefix to file: ${error.message}`));
        return false;
    }
}

function loadPrefixFromFiles() {
    try {
        // Try prefix_config.json first
        if (fs.existsSync(PREFIX_CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
            if (config.prefix && config.prefix.trim() !== '') {
                const loadedPrefix = config.prefix.trim();
                console.log(chalk.magenta(`📁 Loaded prefix from file: "${loadedPrefix}"`));
                return loadedPrefix;
            }
        }
        
        // Try bot_settings.json
        if (fs.existsSync(BOT_SETTINGS_FILE)) {
            const settings = JSON.parse(fs.readFileSync(BOT_SETTINGS_FILE, 'utf8'));
            if (settings.prefix && settings.prefix.trim() !== '') {
                const loadedPrefix = settings.prefix.trim();
                console.log(chalk.magenta(`📁 Loaded prefix from settings: "${loadedPrefix}"`));
                return loadedPrefix;
            }
        }
        
        // Check global
        if (global.prefix && global.prefix.trim() !== '') {
            return global.prefix.trim();
        }
        
        // Check env
        if (process.env.PREFIX && process.env.PREFIX.trim() !== '') {
            return process.env.PREFIX.trim();
        }
        
    } catch (error) {
        console.log(chalk.red('Error loading prefix from files:', error.message));
    }
    
    return DEFAULT_PREFIX;
}

function updatePrefixImmediately(newPrefix) {
    const oldPrefix = prefixCache;
    
    if (!newPrefix || newPrefix.trim() === '') {
        console.log(chalk.red('❌ Cannot set empty prefix'));
        return { success: false, error: 'Empty prefix' };
    }
    
    if (newPrefix.length > 5) {
        console.log(chalk.red('❌ Prefix too long (max 5 characters)'));
        return { success: false, error: 'Prefix too long' };
    }
    
    const trimmedPrefix = newPrefix.trim();
    
    // Update memory cache
    prefixCache = trimmedPrefix;
    
    // Update global variables
    if (typeof global !== 'undefined') {
        global.prefix = trimmedPrefix;
        global.CURRENT_PREFIX = trimmedPrefix;
    }
    
    // Update environment
    process.env.PREFIX = trimmedPrefix;
    
    // Save to files for persistence
    savePrefixToFile(trimmedPrefix);
    
    // Add to history
    prefixHistory.push({
        oldPrefix,
        newPrefix: trimmedPrefix,
        timestamp: new Date().toISOString(),
        time: Date.now()
    });
    
    // Keep only last 10
    if (prefixHistory.length > 10) {
        prefixHistory = prefixHistory.slice(-10);
    }
    
    // Update terminal header
    updateTerminalHeader();
    
    console.log(chalk.magenta.bold(`⚡ Prefix changed: "${oldPrefix}" → "${trimmedPrefix}"`));
    
    return {
        success: true,
        oldPrefix,
        newPrefix: trimmedPrefix,
        timestamp: new Date().toISOString()
    };
}

function updateTerminalHeader() {
    const currentPrefix = getCurrentPrefix();
    console.clear();
    console.log(chalk.cyan(`
╔════════════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(`${BOT_NAME.toUpperCase()} ULTIMATE v${VERSION}`)}               
║   💬 Prefix  : "${currentPrefix}"
║   🔧 Auto Fix: ✅ ENABLED
║   🔄 Real-time Prefix: ✅ ENABLED
║   👁️ Status Detector: ✅ ACTIVE
╚════════════════════════════════════════════════════════╝
`));
}

// Initialize with loaded prefix
prefixCache = loadPrefixFromFiles();
updateTerminalHeader();

// ====== GLOBAL VARIABLES ======
let OWNER_NUMBER = null;
let OWNER_JID = null;
let OWNER_CLEAN_JID = null;
let OWNER_CLEAN_NUMBER = null;
let OWNER_LID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;
let store = null;
let heartbeatInterval = null;
let lastActivityTime = Date.now();
let connectionAttempts = 0;
let MAX_RETRY_ATTEMPTS = 10;
let BOT_MODE = 'public';
let WHITELIST = new Set();
let AUTO_LINK_ENABLED = true;
let AUTO_CONNECT_COMMAND_ENABLED = true;
let AUTO_ULTIMATE_FIX_ENABLED = true;
let isWaitingForPairingCode = false;
let RESTART_AUTO_FIX_ENABLED = true;
let hasSentRestartMessage = false;

// ====== UTILITY FUNCTIONS ======
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clean logging
function log(message, type = 'info') {
    const colors = {
        info: chalk.blue,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red,
        event: chalk.magenta,
        command: chalk.cyan,
        system: chalk.white,
        fix: chalk.cyan,
        connection: chalk.green,
        pairing: chalk.magenta,
        restart: chalk.magenta,
        status: chalk.cyan.bold,
        prefix: chalk.magenta.bold
    };
    
    const color = colors[type] || chalk.white;
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    originalConsoleLog(color(formatted));
}

// ====== AUTO STATUS DETECTOR ======
class StatusDetector {
    constructor() {
        this.detectionEnabled = true;
        this.statusLogs = [];
        this.lastDetection = null;
        this.setupDataDir();
        this.loadStatusLogs();
        
        log(`Status Detector initialized - ✅ ACTIVE`, 'status');
    }
    
    setupDataDir() {
        try {
            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data', { recursive: true });
            }
        } catch (error) {
            log(`Error setting up data directory: ${error.message}`, 'error');
        }
    }
    
    loadStatusLogs() {
        try {
            if (fs.existsSync('./data/status_detection_logs.json')) {
                const data = JSON.parse(fs.readFileSync('./data/status_detection_logs.json', 'utf8'));
                if (Array.isArray(data.logs)) {
                    this.statusLogs = data.logs.slice(-100);
                }
            }
        } catch (error) {
            // Silent fail
        }
    }
    
    saveStatusLogs() {
        try {
            const data = {
                logs: this.statusLogs.slice(-1000),
                updatedAt: new Date().toISOString(),
                count: this.statusLogs.length
            };
            fs.writeFileSync('./data/status_detection_logs.json', JSON.stringify(data, null, 2));
        } catch (error) {
            // Silent fail
        }
    }
    
    async detectStatusUpdate(msg) {
        try {
            if (!this.detectionEnabled) return null;
            
            const sender = msg.key.participant || 'unknown';
            const shortSender = sender.split('@')[0];
            const timestamp = msg.messageTimestamp || Date.now();
            const statusTime = new Date(timestamp * 1000).toLocaleTimeString();
            
            // Extract status information
            const statusInfo = this.extractStatusInfo(msg);
            
            // Show detection message
            this.showDetectionMessage(shortSender, statusTime, statusInfo);
            
            // Add to logs
            const logEntry = {
                sender: shortSender,
                fullSender: sender,
                type: statusInfo.type,
                caption: statusInfo.caption,
                fileInfo: statusInfo.fileInfo,
                postedAt: statusTime,
                detectedAt: new Date().toLocaleTimeString(),
                timestamp: Date.now()
            };
            
            this.statusLogs.push(logEntry);
            this.lastDetection = logEntry;
            
            // Save logs periodically
            if (this.statusLogs.length % 5 === 0) {
                this.saveStatusLogs();
            }
            
            log(`Status detected from ${shortSender}: ${statusInfo.type}`, 'status');
            
            return logEntry;
            
        } catch (error) {
            return null;
        }
    }
    
    extractStatusInfo(msg) {
        try {
            const message = msg.message;
            let type = 'unknown';
            let caption = '';
            let fileInfo = '';
            
            if (message.imageMessage) {
                type = 'image';
                caption = message.imageMessage.caption || '';
                const size = Math.round((message.imageMessage.fileLength || 0) / 1024);
                fileInfo = `🖼️ ${message.imageMessage.width}x${message.imageMessage.height} | ${size}KB`;
            } else if (message.videoMessage) {
                type = 'video';
                caption = message.videoMessage.caption || '';
                const size = Math.round((message.videoMessage.fileLength || 0) / 1024);
                const duration = message.videoMessage.seconds || 0;
                fileInfo = `🎬 ${duration}s | ${size}KB`;
            } else if (message.audioMessage) {
                type = 'audio';
                const size = Math.round((message.audioMessage.fileLength || 0) / 1024);
                const duration = message.audioMessage.seconds || 0;
                fileInfo = `🎵 ${duration}s | ${size}KB`;
            } else if (message.extendedTextMessage) {
                type = 'text';
                caption = message.extendedTextMessage.text || '';
            } else if (message.conversation) {
                type = 'text';
                caption = message.conversation;
            } else if (message.stickerMessage) {
                type = 'sticker';
                fileInfo = '🩹 Sticker';
            }
            
            return {
                type,
                caption: caption.substring(0, 100),
                fileInfo
            };
            
        } catch (error) {
            return { type: 'unknown', caption: '', fileInfo: '' };
        }
    }
    
    showDetectionMessage(sender, postedTime, statusInfo) {
        const typeEmoji = this.getTypeEmoji(statusInfo.type);
        
        console.log(chalk.magenta(`
╔════════════════════════════════════════════════════════╗
║               📱 STATUS DETECTED!                      ║
╠════════════════════════════════════════════════════════╣
║  👤 From: ${chalk.cyan(sender.padEnd(36))}║
║  🕒 Posted: ${chalk.green(postedTime.padEnd(32))}║
║  📊 Type: ${typeEmoji} ${chalk.cyan(statusInfo.type.padEnd(30))}║
╚════════════════════════════════════════════════════════╝
`));
        
        if (statusInfo.caption) {
            const captionPreview = statusInfo.caption.length > 50 
                ? statusInfo.caption.substring(0, 50) + '...' 
                : statusInfo.caption;
            console.log(chalk.cyan(`   📝 Caption: ${captionPreview}`));
        }
        
        if (statusInfo.fileInfo) {
            console.log(chalk.blue(`   📁 ${statusInfo.fileInfo}`));
        }
    }
    
    getTypeEmoji(type) {
        const emojis = {
            'image': '🖼️',
            'video': '🎬',
            'text': '📝',
            'audio': '🎵',
            'sticker': '🩹',
            'unknown': '❓'
        };
        return emojis[type] || emojis.unknown;
    }
    
    getStats() {
        return {
            totalDetected: this.statusLogs.length,
            lastDetection: this.lastDetection ? 
                `${this.lastDetection.sender} - ${this.getTimeAgo(this.lastDetection.timestamp)}` : 
                'None',
            detectionEnabled: this.detectionEnabled
        };
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
}

let statusDetector = null;

// ====== JID/LID HANDLING SYSTEM ======
class JidManager {
    constructor() {
        this.ownerJids = new Set();
        this.ownerLids = new Set();
        this.owner = null;
        this.loadOwnerData();
        this.loadWhitelist();
        
        log(`JID Manager initialized`, 'success');
    }
    
    loadOwnerData() {
        try {
            if (fs.existsSync(OWNER_FILE)) {
                const data = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
                
                const ownerJid = data.OWNER_JID;
                if (ownerJid) {
                    const cleaned = this.cleanJid(ownerJid);
                    
                    this.owner = {
                        rawJid: ownerJid,
                        cleanJid: cleaned.cleanJid,
                        cleanNumber: cleaned.cleanNumber,
                        isLid: cleaned.isLid,
                        linkedAt: data.linkedAt || new Date().toISOString()
                    };
                    
                    this.ownerJids.clear();
                    this.ownerLids.clear();
                    
                    this.ownerJids.add(cleaned.cleanJid);
                    this.ownerJids.add(ownerJid);
                    
                    if (cleaned.isLid) {
                        this.ownerLids.add(ownerJid);
                        const lidNumber = ownerJid.split('@')[0];
                        this.ownerLids.add(lidNumber);
                        OWNER_LID = ownerJid;
                    }
                    
                    OWNER_JID = ownerJid;
                    OWNER_NUMBER = cleaned.cleanNumber;
                    OWNER_CLEAN_JID = cleaned.cleanJid;
                    OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                    
                    log(`Loaded owner: ${cleaned.cleanJid}`, 'success');
                }
            }
        } catch {
            // Silent fail
        }
    }
    
    loadWhitelist() {
        try {
            if (fs.existsSync(WHITELIST_FILE)) {
                const data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
                if (data.whitelist && Array.isArray(data.whitelist)) {
                    data.whitelist.forEach(item => {
                        WHITELIST.add(item);
                    });
                }
            }
        } catch {
            // Silent fail
        }
    }
    
    cleanJid(jid) {
        if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
        const isLid = jid.includes('@lid');
        if (isLid) {
            const lidNumber = jid.split('@')[0];
            return {
                raw: jid,
                cleanJid: jid,
                cleanNumber: lidNumber,
                isLid: true
            };
        }
        
        const [numberPart] = jid.split('@')[0].split(':');
        const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
        const cleanNumber = numberPart.replace(/[^0-9]/g, '');
        const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
        const cleanJid = `${normalizedNumber}@${serverPart}`;
        
        return {
            raw: jid,
            cleanJid: cleanJid,
            cleanNumber: normalizedNumber,
            isLid: false
        };
    }
    
    isOwner(msg) {
        if (!msg || !msg.key) return false;
        
        const chatJid = msg.key.remoteJid;
        const participant = msg.key.participant;
        const senderJid = participant || chatJid;
        const cleaned = this.cleanJid(senderJid);
        
        if (!this.owner || !this.owner.cleanNumber) {
            return false;
        }
        
        // Check if sender is in owner JIDs
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
            return true;
        }
        
        // Check if sender is in owner LIDs
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) {
                return true;
            }
            
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) {
                return true;
            }
        }
        
        return false;
    }
    
    setNewOwner(newJid, isAutoLinked = false) {
        try {
            const cleaned = this.cleanJid(newJid);
            
            this.ownerJids.clear();
            this.ownerLids.clear();
            WHITELIST.clear();
            
            this.owner = {
                rawJid: newJid,
                cleanJid: cleaned.cleanJid,
                cleanNumber: cleaned.cleanNumber,
                isLid: cleaned.isLid,
                linkedAt: new Date().toISOString(),
                autoLinked: isAutoLinked
            };
            
            this.ownerJids.add(cleaned.cleanJid);
            this.ownerJids.add(newJid);
            
            if (cleaned.isLid) {
                this.ownerLids.add(newJid);
                const lidNumber = newJid.split('@')[0];
                this.ownerLids.add(lidNumber);
                OWNER_LID = newJid;
            } else {
                OWNER_LID = null;
            }
            
            OWNER_JID = newJid;
            OWNER_NUMBER = cleaned.cleanNumber;
            OWNER_CLEAN_JID = cleaned.cleanJid;
            OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            
            const ownerData = {
                OWNER_JID: newJid,
                OWNER_NUMBER: cleaned.cleanNumber,
                OWNER_CLEAN_JID: cleaned.cleanJid,
                OWNER_CLEAN_NUMBER: cleaned.cleanNumber,
                ownerLID: cleaned.isLid ? newJid : null,
                linkedAt: new Date().toISOString(),
                autoLinked: isAutoLinked,
                previousOwnerCleared: true,
                version: VERSION
            };
            
            fs.writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            
            log(`New owner set: ${cleaned.cleanJid}`, 'success');
            
            return {
                success: true,
                owner: this.owner,
                isLid: cleaned.isLid
            };
            
        } catch {
            return { success: false, error: 'Failed to set new owner' };
        }
    }
    
    getOwnerInfo() {
        return {
            ownerJid: this.owner?.cleanJid || null,
            ownerNumber: this.owner?.cleanNumber || null,
            ownerLid: OWNER_LID || null,
            jidCount: this.ownerJids.size,
            lidCount: this.ownerLids.size,
            whitelistCount: WHITELIST.size,
            isLid: this.owner?.isLid || false,
            linkedAt: this.owner?.linkedAt || null
        };
    }
}

const jidManager = new JidManager();

// ====== ULTIMATE FIX SYSTEM ======
class UltimateFixSystem {
    constructor() {
        this.fixedJids = new Set();
        this.fixApplied = false;
        this.editingMessages = new Map();
        this.restartFixAttempted = false;
    }
    
    async applyUltimateFix(sock, senderJid, cleaned, isFirstUser = false, isRestart = false) {
        try {
            const fixType = isRestart ? 'RESTART' : (isFirstUser ? 'FIRST' : 'NORMAL');
            log(`Applying Ultimate Fix (${fixType}) for: ${cleaned.cleanJid}`, 'fix');
            
            // Send initial message
            const initialMsg = await sock.sendMessage(senderJid, {
                text: `🚀 Starting ${isRestart ? 'Restart ' : ''}Ultimate Fix System...\n\n[░░░░░░░░░░░░░░░░░░░░] 0%`
            });
            
            // Simulate progress
            for (let i = 10; i <= 100; i += 10) {
                const progressBar = this.createProgressBar(i);
                const messages = [
                    'Storing original methods...',
                    'Patching isOwner method...',
                    'Adding loadOwnerDataFromFile...',
                    'Updating global variables...',
                    'Creating LID mappings...',
                    'Finalizing fix...',
                    'Ultimate Fix Complete!'
                ];
                
                const msgIndex = Math.floor(i / 15);
                const statusText = messages[msgIndex] || 'Processing...';
                
                await delay(200);
                
                try {
                    await sock.sendMessage(senderJid, {
                        text: `🚀 Applying Ultimate Fix\n\n${progressBar}\n\n${statusText}\n🔄 Progress: ${i}%`,
                        edit: initialMsg.key
                    });
                } catch {
                    // Continue if edit fails
                }
            }
            
            // Store original isOwner method
            const originalIsOwner = jidManager.isOwner;
            
            // Patch isOwner method
            jidManager.isOwner = function(message) {
                try {
                    const isFromMe = message?.key?.fromMe;
                    if (isFromMe) return true;
                    
                    if (!this.owner || !this.owner.cleanNumber) {
                        this.loadOwnerDataFromFile();
                    }
                    
                    return originalIsOwner.call(this, message);
                } catch {
                    return message?.key?.fromMe || false;
                }
            };
            
            // Add loadOwnerDataFromFile method
            jidManager.loadOwnerDataFromFile = function() {
                try {
                    if (fs.existsSync('./owner.json')) {
                        const data = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                        
                        let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
                        let cleanJid = data.OWNER_CLEAN_JID || data.OWNER_JID;
                        
                        if (cleanNumber && cleanNumber.includes(':')) {
                            cleanNumber = cleanNumber.split(':')[0];
                        }
                        
                        this.owner = {
                            cleanNumber: cleanNumber,
                            cleanJid: cleanJid,
                            rawJid: data.OWNER_JID,
                            isLid: cleanJid?.includes('@lid') || false
                        };
                        
                        return true;
                    }
                } catch {
                    // Silent fail
                }
                return false;
            };
            
            // Update global variables
            global.OWNER_NUMBER = cleaned.cleanNumber;
            global.OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            global.OWNER_JID = cleaned.cleanJid;
            global.OWNER_CLEAN_JID = cleaned.cleanJid;
            
            // Mark as fixed
            this.fixedJids.add(senderJid);
            this.fixApplied = true;
            
            // Send success message
            const currentPrefix = getCurrentPrefix();
            const fixLog = `🚀 *${isRestart ? 'RESTART ' : ''}ULTIMATE FIX COMPLETE*\n\n` +
                         `✅ Fix applied successfully!\n` +
                         `📱 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
                         `🔧 Status: ✅ FIXED\n` +
                         `👑 Owner Access: ✅ GRANTED\n` +
                         `💬 Prefix: "${currentPrefix}"\n\n` +
                         `🎉 You now have full owner access in ALL chats!\n` +
                         `💬 Try using ${currentPrefix}ping to verify.`;
            
            await sock.sendMessage(senderJid, { text: fixLog });
            
            log(`✅ Ultimate Fix applied (${fixType}): ${cleaned.cleanJid}`, 'success');
            
            return {
                success: true,
                jid: cleaned.cleanJid,
                number: cleaned.cleanNumber,
                isLid: cleaned.isLid,
                isRestart: isRestart
            };
            
        } catch (error) {
            log(`❌ Ultimate Fix failed: ${error.message}`, 'error');
            return { success: false, error: 'Fix failed' };
        }
    }
    
    createProgressBar(percentage) {
        const filledLength = Math.round(percentage / 5);
        const emptyLength = 20 - filledLength;
        const filledBar = '█'.repeat(filledLength);
        const emptyBar = '░'.repeat(emptyLength);
        return `[${filledBar}${emptyBar}]`;
    }
    
    isFixNeeded(jid) {
        return !this.fixedJids.has(jid);
    }
    
    shouldRunRestartFix(ownerJid) {
        const hasOwnerFile = fs.existsSync(OWNER_FILE);
        const isFixNeeded = this.isFixNeeded(ownerJid);
        const notAttempted = !this.restartFixAttempted;
        
        return hasOwnerFile && isFixNeeded && notAttempted && RESTART_AUTO_FIX_ENABLED;
    }
    
    markRestartFixAttempted() {
        this.restartFixAttempted = true;
    }
}

const ultimateFixSystem = new UltimateFixSystem();

// ====== AUTO-LINKING SYSTEM ======
class AutoLinkSystem {
    constructor() {
        this.linkAttempts = new Map();
        this.MAX_ATTEMPTS = 3;
    }
    
    async shouldAutoLink(sock, msg) {
        if (!AUTO_LINK_ENABLED) return false;
        
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = jidManager.cleanJid(senderJid);
        
        if (!jidManager.owner || !jidManager.owner.cleanNumber) {
            const result = await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
            if (result) {
                // Send success message
                await this.sendSuccessMessage(sock, senderJid, cleaned, true);
            }
            return result;
        }
        
        if (msg.key.fromMe) {
            return false;
        }
        
        if (jidManager.isOwner(msg)) {
            return false;
        }
        
        const currentOwnerNumber = jidManager.owner.cleanNumber;
        if (this.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
            const isDifferentDevice = !jidManager.ownerJids.has(cleaned.cleanJid);
            
            if (isDifferentDevice) {
                jidManager.ownerJids.add(cleaned.cleanJid);
                jidManager.ownerJids.add(senderJid);
                
                if (AUTO_ULTIMATE_FIX_ENABLED && ultimateFixSystem.isFixNeeded(senderJid)) {
                    setTimeout(async () => {
                        await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, false);
                    }, 1000);
                }
                
                await this.sendDeviceLinkedMessage(sock, senderJid, cleaned);
                return true;
            }
        }
        
        return false;
    }
    
    isSimilarNumber(num1, num2) {
        if (!num1 || !num2) return false;
        if (num1 === num2) return true;
        if (num1.includes(num2) || num2.includes(num1)) return true;
        
        if (num1.length >= 6 && num2.length >= 6) {
            const last6Num1 = num1.slice(-6);
            const last6Num2 = num2.slice(-6);
            return last6Num1 === last6Num2;
        }
        
        return false;
    }
    
    async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const result = jidManager.setNewOwner(senderJid, true);
            
            if (!result.success) {
                return false;
            }
            
            // Send immediate success message
            await this.sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser);
            
            if (AUTO_ULTIMATE_FIX_ENABLED) {
                setTimeout(async () => {
                    await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, isFirstUser);
                }, 1500);
            }
            
            return true;
        } catch {
            return false;
        }
    }
    
    async sendSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentTime = new Date().toLocaleTimeString();
            const currentPrefix = getCurrentPrefix();
            
            let successMsg = `✅ *AUTO-LINKING SUCCESSFUL!*\n\n`;
            
            successMsg += `📋 *Owner Information:*\n`;
            successMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
            successMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
            successMsg += `├─ JID: ${cleaned.cleanJid}\n`;
            successMsg += `├─ Prefix: "${currentPrefix}"\n`;
            successMsg += `├─ Linked: ${currentTime}\n`;
            successMsg += `└─ Status: ✅ OWNER SET SUCCESSFULLY\n\n`;
            
            successMsg += `🎉 You are now the bot owner!\n`;
            successMsg += `💬 Try using ${currentPrefix}ping to test.\n\n`;
            
            successMsg += `🔧 Ultimate Fix will run automatically in 1.5 seconds...`;
            
            await sock.sendMessage(senderJid, { text: successMsg });
            log(`✅ Success message sent to new owner: ${cleaned.cleanNumber}`, 'success');
            
        } catch (error) {
            log(`❌ Error sending success message: ${error.message}`, 'error');
        }
    }
    
    async sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentTime = new Date().toLocaleTimeString();
            const currentPrefix = getCurrentPrefix();
            
            let successMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
            
            if (isFirstUser) {
                successMsg += `🎉 *WELCOME TO WOLF TECH*\n\n`;
            } else {
                successMsg += `🔄 *NEW OWNER LINKED!*\n\n`;
            }
            
            successMsg += `✅ You have been automatically set as the bot owner!\n\n`;
            
            successMsg += `📋 *Owner Information:*\n`;
            successMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
            successMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
            successMsg += `├─ JID: ${cleaned.cleanJid}\n`;
            successMsg += `├─ Prefix: "${currentPrefix}"\n`;
            successMsg += `├─ Linked: ${currentTime}\n`;
            successMsg += `└─ Status: ✅ LINKED SUCCESSFULLY\n\n`;
            
            successMsg += `🔧 *Auto Ultimate Fix:* Initializing... (1.5s)\n\n`;
            
            if (!isFirstUser) {
                successMsg += `⚠️ *Important:*\n`;
                successMsg += `• Previous owner data has been cleared\n`;
                successMsg += `• Only YOU can use owner commands now\n\n`;
            }
            
            successMsg += `⚡ *Next:* Ultimate Fix will run automatically...`;
            
            await sock.sendMessage(senderJid, { text: successMsg });
            
        } catch {
            // Silent fail
        }
    }
    
    async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
        try {
            const message = `📱 *Device Linked!*\n\n` +
                          `✅ Your device has been added to owner devices.\n` +
                          `🔒 You can now use owner commands from this device.`;
            
            await sock.sendMessage(senderJid, { text: message });
        } catch {
            // Silent fail
        }
    }
}

const autoLinkSystem = new AutoLinkSystem();

// ====== CONNECT COMMAND HANDLER ======
async function handleConnectCommand(sock, msg, args, cleaned) {
    try {
        const chatJid = msg.key.remoteJid || cleaned.cleanJid;
        const currentTime = new Date().toLocaleTimeString();
        const currentPrefix = getCurrentPrefix();
        
        const fixApplied = ultimateFixSystem.fixApplied && ultimateFixSystem.fixedJids.has(chatJid);
        
        let connectMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
        connectMsg += `🔌 *CONNECTION ESTABLISHED!*\n\n`;
        
        connectMsg += `📋 *Owner Information:*\n`;
        connectMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
        connectMsg += `├─ Device Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
        connectMsg += `├─ Prefix: "${currentPrefix}"\n`;
        connectMsg += `├─ Connected: ${currentTime}\n`;
        connectMsg += `└─ Ultimate Fix: ${fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n\n`;
        
        const ownerInfo = jidManager.getOwnerInfo();
        connectMsg += `🔗 *Connection Details:*\n`;
        connectMsg += `├─ Status: ✅ Connected\n`;
        connectMsg += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
        connectMsg += `├─ Known LIDs: ${ownerInfo.lidCount}\n`;
        connectMsg += `└─ Uptime: ${Math.floor(process.uptime()/60)} minutes\n\n`;
        
        if (statusDetector) {
            const stats = statusDetector.getStats();
            connectMsg += `👁️ *Status Detector:* ✅ ACTIVE\n`;
            connectMsg += `📊 Detected: ${stats.totalDetected} statuses\n`;
            connectMsg += `🕒 Last: ${stats.lastDetection}\n\n`;
        }
        
        if (!fixApplied) {
            connectMsg += `⚠️ *Recommendation:*\n`;
            connectMsg += `Use ${currentPrefix}ultimatefix to ensure owner access.\n\n`;
        }
        
        connectMsg += `📚 Use *${currentPrefix}menu* to see commands.`;
        
        await sock.sendMessage(chatJid, { text: connectMsg });
        
        console.log(chalk.green(`✅ Connect command from ${cleaned.cleanNumber}`));
        
        return true;
    } catch {
        return false;
    }
}

// ====== HELPER FUNCTIONS ======
function isUserBlocked(jid) {
    try {
        if (fs.existsSync(BLOCKED_USERS_FILE)) {
            const data = JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8'));
            return data.users && data.users.includes(jid);
        }
    } catch {
        return false;
    }
    return false;
}

function checkBotMode(msg, commandName) {
    try {
        if (jidManager.isOwner(msg)) {
            return true;
        }
        
        if (fs.existsSync(BOT_MODE_FILE)) {
            const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8'));
            BOT_MODE = modeData.mode || 'public';
        } else {
            BOT_MODE = 'public';
        }
        
        const chatJid = msg.key.remoteJid;
        
        switch(BOT_MODE) {
            case 'public':
                return true;
            case 'private':
                return false;
            case 'silent':
                return false;
            case 'group-only':
                return chatJid.includes('@g.us');
            case 'maintenance':
                const allowedCommands = ['ping', 'status', 'uptime', 'help'];
                return allowedCommands.includes(commandName);
            default:
                return true;
        }
    } catch {
        return true;
    }
}

function startHeartbeat(sock) {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    
    heartbeatInterval = setInterval(async () => {
        if (isConnected && sock) {
            try {
                await sock.sendPresenceUpdate('available');
                lastActivityTime = Date.now();
            } catch {
                // Silent fail
            }
        }
    }, 60 * 1000);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function ensureSessionDir() {
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
    }
}

function cleanSession() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
        return true;
    } catch {
        return false;
    }
}

class MessageStore {
    constructor() {
        this.messages = new Map();
        this.maxMessages = 100;
    }
    
    addMessage(jid, messageId, message) {
        try {
            const key = `${jid}|${messageId}`;
            this.messages.set(key, {
                ...message,
                timestamp: Date.now()
            });
            
            if (this.messages.size > this.maxMessages) {
                const oldestKey = this.messages.keys().next().value;
                this.messages.delete(oldestKey);
            }
        } catch {
            // Silent fail
        }
    }
    
    getMessage(jid, messageId) {
        try {
            const key = `${jid}|${messageId}`;
            return this.messages.get(key) || null;
        } catch {
            return null;
        }
    }
}

const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    
    if (!fs.existsSync(absolutePath)) {
        return;
    }
    
    try {
        const items = fs.readdirSync(absolutePath);
        let categoryCount = 0;
        
        for (const item of items) {
            const fullPath = path.join(absolutePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                await loadCommandsFromFolder(fullPath, item);
            } else if (item.endsWith('.js')) {
                try {
                    if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
                    const commandModule = await import(`file://${fullPath}`);
                    const command = commandModule.default || commandModule;
                    
                    if (command && command.name) {
                        command.category = category;
                        commands.set(command.name.toLowerCase(), command);
                        
                        if (!commandCategories.has(category)) {
                            commandCategories.set(category, []);
                        }
                        commandCategories.get(category).push(command.name);
                        
                        log(`[${category}] Loaded: ${command.name}`, 'success');
                        categoryCount++;
                        
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                            });
                        }
                    }
                } catch {
                    // Silent fail
                }
            }
        }
        
        if (categoryCount > 0) {
            log(`${categoryCount} commands loaded from ${category}`, 'info');
        }
    } catch {
        // Silent fail
    }
}

// ====== LOGIN MANAGER ======
class LoginManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    async selectMode() {
        console.log(chalk.yellow('\n🐺 WOLFBOT - LOGIN SYSTEM'));
        console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
        const choice = await this.ask('Choose option (1-2, default 1): ');
        
        switch (choice.trim()) {
            case '1':
                return await this.pairingCodeMode();
            case '2':
                return await this.cleanStartMode();
            default:
                return await this.pairingCodeMode();
        }
    }
    
    async pairingCodeMode() {
        console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
        console.log(chalk.gray('Enter phone number with country code (without +)'));
        console.log(chalk.gray('Example: 254788710904'));
        
        const phone = await this.ask('Phone number: ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        
        if (!cleanPhone || cleanPhone.length < 10) {
            console.log(chalk.red('❌ Invalid phone number'));
            return await this.selectMode();
        }
        
        return { mode: 'pair', phone: cleanPhone };
    }
    
    async cleanStartMode() {
        console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
        console.log(chalk.red('This will delete all session data!'));
        
        const confirm = await this.ask('Are you sure? (y/n): ');
        
        if (confirm.toLowerCase() === 'y') {
            cleanSession();
            console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
            return await this.pairingCodeMode();
        } else {
            return await this.pairingCodeMode();
        }
    }
    
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow(question), (answer) => {
                resolve(answer);
            });
        });
    }
    
    close() {
        if (this.rl) this.rl.close();
    }
}

// ====== MAIN BOT FUNCTION ======
async function startBot(loginMode = 'pair', phoneNumber = null) {
    try {
        log('Initializing WhatsApp connection...', 'info');
        
        // Load commands
        commands.clear();
        commandCategories.clear();
        await loadCommandsFromFolder('./commands');
        log(`Loaded ${commands.size} commands`, 'success');
        
        store = new MessageStore();
        ensureSessionDir();
        
        // Initialize Status Detector
        statusDetector = new StatusDetector();
        
        const { default: makeWASocket } = await import('@whiskeysockets/baileys');
        const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
        const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
        // Silent logger
        const silentLogger = {
            level: 'silent',
            trace: () => {},
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            fatal: () => {},
            child: () => silentLogger
        };
        
        let state, saveCreds;
        try {
            const authState = await useMultiFileAuthState(SESSION_DIR);
            state = authState.state;
            saveCreds = authState.saveCreds;
        } catch {
            cleanSession();
            const freshAuth = await useMultiFileAuthState(SESSION_DIR);
            state = freshAuth.state;
            saveCreds = freshAuth.saveCreds;
        }
        
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: silentLogger,
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 20000,
            emitOwnEvents: true,
            mobile: false,
            getMessage: async (key) => {
                return store?.getMessage(key.remoteJid, key.id) || null;
            },
            defaultQueryTimeoutMs: 30000
        });
        
        SOCKET_INSTANCE = sock;
        connectionAttempts = 0;
        isWaitingForPairingCode = false;
        
        // Connection handler
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                isConnected = true;
                startHeartbeat(sock);
                await handleSuccessfulConnection(sock, loginMode, phoneNumber);
                isWaitingForPairingCode = false;
                
                // Reset restart message flag
                hasSentRestartMessage = false;
                
                // Trigger restart fix
                await triggerRestartAutoFix(sock);
            }
            
            if (connection === 'close') {
                isConnected = false;
                stopHeartbeat();
                
                // Save status detector data
                if (statusDetector) {
                    statusDetector.saveStatusLogs();
                }
                
                await handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber);
                isWaitingForPairingCode = false;
            }
            
            // Pairing code logic
            if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
                if (!isWaitingForPairingCode) {
                    isWaitingForPairingCode = true;
                    
                    console.log(chalk.cyan('\n📱 CONNECTING TO WHATSAPP...'));
                    console.log(chalk.yellow('Requesting 8-digit pairing code...'));
                    
                    const requestPairingCode = async (attempt = 1) => {
                        try {
                            const code = await sock.requestPairingCode(phoneNumber);
                            const cleanCode = code.replace(/\s+/g, '');
                            let formattedCode = cleanCode;
                            
                            if (cleanCode.length === 8) {
                                formattedCode = `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}`;
                            }
                            
                            console.clear();
                            console.log(chalk.greenBright(`
╔════════════════════════════════════════════════╗
║              🔗 PAIRING CODE                   ║
╠════════════════════════════════════════════════╣
║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
║ 📏 Length: ${chalk.cyan('8 characters'.padEnd(27))}║
║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
╚════════════════════════════════════════════════╝
`));
                            
                            console.log(chalk.cyan('\n📱 INSTRUCTIONS:'));
                            console.log(chalk.white('1. Open WhatsApp on your phone'));
                            console.log(chalk.white('2. Go to Settings → Linked Devices'));
                            console.log(chalk.white('3. Tap "Link a Device"'));
                            console.log(chalk.white('4. Enter this 8-digit code:'));
                            console.log(chalk.yellow.bold(`   ${formattedCode}`));
                            
                        } catch (error) {
                            if (attempt < 3) {
                                await delay(5000);
                                await requestPairingCode(attempt + 1);
                            } else {
                                console.log(chalk.red('❌ Max retries reached. Restarting...'));
                                setTimeout(async () => {
                                    await startBot(loginMode, phoneNumber);
                                }, 10000);
                            }
                        }
                    };
                    
                    setTimeout(() => {
                        requestPairingCode(1);
                    }, 3000);
                }
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Message handler
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            const msg = messages[0];
            if (!msg.message) return;
            
            lastActivityTime = Date.now();
            
            // Handle status detection
            if (msg.key?.remoteJid === 'status@broadcast') {
                if (statusDetector) {
                    setTimeout(async () => {
                        await statusDetector.detectStatusUpdate(msg);
                    }, 300);
                }
                return;
            }
            
            const messageId = msg.key.id;
            
            if (store) {
                store.addMessage(msg.key.remoteJid, messageId, {
                    message: msg.message,
                    key: msg.key,
                    timestamp: Date.now()
                });
            }
            
            await handleIncomingMessage(sock, msg);
        });
        
        return sock;
        
    } catch (error) {
        console.log(chalk.red('❌ Connection failed, retrying in 10 seconds...'));
        setTimeout(async () => {
            await startBot(loginMode, phoneNumber);
        }, 10000);
    }
}

// ====== RESTART AUTO-FIX TRIGGER ======
async function triggerRestartAutoFix(sock) {
    try {
        if (fs.existsSync(OWNER_FILE) && sock.user?.id) {
            const ownerJid = sock.user.id;
            const cleaned = jidManager.cleanJid(ownerJid);
            
            // Always send restart message (unless already sent)
            if (!hasSentRestartMessage) {
                const currentPrefix = getCurrentPrefix();
                const restartMsg = `🔄 *BOT RESTARTED SUCCESSFULLY!*\n\n` +
                                 `✅ *WOLFBOT v${VERSION}* is now online\n` +
                                 `👑 Owner: +${cleaned.cleanNumber}\n` +
                                 `💬 Prefix: "${currentPrefix}"\n` +
                                 `👁️ Status Detector: ✅ ACTIVE\n\n` +
                                 `🎉 All features are ready!\n` +
                                 `💬 Try using ${currentPrefix}ping to verify.`;
                
                await sock.sendMessage(ownerJid, { text: restartMsg });
                hasSentRestartMessage = true;
                log(`✅ Restart message sent to owner`, 'success');
            }
            
            if (ultimateFixSystem.shouldRunRestartFix(ownerJid)) {
                log(`🔄 Triggering restart auto-fix for: ${ownerJid}`, 'restart');
                
                ultimateFixSystem.markRestartFixAttempted();
                await delay(2000);
                
                const fixResult = await ultimateFixSystem.applyUltimateFix(sock, ownerJid, cleaned, false, true);
                
                if (fixResult.success) {
                    log(`✅ Restart auto-fix completed`, 'success');
                }
            }
        }
    } catch (error) {
        log(`⚠️ Restart auto-fix error: ${error.message}`, 'warning');
    }
}

// ====== CONNECTION HANDLERS ======
async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
    const currentTime = new Date().toLocaleTimeString();
    
    OWNER_JID = sock.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    
    const isFirstConnection = !fs.existsSync(OWNER_FILE);
    
    if (isFirstConnection) {
        jidManager.setNewOwner(OWNER_JID, false);
    } else {
        jidManager.loadOwnerData();
    }
    
    const ownerInfo = jidManager.getOwnerInfo();
    const currentPrefix = getCurrentPrefix();
    
    // Update terminal
    updateTerminalHeader();
    
    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('WOLFBOT ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${ownerInfo.ownerNumber}
║  🔧 Clean JID : ${ownerInfo.ownerJid}
║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  💬 Prefix : "${currentPrefix}"
║  🎛️ Mode   : ${BOT_MODE}
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
║  📊 Commands: ${commands.size} commands loaded
║  🔧 AUTO ULTIMATE FIX : ✅ ENABLED
║  👁️ STATUS DETECTOR  : ✅ ACTIVE
╚════════════════════════════════════════════════════════╝
`));
    
    if (isFirstConnection) {
        try {
            await sock.sendMessage(OWNER_JID, {
                text: `✅ *BOT STARTED*\n\nPrefix: "${currentPrefix}"\nSend any message to begin.`
            });
        } catch {
            // Silent fail
        }
    }
}

async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const isConflict = statusCode === 409;
    
    connectionAttempts++;
    
    if (isConflict) {
        const conflictDelay = 30000;
        
        console.log(chalk.yellow(`\n⚠️ Device conflict detected. Reconnecting in 30 seconds...`));
        
        setTimeout(async () => {
            await startBot(loginMode, phoneNumber);
        }, conflictDelay);
        return;
    }
    
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
        cleanSession();
    }
    
    const baseDelay = 5000;
    const maxDelay = 60000;
    const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
    setTimeout(async () => {
        if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
            connectionAttempts = 0;
            process.exit(1);
        } else {
            await startBot(loginMode, phoneNumber);
        }
    }, delayTime);
}

// ====== MESSAGE HANDLER ======
async function handleIncomingMessage(sock, msg) {
    try {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        
        // Check auto-linking BEFORE processing message
        const linked = await autoLinkSystem.shouldAutoLink(sock, msg);
        
        if (isUserBlocked(senderJid)) {
            return;
        }
        
        const textMsg = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || 
                       msg.message.videoMessage?.caption || '';
        
        if (!textMsg) return;
        
        // CRITICAL: Get current prefix dynamically
        const currentPrefix = getCurrentPrefix();
        
        if (textMsg.startsWith(currentPrefix)) {
            const parts = textMsg.slice(currentPrefix.length).trim().split(/\s+/);
            const commandName = parts[0].toLowerCase();
            const args = parts.slice(1);
            
            log(`${chatId.split('@')[0]} → ${currentPrefix}${commandName}`, 'command');
            
            if (!checkBotMode(msg, commandName)) {
                if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
                    return;
                }
                try {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.`
                    });
                } catch {
                    // Silent fail
                }
                return;
            }
            
            if (commandName === 'connect' || commandName === 'link') {
                const cleaned = jidManager.cleanJid(senderJid);
                await handleConnectCommand(sock, msg, args, cleaned);
                return;
            }
            
            const command = commands.get(commandName);
            if (command) {
                try {
                    if (command.ownerOnly && !jidManager.isOwner(msg)) {
                        try {
                            await sock.sendMessage(chatId, { 
                                text: '❌ *Owner Only Command*'
                            });
                        } catch {
                            // Silent fail
                        }
                        return;
                    }
                    
                    // Pass the updatePrefixImmediately function to commands
                    await command.execute(sock, msg, args, currentPrefix, {
                        OWNER_NUMBER: OWNER_CLEAN_NUMBER,
                        OWNER_JID: OWNER_CLEAN_JID,
                        OWNER_LID: OWNER_LID,
                        BOT_NAME,
                        VERSION,
                        isOwner: () => jidManager.isOwner(msg),
                        jidManager,
                        store,
                        statusDetector: statusDetector,
                        updatePrefix: updatePrefixImmediately, // Pass function to update prefix
                        getCurrentPrefix: getCurrentPrefix // Pass function to get prefix
                    });
                } catch {
                    // Silent fail
                }
            } else {
                await handleDefaultCommands(commandName, sock, msg, args, currentPrefix);
            }
        }
    } catch {
        // Silent fail
    }
}

// ====== DEFAULT COMMANDS ======
async function handleDefaultCommands(commandName, sock, msg, args, currentPrefix) {
    const chatId = msg.key.remoteJid;
    const isOwnerUser = jidManager.isOwner(msg);
    const ownerInfo = jidManager.getOwnerInfo();
    
    try {
        switch (commandName) {
            case 'ping':
                const start = Date.now();
                const latency = Date.now() - start;
                
                let statusInfo = '';
                if (statusDetector) {
                    const stats = statusDetector.getStats();
                    statusInfo = `👁️ Status Detector: ✅ ACTIVE\n`;
                    statusInfo += `📊 Detected: ${stats.totalDetected} statuses\n`;
                }
                
                await sock.sendMessage(chatId, { 
                    text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${currentPrefix}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\n${statusInfo}Status: Connected ✅`
                }, { quoted: msg });
                break;
                
            case 'help':
                let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
                helpText += `Prefix: "${currentPrefix}"\n`;
                helpText += `Mode: ${BOT_MODE}\n`;
                helpText += `Commands: ${commands.size}\n\n`;
                
                helpText += `*STATUS DETECTOR*\n`;
                helpText += `${currentPrefix}statusstats - Show status detection stats\n\n`;
                
                helpText += `*PREFIX MANAGEMENT*\n`;
                helpText += `${currentPrefix}setprefix <new_prefix> - Change prefix (persistent)\n`;
                helpText += `${currentPrefix}prefixinfo - Show prefix information\n\n`;
                
                for (const [category, cmds] of commandCategories.entries()) {
                    helpText += `*${category.toUpperCase()}*\n`;
                    helpText += `${cmds.slice(0, 6).join(', ')}`;
                    if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
                    helpText += '\n\n';
                }
                
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            case 'uptime':
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                
                let statusDetectorInfo = '';
                if (statusDetector) {
                    const stats = statusDetector.getStats();
                    statusDetectorInfo = `👁️ Status Detector: ✅ ACTIVE\n`;
                    statusDetectorInfo += `📊 Detected: ${stats.totalDetected} statuses\n`;
                    statusDetectorInfo += `🕒 Last: ${stats.lastDetection}\n`;
                }
                
                await sock.sendMessage(chatId, {
                    text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${currentPrefix}"\n🎛️ Mode: ${BOT_MODE}\n${statusDetectorInfo}`
                }, { quoted: msg });
                break;
                
            case 'statusstats':
                if (statusDetector) {
                    const stats = statusDetector.getStats();
                    const recent = statusDetector.statusLogs.slice(-3).reverse();
                    
                    let statsText = `📊 *STATUS DETECTION STATS*\n\n`;
                    statsText += `🔍 Status: ✅ ACTIVE\n`;
                    statsText += `📈 Total detected: ${stats.totalDetected}\n`;
                    statsText += `🕒 Last detection: ${stats.lastDetection}\n\n`;
                    
                    if (recent.length > 0) {
                        statsText += `📱 *Recent Statuses:*\n`;
                        recent.forEach((status, index) => {
                            statsText += `${index + 1}. ${status.sender}: ${status.type} (${new Date(status.timestamp).toLocaleTimeString()})\n`;
                        });
                    }
                    
                    await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: '❌ Status detector not initialized.'
                    }, { quoted: msg });
                }
                break;
                
            case 'ultimatefix':
            case 'solveowner':
            case 'fixall':
                const fixSenderJid = msg.key.participant || chatId;
                const fixCleaned = jidManager.cleanJid(fixSenderJid);
                
                if (!jidManager.isOwner(msg) && !msg.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *Owner Only Command*'
                    }, { quoted: msg });
                    return;
                }
                
                const fixResult = await ultimateFixSystem.applyUltimateFix(sock, fixSenderJid, fixCleaned, false);
                
                if (fixResult.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *ULTIMATE FIX APPLIED*\n\nYou should now have full owner access!`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Ultimate Fix Failed*`
                    }, { quoted: msg });
                }
                break;
                
            case 'prefixinfo':
                const prefixFiles = {
                    'bot_settings.json': fs.existsSync('./bot_settings.json'),
                    'prefix_config.json': fs.existsSync('./prefix_config.json')
                };
                
                let infoText = `⚡ *PREFIX INFORMATION*\n\n`;
                infoText += `📝 Current Prefix: *${currentPrefix}*\n`;
                infoText += `⚙️ Default Prefix: ${DEFAULT_PREFIX}\n`;
                infoText += `🌐 Global Prefix: ${global.prefix || 'Not set'}\n`;
                infoText += `📁 ENV Prefix: ${process.env.PREFIX || 'Not set'}\n\n`;
                
                infoText += `📋 *File Status:*\n`;
                for (const [fileName, exists] of Object.entries(prefixFiles)) {
                    infoText += `├─ ${fileName}: ${exists ? '✅' : '❌'}\n`;
                }
                
                infoText += `\n💡 *Changes are saved and persist after restart!*`;
                
                await sock.sendMessage(chatId, { text: infoText }, { quoted: msg });
                break;
        }
    } catch {
        // Silent fail
    }
}

// ====== MAIN APPLICATION ======
async function main() {
    try {
        log('Starting WOLFBOT ULTIMATE EDITION v3.1.0...', 'info');
        log(`Loaded prefix: "${getCurrentPrefix()}"`, 'prefix');
        
        const loginManager = new LoginManager();
        const { mode, phone } = await loginManager.selectMode();
        loginManager.close();
        
        await startBot(mode, phone);
        
    } catch {
        setTimeout(async () => {
            await main();
        }, 10000);
    }
}

// ====== PROCESS HANDLERS ======
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down...'));
    
    if (statusDetector) {
        statusDetector.saveStatusLogs();
    }
    
    stopHeartbeat();
    if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
    process.exit(0);
});

process.on('uncaughtException', () => {
    return;
});

process.on('unhandledRejection', () => {
    return;
});

// Start the bot
main().catch(() => {
    process.exit(1);
});

// Activity monitor
setInterval(() => {
    const now = Date.now();
    const inactivityThreshold = 5 * 60 * 1000;
    
    if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
        if (SOCKET_INSTANCE) {
            SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
        }
    }
}, 60000);