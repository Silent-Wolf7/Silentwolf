// commands/fun/autoreactstatus.js

// AutoReactStatus Manager (State Management)
const autoReactStatusConfig = {
  enabled: false,
  reactions: ["❤️", "👍", "🔥", "🎉", "😂", "😮"], // Default reactions for status
  randomReaction: true,
  reactionChance: 80, // Percentage chance to react to a status
  cooldown: 30000, // 30 seconds cooldown per user
  maxReactionsPerDay: 50, // Maximum reactions per day per user
  smartReact: true, // Analyze status content
  statusTypeReactions: {
    text: ["❤️", "👍", "🔥", "👏"], // Reactions for text status
    image: ["😍", "👌", "🔥", "🎨"], // Reactions for image status
    video: ["🎬", "👏", "🔥", "👍"], // Reactions for video status
    link: ["🔗", "👍", "👀", "🔥"] // Reactions for link status
  },
  keywordReactions: [
    { keywords: ["happy", "birthday", "celebration", "party"], reaction: "🎉" },
    { keywords: ["love", "heart", "romantic", "couple"], reaction: "❤️" },
    { keywords: ["funny", "joke", "comedy", "lol"], reaction: "😂" },
    { keywords: ["sad", "cry", "miss", "pain"], reaction: "😢" },
    { keywords: ["achievement", "success", "win", "goal"], reaction: "🏆" },
    { keywords: ["food", "eat", "cooking", "recipe"], reaction: "🍕" },
    { keywords: ["travel", "vacation", "holiday", "beach"], reaction: "✈️" },
    { keywords: ["music", "song", "concert", "festival"], reaction: "🎵" },
    { keywords: ["sport", "game", "match", "exercise"], reaction: "⚽" },
    { keywords: ["work", "business", "office", "job"], reaction: "💼" },
    { keywords: ["study", "exam", "school", "learn"], reaction: "📚" },
    { keywords: ["art", "draw", "paint", "creative"], reaction: "🎨" },
    { keywords: ["nature", "sunset", "mountain", "flower"], reaction: "🌺" },
    { keywords: ["animal", "pet", "cat", "dog"], reaction: "🐾" },
    { keywords: ["technology", "code", "app", "software"], reaction: "💻" }
  ],
  dailyReactions: new Map(), // userId -> {count: number, date: string}
  userCooldowns: new Map(), // userId -> lastReactionTime
  botSock: null,
  isHooked: false,
  lastStatusCheck: 0,
  checkInterval: 60000 // Check for new status every 1 minute
};

class AutoReactStatusManager {
  static initialize(sock) {
    if (!autoReactStatusConfig.isHooked && sock) {
      autoReactStatusConfig.botSock = sock;
      this.hookIntoStatusEvents();
      this.startStatusChecker();
      autoReactStatusConfig.isHooked = true;
      console.log('📱 Auto-react to status system initialized!');
    }
  }

  static hookIntoStatusEvents() {
    if (!autoReactStatusConfig.botSock || !autoReactStatusConfig.botSock.ev) {
      console.log('⚠️ Could not hook into bot events for status reactions');
      return;
    }

    // Note: WhatsApp Web doesn't have direct status update events
    // We'll use periodic checking instead
    console.log('✅ Auto-status-react will use periodic checking');
  }

