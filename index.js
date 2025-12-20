



// // // ====== SILENT WOLF BOT - RESTART FIX VERSION ======
// // // Fixes Ultimate Fix not running on restart

// // import { fileURLToPath } from 'url';
// // import { dirname } from 'path';
// // import fs from 'fs';
// // import path from 'path';
// // import dotenv from 'dotenv';
// // import chalk from 'chalk';
// // import readline from 'readline';

// // // ====== ENVIRONMENT SETUP ======
// // dotenv.config({ path: './.env' });

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = dirname(__filename);

// // // ====== CONFIGURATION ======
// // const SESSION_DIR = './session';
// // const BOT_NAME = process.env.BOT_NAME || 'WOLFBOT';
// // const VERSION = '1.0.0'; // Restart fix version
// // const PREFIX = process.env.PREFIX || '.';
// // const OWNER_FILE = './owner.json';
// // const PREFIX_CONFIG_FILE = './prefix_config.json';
// // const BOT_MODE_FILE = './bot_mode.json';
// // const WHITELIST_FILE = './whitelist.json';
// // const BLOCKED_USERS_FILE = './blocked_users.json';

// // // ====== CLEAN CONSOLE SETUP ======
// // console.clear();

// // // Suppress unwanted logs but allow important ones
// // const originalConsoleLog = console.log;
// // const originalConsoleError = console.error;

// // console.log = function(...args) {
// //     const message = args.join(' ').toLowerCase();
    
// //     // Suppress only specific noise, allow pairing codes
// //     if (message.includes('buffer timeout') || 
// //         message.includes('transaction failed') ||
// //         message.includes('failed to decrypt') ||
// //         message.includes('received error in ack') ||
// //         message.includes('sessionerror') ||
// //         message.includes('bad mac') ||
// //         message.includes('stream errored') ||
// //         message.includes('baileys') ||
// //         message.includes('whatsapp') ||
// //         message.includes('ws')) {
// //         return;
// //     }
    
// //     // Allow our formatted logs and pairing codes
// //     originalConsoleLog.apply(console, args);
// // };

// // console.error = function(...args) {
// //     const message = args.join(' ').toLowerCase();
    
// //     // Only show critical errors
// //     if (message.includes('fatal') || message.includes('critical')) {
// //         originalConsoleError.apply(console, args);
// //     }
// // };

// // // Global variables
// // let OWNER_NUMBER = null;
// // let OWNER_JID = null;
// // let OWNER_CLEAN_JID = null;
// // let OWNER_CLEAN_NUMBER = null;
// // let OWNER_LID = null;
// // let SOCKET_INSTANCE = null;
// // let isConnected = false;
// // let store = null;
// // let heartbeatInterval = null;
// // let lastActivityTime = Date.now();
// // let connectionAttempts = 0;
// // let MAX_RETRY_ATTEMPTS = 10;
// // let CURRENT_PREFIX = PREFIX;
// // let BOT_MODE = 'public';
// // let WHITELIST = new Set();
// // let AUTO_LINK_ENABLED = true;
// // let AUTO_CONNECT_COMMAND_ENABLED = true;
// // let AUTO_ULTIMATE_FIX_ENABLED = true;
// // let isWaitingForPairingCode = false;
// // let RESTART_AUTO_FIX_ENABLED = true; // NEW: Enable auto fix on restart

// // // ====== CLEAN TERMINAL HEADER ======
// // console.log(chalk.cyan(`
// // ╔════════════════════════════════════════════════╗
// // ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('RESTART FIX')}  
// // ║   ⚙️ Version : ${VERSION}
// // ║   💬 Prefix  : "${PREFIX}"
// // ║   🔧 Auto Fix: ✅ ENABLED
// // ║   🔄 Restart Fix: ✅ ENABLED
// // ╚════════════════════════════════════════════════╝
// // `));

// // // ====== UTILITY FUNCTIONS ======
// // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // // Clean logging
// // function log(message, type = 'info') {
// //     const colors = {
// //         info: chalk.blue,
// //         success: chalk.green,
// //         warning: chalk.yellow,
// //         error: chalk.red,
// //         event: chalk.magenta,
// //         command: chalk.cyan,
// //         system: chalk.white,
// //         fix: chalk.cyan,
// //         connection: chalk.green,
// //         pairing: chalk.magenta,
// //         restart: chalk.magenta
// //     };
    
// //     const color = colors[type] || chalk.white;
// //     const timestamp = new Date().toLocaleTimeString();
// //     const formatted = `[${timestamp}] ${message}`;
// //     originalConsoleLog(color(formatted));
// // }

// // // ====== HELPER FUNCTIONS ======
// // function existsSync(path) {
// //     try {
// //         return fs.existsSync(path);
// //     } catch {
// //         return false;
// //     }
// // }

// // function readFileSync(path, encoding = 'utf8') {
// //     try {
// //         return fs.readFileSync(path, encoding);
// //     } catch {
// //         return '';
// //     }
// // }

// // function writeFileSync(path, data) {
// //     try {
// //         return fs.writeFileSync(path, data);
// //     } catch {
// //         return;
// //     }
// // }

// // // ====== JID/LID HANDLING SYSTEM ======
// // class JidManager {
// //     constructor() {
// //         this.ownerJids = new Set();
// //         this.ownerLids = new Set();
// //         this.owner = null;
// //         this.ownerFileData = {};
// //         this.originalIsOwner = null;
        
// //         this.loadOwnerData();
// //         this.loadWhitelist();
        
// //         log(`JID Manager initialized. Current owner: ${this.owner?.cleanNumber || 'None'}`, 'success');
// //     }
    
// //     loadOwnerData() {
// //         try {
// //             if (existsSync(OWNER_FILE)) {
// //                 this.ownerFileData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
// //                 const ownerJid = this.ownerFileData.OWNER_JID;
// //                 const ownerNumber = this.ownerFileData.OWNER_NUMBER;
                
// //                 if (ownerJid) {
// //                     const cleaned = this.cleanJid(ownerJid);
                    
// //                     this.owner = {
// //                         rawJid: ownerJid,
// //                         cleanJid: cleaned.cleanJid,
// //                         cleanNumber: cleaned.cleanNumber,
// //                         isLid: cleaned.isLid,
// //                         linkedAt: this.ownerFileData.linkedAt || new Date().toISOString()
// //                     };
                    
// //                     this.ownerJids.clear();
// //                     this.ownerLids.clear();
                    
// //                     this.ownerJids.add(cleaned.cleanJid);
// //                     this.ownerJids.add(ownerJid);
                    
// //                     if (cleaned.isLid) {
// //                         this.ownerLids.add(ownerJid);
// //                         const lidNumber = ownerJid.split('@')[0];
// //                         this.ownerLids.add(lidNumber);
// //                         OWNER_LID = ownerJid;
// //                     }
                    
// //                     if (this.ownerFileData.verifiedLIDs && Array.isArray(this.ownerFileData.verifiedLIDs)) {
// //                         this.ownerFileData.verifiedLIDs.forEach(lid => {
// //                             if (lid && lid.includes('@lid')) {
// //                                 this.ownerLids.add(lid);
// //                                 const lidNum = lid.split('@')[0];
// //                                 this.ownerLids.add(lidNum);
// //                             }
// //                         });
// //                     }
                    
