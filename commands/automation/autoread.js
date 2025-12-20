// // ⚙️ *Advanced Commands:*
// // • \`.autoread delay [ms]\` - Set delay before reading
// // • \`.autoread whitelist\` - Manage excluded chats
// // • \`.autoread blacklist\` - Manage forced read chats
// // • \`.autoread test\` - Test current settings


// import fs from 'fs';

// const settingsFile = './autoread_settings.json';

// // Ensure settings file exists
// if (!fs.existsSync(settingsFile)) {
//     const initialSettings = {
//         enabled: false,
//         mode: 'both', // 'groups', 'dms', 'both', 'off'
//         delay: 2000, // 2 seconds delay before marking as read
//         groups: [],
//         whitelist: [], // Users/groups to exclude from autoread
//         blacklist: []  // Users/groups to include even if not in mode
//     };
//     fs.writeFileSync(settingsFile, JSON.stringify(initialSettings, null, 2));
// }

// // Load settings
// function loadSettings() {
//     try {
//         const data = fs.readFileSync(settingsFile, 'utf8');
//         return JSON.parse(data);
//     } catch (error) {
//         console.error('Error loading autoread settings:', error);
//         return {
//             enabled: false,
//             mode: 'both',
//             delay: 2000,
//             groups: [],
//             whitelist: [],
//             blacklist: []
//         };
//     }
// }

// // Save settings
// function saveSettings(settings) {
//     try {
//         fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
//     } catch (error) {
//         console.error('Error saving autoread settings:', error);
//     }
// }

// // Clean JID helper function
// function cleanJid(jid) {
//     if (!jid) return jid;
//     const clean = jid.split(':')[0];
//     return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
// }

// // Auto-read message function
// async function markAsRead(sock, jid, messageId) {
//     try {
//         await sock.readMessages([{ remoteJid: jid, id: messageId }]);
//         return true;
//     } catch (error) {
//         console.error('Error marking message as read:', error);
//         return false;
//     }
// }

// // Process and auto-read messages
// let autoreadActive = false;
// let autoreadTimeout = null;

// function setupAutoread(sock) {
//     if (autoreadActive) return;
    
//     console.log('🔧 Setting up auto-read feature...');
    
//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         try {
//             const settings = loadSettings();
            
//             // Check if autoread is enabled
//             if (!settings.enabled || settings.mode === 'off') {
//                 return;
//             }
            
//             for (const message of messages) {
//                 // Skip if message is from us
//                 if (message.key.fromMe) {
//                     continue;
//                 }
                
//                 const chatJid = cleanJid(message.key.remoteJid);
//                 const isGroup = chatJid.endsWith('@g.us');
//                 const messageId = message.key.id;
                
//                 // Check whitelist (exclude)
//                 if (settings.whitelist.includes(chatJid)) {
//                     continue;
//                 }
                
//                 // Check blacklist (force include)
//                 const forceRead = settings.blacklist.includes(chatJid);
                
//                 // Check mode
//                 let shouldRead = false;
                
//                 if (forceRead) {
//                     shouldRead = true;
//                 } else if (settings.mode === 'both') {
//                     shouldRead = true;
//                 } else if (settings.mode === 'groups' && isGroup) {
//                     shouldRead = true;
//                 } else if (settings.mode === 'dms' && !isGroup) {
//                     shouldRead = true;
//                 }
                
//                 if (shouldRead) {
//                     // Delay before marking as read
//                     setTimeout(async () => {
//                         const success = await markAsRead(sock, chatJid, messageId);
//                         if (success) {
//                             if (isGroup) {
//                                 const groupName = await getGroupName(sock, chatJid);
//                                 console.log(`✅ Auto-read: ${groupName || 'Group'} (${messageId.substring(0, 8)}...)`);
//                             } else {
//                                 console.log(`✅ Auto-read: ${chatJid.split('@')[0]} (${messageId.substring(0, 8)}...)`);
//                             }
//                         }
//                     }, settings.delay);
//                 }
//             }
//         } catch (error) {
//             console.error('Error in auto-read:', error);
//         }
//     });
    
