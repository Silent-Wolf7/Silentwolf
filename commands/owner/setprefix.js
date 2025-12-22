// File: ./commands/owner/setprefix.js
export default {
    name: 'setprefix',
    alias: ['prefix', 'setpre'],
    category: 'owner',
    description: 'Change bot prefix (saved & persistent)',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager, updatePrefix, getCurrentPrefix } = extra;
        
        if (!jidManager.isOwner(msg)) {
            return sock.sendMessage(chatId, {
                text: '❌ *Owner Only Command*'
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return sock.sendMessage(chatId, {
                text: `🔧 *SET PREFIX*\n\nCurrent prefix: "${PREFIX}"\n\nUsage: ${PREFIX}setprefix <new_prefix>\nExample: ${PREFIX}setprefix !\n\n💡 Changes are saved and persist after restart!`
            }, { quoted: msg });
        }
        
        const newPrefix = args[0].trim();
        
        if (newPrefix.length > 5) {
            return sock.sendMessage(chatId, {
                text: '❌ Prefix too long! Maximum 5 characters.'
            }, { quoted: msg });
        }
        
        try {
            const oldPrefix = getCurrentPrefix();
            
            // Update prefix immediately in memory AND save to files
            const updateResult = updatePrefix(newPrefix);
            
            if (!updateResult.success) {
                throw new Error('Failed to update prefix');
            }
            
            await sock.sendMessage(chatId, {
                text: `✅ *PREFIX UPDATED*\n\nOld prefix: "${oldPrefix}"\nNew prefix: "${newPrefix}"\n\n✅ Changes applied immediately!\n💾 Saved to file for persistence\n\nTest: *${newPrefix}ping*`
            }, { quoted: msg });
            
            // Send test message
            setTimeout(async () => {
                try {
                    await sock.sendMessage(chatId, {
                        text: `🔧 *Test New Prefix*\n\nTry: \`${newPrefix}ping\``
                    });
                } catch {
                    // Silent fail
                }
            }, 1000);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: msg });
        }
    }
};