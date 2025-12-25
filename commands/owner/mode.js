














// // // File: ./commands/owner/mode.js
// // import { writeFileSync, readFileSync, existsSync } from 'fs';

// // export default {
// //     name: 'mode',
// //     alias: ['botmode', 'setmode'],
// //     category: 'owner',
// //     description: 'Change bot operating mode',
// //     ownerOnly: true, // This is what's failing in someone else's DM
    
// //     async execute(sock, msg, args, PREFIX, extra) {
// //         const chatId = msg.key.remoteJid;
// //         const { jidManager } = extra;
        
// //         // ==================== DEBUG LOGGING ====================
// //         console.log('\n🔍 ========= MODE COMMAND DEBUG =========');
// //         console.log('Chat ID:', chatId);
// //         console.log('From Me:', msg.key.fromMe);
// //         console.log('Participant:', msg.key.participant);
// //         console.log('Remote JID:', msg.key.remoteJid);
        
// //         // Get sender info
// //         const senderJid = msg.key.participant || chatId;
// //         const cleaned = jidManager.cleanJid(senderJid);
// //         console.log('Sender JID:', senderJid);
// //         console.log('Cleaned JID:', cleaned.cleanJid);
// //         console.log('Cleaned Number:', cleaned.cleanNumber);
// //         console.log('Is LID:', cleaned.isLid);
        
// //         // Check owner status
// //         const isOwner = jidManager.isOwner(msg);
// //         console.log('isOwner():', isOwner);
        
// //         // Check owner info in jidManager
// //         const ownerInfo = jidManager.getOwnerInfo();
// //         console.log('jidManager Owner:', ownerInfo.cleanNumber);
// //         console.log('Global OWNER_NUMBER:', global.OWNER_NUMBER);
// //         console.log('========================================\n');
// //         // ==================== END DEBUG ====================
        
// //         // ==================== EMERGENCY BYPASS ====================
// //         // If message is from LID and fromMe, it's likely the owner
// //         // This is a temporary fix until we solve the root issue
// //         const isFromMe = msg.key.fromMe;
// //         const isLid = senderJid.includes('@lid');
        
// //         if (!isOwner && isFromMe && isLid) {
// //             console.log('⚠️ EMERGENCY BYPASS: LID + fromMe detected, granting access');
// //             // We'll proceed but log this
// //         } else if (!isOwner) {
// //             // Normal owner check failed
// //             console.log('❌ Owner check failed!');
            
// //             // Send helpful error message
// //             let errorMsg = `❌ *Owner Only Command!*\n\n`;
// //             errorMsg += `Only the bot owner can use this command.\n\n`;
// //             errorMsg += `🔍 *Debug Info:*\n`;
// //             errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
// //             errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
// //             errorMsg += `├─ Type: ${isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
// //             errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
// //             errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
            
// //             if (isLid && isFromMe) {
// //                 errorMsg += `⚠️ *Issue Detected:*\n`;
// //                 errorMsg += `You're using a linked device (LID).\n`;
// //                 errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
// //             } else if (!ownerInfo.cleanNumber) {
// //                 errorMsg += `⚠️ *Issue Detected:*\n`;
// //                 errorMsg += `Owner not set in jidManager!\n`;
// //                 errorMsg += `Try using ${PREFIX}debugchat fix\n`;
// //             }
            
// //             return sock.sendMessage(chatId, {
// //                 text: errorMsg
// //             }, { quoted: msg });
// //         }
// //         // ==================== END EMERGENCY BYPASS ====================
        
// //         // Available modes
// //         const modes = {
// //             'public': {
// //                 name: '🌍 Public Mode',
// //                 description: 'Bot responds to everyone',
// //                 icon: '🌍'
// //             },
// //             'private': {
// //                 name: '🔒 Private Mode',
// //                 description: 'Bot responds only to owner (sends messages)',
// //                 icon: '🔒'
// //             },
// //             'silent': {
// //                 name: '🔇 Silent Mode',
// //                 description: 'Bot ignores non-owners completely (no messages sent)',
// //                 icon: '🔇'
// //             },
// //             'group-only': {
// //                 name: '👥 Group Only',
// //                 description: 'Bot works in groups only',
// //                 icon: '👥'
// //             },
// //             'maintenance': {
// //                 name: '🔧 Maintenance',
// //                 description: 'Only basic commands available',
// //                 icon: '🔧'
// //             }
// //         };
        
