// // commands/fun/autorecording.js

// // AutoRecording Manager (State Management)
// const autoRecordingConfig = {
//   enabled: false,
//   duration: 10, // seconds
//   activeRecorders: new Map(), // userId -> intervalId
//   botSock: null,
//   isHooked: false
// };

// class AutoRecordingManager {
//   static initialize(sock) {
//     if (!autoRecordingConfig.isHooked && sock) {
//       autoRecordingConfig.botSock = sock;
//       this.hookIntoBot();
//       autoRecordingConfig.isHooked = true;
//       console.log('🎤 Auto-recording system initialized!');
//     }
//   }

//   static hookIntoBot() {
//     if (!autoRecordingConfig.botSock || !autoRecordingConfig.botSock.ev) {
//       console.log('⚠️ Could not hook into bot events');
//       return;
//     }
    
//     // Add our handler alongside existing ones
//     autoRecordingConfig.botSock.ev.on('messages.upsert', async (data) => {
//       await this.handleIncomingMessage(data);
//     });
    
//     console.log('✅ Auto-recording successfully hooked into message events');
//   }

//   static async handleIncomingMessage(data) {
//     try {
//       if (!data || !data.messages || data.messages.length === 0) return;
      
//       const m = data.messages[0];
//       const sock = autoRecordingConfig.botSock;
      
//       // Skip if not enabled or if it's from the bot itself
//       if (!m || !m.key || m.key.fromMe || !autoRecordingConfig.enabled) return;
      
//       // Check if it's a command (starts with prefix, usually ".")
//       const messageText = m.message?.conversation || 
//                          m.message?.extendedTextMessage?.text || 
//                          m.message?.imageMessage?.caption || '';
      
//       // Skip if it's a command
//       if (messageText.trim().startsWith('.')) {
//         await new Promise(resolve => setTimeout(resolve, 100));
//         return;
//       }
      
//       const userJid = m.key.participant || m.key.remoteJid;
//       const chatJid = m.key.remoteJid;
      
//       if (!userJid || !chatJid) return;
      
//       // Check if user already has active recording
//       if (autoRecordingConfig.activeRecorders.has(userJid)) {
//         return;
//       }
      
//       // Start recording indicator
//       await sock.sendPresenceUpdate('recording', chatJid);
      
//       let isRecording = true;
      
//       // Function to keep recording alive
//       const keepRecordingAlive = async () => {
//         if (isRecording && autoRecordingConfig.enabled) {
//           try {
//             await sock.sendPresenceUpdate('recording', chatJid);
//           } catch (err) {
//             // Ignore errors in keep-alive
//           }
//         }
//       };
      
//       // Keep refreshing the recording indicator every 2 seconds
//       const recordingInterval = setInterval(keepRecordingAlive, 2000);
//       autoRecordingConfig.activeRecorders.set(userJid, recordingInterval);
      
//       // Stop after specified duration
//       setTimeout(async () => {
//         isRecording = false;
        
//         // Clean up
//         if (autoRecordingConfig.activeRecorders.has(userJid)) {
//           clearInterval(autoRecordingConfig.activeRecorders.get(userJid));
//           autoRecordingConfig.activeRecorders.delete(userJid);
//         }
        
//         // Stop recording indicator
//         try {
//           await sock.sendPresenceUpdate('paused', chatJid);
//         } catch (err) {
//           // Ignore stop errors
//         }
        
//       }, autoRecordingConfig.duration * 1000);
      
//     } catch (err) {
//       console.error("Auto-recording handler error:", err);
//     }
//   }

//   static toggle() {
//     autoRecordingConfig.enabled = !autoRecordingConfig.enabled;
//     console.log(`Auto-recording ${autoRecordingConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
//     if (!autoRecordingConfig.enabled) {
//       this.clearAllRecorders();
//     }
    
//     return autoRecordingConfig.enabled;
//   }

//   static status() {
//     return {
//       enabled: autoRecordingConfig.enabled,
//       duration: autoRecordingConfig.duration,
//       activeSessions: autoRecordingConfig.activeRecorders.size,
//       isHooked: autoRecordingConfig.isHooked
//     };
//   }