// //                     OWNER_JID = ownerJid;
// //                     OWNER_NUMBER = ownerNumber;
// //                     OWNER_CLEAN_JID = cleaned.cleanJid;
// //                     OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                    
// //                     log(`Loaded owner data: ${cleaned.cleanJid}`, 'success');
// //                 }
// //             }
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     loadWhitelist() {
// //         try {
// //             if (existsSync(WHITELIST_FILE)) {
// //                 const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
// //                 if (data.whitelist && Array.isArray(data.whitelist)) {
// //                     data.whitelist.forEach(item => {
// //                         WHITELIST.add(item);
// //                     });
// //                 }
// //             }
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     cleanJid(jid) {
// //         if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
// //         const isLid = jid.includes('@lid');
        
// //         if (isLid) {
// //             const lidNumber = jid.split('@')[0];
// //             return {
// //                 raw: jid,
// //                 cleanJid: jid,
// //                 cleanNumber: lidNumber,
// //                 isLid: true,
// //                 server: 'lid'
// //             };
// //         }
        
// //         const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
// //         const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
// //         const cleanNumber = numberPart.replace(/[^0-9]/g, '');
// //         const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
// //         const cleanJid = `${normalizedNumber}@${serverPart}`;
        
// //         return {
// //             raw: jid,
// //             cleanJid: cleanJid,
// //             cleanNumber: normalizedNumber,
// //             isLid: false,
// //             hasDeviceSuffix: deviceSuffix !== undefined,
// //             deviceSuffix: deviceSuffix,
// //             server: serverPart
// //         };
// //     }
    
// //     isOwner(msg) {
// //         if (!msg || !msg.key) return false;
        
// //         const chatJid = msg.key.remoteJid;
// //         const participant = msg.key.participant;
// //         const senderJid = participant || chatJid;
// //         const cleaned = this.cleanJid(senderJid);
        
// //         if (!this.owner || !this.owner.cleanNumber) {
// //             return false;
// //         }
        
// //         if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
// //             return true;
// //         }
        
// //         if (cleaned.isLid) {
// //             const lidNumber = cleaned.cleanNumber;
            
// //             if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) {
// //                 return true;
// //             }
            
// //             if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) {
// //                 return true;
// //             }
// //         }
        
// //         if (this.owner.cleanNumber && cleaned.cleanNumber) {
// //             if (this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
// //                 return false;
// //             }
// //         }
        
// //         return false;
// //     }
    
// //     isSimilarNumber(num1, num2) {
// //         if (!num1 || !num2) return false;
        
// //         if (num1 === num2) return true;
        
// //         if (num1.includes(num2) || num2.includes(num1)) {
// //             return true;
// //         }
        
// //         if (num1.length >= 6 && num2.length >= 6) {
// //             const last6Num1 = num1.slice(-6);
// //             const last6Num2 = num2.slice(-6);
// //             if (last6Num1 === last6Num2) {
// //                 return true;
// //             }
// //         }
        
// //         return false;
// //     }
    
// //     setNewOwner(newJid, isAutoLinked = false) {
// //         try {
// //             const cleaned = this.cleanJid(newJid);
            
// //             this.ownerJids.clear();
// //             this.ownerLids.clear();
// //             WHITELIST.clear();
            
// //             this.owner = {
// //                 rawJid: newJid,
// //                 cleanJid: cleaned.cleanJid,
// //                 cleanNumber: cleaned.cleanNumber,
// //                 isLid: cleaned.isLid,
// //                 linkedAt: new Date().toISOString(),
// //                 autoLinked: isAutoLinked
// //             };
            
// //             this.ownerJids.add(cleaned.cleanJid);
// //             this.ownerJids.add(newJid);
            
// //             if (cleaned.isLid) {
// //                 this.ownerLids.add(newJid);
// //                 const lidNumber = newJid.split('@')[0];
// //                 this.ownerLids.add(lidNumber);
// //                 OWNER_LID = newJid;
// //             } else {
// //                 OWNER_LID = null;
// //             }
            
// //             OWNER_JID = newJid;
// //             OWNER_NUMBER = cleaned.cleanNumber;
// //             OWNER_CLEAN_JID = cleaned.cleanJid;
// //             OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            
// //             const ownerData = {
// //                 OWNER_JID: newJid,
// //                 OWNER_NUMBER: cleaned.cleanNumber,
// //                 OWNER_CLEAN_JID: cleaned.cleanJid,
// //                 OWNER_CLEAN_NUMBER: cleaned.cleanNumber,
// //                 ownerLID: cleaned.isLid ? newJid : null,
// //                 verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
// //                 linkedAt: new Date().toISOString(),
// //                 autoLinked: isAutoLinked,
// //                 previousOwnerCleared: true,
// //                 version: VERSION
// //             };
            
// //             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            
// //             const whitelistData = {
// //                 whitelist: [],
// //                 updatedAt: new Date().toISOString(),
// //                 note: "Cleared by new owner linking"
// //             };
// //             writeFileSync(WHITELIST_FILE, JSON.stringify(whitelistData, null, 2));
            
// //             log(`New owner set: ${cleaned.cleanJid}`, 'success');
            
// //             return {
// //                 success: true,
// //                 owner: this.owner,
// //                 isLid: cleaned.isLid
// //             };
            
// //         } catch {
// //             return { success: false, error: 'Failed to set new owner' };
// //         }
// //     }
    
// //     addAdditionalDevice(jid) {
// //         try {
// //             if (!this.owner) return false;
            
// //             const cleaned = this.cleanJid(jid);
            
// //             if (!this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
// //                 return false;
// //             }
            
// //             if (cleaned.isLid) {
// //                 this.ownerLids.add(jid);
// //                 const lidNumber = jid.split('@')[0];
// //                 this.ownerLids.add(lidNumber);
// //             } else {
// //                 this.ownerJids.add(cleaned.cleanJid);
// //                 this.ownerJids.add(jid);
// //             }
            
// //             this.saveOwnerData();
            
// //             return true;
// //         } catch {
// //             return false;
// //         }
// //     }
    
// //     saveOwnerData() {
// //         try {
// //             if (!this.owner) return false;
            
// //             const ownerData = {
// //                 OWNER_JID: this.owner.rawJid,
// //                 OWNER_NUMBER: this.owner.cleanNumber,
// //                 OWNER_CLEAN_JID: this.owner.cleanJid,
// //                 OWNER_CLEAN_NUMBER: this.owner.cleanNumber,
// //                 ownerLID: this.owner.isLid ? this.owner.rawJid : OWNER_LID,
// //                 verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
// //                 ownerJIDs: Array.from(this.ownerJids),
// //                 linkedAt: this.owner.linkedAt,
// //                 updatedAt: new Date().toISOString(),
// //                 version: VERSION
// //             };
            
// //             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
// //             return true;
// //         } catch {
// //             return false;
// //         }
// //     }
    
// //     saveWhitelist() {
// //         try {
// //             const data = {
// //                 whitelist: Array.from(WHITELIST),
// //                 updatedAt: new Date().toISOString()
// //             };
// //             writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     getOwnerInfo() {
// //         return {
// //             ownerJid: this.owner?.cleanJid || null,
// //             ownerNumber: this.owner?.cleanNumber || null,
// //             ownerLid: OWNER_LID || null,
// //             jidCount: this.ownerJids.size,
// //             lidCount: this.ownerLids.size,
// //             whitelistCount: WHITELIST.size,
// //             isLid: this.owner?.isLid || false,
// //             linkedAt: this.owner?.linkedAt || null
// //         };
// //     }
    
// //     clearAllData() {
// //         this.ownerJids.clear();
// //         this.ownerLids.clear();
// //         WHITELIST.clear();
// //         this.owner = null;
        
// //         OWNER_JID = null;
// //         OWNER_NUMBER = null;
// //         OWNER_CLEAN_JID = null;
// //         OWNER_CLEAN_NUMBER = null;
// //         OWNER_LID = null;
        
// //         log(`Cleared all owner data`, 'warning');
// //         return true;
// //     }
// // }

// // // Initialize JID Manager
// // const jidManager = new JidManager();

// // // ====== ULTIMATE FIX SYSTEM WITH RESTART SUPPORT ======
// // class UltimateFixSystem {
// //     constructor() {
// //         this.fixedJids = new Set();
// //         this.fixApplied = false;
// //         this.editingMessages = new Map();
// //         this.restartFixAttempted = false; // NEW: Track restart fixes
// //     }
    
// //     async applyUltimateFix(sock, senderJid, cleaned, isFirstUser = false, isRestart = false) {
// //         try {
// //             const fixType = isRestart ? 'RESTART' : (isFirstUser ? 'FIRST' : 'NORMAL');
// //             log(`Applying Ultimate Fix (${fixType}) for: ${cleaned.cleanJid}`, 'fix');
            
// //             const progressMsg = await this.sendFixProgressMessage(sock, senderJid, `🚀 Starting ${isRestart ? 'Restart ' : ''}Ultimate Fix System`, 0);
            
// //             // ====== STEP 1: Store original isOwner method ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 10, 'Storing original methods...');
// //             const originalIsOwner = jidManager.isOwner;
// //             jidManager.originalIsOwner = originalIsOwner;
            
// //             // ====== STEP 2: Patch isOwner method ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 25, 'Patching isOwner method...');
            
// //             jidManager.isOwner = function(message) {
// //                 try {
// //                     const isFromMe = message?.key?.fromMe;
                    
// //                     if (isFromMe) {
// //                         return true;
// //                     }
                    
// //                     if (!this.owner || !this.owner.cleanNumber) {
// //                         this.loadOwnerDataFromFile();
// //                     }
                    
// //                     return originalIsOwner.call(this, message);
                    
// //                 } catch {
// //                     return message?.key?.fromMe || false;
// //                 }
// //             };
            
// //             // ====== STEP 3: Add loadOwnerDataFromFile method ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 40, 'Adding loadOwnerDataFromFile...');
            
// //             if (!jidManager.loadOwnerDataFromFile) {
// //                 jidManager.loadOwnerDataFromFile = function() {
// //                     try {
// //                         if (existsSync('./owner.json')) {
// //                             const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                            
// //                             let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
// //                             let cleanJid = data.OWNER_CLEAN_JID || data.OWNER_JID;
                            
// //                             if (cleanNumber && cleanNumber.includes(':')) {
// //                                 cleanNumber = cleanNumber.split(':')[0];
// //                             }
// //                             if (cleanJid && cleanJid.includes(':74')) {
// //                                 cleanJid = cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
// //                             }
                            
// //                             this.owner = {
// //                                 cleanNumber: cleanNumber,
// //                                 cleanJid: cleanJid,
// //                                 rawJid: data.OWNER_JID,
// //                                 isLid: cleanJid?.includes('@lid') || false
// //                             };
                            
// //                             return true;
// //                         }
// //                     } catch {
// //                         // Silent fail
// //                     }
// //                     return false;
// //                 };
// //             }
            
// //             jidManager.loadOwnerDataFromFile();
            
// //             // ====== STEP 4: Update global variables ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 60, 'Updating global variables...');
            
// //             const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : jidManager.owner || {};
            
// //             global.OWNER_NUMBER = ownerInfo.cleanNumber || cleaned.cleanNumber;
// //             global.OWNER_CLEAN_NUMBER = global.OWNER_NUMBER;
// //             global.OWNER_JID = ownerInfo.cleanJid || cleaned.cleanJid;
// //             global.OWNER_CLEAN_JID = global.OWNER_JID;
            
// //             // ====== STEP 5: Create LID mapping if needed ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 75, 'Creating LID mappings...');
            
// //             if (cleaned.isLid) {
// //                 const lidMappingFile = './lid_mappings.json';
// //                 let lidMappings = {};
                
// //                 if (existsSync(lidMappingFile)) {
// //                     try {
// //                         lidMappings = JSON.parse(readFileSync(lidMappingFile, 'utf8'));
// //                     } catch {
// //                         // ignore
// //                     }
// //                 }
                
// //                 lidMappings[cleaned.cleanNumber] = cleaned.cleanJid;
// //                 writeFileSync(lidMappingFile, JSON.stringify(lidMappings, null, 2));
// //             }
            
// //             // ====== STEP 6: Mark as fixed ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 90, 'Finalizing fix...');
            
// //             this.fixedJids.add(senderJid);
// //             this.fixApplied = true;
            
// //             // ====== STEP 7: Final success message ======
// //             await this.updateProgress(sock, senderJid, progressMsg, 100, 'Ultimate Fix Complete!');
            
// //             const fixLog = `🚀 *${isRestart ? 'RESTART ' : ''}ULTIMATE FIX COMPLETE*\n\n` +
// //                          `✅ Fix applied successfully!\n` +
// //                          `📱 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
// //                          `🔧 Status: ✅ FIXED\n` +
// //                          `👑 Owner Access: ✅ GRANTED\n\n` +
// //                          `🎉 You now have full owner access in ALL chats!\n` +
// //                          `💬 Try using ${CURRENT_PREFIX}mode command to verify.`;
            
// //             await sock.sendMessage(senderJid, { text: fixLog });
            
// //             this.editingMessages.delete(senderJid);
            
// //             log(`✅ Ultimate Fix applied (${fixType}): ${cleaned.cleanJid}`, 'success');
            
// //             return {
// //                 success: true,
// //                 jid: cleaned.cleanJid,
// //                 number: cleaned.cleanNumber,
// //                 isLid: cleaned.isLid,
// //                 isRestart: isRestart,
// //                 fixesApplied: [
// //                     'Patched isOwner() method',
// //                     'Added loadOwnerDataFromFile()',
// //                     'Updated global variables',
// //                     'Created LID mapping'
// //                 ]
// //             };
            
// //         } catch (error) {
// //             log(`❌ Ultimate Fix failed: ${error.message}`, 'error');
// //             return { success: false, error: 'Fix failed' };
// //         }
// //     }
    
// //     async sendFixProgressMessage(sock, senderJid, initialText, progress = 0) {
// //         try {
// //             const progressBar = this.createProgressBar(progress);
// //             const message = `${initialText}\n\n${progressBar}\n\n🔄 Progress: ${progress}%`;
            
// //             const sentMsg = await sock.sendMessage(senderJid, { text: message });
// //             this.editingMessages.set(senderJid, sentMsg.key);
// //             return sentMsg;
// //         } catch {
// //             return null;
// //         }
// //     }
    
// //     async updateProgress(sock, senderJid, originalMsg, progress, statusText) {
// //         try {
// //             const progressBar = this.createProgressBar(progress);
// //             const message = `🚀 Applying Ultimate Fix\n\n${progressBar}\n\n${statusText}\n🔄 Progress: ${progress}%`;
            
// //             if (originalMsg && originalMsg.key) {
// //                 await sock.sendMessage(senderJid, { 
// //                     text: message,
// //                     edit: originalMsg.key 
// //                 });
// //             }
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     createProgressBar(percentage) {
// //         const filledLength = Math.round(percentage / 5);
// //         const emptyLength = 20 - filledLength;
// //         const filledBar = '█'.repeat(filledLength);
// //         const emptyBar = '░'.repeat(emptyLength);
// //         return `[${filledBar}${emptyBar}]`;
// //     }
    
// //     isFixNeeded(jid) {
// //         return !this.fixedJids.has(jid);
// //     }
    
// //     restoreOriginalMethods() {
// //         try {
// //             if (jidManager.originalIsOwner) {
// //                 jidManager.isOwner = jidManager.originalIsOwner;
// //             }
// //             return true;
// //         } catch {
// //             return false;
// //         }
// //     }
    
// //     // NEW: Check if we should run fix on restart
// //     shouldRunRestartFix(ownerJid) {
// //         const hasOwnerFile = existsSync(OWNER_FILE);
// //         const isFixNeeded = this.isFixNeeded(ownerJid);
// //         const notAttempted = !this.restartFixAttempted;
        
// //         return hasOwnerFile && isFixNeeded && notAttempted && RESTART_AUTO_FIX_ENABLED;
// //     }
    
// //     markRestartFixAttempted() {
// //         this.restartFixAttempted = true;
// //     }
// // }

// // // Initialize Ultimate Fix System
// // const ultimateFixSystem = new UltimateFixSystem();

// // // ====== AUTO-LINKING SYSTEM WITH RESTART SUPPORT ======
// // class AutoLinkSystem {
// //     constructor() {
// //         this.linkAttempts = new Map();
// //         this.MAX_ATTEMPTS = 3;
// //     }
    
// //     async shouldAutoLink(sock, msg) {
// //         if (!AUTO_LINK_ENABLED) return false;
        
// //         const senderJid = msg.key.participant || msg.key.remoteJid;
// //         const cleaned = jidManager.cleanJid(senderJid);
        
// //         if (!jidManager.owner || !jidManager.owner.cleanNumber) {
// //             return await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
// //         }
        
// //         if (msg.key.fromMe) {
// //             if (!jidManager.owner) {
// //                 return await this.autoLinkNewOwner(sock, senderJid, cleaned, false);
// //             }
// //             return false;
// //         }
        
// //         if (jidManager.isOwner(msg)) {
// //             return false;
// //         }
        
// //         const currentOwnerNumber = jidManager.owner.cleanNumber;
// //         if (jidManager.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
// //             const isDifferentDevice = !jidManager.ownerJids.has(cleaned.cleanJid) && 
// //                                      !jidManager.ownerLids.has(senderJid);
            
// //             if (isDifferentDevice) {
// //                 jidManager.addAdditionalDevice(senderJid);
                
// //                 if (AUTO_ULTIMATE_FIX_ENABLED && ultimateFixSystem.isFixNeeded(senderJid)) {
// //                     setTimeout(async () => {
// //                         await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, false);
// //                     }, 1000);
// //                 }
                
// //                 await this.sendDeviceLinkedMessage(sock, senderJid, cleaned);
// //                 return true;
// //             }
// //         }
        
// //         return false;
// //     }
    
// //     async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
// //         try {
// //             const result = jidManager.setNewOwner(senderJid, true);
            
// //             if (!result.success) {
// //                 return false;
// //             }
            
// //             await this.sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser);
            
// //             if (AUTO_ULTIMATE_FIX_ENABLED) {
// //                 setTimeout(async () => {
// //                     await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, isFirstUser);
// //                 }, 1500);
// //             }
            
// //             setTimeout(async () => {
// //                 await this.autoRunConnectCommand(sock, senderJid, cleaned);
// //             }, 3000);
            
// //             console.log(chalk.green(`
// // ╔════════════════════════════════════════════════╗
// // ║         🔗 AUTO-LINKING SUCCESS                ║
// // ╠════════════════════════════════════════════════╣
// // ║  ✅ New Owner: +${cleaned.cleanNumber}                  
// // ║  🔗 JID: ${cleaned.cleanJid}
// // ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// // ║  🔧 Auto Fix: ✅ SCHEDULED
// // ║  🔌 Auto Connect: ✅ SCHEDULED
// // ╚════════════════════════════════════════════════╝
// // `));
            
// //             return true;
// //         } catch {
// //             return false;
// //         }
// //     }
    
// //     async sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
// //         try {
// //             const currentTime = new Date().toLocaleTimeString();
            
// //             let successMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
            
// //             if (isFirstUser) {
// //                 successMsg += `🎉 *WELCOME TO WOLF TECH*\n\n`;
// //             } else {
// //                 successMsg += `🔄 *NEW OWNER LINKED!*\n\n`;
// //             }
            
// //             successMsg += `✅ You have been automatically set as the bot owner!\n\n`;
            
// //             successMsg += `📋 *Owner Information:*\n`;
// //             successMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
// //             successMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
// //             successMsg += `├─ JID: ${cleaned.cleanJid}\n`;
// //             successMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
// //             successMsg += `├─ Mode: ${BOT_MODE}\n`;
// //             successMsg += `├─ Linked: ${currentTime}\n`;
// //             successMsg += `└─ Status: ✅ LINKED SUCCESSFULLY\n\n`;
            
// //             successMsg += `🔧 *Auto Ultimate Fix:* Initializing... (1.5s)\n`;
// //             successMsg += `🔌 *Auto Connect:* Initializing... (3s)\n\n`;
            
// //             if (!isFirstUser) {
// //                 successMsg += `⚠️ *Important:*\n`;
// //                 successMsg += `• Previous owner data has been cleared\n`;
// //                 successMsg += `• Only YOU can use owner commands now\n\n`;
// //             }
            
// //             successMsg += `⚡ *Next:* Ultimate Fix will run automatically...`;
            
// //             await sock.sendMessage(senderJid, { text: successMsg });
            
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     async autoRunConnectCommand(sock, senderJid, cleaned) {
// //         try {
// //             if (!AUTO_CONNECT_COMMAND_ENABLED) return;
            
// //             const fakeMsg = {
// //                 key: {
// //                     remoteJid: senderJid,
// //                     fromMe: false,
// //                     id: `auto-connect-${Date.now()}`,
// //                     participant: senderJid
// //                 },
// //                 message: {
// //                     conversation: `${CURRENT_PREFIX}connect`
// //                 }
// //             };
            
// //             await handleConnectCommand(sock, fakeMsg, [], cleaned);
            
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
// //         try {
// //             const message = `📱 *Device Linked!*\n\n` +
// //                           `✅ Your device has been added to owner devices.\n` +
// //                           `🔒 You can now use owner commands from this device.\n` +
// //                           `🔄 Ultimate Fix will be applied automatically.`;
            
// //             await sock.sendMessage(senderJid, { text: message });
// //         } catch {
// //             // Silent fail
// //         }
// //     }
// // }

// // // Initialize Auto Link System
// // const autoLinkSystem = new AutoLinkSystem();

// // // ====== CONNECT COMMAND HANDLER ======
// // async function handleConnectCommand(sock, msg, args, cleaned) {
// //     try {
// //         const chatJid = msg.key.remoteJid || cleaned.cleanJid;
// //         const currentTime = new Date().toLocaleTimeString();
        
// //         const fixApplied = ultimateFixSystem.fixApplied && ultimateFixSystem.fixedJids.has(chatJid);
        
// //         let connectMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
// //         connectMsg += `🔌 *CONNECTION ESTABLISHED!*\n\n`;
        
// //         connectMsg += `📋 *Owner Information:*\n`;
// //         connectMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
// //         connectMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
// //         connectMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
// //         connectMsg += `├─ Mode: ${BOT_MODE}\n`;
// //         connectMsg += `├─ Connected: ${currentTime}\n`;
// //         connectMsg += `└─ Ultimate Fix: ${fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n\n`;
        
// //         const ownerInfo = jidManager.getOwnerInfo();
// //         connectMsg += `🔗 *Connection Details:*\n`;
// //         connectMsg += `├─ Status: ✅ Connected\n`;
// //         connectMsg += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
// //         connectMsg += `├─ Known LIDs: ${ownerInfo.lidCount}\n`;
// //         connectMsg += `└─ Uptime: ${Math.floor(process.uptime()/60)} minutes\n\n`;
        
// //         if (!fixApplied) {
// //             connectMsg += `⚠️ *Recommendation:*\n`;
// //             connectMsg += `Use ${CURRENT_PREFIX}ultimatefix to ensure owner access.\n\n`;
// //         }
        
// //         connectMsg += `📚 Use *${CURRENT_PREFIX}menu* to see commands.`;
        
// //         await sock.sendMessage(chatJid, { text: connectMsg });
        
// //         console.log(chalk.green(`
// // ╔════════════════════════════════════════════════╗
// // ║         🔌 AUTO-CONNECT COMMAND               ║
// // ╠════════════════════════════════════════════════╣
// // ║  ✅ Owner: +${cleaned.cleanNumber}                  
// // ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// // ║  🔧 Fix Status: ${fixApplied ? 'APPLIED' : 'NOT APPLIED'}
// // ║  🕒 Time: ${currentTime}                 
// // ╚════════════════════════════════════════════════╝
// // `));
        
// //         return true;
// //     } catch {
// //         return false;
// //     }
// // }

// // // ====== SILENT FUNCTIONS ======
// // function isUserBlocked(jid) {
// //     try {
// //         if (existsSync(BLOCKED_USERS_FILE)) {
// //             const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
// //             return data.users && data.users.includes(jid);
// //         }
// //     } catch {
// //         return false;
// //     }
// //     return false;
// // }

// // function checkBotMode(msg, commandName) {
// //     try {
// //         if (jidManager.isOwner(msg)) {
// //             return true;
// //         }
        
// //         if (existsSync(BOT_MODE_FILE)) {
// //             const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
// //             BOT_MODE = modeData.mode || 'public';
// //         } else {
// //             BOT_MODE = 'public';
// //         }
        
// //         const chatJid = msg.key.remoteJid;
        
// //         switch(BOT_MODE) {
// //             case 'public':
// //                 return true;
// //             case 'private':
// //                 return false;
// //             case 'silent':
// //                 return false;
// //             case 'group-only':
// //                 return chatJid.includes('@g.us');
// //             case 'maintenance':
// //                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
// //                 return allowedCommands.includes(commandName);
// //             default:
// //                 return true;
// //         }
// //     } catch {
// //         return true;
// //     }
// // }

// // function loadPrefix() {
// //     try {
// //         if (existsSync(PREFIX_CONFIG_FILE)) {
// //             const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
// //             if (config.prefix && config.prefix.length <= 2) {
// //                 CURRENT_PREFIX = config.prefix;
// //             }
// //         }
// //     } catch {
// //         // Silent fail
// //     }
// // }

// // function startHeartbeat(sock) {
// //     if (heartbeatInterval) {
// //         clearInterval(heartbeatInterval);
// //     }
    
// //     heartbeatInterval = setInterval(async () => {
// //         if (isConnected && sock) {
// //             try {
// //                 await sock.sendPresenceUpdate('available');
// //                 lastActivityTime = Date.now();
                
// //                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
// //                     store.clear();
// //                 }
// //             } catch {
// //                 // Silent fail
// //             }
// //         }
// //     }, 60 * 1000);
// // }

// // function stopHeartbeat() {
// //     if (heartbeatInterval) {
// //         clearInterval(heartbeatInterval);
// //         heartbeatInterval = null;
// //     }
// // }

// // function ensureSessionDir() {
// //     if (!existsSync(SESSION_DIR)) {
// //         fs.mkdirSync(SESSION_DIR, { recursive: true });
// //     }
// // }

// // function cleanSession() {
// //     try {
// //         if (existsSync(SESSION_DIR)) {
// //             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
// //         }
// //         return true;
// //     } catch {
// //         return false;
// //     }
// // }

// // class MessageStore {
// //     constructor() {
// //         this.messages = new Map();
// //         this.maxMessages = 100;
// //     }
    
// //     addMessage(jid, messageId, message) {
// //         try {
// //             const key = `${jid}|${messageId}`;
// //             this.messages.set(key, {
// //                 ...message,
// //                 timestamp: Date.now()
// //             });
            
// //             if (this.messages.size > this.maxMessages) {
// //                 const oldestKey = this.messages.keys().next().value;
// //                 this.messages.delete(oldestKey);
// //             }
// //         } catch {
// //             // Silent fail
// //         }
// //     }
    
// //     getMessage(jid, messageId) {
// //         try {
// //             const key = `${jid}|${messageId}`;
// //             return this.messages.get(key) || null;
// //         } catch {
// //             return null;
// //         }
// //     }
    
// //     clear() {
// //         this.messages.clear();
// //     }
// // }

// // const commands = new Map();
// // const commandCategories = new Map();

// // async function loadCommandsFromFolder(folderPath, category = 'general') {
// //     const absolutePath = path.resolve(folderPath);
    
// //     if (!existsSync(absolutePath)) {
// //         return;
// //     }
    
// //     try {
// //         const items = fs.readdirSync(absolutePath);
// //         let categoryCount = 0;
        
// //         for (const item of items) {
// //             const fullPath = path.join(absolutePath, item);
// //             const stat = fs.statSync(fullPath);
            
// //             if (stat.isDirectory()) {
// //                 await loadCommandsFromFolder(fullPath, item);
// //             } else if (item.endsWith('.js')) {
// //                 try {
// //                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
// //                     const commandModule = await import(`file://${fullPath}`);
// //                     const command = commandModule.default || commandModule;
                    
// //                     if (command && command.name) {
// //                         command.category = category;
// //                         commands.set(command.name.toLowerCase(), command);
                        
// //                         if (!commandCategories.has(category)) {
// //                             commandCategories.set(category, []);
// //                         }
// //                         commandCategories.get(category).push(command.name);
                        
// //                         log(`[${category}] Loaded: ${command.name}`, 'success');
// //                         categoryCount++;
                        
// //                         if (Array.isArray(command.alias)) {
// //                             command.alias.forEach(alias => {
// //                                 commands.set(alias.toLowerCase(), command);
// //                             });
// //                         }
// //                     }
// //                 } catch {
// //                     // Silent fail
// //                 }
// //             }
// //         }
        
// //         if (categoryCount > 0) {
// //             log(`${categoryCount} commands loaded from ${category}`, 'info');
// //         }
// //     } catch {
// //         // Silent fail
// //     }
// // }

// // // ====== LOGIN MANAGER ======
// // class LoginManager {
// //     constructor() {
// //         this.rl = readline.createInterface({
// //             input: process.stdin,
// //             output: process.stdout
// //         });
// //     }
    
// //     async selectMode() {
// //         console.log(chalk.yellow('\n🐺 WOLFBOT - LOGIN SYSTEM'));
// //         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
// //         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
// //         const choice = await this.ask('Choose option (1-2, default 1): ');
        
// //         switch (choice.trim()) {
// //             case '1':
// //                 return await this.pairingCodeMode();
// //             case '2':
// //                 return await this.cleanStartMode();
// //             default:
// //                 return await this.pairingCodeMode();
// //         }
// //     }
    
// //     async pairingCodeMode() {
// //         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
// //         console.log(chalk.gray('Enter phone number with country code (without +)'));
// //         console.log(chalk.gray('Example: 254788710904'));
        
// //         const phone = await this.ask('Phone number: ');
// //         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
// //         if (!cleanPhone || cleanPhone.length < 10) {
// //             console.log(chalk.red('❌ Invalid phone number'));
// //             return await this.selectMode();
// //         }
        
// //         return { mode: 'pair', phone: cleanPhone };
// //     }
    
// //     async cleanStartMode() {
// //         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
// //         console.log(chalk.red('This will delete all session data!'));
        
// //         const confirm = await this.ask('Are you sure? (y/n): ');
        
// //         if (confirm.toLowerCase() === 'y') {
// //             cleanSession();
// //             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
// //             return await this.pairingCodeMode();
// //         } else {
// //             return await this.pairingCodeMode();
// //         }
// //     }
    
// //     ask(question) {
// //         return new Promise((resolve) => {
// //             this.rl.question(chalk.yellow(question), (answer) => {
// //                 resolve(answer);
// //             });
// //         });
// //     }
    
// //     close() {
// //         if (this.rl) this.rl.close();
// //     }
// // }

// // // ====== ENHANCED CONNECTION HANDLER WITH RESTART FIX ======
// // async function startBot(loginMode = 'pair', phoneNumber = null) {
// //     try {
// //         log('Initializing WhatsApp connection...', 'info');
        
// //         loadPrefix();
        
// //         log('Loading commands...', 'info');
// //         commands.clear();
// //         commandCategories.clear();
        
// //         await loadCommandsFromFolder('./commands');
// //         log(`Loaded ${commands.size} commands`, 'success');
        
// //         store = new MessageStore();
// //         ensureSessionDir();
        
// //         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
// //         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
// //         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
// //         // Silent logger
// //         const silentLogger = {
// //             level: 'silent',
// //             trace: () => {},
// //             debug: () => {},
// //             info: () => {},
// //             warn: () => {},
// //             error: () => {},
// //             fatal: () => {},
// //             child: () => silentLogger
// //         };
        
// //         let state, saveCreds;
// //         try {
// //             const authState = await useMultiFileAuthState(SESSION_DIR);
// //             state = authState.state;
// //             saveCreds = authState.saveCreds;
// //         } catch {
// //             cleanSession();
// //             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
// //             state = freshAuth.state;
// //             saveCreds = freshAuth.saveCreds;
// //         }
        
// //         const { version } = await fetchLatestBaileysVersion();
        
// //         const sock = makeWASocket({
// //             version,
// //             logger: silentLogger,
// //             browser: Browsers.ubuntu('Chrome'),
// //             printQRInTerminal: false,
// //             auth: {
// //                 creds: state.creds,
// //                 keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
// //             },
// //             markOnlineOnConnect: true,
// //             generateHighQualityLinkPreview: true,
// //             connectTimeoutMs: 60000,
// //             keepAliveIntervalMs: 20000,
// //             emitOwnEvents: true,
// //             mobile: false,
// //             getMessage: async (key) => {
// //                 return store?.getMessage(key.remoteJid, key.id) || null;
// //             },
// //             defaultQueryTimeoutMs: 30000,
// //             retryRequestDelayMs: 1000,
// //             maxRetryCount: 3,
// //             syncFullHistory: false,
// //             fireInitQueries: true,
// //             transactionOpts: {
// //                 maxCommitRetries: 3,
// //                 delayBetweenTriesMs: 1000
// //             },
// //             shouldIgnoreJid: (jid) => {
// //                 return jid.includes('status@broadcast') || 
// //                        jid.includes('broadcast') ||
// //                        jid.includes('newsletter');
// //             }
// //         });
        
// //         SOCKET_INSTANCE = sock;
// //         connectionAttempts = 0;
// //         isWaitingForPairingCode = false;
        
// //         // ====== ENHANCED CONNECTION HANDLER ======
// //         sock.ev.on('connection.update', async (update) => {
// //             const { connection, lastDisconnect, qr } = update;
            
// //             if (connection === 'open') {
// //                 isConnected = true;
// //                 startHeartbeat(sock);
// //                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
// //                 isWaitingForPairingCode = false;
                
// //                 // ====== RESTART AUTO-FIX TRIGGER ======
// //                 await triggerRestartAutoFix(sock);
// //             }
            
// //             if (connection === 'close') {
// //                 isConnected = false;
// //                 stopHeartbeat();
// //                 await handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber);
// //                 isWaitingForPairingCode = false;
// //             }
            
// //             // ====== PAIRING CODE LOGIC ======
// //             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
// //                 if (!isWaitingForPairingCode) {
// //                     isWaitingForPairingCode = true;
                    
// //                     // Show initial message
// //                     console.log(chalk.cyan('\n📱 CONNECTING TO WHATSAPP...'));
// //                     console.log(chalk.yellow('Requesting 8-digit pairing code...'));
                    
// //                     // Request pairing code with retry logic
// //                     const requestPairingCode = async (attempt = 1) => {
// //                         try {
// //                             const code = await sock.requestPairingCode(phoneNumber);
                            
// //                             const cleanCode = code.replace(/\s+/g, '');
// //                             let formattedCode = cleanCode;
                            
// //                             if (cleanCode.length === 8) {
// //                                 formattedCode = `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}`;
// //                             }
                            
// //                             console.clear();
// //                             console.log(chalk.greenBright(`
// // ╔════════════════════════════════════════════════╗
// // ║              🔗 PAIRING CODE                   ║
// // ╠════════════════════════════════════════════════╣
// // ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// // ║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
// // ║ 📏 Length: ${chalk.cyan('8 characters'.padEnd(27))}║
// // ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// // ╚════════════════════════════════════════════════╝
// // `));
                            
// //                             console.log(chalk.cyan('\n📱 INSTRUCTIONS:'));
// //                             console.log(chalk.white('1. Open WhatsApp on your phone'));
// //                             console.log(chalk.white('2. Go to Settings → Linked Devices'));
// //                             console.log(chalk.white('3. Tap "Link a Device"'));
// //                             console.log(chalk.white('4. Enter this 8-digit code:'));
// //                             console.log(chalk.yellow.bold(`   ${formattedCode}`));
// //                             console.log(chalk.white('5. Wait for connection...\n'));
                            
// //                             console.log(chalk.gray('Note: The code is case-sensitive'));
// //                             console.log(chalk.gray(`Raw code: ${cleanCode}`));
                            
// //                             log(`8-digit pairing code generated: ${formattedCode}`, 'pairing');
                            
// //                         } catch (error) {
// //                             console.log(chalk.red(`\n❌ Attempt ${attempt}: Failed to get pairing code`));
                            
// //                             if (attempt < 3) {
// //                                 console.log(chalk.yellow(`Retrying in 5 seconds... (${attempt}/3)`));
// //                                 await delay(5000);
// //                                 await requestPairingCode(attempt + 1);
// //                             } else {
// //                                 console.log(chalk.red('❌ Max retries reached. Restarting connection...'));
// //                                 isWaitingForPairingCode = false;
// //                                 setTimeout(async () => {
// //                                     await startBot(loginMode, phoneNumber);
// //                                 }, 10000);
// //                             }
// //                         }
// //                     };
                    
// //                     setTimeout(() => {
// //                         requestPairingCode(1);
// //                     }, 3000);
// //                 }
// //             }
// //         });
        
// //         sock.ev.on('creds.update', saveCreds);
        
// //         sock.ev.on('messages.upsert', async ({ messages, type }) => {
// //             if (type !== 'notify') return;
            
// //             const msg = messages[0];
// //             if (!msg.message) return;
            
// //             lastActivityTime = Date.now();
            
// //             if (msg.key.remoteJid === 'status@broadcast' || 
// //                 msg.key.remoteJid.includes('broadcast')) {
// //                 return;
// //             }
            
// //             const messageId = msg.key.id;
            
// //             if (store) {
// //                 store.addMessage(msg.key.remoteJid, messageId, {
// //                     message: msg.message,
// //                     key: msg.key,
// //                     timestamp: Date.now()
// //                 });
// //             }
            
// //             await handleIncomingMessage(sock, msg);
// //         });
        
// //         return sock;
        
// //     } catch (error) {
// //         console.log(chalk.red('❌ Connection failed, retrying in 10 seconds...'));
// //         setTimeout(async () => {
// //             await startBot(loginMode, phoneNumber);
// //         }, 10000);
// //     }
// // }

// // // ====== NEW: RESTART AUTO-FIX TRIGGER ======
// // async function triggerRestartAutoFix(sock) {
// //     try {
// //         // Only run if there's an existing owner
// //         if (existsSync(OWNER_FILE) && sock.user?.id) {
// //             const ownerJid = sock.user.id;
// //             const cleaned = jidManager.cleanJid(ownerJid);
            
// //             // Check if we should run restart fix
// //             if (ultimateFixSystem.shouldRunRestartFix(ownerJid)) {
// //                 log(`🔄 Triggering restart auto-fix for: ${ownerJid}`, 'restart');
                
// //                 // Mark as attempted first
// //                 ultimateFixSystem.markRestartFixAttempted();
                
// //                 // Wait a moment for everything to stabilize
// //                 await delay(2000);
                
// //                 // Apply the restart fix
// //                 const fixResult = await ultimateFixSystem.applyUltimateFix(sock, ownerJid, cleaned, false, true);
                
// //                 if (fixResult.success) {
// //                     // Send restart success message
// //                     const restartMsg = `🔄 *BOT RESTARTED SUCCESSFULLY!*\n\n` +
// //                                      `✅ *WOLFBOT* has been restarted\n` +
// //                                      `🔧 Restart Ultimate Fix: ✅ APPLIED\n` +
// //                                      `👑 Owner: +${cleaned.cleanNumber}\n` +
// //                                      `📱 Device: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
// //                                      `⚡ Version: ${VERSION}\n` +
// //                                      `💬 Prefix: "${CURRENT_PREFIX}"\n\n` +
// //                                      `🎉 All features are now active!\n` +
// //                                      `💬 Try using ${CURRENT_PREFIX}ping to verify.`;
                    
// //                     await sock.sendMessage(ownerJid, { text: restartMsg });
                    
// //                     console.log(chalk.green(`
// // ╔════════════════════════════════════════════════╗
// // ║         🔄 RESTART AUTO-FIX COMPLETE          ║
// // ╠════════════════════════════════════════════════╣
// // ║  ✅ Owner: +${cleaned.cleanNumber}                  
// // ║  🔗 JID: ${ownerJid}
// // ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// // ║  🔧 Fix Status: ✅ APPLIED
// // ║  🕒 Time: ${new Date().toLocaleTimeString()}                 
// // ╚════════════════════════════════════════════════╝
// // `));
                    
// //                     log(`✅ Restart auto-fix completed successfully`, 'success');
// //                 } else {
// //                     log(`❌ Restart auto-fix failed`, 'error');
// //                 }
// //             } else {
// //                 log(`ℹ️  Restart auto-fix not needed or already applied`, 'info');
                
// //                 // Still send a restart notification
// //                 if (existsSync(OWNER_FILE)) {
// //                     const restartMsg = `🔄 *BOT RESTARTED*\n\n` +
// //                                      `✅ *WOLFBOT* has been restarted\n` +
// //                                      `👑 Owner: +${cleaned.cleanNumber}\n` +
// //                                      `⚡ Version: ${VERSION}\n` +
// //                                      `💬 Prefix: "${CURRENT_PREFIX}"\n` +
// //                                      `🎛️ Mode: ${BOT_MODE}\n\n` +
// //                                      `🔧 Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ Already Applied' : '❌ Not Applied'}\n` +
// //                                      `💬 Use ${CURRENT_PREFIX}ultimatefix if needed.`;
                    
// //                     await sock.sendMessage(ownerJid, { text: restartMsg });
// //                 }
// //             }
// //         }
// //     } catch (error) {
// //         log(`⚠️ Restart auto-fix trigger error: ${error.message}`, 'warning');
// //     }
// // }

// // // ====== CONNECTION HANDLERS ======
// // async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
// //     const currentTime = new Date().toLocaleTimeString();
    
// //     OWNER_JID = sock.user.id;
// //     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
// //     const isFirstConnection = !existsSync(OWNER_FILE);
    
// //     if (isFirstConnection) {
// //         jidManager.clearAllData();
// //         jidManager.setNewOwner(OWNER_JID, false);
// //     } else {
// //         jidManager.loadOwnerData();
// //     }
    
// //     const ownerInfo = jidManager.getOwnerInfo();
    
// //     // Clear console and show success
// //     console.clear();
// //     console.log(chalk.greenBright(`
// // ╔════════════════════════════════════════════════════════╗
// // ║                    🐺 ${chalk.bold('WOLFBOT ONLINE')}                    ║
// // ╠════════════════════════════════════════════════════════╣
// // ║  ✅ Connected successfully!                            
// // ║  👑 Owner : +${ownerInfo.ownerNumber}
// // ║  🔧 Clean JID : ${ownerInfo.ownerJid}
// // ║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
// // ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// // ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// // ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// // ║  💬 Prefix : "${CURRENT_PREFIX}"
// // ║  🎛️ Mode   : ${BOT_MODE}
// // ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// // ║  📊 Commands: ${commands.size} commands loaded
// // ║  🔧 AUTO ULTIMATE FIX : ✅ ENABLED
// // ║  🔄 RESTART AUTO-FIX : ✅ ENABLED
// // ╚════════════════════════════════════════════════════════╝
// // `));
    
// //     // Only send initial message if it's a first connection
// //     if (isFirstConnection) {
// //         try {
// //             const connMsg = `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n` +
// //                           `✅ Bot started successfully!\n\n` +
// //                           `📋 *Owner Information:*\n` +
// //                           `├─ Your Number: +${ownerInfo.ownerNumber}\n` +
// //                           `├─ Device Type: ${ownerInfo.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n` +
// //                           `├─ Prefix: "${CURRENT_PREFIX}"\n` +
// //                           `├─ Mode: ${BOT_MODE}\n` +
// //                           `├─ Connected: ${currentTime}\n` +
// //                           `└─ Status: ✅ BOT ONLINE\n\n` +
// //                           `🔧 *Auto Ultimate Fix:* Will run when you message first...\n` +
// //                           `🔌 *Auto Connect:* Will run automatically\n\n` +
// //                           `💬 Send any message to activate all features.`;
            
// //             await sock.sendMessage(OWNER_JID, { text: connMsg });
            
// //         } catch {
// //             // Silent fail
// //         }
// //     }
// // }

// // async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
// //     const statusCode = lastDisconnect?.error?.output?.statusCode;
// //     const isConflict = statusCode === 409;
    
// //     connectionAttempts++;
    
// //     if (isConflict) {
// //         const conflictDelay = 30000;
        
// //         console.log(chalk.yellow(`\n⚠️ Device conflict detected. Reconnecting in 30 seconds...`));
        
// //         setTimeout(async () => {
// //             await startBot(loginMode, phoneNumber);
// //         }, conflictDelay);
// //         return;
// //     }
    
// //     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
// //         cleanSession();
// //     }
    
// //     const baseDelay = 5000;
// //     const maxDelay = 60000;
// //     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
// //     setTimeout(async () => {
// //         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
// //             connectionAttempts = 0;
// //             process.exit(1);
// //         } else {
// //             await startBot(loginMode, phoneNumber);
// //         }
// //     }, delayTime);
// // }

// // // ====== MESSAGE HANDLER ======
// // async function handleIncomingMessage(sock, msg) {
// //     try {
// //         const chatId = msg.key.remoteJid;
// //         const senderJid = msg.key.participant || chatId;
        
// //         await autoLinkSystem.shouldAutoLink(sock, msg);
        
// //         if (isUserBlocked(senderJid)) {
// //             return;
// //         }
        
// //         const textMsg = msg.message.conversation || 
// //                        msg.message.extendedTextMessage?.text || 
// //                        msg.message.imageMessage?.caption || 
// //                        msg.message.videoMessage?.caption || '';
        
// //         if (!textMsg) return;
        
// //         if (textMsg.startsWith(CURRENT_PREFIX)) {
// //             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
// //             const commandName = parts[0].toLowerCase();
// //             const args = parts.slice(1);
            
// //             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
// //             if (!checkBotMode(msg, commandName)) {
// //                 if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
// //                     return;
// //                 }
// //                 try {
// //                     await sock.sendMessage(chatId, { 
// //                         text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
// //                     });
// //                 } catch {
// //                     // Silent fail
// //                 }
// //                 return;
// //             }
            
// //             if (commandName === 'connect' || commandName === 'link') {
// //                 const cleaned = jidManager.cleanJid(senderJid);
// //                 await handleConnectCommand(sock, msg, args, cleaned);
// //                 return;
// //             }
            
// //             const command = commands.get(commandName);
// //             if (command) {
// //                 try {
// //                     if (command.ownerOnly && !jidManager.isOwner(msg)) {
// //                         try {
// //                             await sock.sendMessage(chatId, { 
// //                                 text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
// //                             });
// //                         } catch {
// //                             // Silent fail
// //                         }
// //                         return;
// //                     }
                    
// //                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
// //                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
// //                         OWNER_JID: OWNER_CLEAN_JID,
// //                         OWNER_LID: OWNER_LID,
// //                         BOT_NAME,
// //                         VERSION,
// //                         isOwner: () => jidManager.isOwner(msg),
// //                         jidManager,
// //                         store
// //                     });
// //                 } catch {
// //                     // Silent fail
// //                 }
// //             } else {
// //                 await handleDefaultCommands(commandName, sock, msg, args);
// //             }
// //         }
// //     } catch {
// //         // Silent fail
// //     }
// // }

// // // ====== DEFAULT COMMANDS ======
// // async function handleDefaultCommands(commandName, sock, msg, args) {
// //     const chatId = msg.key.remoteJid;
// //     const isOwnerUser = jidManager.isOwner(msg);
// //     const ownerInfo = jidManager.getOwnerInfo();
    
// //     try {
// //         switch (commandName) {
// //             case 'ping':
// //                 const start = Date.now();
// //                 const latency = Date.now() - start;
// //                 await sock.sendMessage(chatId, { 
// //                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
// //                 }, { quoted: msg });
// //                 break;
                
// //             case 'help':
// //                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
// //                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
// //                 helpText += `Mode: ${BOT_MODE}\n`;
// //                 helpText += `Commands: ${commands.size}\n\n`;
                
// //                 for (const [category, cmds] of commandCategories.entries()) {
// //                     helpText += `*${category.toUpperCase()}*\n`;
// //                     helpText += `${cmds.slice(0, 6).join(', ')}`;
// //                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
// //                     helpText += '\n\n';
// //                 }
                
// //                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
// //                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
// //                 break;
                
// //             case 'uptime':
// //                 const uptime = process.uptime();
// //                 const hours = Math.floor(uptime / 3600);
// //                 const minutes = Math.floor((uptime % 3600) / 60);
// //                 const seconds = Math.floor(uptime % 60);
                
// //                 await sock.sendMessage(chatId, {
// //                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}`
// //                 }, { quoted: msg });
// //                 break;
                
// //             case 'status':
// //                 await sock.sendMessage(chatId, {
// //                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${ownerInfo.ownerNumber}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
// //                 }, { quoted: msg });
// //                 break;
                
// //             case 'clean':
// //                 if (!isOwnerUser) {
// //                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
// //                     return;
// //                 }
                
// //                 await sock.sendMessage(chatId, { 
// //                     text: '🧹 Cleaning session and restarting...' 
// //                 });
                
// //                 setTimeout(() => {
// //                     cleanSession();
// //                     process.exit(1);
// //                 }, 2000);
// //                 break;
                
// //             case 'ownerinfo':
// //                 const senderJid = msg.key.participant || chatId;
// //                 const cleaned = jidManager.cleanJid(senderJid);
                
// //                 let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
// //                 ownerInfoText += `📱 Your JID: ${senderJid}\n`;
// //                 ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
// //                 ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
// //                 ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
// //                 ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
// //                 ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
// //                 ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n`;
// //                 ownerInfoText += `🔧 Auto Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n\n`;
                
// //                 ownerInfoText += `*BOT OWNER DETAILS:*\n`;
// //                 ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
// //                 ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
// //                 ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
// //                 ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
// //                 ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
// //                 if (!isOwnerUser) {
// //                     ownerInfoText += `\n\n⚠️ First message will auto-link if number matches.`;
// //                 }
                
// //                 await sock.sendMessage(chatId, {
// //                     text: ownerInfoText
// //                 }, { quoted: msg });
// //                 break;
                
// //             case 'resetowner':
// //                 if (!isOwnerUser) {
// //                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
// //                     return;
// //                 }
                
// //                 await sock.sendMessage(chatId, {
// //                     text: '🔄 Resetting owner data...\nNext message will set new owner automatically.'
// //                 });
                
// //                 jidManager.clearAllData();
// //                 break;
                
// //             case 'ultimatefix':
// //             case 'solveowner':
// //             case 'fixall':
// //                 const fixSenderJid = msg.key.participant || chatId;
// //                 const fixCleaned = jidManager.cleanJid(fixSenderJid);
                
// //                 if (!jidManager.isOwner(msg) && !msg.key.fromMe) {
// //                     await sock.sendMessage(chatId, {
// //                         text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.\n\nFirst message will auto-link you as owner.'
// //                     }, { quoted: msg });
// //                     return;
// //                 }
                
// //                 const fixResult = await ultimateFixSystem.applyUltimateFix(sock, fixSenderJid, fixCleaned, false);
                
// //                 if (fixResult.success) {
// //                     await sock.sendMessage(chatId, {
// //                         text: `🔧 *ULTIMATE FIX APPLIED*\n\n✅ Fix applied successfully!\n\n✅ You should now have full owner access in all chats!`
// //                     }, { quoted: msg });
// //                 } else {
// //                     await sock.sendMessage(chatId, {
// //                         text: `❌ *Ultimate Fix Failed*\n\nTry using ${CURRENT_PREFIX}resetowner first.`
// //                     }, { quoted: msg });
// //                 }
// //                 break;
// //         }
// //     } catch {
// //         // Silent fail
// //     }
// // }

// // // ====== MAIN APPLICATION ======
// // async function main() {
// //     try {
// //         log('Starting WOLFBOT...', 'info');
        
// //         const loginManager = new LoginManager();
// //         const { mode, phone } = await loginManager.selectMode();
// //         loginManager.close();
        
// //         await startBot(mode, phone);
        
// //     } catch {
// //         setTimeout(async () => {
// //             await main();
// //         }, 10000);
// //     }
// // }

// // // ====== PROCESS HANDLERS ======
// // process.on('SIGINT', () => {
// //     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
// //     stopHeartbeat();
// //     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
// //     process.exit(0);
// // });

// // process.on('uncaughtException', () => {
// //     return;
// // });

// // process.on('unhandledRejection', () => {
// //     return;
// // });

// // // Start the bot
// // main().catch(() => {
// //     process.exit(1);
// // });

// // // Activity monitor
// // setInterval(() => {
// //     const now = Date.now();
// //     const inactivityThreshold = 5 * 60 * 1000;
    
// //     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
// //         if (SOCKET_INSTANCE) {
// //             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
// //         }
// //     }
// // }, 60000);
















// // ====== SILENT WOLF BOT - STATUS WATCHER EDITION ======
// // Includes WhatsApp Status Auto-Viewer System

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';

// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'WOLFBOT';
// const VERSION = '2.0.0'; // Status Watcher Edition
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const PREFIX_CONFIG_FILE = './prefix_config.json';
// const BOT_MODE_FILE = './bot_mode.json';
// const WHITELIST_FILE = './whitelist.json';
// const BLOCKED_USERS_FILE = './blocked_users.json';
// const STATUS_LOG_FILE = './status_logs.json';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();

// // Suppress unwanted logs but allow important ones
// const originalConsoleLog = console.log;
// const originalConsoleError = console.error;

// console.log = function(...args) {
//     const message = args.join(' ').toLowerCase();
    
//     // Suppress only specific noise, allow pairing codes
//     if (message.includes('buffer timeout') || 
//         message.includes('transaction failed') ||
//         message.includes('failed to decrypt') ||
//         message.includes('received error in ack') ||
//         message.includes('sessionerror') ||
//         message.includes('bad mac') ||
//         message.includes('stream errored') ||
//         message.includes('baileys') ||
//         message.includes('whatsapp') ||
//         message.includes('ws')) {
//         return;
//     }
    
//     // Allow our formatted logs and pairing codes
//     originalConsoleLog.apply(console, args);
// };

// console.error = function(...args) {
//     const message = args.join(' ').toLowerCase();
    
//     // Only show critical errors
//     if (message.includes('fatal') || message.includes('critical')) {
//         originalConsoleError.apply(console, args);
//     }
// };

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let OWNER_CLEAN_JID = null;
// let OWNER_CLEAN_NUMBER = null;
// let OWNER_LID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;
// let CURRENT_PREFIX = PREFIX;
// let BOT_MODE = 'public';
// let WHITELIST = new Set();
// let AUTO_LINK_ENABLED = true;
// let AUTO_CONNECT_COMMAND_ENABLED = true;
// let AUTO_ULTIMATE_FIX_ENABLED = true;
// let isWaitingForPairingCode = false;
// let RESTART_AUTO_FIX_ENABLED = true;
// let STATUS_WATCHER = null; // NEW: Status watcher instance

// // ====== CLEAN TERMINAL HEADER ======
// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STATUS WATCHER')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔧 Auto Fix: ✅ ENABLED
// ║   🔄 Restart Fix: ✅ ENABLED
// ║   👁️ Status Watcher: ✅ INTEGRATED
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Clean logging
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white,
//         fix: chalk.cyan,
//         connection: chalk.green,
//         pairing: chalk.magenta,
//         restart: chalk.magenta,
//         status: chalk.cyan.bold // NEW: Status watcher logs
//     };
    
//     const color = colors[type] || chalk.white;
//     const timestamp = new Date().toLocaleTimeString();
//     const formatted = `[${timestamp}] ${message}`;
//     originalConsoleLog(color(formatted));
// }

// // ====== HELPER FUNCTIONS ======
// function existsSync(path) {
//     try {
//         return fs.existsSync(path);
//     } catch {
//         return false;
//     }
// }

// function readFileSync(path, encoding = 'utf8') {
//     try {
//         return fs.readFileSync(path, encoding);
//     } catch {
//         return '';
//     }
// }

// function writeFileSync(path, data) {
//     try {
//         return fs.writeFileSync(path, data);
//     } catch {
//         return;
//     }
// }

// // ====== JID/LID HANDLING SYSTEM ======
// class JidManager {
//     constructor() {
//         this.ownerJids = new Set();
//         this.ownerLids = new Set();
//         this.owner = null;
//         this.ownerFileData = {};
//         this.originalIsOwner = null;
        
//         this.loadOwnerData();
//         this.loadWhitelist();
        
//         log(`JID Manager initialized. Current owner: ${this.owner?.cleanNumber || 'None'}`, 'success');
//     }
    
//     loadOwnerData() {
//         try {
//             if (existsSync(OWNER_FILE)) {
//                 this.ownerFileData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
//                 const ownerJid = this.ownerFileData.OWNER_JID;
//                 const ownerNumber = this.ownerFileData.OWNER_NUMBER;
                
//                 if (ownerJid) {
//                     const cleaned = this.cleanJid(ownerJid);
                    
//                     this.owner = {
//                         rawJid: ownerJid,
//                         cleanJid: cleaned.cleanJid,
//                         cleanNumber: cleaned.cleanNumber,
//                         isLid: cleaned.isLid,
//                         linkedAt: this.ownerFileData.linkedAt || new Date().toISOString()
//                     };
                    
//                     this.ownerJids.clear();
//                     this.ownerLids.clear();
                    
//                     this.ownerJids.add(cleaned.cleanJid);
//                     this.ownerJids.add(ownerJid);
                    
//                     if (cleaned.isLid) {
//                         this.ownerLids.add(ownerJid);
//                         const lidNumber = ownerJid.split('@')[0];
//                         this.ownerLids.add(lidNumber);
//                         OWNER_LID = ownerJid;
//                     }
                    
//                     if (this.ownerFileData.verifiedLIDs && Array.isArray(this.ownerFileData.verifiedLIDs)) {
//                         this.ownerFileData.verifiedLIDs.forEach(lid => {
//                             if (lid && lid.includes('@lid')) {
//                                 this.ownerLids.add(lid);
//                                 const lidNum = lid.split('@')[0];
//                                 this.ownerLids.add(lidNum);
//                             }
//                         });
//                     }
                    
//                     OWNER_JID = ownerJid;
//                     OWNER_NUMBER = ownerNumber;
//                     OWNER_CLEAN_JID = cleaned.cleanJid;
//                     OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                    
//                     log(`Loaded owner data: ${cleaned.cleanJid}`, 'success');
//                 }
//             }
//         } catch {
//             // Silent fail
//         }
//     }
    
//     loadWhitelist() {
//         try {
//             if (existsSync(WHITELIST_FILE)) {
//                 const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
//                 if (data.whitelist && Array.isArray(data.whitelist)) {
//                     data.whitelist.forEach(item => {
//                         WHITELIST.add(item);
//                     });
//                 }
//             }
//         } catch {
//             // Silent fail
//         }
//     }
    
//     cleanJid(jid) {
//         if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
//         const isLid = jid.includes('@lid');
        
//         if (isLid) {
//             const lidNumber = jid.split('@')[0];
//             return {
//                 raw: jid,
//                 cleanJid: jid,
//                 cleanNumber: lidNumber,
//                 isLid: true,
//                 server: 'lid'
//             };
//         }
        
//         const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
//         const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
//         const cleanNumber = numberPart.replace(/[^0-9]/g, '');
//         const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
//         const cleanJid = `${normalizedNumber}@${serverPart}`;
        
//         return {
//             raw: jid,
//             cleanJid: cleanJid,
//             cleanNumber: normalizedNumber,
//             isLid: false,
//             hasDeviceSuffix: deviceSuffix !== undefined,
//             deviceSuffix: deviceSuffix,
//             server: serverPart
//         };
//     }
    
//     isOwner(msg) {
//         if (!msg || !msg.key) return false;
        
//         const chatJid = msg.key.remoteJid;
//         const participant = msg.key.participant;
//         const senderJid = participant || chatJid;
//         const cleaned = this.cleanJid(senderJid);
        
//         if (!this.owner || !this.owner.cleanNumber) {
//             return false;
//         }
        
//         if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
//             return true;
//         }
        
//         if (cleaned.isLid) {
//             const lidNumber = cleaned.cleanNumber;
            
//             if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) {
//                 return true;
//             }
            
//             if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) {
//                 return true;
//             }
//         }
        
//         if (this.owner.cleanNumber && cleaned.cleanNumber) {
//             if (this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
//                 return false;
//             }
//         }
        
//         return false;
//     }
    
//     isSimilarNumber(num1, num2) {
//         if (!num1 || !num2) return false;
        
//         if (num1 === num2) return true;
        
//         if (num1.includes(num2) || num2.includes(num1)) {
//             return true;
//         }
        
//         if (num1.length >= 6 && num2.length >= 6) {
//             const last6Num1 = num1.slice(-6);
//             const last6Num2 = num2.slice(-6);
//             if (last6Num1 === last6Num2) {
//                 return true;
//             }
//         }
        
//         return false;
//     }
    
//     setNewOwner(newJid, isAutoLinked = false) {
//         try {
//             const cleaned = this.cleanJid(newJid);
            
//             this.ownerJids.clear();
//             this.ownerLids.clear();
//             WHITELIST.clear();
            
//             this.owner = {
//                 rawJid: newJid,
//                 cleanJid: cleaned.cleanJid,
//                 cleanNumber: cleaned.cleanNumber,
//                 isLid: cleaned.isLid,
//                 linkedAt: new Date().toISOString(),
//                 autoLinked: isAutoLinked
//             };
            
//             this.ownerJids.add(cleaned.cleanJid);
//             this.ownerJids.add(newJid);
            
//             if (cleaned.isLid) {
//                 this.ownerLids.add(newJid);
//                 const lidNumber = newJid.split('@')[0];
//                 this.ownerLids.add(lidNumber);
//                 OWNER_LID = newJid;
//             } else {
//                 OWNER_LID = null;
//             }
            
//             OWNER_JID = newJid;
//             OWNER_NUMBER = cleaned.cleanNumber;
//             OWNER_CLEAN_JID = cleaned.cleanJid;
//             OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            
//             const ownerData = {
//                 OWNER_JID: newJid,
//                 OWNER_NUMBER: cleaned.cleanNumber,
//                 OWNER_CLEAN_JID: cleaned.cleanJid,
//                 OWNER_CLEAN_NUMBER: cleaned.cleanNumber,
//                 ownerLID: cleaned.isLid ? newJid : null,
//                 verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
//                 linkedAt: new Date().toISOString(),
//                 autoLinked: isAutoLinked,
//                 previousOwnerCleared: true,
//                 version: VERSION
//             };
            
//             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            
//             const whitelistData = {
//                 whitelist: [],
//                 updatedAt: new Date().toISOString(),
//                 note: "Cleared by new owner linking"
//             };
//             writeFileSync(WHITELIST_FILE, JSON.stringify(whitelistData, null, 2));
            
//             log(`New owner set: ${cleaned.cleanJid}`, 'success');
            
//             return {
//                 success: true,
//                 owner: this.owner,
//                 isLid: cleaned.isLid
//             };
            
//         } catch {
//             return { success: false, error: 'Failed to set new owner' };
//         }
//     }
    
//     addAdditionalDevice(jid) {
//         try {
//             if (!this.owner) return false;
            
//             const cleaned = this.cleanJid(jid);
            
//             if (!this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
//                 return false;
//             }
            
//             if (cleaned.isLid) {
//                 this.ownerLids.add(jid);
//                 const lidNumber = jid.split('@')[0];
//                 this.ownerLids.add(lidNumber);
//             } else {
//                 this.ownerJids.add(cleaned.cleanJid);
//                 this.ownerJids.add(jid);
//             }
            
//             this.saveOwnerData();
            
//             return true;
//         } catch {
//             return false;
//         }
//     }
    
//     saveOwnerData() {
//         try {
//             if (!this.owner) return false;
            
//             const ownerData = {
//                 OWNER_JID: this.owner.rawJid,
//                 OWNER_NUMBER: this.owner.cleanNumber,
//                 OWNER_CLEAN_JID: this.owner.cleanJid,
//                 OWNER_CLEAN_NUMBER: this.owner.cleanNumber,
//                 ownerLID: this.owner.isLid ? this.owner.rawJid : OWNER_LID,
//                 verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
//                 ownerJIDs: Array.from(this.ownerJids),
//                 linkedAt: this.owner.linkedAt,
//                 updatedAt: new Date().toISOString(),
//                 version: VERSION
//             };
            
//             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
//             return true;
//         } catch {
//             return false;
//         }
//     }
    
//     saveWhitelist() {
//         try {
//             const data = {
//                 whitelist: Array.from(WHITELIST),
//                 updatedAt: new Date().toISOString()
//             };
//             writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
//         } catch {
//             // Silent fail
//         }
//     }
    
//     getOwnerInfo() {
//         return {
//             ownerJid: this.owner?.cleanJid || null,
//             ownerNumber: this.owner?.cleanNumber || null,
//             ownerLid: OWNER_LID || null,
//             jidCount: this.ownerJids.size,
//             lidCount: this.ownerLids.size,
//             whitelistCount: WHITELIST.size,
//             isLid: this.owner?.isLid || false,
//             linkedAt: this.owner?.linkedAt || null
//         };
//     }
    
//     clearAllData() {
//         this.ownerJids.clear();
//         this.ownerLids.clear();
//         WHITELIST.clear();
//         this.owner = null;
        
//         OWNER_JID = null;
//         OWNER_NUMBER = null;
//         OWNER_CLEAN_JID = null;
//         OWNER_CLEAN_NUMBER = null;
//         OWNER_LID = null;
        
//         log(`Cleared all owner data`, 'warning');
//         return true;
//     }
// }

// // Initialize JID Manager
// const jidManager = new JidManager();

// // ====== WHATSAPP STATUS WATCHER SYSTEM ======
// class StatusWatcher {
//     constructor(socket) {
//         this.socket = socket;
//         this.watching = false;
//         this.statusHistory = new Map();
//         this.autoView = false;
//         this.viewedStatuses = new Set();
//         this.lastCheck = Date.now();
//         this.checkInterval = null;
//         this.statusLogs = [];
        
//         // Load previously viewed statuses
//         this.loadViewedStatuses();
//         this.loadStatusLogs();
        
//         this.setupEventListeners();
        
//         log(`Status Watcher initialized`, 'status');
//     }
    
//     loadViewedStatuses() {
//         try {
//             if (existsSync('./viewed_statuses.json')) {
//                 const data = JSON.parse(readFileSync('./viewed_statuses.json', 'utf8'));
//                 if (Array.isArray(data.viewed)) {
//                     data.viewed.forEach(id => this.viewedStatuses.add(id));
//                 }
//             }
//         } catch (error) {
//             log('Could not load viewed status history', 'warning');
//         }
//     }
    
//     loadStatusLogs() {
//         try {
//             if (existsSync(STATUS_LOG_FILE)) {
//                 const data = JSON.parse(readFileSync(STATUS_LOG_FILE, 'utf8'));
//                 if (Array.isArray(data.logs)) {
//                     this.statusLogs = data.logs;
//                 }
//             }
//         } catch (error) {
//             log('Could not load status logs', 'warning');
//         }
//     }
    
//     saveViewedStatuses() {
//         try {
//             const data = {
//                 viewed: Array.from(this.viewedStatuses),
//                 updatedAt: new Date().toISOString(),
//                 count: this.viewedStatuses.size
//             };
//             writeFileSync('./viewed_statuses.json', JSON.stringify(data, null, 2));
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     saveStatusLogs() {
//         try {
//             const data = {
//                 logs: this.statusLogs.slice(-1000), // Keep last 1000 logs
//                 updatedAt: new Date().toISOString(),
//                 count: this.statusLogs.length
//             };
//             writeFileSync(STATUS_LOG_FILE, JSON.stringify(data, null, 2));
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     setupEventListeners() {
//         if (!this.socket || !this.socket.ev) return;
        
//         // Listen for status updates
//         this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify' || !this.watching) return;
            
//             for (const msg of messages) {
//                 if (msg.key?.remoteJid === 'status@broadcast') {
//                     await this.handleStatusUpdate(msg);
//                 }
//             }
//         });
        
//         // Listen for presence updates (status changes)
//         this.socket.ev.on('presence.update', (update) => {
//             if (this.watching && update.status) {
//                 this.handlePresenceUpdate(update);
//             }
//         });
//     }
    
//     async handleStatusUpdate(msg) {
//         try {
//             if (!msg || !msg.message) return;
            
//             const statusId = msg.key.id;
//             const timestamp = msg.messageTimestamp || Date.now();
            
//             // Skip if already processed
//             if (this.statusHistory.has(statusId)) return;
            
//             // Extract status info
//             const statusInfo = this.extractStatusInfo(msg);
            
//             if (!statusInfo.author) return;
            
//             // Store in history
//             this.statusHistory.set(statusId, {
//                 ...statusInfo,
//                 id: statusId,
//                 timestamp: timestamp,
//                 detectedAt: Date.now(),
//                 viewed: false
//             });
            
//             // Log status detection
//             this.logStatusDetection(statusInfo);
            
//             // Auto-view if enabled
//             if (this.autoView) {
//                 await this.markStatusAsViewed(statusId);
//                 this.viewedStatuses.add(statusId);
//                 this.statusHistory.get(statusId).viewed = true;
//                 this.statusHistory.get(statusId).viewedAt = Date.now();
//             }
            
//             // Save log
//             this.statusLogs.push({
//                 ...statusInfo,
//                 id: statusId,
//                 timestamp: new Date(timestamp * 1000).toISOString(),
//                 detectedAt: new Date().toISOString(),
//                 autoViewed: this.autoView
//             });
            
//             // Save periodically
//             if (this.statusLogs.length % 10 === 0) {
//                 this.saveStatusLogs();
//             }
            
//             // Prevent memory leak
//             if (this.statusHistory.size > 1000) {
//                 const oldestKey = this.statusHistory.keys().next().value;
//                 this.statusHistory.delete(oldestKey);
//             }
            
//         } catch (error) {
//             log(`Error handling status update: ${error.message}`, 'error');
//         }
//     }
    
//     extractStatusInfo(msg) {
//         try {
//             const message = msg.message;
//             let type = 'unknown';
//             let caption = '';
//             let author = '';
            
//             // Try to get author info
//             if (msg.key.participant) {
//                 author = msg.key.participant;
//             }
            
//             // Determine status type and content
//             if (message.imageMessage) {
//                 type = 'image';
//                 caption = message.imageMessage.caption || '';
//             } else if (message.videoMessage) {
//                 type = 'video';
//                 caption = message.videoMessage.caption || '';
//             } else if (message.extendedTextMessage) {
//                 type = 'text';
//                 caption = message.extendedTextMessage.text || '';
//             } else if (message.conversation) {
//                 type = 'text';
//                 caption = message.conversation;
//             }
            
//             return {
//                 author,
//                 type,
//                 caption: caption.substring(0, 200), // Limit caption length
//                 timestamp: msg.messageTimestamp || Date.now()
//             };
            
//         } catch (error) {
//             return {
//                 author: 'unknown',
//                 type: 'unknown',
//                 caption: '',
//                 timestamp: Date.now()
//             };
//         }
//     }
    
//     logStatusDetection(statusInfo) {
//         const currentTime = new Date().toLocaleTimeString();
//         const typeEmoji = this.getTypeEmoji(statusInfo.type);
        
//         console.log(chalk.magenta(`
// ╔══════════════════════════════════════════╗
// ║      📱 STATUS UPDATE DETECTED           ║
// ╠══════════════════════════════════════════╣
// ║  🕒 Time: ${currentTime.padEnd(27)} ║
// ║  👤 Author: ${statusInfo.author.substring(0, 20).padEnd(22)} ║
// ║  📊 Type: ${typeEmoji} ${statusInfo.type.padEnd(20)} ║
// ║  👁️  Auto View: ${(this.autoView ? '✅ ON' : '❌ OFF').padEnd(23)} ║
// ╚══════════════════════════════════════════╝
// `));
        
//         if (statusInfo.caption) {
//             console.log(chalk.cyan(`   📝 Caption: ${statusInfo.caption.substring(0, 50)}${statusInfo.caption.length > 50 ? '...' : ''}`));
//         }
        
//         log(`Status detected from ${statusInfo.author}: ${statusInfo.type}`, 'status');
//     }
    
//     getTypeEmoji(type) {
//         const emojis = {
//             'image': '🖼️',
//             'video': '🎬',
//             'text': '📝',
//             'audio': '🎵',
//             'sticker': '🩹',
//             'document': '📄',
//             'unknown': '❓'
//         };
//         return emojis[type] || emojis.unknown;
//     }
    
//     handlePresenceUpdate(update) {
//         if (!update.id || !update.status) return;
        
//         // Log status presence updates
//         log(`Presence update: ${update.id} - ${update.status}`, 'status');
//     }
    
//     async startWatching() {
//         if (this.watching) {
//             log('Status watcher already running', 'warning');
//             return;
//         }
        
//         this.watching = true;
        
//         // Start periodic check
//         if (this.checkInterval) {
//             clearInterval(this.checkInterval);
//         }
        
//         this.checkInterval = setInterval(() => {
//             this.manualStatusCheck();
//         }, 45000); // Check every 45 seconds
        
//         log('Status watcher started', 'success');
        
//         console.log(chalk.green(`
// ╔══════════════════════════════════════════╗
// ║      👁️ STATUS WATCHER ACTIVATED         ║
// ╠══════════════════════════════════════════╣
// ║  ✅ Detection: ACTIVE                    ║
// ║  🔍 Auto View: ${this.autoView ? '✅ ENABLED' : '❌ DISABLED'}           ║
// ║  📊 History: ${this.statusHistory.size} statuses          ║
// ║  📝 Logs: ${this.statusLogs.length} entries              ║
// ╚══════════════════════════════════════════╝
// `));
        
//         // Initial manual check
//         await this.manualStatusCheck();
//     }
    
//     stopWatching() {
//         if (!this.watching) {
//             log('Status watcher already stopped', 'warning');
//             return;
//         }
        
//         this.watching = false;
        
//         if (this.checkInterval) {
//             clearInterval(this.checkInterval);
//             this.checkInterval = null;
//         }
        
//         // Save data
//         this.saveViewedStatuses();
//         this.saveStatusLogs();
        
//         log('Status watcher stopped', 'warning');
        
//         console.log(chalk.yellow(`
// ╔══════════════════════════════════════════╗
// ║      ⏹️ STATUS WATCHER STOPPED           ║
// ╠══════════════════════════════════════════╣
// ║  ❌ Detection: INACTIVE                  ║
// ║  📊 Total detected: ${this.statusHistory.size}           ║
// ║  ✅ Total viewed: ${this.viewedStatuses.size}            ║
// ║  📝 Logs saved: ${this.statusLogs.length} entries        ║
// ╚══════════════════════════════════════════╝
// `));
//     }
    
//     async manualStatusCheck() {
//         if (!this.watching || !this.socket) return;
        
//         try {
//             // Try to fetch status updates
//             if (this.socket.fetchStatusUpdates) {
//                 const updates = await this.socket.fetchStatusUpdates();
//                 if (updates && Array.isArray(updates)) {
//                     updates.forEach(update => {
//                         if (update.id && !this.statusHistory.has(update.id)) {
//                             this.handleStatusUpdate({
//                                 key: { id: update.id, remoteJid: 'status@broadcast' },
//                                 message: update,
//                                 messageTimestamp: update.t || Date.now()
//                             });
//                         }
//                     });
//                 }
//             }
//         } catch (error) {
//             log(`Manual status check failed: ${error.message}`, 'error');
//         }
//     }
    
//     async markStatusAsViewed(statusId) {
//         try {
//             if (!this.socket || !statusId) return false;
            
//             // Try to mark status as viewed
//             // Note: This depends on WhatsApp Web API capabilities
            
//             log(`Status marked as viewed: ${statusId.substring(0, 10)}...`, 'status');
//             return true;
            
//         } catch (error) {
//             log(`Error marking status as viewed: ${error.message}`, 'error');
//             return false;
//         }
//     }
    
//     toggleAutoView() {
//         this.autoView = !this.autoView;
        
//         console.log(chalk.cyan(`
// ╔══════════════════════════════════════════╗
// ║      👁️ AUTO-VIEW STATUS                ║
// ╠══════════════════════════════════════════╣
// ║  Status: ${this.autoView ? '✅ ENABLED' : '❌ DISABLED'}                 ║
// ║  Detected: ${this.statusHistory.size} statuses          ║
// ║  Viewed: ${this.viewedStatuses.size} statuses            ║
// ║  Logs: ${this.statusLogs.length} entries                ║
// ╚══════════════════════════════════════════╝
// `));
        
//         return this.autoView;
//     }
    
//     getStats() {
//         return {
//             watching: this.watching,
//             autoView: this.autoView,
//             totalDetected: this.statusHistory.size,
//             totalViewed: this.viewedStatuses.size,
//             totalLogs: this.statusLogs.length,
//             lastCheck: new Date(this.lastCheck).toLocaleTimeString()
//         };
//     }
    
//     getRecentStatuses(limit = 5) {
//         const statuses = Array.from(this.statusHistory.values())
//             .sort((a, b) => b.timestamp - a.timestamp)
//             .slice(0, limit)
//             .map(status => ({
//                 author: status.author,
//                 type: status.type,
//                 caption: status.caption || '(No caption)',
//                 time: new Date(status.timestamp * 1000).toLocaleTimeString(),
//                 viewed: status.viewed ? '✅' : '👁️'
//             }));
        
//         return statuses;
//     }
    
//     getStatusLogs(limit = 10) {
//         return this.statusLogs
//             .slice(-limit)
//             .reverse()
//             .map(log => ({
//                 author: log.author,
//                 type: log.type,
//                 caption: log.caption,
//                 time: new Date(log.detectedAt).toLocaleString(),
//                 autoViewed: log.autoViewed
//             }));
//     }
// }

// // ====== ULTIMATE FIX SYSTEM WITH RESTART SUPPORT ======
// class UltimateFixSystem {
//     constructor() {
//         this.fixedJids = new Set();
//         this.fixApplied = false;
//         this.editingMessages = new Map();
//         this.restartFixAttempted = false;
//     }
    
//     async applyUltimateFix(sock, senderJid, cleaned, isFirstUser = false, isRestart = false) {
//         try {
//             const fixType = isRestart ? 'RESTART' : (isFirstUser ? 'FIRST' : 'NORMAL');
//             log(`Applying Ultimate Fix (${fixType}) for: ${cleaned.cleanJid}`, 'fix');
            
//             const progressMsg = await this.sendFixProgressMessage(sock, senderJid, `🚀 Starting ${isRestart ? 'Restart ' : ''}Ultimate Fix System`, 0);
            
//             // ====== STEP 1: Store original isOwner method ======
//             await this.updateProgress(sock, senderJid, progressMsg, 10, 'Storing original methods...');
//             const originalIsOwner = jidManager.isOwner;
//             jidManager.originalIsOwner = originalIsOwner;
            
//             // ====== STEP 2: Patch isOwner method ======
//             await this.updateProgress(sock, senderJid, progressMsg, 25, 'Patching isOwner method...');
            
//             jidManager.isOwner = function(message) {
//                 try {
//                     const isFromMe = message?.key?.fromMe;
                    
//                     if (isFromMe) {
//                         return true;
//                     }
                    
//                     if (!this.owner || !this.owner.cleanNumber) {
//                         this.loadOwnerDataFromFile();
//                     }
                    
//                     return originalIsOwner.call(this, message);
                    
//                 } catch {
//                     return message?.key?.fromMe || false;
//                 }
//             };
            
//             // ====== STEP 3: Add loadOwnerDataFromFile method ======
//             await this.updateProgress(sock, senderJid, progressMsg, 40, 'Adding loadOwnerDataFromFile...');
            
//             if (!jidManager.loadOwnerDataFromFile) {
//                 jidManager.loadOwnerDataFromFile = function() {
//                     try {
//                         if (existsSync('./owner.json')) {
//                             const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                            
//                             let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
//                             let cleanJid = data.OWNER_CLEAN_JID || data.OWNER_JID;
                            
//                             if (cleanNumber && cleanNumber.includes(':')) {
//                                 cleanNumber = cleanNumber.split(':')[0];
//                             }
//                             if (cleanJid && cleanJid.includes(':74')) {
//                                 cleanJid = cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
//                             }
                            
//                             this.owner = {
//                                 cleanNumber: cleanNumber,
//                                 cleanJid: cleanJid,
//                                 rawJid: data.OWNER_JID,
//                                 isLid: cleanJid?.includes('@lid') || false
//                             };
                            
//                             return true;
//                         }
//                     } catch {
//                         // Silent fail
//                     }
//                     return false;
//                 };
//             }
            
//             jidManager.loadOwnerDataFromFile();
            
//             // ====== STEP 4: Update global variables ======
//             await this.updateProgress(sock, senderJid, progressMsg, 60, 'Updating global variables...');
            
//             const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : jidManager.owner || {};
            
//             global.OWNER_NUMBER = ownerInfo.cleanNumber || cleaned.cleanNumber;
//             global.OWNER_CLEAN_NUMBER = global.OWNER_NUMBER;
//             global.OWNER_JID = ownerInfo.cleanJid || cleaned.cleanJid;
//             global.OWNER_CLEAN_JID = global.OWNER_JID;
            
//             // ====== STEP 5: Create LID mapping if needed ======
//             await this.updateProgress(sock, senderJid, progressMsg, 75, 'Creating LID mappings...');
            
//             if (cleaned.isLid) {
//                 const lidMappingFile = './lid_mappings.json';
//                 let lidMappings = {};
                
//                 if (existsSync(lidMappingFile)) {
//                     try {
//                         lidMappings = JSON.parse(readFileSync(lidMappingFile, 'utf8'));
//                     } catch {
//                         // ignore
//                     }
//                 }
                
//                 lidMappings[cleaned.cleanNumber] = cleaned.cleanJid;
//                 writeFileSync(lidMappingFile, JSON.stringify(lidMappings, null, 2));
//             }
            
//             // ====== STEP 6: Mark as fixed ======
//             await this.updateProgress(sock, senderJid, progressMsg, 90, 'Finalizing fix...');
            
//             this.fixedJids.add(senderJid);
//             this.fixApplied = true;
            
//             // ====== STEP 7: Final success message ======
//             await this.updateProgress(sock, senderJid, progressMsg, 100, 'Ultimate Fix Complete!');
            
//             const fixLog = `🚀 *${isRestart ? 'RESTART ' : ''}ULTIMATE FIX COMPLETE*\n\n` +
//                          `✅ Fix applied successfully!\n` +
//                          `📱 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
//                          `🔧 Status: ✅ FIXED\n` +
//                          `👑 Owner Access: ✅ GRANTED\n\n` +
//                          `🎉 You now have full owner access in ALL chats!\n` +
//                          `💬 Try using ${CURRENT_PREFIX}mode command to verify.`;
            
//             await sock.sendMessage(senderJid, { text: fixLog });
            
//             this.editingMessages.delete(senderJid);
            
//             log(`✅ Ultimate Fix applied (${fixType}): ${cleaned.cleanJid}`, 'success');
            
//             return {
//                 success: true,
//                 jid: cleaned.cleanJid,
//                 number: cleaned.cleanNumber,
//                 isLid: cleaned.isLid,
//                 isRestart: isRestart,
//                 fixesApplied: [
//                     'Patched isOwner() method',
//                     'Added loadOwnerDataFromFile()',
//                     'Updated global variables',
//                     'Created LID mapping'
//                 ]
//             };
            
//         } catch (error) {
//             log(`❌ Ultimate Fix failed: ${error.message}`, 'error');
//             return { success: false, error: 'Fix failed' };
//         }
//     }
    
//     async sendFixProgressMessage(sock, senderJid, initialText, progress = 0) {
//         try {
//             const progressBar = this.createProgressBar(progress);
//             const message = `${initialText}\n\n${progressBar}\n\n🔄 Progress: ${progress}%`;
            
//             const sentMsg = await sock.sendMessage(senderJid, { text: message });
//             this.editingMessages.set(senderJid, sentMsg.key);
//             return sentMsg;
//         } catch {
//             return null;
//         }
//     }
    
//     async updateProgress(sock, senderJid, originalMsg, progress, statusText) {
//         try {
//             const progressBar = this.createProgressBar(progress);
//             const message = `🚀 Applying Ultimate Fix\n\n${progressBar}\n\n${statusText}\n🔄 Progress: ${progress}%`;
            
//             if (originalMsg && originalMsg.key) {
//                 await sock.sendMessage(senderJid, { 
//                     text: message,
//                     edit: originalMsg.key 
//                 });
//             }
//         } catch {
//             // Silent fail
//         }
//     }
    
//     createProgressBar(percentage) {
//         const filledLength = Math.round(percentage / 5);
//         const emptyLength = 20 - filledLength;
//         const filledBar = '█'.repeat(filledLength);
//         const emptyBar = '░'.repeat(emptyLength);
//         return `[${filledBar}${emptyBar}]`;
//     }
    
//     isFixNeeded(jid) {
//         return !this.fixedJids.has(jid);
//     }
    
//     restoreOriginalMethods() {
//         try {
//             if (jidManager.originalIsOwner) {
//                 jidManager.isOwner = jidManager.originalIsOwner;
//             }
//             return true;
//         } catch {
//             return false;
//         }
//     }
    
//     shouldRunRestartFix(ownerJid) {
//         const hasOwnerFile = existsSync(OWNER_FILE);
//         const isFixNeeded = this.isFixNeeded(ownerJid);
//         const notAttempted = !this.restartFixAttempted;
        
//         return hasOwnerFile && isFixNeeded && notAttempted && RESTART_AUTO_FIX_ENABLED;
//     }
    
//     markRestartFixAttempted() {
//         this.restartFixAttempted = true;
//     }
// }

// // Initialize Ultimate Fix System
// const ultimateFixSystem = new UltimateFixSystem();

// // ====== AUTO-LINKING SYSTEM WITH RESTART SUPPORT ======
// class AutoLinkSystem {
//     constructor() {
//         this.linkAttempts = new Map();
//         this.MAX_ATTEMPTS = 3;
//     }
    
//     async shouldAutoLink(sock, msg) {
//         if (!AUTO_LINK_ENABLED) return false;
        
//         const senderJid = msg.key.participant || msg.key.remoteJid;
//         const cleaned = jidManager.cleanJid(senderJid);
        
//         if (!jidManager.owner || !jidManager.owner.cleanNumber) {
//             return await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
//         }
        
//         if (msg.key.fromMe) {
//             if (!jidManager.owner) {
//                 return await this.autoLinkNewOwner(sock, senderJid, cleaned, false);
//             }
//             return false;
//         }
        
//         if (jidManager.isOwner(msg)) {
//             return false;
//         }
        
//         const currentOwnerNumber = jidManager.owner.cleanNumber;
//         if (jidManager.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
//             const isDifferentDevice = !jidManager.ownerJids.has(cleaned.cleanJid) && 
//                                      !jidManager.ownerLids.has(senderJid);
            
//             if (isDifferentDevice) {
//                 jidManager.addAdditionalDevice(senderJid);
                
//                 if (AUTO_ULTIMATE_FIX_ENABLED && ultimateFixSystem.isFixNeeded(senderJid)) {
//                     setTimeout(async () => {
//                         await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, false);
//                     }, 1000);
//                 }
                
//                 await this.sendDeviceLinkedMessage(sock, senderJid, cleaned);
//                 return true;
//             }
//         }
        
//         return false;
//     }
    
//     async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
//         try {
//             const result = jidManager.setNewOwner(senderJid, true);
            
//             if (!result.success) {
//                 return false;
//             }
            
//             await this.sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser);
            
//             if (AUTO_ULTIMATE_FIX_ENABLED) {
//                 setTimeout(async () => {
//                     await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, isFirstUser);
//                 }, 1500);
//             }
            
//             setTimeout(async () => {
//                 await this.autoRunConnectCommand(sock, senderJid, cleaned);
//             }, 3000);
            
//             console.log(chalk.green(`
// ╔════════════════════════════════════════════════╗
// ║         🔗 AUTO-LINKING SUCCESS                ║
// ╠════════════════════════════════════════════════╣
// ║  ✅ New Owner: +${cleaned.cleanNumber}                  
// ║  🔗 JID: ${cleaned.cleanJid}
// ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// ║  🔧 Auto Fix: ✅ SCHEDULED
// ║  🔌 Auto Connect: ✅ SCHEDULED
// ╚════════════════════════════════════════════════╝
// `));
            
//             return true;
//         } catch {
//             return false;
//         }
//     }
    
//     async sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
//         try {
//             const currentTime = new Date().toLocaleTimeString();
            
//             let successMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
            
//             if (isFirstUser) {
//                 successMsg += `🎉 *WELCOME TO WOLF TECH*\n\n`;
//             } else {
//                 successMsg += `🔄 *NEW OWNER LINKED!*\n\n`;
//             }
            
//             successMsg += `✅ You have been automatically set as the bot owner!\n\n`;
            
//             successMsg += `📋 *Owner Information:*\n`;
//             successMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
//             successMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
//             successMsg += `├─ JID: ${cleaned.cleanJid}\n`;
//             successMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
//             successMsg += `├─ Mode: ${BOT_MODE}\n`;
//             successMsg += `├─ Linked: ${currentTime}\n`;
//             successMsg += `└─ Status: ✅ LINKED SUCCESSFULLY\n\n`;
            
//             successMsg += `🔧 *Auto Ultimate Fix:* Initializing... (1.5s)\n`;
//             successMsg += `🔌 *Auto Connect:* Initializing... (3s)\n\n`;
            
//             if (!isFirstUser) {
//                 successMsg += `⚠️ *Important:*\n`;
//                 successMsg += `• Previous owner data has been cleared\n`;
//                 successMsg += `• Only YOU can use owner commands now\n\n`;
//             }
            
//             successMsg += `⚡ *Next:* Ultimate Fix will run automatically...`;
            
//             await sock.sendMessage(senderJid, { text: successMsg });
            
//         } catch {
//             // Silent fail
//         }
//     }
    
//     async autoRunConnectCommand(sock, senderJid, cleaned) {
//         try {
//             if (!AUTO_CONNECT_COMMAND_ENABLED) return;
            
//             const fakeMsg = {
//                 key: {
//                     remoteJid: senderJid,
//                     fromMe: false,
//                     id: `auto-connect-${Date.now()}`,
//                     participant: senderJid
//                 },
//                 message: {
//                     conversation: `${CURRENT_PREFIX}connect`
//                 }
//             };
            
//             await handleConnectCommand(sock, fakeMsg, [], cleaned);
            
//         } catch {
//             // Silent fail
//         }
//     }
    
//     async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
//         try {
//             const message = `📱 *Device Linked!*\n\n` +
//                           `✅ Your device has been added to owner devices.\n` +
//                           `🔒 You can now use owner commands from this device.\n` +
//                           `🔄 Ultimate Fix will be applied automatically.`;
            
//             await sock.sendMessage(senderJid, { text: message });
//         } catch {
//             // Silent fail
//         }
//     }
// }

// // Initialize Auto Link System
// const autoLinkSystem = new AutoLinkSystem();

// // ====== CONNECT COMMAND HANDLER ======
// async function handleConnectCommand(sock, msg, args, cleaned) {
//     try {
//         const chatJid = msg.key.remoteJid || cleaned.cleanJid;
//         const currentTime = new Date().toLocaleTimeString();
        
//         const fixApplied = ultimateFixSystem.fixApplied && ultimateFixSystem.fixedJids.has(chatJid);
        
//         let connectMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
//         connectMsg += `🔌 *CONNECTION ESTABLISHED!*\n\n`;
        
//         connectMsg += `📋 *Owner Information:*\n`;
//         connectMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
//         connectMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
//         connectMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
//         connectMsg += `├─ Mode: ${BOT_MODE}\n`;
//         connectMsg += `├─ Connected: ${currentTime}\n`;
//         connectMsg += `└─ Ultimate Fix: ${fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n\n`;
        
//         const ownerInfo = jidManager.getOwnerInfo();
//         connectMsg += `🔗 *Connection Details:*\n`;
//         connectMsg += `├─ Status: ✅ Connected\n`;
//         connectMsg += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
//         connectMsg += `├─ Known LIDs: ${ownerInfo.lidCount}\n`;
//         connectMsg += `└─ Uptime: ${Math.floor(process.uptime()/60)} minutes\n\n`;
        
//         if (!fixApplied) {
//             connectMsg += `⚠️ *Recommendation:*\n`;
//             connectMsg += `Use ${CURRENT_PREFIX}ultimatefix to ensure owner access.\n\n`;
//         }
        
//         connectMsg += `📚 Use *${CURRENT_PREFIX}menu* to see commands.`;
        
//         await sock.sendMessage(chatJid, { text: connectMsg });
        
//         console.log(chalk.green(`
// ╔════════════════════════════════════════════════╗
// ║         🔌 AUTO-CONNECT COMMAND               ║
// ╠════════════════════════════════════════════════╣
// ║  ✅ Owner: +${cleaned.cleanNumber}                  
// ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// ║  🔧 Fix Status: ${fixApplied ? 'APPLIED' : 'NOT APPLIED'}
// ║  🕒 Time: ${currentTime}                 
// ╚════════════════════════════════════════════════╝
// `));
        
//         return true;
//     } catch {
//         return false;
//     }
// }

// // ====== STATUS WATCHER COMMANDS ======
// async function handleStatusWatcherCommands(sock, msg, args, prefix) {
//     const chatJid = msg.key.remoteJid;
//     const command = args[0]?.toLowerCase();
//     const isOwner = jidManager.isOwner(msg);
    
//     if (!isOwner) {
//         return sock.sendMessage(chatJid, {
//             text: '❌ *Owner Only Command*\nStatus watcher commands can only be used by the bot owner.'
//         });
//     }
    
//     if (!STATUS_WATCHER) {
//         return sock.sendMessage(chatJid, {
//             text: '❌ Status watcher not initialized. Wait for bot to connect.'
//         });
//     }
    
//     try {
//         switch (command) {
//             case 'start':
//                 await STATUS_WATCHER.startWatching();
//                 return sock.sendMessage(chatJid, {
//                     text: `✅ *Status Watcher Started*\n\n` +
//                          `📱 Status detection is now active\n` +
//                          `👁️ Auto-view: ${STATUS_WATCHER.autoView ? '✅ Enabled' : '❌ Disabled'}\n` +
//                          `📊 Detected: ${STATUS_WATCHER.statusHistory.size} statuses\n\n` +
//                          `Status updates will be logged in terminal.`
//                 });
                
//             case 'stop':
//                 STATUS_WATCHER.stopWatching();
//                 return sock.sendMessage(chatJid, {
//                     text: `⏹️ *Status Watcher Stopped*\n\n` +
//                          `📱 Status detection is now inactive\n` +
//                          `📊 Total detected: ${STATUS_WATCHER.statusHistory.size}\n` +
//                          `✅ Total viewed: ${STATUS_WATCHER.viewedStatuses.size}`
//                 });
                
//             case 'autoview':
//             case 'toggle':
//                 const newState = STATUS_WATCHER.toggleAutoView();
//                 return sock.sendMessage(chatJid, {
//                     text: `👁️ *Auto-View Status:* ${newState ? '✅ ENABLED' : '❌ DISABLED'}\n\n` +
//                          `Status updates will ${newState ? 'now be automatically marked as viewed.' : 'no longer be auto-viewed.'}`
//                 });
                
//             case 'stats':
//             case 'info':
//                 const stats = STATUS_WATCHER.getStats();
//                 const recent = STATUS_WATCHER.getRecentStatuses(3);
                
//                 let statsText = `📊 *STATUS WATCHER STATS*\n\n`;
//                 statsText += `🔍 Active: ${stats.watching ? '✅ Yes' : '❌ No'}\n`;
//                 statsText += `👁️ Auto-view: ${stats.autoView ? '✅ Enabled' : '❌ Disabled'}\n`;
//                 statsText += `📈 Detected: ${stats.totalDetected} statuses\n`;
//                 statsText += `✅ Viewed: ${stats.totalViewed} statuses\n`;
//                 statsText += `📝 Logs: ${stats.totalLogs} entries\n`;
//                 statsText += `🕒 Last check: ${stats.lastCheck}\n\n`;
                
//                 if (recent.length > 0) {
//                     statsText += `📱 *Recent Statuses:*\n`;
//                     recent.forEach((status, index) => {
//                         const timeAgo = 'Recently';
//                         statsText += `${index + 1}. ${status.author.split('@')[0]}: ${status.type} ${status.viewed}\n`;
//                     });
//                 }
                
//                 return sock.sendMessage(chatJid, { text: statsText });
                
//             case 'logs':
//                 const logs = STATUS_WATCHER.getStatusLogs(5);
                
//                 if (logs.length === 0) {
//                     return sock.sendMessage(chatJid, {
//                         text: '📭 No status logs found yet.'
//                     });
//                 }
                
//                 let logsText = `📝 *STATUS LOGS* (Last 5)\n\n`;
//                 logs.forEach((log, index) => {
//                     logsText += `${index + 1}. ${log.time.split(' ')[1]}\n`;
//                     logsText += `   👤 ${log.author.split('@')[0]}\n`;
//                     logsText += `   📊 ${log.type} ${log.autoViewed ? '✅' : '👁️'}\n`;
//                     if (log.caption) {
//                         logsText += `   💬 "${log.caption.substring(0, 30)}${log.caption.length > 30 ? '...' : ''}"\n`;
//                     }
//                     logsText += `\n`;
//                 });
                
//                 logsText += `Total logs: ${STATUS_WATCHER.statusLogs.length}`;
                
//                 return sock.sendMessage(chatJid, { text: logsText });
                
//             case 'help':
//             default:
//                 return sock.sendMessage(chatJid, {
//                     text: `📱 *STATUS WATCHER COMMANDS*\n\n` +
//                          `${prefix}status start - Start watching for status updates\n` +
//                          `${prefix}status stop - Stop watching\n` +
//                          `${prefix}status autoview - Toggle auto-viewing\n` +
//                          `${prefix}status stats - Show statistics\n` +
//                          `${prefix}status logs - Show recent logs\n` +
//                          `${prefix}status help - Show this help\n\n` +
//                          `*Note:* Status watcher automatically starts when bot connects.`
//                 });
//         }
//     } catch (error) {
//         log(`Status command error: ${error.message}`, 'error');
//         return sock.sendMessage(chatJid, {
//             text: `❌ Error executing status command: ${error.message}`
//         });
//     }
// }

// // ====== SILENT FUNCTIONS ======
// function isUserBlocked(jid) {
//     try {
//         if (existsSync(BLOCKED_USERS_FILE)) {
//             const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
//             return data.users && data.users.includes(jid);
//         }
//     } catch {
//         return false;
//     }
//     return false;
// }

// function checkBotMode(msg, commandName) {
//     try {
//         if (jidManager.isOwner(msg)) {
//             return true;
//         }
        
//         if (existsSync(BOT_MODE_FILE)) {
//             const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
//             BOT_MODE = modeData.mode || 'public';
//         } else {
//             BOT_MODE = 'public';
//         }
        
//         const chatJid = msg.key.remoteJid;
        
//         switch(BOT_MODE) {
//             case 'public':
//                 return true;
//             case 'private':
//                 return false;
//             case 'silent':
//                 return false;
//             case 'group-only':
//                 return chatJid.includes('@g.us');
//             case 'maintenance':
//                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
//                 return allowedCommands.includes(commandName);
//             default:
//                 return true;
//         }
//     } catch {
//         return true;
//     }
// }

// function loadPrefix() {
//     try {
//         if (existsSync(PREFIX_CONFIG_FILE)) {
//             const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
//             if (config.prefix && config.prefix.length <= 2) {
//                 CURRENT_PREFIX = config.prefix;
//             }
//         }
//     } catch {
//         // Silent fail
//     }
// }

// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
//             } catch {
//                 // Silent fail
//             }
//         }
//     }, 60 * 1000);
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// function ensureSessionDir() {
//     if (!existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//     }
// }

// function cleanSession() {
//     try {
//         if (existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//         }
//         return true;
//     } catch {
//         return false;
//     }
// }

// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!existsSync(absolutePath)) {
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default || commandModule;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`[${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch {
//                     // Silent fail
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch {
//         // Silent fail
//     }
// }

// // ====== LOGIN MANAGER ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 WOLFBOT - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.pairingCodeMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== ENHANCED CONNECTION HANDLER WITH RESTART FIX & STATUS WATCHER ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('Initializing WhatsApp connection...', 'info');
        
//         loadPrefix();
        
//         log('Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`Loaded ${commands.size} commands`, 'success');
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         // Silent logger
//         const silentLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => silentLogger
//         };
        
//         let state, saveCreds;
//         try {
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//         } catch {
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         const sock = makeWASocket({
//             version,
//             logger: silentLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000,
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             shouldIgnoreJid: (jid) => {
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0;
//         isWaitingForPairingCode = false;
        
//         // ====== ENHANCED CONNECTION HANDLER ======
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect, qr } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//                 isWaitingForPairingCode = false;
                
//                 // ====== INITIALIZE STATUS WATCHER ======
//                 STATUS_WATCHER = new StatusWatcher(sock);
//                 STATUS_WATCHER.startWatching(); // Auto-start status watching
                
//                 // ====== RESTART AUTO-FIX TRIGGER ======
//                 await triggerRestartAutoFix(sock);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
                
//                 // Stop status watcher
//                 if (STATUS_WATCHER) {
//                     STATUS_WATCHER.stopWatching();
//                 }
                
//                 await handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber);
//                 isWaitingForPairingCode = false;
//             }
            
//             // ====== PAIRING CODE LOGIC ======
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 if (!isWaitingForPairingCode) {
//                     isWaitingForPairingCode = true;
                    
//                     // Show initial message
//                     console.log(chalk.cyan('\n📱 CONNECTING TO WHATSAPP...'));
//                     console.log(chalk.yellow('Requesting 8-digit pairing code...'));
                    
//                     // Request pairing code with retry logic
//                     const requestPairingCode = async (attempt = 1) => {
//                         try {
//                             const code = await sock.requestPairingCode(phoneNumber);
                            
//                             const cleanCode = code.replace(/\s+/g, '');
//                             let formattedCode = cleanCode;
                            
//                             if (cleanCode.length === 8) {
//                                 formattedCode = `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}`;
//                             }
                            
//                             console.clear();
//                             console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
// ║ 📏 Length: ${chalk.cyan('8 characters'.padEnd(27))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
                            
//                             console.log(chalk.cyan('\n📱 INSTRUCTIONS:'));
//                             console.log(chalk.white('1. Open WhatsApp on your phone'));
//                             console.log(chalk.white('2. Go to Settings → Linked Devices'));
//                             console.log(chalk.white('3. Tap "Link a Device"'));
//                             console.log(chalk.white('4. Enter this 8-digit code:'));
//                             console.log(chalk.yellow.bold(`   ${formattedCode}`));
//                             console.log(chalk.white('5. Wait for connection...\n'));
                            
//                             console.log(chalk.gray('Note: The code is case-sensitive'));
//                             console.log(chalk.gray(`Raw code: ${cleanCode}`));
                            
//                             log(`8-digit pairing code generated: ${formattedCode}`, 'pairing');
                            
//                         } catch (error) {
//                             console.log(chalk.red(`\n❌ Attempt ${attempt}: Failed to get pairing code`));
                            
//                             if (attempt < 3) {
//                                 console.log(chalk.yellow(`Retrying in 5 seconds... (${attempt}/3)`));
//                                 await delay(5000);
//                                 await requestPairingCode(attempt + 1);
//                             } else {
//                                 console.log(chalk.red('❌ Max retries reached. Restarting connection...'));
//                                 isWaitingForPairingCode = false;
//                                 setTimeout(async () => {
//                                     await startBot(loginMode, phoneNumber);
//                                 }, 10000);
//                             }
//                         }
//                     };
                    
//                     setTimeout(() => {
//                         requestPairingCode(1);
//                     }, 3000);
//                 }
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 // Status updates handled by StatusWatcher
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         console.log(chalk.red('❌ Connection failed, retrying in 10 seconds...'));
//         setTimeout(async () => {
//             await startBot(loginMode, phoneNumber);
//         }, 10000);
//     }
// }

// // ====== RESTART AUTO-FIX TRIGGER ======
// async function triggerRestartAutoFix(sock) {
//     try {
//         // Only run if there's an existing owner
//         if (existsSync(OWNER_FILE) && sock.user?.id) {
//             const ownerJid = sock.user.id;
//             const cleaned = jidManager.cleanJid(ownerJid);
            
//             // Check if we should run restart fix
//             if (ultimateFixSystem.shouldRunRestartFix(ownerJid)) {
//                 log(`🔄 Triggering restart auto-fix for: ${ownerJid}`, 'restart');
                
//                 // Mark as attempted first
//                 ultimateFixSystem.markRestartFixAttempted();
                
//                 // Wait a moment for everything to stabilize
//                 await delay(2000);
                
//                 // Apply the restart fix
//                 const fixResult = await ultimateFixSystem.applyUltimateFix(sock, ownerJid, cleaned, false, true);
                
//                 if (fixResult.success) {
//                     // Send restart success message
//                     const restartMsg = `🔄 *BOT RESTARTED SUCCESSFULLY!*\n\n` +
//                                      `✅ *WOLFBOT* has been restarted\n` +
//                                      `🔧 Restart Ultimate Fix: ✅ APPLIED\n` +
//                                      `👑 Owner: +${cleaned.cleanNumber}\n` +
//                                      `📱 Device: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
//                                      `⚡ Version: ${VERSION}\n` +
//                                      `💬 Prefix: "${CURRENT_PREFIX}"\n` +
//                                      `👁️ Status Watcher: ✅ ACTIVE\n\n` +
//                                      `🎉 All features are now active!\n` +
//                                      `💬 Try using ${CURRENT_PREFIX}ping to verify.`;
                    
//                     await sock.sendMessage(ownerJid, { text: restartMsg });
                    
//                     console.log(chalk.green(`
// ╔════════════════════════════════════════════════╗
// ║         🔄 RESTART AUTO-FIX COMPLETE          ║
// ╠════════════════════════════════════════════════╣
// ║  ✅ Owner: +${cleaned.cleanNumber}                  
// ║  🔗 JID: ${ownerJid}
// ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// ║  🔧 Fix Status: ✅ APPLIED
// ║  👁️ Status Watcher: ✅ ACTIVE
// ║  🕒 Time: ${new Date().toLocaleTimeString()}                 
// ╚════════════════════════════════════════════════╝
// `));
                    
//                     log(`✅ Restart auto-fix completed successfully`, 'success');
//                 } else {
//                     log(`❌ Restart auto-fix failed`, 'error');
//                 }
//             } else {
//                 log(`ℹ️  Restart auto-fix not needed or already applied`, 'info');
                
//                 // Still send a restart notification
//                 if (existsSync(OWNER_FILE)) {
//                     const restartMsg = `🔄 *BOT RESTARTED*\n\n` +
//                                      `✅ *WOLFBOT* has been restarted\n` +
//                                      `👑 Owner: +${cleaned.cleanNumber}\n` +
//                                      `⚡ Version: ${VERSION}\n` +
//                                      `💬 Prefix: "${CURRENT_PREFIX}"\n` +
//                                      `🎛️ Mode: ${BOT_MODE}\n` +
//                                      `👁️ Status Watcher: ✅ ACTIVE\n\n` +
//                                      `🔧 Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ Already Applied' : '❌ Not Applied'}\n` +
//                                      `💬 Use ${CURRENT_PREFIX}ultimatefix if needed.`;
                    
//                     await sock.sendMessage(ownerJid, { text: restartMsg });
//                 }
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Restart auto-fix trigger error: ${error.message}`, 'warning');
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     const isFirstConnection = !existsSync(OWNER_FILE);
    
//     if (isFirstConnection) {
//         jidManager.clearAllData();
//         jidManager.setNewOwner(OWNER_JID, false);
//     } else {
//         jidManager.loadOwnerData();
//     }
    
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     // Clear console and show success
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('WOLFBOT ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${ownerInfo.ownerNumber}
// ║  🔧 Clean JID : ${ownerInfo.ownerJid}
// ║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  💬 Prefix : "${CURRENT_PREFIX}"
// ║  🎛️ Mode   : ${BOT_MODE}
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  🔧 AUTO ULTIMATE FIX : ✅ ENABLED
// ║  🔄 RESTART AUTO-FIX : ✅ ENABLED
// ║  👁️ STATUS WATCHER   : ✅ INITIALIZING
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     // Only send initial message if it's a first connection
//     if (isFirstConnection) {
//         try {
//             const connMsg = `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n` +
//                           `✅ Bot started successfully!\n\n` +
//                           `📋 *Owner Information:*\n` +
//                           `├─ Your Number: +${ownerInfo.ownerNumber}\n` +
//                           `├─ Device Type: ${ownerInfo.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n` +
//                           `├─ Prefix: "${CURRENT_PREFIX}"\n` +
//                           `├─ Mode: ${BOT_MODE}\n` +
//                           `├─ Connected: ${currentTime}\n` +
//                           `└─ Status: ✅ BOT ONLINE\n\n` +
//                           `🔧 *Auto Ultimate Fix:* Will run when you message first...\n` +
//                           `🔌 *Auto Connect:* Will run automatically\n` +
//                           `👁️ *Status Watcher:* ✅ ACTIVE (Detects status updates)\n\n` +
//                           `💬 Send any message to activate all features.`;
            
//             await sock.sendMessage(OWNER_JID, { text: connMsg });
            
//         } catch {
//             // Silent fail
//         }
//     }
// }

// async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const isConflict = statusCode === 409;
    
//     connectionAttempts++;
    
//     if (isConflict) {
//         const conflictDelay = 30000;
        
//         console.log(chalk.yellow(`\n⚠️ Device conflict detected. Reconnecting in 30 seconds...`));
        
//         setTimeout(async () => {
//             await startBot(loginMode, phoneNumber);
//         }, conflictDelay);
//         return;
//     }
    
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         cleanSession();
//     }
    
//     const baseDelay = 5000;
//     const maxDelay = 60000;
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             connectionAttempts = 0;
//             process.exit(1);
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const senderJid = msg.key.participant || chatId;
        
//         await autoLinkSystem.shouldAutoLink(sock, msg);
        
//         if (isUserBlocked(senderJid)) {
//             return;
//         }
        
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         if (textMsg.startsWith(CURRENT_PREFIX)) {
//             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
//             if (!checkBotMode(msg, commandName)) {
//                 if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
//                     return;
//                 }
//                 try {
//                     await sock.sendMessage(chatId, { 
//                         text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
//                     });
//                 } catch {
//                     // Silent fail
//                 }
//                 return;
//             }
            
//             // Handle status watcher commands
//             if (commandName === 'status' && args.length > 0) {
//                 await handleStatusWatcherCommands(sock, msg, args, CURRENT_PREFIX);
//                 return;
//             }
            
//             if (commandName === 'connect' || commandName === 'link') {
//                 const cleaned = jidManager.cleanJid(senderJid);
//                 await handleConnectCommand(sock, msg, args, cleaned);
//                 return;
//             }
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     if (command.ownerOnly && !jidManager.isOwner(msg)) {
//                         try {
//                             await sock.sendMessage(chatId, { 
//                                 text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
//                             });
//                         } catch {
//                             // Silent fail
//                         }
//                         return;
//                     }
                    
//                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
//                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
//                         OWNER_JID: OWNER_CLEAN_JID,
//                         OWNER_LID: OWNER_LID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => jidManager.isOwner(msg),
//                         jidManager,
//                         store,
//                         statusWatcher: STATUS_WATCHER // NEW: Pass status watcher to commands
//                     });
//                 } catch {
//                     // Silent fail
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch {
//         // Silent fail
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const isOwnerUser = jidManager.isOwner(msg);
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
//                 helpText += `Mode: ${BOT_MODE}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 // Add status watcher commands to help
//                 helpText += `*STATUS WATCHER*\n`;
//                 helpText += `${CURRENT_PREFIX}status start/stop/autoview/stats/logs\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 let statusInfo = '';
//                 if (STATUS_WATCHER) {
//                     const stats = STATUS_WATCHER.getStats();
//                     statusInfo = `👁️ Status Watcher: ${stats.watching ? '✅ Active' : '❌ Inactive'}\n`;
//                     statusInfo += `📊 Statuses detected: ${stats.totalDetected}\n`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n${statusInfo}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 if (args.length === 0) {
//                     let statusText = `📊 *BOT STATUS*\n\n`;
//                     statusText += `🟢 Status: Connected\n`;
//                     statusText += `👑 Owner: +${ownerInfo.ownerNumber}\n`;
//                     statusText += `⚡ Version: ${VERSION}\n`;
//                     statusText += `💬 Prefix: "${CURRENT_PREFIX}"\n`;
//                     statusText += `🎛️ Mode: ${BOT_MODE}\n`;
//                     statusText += `📊 Commands: ${commands.size}\n`;
//                     statusText += `⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes\n`;
                    
//                     if (STATUS_WATCHER) {
//                         const stats = STATUS_WATCHER.getStats();
//                         statusText += `\n👁️ *STATUS WATCHER*\n`;
//                         statusText += `Active: ${stats.watching ? '✅ Yes' : '❌ No'}\n`;
//                         statusText += `Auto-view: ${stats.autoView ? '✅ On' : '❌ Off'}\n`;
//                         statusText += `Detected: ${stats.totalDetected} statuses\n`;
//                         statusText += `Viewed: ${stats.totalViewed} statuses`;
//                     }
                    
//                     await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
//                 }
//                 break;
                
//             case 'clean':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
                
//             case 'ownerinfo':
//                 const senderJid = msg.key.participant || chatId;
//                 const cleaned = jidManager.cleanJid(senderJid);
                
//                 let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
//                 ownerInfoText += `📱 Your JID: ${senderJid}\n`;
//                 ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
//                 ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
//                 ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
//                 ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
//                 ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
//                 ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n`;
//                 ownerInfoText += `🔧 Auto Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n`;
                
//                 if (STATUS_WATCHER) {
//                     const stats = STATUS_WATCHER.getStats();
//                     ownerInfoText += `👁️ Status Watcher: ${stats.watching ? '✅ ACTIVE' : '❌ INACTIVE'}\n\n`;
//                 } else {
//                     ownerInfoText += `👁️ Status Watcher: ❌ NOT INITIALIZED\n\n`;
//                 }
                
//                 ownerInfoText += `*BOT OWNER DETAILS:*\n`;
//                 ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
//                 ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
//                 ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
//                 ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
//                 ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
//                 if (!isOwnerUser) {
//                     ownerInfoText += `\n\n⚠️ First message will auto-link if number matches.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: ownerInfoText
//                 }, { quoted: msg });
//                 break;
                
//             case 'resetowner':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: '🔄 Resetting owner data...\nNext message will set new owner automatically.'
//                 });
                
//                 jidManager.clearAllData();
//                 break;
                
//             case 'ultimatefix':
//             case 'solveowner':
//             case 'fixall':
//                 const fixSenderJid = msg.key.participant || chatId;
//                 const fixCleaned = jidManager.cleanJid(fixSenderJid);
                
//                 if (!jidManager.isOwner(msg) && !msg.key.fromMe) {
//                     await sock.sendMessage(chatId, {
//                         text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.\n\nFirst message will auto-link you as owner.'
//                     }, { quoted: msg });
//                     return;
//                 }
                
//                 const fixResult = await ultimateFixSystem.applyUltimateFix(sock, fixSenderJid, fixCleaned, false);
                
//                 if (fixResult.success) {
//                     await sock.sendMessage(chatId, {
//                         text: `🔧 *ULTIMATE FIX APPLIED*\n\n✅ Fix applied successfully!\n\n✅ You should now have full owner access in all chats!`
//                     }, { quoted: msg });
//                 } else {
//                     await sock.sendMessage(chatId, {
//                         text: `❌ *Ultimate Fix Failed*\n\nTry using ${CURRENT_PREFIX}resetowner first.`
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'statuswatch':
//             case 'swatch':
//                 // Redirect to status command
//                 await handleStatusWatcherCommands(sock, msg, ['help'], CURRENT_PREFIX);
//                 break;
//         }
//     } catch {
//         // Silent fail
//     }
// }
// // ====== SIMPLE STATUS DETECTOR ======
// // Add this single function to index.js
// function startStatusDetector(sock) {
//   if (global.statusDetectorStarted) return;
  
//   sock.ev.on('messages.upsert', ({ messages, type }) => {
//     if (type !== 'notify') return;
    
//     messages.forEach(msg => {
//       if (msg.key?.remoteJid === 'status@broadcast') {
//         const author = msg.key.participant || 'Unknown';
//         const shortAuthor = author.split('@')[0];
//         const time = new Date().toLocaleTimeString();
        
//         console.log('\n' + '✨'.repeat(40));
//         console.log('   📱 STATUS DETECTED!');
//         console.log('   👤 From:', shortAuthor);
//         console.log('   🕒 Time:', time);
//         console.log('✨'.repeat(40) + '\n');
//       }
//     });
//   });
  
//   global.statusDetectorStarted = true;
//   console.log('[STATUS] Detector started automatically');
// }

// // Call it when connection opens (around line 1400):
// // In handleSuccessfulConnection function, add:
// // startStatusDetector(sock);

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('Starting WOLFBOT with Status Watcher...', 'info');
        
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch {
//         setTimeout(async () => {
//             await main();
//         }, 10000);
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
    
//     // Save status watcher data
//     if (STATUS_WATCHER) {
//         STATUS_WATCHER.saveStatusLogs();
//         STATUS_WATCHER.saveViewedStatuses();
//     }
    
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', () => {
//     return;
// });

// process.on('unhandledRejection', () => {
//     return;
// });

// // Start the bot
// main().catch(() => {
//     process.exit(1);
// });

// // Activity monitor
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000;
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000);















// ====== SILENT WOLF BOT - AUTO STATUS VIEWER EDITION ======
// Includes WhatsApp Status Auto-Viewer System

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';
// In your main bot file
import antiimage from './commands/group/antiimage.js';
// In your main bot file
import antivideo from './commands/group/antivideo.js';
import antiaudio from './commands/group/antiaudio.js';
import antistatusmention from './commands/group/antistatusmention.js';
import antigrouplink from './commands/group/antigroup.js';

// ====== ENVIRONMENT SETUP ======
dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====== CONFIGURATION ======
const SESSION_DIR = './session';
const BOT_NAME = process.env.BOT_NAME || 'WOLFBOT';
const VERSION = '2.0.0'; // Auto Status Viewer Edition
const PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';
const AUTO_STATUS_CONFIG_FILE = './data/autoStatus.json'; // Auto status config

// ====== CLEAN CONSOLE SETUP ======
console.clear();

// Suppress unwanted logs but allow important ones
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function(...args) {
    const message = args.join(' ').toLowerCase();
    
    // Suppress only specific noise, allow pairing codes
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
    
    // Allow our formatted logs and pairing codes
    originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
    const message = args.join(' ').toLowerCase();
    
    // Only show critical errors
    if (message.includes('fatal') || message.includes('critical')) {
        originalConsoleError.apply(console, args);
    }
};

// Global variables
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
let CURRENT_PREFIX = PREFIX;
let BOT_MODE = 'public';
let WHITELIST = new Set();
let AUTO_LINK_ENABLED = true;
let AUTO_CONNECT_COMMAND_ENABLED = true;
let AUTO_ULTIMATE_FIX_ENABLED = true;
let isWaitingForPairingCode = false;
let RESTART_AUTO_FIX_ENABLED = true;
let AUTO_STATUS_ENABLED = false; // Auto status viewer state

// ====== CLEAN TERMINAL HEADER ======
console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('AUTO STATUS VIEWER')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
║   🔧 Auto Fix: ✅ ENABLED
║   🔄 Restart Fix: ✅ ENABLED
║   👁️ Auto Status: ❌ DISABLED
╚════════════════════════════════════════════════╝
`));

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
        status: chalk.cyan.bold // Status viewer logs
    };
    
    const color = colors[type] || chalk.white;
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    originalConsoleLog(color(formatted));
}

// ====== HELPER FUNCTIONS ======
function existsSync(path) {
    try {
        return fs.existsSync(path);
    } catch {
        return false;
    }
}

function readFileSync(path, encoding = 'utf8') {
    try {
        return fs.readFileSync(path, encoding);
    } catch {
        return '';
    }
}

function writeFileSync(path, data) {
    try {
        return fs.writeFileSync(path, data);
    } catch {
        return;
    }
}

// ====== AUTO STATUS DETECTOR ======
class StatusDetector {
    constructor() {
        this.detectionEnabled = true;
        this.statusLogs = [];
        this.lastDetection = null;
        this.setupDataDir();
        this.loadStatusLogs();
        
        log(`Status Detector initialized - Detection: ${this.detectionEnabled ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'status');
    }
    
    setupDataDir() {
        try {
            if (!existsSync('./data')) {
                fs.mkdirSync('./data', { recursive: true });
            }
        } catch (error) {
            log(`Error setting up data directory: ${error.message}`, 'error');
        }
    }
    
    loadStatusLogs() {
        try {
            if (existsSync('./data/status_detection_logs.json')) {
                const data = JSON.parse(readFileSync('./data/status_detection_logs.json', 'utf8'));
                if (Array.isArray(data.logs)) {
                    this.statusLogs = data.logs.slice(-100); // Keep only last 100
                }
            }
        } catch (error) {
            log(`Error loading status logs: ${error.message}`, 'warning');
        }
    }
    
    saveStatusLogs() {
        try {
            const data = {
                logs: this.statusLogs.slice(-1000), // Keep last 1000
                updatedAt: new Date().toISOString(),
                count: this.statusLogs.length
            };
            writeFileSync('./data/status_detection_logs.json', JSON.stringify(data, null, 2));
        } catch (error) {
            // Silent fail
        }
    }
    
    async detectStatusUpdate(msg) {
        try {
            if (!this.detectionEnabled) return null;
            
            const statusId = msg.key.id;
            const sender = msg.key.participant || 'unknown';
            const shortSender = sender.split('@')[0];
            const timestamp = msg.messageTimestamp || Date.now();
            const statusTime = new Date(timestamp * 1000).toLocaleTimeString();
            const detectTime = new Date().toLocaleTimeString();
            
            // Extract status information
            const statusInfo = this.extractStatusInfo(msg);
            
            // Show beautiful detection message
            this.showDetectionMessage(shortSender, statusId, statusTime, detectTime, statusInfo);
            
            // Add to logs
            const logEntry = {
                id: statusId,
                sender: shortSender,
                fullSender: sender,
                type: statusInfo.type,
                caption: statusInfo.caption,
                fileInfo: statusInfo.fileInfo,
                postedAt: statusTime,
                detectedAt: detectTime,
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
            log(`Error detecting status: ${error.message}`, 'error');
            return null;
        }
    }
    
    extractStatusInfo(msg) {
        try {
            const message = msg.message;
            let type = 'unknown';
            let caption = '';
            let fileInfo = '';
            
            // Determine status type and content
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
            } else if (message.documentMessage) {
                type = 'document';
                caption = message.documentMessage.title || message.documentMessage.fileName || '';
                const size = Math.round((message.documentMessage.fileLength || 0) / 1024);
                fileInfo = `📄 ${message.documentMessage.fileName || 'Document'} | ${size}KB`;
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
                caption: caption.substring(0, 200), // Limit caption length
                fileInfo
            };
            
        } catch (error) {
            return {
                type: 'unknown',
                caption: '',
                fileInfo: ''
            };
        }
    }
    
    showDetectionMessage(sender, statusId, postedTime, detectTime, statusInfo) {
        const typeEmoji = this.getTypeEmoji(statusInfo.type);
        
        console.log(chalk.magenta(`
╔════════════════════════════════════════════════════════╗
║               📱 STATUS DETECTED!                      ║
╠════════════════════════════════════════════════════════╣
║  👤 From: ${chalk.cyan(sender.padEnd(36))}║
║  🆔 ID: ${chalk.yellow(statusId.substring(0, 20).padEnd(33))}║
║  🕒 Posted: ${chalk.green(postedTime.padEnd(32))}║
║  🕐 Detected: ${chalk.green(detectTime.padEnd(30))}║
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
        
        console.log(chalk.gray(`   Detection #${this.statusLogs.length}`));
    }
    
    getTypeEmoji(type) {
        const emojis = {
            'image': '🖼️',
            'video': '🎬',
            'text': '📝',
            'audio': '🎵',
            'sticker': '🩹',
            'document': '📄',
            'unknown': '❓'
        };
        return emojis[type] || emojis.unknown;
    }
    
    getRecentDetections(limit = 5) {
        return this.statusLogs.slice(-limit).reverse().map(log => ({
            sender: log.sender,
            type: log.type,
            caption: log.caption || '(No caption)',
            posted: log.postedAt,
            detected: log.detectedAt,
            ago: this.getTimeAgo(log.timestamp)
        }));
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
    
    getStats() {
        return {
            totalDetected: this.statusLogs.length,
            lastDetection: this.lastDetection ? 
                `${this.lastDetection.sender} - ${this.getTimeAgo(this.lastDetection.timestamp)}` : 
                'None',
            detectionEnabled: this.detectionEnabled
        };
    }
}

// Initialize Status Detector
let statusDetector = null;

// ====== JID/LID HANDLING SYSTEM ======
class JidManager {
    constructor() {
        this.ownerJids = new Set();
        this.ownerLids = new Set();
        this.owner = null;
        this.ownerFileData = {};
        this.originalIsOwner = null;
        
        this.loadOwnerData();
        this.loadWhitelist();
        
        log(`JID Manager initialized. Current owner: ${this.owner?.cleanNumber || 'None'}`, 'success');
    }
    
    loadOwnerData() {
        try {
            if (existsSync(OWNER_FILE)) {
                this.ownerFileData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
                const ownerJid = this.ownerFileData.OWNER_JID;
                const ownerNumber = this.ownerFileData.OWNER_NUMBER;
                
                if (ownerJid) {
                    const cleaned = this.cleanJid(ownerJid);
                    
                    this.owner = {
                        rawJid: ownerJid,
                        cleanJid: cleaned.cleanJid,
                        cleanNumber: cleaned.cleanNumber,
                        isLid: cleaned.isLid,
                        linkedAt: this.ownerFileData.linkedAt || new Date().toISOString()
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
                    
                    if (this.ownerFileData.verifiedLIDs && Array.isArray(this.ownerFileData.verifiedLIDs)) {
                        this.ownerFileData.verifiedLIDs.forEach(lid => {
                            if (lid && lid.includes('@lid')) {
                                this.ownerLids.add(lid);
                                const lidNum = lid.split('@')[0];
                                this.ownerLids.add(lidNum);
                            }
                        });
                    }
                    
                    OWNER_JID = ownerJid;
                    OWNER_NUMBER = ownerNumber;
                    OWNER_CLEAN_JID = cleaned.cleanJid;
                    OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                    
                    log(`Loaded owner data: ${cleaned.cleanJid}`, 'success');
                }
            }
        } catch {
            // Silent fail
        }
    }
    
    loadWhitelist() {
        try {
            if (existsSync(WHITELIST_FILE)) {
                const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
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
                isLid: true,
                server: 'lid'
            };
        }
        
        const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
        const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
        const cleanNumber = numberPart.replace(/[^0-9]/g, '');
        const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
        const cleanJid = `${normalizedNumber}@${serverPart}`;
        
        return {
            raw: jid,
            cleanJid: cleanJid,
            cleanNumber: normalizedNumber,
            isLid: false,
            hasDeviceSuffix: deviceSuffix !== undefined,
            deviceSuffix: deviceSuffix,
            server: serverPart
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
        
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
            return true;
        }
        
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) {
                return true;
            }
            
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) {
                return true;
            }
        }
        
        if (this.owner.cleanNumber && cleaned.cleanNumber) {
            if (this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
                return false;
            }
        }
        
        return false;
    }
    
    isSimilarNumber(num1, num2) {
        if (!num1 || !num2) return false;
        
        if (num1 === num2) return true;
        
        if (num1.includes(num2) || num2.includes(num1)) {
            return true;
        }
        
        if (num1.length >= 6 && num2.length >= 6) {
            const last6Num1 = num1.slice(-6);
            const last6Num2 = num2.slice(-6);
            if (last6Num1 === last6Num2) {
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
                verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
                linkedAt: new Date().toISOString(),
                autoLinked: isAutoLinked,
                previousOwnerCleared: true,
                version: VERSION
            };
            
            writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            
            const whitelistData = {
                whitelist: [],
                updatedAt: new Date().toISOString(),
                note: "Cleared by new owner linking"
            };
            writeFileSync(WHITELIST_FILE, JSON.stringify(whitelistData, null, 2));
            
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
    
    addAdditionalDevice(jid) {
        try {
            if (!this.owner) return false;
            
            const cleaned = this.cleanJid(jid);
            
            if (!this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
                return false;
            }
            
            if (cleaned.isLid) {
                this.ownerLids.add(jid);
                const lidNumber = jid.split('@')[0];
                this.ownerLids.add(lidNumber);
            } else {
                this.ownerJids.add(cleaned.cleanJid);
                this.ownerJids.add(jid);
            }
            
            this.saveOwnerData();
            
            return true;
        } catch {
            return false;
        }
    }
    
    saveOwnerData() {
        try {
            if (!this.owner) return false;
            
            const ownerData = {
                OWNER_JID: this.owner.rawJid,
                OWNER_NUMBER: this.owner.cleanNumber,
                OWNER_CLEAN_JID: this.owner.cleanJid,
                OWNER_CLEAN_NUMBER: this.owner.cleanNumber,
                ownerLID: this.owner.isLid ? this.owner.rawJid : OWNER_LID,
                verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
                ownerJIDs: Array.from(this.ownerJids),
                linkedAt: this.owner.linkedAt,
                updatedAt: new Date().toISOString(),
                version: VERSION
            };
            
            writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            return true;
        } catch {
            return false;
        }
    }
    
    saveWhitelist() {
        try {
            const data = {
                whitelist: Array.from(WHITELIST),
                updatedAt: new Date().toISOString()
            };
            writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
        } catch {
            // Silent fail
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
    
    clearAllData() {
        this.ownerJids.clear();
        this.ownerLids.clear();
        WHITELIST.clear();
        this.owner = null;
        
        OWNER_JID = null;
        OWNER_NUMBER = null;
        OWNER_CLEAN_JID = null;
        OWNER_CLEAN_NUMBER = null;
        OWNER_LID = null;
        
        log(`Cleared all owner data`, 'warning');
        return true;
    }
}

// Initialize JID Manager
const jidManager = new JidManager();

// ====== ULTIMATE FIX SYSTEM WITH RESTART SUPPORT ======
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
            
            const progressMsg = await this.sendFixProgressMessage(sock, senderJid, `🚀 Starting ${isRestart ? 'Restart ' : ''}Ultimate Fix System`, 0);
            
            // ====== STEP 1: Store original isOwner method ======
            await this.updateProgress(sock, senderJid, progressMsg, 10, 'Storing original methods...');
            const originalIsOwner = jidManager.isOwner;
            jidManager.originalIsOwner = originalIsOwner;
            
            // ====== STEP 2: Patch isOwner method ======
            await this.updateProgress(sock, senderJid, progressMsg, 25, 'Patching isOwner method...');
            
            jidManager.isOwner = function(message) {
                try {
                    const isFromMe = message?.key?.fromMe;
                    
                    if (isFromMe) {
                        return true;
                    }
                    
                    if (!this.owner || !this.owner.cleanNumber) {
                        this.loadOwnerDataFromFile();
                    }
                    
                    return originalIsOwner.call(this, message);
                    
                } catch {
                    return message?.key?.fromMe || false;
                }
            };
            
            // ====== STEP 3: Add loadOwnerDataFromFile method ======
            await this.updateProgress(sock, senderJid, progressMsg, 40, 'Adding loadOwnerDataFromFile...');
            
            if (!jidManager.loadOwnerDataFromFile) {
                jidManager.loadOwnerDataFromFile = function() {
                    try {
                        if (existsSync('./owner.json')) {
                            const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                            
                            let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
                            let cleanJid = data.OWNER_CLEAN_JID || data.OWNER_JID;
                            
                            if (cleanNumber && cleanNumber.includes(':')) {
                                cleanNumber = cleanNumber.split(':')[0];
                            }
                            if (cleanJid && cleanJid.includes(':74')) {
                                cleanJid = cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
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
            }
            
            jidManager.loadOwnerDataFromFile();
            
            // ====== STEP 4: Update global variables ======
            await this.updateProgress(sock, senderJid, progressMsg, 60, 'Updating global variables...');
            
            const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : jidManager.owner || {};
            
            global.OWNER_NUMBER = ownerInfo.cleanNumber || cleaned.cleanNumber;
            global.OWNER_CLEAN_NUMBER = global.OWNER_NUMBER;
            global.OWNER_JID = ownerInfo.cleanJid || cleaned.cleanJid;
            global.OWNER_CLEAN_JID = global.OWNER_JID;
            
            // ====== STEP 5: Create LID mapping if needed ======
            await this.updateProgress(sock, senderJid, progressMsg, 75, 'Creating LID mappings...');
            
            if (cleaned.isLid) {
                const lidMappingFile = './lid_mappings.json';
                let lidMappings = {};
                
                if (existsSync(lidMappingFile)) {
                    try {
                        lidMappings = JSON.parse(readFileSync(lidMappingFile, 'utf8'));
                    } catch {
                        // ignore
                    }
                }
                
                lidMappings[cleaned.cleanNumber] = cleaned.cleanJid;
                writeFileSync(lidMappingFile, JSON.stringify(lidMappings, null, 2));
            }
            
            // ====== STEP 6: Mark as fixed ======
            await this.updateProgress(sock, senderJid, progressMsg, 90, 'Finalizing fix...');
            
            this.fixedJids.add(senderJid);
            this.fixApplied = true;
            
            // ====== STEP 7: Final success message ======
            await this.updateProgress(sock, senderJid, progressMsg, 100, 'Ultimate Fix Complete!');
            
            const fixLog = `🚀 *${isRestart ? 'RESTART ' : ''}ULTIMATE FIX COMPLETE*\n\n` +
                         `✅ Fix applied successfully!\n` +
                         `📱 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
                         `🔧 Status: ✅ FIXED\n` +
                         `👑 Owner Access: ✅ GRANTED\n\n` +
                         `🎉 You now have full owner access in ALL chats!\n` +
                         `💬 Try using ${CURRENT_PREFIX}mode command to verify.`;
            
            await sock.sendMessage(senderJid, { text: fixLog });
            
            this.editingMessages.delete(senderJid);
            
            log(`✅ Ultimate Fix applied (${fixType}): ${cleaned.cleanJid}`, 'success');
            
            return {
                success: true,
                jid: cleaned.cleanJid,
                number: cleaned.cleanNumber,
                isLid: cleaned.isLid,
                isRestart: isRestart,
                fixesApplied: [
                    'Patched isOwner() method',
                    'Added loadOwnerDataFromFile()',
                    'Updated global variables',
                    'Created LID mapping'
                ]
            };
            
        } catch (error) {
            log(`❌ Ultimate Fix failed: ${error.message}`, 'error');
            return { success: false, error: 'Fix failed' };
        }
    }
    
    async sendFixProgressMessage(sock, senderJid, initialText, progress = 0) {
        try {
            const progressBar = this.createProgressBar(progress);
            const message = `${initialText}\n\n${progressBar}\n\n🔄 Progress: ${progress}%`;
            
            const sentMsg = await sock.sendMessage(senderJid, { text: message });
            this.editingMessages.set(senderJid, sentMsg.key);
            return sentMsg;
        } catch {
            return null;
        }
    }
    
    async updateProgress(sock, senderJid, originalMsg, progress, statusText) {
        try {
            const progressBar = this.createProgressBar(progress);
            const message = `🚀 Applying Ultimate Fix\n\n${progressBar}\n\n${statusText}\n🔄 Progress: ${progress}%`;
            
            if (originalMsg && originalMsg.key) {
                await sock.sendMessage(senderJid, { 
                    text: message,
                    edit: originalMsg.key 
                });
            }
        } catch {
            // Silent fail
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
    
    restoreOriginalMethods() {
        try {
            if (jidManager.originalIsOwner) {
                jidManager.isOwner = jidManager.originalIsOwner;
            }
            return true;
        } catch {
            return false;
        }
    }
    
    shouldRunRestartFix(ownerJid) {
        const hasOwnerFile = existsSync(OWNER_FILE);
        const isFixNeeded = this.isFixNeeded(ownerJid);
        const notAttempted = !this.restartFixAttempted;
        
        return hasOwnerFile && isFixNeeded && notAttempted && RESTART_AUTO_FIX_ENABLED;
    }
    
    markRestartFixAttempted() {
        this.restartFixAttempted = true;
    }
}

// Initialize Ultimate Fix System
const ultimateFixSystem = new UltimateFixSystem();

// ====== AUTO-LINKING SYSTEM WITH RESTART SUPPORT ======
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
            return await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
        }
        
        if (msg.key.fromMe) {
            if (!jidManager.owner) {
                return await this.autoLinkNewOwner(sock, senderJid, cleaned, false);
            }
            return false;
        }
        
        if (jidManager.isOwner(msg)) {
            return false;
        }
        
        const currentOwnerNumber = jidManager.owner.cleanNumber;
        if (jidManager.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
            const isDifferentDevice = !jidManager.ownerJids.has(cleaned.cleanJid) && 
                                     !jidManager.ownerLids.has(senderJid);
            
            if (isDifferentDevice) {
                jidManager.addAdditionalDevice(senderJid);
                
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
    
    async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const result = jidManager.setNewOwner(senderJid, true);
            
            if (!result.success) {
                return false;
            }
            
            await this.sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser);
            
            if (AUTO_ULTIMATE_FIX_ENABLED) {
                setTimeout(async () => {
                    await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, isFirstUser);
                }, 1500);
            }
            
            setTimeout(async () => {
                await this.autoRunConnectCommand(sock, senderJid, cleaned);
            }, 3000);
            
            console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║         🔗 AUTO-LINKING SUCCESS                ║
╠════════════════════════════════════════════════╣
║  ✅ New Owner: +${cleaned.cleanNumber}                  
║  🔗 JID: ${cleaned.cleanJid}
║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
║  🔧 Auto Fix: ✅ SCHEDULED
║  🔌 Auto Connect: ✅ SCHEDULED
╚════════════════════════════════════════════════╝
`));
            
            return true;
        } catch {
            return false;
        }
    }
    
    async sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentTime = new Date().toLocaleTimeString();
            
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
            successMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
            successMsg += `├─ Mode: ${BOT_MODE}\n`;
            successMsg += `├─ Linked: ${currentTime}\n`;
            successMsg += `└─ Status: ✅ LINKED SUCCESSFULLY\n\n`;
            
            successMsg += `🔧 *Auto Ultimate Fix:* Initializing... (1.5s)\n`;
            successMsg += `🔌 *Auto Connect:* Initializing... (3s)\n\n`;
            
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
    
    async autoRunConnectCommand(sock, senderJid, cleaned) {
        try {
            if (!AUTO_CONNECT_COMMAND_ENABLED) return;
            
            const fakeMsg = {
                key: {
                    remoteJid: senderJid,
                    fromMe: false,
                    id: `auto-connect-${Date.now()}`,
                    participant: senderJid
                },
                message: {
                    conversation: `${CURRENT_PREFIX}connect`
                }
            };
            
            await handleConnectCommand(sock, fakeMsg, [], cleaned);
            
        } catch {
            // Silent fail
        }
    }
    
    async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
        try {
            const message = `📱 *Device Linked!*\n\n` +
                          `✅ Your device has been added to owner devices.\n` +
                          `🔒 You can now use owner commands from this device.\n` +
                          `🔄 Ultimate Fix will be applied automatically.`;
            
            await sock.sendMessage(senderJid, { text: message });
        } catch {
            // Silent fail
        }
    }
}

// Initialize Auto Link System
const autoLinkSystem = new AutoLinkSystem();

// ====== CONNECT COMMAND HANDLER ======
async function handleConnectCommand(sock, msg, args, cleaned) {
    try {
        const chatJid = msg.key.remoteJid || cleaned.cleanJid;
        const currentTime = new Date().toLocaleTimeString();
        
        const fixApplied = ultimateFixSystem.fixApplied && ultimateFixSystem.fixedJids.has(chatJid);
        
        let connectMsg = `🐺 *WOLFBOT v${VERSION}*\n\n`;
        connectMsg += `🔌 *CONNECTION ESTABLISHED!*\n\n`;
        
        connectMsg += `📋 *Owner Information:*\n`;
        connectMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
        connectMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
        connectMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
        connectMsg += `├─ Mode: ${BOT_MODE}\n`;
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
            connectMsg += `Use ${CURRENT_PREFIX}ultimatefix to ensure owner access.\n\n`;
        }
        
        connectMsg += `📚 Use *${CURRENT_PREFIX}menu* to see commands.`;
        
        await sock.sendMessage(chatJid, { text: connectMsg });
        
        console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║         🔌 AUTO-CONNECT COMMAND               ║
╠════════════════════════════════════════════════╣
║  ✅ Owner: +${cleaned.cleanNumber}                  
║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
║  🔧 Fix Status: ${fixApplied ? 'APPLIED' : 'NOT APPLIED'}
║  👁️ Status Detector: ✅ ACTIVE
║  🕒 Time: ${currentTime}                 
╚════════════════════════════════════════════════╝
`));
        
        return true;
    } catch {
        return false;
    }
}

// ====== SILENT FUNCTIONS ======
function isUserBlocked(jid) {
    try {
        if (existsSync(BLOCKED_USERS_FILE)) {
            const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
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
        
        if (existsSync(BOT_MODE_FILE)) {
            const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
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

function loadPrefix() {
    try {
        if (existsSync(PREFIX_CONFIG_FILE)) {
            const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
            if (config.prefix && config.prefix.length <= 2) {
                CURRENT_PREFIX = config.prefix;
            }
        }
    } catch {
        // Silent fail
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
                
                if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
                    store.clear();
                }
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
    if (!existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
    }
}

function cleanSession() {
    try {
        if (existsSync(SESSION_DIR)) {
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
    
    clear() {
        this.messages.clear();
    }
}

const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    
    if (!existsSync(absolutePath)) {
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

// ====== ENHANCED CONNECTION HANDLER WITH RESTART FIX & STATUS DETECTOR ======
async function startBot(loginMode = 'pair', phoneNumber = null) {
    try {
        log('Initializing WhatsApp connection...', 'info');
        
        loadPrefix();
        
        log('Loading commands...', 'info');
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
            defaultQueryTimeoutMs: 30000,
            retryRequestDelayMs: 1000,
            maxRetryCount: 3,
            syncFullHistory: false,
            fireInitQueries: true,
            transactionOpts: {
                maxCommitRetries: 3,
                delayBetweenTriesMs: 1000
            },
            shouldIgnoreJid: (jid) => {
                return jid.includes('broadcast') || jid.includes('newsletter');
            }
        });
        
        SOCKET_INSTANCE = sock;
        connectionAttempts = 0;
        isWaitingForPairingCode = false;
        
        // ====== ENHANCED CONNECTION HANDLER ======
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (connection === 'open') {
                isConnected = true;
                startHeartbeat(sock);
                await handleSuccessfulConnection(sock, loginMode, phoneNumber);
                isWaitingForPairingCode = false;
                
                // ====== RESTART AUTO-FIX TRIGGER ======
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
            
            // ====== PAIRING CODE LOGIC ======
            if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
                if (!isWaitingForPairingCode) {
                    isWaitingForPairingCode = true;
                    
                    // Show initial message
                    console.log(chalk.cyan('\n📱 CONNECTING TO WHATSAPP...'));
                    console.log(chalk.yellow('Requesting 8-digit pairing code...'));
                    
                    // Request pairing code with retry logic
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
                            console.log(chalk.white('5. Wait for connection...\n'));
                            
                            console.log(chalk.gray('Note: The code is case-sensitive'));
                            console.log(chalk.gray(`Raw code: ${cleanCode}`));
                            
                            log(`8-digit pairing code generated: ${formattedCode}`, 'pairing');
                            
                        } catch (error) {
                            console.log(chalk.red(`\n❌ Attempt ${attempt}: Failed to get pairing code`));
                            
                            if (attempt < 3) {
                                console.log(chalk.yellow(`Retrying in 5 seconds... (${attempt}/3)`));
                                await delay(5000);
                                await requestPairingCode(attempt + 1);
                            } else {
                                console.log(chalk.red('❌ Max retries reached. Restarting connection...'));
                                isWaitingForPairingCode = false;
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
        
        // ====== STATUS DETECTION HANDLER ======
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            const msg = messages[0];
            if (!msg.message) return;
            
            lastActivityTime = Date.now();
            
            // Handle status detection
            if (msg.key?.remoteJid === 'status@broadcast') {
                if (statusDetector) {
                    // Use setTimeout to avoid blocking
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
        // Only run if there's an existing owner
        if (existsSync(OWNER_FILE) && sock.user?.id) {
            const ownerJid = sock.user.id;
            const cleaned = jidManager.cleanJid(ownerJid);
            
            // Check if we should run restart fix
            if (ultimateFixSystem.shouldRunRestartFix(ownerJid)) {
                log(`🔄 Triggering restart auto-fix for: ${ownerJid}`, 'restart');
                
                // Mark as attempted first
                ultimateFixSystem.markRestartFixAttempted();
                
                // Wait a moment for everything to stabilize
                await delay(2000);
                
                // Apply the restart fix
                const fixResult = await ultimateFixSystem.applyUltimateFix(sock, ownerJid, cleaned, false, true);
                
                if (fixResult.success) {
                    // Send restart success message
                    const restartMsg = `🔄 *BOT RESTARTED SUCCESSFULLY!*\n\n` +
                                     `✅ *WOLFBOT* has been restarted\n` +
                                     `🔧 Restart Ultimate Fix: ✅ APPLIED\n` +
                                     `👑 Owner: +${cleaned.cleanNumber}\n` +
                                     `📱 Device: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
                                     `⚡ Version: ${VERSION}\n` +
                                     `💬 Prefix: "${CURRENT_PREFIX}"\n` +
                                     `👁️ Status Detector: ✅ ACTIVE\n\n` +
                                     `🎉 All features are now active!\n` +
                                     `💬 Try using ${CURRENT_PREFIX}ping to verify.`;
                    
                    await sock.sendMessage(ownerJid, { text: restartMsg });
                    
                    console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║         🔄 RESTART AUTO-FIX COMPLETE          ║
╠════════════════════════════════════════════════╣
║  ✅ Owner: +${cleaned.cleanNumber}                  
║  🔗 JID: ${ownerJid}
║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
║  🔧 Fix Status: ✅ APPLIED
║  👁️ Status Detector: ✅ ACTIVE
║  🕒 Time: ${new Date().toLocaleTimeString()}                 
╚════════════════════════════════════════════════╝
`));
                    
                    log(`✅ Restart auto-fix completed successfully`, 'success');
                } else {
                    log(`❌ Restart auto-fix failed`, 'error');
                }
            } else {
                log(`ℹ️  Restart auto-fix not needed or already applied`, 'info');
                
                // Still send a restart notification
                if (existsSync(OWNER_FILE)) {
                    const restartMsg = `🔄 *BOT RESTARTED*\n\n` +
                                     `✅ *WOLFBOT* has been restarted\n` +
                                     `👑 Owner: +${cleaned.cleanNumber}\n` +
                                     `⚡ Version: ${VERSION}\n` +
                                     `💬 Prefix: "${CURRENT_PREFIX}"\n` +
                                     `🎛️ Mode: ${BOT_MODE}\n` +
                                     `👁️ Status Detector: ✅ ACTIVE\n\n` +
                                     `🔧 Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ Already Applied' : '❌ Not Applied'}\n` +
                                     `💬 Use ${CURRENT_PREFIX}ultimatefix if needed.`;
                    
                    await sock.sendMessage(ownerJid, { text: restartMsg });
                }
            }
        }
    } catch (error) {
        log(`⚠️ Restart auto-fix trigger error: ${error.message}`, 'warning');
    }
}

// ====== CONNECTION HANDLERS ======
async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
    const currentTime = new Date().toLocaleTimeString();
    
    OWNER_JID = sock.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    
    const isFirstConnection = !existsSync(OWNER_FILE);
    
    if (isFirstConnection) {
        jidManager.clearAllData();
        jidManager.setNewOwner(OWNER_JID, false);
    } else {
        jidManager.loadOwnerData();
    }
    
    const ownerInfo = jidManager.getOwnerInfo();
    
    // Clear console and show success
    console.clear();
    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('WOLFBOT ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${ownerInfo.ownerNumber}
║  🔧 Clean JID : ${ownerInfo.ownerJid}
║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
║  💬 Prefix : "${CURRENT_PREFIX}"
║  🎛️ Mode   : ${BOT_MODE}
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
║  📊 Commands: ${commands.size} commands loaded
║  🔧 AUTO ULTIMATE FIX : ✅ ENABLED
║  🔄 RESTART AUTO-FIX : ✅ ENABLED
║  👁️ STATUS DETECTOR  : ✅ ACTIVE
╚════════════════════════════════════════════════════════╝
`));
    
    // Only send initial message if it's a first connection
    if (isFirstConnection) {
        try {
            const connMsg = `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n` +
                          `✅ Bot started successfully!\n\n` +
                          `📋 *Owner Information:*\n` +
                          `├─ Your Number: +${ownerInfo.ownerNumber}\n` +
                          `├─ Device Type: ${ownerInfo.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n` +
                          `├─ Prefix: "${CURRENT_PREFIX}"\n` +
                          `├─ Mode: ${BOT_MODE}\n` +
                          `├─ Connected: ${currentTime}\n` +
                          `└─ Status: ✅ BOT ONLINE\n\n` +
                          `🔧 *Auto Ultimate Fix:* Will run when you message first...\n` +
                          `🔌 *Auto Connect:* Will run automatically\n` +
                          `👁️ *Status Detector:* ✅ ACTIVE (Detects all status updates)\n\n` +
                          `💬 Send any message to activate all features.`;
            
            await sock.sendMessage(OWNER_JID, { text: connMsg });
            
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
        
        await autoLinkSystem.shouldAutoLink(sock, msg);
        
        if (isUserBlocked(senderJid)) {
            return;
        }
        
        const textMsg = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || 
                       msg.message.videoMessage?.caption || '';
        
        if (!textMsg) return;
        
        if (textMsg.startsWith(CURRENT_PREFIX)) {
            const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
            const commandName = parts[0].toLowerCase();
            const args = parts.slice(1);
            
            log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
            if (!checkBotMode(msg, commandName)) {
                if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
                    return;
                }
                try {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
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
                                text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
                            });
                        } catch {
                            // Silent fail
                        }
                        return;
                    }
                    
                    await command.execute(sock, msg, args, CURRENT_PREFIX, {
                        OWNER_NUMBER: OWNER_CLEAN_NUMBER,
                        OWNER_JID: OWNER_CLEAN_JID,
                        OWNER_LID: OWNER_LID,
                        BOT_NAME,
                        VERSION,
                        isOwner: () => jidManager.isOwner(msg),
                        jidManager,
                        store,
                        statusDetector: statusDetector // Pass status detector to commands
                    });
                } catch {
                    // Silent fail
                }
            } else {
                await handleDefaultCommands(commandName, sock, msg, args);
            }
        }
    } catch {
        // Silent fail
    }
}

// ====== DEFAULT COMMANDS ======
async function handleDefaultCommands(commandName, sock, msg, args) {
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
                    text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\n${statusInfo}Status: Connected ✅`
                }, { quoted: msg });
                break;
                
            case 'help':
                let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
                helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
                helpText += `Mode: ${BOT_MODE}\n`;
                helpText += `Commands: ${commands.size}\n\n`;
                
                // Add status detector info to help
                helpText += `*STATUS DETECTOR*\n`;
                helpText += `${CURRENT_PREFIX}autoview on/off/status\n`;
                helpText += `${CURRENT_PREFIX}statusstats - Show status detection stats\n\n`;
                
                for (const [category, cmds] of commandCategories.entries()) {
                    helpText += `*${category.toUpperCase()}*\n`;
                    helpText += `${cmds.slice(0, 6).join(', ')}`;
                    if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
                    helpText += '\n\n';
                }
                
                helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
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
                    text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n${statusDetectorInfo}`
                }, { quoted: msg });
                break;
                
            case 'statusstats':
                if (statusDetector) {
                    const stats = statusDetector.getStats();
                    const recent = statusDetector.getRecentDetections(3);
                    
                    let statsText = `📊 *STATUS DETECTION STATS*\n\n`;
                    statsText += `🔍 Status: ✅ ACTIVE\n`;
                    statsText += `📈 Total detected: ${stats.totalDetected}\n`;
                    statsText += `🕒 Last detection: ${stats.lastDetection}\n\n`;
                    
                    if (recent.length > 0) {
                        statsText += `📱 *Recent Statuses:*\n`;
                        recent.forEach((status, index) => {
                            statsText += `${index + 1}. ${status.sender}: ${status.type} (${status.ago})\n`;
                        });
                    }
                    
                    await sock.sendMessage(chatId, { text: statsText }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: '❌ Status detector not initialized.'
                    }, { quoted: msg });
                }
                break;
                
            case 'clean':
                if (!isOwnerUser) {
                    await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                    return;
                }
                
                await sock.sendMessage(chatId, { 
                    text: '🧹 Cleaning session and restarting...' 
                });
                
                setTimeout(() => {
                    cleanSession();
                    process.exit(1);
                }, 2000);
                break;
                
            case 'ownerinfo':
                const senderJid = msg.key.participant || chatId;
                const cleaned = jidManager.cleanJid(senderJid);
                
                let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
                ownerInfoText += `📱 Your JID: ${senderJid}\n`;
                ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
                ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
                ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
                ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
                ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
                ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n`;
                ownerInfoText += `🔧 Auto Ultimate Fix: ${ultimateFixSystem.fixApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n`;
                
                if (statusDetector) {
                    const stats = statusDetector.getStats();
                    ownerInfoText += `👁️ Status Detector: ✅ ACTIVE\n`;
                    ownerInfoText += `📊 Detected: ${stats.totalDetected} statuses\n\n`;
                } else {
                    ownerInfoText += `👁️ Status Detector: ❌ NOT INITIALIZED\n\n`;
                }
                
                ownerInfoText += `*BOT OWNER DETAILS:*\n`;
                ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
                ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
                ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
                ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
                ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
                if (!isOwnerUser) {
                    ownerInfoText += `\n\n⚠️ First message will auto-link if number matches.`;
                }
                
                await sock.sendMessage(chatId, {
                    text: ownerInfoText
                }, { quoted: msg });
                break;
                
            case 'resetowner':
                if (!isOwnerUser) {
                    await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                    return;
                }
                
                await sock.sendMessage(chatId, {
                    text: '🔄 Resetting owner data...\nNext message will set new owner automatically.'
                });
                
                jidManager.clearAllData();
                break;
                
            case 'ultimatefix':
            case 'solveowner':
            case 'fixall':
                const fixSenderJid = msg.key.participant || chatId;
                const fixCleaned = jidManager.cleanJid(fixSenderJid);
                
                if (!jidManager.isOwner(msg) && !msg.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.\n\nFirst message will auto-link you as owner.'
                    }, { quoted: msg });
                    return;
                }
                
                const fixResult = await ultimateFixSystem.applyUltimateFix(sock, fixSenderJid, fixCleaned, false);
                
                if (fixResult.success) {
                    await sock.sendMessage(chatId, {
                        text: `🔧 *ULTIMATE FIX APPLIED*\n\n✅ Fix applied successfully!\n\n✅ You should now have full owner access in all chats!`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Ultimate Fix Failed*\n\nTry using ${CURRENT_PREFIX}resetowner first.`
                    }, { quoted: msg });
                }
                break;
        }
    } catch {
        // Silent fail
    }
}

// ====== MAIN APPLICATION ======
async function main() {
    try {
        log('Starting WOLFBOT with Status Detector...', 'info');
        
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
    console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
    
    // Save status detector data
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