// //         // Show current mode if no args
// //         if (!args[0]) {
// //             let modeList = '';
// //             for (const [mode, info] of Object.entries(modes)) {
// //                 modeList += `${info.icon} *${mode}* - ${info.description}\n`;
// //             }
            
// //             // Get current mode
// //             let currentMode = 'public';
// //             if (existsSync('./bot_mode.json')) {
// //                 try {
// //                     const modeData = JSON.parse(readFileSync('./bot_mode.json', 'utf8'));
// //                     currentMode = modeData.mode || 'public';
// //                 } catch (error) {
// //                     // Default to public
// //                 }
// //             }
            
// //             return sock.sendMessage(chatId, {
// //                 text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Current Mode: ${modes[currentMode]?.name || currentMode}\n\n📋 Available modes:\n${modeList}\n\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode silent`
// //             }, { quoted: msg });
// //         }
        
// //         const requestedMode = args[0].toLowerCase();
        
// //         if (!modes[requestedMode]) {
// //             const validModes = Object.keys(modes).join(', ');
// //             return sock.sendMessage(chatId, {
// //                 text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode silent`
// //             }, { quoted: msg });
// //         }
        
// //         const modeFile = './bot_mode.json';
        
// //         try {
// //             // Get owner number for logging
// //             let setBy = 'Unknown';
// //             if (extra.OWNER_NUMBER) {
// //                 setBy = extra.OWNER_NUMBER;
// //             } else if (ownerInfo.cleanNumber) {
// //                 setBy = ownerInfo.cleanNumber;
// //             } else if (cleaned.cleanNumber) {
// //                 setBy = cleaned.cleanNumber;
// //             }
            
// //             const modeData = {
// //                 mode: requestedMode,
// //                 modeName: modes[requestedMode].name,
// //                 setBy: setBy,
// //                 setAt: new Date().toISOString(),
// //                 description: modes[requestedMode].description,
// //                 setFrom: isLid ? 'LID Device' : 'Regular Device',
// //                 chatType: chatId.includes('@g.us') ? 'Group' : 'DM',
// //                 originalSender: cleaned.cleanJid
// //             };
            
// //             writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
// //             // Update global mode immediately
// //             if (typeof global !== 'undefined') {
// //                 global.BOT_MODE = requestedMode;
// //             }
            
// //             const modeInfo = modes[requestedMode];
            
// //             let successMsg = `✅ *Mode Updated*\n\n`;
// //             successMsg += `${modeInfo.icon} New mode: *${modeInfo.name}*\n`;
// //             successMsg += `📝 ${modeInfo.description}\n\n`;
// //             successMsg += `🔧 Changes applied immediately.\n\n`;
            
// //             if (isLid) {
// //                 successMsg += `📱 *Note:* Changed from linked device\n`;
// //             }
            
// //             successMsg += `⚠️ In SILENT mode, non-owners will be completely ignored (no messages sent).`;
            
// //             await sock.sendMessage(chatId, {
// //                 text: successMsg
// //             }, { quoted: msg });
            
// //             // Log success
// //             console.log(`✅ Mode changed to ${requestedMode} by ${cleaned.cleanJid}`);
// //             if (isLid) {
// //                 console.log(`   ↳ Changed from LID device`);
// //             }
            
// //         } catch (error) {
// //             await sock.sendMessage(chatId, {
// //                 text: `❌ Error saving mode: ${error.message}`
// //             }, { quoted: msg });
// //         }
// //     }
// // };

// // File: ./commands/owner/mode.js
// import { writeFileSync, readFileSync, existsSync } from 'fs';

// export default {
//     name: 'mode',
//     alias: ['botmode', 'setmode'],
//     category: 'owner',
//     description: 'Change bot operating mode',
//     ownerOnly: true, // This is what's failing in someone else's DM
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
//         const { jidManager } = extra;
        
//         // ==================== DEBUG LOGGING ====================
//         console.log('\n🔍 ========= MODE COMMAND DEBUG =========');
//         console.log('Chat ID:', chatId);
//         console.log('From Me:', msg.key.fromMe);
//         console.log('Participant:', msg.key.participant);
//         console.log('Remote JID:', msg.key.remoteJid);
        