//   static setDuration(seconds) {
//     if (seconds >= 1 && seconds <= 120) {
//       autoRecordingConfig.duration = seconds;
//       return true;
//     }
//     return false;
//   }

//   static clearAllRecorders() {
//     autoRecordingConfig.activeRecorders.forEach((intervalId) => {
//       clearInterval(intervalId);
//     });
//     autoRecordingConfig.activeRecorders.clear();
//   }

//   static async manualRecording(sock, chatJid, duration, quotedMsg = null) {
//     try {
//       // Send initial message
//       if (quotedMsg) {
//         await sock.sendMessage(chatJid, {
//           text: `🎤 *Voice Recording Simulation*\n\nI'll show 'recording...' for ${duration} seconds!`
//         }, { quoted: quotedMsg });
//       }
      
//       // Start recording indicator
//       await sock.sendPresenceUpdate('recording', chatJid);
      
//       let isRecording = true;
      
//       // Function to keep recording alive
//       const keepRecordingAlive = async () => {
//         if (isRecording) {
//           await sock.sendPresenceUpdate('recording', chatJid);
//         }
//       };
      
//       // Keep refreshing the recording indicator every 2 seconds
//       const recordingInterval = setInterval(keepRecordingAlive, 2000);
      
//       // Stop after specified duration
//       return new Promise((resolve) => {
//         setTimeout(async () => {
//           isRecording = false;
//           clearInterval(recordingInterval);
          
//           // Stop recording indicator
//           await sock.sendPresenceUpdate('paused', chatJid);
          
//           // Send completion message
//           if (quotedMsg) {
//             await sock.sendMessage(chatJid, {
//               text: `✅ *Recording simulation complete!*\n\nRecorded for ${duration} seconds!`
//             }, { quoted: quotedMsg });
//           }
          
//           resolve();
//         }, duration * 1000);
//       });
      
//     } catch (err) {
//       console.error("Manual recording error:", err);
//       throw err;
//     }
//   }
// }

// // Main Command Export
// export default {
//   name: "autorecording",
//   alias: ["record", "recording", "voicerec", "audiorec", "rec", "recsim"],
//   desc: "Toggle auto fake recording when someone messages you 🎤",
//   category: "Fun",
//   usage: ".autorecording [on/off/duration/status]",
  
//   async execute(sock, m, args) {
//     try {
//       const targetJid = m.key.remoteJid;
      
//       // Initialize on first command use
//       if (!autoRecordingConfig.isHooked) {
//         autoRecordingConfig.botSock = sock;
//         AutoRecordingManager.hookIntoBot();
//         autoRecordingConfig.isHooked = true;
//         console.log('🎤 Auto-recording system initialized!');
//       }
      
//       if (args.length === 0) {
//         // Show status
//         const status = AutoRecordingManager.status();
//         const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
//         const activeSessions = status.activeSessions > 0 ? `\n• Active sessions: ${status.activeSessions}` : '';
        
//         await sock.sendMessage(targetJid, {
//           text: `🎤 *Auto-Recording Manager*

// ${statusText}

// 📊 *Status:*
// • Auto-Recording: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}
// • Duration: ${status.duration} seconds
// • System: ${status.isHooked ? 'Active ✅' : 'Inactive ❌'}${activeSessions}

// 📝 *Commands:*
// • \`.autorecording on\` - Enable auto-recording
// • \`.autorecording off\` - Disable auto-recording  
// • \`.autorecording 15\` - Set duration to 15s
// • \`.autorecording\` - Show this status
// • \`.autorecording 10\` - Manual recording for 10s
// • \`.record\` - Same as above (shortcut)`
//         }, { quoted: m });
//         return;
//       }
      
//       const arg = args[0].toLowerCase();
      
//       // Show status
//       if (arg === 'status' || arg === 'info') {
//         const status = AutoRecordingManager.status();
//         const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
//         const activeSessions = status.activeSessions > 0 ? `\n• Active sessions: ${status.activeSessions}` : '';
        
//         await sock.sendMessage(targetJid, {
//           text: `🎤 *Auto-Recording Status*

// ${statusText}

