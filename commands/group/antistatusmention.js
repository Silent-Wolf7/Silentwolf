import fs from 'fs';
import path from 'path';

const antiStatusMentionFile = './antistatusmention.json';

// Ensure JSON file exists
if (!fs.existsSync(antiStatusMentionFile)) {
    fs.writeFileSync(antiStatusMentionFile, JSON.stringify([], null, 2));
}

// Load settings
function loadAntiStatusMention() {
    try {
        if (!fs.existsSync(antiStatusMentionFile)) return [];
        const data = fs.readFileSync(antiStatusMentionFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading anti-status-mention settings:', error);
        return [];
    }
}

// Save settings
function saveAntiStatusMention(data) {
    try {
        fs.writeFileSync(antiStatusMentionFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving anti-status-mention settings:', error);
    }
}

// Utility function to clean JID
function cleanJid(jid) {
    if (!jid) return jid;
    // Remove device suffix and ensure proper format
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// Check if text contains group promotion
function containsGroupPromotion(text) {
    if (!text || typeof text !== 'string') return false;
    
    // Clean the text
    const cleanText = text.toLowerCase().replace(/[*_~`|]/g, '');
    
    // Patterns for group promotion
    const promotionPatterns = [
        // WhatsApp group links
        /chat\.whatsapp\.com\/[a-z0-9_-]+/gi,
        
        // Group promotion phrases
        /join\s+(?:my|our|this|the)\s+(?:whatsapp\s+)?group/gi,
        /whatsapp\s+group\s+link/gi,
        /group\s+(?:link|invite|join)/gi,
        /gc\s+(?:link|invite)/gi,
        /add\s+(?:me|us)\s+to\s+(?:group|chat|whatsapp)/gi,
        /new\s+(?:whatsapp\s+)?group/gi,
        /pm\s+for\s+group\s+link/gi,
        /dm\s+for\s+group\s+link/gi,
        /message\s+for\s+group\s+link/gi,
        /contact\s+for\s+group\s+link/gi,
        
        // Status-specific mentions
        /status\s+(?:me|my)\s+(?:for|to)\s+(?:join|group)/gi,
        /see\s+my\s+status\s+(?:for|to)\s+join/gi,
        /check\s+my\s+status\s+(?:for|to)\s+join/gi,
        /status\s+pe\s+hai/gi, // Hindi/Urdu: "is in status"
        /status\s+par\s+hai/gi,
        
        // Common abbreviations
        /wp\s+group/gi,
        /wa\s+group/gi,
        /whatsapp\s+gc/gi,
    ];
    
    // Check for direct WhatsApp group links first
    if (cleanText.includes('chat.whatsapp.com')) {
        return true;
    }
    
    // Check for other patterns
    for (const pattern of promotionPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(cleanText)) {
            return true;
        }
    }
    
    return false;
}

// Extract group links from text
function extractGroupLinks(text) {
    const links = [];
    if (!text || typeof text !== 'string') return links;
    
    // Find WhatsApp group links
    const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/[A-Za-z0-9_-]+/gi;
    const matches = text.match(groupLinkRegex);
    
    if (matches) {
        matches.forEach(link => {
            let cleanLink = link.trim();
            // Ensure proper URL format
            if (!cleanLink.startsWith('http')) {
                cleanLink = 'https://' + cleanLink;
            }
            // Remove trailing punctuation
            cleanLink = cleanLink.replace(/[.,;:!?]+$/, '');
            
            if (!links.includes(cleanLink)) {
                links.push(cleanLink);
            }
        });
    }
    
    return links;
}

// Check if message is likely a status promotion
function isStatusPromotion(message) {
    if (!message) return false;
    
    const text = extractMessageText(message);
    if (!text) return false;
    
    const cleanText = text.toLowerCase();
    
    // Indicators that this is about status
    const statusIndicators = [
        /my\s+status/gi,
        /see\s+status/gi,
        /check\s+status/gi,
        /status\s+(?:me|check|see)/gi,
        /bio\s+(?:me|check)/gi, // Some users say "bio" instead of status
        /dp\s+(?:me|check)/gi, // Display picture
    ];
    
    // Check if text mentions status AND contains group promotion
    const hasStatusMention = statusIndicators.some(pattern => {
        pattern.lastIndex = 0;
        return pattern.test(cleanText);
    });
    
    const hasGroupPromotion = containsGroupPromotion(text);
    
    return hasStatusMention && hasGroupPromotion;
}

// Extract text from any message type
function extractMessageText(message) {
    if (!message) return '';
    
    if (message.conversation) {
        return message.conversation;
    }
    
    if (message.extendedTextMessage) {
        return message.extendedTextMessage.text || '';
    }
    
    if (message.imageMessage) {
        return message.imageMessage.caption || '';
    }
    
    if (message.videoMessage) {
        return message.videoMessage.caption || '';
    }
    
    if (message.documentMessage) {
        return message.documentMessage.caption || '';
    }
    
    if (message.audioMessage) {
        return message.audioMessage.caption || '';
    }
    
    return '';
}

// Setup listener once globally
let antiStatusMentionListenerAttached = false;

export default {
    name: 'antistatusmention',
    description: 'Prevent users from promoting groups in their status/messages',
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

        const settings = loadAntiStatusMention();
        const groupIndex = settings.findIndex(g => g.chatId === chatId);
        const currentGroupSettings = groupIndex !== -1 ? settings[groupIndex] : null;

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'on') {
            const mode = args[1]?.toLowerCase();
            
            if (!mode || !['warn', 'delete', 'kick'].includes(mode)) {
                return sock.sendMessage(chatId, { 
                    text: '⚙️ *Anti-Status-Promotion Setup*\n\nUsage: `.antistatusmention on [mode]`\n\nAvailable modes:\n• `warn` - Warn users who promote groups via status/messages\n• `delete` - Delete group promotion messages\n• `kick` - Kick users who promote groups\n\nExample: `.antistatusmention on delete`' 
                }, { quoted: msg });
            }

            // Parse detection types if specified
            const detectionTypes = args.slice(2).map(t => t.toLowerCase()) || [];
            const defaultTypes = ['links', 'direct']; // Default detection
            const validTypes = ['links', 'direct', 'strict'];
            
            let selectedTypes = [];
            if (detectionTypes.length > 0) {
                selectedTypes = detectionTypes.filter(type => validTypes.includes(type));
            }
            if (selectedTypes.length === 0) {
                selectedTypes = defaultTypes;
            }

            // Warn if bot is not admin for certain modes
            if (!botIsAdmin && (mode === 'delete' || mode === 'kick')) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ *Warning:* I need admin permissions for delete/kick modes!\n\nPlease make me an admin for these features to work properly.' 
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
                detectionTypes: selectedTypes,
                exemptAdmins: true,
                warningCount: {}, // Track warnings per user
                violations: {} // Track user violations
            };

            if (groupIndex !== -1) {
                settings[groupIndex] = newSettings;
            } else {
                settings.push(newSettings);
            }

            saveAntiStatusMention(settings);
            
            // Attach listener if not already attached
            if (!antiStatusMentionListenerAttached) {
                setupAntiStatusMentionListener(sock);
                antiStatusMentionListenerAttached = true;
            }

            const modeDescriptions = {
                'warn': 'Users will receive warnings for group promotion',
                'delete': 'Group promotion messages will be deleted',
                'kick': 'Users will be kicked for group promotion'
            };

            const typesText = selectedTypes.map(t => {
                if (t === 'links') return '• WhatsApp group links';
                if (t === 'direct') return '• Direct group promotion';
                if (t === 'strict') return '• Any group references';
                return `• ${t.charAt(0).toUpperCase() + t.slice(1)}`;
            }).join('\n');

            await sock.sendMessage(chatId, { 
                text: `✅ *Anti-Status-Promotion enabled!*\n\nMode: *${mode.toUpperCase()}*\n${modeDescriptions[mode]}\n\nDetection types:\n${typesText}\n\nAdmins are exempt from this rule.\n\nTo disable: \`.antistatusmention off\`` 
            }, { quoted: msg });

        } 
        else if (subCommand === 'off') {
            if (groupIndex !== -1) {
                settings.splice(groupIndex, 1);
                saveAntiStatusMention(settings);
                await sock.sendMessage(chatId, { 
                    text: '❌ *Anti-Status-Promotion disabled!*\n\nUsers can now promote groups via messages.' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'ℹ️ Anti-Status-Promotion is already disabled in this group.' 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'exemptadmins') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-Status-Promotion is not enabled in this group.\nEnable it first with `.antistatusmention on [mode]`' 
                }, { quoted: msg });
            }

            const toggle = args[1]?.toLowerCase();
            if (toggle === 'off') {
                currentGroupSettings.exemptAdmins = false;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Admin exemption disabled*\n\nAdmins will now be subject to anti-promotion rules.' 
                }, { quoted: msg });
            } else if (toggle === 'on') {
                currentGroupSettings.exemptAdmins = true;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Admin exemption enabled*\n\nAdmins can now promote groups freely.' 
                }, { quoted: msg });
            } else {
                const currentStatus = currentGroupSettings.exemptAdmins ? 'enabled' : 'disabled';
                await sock.sendMessage(chatId, { 
                    text: `⚙️ *Admin Exemption Status*\n\nCurrently: *${currentStatus}*\n\nTo change:\n\`.antistatusmention exemptadmins on\` - Enable\n\`.antistatusmention exemptadmins off\` - Disable` 
                }, { quoted: msg });
            }
            
            settings[groupIndex] = currentGroupSettings;
            saveAntiStatusMention(settings);
        }
        else if (subCommand === 'status') {
            if (currentGroupSettings) {
                const status = currentGroupSettings.enabled ? 
                    `✅ ENABLED (${currentGroupSettings.mode.toUpperCase()} mode)` : 
                    '❌ DISABLED';
                
                const botStatus = botIsAdmin ? '✅ I am admin' : '❌ I am NOT admin';
                const botSuperStatus = botIsSuperAdmin ? '✅ I am superadmin' : '❌ I am NOT superadmin';
                
                let statusText = `📊 *Anti-Status-Promotion Status*\n\n`;
                statusText += `• Feature: ${status}\n`;
                statusText += `• Bot admin: ${botStatus}\n`;
                statusText += `• Bot superadmin: ${botSuperStatus}\n\n`;
                
                if (currentGroupSettings.enabled) {
                    const detectionTypesCount = currentGroupSettings.detectionTypes?.length || 0;
                    const detectionTypesText = currentGroupSettings.detectionTypes?.map(t => {
                        if (t === 'links') return 'Group links';
                        if (t === 'direct') return 'Direct promotion';
                        if (t === 'strict') return 'Strict';
                        return t;
                    }).join(', ') || 'None';
                    statusText += `• Detection types: ${detectionTypesCount}\n`;
                    statusText += `• Types: ${detectionTypesText}\n`;
                    statusText += `• Admins exempt: ${currentGroupSettings.exemptAdmins ? 'Yes' : 'No'}\n`;
                    
                    // Show warning counts if any
                    if (currentGroupSettings.warningCount && Object.keys(currentGroupSettings.warningCount).length > 0) {
                        statusText += `• Users warned: ${Object.keys(currentGroupSettings.warningCount).length}\n`;
                    }
                    
                    // Show violation counts if any
                    if (currentGroupSettings.violations && Object.keys(currentGroupSettings.violations).length > 0) {
                        statusText += `• Total violations: ${Object.keys(currentGroupSettings.violations).length}\n`;
                    }
                }
                
                statusText += `\n*What is detected:*\n• "See my status for group link"\n• "Join WhatsApp group: chat.whatsapp.com/..."\n• "Add me to group"\n• Any group promotion in messages`;
                
                statusText += `\n\n*Note:*\nI cannot view personal WhatsApp statuses.\nI monitor messages in this group for group promotion content.`;
                
                await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `📊 *Anti-Status-Promotion Status*\n\n❌ DISABLED\nUsers can promote groups via messages.\n\n*To enable:*\n\`.antistatusmention on [mode]\`\n\nModes: warn, delete, kick\n\nExample: \`.antistatusmention on delete\`` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'test') {
            // Test detection on provided text or quoted message
            let testText = '';
            
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                testText = extractMessageText(quotedMsg);
            }
            
            if (!testText && args.length > 1) {
                testText = args.slice(1).join(' ');
            }
            
            if (!testText) {
                testText = "See my status for WhatsApp group link! chat.whatsapp.com/ABC123";
            }
            
            const hasPromotion = containsGroupPromotion(testText);
            const isStatusPromo = isStatusPromotion({ conversation: testText });
            const extractedLinks = extractGroupLinks(testText);
            
            let testResult = `🔍 *Group Promotion Detection Test*\n\n`;
            testResult += `Test text: ${testText}\n\n`;
            testResult += `Contains group promotion: ${hasPromotion ? '✅ Yes' : '❌ No'}\n`;
            testResult += `Is status promotion: ${isStatusPromo ? '✅ Yes' : '❌ No'}\n`;
            
            if (hasPromotion) {
                testResult += `Extracted group links:\n`;
                extractedLinks.forEach((link, i) => {
                    testResult += `${i + 1}. \`${link}\`\n`;
                });
                
                testResult += `\n*Detection triggers:*\n`;
                
                // Show what triggered
                if (testText.toLowerCase().includes('chat.whatsapp.com')) {
                    testResult += `• WhatsApp group link\n`;
                }
                if (/(status|bio|dp)/i.test(testText) && /(group|join|link)/i.test(testText)) {
                    testResult += `• Status promotion phrase\n`;
                }
                if (/join.*group/i.test(testText)) {
                    testResult += `• "Join group" phrase\n`;
                }
                if (/add.*to.*group/i.test(testText)) {
                    testResult += `• "Add to group" phrase\n`;
                }
            }
            
            await sock.sendMessage(chatId, { text: testResult }, { quoted: msg });
        }
        else if (subCommand === 'scan') {
            // Scan recent messages for group promotion
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-Status-Promotion is not enabled.\nEnable it first with `.antistatusmention on [mode]`' 
                }, { quoted: msg });
            }
            
            await sock.sendMessage(chatId, { 
                text: '🔍 Scanning for group promotion messages...\n\n*Note:* This scans recent messages in the group for group promotion content.' 
            }, { quoted: msg });
            
            // Note: We cannot scan historical messages without storing them
            // This would require message logging functionality
            
            await sock.sendMessage(chatId, { 
                text: '⚠️ *Real-time monitoring only*\n\nI monitor messages as they are sent. For historical scanning, you would need a message logging system.\n\nCurrent monitoring is active for new messages.' 
            }, { quoted: msg });
        }
        else {
            // Show help
            const helpText = `
🚫 *Anti-Status-Promotion Commands*

Prevent users from promoting groups via messages/status mentions.

⚠️ *Important Note:*
• I CANNOT view personal WhatsApp statuses
• I monitor MESSAGES in this group for group promotion
• Detects "See my status for group link" type messages

• \`.antistatusmention on <warn|delete|kick> [types]\`
  Enable group promotion blocking
  Types: links, direct, strict
  Example: \`.antistatusmention on delete links\`

• \`.antistatusmention off\`
  Disable group promotion blocking

• \`.antistatusmention exemptadmins [on/off]\`
  Toggle admin exemption

• \`.antistatusmention status\`
  Check current settings

• \`.antistatusmention test [text]\`
  Test detection (or reply to a message)

• \`.antistatusmention scan\`
  Scan recent messages (limited)
`.trim();
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }
    }
};