//         // Get sender info
//         const senderJid = msg.key.participant || chatId;
//         const cleaned = jidManager.cleanJid(senderJid);
//         console.log('Sender JID:', senderJid);
//         console.log('Cleaned JID:', cleaned.cleanJid);
//         console.log('Cleaned Number:', cleaned.cleanNumber);
//         console.log('Is LID:', cleaned.isLid);
        
//         // Check owner status
//         const isOwner = jidManager.isOwner(msg);
//         console.log('isOwner():', isOwner);
        
//         // Check owner info in jidManager
//         const ownerInfo = jidManager.getOwnerInfo();
//         console.log('jidManager Owner:', ownerInfo.cleanNumber);
//         console.log('Global OWNER_NUMBER:', global.OWNER_NUMBER);
//         console.log('========================================\n');
//         // ==================== END DEBUG ====================
        
//         // ==================== EMERGENCY BYPASS ====================
//         // If message is from LID and fromMe, it's likely the owner
//         // This is a temporary fix until we solve the root issue
//         const isFromMe = msg.key.fromMe;
//         const isLid = senderJid.includes('@lid');
        
//         if (!isOwner && isFromMe && isLid) {
//             console.log('⚠️ EMERGENCY BYPASS: LID + fromMe detected, granting access');
//             // We'll proceed but log this
//         } else if (!isOwner) {
//             // Normal owner check failed
//             console.log('❌ Owner check failed!');
            
//             // Send helpful error message
//             let errorMsg = `❌ *Owner Only Command!*\n\n`;
//             errorMsg += `Only the bot owner can use this command.\n\n`;
//             errorMsg += `🔍 *Debug Info:*\n`;
//             errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
//             errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
//             errorMsg += `├─ Type: ${isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
//             errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
//             errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
            
//             if (isLid && isFromMe) {
//                 errorMsg += `⚠️ *Issue Detected:*\n`;
//                 errorMsg += `You're using a linked device (LID).\n`;
//                 errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
//             } else if (!ownerInfo.cleanNumber) {
//                 errorMsg += `⚠️ *Issue Detected:*\n`;
//                 errorMsg += `Owner not set in jidManager!\n`;
//                 errorMsg += `Try using ${PREFIX}debugchat fix\n`;
//             }
            
//             return sock.sendMessage(chatId, {
//                 text: errorMsg
//             }, { quoted: msg });
//         }
//         // ==================== END EMERGENCY BYPASS ====================
        
//         // Available modes - Only silent and public
//         const modes = {
//             'public': {
//                 name: '🌍 Public Mode',
//                 description: '',
//                 icon: '🌍'
//             },
//             'silent': {
//                 name: '🔇 Silent Mode',
//                 description: '',
//                 icon: '🔇'
//             }
//         };
        
//         // Show current mode if no args
//         if (!args[0]) {
//             let modeList = '';
//             for (const [mode, info] of Object.entries(modes)) {
//                 modeList += `${info.icon} *${mode}* - ${info.description}\n`;
//             }
            
//             // Get current mode
//             let currentMode = 'public';
//             if (existsSync('./bot_mode.json')) {
//                 try {
//                     const modeData = JSON.parse(readFileSync('./bot_mode.json', 'utf8'));
//                     currentMode = modeData.mode || 'public';
//                 } catch (error) {
//                     // Default to public
//                 }
//             }
            
//             return sock.sendMessage(chatId, {
//                 text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Current Mode: ${modes[currentMode]?.name || currentMode}\n\n📋 Available modes:\n${modeList}\n\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode silent`
//             }, { quoted: msg });
//         }
        
//         const requestedMode = args[0].toLowerCase();
        
//         if (!modes[requestedMode]) {
//             const validModes = Object.keys(modes).join(', ');
//             return sock.sendMessage(chatId, {
//                 text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode silent`
//             }, { quoted: msg });
//         }
        
//         const modeFile = './bot_mode.json';
        
//         try {
//             // Get owner number for logging
//             let setBy = 'Unknown';
//             if (extra.OWNER_NUMBER) {
//                 setBy = extra.OWNER_NUMBER;
//             } else if (ownerInfo.cleanNumber) {
//                 setBy = ownerInfo.cleanNumber;
//             } else if (cleaned.cleanNumber) {
//                 setBy = cleaned.cleanNumber;
//             }
            
