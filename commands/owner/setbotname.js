
// File: ./commands/owner/setbotname.js - UPDATED VERSION
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'setbotname',
    alias: ['botname','sbn','bn', 'changebotname', 'cbn','setname'],
    category: 'owner',
    description: 'Change the bot display name',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // Owner check
        if (!jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can change the bot name.`
            }, { quoted: msg });
        }
        
        // Show current bot name if no args
        if (!args[0]) {
            const currentName = this.getCurrentBotName();
            
            return sock.sendMessage(chatId, {
                text: `🤖 *BOT NAME MANAGEMENT*\n\n📝 Current Bot Name: *${currentName}*\n\n💡 To change the bot name, use:\n\`${PREFIX}setbotname <new_name>\`\n\nExample: \`${PREFIX}setbotname WolfBot Pro\`\n`
            }, { quoted: msg });
        }
        
        // Get the new bot name (join all arguments)
        const newBotName = args.join(' ').trim();
        
        // Validate name length
        if (newBotName.length < 2) {
            return sock.sendMessage(chatId, {
                text: `❌ Name too short! Bot name must be at least 2 characters.`
            }, { quoted: msg });
        }
        
        if (newBotName.length > 50) {
            return sock.sendMessage(chatId, {
                text: `❌ Name too long! Bot name must be less than 50 characters.`
            }, { quoted: msg });
        }
        
        try {
            // Get owner info for logging
            const senderJid = msg.key.participant || chatId;
            const cleaned = jidManager.cleanJid(senderJid);
            
            // Create or update bot settings
            const settings = {
                botName: newBotName,
                updatedBy: cleaned.cleanNumber || 'Unknown',
                updatedAt: new Date().toISOString(),
                timestamp: Date.now(),
                version: "1.0"
            };
            
            console.log(`🔄 Saving bot name "${newBotName}" to multiple locations...`);
            
            // Save to MULTIPLE locations for compatibility
            const saveLocations = [
                './bot_settings.json',  // Root directory (most important)
                path.join(__dirname, 'bot_settings.json'),  // Owner commands directory
                path.join(__dirname, '../bot_settings.json'),  // Commands directory
                path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
                path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up (likely menu directory)
            ];
            
            let savedCount = 0;
            for (const settingsPath of saveLocations) {
                try {
                    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
                    savedCount++;
                    console.log(`✅ Saved to: ${settingsPath}`);
                } catch (err) {
                    console.log(`⚠️ Could not save to ${settingsPath}: ${err.message}`);
                }
            }
            
            // Update global variable for immediate effect
            if (typeof global !== 'undefined') {
                global.BOT_NAME = newBotName;
                global.BOT_SETTINGS = settings;
            }
            
            // Update process environment
            process.env.BOT_NAME = newBotName;
            
            // Success message
            let successMsg = `✅ *Bot Name Updated Successfully!*\n`;
            successMsg += `✨ New Name: *${newBotName}*\n`;
            // successMsg += `✅ Saved to ${savedCount} location(s)\n\n`;
            // successMsg += `🔧 The new name will appear in:\n`;
            // successMsg += `├─ Menu header: ✅\n`;
            // successMsg += `├─ Command responses: ✅\n`;
            // successMsg += `└─ All bot interactions: ✅\n\n`;
            // successMsg += `💡 Use \`${PREFIX}menu\` to see the updated name immediately.`;
            
            await sock.sendMessage(chatId, {
                text: successMsg
            }, { quoted: msg });
            
            console.log(`✅ Bot name changed to "${newBotName}" by ${cleaned.cleanNumber}`);
            
        } catch (error) {
            console.error('Error saving bot name:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error saving bot name: ${error.message}\n\nPlease check file permissions.`
            }, { quoted: msg });
        }
    },
    
    // Helper function to get current bot name
    getCurrentBotName() {
        try {
            // Check multiple possible locations (same as in menu)
            const possiblePaths = [
                './bot_settings.json',
                path.join(__dirname, 'bot_settings.json'),
                path.join(__dirname, '../bot_settings.json'),
                path.join(__dirname, '../../bot_settings.json'),
                path.join(__dirname, '../../../bot_settings.json'),
            ];
            
            console.log('🔍 Checking for bot_settings.json in:');
            for (const settingsPath of possiblePaths) {
                console.log(`   - ${settingsPath}: ${existsSync(settingsPath) ? '✅' : '❌'}`);
            }
            
            for (const settingsPath of possiblePaths) {
                if (existsSync(settingsPath)) {
                    try {
                        console.log(`📂 Loading from: ${settingsPath}`);
                        const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
                        if (settings.botName && settings.botName.trim() !== '') {
                            console.log(`📊 Found bot name: "${settings.botName}"`);
                            return settings.botName.trim();
                        }
                    } catch (error) {
                        console.error(`Error reading ${settingsPath}:`, error);
                    }
                }
            }
            
            // Fallback to global variable
            console.log('🌐 Checking global variables...');
            if (global.BOT_NAME) {
                console.log(`✅ Found global.BOT_NAME: ${global.BOT_NAME}`);
                return global.BOT_NAME;
            }
            
            if (process.env.BOT_NAME) {
                console.log(`✅ Found process.env.BOT_NAME: ${process.env.BOT_NAME}`);
                return process.env.BOT_NAME;
            }
            
        } catch (error) {
            console.error('Error reading bot name:', error);
        }
        
        console.log('⚠️ Using default bot name: WOLFBOT');
        return 'WOLFBOT'; // Default
    }
};