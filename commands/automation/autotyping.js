// commands/owner/autotyping.js

// AutoTyping Manager (State Management)
const autoTypingConfig = {
  enabled: false,
  duration: 10, // seconds
  autoReply: false, // Disabled by default to avoid spam
  activeTypers: new Map(), // chatJid -> {intervalId, timeoutId, userCount, startTime, lastMessageTime}
  botSock: null,
  isHooked: false,
  ownerOnly: true, // Default to owner-only mode
  allowedUsers: new Set() // Users allowed to use command (besides owner)
};

class AutoTypingManager {
  static initialize(sock) {
    if (!autoTypingConfig.isHooked && sock) {
      autoTypingConfig.botSock = sock;
      this.hookIntoBot();
      autoTypingConfig.isHooked = true;
      console.log('🤖 Auto-typing system initialized!');
    }
  }

  static hookIntoBot() {
    if (!autoTypingConfig.botSock || !autoTypingConfig.botSock.ev) {
      console.log('⚠️ Could not hook into bot events');
      return;
    }
    
    // Add our handler alongside existing ones
    autoTypingConfig.botSock.ev.on('messages.upsert', async (data) => {
      await this.handleIncomingMessage(data);
    });
    
    console.log('✅ Auto-typing successfully hooked into message events');
  }