//             const modeData = {
//                 mode: requestedMode,
//                 modeName: modes[requestedMode].name,
//                 setBy: setBy,
//                 setAt: new Date().toISOString(),
//                 description: modes[requestedMode].description,
//                 setFrom: isLid ? 'LID Device' : 'Regular Device',
//                 chatType: chatId.includes('@g.us') ? 'Group' : 'DM',
//                 originalSender: cleaned.cleanJid
//             };
            
//             writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
//             // Update global mode immediately
//             if (typeof global !== 'undefined') {
//                 global.BOT_MODE = requestedMode;
//             }
            
//             const modeInfo = modes[requestedMode];
            
//             let successMsg = `✅ *Mode Updated*\n\n`;
//             successMsg += `${modeInfo.icon} New mode: *${modeInfo.name}*\n`;
//             successMsg += `📝 ${modeInfo.description}\n\n`;
//             successMsg += `🔧 Changes applied immediately.\n\n`;
            
//             if (isLid) {
//                 successMsg += `📱 *Note:* Changed from linked device\n`;
//             }
            
//             if (requestedMode === 'silent') {
//                 successMsg += `⚠️ *IMPORTANT:* In SILENT mode, only you (the owner) can use the bot. All others will be ignored completely (no messages sent).`;
//             } else {
//                 successMsg += `✅ In PUBLIC mode, everyone can use the bot normally.`;
//             }
            
//             await sock.sendMessage(chatId, {
//                 text: successMsg
//             }, { quoted: msg });
            
//             // Log success
//             console.log(`✅ Mode changed to ${requestedMode} by ${cleaned.cleanJid}`);
//             if (isLid) {
//                 console.log(`   ↳ Changed from LID device`);
//             }
            
//         } catch (error) {
//             await sock.sendMessage(chatId, {
//                 text: `❌ Error saving mode: ${error.message}`
//             }, { quoted: msg });
//         }
//     }
// };


















