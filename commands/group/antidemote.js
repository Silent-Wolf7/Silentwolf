import fs from 'fs';
import path from 'path';

const antiDemoteFile = './antidemote.json';

// Ensure JSON file exists
if (!fs.existsSync(antiDemoteFile)) {
    fs.writeFileSync(antiDemoteFile, JSON.stringify([], null, 2));
}

// Load settings
function loadAntiDemote() {
    try {
        if (!fs.existsSync(antiDemoteFile)) return [];
        const data = fs.readFileSync(antiDemoteFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading anti-demote settings:', error);
        return [];
    }
}

// Save settings
function saveAntiDemote(data) {
    try {
        fs.writeFileSync(antiDemoteFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving anti-demote settings:', error);
    }
}

// Utility function to clean JID
function cleanJid(jid) {
    if (!jid) return jid;
    // Remove device suffix and ensure proper format
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// Store message listeners to avoid duplicates
let messageListenerAttached = false;

export default {
    name: 'antidemote',
    description: 'Prevent admins from demoting other admins',
    category: 'group',
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        
        if (!isGroup) {
            return sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.' 
            }, { quoted: msg });
        }

        // Get sender's JID
        let sender = msg.key.participant || (msg.key.fromMe ? sock.user.id : msg.key.remoteJid);
        sender = cleanJid(sender);

        // Check if user is admin
        let isAdmin = false;
        let botIsAdmin = false;
        let botIsSuperAdmin = false;
        
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const cleanSender = cleanJid(sender);
            
            // Check if sender is admin
            const participant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === cleanSender;
            });
            
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            
            // Check if bot is admin
            const botJid = cleanJid(sock.user?.id);
            const botParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === botJid;
            });
            botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            botIsSuperAdmin = botParticipant?.admin === 'superadmin';
            
        } catch (error) {
            console.error('Error fetching group metadata:', error);
            return sock.sendMessage(chatId, { 
                text: '❌ Failed to fetch group information. Please try again.' 
            }, { quoted: msg });
        }

        // ONLY admins can use the command
        if (!isAdmin) {
            return sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command!' 
            }, { quoted: msg });
        }

        const settings = loadAntiDemote();
        const groupIndex = settings.findIndex(g => g.chatId === chatId);
        const currentGroupSettings = groupIndex !== -1 ? settings[groupIndex] : null;

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'on') {
            const mode = args[1]?.toLowerCase();
            
            if (!mode || !['warn', 'kick', 'demote'].includes(mode)) {
                return sock.sendMessage(chatId, { 
                    text: '🛡️ *Anti-Demote Setup*\n\nUsage: `.antidemote on [mode]`\n\nAvailable modes:\n• `warn` - Warn admins who try to demote other admins\n• `kick` - Kick admins who try to demote other admins\n• `demote` - Demote admins who try to demote other admins\n\nExample: `.antidemote on demote`' 
                }, { quoted: msg });
            }

            // Warn if bot is not admin for certain modes
            if (!botIsAdmin && (mode === 'kick' || mode === 'demote')) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ *Warning:* I need admin permissions for kick/demote modes!\n\nPlease make me an admin for these features to work properly.' 
                }, { quoted: msg });
            }

            // Warn if bot is not superadmin for kick mode
            if (!botIsSuperAdmin && mode === 'kick') {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ *Important:* I need *superadmin* permissions to kick members!\n\nPlease make me a superadmin for kick mode to work.' 
                }, { quoted: msg });
            }

            const newSettings = {
                chatId,
                enabled: true,
                mode: mode,
                warningCount: {}, // Track warnings per admin
                exemptSuperAdmins: true // Superadmins cannot be punished
            };

            if (groupIndex !== -1) {
                settings[groupIndex] = newSettings;
            } else {
                settings.push(newSettings);
            }

            saveAntiDemote(settings);
            
            // Attach listener for demote commands if not already attached
            if (!messageListenerAttached) {
                setupAntiDemoteMessageListener(sock);
                messageListenerAttached = true;
            }

            const modeDescriptions = {
                'warn': 'Admins will receive warnings when trying to demote other admins',
                'kick': 'Admins will be kicked for trying to demote other admins',
                'demote': 'Admins will be demoted for trying to demote other admins'
            };

            await sock.sendMessage(chatId, { 
                text: `✅ *Anti-Demote enabled!*\n\nMode: *${mode.toUpperCase()}*\n${modeDescriptions[mode]}\n\nSuperadmins are exempt from punishment.\n\nTo disable: \`.antidemote off\`` 
            }, { quoted: msg });

        } 
        else if (subCommand === 'off') {
            if (groupIndex !== -1) {
                settings.splice(groupIndex, 1);
                saveAntiDemote(settings);
                await sock.sendMessage(chatId, { 
                    text: '❌ *Anti-Demote disabled!*\n\nAdmins can now demote other admins normally.' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'ℹ️ Anti-Demote is already disabled in this group.\nAdmins can demote other admins.' 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'exemptsuper') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-Demote is not enabled in this group.\nEnable it first with `.antidemote on [mode]`' 
                }, { quoted: msg });
            }

            const toggle = args[1]?.toLowerCase();
            if (toggle === 'off') {
                currentGroupSettings.exemptSuperAdmins = false;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Superadmin exemption disabled*\n\nSuperadmins will now be punished for trying to demote admins.' 
                }, { quoted: msg });
            } else if (toggle === 'on') {
                currentGroupSettings.exemptSuperAdmins = true;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Superadmin exemption enabled*\n\nSuperadmins can demote admins without punishment.' 
                }, { quoted: msg });
            } else {
                const currentStatus = currentGroupSettings.exemptSuperAdmins ? 'enabled' : 'disabled';
                await sock.sendMessage(chatId, { 
                    text: `⚙️ *Superadmin Exemption Status*\n\nCurrently: *${currentStatus}*\n\nTo change:\n\`.antidemote exemptsuper on\` - Enable\n\`.antidemote exemptsuper off\` - Disable` 
                }, { quoted: msg });
            }
            
            settings[groupIndex] = currentGroupSettings;
            saveAntiDemote(settings);
        }
        else if (subCommand === 'status') {
            if (currentGroupSettings) {
                const status = currentGroupSettings.enabled ? 
                    `✅ ENABLED (${currentGroupSettings.mode.toUpperCase()} mode)` : 
                    '❌ DISABLED';
                
                const botStatus = botIsAdmin ? '✅ I am admin' : '❌ I am NOT admin';
                const botSuperStatus = botIsSuperAdmin ? '✅ I am superadmin' : '❌ I am NOT superadmin';
                
                let statusText = `🛡️ *Anti-Demote Status*\n\n`;
                statusText += `• Feature: ${status}\n`;
                statusText += `• Bot admin: ${botStatus}\n`;
                statusText += `• Bot superadmin: ${botSuperStatus}\n\n`;
                
                if (currentGroupSettings.enabled) {
                    statusText += `• Mode: ${currentGroupSettings.mode.toUpperCase()}\n`;
                    statusText += `• Superadmins exempt: ${currentGroupSettings.exemptSuperAdmins ? 'Yes' : 'No'}\n`;
                    
                    // Show warning counts if any
                    if (currentGroupSettings.warningCount && Object.keys(currentGroupSettings.warningCount).length > 0) {
                        const warnedAdmins = Object.keys(currentGroupSettings.warningCount).length;
                        const totalWarnings = Object.values(currentGroupSettings.warningCount).reduce((a, b) => a + b, 0);
                        statusText += `\n• Admins warned: ${warnedAdmins}\n`;
                        statusText += `• Total warnings: ${totalWarnings}`;
                    }
                }
                
                statusText += `\n\n*What is protected:*\n• Admins from being demoted by other admins`;
                statusText += `\n\n*What happens:*\n• Admins who try to demote other admins will be ${currentGroupSettings?.mode.toUpperCase() || 'punished'}`;
                
                await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `🛡️ *Anti-Demote Status*\n\n❌ DISABLED\nAdmins can demote other admins.\n\n*To enable:*\n\`.antidemote on [mode]\`\n\nModes: warn, kick, demote\n\nExample: \`.antidemote on demote\`` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'resetwarns') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-Demote is not enabled in this group.' 
                }, { quoted: msg });
            }

            // Check if mentioned someone
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            
            if (mentionedJid) {
                // Reset warns for specific admin
                const targetJid = cleanJid(mentionedJid);
                if (currentGroupSettings.warningCount[targetJid]) {
                    const warnings = currentGroupSettings.warningCount[targetJid];
                    delete currentGroupSettings.warningCount[targetJid];
                    const number = targetJid.split('@')[0];
                    await sock.sendMessage(chatId, { 
                        text: `✅ Warning count reset for @${number}\n(Removed ${warnings} warning${warnings !== 1 ? 's' : ''})`,
                        mentions: [targetJid]
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: 'ℹ️ This admin has no warnings.' 
                    }, { quoted: msg });
                }
            } else {
                // Reset all warns
                const totalWarnings = Object.values(currentGroupSettings.warningCount || {}).reduce((a, b) => a + b, 0);
                const warnedAdmins = Object.keys(currentGroupSettings.warningCount || {}).length;
                currentGroupSettings.warningCount = {};
                await sock.sendMessage(chatId, { 
                    text: `✅ All warning counts have been reset.\n(Removed ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''} from ${warnedAdmins} admin${warnedAdmins !== 1 ? 's' : ''})` 
                }, { quoted: msg });
            }
            
            settings[groupIndex] = currentGroupSettings;
            saveAntiDemote(settings);
        }
        else {
            // Show help
            const helpText = `
🛡️ *Anti-Demote Commands*

Prevents admins from demoting other admins.

*Main Commands:*
• \`.antidemote on <warn|kick|demote>\` - Enable protection
• \`.antidemote off\` - Disable protection
• \`.antidemote status\` - Check status

*Settings:*
• \`.antidemote exemptsuper [on/off]\` - Toggle superadmin exemption
• \`.antidemote resetwarns [@admin]\` - Reset warning counts

*Examples:*
• \`.antidemote on demote\` - Demote admins who try to demote others
• \`.antidemote on kick\` - Kick admins who try to demote others
• \`.antidemote on warn\` - Warn admins who try to demote others

*Note:* This detects \`.demote\` commands and prevents them from executing.
`.trim();
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }
    }
};