//     autoreadActive = true;
//     console.log('✅ Auto-read feature activated!');
// }

// // Get group name helper
// async function getGroupName(sock, groupJid) {
//     try {
//         const metadata = await sock.groupMetadata(groupJid);
//         return metadata.subject;
//     } catch (error) {
//         return null;
//     }
// }

// // Get contact name helper
// async function getContactName(sock, jid) {
//     try {
//         const contact = await sock.getContact(jid);
//         return contact.name || contact.notify || jid.split('@')[0];
//     } catch (error) {
//         return jid.split('@')[0];
//     }
// }

// export default {
//     name: 'autoread',
//     description: 'Automatically mark messages as read',
//     category: 'utility',
//     async execute(sock, msg, args, metadata) {
//         const chatId = msg.key.remoteJid;
//         const settings = loadSettings();
        
//         const subCommand = args[0]?.toLowerCase();
//         const option = args[1]?.toLowerCase();
        
//         // Setup autoread if not active
//         if (!autoreadActive) {
//             setupAutoread(sock);
//         }
        
//         if (!subCommand || subCommand === 'status') {
//             // Show current status
//             let statusText = `📖 *Auto-Read Status*\n\n`;
                        
//             statusText += `💡 *Usage:*\n`;
//             statusText += `• \`.autoread groups\` \n`;
//             statusText += `• \`.autoread dms\` \n`;
//             statusText += `• \`.autoread both\` \n`;
//             statusText += `• \`.autoread off\` \n`
            
//             await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
//         }
//         else if (subCommand === 'groups') {
//             settings.enabled = true;
//             settings.mode = 'groups';
//             saveSettings(settings);
            
//             await sock.sendMessage(chatId, { 
//                 text: '✅ *Auto-Read: Groups Only*\n\nOnly group messages will be automatically marked as read.' 
//             }, { quoted: msg });
//         }
//         else if (subCommand === 'dms') {
//             settings.enabled = true;
//             settings.mode = 'dms';
//             saveSettings(settings);
            
//             await sock.sendMessage(chatId, { 
//                 text: '✅ *Auto-Read: DMs Only*\n\nOnly direct messages will be automatically marked as read.' 
//             }, { quoted: msg });
//         }
//         else if (subCommand === 'both') {
//             settings.enabled = true;
//             settings.mode = 'both';
//             saveSettings(settings);
            
//             await sock.sendMessage(chatId, { 
//                 text: '✅ *Auto-Read: All Messages*\n\nAll messages (groups and DMs) will be automatically marked as read.' 
//             }, { quoted: msg });
//         }
//         else if (subCommand === 'off') {
//             settings.enabled = false;
//             settings.mode = 'off';
//             saveSettings(settings);
            
//             await sock.sendMessage(chatId, { 
//                 text: '❌ *Auto-Read Disabled*\n\nMessages will no longer be automatically marked as read.' 
//             }, { quoted: msg });
//         }
//         else if (subCommand === 'delay') {
//             const delay = parseInt(args[1]);
//             if (isNaN(delay) || delay < 0) {
//                 await sock.sendMessage(chatId, { 
//                     text: '⚠️ Please specify a valid delay in milliseconds.\nExample: `.autoread delay 3000` for 3 seconds.' 
//                 }, { quoted: msg });
//             } else {
//                 settings.delay = delay;
//                 saveSettings(settings);
                
//                 await sock.sendMessage(chatId, { 
//                     text: `✅ *Delay Updated*\n\nAuto-read delay set to ${delay}ms (${delay/1000} seconds).` 
//                 }, { quoted: msg });
//             }
//         }
//         else if (subCommand === 'whitelist') {
//             const action = args[1]?.toLowerCase();
//             const target = args[2];
            
//             if (!action) {
//                 // Show whitelist
//                 if (settings.whitelist.length === 0) {
//                     await sock.sendMessage(chatId, { 
//                         text: '📝 *Whitelist (Excluded Chats)*\n\nNo chats in whitelist. Messages from all chats will be auto-read.' 
//                     }, { quoted: msg });
//                 } else {
//                     let whitelistText = '📝 *Whitelist (Excluded Chats)*\n\n';
                    