// 📊 *Settings:*
// • Auto-Recording: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}
// • Duration: ${status.duration} seconds${activeSessions}
// • System: ${status.isHooked ? 'Active ✅' : 'Inactive ❌'}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Toggle on/off
//       if (arg === 'on' || arg === 'enable' || arg === 'start') {
//         const enabled = AutoRecordingManager.toggle();
//         await sock.sendMessage(targetJid, {
//           text: `🎤 *Auto-Recording ${enabled ? 'ENABLED' : 'DISABLED'}*

// ${enabled ? 'I will now automatically show **voice recording** when someone messages you! 🎙️✨' : 'Auto-recording has been turned off.'}

// ⚙️ *Current Settings:*
// • Duration: ${AutoRecordingManager.status().duration} seconds
// • Status: ${enabled ? 'ACTIVE 🟢' : 'INACTIVE 🔴'}`
//         }, { quoted: m });
//         return;
//       }
      
//       if (arg === 'off' || arg === 'disable' || arg === 'stop') {
//         const enabled = AutoRecordingManager.toggle();
//         await sock.sendMessage(targetJid, {
//           text: `🎤 *Auto-Recording ${enabled ? 'ENABLED' : 'DISABLED'}*

// ${enabled ? 'Auto-recording has been turned on! 🎙️✨' : 'I will no longer auto-record when messaged.'}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Set duration
//       const duration = parseInt(arg);
//       if (!isNaN(duration) && duration >= 1 && duration <= 120) {
//         const success = AutoRecordingManager.setDuration(duration);
//         if (success) {
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Duration Updated*

// Recording duration set to ${duration} seconds.

// ${AutoRecordingManager.status().enabled ? '🎙️ Auto-recording is currently **ACTIVE**' : '💤 Auto-recording is **INACTIVE** (use \`.autorecording on\` to activate)'}`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Invalid Duration*

// Please use a number between 1 and 120 seconds.

// Maximum recording time is 2 minutes (120 seconds).`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // Manual recording command
//       if (!isNaN(duration) && duration >= 1 && duration <= 300) {
//         // Send initial message
//         await sock.sendMessage(targetJid, {
//           text: `🎤 *Manual Recording Simulation*

// I'll show 'recording...' for ${duration} seconds!`
//         }, { quoted: m });
        
//         // Do manual recording
//         await AutoRecordingManager.manualRecording(sock, targetJid, duration, m);
//         return;
//       }
      
//       // If no valid command, show help
//       await sock.sendMessage(targetJid, {
//         text: `❓ *Invalid Command*

// 🎤 *Auto-Recording Commands:*

// • \`.autorecording on\` - Enable auto-recording
// • \`.autorecording off\` - Disable auto-recording
// • \`.autorecording 15\` - Set duration to 15s
// • \`.autorecording\` - Show status
// • \`.autorecording 10\` - Manual recording for 10s

// *Shortcuts:*
// • \`.record on/off\`
// • \`.recording 15\`
// • \`.rec 10\``
//       }, { quoted: m });
      
//     } catch (err) {
//       console.error("AutoRecording command error:", err);
//       await sock.sendMessage(m.key.remoteJid, {
//         text: `❌ AutoRecording command failed: ${err.message}`
//       }, { quoted: m });
//     }
//   }
// };



































// commands/owner/autorecording.js

// AutoRecording Manager (State Management)
const autoRecordingConfig = {
  enabled: false,
  duration: 10, // seconds
  activeRecorders: new Map(), // chatJid -> {intervalId, userCount}
  botSock: null,
  isHooked: false,
  ownerOnly: true, // Default to owner-only mode
  allowedUsers: new Set() // Users allowed to use command (besides owner)
};

class AutoRecordingManager {
  static initialize(sock) {
    if (!autoRecordingConfig.isHooked && sock) {
      autoRecordingConfig.botSock = sock;
      this.hookIntoBot();
      autoRecordingConfig.isHooked = true;
      console.log('🎤 Auto-recording system initialized!');
    }
  }

  static hookIntoBot() {
    if (!autoRecordingConfig.botSock || !autoRecordingConfig.botSock.ev) {
      console.log('⚠️ Could not hook into bot events');
      return;
    }
    
    // Add our handler alongside existing ones
    autoRecordingConfig.botSock.ev.on('messages.upsert', async (data) => {
      await this.handleIncomingMessage(data);
    });
    
    console.log('✅ Auto-recording successfully hooked into message events');
  }

