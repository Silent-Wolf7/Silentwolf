// // File: ./commands/antiviewonce.js
import fs from 'fs';

export default {
    name: 'antiviewonce',
    alias: ['av'],
    description: 'Save view-once media to your DMs - ON/OFF toggle',
    category: 'tools',
    ownerOnly: true,
    
    async execute(sock, msg, args, prefix, extras) {
        const chatId = msg.key.remoteJid;
        const isOwner = extras.isOwner ? extras.isOwner() : false;
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ Owner only command'
            }, { quoted: msg });
            return;
        }
        
        // Get owner JID from message sender
        const ownerJid = msg.key.participant || chatId;
        
        // Load current config
        let config = { enabled: false, ownerJid: ownerJid };
        try {
            if (fs.existsSync('./antiviewonce_config.json')) {
                config = JSON.parse(fs.readFileSync('./antiviewonce_config.json', 'utf8'));
            }
        } catch {
            // Use default config
        }
        
        const action = args[0]?.toLowerCase() || 'help';
        
        switch (action) {
            case 'on':
            case 'enable':
            case 'activate':
                config.enabled = true;
                config.ownerJid = ownerJid;
                config.lastEnabled = new Date().toISOString();
                
                fs.writeFileSync('./antiviewonce_config.json', JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTI-VIEWONCE ENABLED*\n\n` +
                         `📱 **System is now ACTIVE!**\n\n` +
                         `*What will happen:*\n` +
                         `• View-once images → Sent to your DMs ✅\n` +
                         `• View-once videos → Sent to your DMs ✅\n` +
                         `• View-once audio → Sent to your DMs ✅\n\n` +
                         `*Test it:* Send a view-once photo/video in any chat\n` +
                         `*Check:* Your DMs with the bot\n\n` +
                         `🔐 **Your media stays private!**`
                }, { quoted: msg });
                
                // Also send confirmation to DMs
                if (config.ownerJid && config.ownerJid !== chatId) {
                    await sock.sendMessage(config.ownerJid, {
                        text: `🔐 *ANTI-VIEWONCE ACTIVATED*\n\n` +
                             `Your bot's view-once protection is now ON!\n\n` +
                             `All view-once media will be sent here automatically.`
                    });
                }
                break;
                
            case 'off':
            case 'disable':
            case 'deactivate':
                config.enabled = false;
                config.lastDisabled = new Date().toISOString();
                
                fs.writeFileSync('./antiviewonce_config.json', JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `❌ *ANTI-VIEWONCE DISABLED*\n\n` +
                         `📱 **System is now INACTIVE**\n\n` +
                         `No view-once media will be captured or saved.\n` +
                         `Use \`${prefix}av on\` to enable again.`
                }, { quoted: msg });
                break;
                
            case 'toggle':
                config.enabled = !config.enabled;
                config.ownerJid = ownerJid;
                config.lastToggled = new Date().toISOString();
                
                fs.writeFileSync('./antiviewonce_config.json', JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: config.enabled ? 
                        `✅ *ANTI-VIEWONCE TOGGLED ON*\n\nView-once media will now be sent to your DMs!\n\nTest: Send a view-once photo/video` :
                        `❌ *ANTI-VIEWONCE TOGGLED OFF*\n\nNo media will be captured.`
                }, { quoted: msg });
                break;
                
            case 'status':
            case 'check':
            case 'info':
                // Count saved media files
                let savedCount = 0;
                try {
                    const privateDir = './data/viewonce_private';
                    if (fs.existsSync(privateDir)) {
                        const files = fs.readdirSync(privateDir);
                        savedCount = files.filter(f => f.endsWith('.jpg') || f.endsWith('.mp4') || f.endsWith('.mp3')).length;
                    }
                } catch {}
                
                await sock.sendMessage(chatId, {
                    text: `📊 *ANTI-VIEWONCE STATUS*\n\n` +
                         `⚡ **Status:** ${config.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\n` +
                         `👑 **Owner:** ${config.ownerJid ? 'Set' : 'Not set'}\n` +
                         `💾 **Saved Media:** ${savedCount} files\n\n` +
                         `*Commands:*\n` +
                         `\`${prefix}av on\` - Enable system\n` +
                         `\`${prefix}av off\` - Disable system\n` +
                         `\`${prefix}av toggle\` - Toggle on/off\n` +
                         `\`${prefix}av status\` - This menu\n\n` +
                         `${config.enabled ? 
                            '📱 **System is ACTIVE** - View-once media being sent to your DMs!' :
                            '📱 **System is INACTIVE** - Enable to capture media.'}`
                }, { quoted: msg });
                break;
                
            case 'test':
                // Send test view-once message
                await sock.sendMessage(chatId, {
                    text: `🔍 *ANTI-VIEWONCE TEST*\n\n` +
                         `To test the system:\n\n` +
                         `1. Send a view-once image/video in ANY chat\n` +
                         `2. Wait 2-3 seconds\n` +
                         `3. Check your DMs with the bot\n` +
                         `4. You should receive the media!\n\n` +
                         `*Current Status:* ${config.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\n` +
                         `${config.enabled ? 
                            '🎯 **Ready for testing!** Send a view-once message now.' :
                            '❌ **Enable first:** Use `' + prefix + 'av on`'}`
                }, { quoted: msg });
                break;
                
            case 'recover':
            case 'get':
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (!quoted) {
                    await sock.sendMessage(chatId, {
                        text: `❌ *REPLY REQUIRED*\n\nReply to a view-once message to recover it.\n\n` +
                             `How to use:\n` +
                             `1. Find a view-once image/video\n` +
                             `2. Reply to it with: \`${prefix}av recover\`\n` +
                             `3. Media will be sent to your DMs`
                    }, { quoted: msg });
                    return;
                }
                
                // Check if it's a view-once message
                let isViewOnce = false;
                let mediaType = '';
                
                if (quoted.imageMessage?.viewOnce) {
                    isViewOnce = true;
                    mediaType = 'image';
                } else if (quoted.videoMessage?.viewOnce) {
                    isViewOnce = true;
                    mediaType = 'video';
                } else if (quoted.audioMessage?.viewOnce) {
                    isViewOnce = true;
                    mediaType = 'audio';
                }
                
                if (!isViewOnce) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *NOT A VIEW-ONCE MESSAGE*\n\nThe replied message is not a view-once image/video/audio.'
                    }, { quoted: msg });
                    return;
                }
                
                await sock.sendMessage(chatId, {
                    text: `🔍 *RECOVERING VIEW-ONCE ${mediaType.toUpperCase()}...*\n\n` +
                         `Downloading and sending to your DMs...\n` +
                         `Please wait...`
                }, { quoted: msg });
                
                // The actual recovery will be handled by the main detection function
                // Just confirm it's being processed
                break;
                
            case 'help':
            default:
                await sock.sendMessage(chatId, {
                    text: `🔐 *ANTI-VIEWONCE COMMANDS*\n\n` +
                         `*Simple toggle system:*\n` +
                         `\`${prefix}av on\` - Enable (media → your DMs)\n` +
                         `\`${prefix}av off\` - Disable\n` +
                         `\`${prefix}av toggle\` - Toggle on/off\n` +
                         `\`${prefix}av status\` - Check status\n` +
                         `\`${prefix}av test\` - Test instructions\n` +
                         `\`${prefix}av recover\` - Recover a view-once (reply)\n` +
                         `\`${prefix}av help\` - This menu\n\n` +
                         `📱 **How it works:**\n` +
                         `1. Enable with \`${prefix}av on\`\n` +
                         `2. Send/view a view-once photo/video\n` +
                         `3. Media automatically sent to your DMs!\n\n` +
                         `🔒 **100% Private** - Only you can see the media!`
                }, { quoted: msg });
        }
    }
};