//                     for (let i = 0; i < settings.whitelist.length; i++) {
//                         const jid = settings.whitelist[i];
//                         const isGroup = jid.endsWith('@g.us');
//                         const name = isGroup ? 
//                             (await getGroupName(sock, jid)) || 'Unknown Group' :
//                             (await getContactName(sock, jid));
                        
//                         whitelistText += `${i + 1}. ${name}\n`;
//                         whitelistText += `   ${jid}\n\n`;
//                     }
                    
//                     whitelistText += `💡 Use:\n`;
//                     whitelistText += `• \`.autoread whitelist add\` - Add current chat\n`;
//                     whitelistText += `• \`.autoread whitelist remove [number]\` - Remove from list\n`;
//                     whitelistText += `• \`.autoread whitelist clear\` - Clear all`;
                    
//                     await sock.sendMessage(chatId, { text: whitelistText }, { quoted: msg });
//                 }
//             }
//             else if (action === 'add') {
//                 const jid = cleanJid(chatId);
                
//                 if (settings.whitelist.includes(jid)) {
//                     await sock.sendMessage(chatId, { 
//                         text: '⚠️ This chat is already in the whitelist.' 
//                     }, { quoted: msg });
//                 } else {
//                     settings.whitelist.push(jid);
//                     saveSettings(settings);
                    
//                     const name = chatId.endsWith('@g.us') ? 
//                         (await getGroupName(sock, chatId)) || 'Group' :
//                         (await getContactName(sock, chatId));
                    
//                     await sock.sendMessage(chatId, { 
//                         text: `✅ Added to whitelist:\n${name}\n\nMessages from this chat will NOT be auto-read.` 
//                     }, { quoted: msg });
//                 }
//             }
//             else if (action === 'remove') {
//                 const index = parseInt(args[2]) - 1;
                
//                 if (isNaN(index) || index < 0 || index >= settings.whitelist.length) {
//                     await sock.sendMessage(chatId, { 
//                         text: `⚠️ Please specify a valid number (1-${settings.whitelist.length}).` 
//                     }, { quoted: msg });
//                 } else {
//                     const removedJid = settings.whitelist.splice(index, 1)[0];
//                     saveSettings(settings);
                    
//                     await sock.sendMessage(chatId, { 
//                         text: `✅ Removed from whitelist:\n${removedJid}` 
//                     }, { quoted: msg });
//                 }
//             }
//             else if (action === 'clear') {
//                 settings.whitelist = [];
//                 saveSettings(settings);
                
//                 await sock.sendMessage(chatId, { 
//                     text: '✅ Whitelist cleared! All chats will be auto-read based on mode.' 
//                 }, { quoted: msg });
//             }
//         }
//         else if (subCommand === 'blacklist') {
//             const action = args[1]?.toLowerCase();
//             const target = args[2];
            
//             if (!action) {
//                 // Show blacklist
//                 if (settings.blacklist.length === 0) {
//                     await sock.sendMessage(chatId, { 
//                         text: '📝 *Blacklist (Force Read Chats)*\n\nNo chats in blacklist.' 
//                     }, { quoted: msg });
//                 } else {
//                     let blacklistText = '📝 *Blacklist (Force Read Chats)*\n\n';
                    
//                     for (let i = 0; i < settings.blacklist.length; i++) {
//                         const jid = settings.blacklist[i];
//                         const isGroup = jid.endsWith('@g.us');
//                         const name = isGroup ? 
//                             (await getGroupName(sock, jid)) || 'Unknown Group' :
//                             (await getContactName(sock, jid));
                        
//                         blacklistText += `${i + 1}. ${name}\n`;
//                         blacklistText += `   ${jid}\n\n`;
//                     }
                    