  static async handleIncomingMessage(data) {
    try {
      if (!data || !data.messages || data.messages.length === 0) return;
      
      const m = data.messages[0];
      const sock = autoRecordingConfig.botSock;
      
      // Skip if not enabled or if it's from the bot itself
      if (!m || !m.key || m.key.fromMe || !autoRecordingConfig.enabled) return;
      
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
      
      // Check if chat already has active recording
      if (autoRecordingConfig.activeRecorders.has(chatJid)) {
        // Increment user count for this chat
        const recorderData = autoRecordingConfig.activeRecorders.get(chatJid);
        recorderData.userCount++;
        autoRecordingConfig.activeRecorders.set(chatJid, recorderData);
        return;
      }
      
      // Start recording indicator in this chat
      await sock.sendPresenceUpdate('recording', chatJid);
      
      let isRecording = true;
      
      // Function to keep recording alive
      const keepRecordingAlive = async () => {
        if (isRecording && autoRecordingConfig.enabled) {
          try {
            await sock.sendPresenceUpdate('recording', chatJid);
          } catch (err) {
            // Ignore errors in keep-alive
          }
        }
      };
      
      // Keep refreshing the recording indicator every 2 seconds
      const recordingInterval = setInterval(keepRecordingAlive, 2000);
      
      // Store recording data for this chat
      autoRecordingConfig.activeRecorders.set(chatJid, {
        intervalId: recordingInterval,
        userCount: 1,
        startTime: Date.now()
      });
      
      // Stop after specified duration
      setTimeout(async () => {
        isRecording = false;
        
        // Clean up
        if (autoRecordingConfig.activeRecorders.has(chatJid)) {
          const recorderData = autoRecordingConfig.activeRecorders.get(chatJid);
          clearInterval(recorderData.intervalId);
          autoRecordingConfig.activeRecorders.delete(chatJid);
          
          // Stop recording indicator
          try {
            await sock.sendPresenceUpdate('paused', chatJid);
          } catch (err) {
            // Ignore stop errors
          }
        }
        
      }, autoRecordingConfig.duration * 1000);
      
    } catch (err) {
      console.error("Auto-recording handler error:", err);
    }
  }

  // Check if user is authorized to use the command
  static isAuthorized(msg, extra = {}) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    
    // Check if fromMe (bot itself)
    if (msg.key.fromMe) return true;
    
    // Check if owner only mode is enabled
    if (autoRecordingConfig.ownerOnly) {
      // Use the owner check logic from your mode command
      if (extra.jidManager) {
        return extra.jidManager.isOwner(msg);
      }
      // Fallback to fromMe check if jidManager not available
      return msg.key.fromMe;
    }
    
    // If not owner-only, check allowed users
    if (autoRecordingConfig.allowedUsers.has(senderJid)) {
      return true;
    }
    
    // Check if it's the owner using the jidManager
    if (extra.jidManager) {
      return extra.jidManager.isOwner(msg);
    }
    