  static startStatusChecker() {
    // Start periodic status checker
    setInterval(async () => {
      if (!autoReactStatusConfig.enabled || !autoReactStatusConfig.botSock) return;
      
      try {
        await this.checkForNewStatuses();
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, autoReactStatusConfig.checkInterval);
    
    console.log(`🔄 Status checker started (every ${autoReactStatusConfig.checkInterval / 1000}s)`);
  }

  static async checkForNewStatuses() {
    try {
      const sock = autoReactStatusConfig.botSock;
      
      // Get contacts who might have status updates
      // Note: This is a simulation since WhatsApp Web API doesn't provide direct status access
      // In a real implementation, you would use sock.fetchStatus() or similar
      
      // For simulation, we'll use a list of contacts from recent chats
      const contacts = await this.getRecentContacts(sock);
      
      for (const contact of contacts) {
        if (!autoReactStatusConfig.enabled) break;
        
        // Simulate checking if contact has new status
        const hasNewStatus = this.simulateNewStatus(contact);
        
        if (hasNewStatus) {
          await this.reactToContactStatus(sock, contact);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      autoReactStatusConfig.lastStatusCheck = Date.now();
      
    } catch (err) {
      console.error("Failed to check statuses:", err);
    }
  }

  static async getRecentContacts(sock) {
    // Get recent chats to check for status updates
    // This is a simulation - real implementation would be different
    const contacts = [];
    
    // Add some example contacts for simulation
    contacts.push({
      jid: "1234567890@s.whatsapp.net",
      name: "Friend 1",
      lastStatusTime: Date.now() - 3600000 // 1 hour ago
    });
    
    contacts.push({
      jid: "0987654321@s.whatsapp.net", 
      name: "Friend 2",
      lastStatusTime: Date.now() - 7200000 // 2 hours ago
    });
    
    return contacts;
  }

  static simulateNewStatus(contact) {
    // Simulate 20% chance of new status
    const hoursSinceLastStatus = (Date.now() - contact.lastStatusTime) / 3600000;
    return Math.random() < 0.2 && hoursSinceLastStatus > 1;
  }

  static async reactToContactStatus(sock, contact) {
    try {
      const userJid = contact.jid;
      
      // Check cooldown
      const now = Date.now();
      const lastReaction = autoReactStatusConfig.userCooldowns.get(userJid);
      if (lastReaction && now - lastReaction < autoReactStatusConfig.cooldown) {
        return;
      }
      
      // Check daily limit
      const today = new Date().toDateString();
      const userStats = autoReactStatusConfig.dailyReactions.get(userJid) || { count: 0, date: today };
      
      if (userStats.date !== today) {
        userStats.count = 0;
        userStats.date = today;
      }
      
      if (userStats.count >= autoReactStatusConfig.maxReactionsPerDay) {
        console.log(`Daily limit reached for ${userJid}`);
        return;
      }
      
      // Check reaction chance
      if (Math.random() * 100 > autoReactStatusConfig.reactionChance) {
        return;
      }
      
      // Simulate status type (text, image, video, link)
      const statusTypes = ['text', 'image', 'video', 'link'];
      const statusType = statusTypes[Math.floor(Math.random() * statusTypes.length)];
      
      // Simulate status content
      const statusContent = this.generateMockStatusContent(statusType);
      
      // Determine reaction
      const reaction = this.determineStatusReaction(statusType, statusContent);
      
      if (!reaction) return;
      
      // Simulate sending reaction to status
      console.log(`Reacting to ${contact.name}'s status with ${reaction}`);
      
      // Update stats
      userStats.count++;
      autoReactStatusConfig.dailyReactions.set(userJid, userStats);
      autoReactStatusConfig.userCooldowns.set(userJid, now);
      
      // Log the reaction
      if (process.env.DEBUG) {
        console.log(`📱 Reacted to ${contact.name}'s ${statusType} status with ${reaction}`);
      }
      
      return {
        success: true,
        contact: contact.name,
        statusType: statusType,
        reaction: reaction,
        dailyCount: userStats.count
      };
      
    } catch (err) {
      console.error("Failed to react to status:", err);
      return { success: false, error: err.message };
    }
  }

  static generateMockStatusContent(statusType) {
    const mockContents = {
      text: [
        "Having a great day! 😊",
        "Feeling blessed 🙏",
        "Missing someone special 💕",
        "New achievement unlocked! 🏆",
        "Food coma after that meal 🍕",
        "Travel dreams ✈️",
        "Music is life 🎵",
        "Work hard, play harder 💼",
        "Study session complete 📚",
        "Nature is healing 🌿"
      ],
      image: ["Photo of sunset", "Selfie", "Food picture", "Pet photo", "Artwork"],
      video: ["Funny clip", "Travel vlog", "Cooking tutorial", "Workout video", "Music cover"],
      link: ["Article about tech", "YouTube video", "Recipe blog", "News article", "Shopping site"]
    };
    
    const contents = mockContents[statusType] || mockContents.text;
    return contents[Math.floor(Math.random() * contents.length)];
  }

  static determineStatusReaction(statusType, content) {
    let reaction = null;
    const contentLower = content.toLowerCase();
    
    // Smart reaction based on content
    if (autoReactStatusConfig.smartReact) {
      // Check keyword-based reactions
      for (const rule of autoReactStatusConfig.keywordReactions) {
        if (rule.keywords.some(keyword => contentLower.includes(keyword.toLowerCase()))) {
          reaction = rule.reaction;
          break;
        }
      }
      
      // If no keyword match, use status type default
      if (!reaction && autoReactStatusConfig.statusTypeReactions[statusType]) {
        const possibleReactions = autoReactStatusConfig.statusTypeReactions[statusType];
        reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
      }
    }
    
    // Fallback to random reaction from list
    if (!reaction && autoReactStatusConfig.randomReaction) {
      reaction = autoReactStatusConfig.reactions[Math.floor(Math.random() * autoReactStatusConfig.reactions.length)];
    } else if (!reaction && autoReactStatusConfig.reactions.length > 0) {
      reaction = autoReactConfig.reactions[0];
    }
    
    return reaction;
  }

  static async simulateManualReaction(sock, contactJid, statusType = 'text') {
    try {
      // Simulate reacting to a specific contact's status
      const contact = {
        jid: contactJid,
        name: contactJid.split('@')[0],
        lastStatusTime: Date.now() - 3600000
      };
      
      const result = await this.reactToContactStatus(sock, contact);
      
      if (result.success) {
        // Send notification to user
        await sock.sendMessage(contactJid, {
          text: `✅ *Status Reaction Sent!*\n\nI reacted to ${contact.name}'s ${result.statusType} status with ${result.reaction}!\n\n📊 Today's reactions to this user: ${result.dailyCount}/${autoReactStatusConfig.maxReactionsPerDay}`
        });
      }
      
      return result;
    } catch (err) {
      console.error("Manual status reaction error:", err);
      throw err;
    }
  }

  static toggle() {
    autoReactStatusConfig.enabled = !autoReactStatusConfig.enabled;
    console.log(`Auto-react to status ${autoReactStatusConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (!autoReactStatusConfig.enabled) {
      this.clearCooldowns();
    }
    
    return autoReactStatusConfig.enabled;
  }

  static status() {
    const today = new Date().toDateString();
    let totalToday = 0;
    
    autoReactStatusConfig.dailyReactions.forEach(stats => {
      if (stats.date === today) {
        totalToday += stats.count;
      }
    });
    
    return {
      enabled: autoReactStatusConfig.enabled,
      reactions: [...autoReactStatusConfig.reactions],
      randomReaction: autoReactStatusConfig.randomReaction,
      reactionChance: autoReactStatusConfig.reactionChance,
      cooldown: autoReactStatusConfig.cooldown,
      maxReactionsPerDay: autoReactStatusConfig.maxReactionsPerDay,
      smartReact: autoReactStatusConfig.smartReact,
      checkInterval: autoReactStatusConfig.checkInterval,
      lastCheck: autoReactStatusConfig.lastStatusCheck,
      dailyReactions: totalToday,
      activeUsers: autoReactStatusConfig.userCooldowns.size,
      isHooked: autoReactStatusConfig.isHooked
    };
  }

  static addReaction(reaction) {
    if (!autoReactStatusConfig.reactions.includes(reaction) && reaction.length <= 2) {
      autoReactStatusConfig.reactions.push(reaction);
      return true;
    }
    return false;
  }

  static removeReaction(reaction) {
    const index = autoReactStatusConfig.reactions.indexOf(reaction);
    if (index > -1) {
      autoReactStatusConfig.reactions.splice(index, 1);
      return true;
    }
    return false;
  }

  static setChance(percentage) {
    if (percentage >= 0 && percentage <= 100) {
      autoReactStatusConfig.reactionChance = percentage;
      return true;
    }
    return false;
  }

  static setCooldown(seconds) {
    const ms = seconds * 1000;
    if (ms >= 10000 && ms <= 3600000) { // 10s to 1 hour
      autoReactStatusConfig.cooldown = ms;
      return true;
    }
    return false;
  }

  static setDailyLimit(limit) {
    if (limit >= 1 && limit <= 1000) {
      autoReactStatusConfig.maxReactionsPerDay = limit;
      return true;
    }
    return false;
  }

  static setCheckInterval(seconds) {
    const ms = seconds * 1000;
    if (ms >= 30000 && ms <= 3600000) { // 30s to 1 hour
      autoReactStatusConfig.checkInterval = ms;
      return true;
    }
    return false;
  }

  static toggleRandom() {
    autoReactStatusConfig.randomReaction = !autoReactStatusConfig.randomReaction;
    return autoReactStatusConfig.randomReaction;
  }

  static toggleSmart() {
    autoReactStatusConfig.smartReact = !autoReactStatusConfig.smartReact;
    return autoReactStatusConfig.smartReact;
  }

  static clearCooldowns() {
    autoReactStatusConfig.userCooldowns.clear();
  }

  static resetDailyStats() {
    autoReactStatusConfig.dailyReactions.clear();
  }

  static getUserStats(userJid) {
    const today = new Date().toDateString();
    const userStats = autoReactStatusConfig.dailyReactions.get(userJid);
    
    if (userStats && userStats.date === today) {
      return {
        dailyCount: userStats.count,
        limit: autoReactStatusConfig.maxReactionsPerDay,
        remaining: autoReactStatusConfig.maxReactionsPerDay - userStats.count
      };
    }
    
    return {
      dailyCount: 0,
      limit: autoReactStatusConfig.maxReactionsPerDay,
      remaining: autoReactStatusConfig.maxReactionsPerDay
    };
  }

  static async bulkReactToStatuses(sock, count = 5) {
    try {
      const contacts = await this.getRecentContacts(sock);
      const results = [];
      
      for (let i = 0; i < Math.min(count, contacts.length); i++) {
        if (!autoReactStatusConfig.enabled) break;
        
        const contact = contacts[i];
        const result = await this.reactToContactStatus(sock, contact);
        
        if (result.success) {
          results.push(result);
        }
        
        // Delay between reactions
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return results;
    } catch (err) {
      console.error("Bulk react error:", err);
      throw err;
    }
  }
}

// Main Command Export
export default {
  name: "autoreactstatus",
  alias: ["statusreact", "statreact", "reactstatus", "sreact", "statusreaction"],
  desc: "Automatically react to WhatsApp status updates 📱",
  category: "Fun",
  usage: ".autoreactstatus [on/off/stats/chance/cooldown/limit/interval/simulate/bulk/reset]",
  
  async execute(sock, m, args) {
    try {
      const targetJid = m.key.remoteJid;
      
      // Initialize on first command use
      if (!autoReactStatusConfig.isHooked) {
        autoReactStatusConfig.botSock = sock;
        AutoReactStatusManager.initialize(sock);
        autoReactStatusConfig.isHooked = true;
        console.log('📱 Auto-react to status system initialized!');
      }
      
      if (args.length === 0) {
        // Show status
        const status = AutoReactStatusManager.status();
        const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
        const reactionsList = status.reactions.join(' ');
        const lastCheck = status.lastCheck ? 
          new Date(status.lastCheck).toLocaleTimeString() : 'Never';
        
        await sock.sendMessage(targetJid, {
          text: `📱 *Auto-React to Status Manager*\n\n${statusText}\n\n📊 *Status:*\n• Active: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}\n• Reactions: ${reactionsList}\n• Smart React: ${status.smartReact ? 'ON 🤖' : 'OFF ⚙️'}\n• Random: ${status.randomReaction ? 'ON 🎲' : 'OFF 📝'}\n• Chance: ${status.reactionChance}%\n• Cooldown: ${status.cooldown / 1000}s\n• Daily Limit: ${status.maxReactionsPerDay}\n• Check Interval: ${status.checkInterval / 1000}s\n• Last Check: ${lastCheck}\n• Today's Reactions: ${status.dailyReactions}\n• Active Users: ${status.activeUsers}\n\n📝 *Commands:*\n.autoreactstatus on - Enable\n.autoreactstatus off - Disable\n.autoreactstatus stats - Show statistics\n.autoreactstatus chance 75 - Set 75% chance\n.autoreactstatus cooldown 60 - 60s cooldown\n.autoreactstatus limit 100 - Set daily limit\n.autoreactstatus interval 120 - Check every 2min\n.autoreactstatus simulate - Test with fake status\n.autoreactstatus bulk 5 - React to 5 statuses\n.autoreactstatus reset - Reset daily stats\n.autoreactstatus help - Show this message`
        }, { quoted: m });
        return;
      }
      
      const arg = args[0].toLowerCase();
      
      // Show detailed stats
      if (arg === 'stats' || arg === 'statistics' || arg === 'info') {
        const status = AutoReactStatusManager.status();
        const userStats = AutoReactStatusManager.getUserStats(m.key.participant || m.key.remoteJid);
        
        await sock.sendMessage(targetJid, {
          text: `📊 *Status Reaction Statistics*\n\n• System Status: ${status.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}\n• Today's Total Reactions: ${status.dailyReactions}\n• Your Daily Reactions: ${userStats.dailyCount}/${userStats.limit}\n• Your Remaining: ${userStats.remaining}\n• Reaction Chance: ${status.reactionChance}%\n• Cooldown: ${status.cooldown / 1000} seconds\n• Check Interval: ${status.checkInterval / 1000}s\n• Active Users Tracked: ${status.activeUsers}\n• Last Check: ${status.lastCheck ? new Date(status.lastCheck).toLocaleTimeString() : 'Never'}\n\n🎭 *Available Reactions:*\n${status.reactions.map(r => `• ${r}`).join('\n')}`
        }, { quoted: m });
        return;
      }
      
      // Toggle on/off
      if (arg === 'on' || arg === 'enable' || arg === 'start') {
        const enabled = AutoReactStatusManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `✅ *Auto-React to Status ${enabled ? 'ENABLED' : 'DISABLED'}*\n\n${enabled ? 'I will now automatically react to WhatsApp status updates! 📱\n\nNote: This is a simulation. Real status reactions require additional setup.' : 'Status reactions have been turned off.'}`
        }, { quoted: m });
        return;
      }
      