//                     blacklistText += `💡 Use:\n`;
//                     blacklistText += `• \`.autoread blacklist add\` - Add current chat\n`;
//                     blacklistText += `• \`.autoread blacklist remove [number]\` - Remove from list\n`;
//                     blacklistText += `• \`.autoread blacklist clear\` - Clear all`;
                    
//                     await sock.sendMessage(chatId, { text: blacklistText }, { quoted: msg });
//                 }
//             }
//             else if (action === 'add') {
//                 const jid = cleanJid(chatId);
                
//                 if (settings.blacklist.includes(jid)) {
//                     await sock.sendMessage(chatId, { 
//                         text: '⚠️ This chat is already in the blacklist.' 
//                     }, { quoted: msg });
//                 } else {
//                     settings.blacklist.push(jid);
//                     saveSettings(settings);
                    
//                     const name = chatId.endsWith('@g.us') ? 
//                         (await getGroupName(sock, chatId)) || 'Group' :
//                         (await getContactName(sock, chatId));
                    
//                     await sock.sendMessage(chatId, { 
//                         text: `✅ Added to blacklist:\n${name}\n\nMessages from this chat will ALWAYS be auto-read.` 
//                     }, { quoted: msg });
//                 }
//             }
//             else if (action === 'remove') {
//                 const index = parseInt(args[2]) - 1;
                
//                 if (isNaN(index) || index < 0 || index >= settings.blacklist.length) {
//                     await sock.sendMessage(chatId, { 
//                         text: `⚠️ Please specify a valid number (1-${settings.blacklist.length}).` 
//                     }, { quoted: msg });
//                 } else {
//                     const removedJid = settings.blacklist.splice(index, 1)[0];
//                     saveSettings(settings);
                    
//                     await sock.sendMessage(chatId, { 
//                         text: `✅ Removed from blacklist:\n${removedJid}` 
//                     }, { quoted: msg });
//                 }
//             }
//             else if (action === 'clear') {
//                 settings.blacklist = [];
//                 saveSettings(settings);
                
//                 await sock.sendMessage(chatId, { 
//                     text: '✅ Blacklist cleared!' 
//                 }, { quoted: msg });
//             }
//         }
//         else if (subCommand === 'test') {
//             // Test current settings
//             const isGroup = chatId.endsWith('@g.us');
//             const name = isGroup ? 
//                 (await getGroupName(sock, chatId)) || 'Group' :
//                 (await getContactName(sock, chatId));
            
//             let testText = `🧪 *Auto-Read Test*\n\n`;
//             testText += `• Current chat: ${name}\n`;
//             testText += `• Type: ${isGroup ? 'Group' : 'DM'}\n`;
//             testText += `• Mode: ${settings.mode}\n`;
//             testText += `• Enabled: ${settings.enabled}\n`;
//             testText += `• In Whitelist: ${settings.whitelist.includes(chatId) ? '✅ Yes' : '❌ No'}\n`;
//             testText += `• In Blacklist: ${settings.blacklist.includes(chatId) ? '✅ Yes' : '❌ No'}\n\n`;
            
//             let shouldRead = false;
//             if (settings.blacklist.includes(chatId)) {
//                 shouldRead = true;
//                 testText += `🔵 *Result:* Will auto-read (forced by blacklist)`;
//             } else if (settings.whitelist.includes(chatId)) {
//                 shouldRead = false;
//                 testText += `🔴 *Result:* Will NOT auto-read (excluded by whitelist)`;
//             } else if (!settings.enabled) {
//                 shouldRead = false;
//                 testText += `🔴 *Result:* Will NOT auto-read (disabled)`;
//             } else if (settings.mode === 'both') {
//                 shouldRead = true;
//                 testText += `🟢 *Result:* Will auto-read (mode: both)`;
//             } else if (settings.mode === 'groups' && isGroup) {
//                 shouldRead = true;
//                 testText += `🟢 *Result:* Will auto-read (mode: groups)`;
//             } else if (settings.mode === 'dms' && !isGroup) {
//                 shouldRead = true;
//                 testText += `🟢 *Result:* Will auto-read (mode: dms)`;
//             } else {
//                 shouldRead = false;
//                 testText += `🔴 *Result:* Will NOT auto-read`;
//             }
            