    return false;
  }

  static toggle() {
    autoRecordingConfig.enabled = !autoRecordingConfig.enabled;
    console.log(`Auto-recording ${autoRecordingConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (!autoRecordingConfig.enabled) {
      this.clearAllRecorders();
    }
    
    return autoRecordingConfig.enabled;
  }

  static status() {
    return {
      enabled: autoRecordingConfig.enabled,
      duration: autoRecordingConfig.duration,
      activeSessions: autoRecordingConfig.activeRecorders.size,
      isHooked: autoRecordingConfig.isHooked,
      ownerOnly: autoRecordingConfig.ownerOnly,
      totalUsersRecording: this.getTotalUsersRecording()
    };
  }

  static getTotalUsersRecording() {
    let total = 0;
    autoRecordingConfig.activeRecorders.forEach(recorderData => {
      total += recorderData.userCount;
    });
    return total;
  }

  static setDuration(seconds) {
    if (seconds >= 1 && seconds <= 120) {
      autoRecordingConfig.duration = seconds;
      return true;
    }
    return false;
  }

  static toggleOwnerOnly() {
    autoRecordingConfig.ownerOnly = !autoRecordingConfig.ownerOnly;
    return autoRecordingConfig.ownerOnly;
  }

  static addAllowedUser(jid) {
    autoRecordingConfig.allowedUsers.add(jid);
    return true;
  }

  static removeAllowedUser(jid) {
    autoRecordingConfig.allowedUsers.delete(jid);
    return true;
  }

  static getAllowedUsers() {
    return Array.from(autoRecordingConfig.allowedUsers);
  }

  static clearAllRecorders() {
    autoRecordingConfig.activeRecorders.forEach((recorderData) => {
      clearInterval(recorderData.intervalId);
    });
    autoRecordingConfig.activeRecorders.clear();
  }

  static async manualRecording(sock, chatJid, duration, quotedMsg = null) {
    try {
      // Send initial message
      if (quotedMsg) {
        await sock.sendMessage(chatJid, {
          text: `🎤 *Voice Recording Simulation*\n\nI'll show 'recording...' for ${duration} seconds!`
        }, { quoted: quotedMsg });
      }
      
      // Start recording indicator
      await sock.sendPresenceUpdate('recording', chatJid);
      
      let isRecording = true;
      
      // Function to keep recording alive
      const keepRecordingAlive = async () => {
        if (isRecording) {
          await sock.sendPresenceUpdate('recording', chatJid);
        }
      };
      
      // Keep refreshing the recording indicator every 2 seconds
      const recordingInterval = setInterval(keepRecordingAlive, 2000);
      
      // Store this manual recording session
      const sessionKey = `manual_${chatJid}_${Date.now()}`;
      autoRecordingConfig.activeRecorders.set(sessionKey, {
        intervalId: recordingInterval,
        userCount: 1,
        startTime: Date.now(),
        isManual: true
      });
      
      // Stop after specified duration
      return new Promise((resolve) => {
        setTimeout(async () => {
          isRecording = false;
          
          if (autoRecordingConfig.activeRecorders.has(sessionKey)) {
            clearInterval(autoRecordingConfig.activeRecorders.get(sessionKey).intervalId);
            autoRecordingConfig.activeRecorders.delete(sessionKey);
            
            // Stop recording indicator
            await sock.sendPresenceUpdate('paused', chatJid);
            
            // Send completion message
            if (quotedMsg) {
              await sock.sendMessage(chatJid, {
                text: `✅ *Recording simulation complete!*\n\nRecorded for ${duration} seconds!`
              }, { quoted: quotedMsg });
            }
          }
          
          resolve();
        }, duration * 1000);
      });
      
    } catch (err) {
      console.error("Manual recording error:", err);
      throw err;
    }
  }
}