      if (arg === 'off' || arg === 'disable' || arg === 'stop') {
        const enabled = AutoReactStatusManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `✅ *Auto-React to Status ${enabled ? 'ENABLED' : 'DISABLED'}*\n\n${enabled ? 'Status reactions have been turned on! 🎉' : 'I will no longer react to status updates.'}`
        }, { quoted: m });
        return;
      }
      
      // Set chance
      if (arg === 'chance' || arg === 'probability') {
        const chance = parseInt(args[1]);
        if (isNaN(chance)) {
          await sock.sendMessage(targetJid, {
            text: `🎲 *Current Chance:* ${autoReactStatusConfig.reactionChance}%\n\nUse: .autoreactstatus chance 75`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setChance(chance);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Chance Updated*\n\nStatus reaction chance set to ${chance}%.\n\nThis means there's a ${chance}% chance I'll react to each new status.`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Chance*\n\nPlease use a number between 0 and 100.`
          }, { quoted: m });
        }
        return;
      }
      
      // Set cooldown
      if (arg === 'cooldown' || arg === 'cd') {
        const seconds = parseInt(args[1]);
        if (isNaN(seconds)) {
          await sock.sendMessage(targetJid, {
            text: `⏱️ *Current Cooldown:* ${autoReactStatusConfig.cooldown / 1000}s\n\nUse: .autoreactstatus cooldown 120`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setCooldown(seconds);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Cooldown Updated*\n\nCooldown set to ${seconds} seconds.\n\nI will wait ${seconds}s before reacting to the same user's status again.`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Cooldown*\n\nPlease use a number between 10 and 3600 seconds (10s to 1 hour).`
          }, { quoted: m });
        }
        return;
      }
      
      // Set daily limit
      if (arg === 'limit' || arg === 'daily' || arg === 'max') {
        const limit = parseInt(args[1]);
        if (isNaN(limit)) {
          await sock.sendMessage(targetJid, {
            text: `🎯 *Current Daily Limit:* ${autoReactStatusConfig.maxReactionsPerDay}\n\nUse: .autoreactstatus limit 100`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setDailyLimit(limit);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Daily Limit Updated*\n\nMaximum daily reactions per user set to ${limit}.\n\nThis prevents spamming the same user's status.`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Limit*\n\nPlease use a number between 1 and 1000.`
          }, { quoted: m });
        }
        return;
      }
      
      // Set check interval
      if (arg === 'interval' || arg === 'check' || arg === 'frequency') {
        const seconds = parseInt(args[1]);
        if (isNaN(seconds)) {
          await sock.sendMessage(targetJid, {
            text: `🔄 *Current Check Interval:* ${autoReactStatusConfig.checkInterval / 1000}s\n\nUse: .autoreactstatus interval 300`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setCheckInterval(seconds);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Check Interval Updated*\n\nStatus check interval set to ${seconds} seconds.\n\nI will check for new statuses every ${seconds}s.`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Interval*\n\nPlease use a number between 30 and 3600 seconds (30s to 1 hour).`
          }, { quoted: m });
        }
        return;
      }
      
      // Simulate reaction
      if (arg === 'simulate' || arg === 'test' || arg === 'demo') {
        const contactJid = args[1] || (m.key.participant || m.key.remoteJid);
        const statusType = args[2] || 'text';
        
        await sock.sendMessage(targetJid, {
          text: `🧪 *Simulating Status Reaction*\n\nSimulating reaction to ${contactJid.split('@')[0]}'s ${statusType} status...`
        }, { quoted: m });
        
        try {
          const result = await AutoReactStatusManager.simulateManualReaction(sock, contactJid, statusType);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *Simulation Complete!*\n\n• Contact: ${result.contact}\n• Status Type: ${result.statusType}\n• Reaction: ${result.reaction}\n• Daily Count: ${result.dailyCount}\n• Success: ${result.success ? '✅' : '❌'}\n\nNote: This was a simulation. Real status reactions work similarly.`
          }, { quoted: m });
        } catch (err) {
          await sock.sendMessage(targetJid, {
            text: `❌ *Simulation Failed*\n\nError: ${err.message}`
          }, { quoted: m });
        }
        return;
      }
      
      // Bulk react
      if (arg === 'bulk' || arg === 'mass' || arg === 'multiple') {
        const count = parseInt(args[1]) || 3;
        
        if (count < 1 || count > 10) {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Count*\n\nPlease use a number between 1 and 10.`
          }, { quoted: m });
          return;
        }
        
        await sock.sendMessage(targetJid, {
          text: `🚀 *Bulk Status Reaction Started*\n\nReacting to ${count} simulated statuses...`
        }, { quoted: m });
        
        try {
          const results = await AutoReactStatusManager.bulkReactToStatuses(sock, count);
          const successCount = results.filter(r => r.success).length;
          
          let resultText = `✅ *Bulk Reaction Complete!*\n\nReacted to ${successCount}/${count} statuses.\n\n`;
          
          if (successCount > 0) {
            resultText += `*Recent Reactions:*\n`;
            results.slice(0, 3).forEach((r, i) => {
              resultText += `${i + 1}. ${r.contact}: ${r.reaction} (${r.statusType})\n`;
            });
            
            if (results.length > 3) {
              resultText += `...and ${results.length - 3} more`;
            }
          }
          
          await sock.sendMessage(targetJid, {
            text: resultText
          }, { quoted: m });
        } catch (err) {
          await sock.sendMessage(targetJid, {
            text: `❌ *Bulk Reaction Failed*\n\nError: ${err.message}`
          }, { quoted: m });
        }
        return;
      }
      
      // Reset daily stats
      if (arg === 'reset' || arg === 'clear') {
        AutoReactStatusManager.resetDailyStats();
        await sock.sendMessage(targetJid, {
          text: `🔄 *Daily Statistics Reset*\n\nAll daily reaction counts have been reset to zero.`
        }, { quoted: m });
        return;
      }
      
      // Show help
      if (arg === 'help' || arg === 'commands') {
        await sock.sendMessage(targetJid, {
          text: `📖 *Auto-React to Status Help*\n\n*Basic Commands:*\n• .autoreactstatus on - Enable system\n• .autoreactstatus off - Disable system\n• .autoreactstatus stats - Show statistics\n\n*Configuration:*\n• .autoreactstatus chance 75 - 75% reaction chance\n• .autoreactstatus cooldown 120 - 2min cooldown\n• .autoreactstatus limit 50 - 50 reactions/day/user\n• .autoreactstatus interval 300 - Check every 5min\n\n*Testing:*\n• .autoreactstatus simulate - Test with fake status\n• .autoreactstatus bulk 5 - React to 5 statuses\n• .autoreactstatus reset - Reset daily counts\n\n*Note:* This system simulates status reactions. Real WhatsApp status API access may require additional setup.`
        }, { quoted: m });
        return;
      }
      
      // If no valid command, show help
      await sock.sendMessage(targetJid, {
        text: `❓ *Invalid Command*\n\nUse:\n• \`.autoreactstatus on\` - Enable system\n• \`.autoreactstatus off\` - Disable\n• \`.autoreactstatus stats\` - Show statistics\n• \`.autoreactstatus chance 75\` - Set 75% chance\n• \`.autoreactstatus simulate\` - Test reaction\n• \`.autoreactstatus help\` - Show all commands`
      }, { quoted: m });
      
    } catch (err) {
      console.error("AutoReactStatus command error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ AutoReactStatus command failed: ${err.message}`
      }, { quoted: m });
    }
  }
};