//             testText += `\n\n⏱️ Delay: ${settings.delay}ms`;
            
//             await sock.sendMessage(chatId, { text: testText }, { quoted: msg });
//         }
//         else {
//             // Show help
//             const helpText = `📖 *Auto-Read Command*

// • \`.autoread groups\` 
// • \`.autoread dms\` 
// • \`.autoread both\`
// • \`.autoread off\` 
// `;

//             await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//         }
//     }
// };

// // Export setup function for manual initialization
// export function startAutoread(sock) {
//     if (!autoreadActive) {
//         setupAutoread(sock);
//         autoreadActive = true;
//     }
// }























import fs from 'fs';

const settingsFile = './autoread_settings.json';

// Ensure settings file exists
if (!fs.existsSync(settingsFile)) {
    const initialSettings = {
        enabled: false,
        mode: 'both', // 'groups', 'dms', 'both', 'off'
        delay: 2000, // 2 seconds delay before marking as read
        whitelist: [], // Users/groups to exclude from autoread
        blacklist: [], // Users/groups to include even if not in mode
        silent: true // Silent mode - don't show terminal messages
    };
    fs.writeFileSync(settingsFile, JSON.stringify(initialSettings, null, 2));
}

// Load settings
function loadSettings() {
    try {
        const data = fs.readFileSync(settingsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading autoread settings:', error);
        return {
            enabled: false,
            mode: 'both',
            delay: 2000,
            whitelist: [],
            blacklist: [],
            silent: true
        };
    }
}

// Save settings
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving autoread settings:', error);
    }
}

// Clean JID helper function
function cleanJid(jid) {
    if (!jid) return jid;
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// Auto-read message function
async function markAsRead(sock, jid, messageId) {
    try {
        await sock.readMessages([{ remoteJid: jid, id: messageId }]);
        return true;
    } catch (error) {
        // Silent fail - don't show error in terminal
        return false;
    }
}

// Process and auto-read messages
let autoreadActive = false;

function setupAutoread(sock) {
    if (autoreadActive) return;
    
    const settings = loadSettings();
    
    // Only show initial activation message if not silent
    if (!settings.silent) {
        console.log('🔧 Setting up auto-read feature...');
    }
    
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            const settings = loadSettings();
            
            // Check if autoread is enabled
            if (!settings.enabled || settings.mode === 'off') {
                return;
            }
            
            for (const message of messages) {
                // Skip if message is from us
                if (message.key.fromMe) {
                    continue;
                }
                
                const chatJid = cleanJid(message.key.remoteJid);
                const isGroup = chatJid.endsWith('@g.us');
                const messageId = message.key.id;
                
                // Check whitelist (exclude)
                if (settings.whitelist.includes(chatJid)) {
                    continue;
                }
                
                // Check blacklist (force include)
                const forceRead = settings.blacklist.includes(chatJid);
                
                // Check mode
                let shouldRead = false;
                
                if (forceRead) {
                    shouldRead = true;
                } else if (settings.mode === 'both') {
                    shouldRead = true;
                } else if (settings.mode === 'groups' && isGroup) {
                    shouldRead = true;
                } else if (settings.mode === 'dms' && !isGroup) {
                    shouldRead = true;
                }
                
                if (shouldRead) {
                    // Delay before marking as read
                    setTimeout(async () => {
                        const success = await markAsRead(sock, chatJid, messageId);
                        // Don't show success messages in terminal
                    }, settings.delay);
                }
            }
        } catch (error) {
            // Silent fail - don't show error in terminal
        }
    });
    
    autoreadActive = true;
    
    // Only show success message if not silent
    if (!settings.silent) {
        console.log('✅ Auto-read feature activated!');
    }
}

// Get group name helper
async function getGroupName(sock, groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        return metadata.subject;
    } catch (error) {
        return null;
    }
}