// Main Command Export
export default {
  name: "autorecording",
  alias: ["record", "recording", "voicerec", "audiorec", "rec", "recsim"],
  desc: "Toggle auto fake recording when someone messages you 🎤",
  category: "Owner",
  usage: ".autorecording [on/off/duration/status/mode/users]",
  
  async execute(sock, m, args, PREFIX, extra) {
    try {
      const targetJid = m.key.remoteJid;
      
      // Initialize on first command use
      if (!autoRecordingConfig.isHooked) {
        autoRecordingConfig.botSock = sock;
        AutoRecordingManager.hookIntoBot();
        autoRecordingConfig.isHooked = true;
        console.log('🎤 Auto-recording system initialized!');
      }
      
      // ==================== OWNER CHECK ====================
      const isAuthorized = AutoRecordingManager.isAuthorized(m, extra);
      
      if (!isAuthorized) {
        const senderJid = m.key.participant || targetJid;
        const jidManager = extra?.jidManager;
        
        let errorMsg = `❌ *Owner Only Command!*\n\n`;
        errorMsg += `Only the bot owner can use this command.\n\n`;
        
        // if (jidManager) {
        //   const cleaned = jidManager.cleanJid(senderJid);
        //   const ownerInfo = jidManager.getOwnerInfo();
          
        //   errorMsg += `🔍 *Debug Info:*\n`;
        //   errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
        //   errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
        //   errorMsg += `├─ Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
        //   errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n`;
        // }
        
        // if (autoRecordingConfig.ownerOnly) {
        //   errorMsg += `\n⚙️ *Note:* Command is in owner-only mode\n`;
        //   errorMsg += `Use \`${PREFIX}autorecording mode public\` to allow others\n`;
        // }
        
        return sock.sendMessage(targetJid, {
          text: errorMsg
        }, { quoted: m });
      }
      // ==================== END OWNER CHECK ====================
      
      if (args.length === 0) {
        // Show status
        const status = AutoRecordingManager.status();
        const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
        const modeText = status.ownerOnly ? "🔒 *Owner Only*" : "🌍 *Public*";
        
        await sock.sendMessage(targetJid, {
          text: `🎤 *Auto-Recording Manager* (Owner Command)

${statusText}
${modeText}

📊 *Status:*
• Auto-Recording: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}
• Duration: ${status.duration} seconds

🔧 *Owner Commands:*
• \`${PREFIX}autorecording on\`
• \`${PREFIX}autorecording off\` 
• \`${PREFIX}autorecording <duration>\` 
`
        }, { quoted: m });
        return;
      }
      
      const arg = args[0].toLowerCase();
      
      // Show detailed status
      if (arg === 'status' || arg === 'info') {
        const status = AutoRecordingManager.status();
        const allowedUsers = AutoRecordingManager.getAllowedUsers();
        
        let statusMsg = `🎤 *Auto-Recording Status* (Owner View)\n\n`;
        statusMsg += `📊 *System Status:*\n`;
        statusMsg += `├─ Enabled: ${status.enabled ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ Duration: ${status.duration}s\n`;
        statusMsg += `├─ Mode: ${status.ownerOnly ? '🔒 Owner Only' : '🌍 Public'}\n`;
        statusMsg += `├─ Active Chats: ${status.activeSessions}\n`;
        statusMsg += `├─ Total Users: ${status.totalUsersRecording}\n`;
        statusMsg += `└─ Hooked: ${status.isHooked ? '✅' : '❌'}\n\n`;
        
        if (allowedUsers.length > 0 && !status.ownerOnly) {
          statusMsg += `👥 *Allowed Users:*\n`;
          allowedUsers.forEach((user, index) => {
            statusMsg += `${index + 1}. ${user}\n`;
          });
          statusMsg += `\n`;
        }
        
        if (status.activeSessions > 0) {
          statusMsg += `🎙️ *Active Recording Sessions:*\n`;
          autoRecordingConfig.activeRecorders.forEach((data, chatJid) => {
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
        const enabled = AutoRecordingManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `🎤 *Auto-Recording ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'I will now automatically show **voice recording** when someone messages you! 🎙️✨' : 'Auto-recording has been turned off.'}

⚙️ *Current Settings:*
• Duration: ${AutoRecordingManager.status().duration}s
• Mode: ${AutoRecordingManager.status().ownerOnly ? '🔒 Owner Only' : '🌍 Public'}
• Active Chats: ${AutoRecordingManager.status().activeSessions}`
        }, { quoted: m });
        return;
      }
      
      if (arg === 'off' || arg === 'disable' || arg === 'stop') {
        const enabled = AutoRecordingManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `🎤 *Auto-Recording ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'Auto-recording has been turned on! 🎙️✨' : 'I will no longer auto-record when messaged.'}`
        }, { quoted: m });
        return;
      }
      
      // Mode toggle (owner-only vs public)
      if (arg === 'mode' || arg === 'togglemode') {
        const ownerOnly = AutoRecordingManager.toggleOwnerOnly();
        await sock.sendMessage(targetJid, {
          text: `🔧 *Recording Mode Changed*

Mode: ${ownerOnly ? '🔒 *OWNER ONLY*' : '🌍 *PUBLIC*'}

${ownerOnly ? 
  'Only you (owner) can control auto-recording now.' : 
  'Anyone can use auto-recording commands now.\n\n⚠️ *Warning:* Public mode may allow others to spam recording.'
}

⚙️ To add specific allowed users:
• \`${PREFIX}autorecording users add @user\`
• \`${PREFIX}autorecording users list\``
        }, { quoted: m });
        return;
      }
      
      // User management
      if (arg === 'users' || arg === 'user' || arg === 'allow') {
        const subCmd = args[1]?.toLowerCase();
        
        if (!subCmd || subCmd === 'list') {
          const allowedUsers = AutoRecordingManager.getAllowedUsers();
          let userList = `👥 *Allowed Users* (${allowedUsers.length})\n\n`;
          
          if (allowedUsers.length === 0) {
            userList += `No users added yet.\n`;
          } else {
            allowedUsers.forEach((user, index) => {
              userList += `${index + 1}. ${user}\n`;
            });
          }
          
          userList += `\n🔧 *Commands:*\n`;
          userList += `• \`${PREFIX}autorecording users add @user\`\n`;
          userList += `• \`${PREFIX}autorecording users remove @user\`\n`;
          userList += `• \`${PREFIX}autorecording users clear\`\n`;
          
          return sock.sendMessage(targetJid, {
            text: userList
          }, { quoted: m });
        }
        
        if (subCmd === 'add' && args[2]) {
          const userToAdd = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoRecordingManager.addAllowedUser(userToAdd);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Added*\n\nAdded ${userToAdd} to allowed users list.\n\nThey can now use auto-recording commands.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'remove' && args[2]) {
          const userToRemove = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoRecordingManager.removeAllowedUser(userToRemove);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Removed*\n\nRemoved ${userToRemove} from allowed users list.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'clear') {
          autoRecordingConfig.allowedUsers.clear();
          
          await sock.sendMessage(targetJid, {
            text: `✅ *Users Cleared*\n\nAll allowed users have been removed.`
          }, { quoted: m });
          return;
        }
        
        // Invalid user command
        await sock.sendMessage(targetJid, {
          text: `❓ *Invalid User Command*\n\nUsage:\n• \`${PREFIX}autorecording users list\`\n• \`${PREFIX}autorecording users add @user\`\n• \`${PREFIX}autorecording users remove @user\`\n• \`${PREFIX}autorecording users clear\``
        }, { quoted: m });
        return;
      }
      
      // Set duration
      const duration = parseInt(arg);
      if (!isNaN(duration) && duration >= 1 && duration <= 120) {
        const success = AutoRecordingManager.setDuration(duration);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Duration Updated*

Recording duration set to ${duration} seconds.

${AutoRecordingManager.status().enabled ? '🎙️ Auto-recording is currently **ACTIVE**' : '💤 Auto-recording is **INACTIVE**'}
• Mode: ${AutoRecordingManager.status().ownerOnly ? '🔒 Owner Only' : '🌍 Public'}
• Active Chats: ${AutoRecordingManager.status().activeSessions}`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Duration*

Please use a number between 1 and 120 seconds.

Maximum recording time is 2 minutes (120 seconds).`
          }, { quoted: m });
        }
        return;
      }
      
      // Manual recording command
      if (!isNaN(duration) && duration >= 1 && duration <= 300) {
        // Send initial message
        await sock.sendMessage(targetJid, {
          text: `🎤 *Manual Recording Simulation*

I'll show 'recording...' for ${duration} seconds!`
        }, { quoted: m });
        
        // Do manual recording
        await AutoRecordingManager.manualRecording(sock, targetJid, duration, m);
        return;
      }
      
      // If no valid command, show help
      await sock.sendMessage(targetJid, {
        text: `🎤 *Auto-Recording Owner Commands:*

🔧 *Control:*
• \`${PREFIX}autorecording on\` - Enable auto-recording
• \`${PREFIX}autorecording off\` - Disable auto-recording
• \`${PREFIX}autorecording 15\` - Set duration to 15s

🔒 *Access Control:*
• \`${PREFIX}autorecording mode\` - Toggle owner-only/public mode
• \`${PREFIX}autorecording users\` - Manage allowed users list

📊 *Info:*
• \`${PREFIX}autorecording\` - Show status
• \`${PREFIX}autorecording status\` - Detailed status

🎙️ *Manual:*
• \`${PREFIX}autorecording 10\` - Manual recording for 10s

⚠️ *Note:* Recording can show in multiple chats simultaneously!`
      }, { quoted: m });
      
    } catch (err) {
      console.error("AutoRecording command error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ AutoRecording command failed: ${err.message}`
      }, { quoted: m });
    }
  }
};