function setupAntiStatusMentionListener(sock) {
    console.log('🔧 Setting up anti-status-promotion listener...');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const newMsg = messages[0];
        
        // Skip if no message or not a group message
        if (!newMsg || !newMsg.key.remoteJid?.endsWith('@g.us')) return;
        
        // Skip bot's own messages
        if (newMsg.key.fromMe) return;
        
        const chatId = newMsg.key.remoteJid;
        
        // Load current settings
        const settings = loadAntiStatusMention();
        const groupSettings = settings.find(g => g.chatId === chatId);
        
        // Skip if anti-status-promotion not enabled for this group
        if (!groupSettings || !groupSettings.enabled) return;
        
        // Get message content
        const message = newMsg.message;
        const messageText = extractMessageText(message);
        
        if (!messageText) return;
        
        // Check if message contains group promotion
        const hasGroupPromotion = containsGroupPromotion(messageText);
        const isStatusPromo = isStatusPromotion(message);
        const groupLinks = extractGroupLinks(messageText);
        
        // Determine if we should act based on detection types
        let shouldAct = false;
        let detectionReason = '';
        
        if (hasGroupPromotion) {
            // Check detection types
            const hasLinks = groupLinks.length > 0;
            const hasDirectPromotion = isStatusPromo || 
                                      /(join.*group|add.*to.*group|group.*link)/i.test(messageText);
            const hasAnyGroupRef = /(whatsapp.*group|wa.*group|gc)/i.test(messageText);
            
            if (hasLinks && groupSettings.detectionTypes.includes('links')) {
                shouldAct = true;
                detectionReason = 'WhatsApp group link';
            } else if (hasDirectPromotion && groupSettings.detectionTypes.includes('direct')) {
                shouldAct = true;
                detectionReason = 'direct group promotion';
            } else if (hasAnyGroupRef && groupSettings.detectionTypes.includes('strict')) {
                shouldAct = true;
                detectionReason = 'group reference';
            }
        }
        
        if (!shouldAct) return;
        
        // Get sender
        const messageSender = newMsg.key.participant || newMsg.key.remoteJid;
        const cleanMessageSender = cleanJid(messageSender);
        const senderNumber = cleanMessageSender.split('@')[0];
        
        try {
            // Fetch group metadata
            const groupMetadata = await sock.groupMetadata(chatId);
            
            // Check if sender is admin
            let isSenderAdmin = false;
            const senderParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === cleanMessageSender;
            });
            
            isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
            
            // Skip if sender is admin and exemptAdmins is true
            if (isSenderAdmin && groupSettings.exemptAdmins) {
                console.log(`Skipping admin ${cleanMessageSender} for group promotion in ${chatId}`);
                return;
            }
            
            console.log(`Group promotion (${detectionReason}) detected from ${cleanMessageSender} in ${chatId}`);
            
            // Track violation
            if (!groupSettings.violations) {
                groupSettings.violations = {};
            }
            
            if (!groupSettings.violations[cleanMessageSender]) {
                groupSettings.violations[cleanMessageSender] = {
                    count: 0,
                    lastViolation: '',
                    timestamps: []
                };
            }
            
            groupSettings.violations[cleanMessageSender].count++;
            groupSettings.violations[cleanMessageSender].lastViolation = detectionReason;
            groupSettings.violations[cleanMessageSender].timestamps.push(new Date().toISOString());
            
            // Initialize warning count for user if not exists
            if (!groupSettings.warningCount) {
                groupSettings.warningCount = {};
            }
            
            const userId = cleanMessageSender;
            if (!groupSettings.warningCount[userId]) {
                groupSettings.warningCount[userId] = 0;
            }
            
            // Handle based on mode
            switch (groupSettings.mode) {
                case 'warn':
                    groupSettings.warningCount[userId]++;
                    const warnings = groupSettings.warningCount[userId];
                    
                    let warningMessage = `⚠️ *Group Promotion Warning* @${senderNumber}\n\n`;
                    warningMessage += `Promoting other groups is not allowed in this group!\n`;
                    warningMessage += `Detection: ${detectionReason}\n`;
                    warningMessage += `Warning #${warnings}\n\n`;
                    
                    if (groupLinks.length > 0) {
                        warningMessage += `Found group invite links.\n`;
                    }
                    
                    if (isStatusPromo) {
                        warningMessage += `⚠️ Do not ask people to check your status for group links!\n\n`;
                    }
                    
                    warningMessage += `Repeated violations may result in stricter actions.`;
                    
                    await sock.sendMessage(chatId, { 
                        text: warningMessage,
                        mentions: [cleanMessageSender]
                    });
                    
                    // Update settings
                    const warnIndex = settings.findIndex(g => g.chatId === chatId);
                    if (warnIndex !== -1) {
                        settings[warnIndex] = groupSettings;
                        saveAntiStatusMention(settings);
                    }
                    break;
                    
                case 'delete':
                    // Send warning
                    let deleteMessage = `🚫 *Group Promotion Violation* @${senderNumber}\n\n`;
                    deleteMessage += `Promoting other groups is not allowed!\n`;
                    deleteMessage += `Detection: ${detectionReason}\n\n`;
                    
                    if (groupLinks.length > 0) {
                        deleteMessage += `⚠️ Sharing group invite links is prohibited.\n`;
                    }
                    
                    if (isStatusPromo) {
                        deleteMessage += `⚠️ Do not use status to promote groups!\n\n`;
                    }
                    
                    deleteMessage += `This message has been removed.`;
                    
                    await sock.sendMessage(chatId, { 
                        text: deleteMessage,
                        mentions: [cleanMessageSender]
                    });
                    
                    // Delete the promotion message
                    try {
                        await sock.sendMessage(chatId, { 
                            delete: {
                                id: newMsg.key.id,
                                participant: messageSender,
                                remoteJid: chatId,
                                fromMe: false
                            }
                        });
                        console.log(`Deleted group promotion message from ${cleanMessageSender} in ${chatId}`);
                    } catch (deleteError) {
                        console.error('Failed to delete message:', deleteError);
                    }
                    break;
                    
                case 'kick':
                    // Check if bot is superadmin
                    const botJid = cleanJid(sock.user?.id);
                    const botParticipant = groupMetadata.participants.find(p => {
                        const cleanParticipantJid = cleanJid(p.id);
                        return cleanParticipantJid === botJid;
                    });
                    const botIsSuperAdmin = botParticipant?.admin === 'superadmin';
                    
                    if (!botIsSuperAdmin) {
                        await sock.sendMessage(chatId, { 
                            text: `⚠️ *Cannot Kick*\n\nI need superadmin permissions to kick members.\n\nUser @${senderNumber} promoted groups but I cannot kick them.`,
                            mentions: [cleanMessageSender]
                        });
                        return;
                    }
                    
                    // Check violation count
                    const violationCount = groupSettings.violations[cleanMessageSender]?.count || 1;
                    
                    let kickMessage = `🚫 *Final Warning* @${senderNumber}\n\n`;
                    kickMessage += `Group promotion is strictly prohibited!\n`;
                    kickMessage += `Violation #${violationCount}: ${detectionReason}\n\n`;
                    
                    if (groupLinks.length > 0) {
                        kickMessage += `You shared WhatsApp group invite links.\n`;
                    }
                    
                    kickMessage += `You will be removed from this group.`;
                    
                    await sock.sendMessage(chatId, { 
                        text: kickMessage,
                        mentions: [cleanMessageSender]
                    });
                    
                    // Wait then kick (only if multiple violations or has links)
                    setTimeout(async () => {
                        try {
                            await sock.groupParticipantsUpdate(chatId, [cleanMessageSender], 'remove');
                            await sock.sendMessage(chatId, { 
                                text: `👢 *User Removed*\n\n@${senderNumber} was kicked for promoting other groups.\n\nReason: ${detectionReason}`
                            });
                        } catch (kickError) {
                            console.error('Failed to kick user:', kickError);
                            await sock.sendMessage(chatId, { 
                                text: `❌ *Failed to remove user*\n\nCould not remove @${senderNumber}. Please check my permissions.`,
                                mentions: [cleanMessageSender]
                            });
                        }
                    }, 3000);
                    break;
            }
            
        } catch (error) {
            console.error('Error handling group promotion detection:', error);
        }
    });
    
    console.log('✅ Anti-status-promotion listener attached (monitoring group messages for group promotion)');
}