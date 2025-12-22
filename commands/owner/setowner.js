// File: ./commands/owner/setowner.js
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'setowner',
    alias: ['owner', 'changeowner', 'setownername', 'owner-name'],
    category: 'owner',
    description: 'Set custom owner display name for menu',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // Owner check
        if (!jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: `❌ *Owner Only Command!*\n\nOnly the bot owner can change the owner display name.`
            }, { quoted: msg });
        }
        
        // Show current owner name if no args
        if (!args[0]) {
            const currentOwner = this.getCurrentOwnerName();
            const originalOwner = this.getOriginalOwner();
            
            return sock.sendMessage(chatId, {
                text: `👑 *OWNER NAME MANAGEMENT*\n\n📝 Current Display Name: *${currentOwner}*\n🔗 Original Owner: ${originalOwner}\n\n💡 This changes only the display name in the menu, not the actual owner.\n\nUsage: \`${PREFIX}setowner <new_name>\`\nExample: \`${PREFIX}setowner WolfMaster\`\n\n🔧 Use \`${PREFIX}resetowner\` to reset to original owner.`
            }, { quoted: msg });
        }
        
        // Get the new owner name (join all arguments)
        const newOwnerName = args.join(' ').trim();
        
        // Validate name length
        if (newOwnerName.length < 2) {
            return sock.sendMessage(chatId, {
                text: `❌ Name too short! Owner name must be at least 2 characters.`
            }, { quoted: msg });
        }
        
        if (newOwnerName.length > 30) {
            return sock.sendMessage(chatId, {
                text: `❌ Name too long! Owner name must be less than 30 characters.`
            }, { quoted: msg });
        }
        
        try {
            // Get current user info
            const senderJid = msg.key.participant || chatId;
            const cleaned = jidManager.cleanJid(senderJid);
            
            // Get original owner for reference
            const originalOwner = this.getOriginalOwner();
            const oldDisplayName = this.getCurrentOwnerName();
            
            // Load existing settings or create new
            const settingsPath = path.join(__dirname, 'bot_settings.json');
            let settings = {};
            
            if (existsSync(settingsPath)) {
                try {
                    settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
                } catch (error) {
                    console.error('Error reading existing settings:', error);
                }
            }
            
            // Update owner name
            settings.ownerName = newOwnerName;
            settings.ownerSetBy = cleaned.cleanNumber || 'Unknown';
            settings.ownerSetAt = new Date().toISOString();
            settings.originalOwner = originalOwner; // Store original for reference
            settings.lastChange = Date.now();
            
            // Save settings
            writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            
            // Also save to root directory for compatibility
            const rootSettingsPath = './bot_settings.json';
            writeFileSync(rootSettingsPath, JSON.stringify(settings, null, 2));
            
            // Update global variable for immediate effect
            if (typeof global !== 'undefined') {
                global.OWNER_NAME = newOwnerName;
            }
            
            // Success message
            let successMsg = `✅ *Owner Display Name Updated!*\n\n`;
            successMsg += `📝 Old Display: *${oldDisplayName}*\n`;
            successMsg += `👑 New Display: *${newOwnerName}*\n`;
            successMsg += `🔗 Original Owner: ${originalOwner}\n\n`;
            successMsg += `✅ Changes applied:\n`;
            successMsg += `├─ Saved to: bot_settings.json ✓\n`;
            successMsg += `├─ Global variable updated ✓\n`;
            successMsg += `└─ Immediate effect ✓\n\n`;
            successMsg += `🔧 The new name will appear in:\n`;
            successMsg += `├─ Menu info section\n`;
            successMsg += `├─ Command responses\n`;
            successMsg += `└─ All bot interactions\n\n`;
            successMsg += `💡 Use \`${PREFIX}menu\` to see the updated name.\n\n`;
            successMsg += `⚠️ *Note:* This only changes the display name. The actual owner (with command access) remains the same.`;
            
            await sock.sendMessage(chatId, {
                text: successMsg
            }, { quoted: msg });
            
            console.log(`✅ Owner display name changed from "${oldDisplayName}" to "${newOwnerName}" by ${cleaned.cleanNumber}`);
            
        } catch (error) {
            console.error('Error saving owner name:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error saving owner name: ${error.message}\n\nPlease check file permissions.`
            }, { quoted: msg });
        }
    },
    
    // Helper function to get current owner display name
    getCurrentOwnerName() {
        try {
            // Check bot_settings.json first
            const settingsPaths = [
                path.join(__dirname, 'bot_settings.json'),
                './bot_settings.json',
                '../bot_settings.json',
            ];
            
            for (const settingsPath of settingsPaths) {
                if (existsSync(settingsPath)) {
                    try {
                        const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
                        if (settings.ownerName && settings.ownerName.trim() !== '') {
                            return settings.ownerName.trim();
                        }
                    } catch (error) {
                        // Continue to next path
                    }
                }
            }
            
            // Fallback to original owner
            return this.getOriginalOwner();
            
        } catch (error) {
            console.error('Error reading owner name:', error);
            return this.getOriginalOwner();
        }
    },
    
    // Helper function to get original owner from owner.json
    getOriginalOwner() {
        try {
            const ownerPath = path.join(__dirname, 'owner.json');
            if (existsSync(ownerPath)) {
                const ownerData = JSON.parse(readFileSync(ownerPath, 'utf8'));
                
                if (ownerData.owner && ownerData.owner.trim() !== '') {
                    return ownerData.owner.trim();
                } else if (ownerData.number && ownerData.number.trim() !== '') {
                    return ownerData.number.trim();
                } else if (ownerData.phone && ownerData.phone.trim() !== '') {
                    return ownerData.phone.trim();
                } else if (Array.isArray(ownerData) && ownerData.length > 0) {
                    return typeof ownerData[0] === 'string' ? ownerData[0] : "Unknown";
                }
            }
            
            // Fallback to global
            return global.owner || process.env.OWNER_NUMBER || "Unknown";
            
        } catch (error) {
            console.error('Error reading original owner:', error);
            return global.owner || "Unknown";
        }
    }
};