// Function to check if a message is a demote command
function isDemoteCommand(messageText) {
    if (!messageText) return false;
    
    const demotePatterns = [
        /^\.demote\b/i,  // .demote command
        /^!demote\b/i,   // !demote command
        /^\/demote\b/i,  // /demote command
        /^demote\s+@?\d+/i, // demote followed by number
        /^turunkan\b/i,  // Indonesian
        /^degradar\b/i,  // Spanish
        /^降级\b/i,      // Chinese
        /^rétrograder\b/i, // French
        /^declassare\b/i  // Italian
    ];
    
    return demotePatterns.some(pattern => pattern.test(messageText.trim()));
}

// Function to check if a target is an admin
async function isTargetAdmin(sock, chatId, targetJid) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const cleanTargetJid = cleanJid(targetJid);
        const targetParticipant = groupMetadata.participants.find(p => 
            cleanJid(p.id) === cleanTargetJid
        );
        
        return targetParticipant?.admin === 'admin' || targetParticipant?.admin === 'superadmin';
    } catch (error) {
        console.error('Error checking if target is admin:', error);
        return false;
    }
}

// Function to get target from message
function getDemoteTarget(message) {
    let target = null;
    
    // Check mentions
    const mentions = message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentions && mentions.length > 0) {
        target = mentions[0];
    }
    // Check reply
    else if (message?.extendedTextMessage?.contextInfo?.participant) {
        target = message.extendedTextMessage.contextInfo.participant;
    }
    // Check args in text
    else {
        const text = message?.conversation || 
                    message?.extendedTextMessage?.text || 
                    message?.imageMessage?.caption || '';
        const match = text.match(/(\d+)/g);
        if (match && match[0].length > 8) {
            target = match[0] + '@s.whatsapp.net';
        }
    }
    
    return target ? cleanJid(target) : null;
}