  static async handleIncomingMessage(data) {
    try {
      if (!data || !data.messages || data.messages.length === 0) return;
      
      const m = data.messages[0];
      const sock = autoTypingConfig.botSock;
      
      // Skip if not enabled or if it's from the bot itself
      if (!m || !m.key || m.key.fromMe || !autoTypingConfig.enabled) return;
      
      // Check if it's a command (starts with prefix, usually ".")
      const messageText = m.message?.conversation || 
                         m.message?.extendedTextMessage?.text || 
                         m.message?.imageMessage?.caption || '';
      
      // Skip if it's a command
      if (messageText.trim().startsWith('.')) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return;
      }
      
      const userJid = m.key.participant || m.key.remoteJid;
      const chatJid = m.key.remoteJid;
      
      if (!userJid || !chatJid) return;
      
      const now = Date.now();
      
      // Check if chat already has active typing
      if (autoTypingConfig.activeTypers.has(chatJid)) {
        const typerData = autoTypingConfig.activeTypers.get(chatJid);
        
        // Update last message time and user count
        typerData.lastMessageTime = now;
        typerData.userCount++;
        
        // Clear the existing timeout
        if (typerData.timeoutId) {
          clearTimeout(typerData.timeoutId);
        }
        
        // Set a new timeout that extends from NOW
        typerData.timeoutId = setTimeout(async () => {
          await this.stopTypingInChat(chatJid, sock);
        }, autoTypingConfig.duration * 1000);
        
        autoTypingConfig.activeTypers.set(chatJid, typerData);
        return;
      }
      
      // Start typing indicator in this chat
      await sock.sendPresenceUpdate('composing', chatJid);
      
      let isTyping = true;
      
      // Function to keep typing alive
      const keepTypingAlive = async () => {
        if (isTyping && autoTypingConfig.enabled) {
          try {
            await sock.sendPresenceUpdate('composing', chatJid);
          } catch (err) {
            // Ignore errors in keep-alive
          }
        }
      };
      
      // Keep refreshing the typing indicator every 2 seconds
      const typingInterval = setInterval(keepTypingAlive, 2000);
      
      // Set timeout to stop typing
      const timeoutId = setTimeout(async () => {
        isTyping = false;
        await this.stopTypingInChat(chatJid, sock);
      }, autoTypingConfig.duration * 1000);
      
      // Store typing data for this chat
      autoTypingConfig.activeTypers.set(chatJid, {
        intervalId: typingInterval,
        timeoutId: timeoutId,
        userCount: 1,
        startTime: now,
        lastMessageTime: now,
        isTyping: true
      });
      
    } catch (err) {
      console.error("Auto-typing handler error:", err);
    }
  }

  static async stopTypingInChat(chatJid, sock) {
    if (autoTypingConfig.activeTypers.has(chatJid)) {
      const typerData = autoTypingConfig.activeTypers.get(chatJid);
      
      // Clear interval and timeout
      clearInterval(typerData.intervalId);
      if (typerData.timeoutId) {
        clearTimeout(typerData.timeoutId);
      }
      
      autoTypingConfig.activeTypers.delete(chatJid);
      
      // Stop typing indicator
      try {
        await sock.sendPresenceUpdate('paused', chatJid);
      } catch (err) {
        // Ignore stop errors
      }
      
      // Send auto-reply if enabled
      if (autoTypingConfig.autoReply && autoTypingConfig.enabled) {
        try {
          await sock.sendMessage(chatJid, {
            text: `🤖 *Auto-Typing Complete*\n\nI was typing for ${autoTypingConfig.duration} seconds in response to your messages!`
          });
        } catch (err) {
          console.error("Failed to send auto-reply:", err);
        }
      }
    }
  }

  // Check if user is authorized to use the command
  static isAuthorized(msg, extra = {}) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    
    // Check if fromMe (bot itself)
    if (msg.key.fromMe) return true;
    
    // Check if owner only mode is enabled
    if (autoTypingConfig.ownerOnly) {
      // Use the owner check logic from your mode command
      if (extra.jidManager) {
        return extra.jidManager.isOwner(msg);
      }
      // Fallback to fromMe check if jidManager not available
      return msg.key.fromMe;
    }
    
    // If not owner-only, check allowed users
    if (autoTypingConfig.allowedUsers.has(senderJid)) {
      return true;
    }
    
    // Check if it's the owner using the jidManager
    if (extra.jidManager) {
      return extra.jidManager.isOwner(msg);
    }
    
    return false;
  }

  static toggle() {
    autoTypingConfig.enabled = !autoTypingConfig.enabled;
    console.log(`Auto-typing ${autoTypingConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (!autoTypingConfig.enabled) {
      this.clearAllTypers();
    }
    
    return autoTypingConfig.enabled;
  }

  static status() {
    return {
      enabled: autoTypingConfig.enabled,
      duration: autoTypingConfig.duration,
      autoReply: autoTypingConfig.autoReply,
      activeSessions: autoTypingConfig.activeTypers.size,
      isHooked: autoTypingConfig.isHooked,
      ownerOnly: autoTypingConfig.ownerOnly,
      totalUsersTyping: this.getTotalUsersTyping()
    };
  }

  static getTotalUsersTyping() {
    let total = 0;
    autoTypingConfig.activeTypers.forEach(typerData => {
      total += typerData.userCount;
    });
    return total;
  }

  static setDuration(seconds) {
    if (seconds >= 1 && seconds <= 60) {
      autoTypingConfig.duration = seconds;
      return true;
    }
    return false;
  }

  static toggleAutoReply() {
    autoTypingConfig.autoReply = !autoTypingConfig.autoReply;
    return autoTypingConfig.autoReply;
  }

  static toggleOwnerOnly() {
    autoTypingConfig.ownerOnly = !autoTypingConfig.ownerOnly;
    return autoTypingConfig.ownerOnly;
  }

  static addAllowedUser(jid) {
    autoTypingConfig.allowedUsers.add(jid);
    return true;
  }

  static removeAllowedUser(jid) {
    autoTypingConfig.allowedUsers.delete(jid);
    return true;
  }

  static getAllowedUsers() {
    return Array.from(autoTypingConfig.allowedUsers);
  }

  static clearAllTypers() {
    autoTypingConfig.activeTypers.forEach((typerData) => {
      clearInterval(typerData.intervalId);
      if (typerData.timeoutId) {
        clearTimeout(typerData.timeoutId);
      }
    });
    autoTypingConfig.activeTypers.clear();
  }

  static async manualTyping(sock, chatJid, duration, quotedMsg = null) {
    try {
      // Send initial message
      if (quotedMsg) {
        await sock.sendMessage(chatJid, {
          text: `🤖 *Manual Typing Simulation*\n\nI'll show 'typing...' for ${duration} seconds!`
        }, { quoted: quotedMsg });
      }
      
      // Start typing indicator
      await sock.sendPresenceUpdate('composing', chatJid);
      
      let isTyping = true;
      
      // Function to keep typing alive
      const keepTypingAlive = async () => {
        if (isTyping) {
          await sock.sendPresenceUpdate('composing', chatJid);
        }
      };
      
      // Keep refreshing the typing indicator every 2 seconds
      const typingInterval = setInterval(keepTypingAlive, 2000);
      
      // Set timeout to stop typing
      const timeoutId = setTimeout(async () => {
        isTyping = false;
        clearInterval(typingInterval);
        
        // Stop typing indicator
        await sock.sendPresenceUpdate('paused', chatJid);
        
        // Send completion message
        if (quotedMsg) {
          await sock.sendMessage(chatJid, {
            text: `✅ *Typing simulation complete!*\n\nTyped for ${duration} seconds!`
          }, { quoted: quotedMsg });
        }
      }, duration * 1000);
      
      // Store this manual typing session
      const sessionKey = `manual_${chatJid}_${Date.now()}`;
      autoTypingConfig.activeTypers.set(sessionKey, {
        intervalId: typingInterval,
        timeoutId: timeoutId,
        userCount: 1,
        startTime: Date.now(),
        lastMessageTime: Date.now(),
        isManual: true
      });
      
    } catch (err) {
      console.error("Manual typing error:", err);
      throw err;
    }
  }
}