// File: ./commands/owner/mode.js - UPDATED WITH BETTER SAVING
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'mode',
    alias: ['botmode', 'setmode'],
    category: 'owner',
    description: 'Change bot operating mode',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // Owner check
        if (!jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can change the bot mode.`
            }, { quoted: msg });
        }
        
        // Available modes
        const modes = {
            'public': {
                name: '🌍 Public Mode',
                description: 'Everyone can use the bot',
                icon: '🌍'
            },
            'silent': {
                name: '🔇 Silent Mode',
                description: 'Only owner can use the bot',
                icon: '🔇'
            }
        };
        
        // Show current mode if no args
        if (!args[0]) {
            // Get current mode from multiple possible sources
            let currentMode = this.getCurrentMode();
            
            let modeList = '';
            for (const [mode, info] of Object.entries(modes)) {
                const isCurrent = mode === currentMode ? ' ✅' : '';
                modeList += `${info.icon} *${mode}* - ${info.description}${isCurrent}\n`;
            }
            
            return sock.sendMessage(chatId, {
                text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Current Mode: ${modes[currentMode]?.name || currentMode}\n\n📋 Available modes:\n${modeList}\n\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode silent`
            }, { quoted: msg });
        }
        
        const requestedMode = args[0].toLowerCase();
        
        if (!modes[requestedMode]) {
            const validModes = Object.keys(modes).join(', ');
            return sock.sendMessage(chatId, {
                text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode silent`
            }, { quoted: msg });
        }
        
        try {
            // Get owner number
            const senderJid = msg.key.participant || chatId;
            const cleaned = jidManager.cleanJid(senderJid);
            
            const modeData = {
                mode: requestedMode,
                modeName: modes[requestedMode].name,
                setBy: cleaned.cleanNumber || 'Unknown',
                setAt: new Date().toISOString(),
                timestamp: Date.now(),
                version: "1.0"
            };
            
            console.log(`🔄 Saving bot mode to JSON:`, modeData);
            
            // PRIMARY: Save to ROOT directory (most accessible)
            const rootModePath = './bot_mode.json';
            writeFileSync(rootModePath, JSON.stringify(modeData, null, 2));
            console.log(`✅ Saved to: ${rootModePath}`);
            
            // SECONDARY: Save to current command directory
            const commandModePath = path.join(__dirname, 'bot_mode.json');
            writeFileSync(commandModePath, JSON.stringify(modeData, null, 2));
            console.log(`✅ Saved to: ${commandModePath}`);
            
            // THIRD: Save to likely menu directory paths
            const menuPossiblePaths = [
                path.join(__dirname, '../bot_mode.json'),
                path.join(__dirname, '../../bot_mode.json'),
                path.join(__dirname, '../../../bot_mode.json'),
            ];
            
            for (const menuPath of menuPossiblePaths) {
                try {
                    writeFileSync(menuPath, JSON.stringify(modeData, null, 2));
                    console.log(`✅ Saved to: ${menuPath}`);
                } catch (err) {
                    console.log(`⚠️ Could not save to: ${menuPath} - ${err.message}`);
                }
            }
            
            // Update global variables
            if (typeof global !== 'undefined') {
                global.BOT_MODE = requestedMode;
                global.mode = requestedMode; // For backward compatibility
                global.MODE_LAST_UPDATED = Date.now(); // Force menu refresh
            }
            
            // Update process environment
            process.env.BOT_MODE = requestedMode;
            
            const modeInfo = modes[requestedMode];
            
            let successMsg = `✅ *Mode Updated Successfully!*\n\n`;
            successMsg += `${modeInfo.icon} New Mode: *${modeInfo.name}*\n`;
            // successMsg += `📝 ${modeInfo.description}\n\n`;
            // successMsg += `✅ Changes applied to multiple locations:\n`;
            // successMsg += `├─ Root directory ✓\n`;
            // successMsg += `├─ Command directory ✓\n`;
            // successMsg += `├─ Global variables ✓\n`;
            // successMsg += `└─ Environment variables ✓\n\n`;
            
            if (requestedMode === 'silent') {
                //       successMsg += `⚠️ *IMPORTANT:* In SILENT mode:\n`;
                // successMsg += `• Only you (the owner) can use commands\n`;
                // successMsg += `• Others will receive no response\n`;
                // successMsg += `• Menu will show "🔇 Silent Mode"\n`;
            } else {
                // successMsg += `✅ In PUBLIC mode:\n`;
                // successMsg += `• Everyone can use commands\n`;
                // successMsg += `• Menu will show "🌍 Public Mode"\n`;
            }
            
           // successMsg += `\n🔧 Use ${PREFIX}menu to see the updated mode in the info section.`;
            
            await sock.sendMessage(chatId, {
                text: successMsg
            }, { quoted: msg });
            
            console.log(`✅ Mode changed to ${requestedMode} by ${cleaned.cleanNumber}`);
            
        } catch (error) {
            console.error('Error saving mode:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error saving mode: ${error.message}\n\nPlease check file permissions.`
            }, { quoted: msg });
        }
    },
    
    // Helper function to get current mode
    getCurrentMode() {
        try {
            // Try multiple possible locations
            const possiblePaths = [
                './bot_mode.json',  // Root directory (most important)
                path.join(__dirname, 'bot_mode.json'),
                path.join(__dirname, '../bot_mode.json'),
                path.join(__dirname, '../../bot_mode.json'),
            ];
            
            console.log('🔍 Checking for bot_mode.json in:');
            for (const modePath of possiblePaths) {
                console.log(`   - ${modePath}: ${existsSync(modePath) ? '✅' : '❌'}`);
            }
            
            for (const modePath of possiblePaths) {
                if (existsSync(modePath)) {
                    console.log(`📂 Loading from: ${modePath}`);
                    const modeData = JSON.parse(readFileSync(modePath, 'utf8'));
                    console.log(`📊 Found mode: ${modeData.mode}`);
                    return modeData.mode;
                }
            }
            
            // Fallback to global variables
            console.log('🌐 Checking global variables...');
            if (global.BOT_MODE) {
                console.log(`✅ Found global.BOT_MODE: ${global.BOT_MODE}`);
                return global.BOT_MODE;
            }
            if (global.mode) {
                console.log(`✅ Found global.mode: ${global.mode}`);
                return global.mode;
            }
            if (process.env.BOT_MODE) {
                console.log(`✅ Found process.env.BOT_MODE: ${process.env.BOT_MODE}`);
                return process.env.BOT_MODE;
            }
            
        } catch (error) {
            console.error('Error reading bot mode:', error);
        }
        
        console.log('⚠️ Using default mode: public');
        return 'public'; // Default
    }
};