function setupAntiDemoteMessageListener(sock) {
    console.log('🛡️ Setting up anti-demote message listener...');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const newMsg = messages[0];
        
        // Skip if no message or not a group message
        if (!newMsg || !newMsg.key.remoteJid?.endsWith('@g.us')) return;
        
        const chatId = newMsg.key.remoteJid;
        
        // Load current settings
        const settings = loadAntiDemote();
        const groupSettings = settings.find(g => g.chatId === chatId);
        
        // Skip if anti-demote not enabled for this group
        if (!groupSettings || !groupSettings.enabled) return;
        
        const message = newMsg.message;
        const text = message?.conversation || 
                    message?.extendedTextMessage?.text || 
                    message?.imageMessage?.caption ||
                    '';
        
        // Check if this is a demote command
        if (!isDemoteCommand(text)) return;
        
        // Get sender
        const messageSender = newMsg.key.participant || newMsg.key.remoteJid;
        const cleanMessageSender = cleanJid(messageSender);
        const senderNumber = cleanMessageSender.split('@')[0];
        
        // Skip bot's own messages
        if (newMsg.key.fromMe) return;
        
        try {
            // Fetch group metadata
            const groupMetadata = await sock.groupMetadata(chatId);
            
            // Check if sender is admin
            let isSenderAdmin = false;
            let isSenderSuperAdmin = false;
            const senderParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === cleanMessageSender;
            });
            
            isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
            isSenderSuperAdmin = senderParticipant?.admin === 'superadmin';
            
            // Skip if sender is not admin (can't demote anyway)
            if (!isSenderAdmin) return;
            
            // Skip if sender is superadmin and exempt
            if (isSenderSuperAdmin && groupSettings.exemptSuperAdmins) {
                console.log(`Skipping superadmin ${cleanMessageSender} for demote command in ${chatId}`);
                return;
            }
            
            // Get target from message
            const targetJid = getDemoteTarget(message);
            if (!targetJid) {
                // Can't determine target, but still warn about using demote command
                console.log(`Demote command detected but no target found from ${cleanMessageSender} in ${chatId}`);
                return;
            }
            
            // Check if target is an admin
            const isTargetAnAdmin = await isTargetAdmin(sock, chatId, targetJid);
            if (!isTargetAnAdmin) {
                console.log(`Target ${targetJid} is not an admin, allowing demote command`);
                return;
            }
            
            console.log(`Admin demote command detected from ${cleanMessageSender} targeting admin ${targetJid} in ${chatId}`);
            
            // Prevent the demote command from executing by stopping here
            // We'll handle the punishment instead
            
            // Check bot permissions
            const botJid = cleanJid(sock.user?.id);
            const botParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === botJid;
            });
            const botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            const botIsSuperAdmin = botParticipant?.admin === 'superadmin';
            
            // Initialize warning count for user if not exists
            if (!groupSettings.warningCount) {
                groupSettings.warningCount = {};
            }
            
            const userId = cleanMessageSender;
            if (!groupSettings.warningCount[userId]) {
                groupSettings.warningCount[userId] = 0;
            }
            
            const targetNumber = targetJid.split('@')[0];
            
            // Handle based on mode
            switch (groupSettings.mode) {
                case 'warn':
                    groupSettings.warningCount[userId]++;
                    const warnings = groupSettings.warningCount[userId];
                    
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *Demote Warning* @${senderNumber}\n\nYou cannot demote other admins in this group!\n\nTarget: @${targetNumber}\nWarning #${warnings}\n\nRepeated violations will result in stricter actions.`,
                        mentions: [cleanMessageSender, targetJid]
                    });
                    
                    // Update settings
                    const warnGroupIndex = settings.findIndex(g => g.chatId === chatId);
                    if (warnGroupIndex !== -1) {
                        settings[warnGroupIndex] = groupSettings;
                        saveAntiDemote(settings);
                    }
                    break;
                    
                case 'kick':
                    if (!botIsSuperAdmin) {
                        await sock.sendMessage(chatId, { 
                            text: `⚠️ *Cannot Kick*\n\nI need superadmin permissions to kick members.\n\n@${senderNumber} tried to demote admin @${targetNumber} but I cannot kick them.`,
                            mentions: [cleanMessageSender, targetJid]
                        });
                        return;
                    }
                    
                    // Send warning before kick
                    await sock.sendMessage(chatId, { 
                        text: `🚫 *Violation Detected* @${senderNumber}\n\nDemoting admins is not allowed in this group!\nTarget: @${targetNumber}\n\nYou will be kicked for this violation.`,
                        mentions: [cleanMessageSender, targetJid]
                    });
                    
                    // Wait a moment then kick
                    setTimeout(async () => {
                        try {
                            await sock.groupParticipantsUpdate(chatId, [cleanMessageSender], 'remove');
                            await sock.sendMessage(chatId, { 
                                text: `👢 *Admin Kicked*\n\n@${senderNumber} was removed for trying to demote admin @${targetNumber}.`
                            });
                        } catch (kickError) {
                            console.error('Failed to kick admin:', kickError);
                            await sock.sendMessage(chatId, { 
                                text: `❌ *Failed to kick admin*\n\nCould not remove @${senderNumber}. Please check my permissions.`,
                                mentions: [cleanMessageSender]
                            });
                        }
                    }, 2000);
                    break;
                    
                case 'demote':
                    if (!botIsAdmin) {
                        await sock.sendMessage(chatId, { 
                            text: `⚠️ *Cannot Demote*\n\nI need admin permissions to demote members.\n\n@${senderNumber} tried to demote admin @${targetNumber} but I cannot demote them.`,
                            mentions: [cleanMessageSender, targetJid]
                        });
                        return;
                    }
                    
                    // Send warning before demote
                    await sock.sendMessage(chatId, { 
                        text: `🚫 *Violation Detected* @${senderNumber}\n\nDemoting admins is not allowed in this group!\nTarget: @${targetNumber}\n\nYou will be demoted for this violation.`,
                        mentions: [cleanMessageSender, targetJid]
                    });
                    
                    // Wait a moment then demote
                    setTimeout(async () => {
                        try {
                            await sock.groupParticipantsUpdate(chatId, [cleanMessageSender], 'demote');
                            await sock.sendMessage(chatId, { 
                                text: `⬇️ *Admin Demoted*\n\n@${senderNumber} was demoted for trying to demote admin @${targetNumber}.`
                            });
                        } catch (demoteError) {
                            console.error('Failed to demote admin:', demoteError);
                            await sock.sendMessage(chatId, { 
                                text: `❌ *Failed to demote admin*\n\nCould not demote @${senderNumber}. Please check my permissions.`,
                                mentions: [cleanMessageSender]
                            });
                        }
                    }, 2000);
                    break;
            }
            
        } catch (error) {
            console.error('Error handling demote command detection:', error);
        }
    });
    
    console.log('✅ Anti-demote message listener attached');
}

// Setup the listener when this module is imported
// We need to check if sock is available globally
let globalSock = null;

// Function to set up listener when sock is available
export function setupAntiDemote(sockInstance) {
    if (sockInstance && !messageListenerAttached) {
        globalSock = sockInstance;
        setupAntiDemoteMessageListener(sockInstance);
        messageListenerAttached = true;
    }
}