// Get contact name helper
async function getContactName(sock, jid) {
    try {
        const contact = await sock.getContact(jid);
        return contact.name || contact.notify || jid.split('@')[0];
    } catch (error) {
        return jid.split('@')[0];
    }
}

export default {
    name: 'autoread',
    description: 'Automatically mark messages as read',
    category: 'utility',
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        const settings = loadSettings();
        
        const subCommand = args[0]?.toLowerCase();
        const option = args[1]?.toLowerCase();
        
        // Setup autoread if not active
        if (!autoreadActive) {
            setupAutoread(sock);
        }
        
        if (!subCommand || subCommand === 'status') {
            // Show current status
            let statusText = ``;

            statusText += `💡 *Usage:*\n`;
            statusText += `• \`.autoread groups\` \n`;
            statusText += `• \`.autoread dms\` \n`;
            statusText += `• \`.autoread both\` \n`;
            statusText += `• \`.autoread off\` \n`;
            
            await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
        }
        else if (subCommand === 'groups') {
            settings.enabled = true;
            settings.mode = 'groups';
            saveSettings(settings);
            
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-Read: Groups Only*\n\nOnly group messages will be automatically marked as read.' 
            }, { quoted: msg });
        }
        else if (subCommand === 'dms') {
            settings.enabled = true;
            settings.mode = 'dms';
            saveSettings(settings);
            
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-Read: DMs Only*\n\nOnly direct messages will be automatically marked as read.' 
            }, { quoted: msg });
        }
        else if (subCommand === 'both') {
            settings.enabled = true;
            settings.mode = 'both';
            saveSettings(settings);
            
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-Read: All Messages*\n\nAll messages (groups and DMs) will be automatically marked as read.' 
            }, { quoted: msg });
        }
        else if (subCommand === 'off') {
            settings.enabled = false;
            settings.mode = 'off';
            saveSettings(settings);
            
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto-Read Disabled*\n\nMessages will no longer be automatically marked as read.' 
            }, { quoted: msg });
        }
        else if (subCommand === 'delay') {
            const delay = parseInt(args[1]);
            if (isNaN(delay) || delay < 0) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ Please specify a valid delay in milliseconds.\nExample: `.autoread delay 3000` for 3 seconds.' 
                }, { quoted: msg });
            } else {
                settings.delay = delay;
                saveSettings(settings);
                
                await sock.sendMessage(chatId, { 
                    text: `✅ *Delay Updated*\n\nAuto-read delay set to ${delay}ms (${delay/1000} seconds).` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'whitelist') {
            const action = args[1]?.toLowerCase();
            
            if (!action) {
                // Show whitelist
                if (settings.whitelist.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: '📝 *Whitelist (Excluded Chats)*\n\nNo chats in whitelist. Messages from all chats will be auto-read.' 
                    }, { quoted: msg });
                } else {
                    let whitelistText = '📝 *Whitelist (Excluded Chats)*\n\n';
                    
                    for (let i = 0; i < settings.whitelist.length; i++) {
                        const jid = settings.whitelist[i];
                        const isGroup = jid.endsWith('@g.us');
                        const name = isGroup ? 
                            (await getGroupName(sock, jid)) || 'Unknown Group' :
                            (await getContactName(sock, jid));
                        
                        whitelistText += `${i + 1}. ${name}\n`;
                        whitelistText += `   ${jid}\n\n`;
                    }
                    
                    whitelistText += `💡 Use:\n`;
                    whitelistText += `• \`.autoread whitelist add\` - Add current chat\n`;
                    whitelistText += `• \`.autoread whitelist remove [number]\` - Remove from list\n`;
                    whitelistText += `• \`.autoread whitelist clear\` - Clear all`;
                    
                    await sock.sendMessage(chatId, { text: whitelistText }, { quoted: msg });
                }
            }
            else if (action === 'add') {
                const jid = cleanJid(chatId);
                
                if (settings.whitelist.includes(jid)) {
                    await sock.sendMessage(chatId, { 
                        text: '⚠️ This chat is already in the whitelist.' 
                    }, { quoted: msg });
                } else {
                    settings.whitelist.push(jid);
                    saveSettings(settings);
                    
                    const name = chatId.endsWith('@g.us') ? 
                        (await getGroupName(sock, chatId)) || 'Group' :
                        (await getContactName(sock, chatId));
                    
                    await sock.sendMessage(chatId, { 
                        text: `✅ Added to whitelist:\n${name}\n\nMessages from this chat will NOT be auto-read.` 
                    }, { quoted: msg });
                }
            }
            else if (action === 'remove') {
                const index = parseInt(args[2]) - 1;
                
                if (isNaN(index) || index < 0 || index >= settings.whitelist.length) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ Please specify a valid number (1-${settings.whitelist.length}).` 
                    }, { quoted: msg });
                } else {
                    const removedJid = settings.whitelist.splice(index, 1)[0];
                    saveSettings(settings);
                    
                    await sock.sendMessage(chatId, { 
                        text: `✅ Removed from whitelist:\n${removedJid}` 
                    }, { quoted: msg });
                }
            }
            else if (action === 'clear') {
                settings.whitelist = [];
                saveSettings(settings);
                
                await sock.sendMessage(chatId, { 
                    text: '✅ Whitelist cleared! All chats will be auto-read based on mode.' 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'blacklist') {
            const action = args[1]?.toLowerCase();
            
            if (!action) {
                // Show blacklist
                if (settings.blacklist.length === 0) {
                    await sock.sendMessage(chatId, { 
                        text: '📝 *Blacklist (Force Read Chats)*\n\nNo chats in blacklist.' 
                    }, { quoted: msg });
                } else {
                    let blacklistText = '📝 *Blacklist (Force Read Chats)*\n\n';
                    
                    for (let i = 0; i < settings.blacklist.length; i++) {
                        const jid = settings.blacklist[i];
                        const isGroup = jid.endsWith('@g.us');
                        const name = isGroup ? 
                            (await getGroupName(sock, jid)) || 'Unknown Group' :
                            (await getContactName(sock, jid));
                        
                        blacklistText += `${i + 1}. ${name}\n`;
                        blacklistText += `   ${jid}\n\n`;
                    }
                    
                    blacklistText += `💡 Use:\n`;
                    blacklistText += `• \`.autoread blacklist add\` - Add current chat\n`;
                    blacklistText += `• \`.autoread blacklist remove [number]\` - Remove from list\n`;
                    blacklistText += `• \`.autoread blacklist clear\` - Clear all`;
                    
                    await sock.sendMessage(chatId, { text: blacklistText }, { quoted: msg });
                }
            }
            else if (action === 'add') {
                const jid = cleanJid(chatId);
                
                if (settings.blacklist.includes(jid)) {
                    await sock.sendMessage(chatId, { 
                        text: '⚠️ This chat is already in the blacklist.' 
                    }, { quoted: msg });
                } else {
                    settings.blacklist.push(jid);
                    saveSettings(settings);
                    
                    const name = chatId.endsWith('@g.us') ? 
                        (await getGroupName(sock, chatId)) || 'Group' :
                        (await getContactName(sock, chatId));
                    
                    await sock.sendMessage(chatId, { 
                        text: `✅ Added to blacklist:\n${name}\n\nMessages from this chat will ALWAYS be auto-read.` 
                    }, { quoted: msg });
                }
            }
            else if (action === 'remove') {
                const index = parseInt(args[2]) - 1;
                
                if (isNaN(index) || index < 0 || index >= settings.blacklist.length) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ Please specify a valid number (1-${settings.blacklist.length}).` 
                    }, { quoted: msg });
                } else {
                    const removedJid = settings.blacklist.splice(index, 1)[0];
                    saveSettings(settings);
                    
                    await sock.sendMessage(chatId, { 
                        text: `✅ Removed from blacklist:\n${removedJid}` 
                    }, { quoted: msg });
                }
            }
            else if (action === 'clear') {
                settings.blacklist = [];
                saveSettings(settings);
                
                await sock.sendMessage(chatId, { 
                    text: '✅ Blacklist cleared!' 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'silent') {
            const mode = args[1]?.toLowerCase();
            
            if (mode === 'on') {
                settings.silent = true;
                saveSettings(settings);
                await sock.sendMessage(chatId, { 
                    text: '🔇 *Silent Mode Enabled*\n\nNo terminal messages will be shown for auto-read operations.' 
                }, { quoted: msg });
            } else if (mode === 'off') {
                settings.silent = false;
                saveSettings(settings);
                await sock.sendMessage(chatId, { 
                    text: '🔊 *Silent Mode Disabled*\n\nAuto-read operations will show messages in terminal.' 
                }, { quoted: msg });
            } else {
                const status = settings.silent ? 'enabled' : 'disabled';
                await sock.sendMessage(chatId, { 
                    text: `Silent mode is currently *${status}*.\n\nUse: \`.autoread silent on/off\`` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'test') {
            // Test current settings
            const isGroup = chatId.endsWith('@g.us');
            const name = isGroup ? 
                (await getGroupName(sock, chatId)) || 'Group' :
                (await getContactName(sock, chatId));
            
            let testText = `🧪 *Auto-Read Test*\n\n`;
            testText += `• Current chat: ${name}\n`;
            testText += `• Type: ${isGroup ? 'Group' : 'DM'}\n`;
            testText += `• Mode: ${settings.mode}\n`;
            testText += `• Enabled: ${settings.enabled}\n`;
            testText += `• In Whitelist: ${settings.whitelist.includes(chatId) ? '✅ Yes' : '❌ No'}\n`;
            testText += `• In Blacklist: ${settings.blacklist.includes(chatId) ? '✅ Yes' : '❌ No'}\n\n`;
            
            let shouldRead = false;
            if (settings.blacklist.includes(chatId)) {
                shouldRead = true;
                testText += `🔵 *Result:* Will auto-read (forced by blacklist)`;
            } else if (settings.whitelist.includes(chatId)) {
                shouldRead = false;
                testText += `🔴 *Result:* Will NOT auto-read (excluded by whitelist)`;
            } else if (!settings.enabled) {
                shouldRead = false;
                testText += `🔴 *Result:* Will NOT auto-read (disabled)`;
            } else if (settings.mode === 'both') {
                shouldRead = true;
                testText += `🟢 *Result:* Will auto-read (mode: both)`;
            } else if (settings.mode === 'groups' && isGroup) {
                shouldRead = true;
                testText += `🟢 *Result:* Will auto-read (mode: groups)`;
            } else if (settings.mode === 'dms' && !isGroup) {
                shouldRead = true;
                testText += `🟢 *Result:* Will auto-read (mode: dms)`;
            } else {
                shouldRead = false;
                testText += `🔴 *Result:* Will NOT auto-read`;
            }
            
            testText += `\n\n⏱️ Delay: ${settings.delay}ms`;
            testText += `\n🔇 Silent Mode: ${settings.silent ? '✅ Yes' : '❌ No'}`;
            
            await sock.sendMessage(chatId, { text: testText }, { quoted: msg });
        }
        else {
            // Show help
            const helpText = `📖 *Auto-Read Command*

📌 *Basic Commands:*
• \`.autoread groups\`
• \`.autoread dms\` 
• \`.autoread both\`
• \`.autoread off\` 
`;

            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }
    }
};

// Export setup function for manual initialization
export function startAutoread(sock) {
    if (!autoreadActive) {
        setupAutoread(sock);
        autoreadActive = true;
    }
}





// ⚙️ *Advanced Commands:*
// • \`.autoread delay [ms]\` - Set delay before reading
// • \`.autoread whitelist\` - Manage excluded chats
// • \`.autoread blacklist\` - Manage forced read chats
// • \`.autoread silent on/off\` - Toggle terminal messages
// • \`.autoread test\` - Test current settings

// 💡 *Example:*
// • \`.autoread groups\` - Read only groups
// • \`.autoread delay 5000\` - Wait 5 seconds
// • \`.autoread silent on\` - No terminal messages