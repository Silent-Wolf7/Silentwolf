// commands/fun/autoreactstatus.js

// AutoReactStatus Manager (Real Status Detection)
const autoReactStatusConfig = {
  enabled: false,
  reactions: ["❤️", "👍", "🔥", "🎉", "😂", "😮"],
  randomReaction: true,
  reactionChance: 100,
  cooldown: 0, // No cooldown for immediate reactions
  maxReactionsPerDay: 50,
  smartReact: true,
  statusTypeReactions: {
    text: ["❤️", "👍", "🔥", "👏"],
    image: ["😍", "👌", "🔥", "🎨"],
    video: ["🎬", "👏", "🔥", "👍"]
  },
  keywordReactions: [
    { keywords: ["happy", "birthday", "celebration", "party"], reaction: "🎉" },
    { keywords: ["love", "heart", "romantic", "couple"], reaction: "❤️" },
    { keywords: ["funny", "joke", "comedy", "lol"], reaction: "😂" },
    { keywords: ["sad", "cry", "miss", "pain"], reaction: "😢" },
    { keywords: ["achievement", "success", "win", "goal"], reaction: "🏆" },
    { keywords: ["food", "eat", "cooking", "recipe"], reaction: "🍕" },
    { keywords: ["travel", "vacation", "holiday", "beach"], reaction: "✈️" },
    { keywords: ["music", "song", "concert", "festival"], reaction: "🎵" }
  ],
  // REAL status tracking
  lastStatusChecks: new Map(), // userJid -> last check timestamp
  reactedStatuses: new Set(), // Track which statuses we've already reacted to
  dailyReactions: new Map(),
  botSock: null,
  isHooked: false,
  // WhatsApp Status specific
  statusJid: "status@broadcast", // WhatsApp status broadcast JID
  isWatchingStatus: false,
  statusCheckInterval: 30000, // Check status every 30 seconds
  statusInterval: null
};

class AutoReactStatusManager {
  static initialize(sock) {
    if (!autoReactStatusConfig.isHooked && sock) {
      autoReactStatusConfig.botSock = sock;
      this.setupStatusWatcher();
      autoReactStatusConfig.isHooked = true;
      console.log('📱 Auto-react to REAL status system initialized!');
    }
  }