// Main Command Export
export default {
  name: "autotyping",
  alias: ["autotype", "fake", "typingsim", "typingtoggle", "atype", "typingmode", "typing"],
  desc: "Toggle auto fake typing when someone messages you 🤖",
  category: "Owner",
  usage: ".autotyping [on/off/duration/reply/status/mode/users]",
  
  async execute(sock, m, args, PREFIX, extra) {
    try {
      const targetJid = m.key.remoteJid;
      
      // Initialize on first command use
      if (!autoTypingConfig.isHooked) {
        autoTypingConfig.botSock = sock;
        AutoTypingManager.hookIntoBot();
        autoTypingConfig.isHooked = true;
        console.log('🤖 Auto-typing system initialized!');
      }
      
      // ==================== OWNER CHECK ====================
      const isAuthorized = AutoTypingManager.isAuthorized(m, extra);
      
      if (!isAuthorized) {
        const senderJid = m.key.participant || targetJid;
        const jidManager = extra?.jidManager;
        
        let errorMsg = `❌ *Owner Only Command!*\n\n`;
        errorMsg += `Only the bot owner can use this command.\n\n`;
        
        return sock.sendMessage(targetJid, {
          text: errorMsg
        }, { quoted: m });
      }
      // ==================== END OWNER CHECK ====================
      
      if (args.length === 0) {
        // Show status
        const status = AutoTypingManager.status();
        const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
        const modeText = status.ownerOnly ? "🔒 *Owner Only*" : "🌍 *Public*";
        
        await sock.sendMessage(targetJid, {
          text: `🤖 *Auto-Typing Manager* 

${statusText}
${modeText}

📊 *Status:*
• Auto-Typing: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}
• Duration: ${status.duration} seconds
• Active Chats: ${status.activeSessions}
• Total Users: ${status.totalUsersTyping}\n
📝 *Commands:*
• \`${PREFIX}autotyping on\` 
• \`${PREFIX}autotyping off\` 
• \`${PREFIX}autotyping <duration>\`

`
        }, { quoted: m });
        return;
      }
      
      const arg = args[0].toLowerCase();
      
      // Show detailed status
      if (arg === 'status' || arg === 'info') {
        const status = AutoTypingManager.status();
        const allowedUsers = AutoTypingManager.getAllowedUsers();
        
        let statusMsg = `🤖 *Auto-Typing Status* (Owner View)\n\n`;
        statusMsg += `📊 *System Status:*\n`;
        statusMsg += `├─ Enabled: ${status.enabled ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ Duration: ${status.duration}s\n`;
        statusMsg += `├─ Auto-Reply: ${status.autoReply ? '✅ ON' : '❌ OFF'}\n`;
        statusMsg += `├─ Mode: ${status.ownerOnly ? '🔒 Owner Only' : '🌍 Public'}\n`;
        statusMsg += `├─ Active Chats: ${status.activeSessions}\n`;
        statusMsg += `├─ Total Users: ${status.totalUsersTyping}\n`;
        statusMsg += `└─ Hooked: ${status.isHooked ? '✅' : '❌'}\n\n`;
        
        if (allowedUsers.length > 0 && !status.ownerOnly) {
          statusMsg += `👥 *Allowed Users:*\n`;
          allowedUsers.forEach((user, index) => {
            statusMsg += `${index + 1}. ${user}\n`;
          });
          statusMsg += `\n`;
        }
        
        if (status.activeSessions > 0) {
          statusMsg += `⌨️ *Active Typing Sessions:*\n`;
          autoTypingConfig.activeTypers.forEach((data, chatJid) => {
            const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
            const remaining = Math.max(0, status.duration - elapsed);
            statusMsg += `├─ ${chatJid.includes('@g.us') ? '👥 Group' : '👤 DM'}\n`;
            statusMsg += `│  ├─ Users: ${data.userCount}\n`;
            statusMsg += `│  ├─ Elapsed: ${elapsed}s\n`;
            statusMsg += `│  └─ Remaining: ${remaining}s\n`;
          });
        }
        
        return sock.sendMessage(targetJid, {
          text: statusMsg
        }, { quoted: m });
      }
      
      // Toggle on/off
      if (arg === 'on' || arg === 'enable' || arg === 'start') {
        const enabled = AutoTypingManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `🤖 *Auto-Typing ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'I will now automatically show **typing** when someone messages you! ⌨️✨' : 'Auto-typing has been turned off.'}

⚙️ *Current Settings:*
• Duration: ${AutoTypingManager.status().duration}s
• Auto-Reply: ${AutoTypingManager.status().autoReply ? 'ON' : 'OFF'}

`
        }, { quoted: m });
        return;
      }
      
      if (arg === 'off' || arg === 'disable' || arg === 'stop') {
        const enabled = AutoTypingManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `🤖 *Auto-Typing ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'Auto-typing has been turned on! ⌨️✨' : 'I will no longer auto-type when messaged.'}`
        }, { quoted: m });
        return;
      }
      
      // Toggle auto-reply
      if (arg === 'reply' || arg === 'autoreply') {
        const autoReply = AutoTypingManager.toggleAutoReply();
        await sock.sendMessage(targetJid, {
          text: `✅ *Auto-Reply ${autoReply ? 'ENABLED' : 'DISABLED'}*

${autoReply ? 
  'I will now send a completion message after auto-typing.' : 
  'I will no longer send completion messages after auto-typing.'
}

⚠️ *Note:* Auto-reply messages may be seen as spam in groups.`
        }, { quoted: m });
        return;
      }
      
      // Mode toggle (owner-only vs public)
      if (arg === 'mode' || arg === 'togglemode') {
        const ownerOnly = AutoTypingManager.toggleOwnerOnly();
        await sock.sendMessage(targetJid, {
          text: `🔧 *Typing Mode Changed*

Mode: ${ownerOnly ? '🔒 *OWNER ONLY*' : '🌍 *PUBLIC*'}

${ownerOnly ? 
  'Only you (owner) can control auto-typing now.' : 
  'Anyone can use auto-typing commands now.\n\n⚠️ *Warning:* Public mode may allow others to spam typing.'
}

⚙️ To add specific allowed users:
• \`${PREFIX}autotyping users add @user\`
• \`${PREFIX}autotyping users list\``
        }, { quoted: m });
        return;
      }
      
      // User management
      if (arg === 'users' || arg === 'user' || arg === 'allow') {
        const subCmd = args[1]?.toLowerCase();
        
        if (!subCmd || subCmd === 'list') {
          const allowedUsers = AutoTypingManager.getAllowedUsers();
          let userList = `👥 *Allowed Users* (${allowedUsers.length})\n\n`;
          
          if (allowedUsers.length === 0) {
            userList += `No users added yet.\n`;
          } else {
            allowedUsers.forEach((user, index) => {
              userList += `${index + 1}. ${user}\n`;
            });
          }
          
          userList += `\n🔧 *Commands:*\n`;
          userList += `• \`${PREFIX}autotyping users add @user\`\n`;
          userList += `• \`${PREFIX}autotyping users remove @user\`\n`;
          userList += `• \`${PREFIX}autotyping users clear\`\n`;
          
          return sock.sendMessage(targetJid, {
            text: userList
          }, { quoted: m });
        }
        
        if (subCmd === 'add' && args[2]) {
          const userToAdd = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoTypingManager.addAllowedUser(userToAdd);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Added*\n\nAdded ${userToAdd} to allowed users list.\n\nThey can now use auto-typing commands.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'remove' && args[2]) {
          const userToRemove = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoTypingManager.removeAllowedUser(userToRemove);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Removed*\n\nRemoved ${userToRemove} from allowed users list.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'clear') {
          autoTypingConfig.allowedUsers.clear();
          
          await sock.sendMessage(targetJid, {
            text: `✅ *Users Cleared*\n\nAll allowed users have been removed.`
          }, { quoted: m });
          return;
        }
        
        // Invalid user command
        await sock.sendMessage(targetJid, {
          text: `❓ *Invalid User Command*\n\nUsage:\n• \`${PREFIX}autotyping users list\`\n• \`${PREFIX}autotyping users add @user\`\n• \`${PREFIX}autotyping users remove @user\`\n• \`${PREFIX}autotyping users clear\``
        }, { quoted: m });
        return;
      }
      
      // Set duration
      const duration = parseInt(arg);
      if (!isNaN(duration) && duration >= 1 && duration <= 60) {
        const success = AutoTypingManager.setDuration(duration);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Duration Updated*

Typing duration set to ${duration} seconds.

${AutoTypingManager.status().enabled ? '⌨️ Auto-typing is currently **ACTIVE**' : '💤 Auto-typing is **INACTIVE**'}
• Auto-Reply: ${AutoTypingManager.status().autoReply ? 'ON' : 'OFF'}
• Mode: ${AutoTypingManager.status().ownerOnly ? '🔒 Owner Only' : '🌍 Public'}
• Active Chats: ${AutoTypingManager.status().activeSessions}`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Duration*

Please use a number between 1 and 60 seconds.

Maximum typing time is 1 minute (60 seconds).`
          }, { quoted: m });
        }
        return;
      }
      
      // If no valid command, show help
      await sock.sendMessage(targetJid, {
        text: `🤖 *Auto-Typing Owner Commands:*

🔧 *Control:*
• \`${PREFIX}autotyping on\` - Enable auto-typing
• \`${PREFIX}autotyping off\` - Disable auto-typing
• \`${PREFIX}autotyping 15\` - Set duration to 15s
• \`${PREFIX}autotyping reply\` - Toggle auto-reply messages

🔒 *Access Control:*
• \`${PREFIX}autotyping mode\` - Toggle owner-only/public mode
• \`${PREFIX}autotyping users\` - Manage allowed users list

📊 *Info:*
• \`${PREFIX}autotyping\` - Show status
• \`${PREFIX}autotyping status\` - Detailed status

⌨️ *Manual:*
• \`${PREFIX}autotyping 10\` - Manual typing for 10s

⚠️ *Note:* Typing can show in multiple chats simultaneously!`
      }, { quoted: m });
      
    } catch (err) {
      console.error("AutoTyping command error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ AutoTyping command failed: ${err.message}`
      }, { quoted: m });
    }
  }
};