import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get bot name (used by case 7)
export function getBotName() {
    try {
        const settingsPath = path.join(__dirname, 'bot_settings.json');
        if (fs.existsSync(settingsPath)) {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            return (settings.botName || "WOLFBOT").trim();
        }
    } catch (error) {
        console.error('❌ Error loading bot name:', error);
    }
    return "WOLFBOT";
}

// Helper function to set bot name
function setBotNameToFile(newName) {
    try {
        const settingsPath = path.join(__dirname, 'bot_settings.json');
        const settings = { botName: newName };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ Error saving bot name:', error);
        return false;
    }
}

// Function to get owner from owner.json
function getOwnerFromFile() {
    try {
        const ownerPath = path.join(__dirname, 'owner.json');
        if (fs.existsSync(ownerPath)) {
            const ownerData = fs.readFileSync(ownerPath, 'utf8');
            const ownerInfo = JSON.parse(ownerData);
            
            // Try different possible field names
            if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
                return ownerInfo.owner.trim();
            } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
                return ownerInfo.number.trim();
            } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
                return ownerInfo.phone.trim();
            } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
                return ownerInfo.contact.trim();
            } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
                return typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
            }
        }
    } catch (error) {
        console.error('❌ Error loading owner from owner.json:', error);
    }
    return "Unknown";
}

// Main command handler
async function setBotNameCommand(sock, m, jid, args) {
    try {
        // Get owner from owner.json
        const ownerNumber = getOwnerFromFile();
        
        // Check if user is owner
        const senderNumber = m.sender.split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber) || 
                       m.sender === `${ownerNumber}@s.whatsapp.net`;
        
        if (!isOwner) {
            await sock.sendMessage(jid, { 
                text: `❌ *ACCESS DENIED!*\nThis command is only available for bot owner.\n\n` +
                      `👑 *Authorized Owner:* ${ownerNumber}`
            }, { quoted: m });
            return;
        }

        // Show help if no arguments
        if (args.length === 0) {
            const currentName = getBotName();
            const prefix = global.prefix || ".";
            
            await sock.sendMessage(jid, { 
                text: `🐺 *BOT NAME MANAGER*\n\n` +
                      `📛 *Current Name:* ${currentName}\n` +
                      `🔄 *Menu Display:* 🐺 ${currentName} MENU 🐺\n\n` +
                      `📝 *USAGE:*\n` +
                      `• ${prefix}setbotname [new name]\n` +
                      `• ${prefix}setbotname reset\n` +
                      `• ${prefix}setbotname check\n\n` +
                      `💡 *EXAMPLES:*\n` +
                      `• ${prefix}setbotname ALPHABOT\n` +
                      `• ${prefix}setbotname NEXUS\n` +
                      `• ${prefix}setbotname WolfTech AI`
            }, { quoted: m });
            return;
        }

        const command = args[0].toLowerCase();

        // Handle 'check' command
        if (command === 'check') {
            const currentName = getBotName();
            
            await sock.sendMessage(jid, { 
                text: `✅ *BOT NAME CHECK*\n\n` +
                      `📛 *Current Name:* ${currentName}\n` +
                      `🔄 *Menu Display:*\n` +
                      `┌────────────────\n` +
                      `│ 🐺 ${currentName} MENU 🐺\n` +
                      `└────────────────\n\n` +
                      `📁 *Settings File:* bot_settings.json\n` +
                      `👑 *Bot Owner:* ${ownerNumber}`
            }, { quoted: m });
            return;
        }

        // Handle 'reset' command
        if (command === 'reset') {
            const success = setBotNameToFile("WOLFBOT");
            
            if (success) {
                await sock.sendMessage(jid, { 
                    text: "🔄 *BOT NAME RESET!*\n\n" +
                          "✅ Successfully reset to default name!\n\n" +
                          "📛 *New Name:* WOLFBOT\n" +
                          "🔄 *Menu Display:* 🐺 WOLFBOT MENU 🐺\n\n" +
                          `*Use ${global.prefix || '.'}menu to see the updated name!*`
                }, { quoted: m });
            } else {
                await sock.sendMessage(jid, { 
                    text: "❌ *RESET FAILED!*\nCould not save bot name."
                }, { quoted: m });
            }
            return;
        }

        // Regular name change
        const newName = args.join(' ').trim();
        
        // Validation
        if (newName.length > 25) {
            await sock.sendMessage(jid, { 
                text: "❌ *NAME TOO LONG!*\nMaximum 25 characters allowed.\n" +
                      `Your name: ${newName.length} characters`
            }, { quoted: m });
            return;
        }

        if (newName.length < 2) {
            await sock.sendMessage(jid, { 
                text: "❌ *NAME TOO SHORT!*\nMinimum 2 characters required."
            }, { quoted: m });
            return;
        }

        // Save new name
        const oldName = getBotName();
        const success = setBotNameToFile(newName);
        
        if (success) {
            await sock.sendMessage(jid, { 
                text: `✅ *BOT NAME UPDATED!*\n\n` +
                      `📛 *From:* ${oldName}\n` +
                      `📛 *To:* ${newName}\n\n` +
                      `🔄 *New Menu Display:*\n` +
                      `┌────────────────\n` +
                      `│ 🐺 ${newName} MENU 🐺\n` +
                      `└────────────────\n\n` +
                      `💾 *Saved to:* bot_settings.json\n\n` +
                      `*Use ${global.prefix || '.'}menu to see the updated name!*`
            }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { 
                text: "❌ *SAVE FAILED!*\nCould not save bot name.\nCheck file permissions."
            }, { quoted: m });
        }
        
    } catch (error) {
        console.error('❌ Error in setBotNameCommand:', error);
        await sock.sendMessage(jid, { 
            text: `❌ *ERROR!*\n${error.message}`
        }, { quoted: m });
    }
}

// Export in your bot's structure format
export default {
  name: 'setbotname',
  description: 'Change the bot name displayed in menu',
  category: 'owner',
  aliases: ['changename', 'botname', 'setname'],
  usage: '[new name] | reset | check',
  example: ['.setbotname ALPHABOT', '.setbotname reset', '.setbotname check'],
  
  // Main execute function
  async execute(sock, m, jid, args) {
    await setBotNameCommand(sock, m, jid, args);
  }
};