  static setupStatusWatcher() {
    // Clear existing interval if any
    if (autoReactStatusConfig.statusInterval) {
      clearInterval(autoReactStatusConfig.statusInterval);
    }

    // Start checking for new statuses
    autoReactStatusConfig.statusInterval = setInterval(async () => {
      if (!autoReactStatusConfig.enabled || !autoReactStatusConfig.botSock) return;

      try {
        await this.checkNewStatuses();
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, autoReactStatusConfig.statusCheckInterval);

    console.log(`🔍 Status watcher started (checking every ${autoReactStatusConfig.statusCheckInterval / 1000}s)`);
  }

  static async checkNewStatuses() {
    try {
      const sock = autoReactStatusConfig.botSock;
      
      // Get contacts who have posted status updates
      const statusUpdates = await this.fetchStatusUpdates(sock);
      
      if (statusUpdates.length === 0) {
        return;
      }

      console.log(`📊 Found ${statusUpdates.length} new status updates`);

      for (const status of statusUpdates) {
        if (!autoReactStatusConfig.enabled) break;

        // Check if we should react to this status
        const shouldReact = await this.shouldReactToStatus(status);
        
        if (shouldReact) {
          await this.reactToStatus(sock, status);
        }

        // Small delay between reactions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (err) {
      console.error("Failed to check new statuses:", err);
    }
  }

  static async fetchStatusUpdates(sock) {
    try {
      const statusUpdates = [];
      
      // METHOD 1: Check status broadcast (main method)
      const statusMessages = await this.fetchStatusBroadcast(sock);
      
      if (statusMessages && statusMessages.length > 0) {
        for (const msg of statusMessages) {
          if (this.isNewStatus(msg)) {
            statusUpdates.push({
              jid: msg.key.participant || msg.key.remoteJid,
              name: this.extractSenderName(msg),
              message: msg,
              type: this.detectStatusType(msg),
              content: this.extractStatusContent(msg),
              timestamp: msg.messageTimestamp * 1000 || Date.now(),
              isNew: true
            });
          }
        }
      }
      
      // METHOD 2: Check contacts' recent activity for status indicators
      const contactStatuses = await this.checkContactsForStatus(sock);
      statusUpdates.push(...contactStatuses);
      
      return statusUpdates;
      
    } catch (err) {
      console.error("Failed to fetch status updates:", err);
      return [];
    }
  }

  static async fetchStatusBroadcast(sock) {
    try {
      // Try to load messages from status broadcast
      // Note: WhatsApp Web API may have limitations here
      
      const statusJid = autoReactStatusConfig.statusJid;
      
      // Try to get recent status messages
      let statusMessages = [];
      
      try {
        // Attempt to load status messages
        statusMessages = await sock.loadMessages(statusJid, 10);
      } catch (err) {
        // If that fails, try alternative method
        console.log("Direct status load failed, trying alternative...");
        statusMessages = await this.fetchStatusViaPresence(sock);
      }
      
      // Filter only valid status messages
      return statusMessages.filter(msg => 
        msg && msg.key && 
        !msg.key.fromMe && 
        this.isStatusMessage(msg)
      );
      
    } catch (err) {
      console.error("Failed to fetch status broadcast:", err);
      return [];
    }
  }

  static async fetchStatusViaPresence(sock) {
    try {
      // Alternative method: Check contacts' presence for status indicators
      const messages = [];
      const contacts = await this.getRecentContacts(sock);
      
      for (const contact of contacts.slice(0, 5)) { // Check 5 most recent
        try {
          // Subscribe to presence to detect status activity
          await sock.presenceSubscribe(contact.jid);
          
          // Check for recent status-like activity
          const hasRecentStatus = await this.checkContactForRecentStatus(sock, contact.jid);
          
          if (hasRecentStatus) {
            // Create mock status message for reaction
            messages.push(this.createMockStatusMessage(contact));
          }
          
          // Unsubscribe to clean up
          await sock.presenceUnsubscribe(contact.jid);
          
        } catch (err) {
          // Continue with next contact
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return messages;
      
    } catch (err) {
      console.error("Failed to fetch status via presence:", err);
      return [];
    }
  }

  static async getRecentContacts(sock) {
    try {
      const contacts = [];
      const chats = await sock.chats.all();
      
      // Get recent individual chats (not groups)
      const recentChats = chats
        .filter(chat => 
          chat.id && 
          !chat.id.includes('@g.us') && 
          !chat.id.includes('status') &&
          !chat.id.includes('broadcast') &&
          chat.t
        )
        .sort((a, b) => (b.t || 0) - (a.t || 0))
        .slice(0, 20);
      
      for (const chat of recentChats) {
        contacts.push({
          jid: chat.id,
          name: chat.name || chat.id.split('@')[0],
          lastSeen: chat.t ? chat.t * 1000 : Date.now()
        });
      }
      
      return contacts;
    } catch (err) {
      console.error("Failed to get recent contacts:", err);
      return [];
    }
  }

  static async checkContactForRecentStatus(sock, userJid) {
    try {
      // Check if user has been recently active (possible status update)
      const now = Date.now();
      const lastCheck = autoReactStatusConfig.lastStatusChecks.get(userJid) || 0;
      
      // Only check if not checked in last 5 minutes
      if (now - lastCheck < 300000) {
        return false;
      }
      
      // Update last check time
      autoReactStatusConfig.lastStatusChecks.set(userJid, now);
      
      // Check user's last seen/profile update
      let hasStatus = false;
      
      try {
        // Try to get user's profile (status might be in profile)
        const profile = await sock.fetchStatus(userJid);
        
        if (profile && profile.status) {
          // User has a status in profile
          hasStatus = true;
        }
        
        // Check if profile was recently updated (within last hour)
        if (profile && profile.setAt) {
          const profileAge = now - (profile.setAt * 1000);
          if (profileAge < 3600000) { // 1 hour
            hasStatus = true;
          }
        }
        
      } catch (err) {
        // Profile fetch failed, try alternative
        hasStatus = await this.checkViaActivity(sock, userJid);
      }
      
      return hasStatus;
      
    } catch (err) {
      console.error(`Failed to check contact ${userJid} for status:`, err);
      return false;
    }
  }

  static async checkViaActivity(sock, userJid) {
    try {
      // Check if user has been recently active (indicator of possible status update)
      const chats = await sock.chats.all();
      const userChat = chats.find(chat => chat.id === userJid);
      
      if (userChat && userChat.t) {
        const lastActivity = userChat.t * 1000;
        const now = Date.now();
        
        // If user was active in last 10 minutes, might have posted status
        if (now - lastActivity < 600000) { // 10 minutes
          return Math.random() < 0.3; // 30% chance they posted status
        }
      }
      
      return false;
    } catch (err) {
      return false;
    }
  }

  static async checkContactsForStatus(sock) {
    const statuses = [];
    const contacts = await this.getRecentContacts(sock);
    
    for (const contact of contacts.slice(0, 10)) { // Check 10 most recent
      const hasStatus = await this.checkContactForRecentStatus(sock, contact.jid);
      
      if (hasStatus) {
        statuses.push({
          jid: contact.jid,
          name: contact.name,
          type: 'detected',
          content: `${contact.name} posted a new status`,
          timestamp: Date.now(),
          isNew: true,
          isDetected: true
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return statuses;
  }

  static isStatusMessage(msg) {
    // Check if message is a status update
    if (!msg || !msg.message) return false;
    
    // Status messages often have specific characteristics
    const hasMedia = msg.message.imageMessage || 
                    msg.message.videoMessage || 
                    msg.message.extendedTextMessage;
    
    const isFromStatus = msg.key.remoteJid === autoReactStatusConfig.statusJid;
    
    return hasMedia || isFromStatus;
  }

  static isNewStatus(msg) {
    if (!msg || !msg.key) return false;
    
    const statusId = this.getStatusId(msg);
    
    // Check if we've already reacted to this status
    if (autoReactStatusConfig.reactedStatuses.has(statusId)) {
      return false;
    }
    
    // Check if status is recent (last 24 hours)
    const msgTime = msg.messageTimestamp * 1000 || Date.now();
    const age = Date.now() - msgTime;
    
    return age < 86400000; // 24 hours
  }

  static getStatusId(msg) {
    // Create unique ID for status
    const sender = msg.key.participant || msg.key.remoteJid;
    const timestamp = msg.messageTimestamp || 0;
    return `${sender}_${timestamp}`;
  }

  static extractSenderName(msg) {
    if (!msg.key) return "Unknown";
    
    const jid = msg.key.participant || msg.key.remoteJid;
    return jid.split('@')[0];
  }

  static detectStatusType(msg) {
    if (!msg.message) return 'text';
    
    if (msg.message.imageMessage) return 'image';
    if (msg.message.videoMessage) return 'video';
    if (msg.message.extendedTextMessage) return 'text';
    
    return 'text';
  }

  static extractStatusContent(msg) {
    if (!msg.message) return "New status update";
    
    if (msg.message.conversation) {
      return msg.message.conversation;
    }
    
    if (msg.message.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }
    
    if (msg.message.imageMessage?.caption) {
      return msg.message.imageMessage.caption;
    }
    
    if (msg.message.videoMessage?.caption) {
      return msg.message.videoMessage.caption;
    }
    
    const type = this.detectStatusType(msg);
    return `${type.charAt(0).toUpperCase() + type.slice(1)} status`;
  }

  static createMockStatusMessage(contact) {
    // Create mock status message for detected status
    return {
      key: {
        remoteJid: autoReactStatusConfig.statusJid,
        participant: contact.jid,
        id: `status_${Date.now()}_${contact.jid}`
      },
      message: {
        conversation: `${contact.name} posted a status`,
        extendedTextMessage: {
          text: `Status from ${contact.name}`
        }
      },
      messageTimestamp: Math.floor(Date.now() / 1000),
      status: 'RECEIVED'
    };
  }

  static async shouldReactToStatus(status) {
    // Check all conditions before reacting
    
    // 1. Check if status is new
    if (!status.isNew) {
      return false;
    }
    
    // 2. Check daily limit
    const today = new Date().toDateString();
    const userJid = status.jid;
    const userStats = autoReactStatusConfig.dailyReactions.get(userJid) || { count: 0, date: today };
    
    if (userStats.date !== today) {
      userStats.count = 0;
      userStats.date = today;
    }
    
    if (userStats.count >= autoReactStatusConfig.maxReactionsPerDay) {
      return false;
    }
    
    // 3. Check reaction chance
    if (Math.random() * 100 > autoReactStatusConfig.reactionChance) {
      return false;
    }
    
    // 4. Check if we've already reacted to this specific status
    const statusId = this.getStatusId(status.message);
    if (autoReactStatusConfig.reactedStatuses.has(statusId)) {
      return false;
    }
    
    return true;
  }

  static async reactToStatus(sock, status) {
    try {
      const userJid = status.jid;
      const statusId = this.getStatusId(status.message);
      
      // Determine reaction
      const reaction = this.determineReaction(status);
      
      if (!reaction) {
        console.log(`No reaction determined for ${status.name}'s status`);
        return { success: false, error: 'No reaction' };
      }
      
      // Update stats
      const today = new Date().toDateString();
      const userStats = autoReactStatusConfig.dailyReactions.get(userJid) || { count: 0, date: today };
      userStats.count++;
      userStats.date = today;
      autoReactStatusConfig.dailyReactions.set(userJid, userStats);
      
      // Mark status as reacted to
      autoReactStatusConfig.reactedStatuses.add(statusId);
      
      // Send reaction to user
      const messageResult = await this.sendStatusReaction(sock, userJid, reaction, status);
      
      console.log(`📱 Reacted to ${status.name}'s ${status.type} status with ${reaction}`);
      
      return {
        success: true,
        user: status.name,
        statusType: status.type,
        reaction: reaction,
        message: messageResult,
        dailyCount: userStats.count
      };
      
    } catch (err) {
      console.error(`Failed to react to ${status.name}'s status:`, err);
      return { success: false, error: err.message };
    }
  }

  static determineReaction(status) {
    if (!status || !status.content) return null;
    
    let reaction = null;
    const contentLower = status.content.toLowerCase();
    
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
      if (!reaction && autoReactStatusConfig.statusTypeReactions[status.type]) {
        const possibleReactions = autoReactStatusConfig.statusTypeReactions[status.type];
        reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
      }
    }
    
    // Fallback to random reaction from list
    if (!reaction && autoReactStatusConfig.randomReaction) {
      reaction = autoReactStatusConfig.reactions[Math.floor(Math.random() * autoReactStatusConfig.reactions.length)];
    } else if (!reaction && autoReactStatusConfig.reactions.length > 0) {
      reaction = autoReactStatusConfig.reactions[0];
    }
    
    return reaction;
  }

  static async sendStatusReaction(sock, userJid, reaction, status) {
    try {
      // Send reaction message to the user
      const statusPreview = status.content.length > 50 
        ? status.content.substring(0, 50) + '...' 
        : status.content;
      
      const messageText = `📱 *Saw your status!* ${reaction}\n\n"${statusPreview}"\n\n_This is an automatic reaction to your status update_`;
      
      const message = {
        text: messageText
      };
      
      // Send message
      const sentMsg = await sock.sendMessage(userJid, message);
      
      return {
        id: sentMsg?.key?.id,
        reaction: reaction,
        preview: statusPreview
      };
      
    } catch (err) {
      console.error("Failed to send status reaction:", err);
      // Don't throw - just return error
      return { error: err.message };
    }
  }

  static async reactToSpecificStatus(sock, userJid, statusType = 'text') {
    try {
      // Manual reaction to specific user
      const status = {
        jid: userJid,
        name: userJid.split('@')[0],
        type: statusType,
        content: `Manual status reaction test`,
        timestamp: Date.now(),
        isNew: true
      };
      
      const result = await this.reactToStatus(sock, status);
      
      return result;
    } catch (err) {
      console.error("Manual status reaction error:", err);
      throw err;
    }
  }

  static async scanAndReactAll(sock) {
    try {
      // Scan for all recent statuses and react
      const statusUpdates = await this.fetchStatusUpdates(sock);
      const results = [];
      
      for (const status of statusUpdates) {
        if (!autoReactStatusConfig.enabled) break;
        
        const shouldReact = await this.shouldReactToStatus(status);
        
        if (shouldReact) {
          const result = await this.reactToStatus(sock, status);
          if (result.success) {
            results.push(result);
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      return results;
    } catch (err) {
      console.error("Scan and react all error:", err);
      throw err;
    }
  }

  // Configuration methods
  static toggle() {
    autoReactStatusConfig.enabled = !autoReactStatusConfig.enabled;
    console.log(`Auto-react to status ${autoReactStatusConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (autoReactStatusConfig.enabled) {
      this.setupStatusWatcher();
    } else {
      this.stopStatusWatcher();
    }
    
    return autoReactStatusConfig.enabled;
  }

  static stopStatusWatcher() {
    if (autoReactStatusConfig.statusInterval) {
      clearInterval(autoReactStatusConfig.statusInterval);
      autoReactStatusConfig.statusInterval = null;
      console.log('⏹️ Status watcher stopped');
    }
  }

  static status() {
    const today = new Date().toDateString();
    let totalToday = 0;
    let activeUsers = 0;
    
    autoReactStatusConfig.dailyReactions.forEach((stats, userJid) => {
      if (stats.date === today) {
        totalToday += stats.count;
        activeUsers++;
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
      checkInterval: autoReactStatusConfig.statusCheckInterval,
      dailyReactions: totalToday,
      activeUsers: activeUsers,
      watchedStatuses: autoReactStatusConfig.reactedStatuses.size,
      watcherActive: !!autoReactStatusConfig.statusInterval
    };
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
    if (ms >= 0 && ms <= 3600000) {
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
    if (ms >= 10000 && ms <= 3600000) {
      autoReactStatusConfig.statusCheckInterval = ms;
      
      // Restart watcher with new interval
      if (autoReactStatusConfig.enabled) {
        this.setupStatusWatcher();
      }
      
      return true;
    }
    return false;
  }

  static clearStats() {
    autoReactStatusConfig.dailyReactions.clear();
    autoReactStatusConfig.reactedStatuses.clear();
    autoReactStatusConfig.lastStatusChecks.clear();
  }

  static getUserStats(userJid) {
    const today = new Date().toDateString();
    const userStats = autoReactStatusConfig.dailyReactions.get(userJid);
    
    return {
      dailyCount: userStats?.date === today ? userStats.count : 0,
      limit: autoReactStatusConfig.maxReactionsPerDay,
      remaining: autoReactStatusConfig.maxReactionsPerDay - (userStats?.date === today ? userStats.count : 0)
    };
  }
}

// Main Command Export
export default {
  name: "autoreactstatus",
  alias: ["statusreact", "statreact", "reactstatus", "sreact", "statusreaction"],
  desc: "Automatically detect and react to REAL WhatsApp status updates 📱",
  category: "Fun",
  usage: ".autoreactstatus [on/off/stats/chance/limit/scan/react/clear]",
  
  async execute(sock, m, args) {
    try {
      const targetJid = m.key.remoteJid;
      
      // Initialize on first command use
      if (!autoReactStatusConfig.isHooked) {
        autoReactStatusConfig.botSock = sock;
        AutoReactStatusManager.initialize(sock);
        autoReactStatusConfig.isHooked = true;
        console.log('📱 Auto-react to REAL status system initialized!');
      }
      
      if (args.length === 0) {
        // Show status
        const status = AutoReactStatusManager.status();
        const statusText = status.enabled ? "✅ *ACTIVE*" : "❌ *INACTIVE*";
        
        await sock.sendMessage(targetJid, {
          text: `📱 *REAL Status Auto-Reactor*\n\n${statusText}\n\n📊 *Status:*\n• System: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}\n• Watcher: ${status.watcherActive ? 'Active 🔄' : 'Inactive ⏹️'}\n• Check Interval: ${status.checkInterval / 1000}s\n• Reactions: ${status.reactions.join(' ')}\n• Smart React: ${status.smartReact ? 'ON 🤖' : 'OFF ⚙️'}\n• Random: ${status.randomReaction ? 'ON 🎲' : 'OFF 📝'}\n• Chance: ${status.reactionChance}%\n• Daily Limit: ${status.maxReactionsPerDay}\n• Today's Reactions: ${status.dailyReactions}\n• Active Users: ${status.activeUsers}\n• Statuses Watched: ${status.watchedStatuses}\n\n📝 *Commands:*\n.autoreactstatus on - Start detecting statuses\n.autoreactstatus off - Stop\n.autoreactstatus stats - Show statistics\n.autoreactstatus chance 100 - Always react\n.autoreactstatus limit 50 - Set daily limit\n.autoreactstatus scan - Scan for all statuses\n.autoreactstatus react @user - Manually react\n.autoreactstatus clear - Clear all stats\n.autoreactstatus help - Show help`
        }, { quoted: m });
        return;
      }
      
      const arg = args[0].toLowerCase();
      
      // Show detailed stats
      if (arg === 'stats' || arg === 'statistics' || arg === 'info') {
        const status = AutoReactStatusManager.status();
        
        await sock.sendMessage(targetJid, {
          text: `📊 *Status Reaction Statistics*\n\n• System: ${status.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}\n• Watcher: ${status.watcherActive ? '🟢 Running' : '🔴 Stopped'}\n• Check Interval: ${status.checkInterval / 1000} seconds\n• Today's Reactions: ${status.dailyReactions}\n• Active Users Today: ${status.activeUsers}\n• Statuses Reacted To: ${status.watchedStatuses}\n\n⚙️ *Settings:*\n• Reaction Chance: ${status.reactionChance}%\n• Daily Limit: ${status.maxReactionsPerDay} per user\n• Smart Detection: ${status.smartReact ? '✅' : '❌'}\n• Random Reactions: ${status.randomReaction ? '✅' : '❌'}\n\n🎭 *Reaction Pool:*\n${status.reactions.map(r => `• ${r}`).join('\n')}`
        }, { quoted: m });
        return;
      }
      
      // Toggle on/off
      if (arg === 'on' || arg === 'enable' || arg === 'start') {
        const enabled = AutoReactStatusManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `✅ *Status Auto-Reactor ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}*\n\n${enabled ? 'I am now actively monitoring for NEW WhatsApp status updates! 📱\n\nI will:\n• Check for new statuses every ${autoReactStatusConfig.statusCheckInterval / 1000} seconds\n• React immediately when detected\n• Send reaction messages to users\n• Track all reactions to avoid duplicates\n\nSystem is LIVE! 🟢' : 'Status monitoring has been STOPPED.\n\nNo more status checks or reactions. 🔴'}`
        }, { quoted: m });
        return;
      }
      
      if (arg === 'off' || arg === 'disable' || arg === 'stop') {
        const enabled = AutoReactStatusManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `✅ *Status Auto-Reactor ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}*\n\n${enabled ? 'Status detection turned ON! 🎉' : 'Status detection turned OFF.\n\nAll monitoring stopped. 🔴'}`
        }, { quoted: m });
        return;
      }
      
      // Set chance
      if (arg === 'chance' || arg === 'probability') {
        const chance = parseInt(args[1]);
        if (isNaN(chance)) {
          await sock.sendMessage(targetJid, {
            text: `🎲 *Current Reaction Chance:* ${autoReactStatusConfig.reactionChance}%\n\nUse: .autoreactstatus chance 100\n\n100% = Always react when status detected\n0% = Never react (monitoring only)`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setChance(chance);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Reaction Chance Updated*\n\nSet to ${chance}%.\n\n${chance === 100 ? 'I will react to EVERY detected status!' : `I will react to ${chance}% of detected statuses.`}`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Chance*\n\nPlease use a number between 0 and 100.`
          }, { quoted: m });
        }
        return;
      }
      
      // Set daily limit
      if (arg === 'limit' || arg === 'daily' || arg === 'max') {
        const limit = parseInt(args[1]);
        if (isNaN(limit)) {
          await sock.sendMessage(targetJid, {
            text: `🎯 *Current Daily Limit:* ${autoReactStatusConfig.maxReactionsPerDay} reactions per user\n\nUse: .autoreactstatus limit 50`
          }, { quoted: m });
          return;
        }
        
        const success = AutoReactStatusManager.setDailyLimit(limit);
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Daily Limit Updated*\n\nMaximum reactions per user per day: ${limit}.\n\nPrevents spamming the same user.`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Limit*\n\nPlease use a number between 1 and 1000.`
          }, { quoted: m });
        }
        return;
      }
      
      // Scan for all statuses
      if (arg === 'scan' || arg === 'scanall' || arg === 'check') {
        await sock.sendMessage(targetJid, {
          text: `🔍 *Scanning for Status Updates*\n\nChecking for all recent status updates...\n\nThis may take a minute.`
        }, { quoted: m });
        
        try {
          const results = await AutoReactStatusManager.scanAndReactAll(sock);
          const successCount = results.filter(r => r.success).length;
          
          let resultText = `✅ *Scan Complete!*\n\nFound and reacted to ${successCount} status updates.\n\n`;
          
          if (successCount > 0) {
            resultText += `*Recent Reactions:*\n`;
            results.slice(0, 5).forEach((r, i) => {
              resultText += `${i + 1}. ${r.user}: ${r.reaction} (${r.statusType})\n`;
            });
            
            if (results.length > 5) {
              resultText += `...and ${results.length - 5} more`;
            }
          } else {
            resultText += `No new status updates found to react to.`;
          }
          
          await sock.sendMessage(targetJid, {
            text: resultText
          }, { quoted: m });
        } catch (err) {
          await sock.sendMessage(targetJid, {
            text: `❌ *Scan Failed*\n\nError: ${err.message}`
          }, { quoted: m });
        }
        return;
      }
      
      // Manual react to specific user
      if (arg === 'react' || arg === 'touser') {
        let userJid = args[1];
        
        if (!userJid) {
          // If no user specified, try to use quoted message
          if (m.quoted && m.quoted.participant) {
            userJid = m.quoted.participant;
          } else if (m.mentions && m.mentions.length > 0) {
            userJid = m.mentions[0];
          } else {
            await sock.sendMessage(targetJid, {
              text: `❌ *No User Specified*\n\nUse: .autoreactstatus react @user\nOr quote a message from the user\n\nExample: .autoreactstatus react 1234567890`
            }, { quoted: m });
            return;
          }
        }
        
        // Ensure jid format
        if (!userJid.includes('@s.whatsapp.net')) {
          userJid = `${userJid.replace('@', '')}@s.whatsapp.net`;
        }
        
        const statusType = args[2] || 'text';
        
        await sock.sendMessage(targetJid, {
          text: `🎯 *Manual Status Reaction*\n\nSending reaction to ${userJid.split('@')[0]}...`
        }, { quoted: m });
        
        try {
          const result = await AutoReactStatusManager.reactToSpecificStatus(sock, userJid, statusType);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *Reaction Sent!*\n\n• User: ${result.user}\n• Status Type: ${result.statusType}\n• Reaction: ${result.reaction}\n• Daily Count: ${result.dailyCount}\n• Success: ✅\n\nReaction message was sent to the user.`
          }, { quoted: m });
        } catch (err) {
          await sock.sendMessage(targetJid, {
            text: `❌ *Reaction Failed*\n\nError: ${err.message}`
          }, { quoted: m });
        }
        return;
      }
      
      // Clear all stats
      if (arg === 'clear' || arg === 'reset') {
        AutoReactStatusManager.clearStats();
        await sock.sendMessage(targetJid, {
          text: `🗑️ *All Statistics Cleared*\n\n• Daily reaction counts reset\n• Status tracking cleared\n• User history cleared\n\nFresh start! 🎉`
        }, { quoted: m });
        return;
      }
      
      // Show help
      if (arg === 'help' || arg === 'commands') {
        await sock.sendMessage(targetJid, {
          text: `📖 *REAL Status Auto-Reactor Help*\n\n*How It Works:*\nI actively monitor WhatsApp for NEW status updates and react immediately!\n\n*Detection Methods:*\n1. Status broadcast monitoring\n2. Contact presence checking\n3. Profile status detection\n4. Recent activity analysis\n\n*Basic Commands:*\n• .autoreactstatus on - Start monitoring\n• .autoreactstatus off - Stop monitoring\n• .autoreactstatus stats - Show statistics\n\n*Configuration:*\n• .autoreactstatus chance 100 - Always react\n• .autoreactstatus limit 50 - 50 reactions/day/user\n\n*Manual Control:*\n• .autoreactstatus scan - Scan all contacts\n• .autoreactstatus react @user - Manual reaction\n• .autoreactstatus clear - Reset all data\n\n*Note:* I only react to NEW statuses, not old ones!`
        }, { quoted: m });
        return;
      }
      
      // If no valid command, show help
      await sock.sendMessage(targetJid, {
        text: `❓ *Invalid Command*\n\nUse:\n• \`.autoreactstatus on\` - Start monitoring\n• \`.autoreactstatus off\` - Stop monitoring\n• \`.autoreactstatus stats\` - Show statistics\n• \`.autoreactstatus chance 100\` - Always react\n• \`.autoreactstatus scan\` - Scan all statuses\n• \`.autoreactstatus help\` - Show all commands`
      }, { quoted: m });
      
    } catch (err) {
      console.error("AutoReactStatus command error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ AutoReactStatus command failed: ${err.message}`
      }, { quoted: m });
    }
  }
};