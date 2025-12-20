// // commands/fun/autoreact.js

// // AutoReact Manager (State Management)
// const autoReactConfig = {
//   enabled: false,
//   reactions: ["❤️", "😂", "😮", "😢", "😡", "👍"], // Default reactions
//   randomReaction: true,
//   reactionChance: 100, // Percentage chance to react
//   cooldown: 2000, // 2 seconds cooldown between reactions
//   targetChats: new Set(), // Specific chats to react in (empty = all chats)
//   excludeChats: new Set(), // Chats to exclude
//   userReactions: new Map(), // userId -> last reaction time
//   smartReact: true, // Analyze message content for appropriate reaction
//   reactionRules: {
//     positive: ["😊", "👍", "❤️", "🎉", "👏", "🔥"],
//     negative: ["😢", "😡", "👎", "💔"],
//     funny: ["😂", "🤣", "😆", "💀"],
//     surprising: ["😮", "😲", "🤯", "👀"],
//     questioning: ["🤔", "❓", "❔"]
//   },
//   keywordReactions: [
//     { keywords: ["love", "heart", "❤️", "beautiful", "amazing"], reaction: "❤️" },
//     { keywords: ["haha", "lol", "funny", "😂", "lmao"], reaction: "😂" },
//     { keywords: ["wow", "omg", "amazing", "unbelievable"], reaction: "😮" },
//     { keywords: ["sad", "cry", "bad", "sorry", "😢"], reaction: "😢" },
//     { keywords: ["angry", "mad", "hate", "😡"], reaction: "😡" },
//     { keywords: ["good", "great", "nice", "awesome", "👍"], reaction: "👍" },
//     { keywords: ["fire", "hot", "lit", "🔥"], reaction: "🔥" },
//     { keywords: ["clap", "congrats", "bravo", "👏"], reaction: "👏" },
//     { keywords: ["party", "celebrate", "🎉"], reaction: "🎉" },
//     { keywords: ["think", "question", "why", "how", "🤔"], reaction: "🤔" }
//   ],
//   botSock: null,
//   isHooked: false
// };

// class AutoReactManager {
//   static initialize(sock) {
//     if (!autoReactConfig.isHooked && sock) {
//       autoReactConfig.botSock = sock;
//       this.hookIntoBot();
//       autoReactConfig.isHooked = true;
//       console.log('🤖 Auto-react system initialized and hooked!');
//     }
//   }

//   static hookIntoBot() {
//     if (!autoReactConfig.botSock || !autoReactConfig.botSock.ev) {
//       console.log('⚠️ Could not hook into bot events for auto-react');
//       return;
//     }

//     // Add reaction handler to messages
//     autoReactConfig.botSock.ev.on('messages.upsert', async (data) => {
//       await this.handleIncomingMessage(data);
//     });
    
//     console.log('✅ Auto-react successfully hooked into message events');
//   }

//   static async handleIncomingMessage(data) {
//     try {
//       if (!data || !data.messages || data.messages.length === 0) return;
      
//       const m = data.messages[0];
//       const sock = autoReactConfig.botSock;
      
//       // Skip if not enabled or if it's from the bot itself
//       if (!m || !m.key || m.key.fromMe || !autoReactConfig.enabled) return;
      
//       // Check if it's a command
//       const messageText = this.extractMessageText(m);
      
//       // Skip if it's a command
//       if (messageText.trim().startsWith('.') || messageText.trim().startsWith('!')) {
//         return;
//       }
      
//       const userJid = m.key.participant || m.key.remoteJid;
//       const chatJid = m.key.remoteJid;
      
//       if (!userJid || !chatJid) return;
      
//       // Check chat filters
//       if (autoReactConfig.excludeChats.has(chatJid)) return;
//       if (autoReactConfig.targetChats.size > 0 && !autoReactConfig.targetChats.has(chatJid)) return;
      
//       // Check cooldown
//       const now = Date.now();
//       const lastReaction = autoReactConfig.userReactions.get(userJid);
//       if (lastReaction && now - lastReaction < autoReactConfig.cooldown) {
//         return;
//       }
      
//       // Check reaction chance
//       if (Math.random() * 100 > autoReactConfig.reactionChance) {
//         return;
//       }
      
//       // Determine which reaction to use
//       let reaction = this.determineReaction(messageText, m);
      
//       if (!reaction) return;
      
//       // Send the reaction
//       await this.sendReaction(sock, chatJid, m.key.id, reaction);
      
//       // Update cooldown
//       autoReactConfig.userReactions.set(userJid, now);
      
//     } catch (err) {
//       console.error("Auto-react handler error:", err);
//     }
//   }

//   static extractMessageText(m) {
//     if (m.message?.conversation) return m.message.conversation;
//     if (m.message?.extendedTextMessage?.text) return m.message.extendedTextMessage.text;
//     if (m.message?.imageMessage?.caption) return m.message.imageMessage.caption;
//     if (m.message?.videoMessage?.caption) return m.message.videoMessage.caption;
//     if (m.message?.documentMessage?.caption) return m.message.documentMessage.caption;
//     return "";
//   }

//   static determineReaction(messageText, m) {
//     let reaction = null;
    
//     // Smart reaction based on content
//     if (autoReactConfig.smartReact && messageText) {
//       const text = messageText.toLowerCase();
      
//       // Check keyword-based reactions
//       for (const rule of autoReactConfig.keywordReactions) {
//         if (rule.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
//           reaction = rule.reaction;
//           break;
//         }
//       }
      
//       // If no keyword match, analyze sentiment
//       if (!reaction) {
//         const sentiment = this.analyzeSentiment(text);
//         const possibleReactions = autoReactConfig.reactionRules[sentiment];
//         if (possibleReactions && possibleReactions.length > 0) {
//           reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
//         }
//       }
//     }
    
//     // Fallback to random reaction from list
//     if (!reaction && autoReactConfig.randomReaction) {
//       reaction = autoReactConfig.reactions[Math.floor(Math.random() * autoReactConfig.reactions.length)];
//     } else if (!reaction && autoReactConfig.reactions.length > 0) {
//       reaction = autoReactConfig.reactions[0]; // Use first reaction if not random
//     }
    
//     return reaction;
//   }

//   static analyzeSentiment(text) {
//     const positiveWords = ['good', 'great', 'awesome', 'nice', 'love', 'happy', 'thanks', 'thank you', 'welcome', 'cool', 'amazing', 'best', 'beautiful', 'perfect'];
//     const negativeWords = ['bad', 'worst', 'hate', 'angry', 'mad', 'sad', 'cry', 'terrible', 'awful', 'dislike'];
//     const funnyWords = ['lol', 'haha', 'funny', 'joke', 'comedy', 'lmao', 'hilarious', 'rofl'];
//     const surprisingWords = ['wow', 'omg', 'unbelievable', 'incredible', 'amazing', 'surprising', 'shocking'];
//     const questionWords = ['?', 'why', 'how', 'what', 'when', 'where', 'who', 'which'];
    
//     let positiveCount = 0;
//     let negativeCount = 0;
//     let funnyCount = 0;
//     let surprisingCount = 0;
//     let questionCount = 0;
    
//     const words = text.split(/\s+/);
    
//     words.forEach(word => {
//       if (positiveWords.includes(word.toLowerCase())) positiveCount++;
//       if (negativeWords.includes(word.toLowerCase())) negativeCount++;
//       if (funnyWords.includes(word.toLowerCase())) funnyCount++;
//       if (surprisingWords.includes(word.toLowerCase())) surprisingCount++;
//       if (questionWords.includes(word.toLowerCase()) || word.includes('?')) questionCount++;
//     });
    
//     // Determine dominant sentiment
//     const scores = {
//       positive: positiveCount,
//       negative: negativeCount,
//       funny: funnyCount,
//       surprising: surprisingCount,
//       questioning: questionCount
//     };
    
//     const maxScore = Math.max(...Object.values(scores));
    
//     if (maxScore === 0) return null;
    
//     // Return sentiment with highest score
//     for (const [sentiment, score] of Object.entries(scores)) {
//       if (score === maxScore) {
//         return sentiment;
//       }
//     }
    
//     return null;
//   }

//   static async sendReaction(sock, chatJid, messageId, reaction) {
//     try {
//       await sock.sendMessage(chatJid, {
//         react: {
//           text: reaction,
//           key: {
//             remoteJid: chatJid,
//             id: messageId
//           }
//         }
//       });
      
//       // Log the reaction (optional)
//       if (process.env.DEBUG) {
//         console.log(`Reacted with ${reaction} to message ${messageId.substring(0, 10)}...`);
//       }
      
//       return true;
//     } catch (err) {
//       console.error("Failed to send reaction:", err);
//       return false;
//     }
//   }

//   static toggle() {
//     autoReactConfig.enabled = !autoReactConfig.enabled;
//     console.log(`Auto-react ${autoReactConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    
//     if (!autoReactConfig.enabled) {
//       this.clearCooldowns();
//     }
    
//     return autoReactConfig.enabled;
//   }

//   static status() {
//     return {
//       enabled: autoReactConfig.enabled,
//       reactions: [...autoReactConfig.reactions],
//       randomReaction: autoReactConfig.randomReaction,
//       reactionChance: autoReactConfig.reactionChance,
//       cooldown: autoReactConfig.cooldown,
//       smartReact: autoReactConfig.smartReact,
//       targetChats: autoReactConfig.targetChats.size,
//       excludeChats: autoReactConfig.excludeChats.size,
//       activeUsers: autoReactConfig.userReactions.size,
//       isHooked: autoReactConfig.isHooked
//     };
//   }

//   static addReaction(reaction) {
//     if (!autoReactConfig.reactions.includes(reaction) && reaction.length <= 2) {
//       autoReactConfig.reactions.push(reaction);
//       return true;
//     }
//     return false;
//   }

//   static removeReaction(reaction) {
//     const index = autoReactConfig.reactions.indexOf(reaction);
//     if (index > -1) {
//       autoReactConfig.reactions.splice(index, 1);
//       return true;
//     }
//     return false;
//   }

//   static setReactions(reactions) {
//     if (Array.isArray(reactions) && reactions.every(r => r.length <= 2)) {
//       autoReactConfig.reactions = [...new Set(reactions)]; // Remove duplicates
//       return true;
//     }
//     return false;
//   }

//   static setChance(percentage) {
//     if (percentage >= 0 && percentage <= 100) {
//       autoReactConfig.reactionChance = percentage;
//       return true;
//     }
//     return false;
//   }

//   static setCooldown(seconds) {
//     const ms = seconds * 1000;
//     if (ms >= 500 && ms <= 60000) { // 0.5s to 60s
//       autoReactConfig.cooldown = ms;
//       return true;
//     }
//     return false;
//   }

//   static toggleRandom() {
//     autoReactConfig.randomReaction = !autoReactConfig.randomReaction;
//     return autoReactConfig.randomReaction;
//   }

//   static toggleSmart() {
//     autoReactConfig.smartReact = !autoReactConfig.smartReact;
//     return autoReactConfig.smartReact;
//   }

//   static addTargetChat(chatJid) {
//     autoReactConfig.targetChats.add(chatJid);
//     return true;
//   }

//   static removeTargetChat(chatJid) {
//     return autoReactConfig.targetChats.delete(chatJid);
//   }

//   static addExcludeChat(chatJid) {
//     autoReactConfig.excludeChats.add(chatJid);
//     return true;
//   }

//   static removeExcludeChat(chatJid) {
//     return autoReactConfig.excludeChats.delete(chatJid);
//   }

//   static clearTargetChats() {
//     autoReactConfig.targetChats.clear();
//   }

//   static clearExcludeChats() {
//     autoReactConfig.excludeChats.clear();
//   }

//   static clearCooldowns() {
//     autoReactConfig.userReactions.clear();
//   }

//   static async manualReact(sock, chatJid, reaction, quotedMsg = null) {
//     try {
//       if (!quotedMsg || !quotedMsg.key || !quotedMsg.key.id) {
//         throw new Error("No message quoted to react to");
//       }
      
//       if (!reaction || reaction.length > 2) {
//         reaction = autoReactConfig.reactions[0] || "👍";
//       }
      
//       const success = await this.sendReaction(sock, chatJid, quotedMsg.key.id, reaction);
      
//       if (success) {
//         // Send confirmation if needed
//         if (quotedMsg) {
//           await sock.sendMessage(chatJid, {
//             text: `✅ Reacted with ${reaction} to the quoted message!`
//           }, { quoted: quotedMsg });
//         }
//       }
      
//       return success;
//     } catch (err) {
//       console.error("Manual react error:", err);
//       throw err;
//     }
//   }

//   static async reactToLastMessage(sock, chatJid, reaction, count = 1) {
//     try {
//       // Get recent messages
//       const messages = await sock.loadMessages(chatJid, count);
      
//       if (!messages || messages.length === 0) {
//         throw new Error("No messages found");
//       }
      
//       const results = [];
      
//       for (const message of messages) {
//         if (message.key.fromMe) continue; // Skip bot's own messages
        
//         const react = reaction || 
//           (autoReactConfig.randomReaction ? 
//             autoReactConfig.reactions[Math.floor(Math.random() * autoReactConfig.reactions.length)] : 
//             autoReactConfig.reactions[0]);
        
//         const success = await this.sendReaction(sock, chatJid, message.key.id, react);
//         results.push({ messageId: message.key.id, reaction: react, success });
        
//         // Small delay between reactions
//         await new Promise(resolve => setTimeout(resolve, 500));
//       }
      
//       return results;
//     } catch (err) {
//       console.error("React to last message error:", err);
//       throw err;
//     }
//   }
// }

// // Main Command Export
// export default {
//   name: "autoreact",
//   alias: ["react", "autoreaction", "reaction", "autoemoji", "emoji"],
//   desc: "Automatically react to messages with emojis 😂",
//   category: "Fun",
//   usage: ".autoreact [on/off/add/remove/list/chance/cooldown/smart/random/target/exclude/react]",
  
//   async execute(sock, m, args) {
//     try {
//       const targetJid = m.key.remoteJid;
      
//       // Initialize on first command use
//       if (!autoReactConfig.isHooked) {
//         autoReactConfig.botSock = sock;
//         AutoReactManager.hookIntoBot();
//         autoReactConfig.isHooked = true;
//         console.log('🤖 Auto-react system initialized!');
//       }
      
//       if (args.length === 0) {
//         // Show status
//         const status = AutoReactManager.status();
//         const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
//         const reactionsList = status.reactions.join(' ');
        
//         await sock.sendMessage(targetJid, {
//           text: `😂 *Auto-React Manager*\n\n${statusText}\n\n📊 *Status:*\n• Auto-React: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}\n• Reactions: ${reactionsList}\n• Smart React: ${status.smartReact ? 'ON 🤖' : 'OFF ⚙️'}\n• Random: ${status.randomReaction ? 'ON 🎲' : 'OFF 📝'}\n• Chance: ${status.reactionChance}%\n• Cooldown: ${status.cooldown / 1000}s\n• Target Chats: ${status.targetChats}\n• Exclude Chats: ${status.excludeChats}\n• Active Users: ${status.activeUsers}\n\n📝 *Commands:*\n.autoreact on - Enable auto-react\n.autoreact off - Disable\n.autoreact add ❤️ - Add reaction\n.autoreact remove 😂 - Remove reaction\n.autoreact list - Show reactions\n.autoreact chance 50 - Set 50% chance\n.autoreact cooldown 5 - 5s cooldown\n.autoreact smart - Toggle smart mode\n.autoreact random - Toggle random\n.autoreact target - Add this chat\n.autoreact exclude - Exclude this chat\n.autoreact react ❤️ - React to quoted\n.autoreact status - Show status`
//         }, { quoted: m });
//         return;
//       }
      
//       const arg = args[0].toLowerCase();
      
//       // Show status
//       if (arg === 'status' || arg === 'info') {
//         const status = AutoReactManager.status();
//         const reactionsList = status.reactions.map(r => `• ${r}`).join('\n');
        
//         await sock.sendMessage(targetJid, {
//           text: `😂 *Auto-React Status*\n\n• Enabled: ${status.enabled ? '✅' : '❌'}\n• Smart Mode: ${status.smartReact ? '✅' : '❌'}\n• Random: ${status.randomReaction ? '✅' : '❌'}\n• Chance: ${status.reactionChance}%\n• Cooldown: ${status.cooldown / 1000}s\n\n🎭 *Reactions:*\n${reactionsList}\n\n📊 *Stats:*\n• Target Chats: ${status.targetChats}\n• Exclude Chats: ${status.excludeChats}\n• Active Users: ${status.activeUsers}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Toggle on/off
//       if (arg === 'on' || arg === 'enable') {
//         const enabled = AutoReactManager.toggle();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Auto-React ${enabled ? 'ENABLED' : 'DISABLED'}*\n\n${enabled ? 'I will now automatically react to messages! 😄' : 'Auto-react has been turned off.'}`
//         }, { quoted: m });
//         return;
//       }
      
//       if (arg === 'off' || arg === 'disable') {
//         const enabled = AutoReactManager.toggle();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Auto-React ${enabled ? 'ENABLED' : 'DISABLED'}*\n\n${enabled ? 'Auto-react has been turned on! 🎭' : 'I will no longer auto-react to messages.'}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Add reaction
//       if (arg === 'add') {
//         const reaction = args[1];
//         if (!reaction) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Missing Reaction*\n\nUse: .autoreact add ❤️\n\nCurrent reactions: ${autoReactConfig.reactions.join(' ')}`
//           }, { quoted: m });
//           return;
//         }
        
//         const success = AutoReactManager.addReaction(reaction);
//         if (success) {
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Reaction Added*\n\nAdded ${reaction} to reaction list!\n\nAll reactions: ${autoReactConfig.reactions.join(' ')}`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Failed to Add*\n\nReaction ${reaction} already exists or is invalid.`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // Remove reaction
//       if (arg === 'remove' || arg === 'delete') {
//         const reaction = args[1];
//         if (!reaction) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Missing Reaction*\n\nUse: .autoreact remove ❤️\n\nCurrent reactions: ${autoReactConfig.reactions.join(' ')}`
//           }, { quoted: m });
//           return;
//         }
        
//         const success = AutoReactManager.removeReaction(reaction);
//         if (success) {
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Reaction Removed*\n\nRemoved ${reaction} from reaction list.\n\nRemaining reactions: ${autoReactConfig.reactions.join(' ') || 'None'}\n\nNote: Auto-react will not work if no reactions are set!`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Not Found*\n\nReaction ${reaction} not found in the list.`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // List reactions
//       if (arg === 'list' || arg === 'reactions') {
//         await sock.sendMessage(targetJid, {
//           text: `🎭 *Available Reactions*\n\n${autoReactConfig.reactions.map(r => `• ${r}`).join('\n') || 'No reactions set!'}\n\nTotal: ${autoReactConfig.reactions.length} reactions`
//         }, { quoted: m });
//         return;
//       }
      
//       // Set chance
//       if (arg === 'chance' || arg === 'probability') {
//         const chance = parseInt(args[1]);
//         if (isNaN(chance)) {
//           await sock.sendMessage(targetJid, {
//             text: `🎲 *Current Chance:* ${autoReactConfig.reactionChance}%\n\nUse: .autoreact chance 75`
//           }, { quoted: m });
//           return;
//         }
        
//         const success = AutoReactManager.setChance(chance);
//         if (success) {
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Chance Updated*\n\nReaction chance set to ${chance}%.\n\nThis means there's a ${chance}% chance I'll react to each eligible message.`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Invalid Chance*\n\nPlease use a number between 0 and 100.`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // Set cooldown
//       if (arg === 'cooldown' || arg === 'cd') {
//         const seconds = parseInt(args[1]);
//         if (isNaN(seconds)) {
//           await sock.sendMessage(targetJid, {
//             text: `⏱️ *Current Cooldown:* ${autoReactConfig.cooldown / 1000}s\n\nUse: .autoreact cooldown 3`
//           }, { quoted: m });
//           return;
//         }
        
//         const success = AutoReactManager.setCooldown(seconds);
//         if (success) {
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Cooldown Updated*\n\nCooldown set to ${seconds} seconds.\n\nI will wait ${seconds}s before reacting to the same user again.`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Invalid Cooldown*\n\nPlease use a number between 0.5 and 60 seconds.`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // Toggle smart mode
//       if (arg === 'smart' || arg === 'ai') {
//         const smartOn = AutoReactManager.toggleSmart();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Smart Mode ${smartOn ? 'ENABLED' : 'DISABLED'}*\n\nSmart reaction analysis is now ${smartOn ? 'ON 🤖' : 'OFF ⚙️'}.\n\n${smartOn ? 'I will analyze message content to choose appropriate reactions!' : 'I will use random/fixed reactions instead.'}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Toggle random
//       if (arg === 'random') {
//         const randomOn = AutoReactManager.toggleRandom();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Random Mode ${randomOn ? 'ENABLED' : 'DISABLED'}*\n\nRandom reaction selection is now ${randomOn ? 'ON 🎲' : 'OFF 📝'}.\n\n${randomOn ? 'I will randomly choose from available reactions!' : 'I will use the first available reaction.'}`
//         }, { quoted: m });
//         return;
//       }
      
//       // Add target chat
//       if (arg === 'target' || arg === 'onlyhere') {
//         const success = AutoReactManager.addTargetChat(targetJid);
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Chat Added to Targets*\n\nAuto-react will now only work in this chat.\n\nUse .autoreact cleartargets to remove restrictions.`
//         }, { quoted: m });
//         return;
//       }
      
//       // Add exclude chat
//       if (arg === 'exclude' || arg === 'ignore') {
//         const success = AutoReactManager.addExcludeChat(targetJid);
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Chat Added to Excludes*\n\nAuto-react will NOT work in this chat.\n\nUse .autoreact clearexcludes to remove.`
//         }, { quoted: m });
//         return;
//       }
      
//       // Clear targets
//       if (arg === 'cleartargets') {
//         AutoReactManager.clearTargetChats();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Target Chats Cleared*\n\nAuto-react can now work in any chat.`
//         }, { quoted: m });
//         return;
//       }
      
//       // Clear excludes
//       if (arg === 'clearexcludes') {
//         AutoReactManager.clearExcludeChats();
//         await sock.sendMessage(targetJid, {
//           text: `✅ *Exclude Chats Cleared*\n\nAuto-react is no longer restricted from any chat.`
//         }, { quoted: m });
//         return;
//       }
      
//       // Manual react to quoted message
//       if (arg === 'react') {
//         if (!m.quoted) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *No Quoted Message*\n\nPlease quote a message to react to!\n\nExample: Reply to a message with .autoreact react ❤️`
//           }, { quoted: m });
//           return;
//         }
        
//         const reaction = args[1] || autoReactConfig.reactions[0];
        
//         try {
//           await AutoReactManager.manualReact(sock, targetJid, reaction, m.quoted);
//         } catch (err) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Failed to React*\n\nError: ${err.message}`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // React to last N messages
//       if (arg === 'reactlast') {
//         const count = parseInt(args[1]) || 1;
//         const reaction = args[2];
        
//         if (count < 1 || count > 10) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Invalid Count*\n\nPlease use a number between 1 and 10.`
//           }, { quoted: m });
//           return;
//         }
        
//         try {
//           const results = await AutoReactManager.reactToLastMessage(sock, targetJid, reaction, count);
//           const successCount = results.filter(r => r.success).length;
          
//           await sock.sendMessage(targetJid, {
//             text: `✅ *Reacted to ${successCount}/${count} Messages*\n\nSuccessfully added reactions to ${successCount} recent messages.`
//           }, { quoted: m });
//         } catch (err) {
//           await sock.sendMessage(targetJid, {
//             text: `❌ *Failed*\n\nError: ${err.message}`
//           }, { quoted: m });
//         }
//         return;
//       }
      
//       // If no valid command, show help
//       await sock.sendMessage(targetJid, {
//         text: `❓ *Invalid Command*\n\nUse:\n• \`.autoreact on\` - Enable auto-react\n• \`.autoreact off\` - Disable\n• \`.autoreact add ❤️\` - Add reaction\n• \`.autoreact remove 😂\` - Remove reaction\n• \`.autoreact chance 50\` - Set 50% chance\n• \`.autoreact cooldown 3\` - 3s cooldown\n• \`.autoreact smart\` - Toggle smart mode\n• \`.autoreact react ❤️\` - React to quoted msg\n• \`.autoreact target\` - Only react here\n• \`.autoreact status\` - Show status`
//       }, { quoted: m });
      
//     } catch (err) {
//       console.error("AutoReact command error:", err);
//       await sock.sendMessage(m.key.remoteJid, {
//         text: `❌ AutoReact command failed: ${err.message}`
//       }, { quoted: m });
//     }
//   }
// };







// commands/owner/autoreact.js

// AutoReact Manager (State Management)
const autoReactConfig = {
  enabled: false,
  emoji: "😂", // Single emoji for reaction
  reactToDMs: true,
  reactToGroups: true,
  reactToCommands: false,
  activeReactions: new Set(), // Track messages we've reacted to
  botSock: null,
  isHooked: false,
  ownerOnly: true,
  allowedUsers: new Set(),
  maxReactionsPerMinute: 30,
  reactionTimestamps: [],
  cooldown: 1000, // 1 second cooldown per user
  userCooldowns: new Map()
};

class AutoReactManager {
  static initialize(sock) {
    if (!autoReactConfig.isHooked && sock) {
      autoReactConfig.botSock = sock;
      this.hookIntoBot();
      autoReactConfig.isHooked = true;
      console.log('😂 Auto-react system initialized!');
    }
  }

  static hookIntoBot() {
    if (!autoReactConfig.botSock || !autoReactConfig.botSock.ev) {
      console.log('⚠️ Could not hook into bot events');
      return;
    }
    
    // Add our handler alongside existing ones
    autoReactConfig.botSock.ev.on('messages.upsert', async (data) => {
      await this.handleIncomingMessage(data);
    });
    
    console.log('✅ Auto-react successfully hooked into message events');
  }

  // Check rate limiting
  static isRateLimited() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old timestamps
    autoReactConfig.reactionTimestamps = autoReactConfig.reactionTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    // Check if we've reached the limit
    if (autoReactConfig.reactionTimestamps.length >= autoReactConfig.maxReactionsPerMinute) {
      return true;
    }
    
    // Add current timestamp
    autoReactConfig.reactionTimestamps.push(now);
    return false;
  }

  // Check user cooldown
  static isUserOnCooldown(userJid) {
    const now = Date.now();
    const lastReaction = autoReactConfig.userCooldowns.get(userJid);
    
    if (!lastReaction) return false;
    
    if (now - lastReaction < autoReactConfig.cooldown) {
      return true;
    }
    
    return false;
  }

  static async handleIncomingMessage(data) {
    try {
      if (!data || !data.messages || data.messages.length === 0) return;
      
      const m = data.messages[0];
      const sock = autoReactConfig.botSock;
      
      // Skip if not enabled or if it's from the bot itself
      if (!m || !m.key || m.key.fromMe || !autoReactConfig.enabled) return;
      
      const userJid = m.key.participant || m.key.remoteJid;
      const chatJid = m.key.remoteJid;
      const messageKey = m.key;
      
      if (!userJid || !chatJid || !messageKey) return;
      
      // Check if we already reacted to this message
      const messageId = `${chatJid}_${messageKey.id}`;
      if (autoReactConfig.activeReactions.has(messageId)) {
        return;
      }
      
      // Check user cooldown
      if (this.isUserOnCooldown(userJid)) {
        return;
      }
      
      // Check if it's a DM or Group
      const isGroup = chatJid.includes('@g.us');
      const isDM = !isGroup;
      
      // Check if we should react based on settings
      if (isDM && !autoReactConfig.reactToDMs) return;
      if (isGroup && !autoReactConfig.reactToGroups) return;
      
      // Check if it's a command
      const messageText = m.message?.conversation || 
                         m.message?.extendedTextMessage?.text || 
                         m.message?.imageMessage?.caption || '';
      
      if (messageText.trim().startsWith('.') && !autoReactConfig.reactToCommands) {
        return;
      }
      
      // Rate limiting check
      if (this.isRateLimited()) {
        console.log('⚠️ Rate limited: Too many reactions per minute');
        return;
      }
      
      // React to the message
      try {
        await sock.sendMessage(chatJid, {
          react: {
            text: autoReactConfig.emoji,
            key: messageKey
          }
        });
        
        // Mark as reacted and update cooldown
        autoReactConfig.activeReactions.add(messageId);
        autoReactConfig.userCooldowns.set(userJid, Date.now());
        
        // Clean up after some time (5 minutes)
        setTimeout(() => {
          autoReactConfig.activeReactions.delete(messageId);
        }, 5 * 60 * 1000);
        
        // Clean old cooldowns periodically
        setTimeout(() => {
          const now = Date.now();
          autoReactConfig.userCooldowns.forEach((timestamp, key) => {
            if (now - timestamp > 60000) { // 1 minute
              autoReactConfig.userCooldowns.delete(key);
            }
          });
        }, 60000);
        
      } catch (err) {
        console.error("Failed to react to message:", err);
      }
      
    } catch (err) {
      console.error("Auto-react handler error:", err);
    }
  }

  // Check if user is authorized to use the command
  static isAuthorized(msg, extra = {}) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    
    // Check if fromMe (bot itself)
    if (msg.key.fromMe) return true;
    
    // Check if owner only mode is enabled
    if (autoReactConfig.ownerOnly) {
      // Use the owner check logic from your mode command
      if (extra.jidManager) {
        return extra.jidManager.isOwner(msg);
      }
      // Fallback to fromMe check if jidManager not available
      return msg.key.fromMe;
    }
    
    // If not owner-only, check allowed users
    if (autoReactConfig.allowedUsers.has(senderJid)) {
      return true;
    }
    
    // Check if it's the owner using the jidManager
    if (extra.jidManager) {
      return extra.jidManager.isOwner(msg);
    }
    
    return false;
  }

  static toggle() {
    autoReactConfig.enabled = !autoReactConfig.enabled;
    console.log(`Auto-react ${autoReactConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
    return autoReactConfig.enabled;
  }

  static status() {
    return {
      enabled: autoReactConfig.enabled,
      emoji: autoReactConfig.emoji,
      reactToDMs: autoReactConfig.reactToDMs,
      reactToGroups: autoReactConfig.reactToGroups,
      reactToCommands: autoReactConfig.reactToCommands,
      ownerOnly: autoReactConfig.ownerOnly,
      isHooked: autoReactConfig.isHooked,
      activeReactions: autoReactConfig.activeReactions.size,
      userCooldowns: autoReactConfig.userCooldowns.size,
      rateLimit: `${autoReactConfig.reactionTimestamps.length}/${autoReactConfig.maxReactionsPerMinute} reactions/min`
    };
  }

  static setEmoji(emoji) {
    // Basic emoji validation
    if (emoji && emoji.length <= 5) {
      autoReactConfig.emoji = emoji;
      return true;
    }
    return false;
  }

  static toggleDMs() {
    autoReactConfig.reactToDMs = !autoReactConfig.reactToDMs;
    return autoReactConfig.reactToDMs;
  }

  static toggleGroups() {
    autoReactConfig.reactToGroups = !autoReactConfig.reactToGroups;
    return autoReactConfig.reactToGroups;
  }

  static toggleCommands() {
    autoReactConfig.reactToCommands = !autoReactConfig.reactToCommands;
    return autoReactConfig.reactToCommands;
  }

  static toggleOwnerOnly() {
    autoReactConfig.ownerOnly = !autoReactConfig.ownerOnly;
    return autoReactConfig.ownerOnly;
  }

  static setBoth() {
    autoReactConfig.reactToDMs = true;
    autoReactConfig.reactToGroups = true;
    return { dms: true, groups: true };
  }

  static setDMsOnly() {
    autoReactConfig.reactToDMs = true;
    autoReactConfig.reactToGroups = false;
    return { dms: true, groups: false };
  }

  static setGroupsOnly() {
    autoReactConfig.reactToDMs = false;
    autoReactConfig.reactToGroups = true;
    return { dms: false, groups: true };
  }

  static addAllowedUser(jid) {
    autoReactConfig.allowedUsers.add(jid);
    return true;
  }

  static removeAllowedUser(jid) {
    autoReactConfig.allowedUsers.delete(jid);
    return true;
  }

  static getAllowedUsers() {
    return Array.from(autoReactConfig.allowedUsers);
  }

  static clearAllReactions() {
    autoReactConfig.activeReactions.clear();
    autoReactConfig.userCooldowns.clear();
  }

  // Manual reaction to a specific message
  static async manualReact(sock, chatJid, emoji, messageKey) {
    try {
      await sock.sendMessage(chatJid, {
        react: {
          text: emoji || autoReactConfig.emoji,
          key: messageKey
        }
      });
      return true;
    } catch (err) {
      console.error("Manual reaction error:", err);
      return false;
    }
  }

  // React to quoted message
  static async reactToQuoted(sock, chatJid, quotedMsg, emoji) {
    if (!quotedMsg || !quotedMsg.key) {
      throw new Error("No quoted message found");
    }
    
    try {
      await sock.sendMessage(chatJid, {
        react: {
          text: emoji || autoReactConfig.emoji,
          key: quotedMsg.key
        }
      });
      return true;
    } catch (err) {
      console.error("React to quoted error:", err);
      throw err;
    }
  }
}

// Main Command Export
export default {
  name: "autoreact",
  alias: ["autoreaction", "reactauto", "autoemoji", "react"],
  desc: "Auto-react to messages with emojis 😂",
  category: "Owner",
  usage: ".autoreact [on/off/set/dms/groups/both/status/mode/users]",
  
  async execute(sock, m, args, PREFIX, extra) {
    try {
      const targetJid = m.key.remoteJid;
      const isGroup = targetJid.includes('@g.us');
      
      // Initialize on first command use
      if (!autoReactConfig.isHooked) {
        autoReactConfig.botSock = sock;
        AutoReactManager.hookIntoBot();
        autoReactConfig.isHooked = true;
        console.log('😂 Auto-react system initialized!');
      }
      
      // ==================== OWNER CHECK ====================
      const isAuthorized = AutoReactManager.isAuthorized(m, extra);
      
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
        
        // if (autoReactConfig.ownerOnly) {
        //   errorMsg += `\n⚙️ *Note:* Command is in owner-only mode\n`;
        //   errorMsg += `Use \`${PREFIX}autoreact mode public\` to allow others\n`;
        // }
        
        return sock.sendMessage(targetJid, {
          text: errorMsg
        }, { quoted: m });
      }
      // ==================== END OWNER CHECK ====================
      
      if (args.length === 0) {
        // Show status
        const status = AutoReactManager.status();
        const statusText = status.enabled ? "✅ *ENABLED*" : "❌ *DISABLED*";
        const modeText = status.ownerOnly ? "🔒 *Owner Only*" : "🌍 *Public*";
        const dmStatus = status.reactToDMs ? "✅ DMs" : "❌ DMs";
        const groupStatus = status.reactToGroups ? "✅ Groups" : "❌ Groups";
        const cmdStatus = status.reactToCommands ? "✅ Commands" : "❌ Commands";
        
        await sock.sendMessage(targetJid, {
          text: `😂 *Auto-React Manager*

${statusText}

📊 *Status:*
• Auto-React: ${status.enabled ? 'ON 🟢' : 'OFF 🔴'}
• Emoji: ${status.emoji}
• React to: ${dmStatus} | ${groupStatus} | ${cmdStatus}

🔧 *Quick Commands:*
• \`${PREFIX}autoreact on\`
• \`${PREFIX}autoreact off\`   
• \`${PREFIX}autoreact set <emoji>\` 
• \`${PREFIX}autoreact dmsonly\` 
• \`${PREFIX}autoreact groupsonly\`
• \`${PREFIX}autoreact both\` `
        }, { quoted: m });
        return;
      }
      
      const arg = args[0].toLowerCase();
      
      // Show detailed status
      if (arg === 'status' || arg === 'info') {
        const status = AutoReactManager.status();
        const allowedUsers = AutoReactManager.getAllowedUsers();
        
        let statusMsg = `😂 *Auto-React Status* (Owner View)\n\n`;
        statusMsg += `📊 *System Status:*\n`;
        statusMsg += `├─ Enabled: ${status.enabled ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ Current Emoji: ${status.emoji}\n`;
        statusMsg += `├─ React to DMs: ${status.reactToDMs ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ React to Groups: ${status.reactToGroups ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ React to Commands: ${status.reactToCommands ? '✅ YES' : '❌ NO'}\n`;
        statusMsg += `├─ Mode: ${status.ownerOnly ? '🔒 Owner Only' : '🌍 Public'}\n`;
        statusMsg += `├─ Active Reactions: ${status.activeReactions}\n`;
        statusMsg += `├─ Rate Limit: ${status.rateLimit}\n`;
        statusMsg += `├─ User Cooldowns: ${status.userCooldowns}\n`;
        statusMsg += `└─ Hooked: ${status.isHooked ? '✅' : '❌'}\n\n`;
        
        if (allowedUsers.length > 0 && !status.ownerOnly) {
          statusMsg += `👥 *Allowed Users:*\n`;
          allowedUsers.forEach((user, index) => {
            statusMsg += `${index + 1}. ${user}\n`;
          });
          statusMsg += `\n`;
        }
        
        statusMsg += `💡 *Popular Emojis:*\n`;
        statusMsg += `😂 😍 😊 👍 😎 😢 😡 🎉 🚀 💯\n`;
        statusMsg += `❤️ 🥰 🤣 😘 👏 🙏 ✨ 💪 😁\n\n`;
        statusMsg += `Use \`${PREFIX}autoreact set <emoji>\` to change`;
        
        return sock.sendMessage(targetJid, {
          text: statusMsg
        }, { quoted: m });
      }
      
      // Toggle on/off
      if (arg === 'on' || arg === 'enable' || arg === 'start') {
        const enabled = AutoReactManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `😂 *Auto-React ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'I will now automatically react to messages! ✨' : 'Auto-react has been turned off.'}

⚙️ *Current Settings:*
• Emoji: ${AutoReactManager.status().emoji}
• DMs: ${AutoReactManager.status().reactToDMs ? '✅ ON' : '❌ OFF'}
• Groups: ${AutoReactManager.status().reactToGroups ? '✅ ON' : '❌ OFF'}
• Commands: ${AutoReactManager.status().reactToCommands ? '✅ ON' : '❌ OFF'}`
        }, { quoted: m });
        return;
      }
      
      if (arg === 'off' || arg === 'disable' || arg === 'stop') {
        const enabled = AutoReactManager.toggle();
        await sock.sendMessage(targetJid, {
          text: `😂 *Auto-React ${enabled ? 'ENABLED' : 'DISABLED'}*

${enabled ? 'Auto-react has been turned on! ✨' : 'I will no longer auto-react to messages.'}`
        }, { quoted: m });
        return;
      }
      
      // Set emoji
      if (arg === 'set' || arg === 'emoji') {
        if (!args[1]) {
          return sock.sendMessage(targetJid, {
            text: `❌ *Missing Emoji*\n\nUsage: ${PREFIX}autoreact set <emoji>\n\nExample: ${PREFIX}autoreact set 😍\n\n💡 *Popular Emojis:*\n😂 😍 👍 🎉 ❤️ 🥰 👏 💯`
          }, { quoted: m });
        }
        
        const emoji = args[1];
        const success = AutoReactManager.setEmoji(emoji);
        
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Emoji Updated*\n\nNew reaction emoji: ${emoji}\n\nI will now react with ${emoji} to messages!`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Invalid Emoji*\n\nPlease use a valid single emoji.\n\nExamples: 😂, ❤️, 👍, 🎉\n\nNote: Some custom emojis may not work.`
          }, { quoted: m });
        }
        return;
      }
      
      // Toggle DMs
      if (arg === 'dms' || arg === 'dm') {
        const dmsEnabled = AutoReactManager.toggleDMs();
        await sock.sendMessage(targetJid, {
          text: `💬 *DM Reactions ${dmsEnabled ? 'ENABLED' : 'DISABLED'}*

${dmsEnabled ? 'I will now react to messages in DMs! 💬' : 'I will no longer react to messages in DMs.'}

📊 *Current Settings:*
• DMs: ${dmsEnabled ? '✅ ON' : '❌ OFF'}
• Groups: ${AutoReactManager.status().reactToGroups ? '✅ ON' : '❌ OFF'}
• Both: ${dmsEnabled && AutoReactManager.status().reactToGroups ? '✅ YES' : '❌ NO'}`
        }, { quoted: m });
        return;
      }
      
      // Toggle groups
      if (arg === 'groups' || arg === 'group') {
        const groupsEnabled = AutoReactManager.toggleGroups();
        await sock.sendMessage(targetJid, {
          text: `👥 *Group Reactions ${groupsEnabled ? 'ENABLED' : 'DISABLED'}*

${groupsEnabled ? 'I will now react to messages in groups! 👥' : 'I will no longer react to messages in groups.'}

📊 *Current Settings:*
• DMs: ${AutoReactManager.status().reactToDMs ? '✅ ON' : '❌ OFF'}
• Groups: ${groupsEnabled ? '✅ ON' : '❌ OFF'}
• Both: ${AutoReactManager.status().reactToDMs && groupsEnabled ? '✅ YES' : '❌ NO'}`
        }, { quoted: m });
        return;
      }
      
      // Set both DMs and groups
      if (arg === 'both' || arg === 'all') {
        const both = AutoReactManager.setBoth();
        await sock.sendMessage(targetJid, {
          text: `✅ *Both DMs & Groups Enabled*

I will now react to messages in both DMs and groups! 🎉

📊 *Current Settings:*
• DMs: ✅ ON
• Groups: ✅ ON
• Commands: ${AutoReactManager.status().reactToCommands ? '✅ ON' : '❌ OFF'}

Use \`${PREFIX}autoreact dms\` or \`${PREFIX}autoreact groups\` to toggle individually.`
        }, { quoted: m });
        return;
      }
      
      // Set DMs only
      if (arg === 'dmsonly' || arg === 'onlydms') {
        const settings = AutoReactManager.setDMsOnly();
        await sock.sendMessage(targetJid, {
          text: `✅ *DMs Only Mode*

I will now react ONLY to messages in DMs (not groups)! 💬

📊 *Current Settings:*
• DMs: ✅ ON
• Groups: ❌ OFF
• Commands: ${AutoReactManager.status().reactToCommands ? '✅ ON' : '❌ OFF'}`
        }, { quoted: m });
        return;
      }
      
      // Set groups only
      if (arg === 'groupsonly' || arg === 'onlygroups') {
        const settings = AutoReactManager.setGroupsOnly();
        await sock.sendMessage(targetJid, {
          text: `✅ *Groups Only Mode*

I will now react ONLY to messages in groups (not DMs)! 👥

📊 *Current Settings:*
• DMs: ❌ OFF
• Groups: ✅ ON
• Commands: ${AutoReactManager.status().reactToCommands ? '✅ ON' : '❌ OFF'}`
        }, { quoted: m });
        return;
      }
      
      // Toggle command reactions
      if (arg === 'commands' || arg === 'cmds' || arg === 'cmd') {
        const commandsEnabled = AutoReactManager.toggleCommands();
        await sock.sendMessage(targetJid, {
          text: `⌨️ *Command Reactions ${commandsEnabled ? 'ENABLED' : 'DISABLED'}*

${commandsEnabled ? 'I will now react to command messages too! ⌨️' : 'I will skip reacting to command messages.'}

⚠️ *Note:* Reacting to commands may cause confusion as users might think the command worked when it's just a reaction.`
        }, { quoted: m });
        return;
      }
      
      // Mode toggle (owner-only vs public)
      if (arg === 'mode' || arg === 'togglemode') {
        const ownerOnly = AutoReactManager.toggleOwnerOnly();
        await sock.sendMessage(targetJid, {
          text: `🔧 *React Mode Changed*

Mode: ${ownerOnly ? '🔒 *OWNER ONLY*' : '🌍 *PUBLIC*'}

${ownerOnly ? 
  'Only you (owner) can control auto-react now.' : 
  'Anyone can use auto-react commands now.\n\n⚠️ *Warning:* Public mode may allow others to change settings.'
}

⚙️ To add specific allowed users:
• \`${PREFIX}autoreact users add @user\`
• \`${PREFIX}autoreact users list\``
        }, { quoted: m });
        return;
      }
      
      // User management
      if (arg === 'users' || arg === 'user' || arg === 'allow') {
        const subCmd = args[1]?.toLowerCase();
        
        if (!subCmd || subCmd === 'list') {
          const allowedUsers = AutoReactManager.getAllowedUsers();
          let userList = `👥 *Allowed Users* (${allowedUsers.length})\n\n`;
          
          if (allowedUsers.length === 0) {
            userList += `No users added yet.\n`;
          } else {
            allowedUsers.forEach((user, index) => {
              userList += `${index + 1}. ${user}\n`;
            });
          }
          
          userList += `\n🔧 *Commands:*\n`;
          userList += `• \`${PREFIX}autoreact users add @user\`\n`;
          userList += `• \`${PREFIX}autoreact users remove @user\`\n`;
          userList += `• \`${PREFIX}autoreact users clear\`\n`;
          
          return sock.sendMessage(targetJid, {
            text: userList
          }, { quoted: m });
        }
        
        if (subCmd === 'add' && args[2]) {
          const userToAdd = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoReactManager.addAllowedUser(userToAdd);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Added*\n\nAdded ${userToAdd} to allowed users list.\n\nThey can now use auto-react commands.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'remove' && args[2]) {
          const userToRemove = args[2].replace('@', '') + '@s.whatsapp.net';
          AutoReactManager.removeAllowedUser(userToRemove);
          
          await sock.sendMessage(targetJid, {
            text: `✅ *User Removed*\n\nRemoved ${userToRemove} from allowed users list.`
          }, { quoted: m });
          return;
        }
        
        if (subCmd === 'clear') {
          autoReactConfig.allowedUsers.clear();
          
          await sock.sendMessage(targetJid, {
            text: `✅ *Users Cleared*\n\nAll allowed users have been removed.`
          }, { quoted: m });
          return;
        }
        
        // Invalid user command
        await sock.sendMessage(targetJid, {
          text: `❓ *Invalid User Command*\n\nUsage:\n• \`${PREFIX}autoreact users list\`\n• \`${PREFIX}autoreact users add @user\`\n• \`${PREFIX}autoreact users remove @user\`\n• \`${PREFIX}autoreact users clear\``
        }, { quoted: m });
        return;
      }
      
      // Manual reaction to quoted message
      if ((arg === 'react' || arg === 'manual') && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo;
        const emoji = args[1] || autoReactConfig.emoji;
        
        const success = await AutoReactManager.manualReact(sock, targetJid, emoji, {
          remoteJid: targetJid,
          fromMe: false,
          id: quotedMsg.stanzaId,
          participant: quotedMsg.participant
        });
        
        if (success) {
          await sock.sendMessage(targetJid, {
            text: `✅ *Reaction Sent*\n\nReacted with ${emoji} to the quoted message!`
          }, { quoted: m });
        } else {
          await sock.sendMessage(targetJid, {
            text: `❌ *Failed to React*\n\nCould not react to the quoted message.`
          }, { quoted: m });
        }
        return;
      }
      
      // Clear all active reactions
      if (arg === 'clear' || arg === 'reset') {
        AutoReactManager.clearAllReactions();
        await sock.sendMessage(targetJid, {
          text: `✅ *All Reactions Cleared*\n\nCleared all active reaction tracking and user cooldowns.`
        }, { quoted: m });
        return;
      }
      
      // If no valid command, show help
      await sock.sendMessage(targetJid, {
        text: `😂 *Auto-React Owner Commands:*

🔧 *Basic Control:*
• \`${PREFIX}autoreact on\` - Enable auto-react
• \`${PREFIX}autoreact off\` - Disable auto-react
• \`${PREFIX}autoreact set 😍\` - Set reaction emoji

🎯 *Target Control:*
• \`${PREFIX}autoreact dms\` - Toggle DM reactions
• \`${PREFIX}autoreact groups\` - Toggle group reactions  
• \`${PREFIX}autoreact both\` - React to both DMs & groups
• \`${PREFIX}autoreact dmsonly\` - React only in DMs
• \`${PREFIX}autoreact groupsonly\` - React only in groups
• \`${PREFIX}autoreact commands\` - Toggle command reactions

🔒 *Access Control:*
• \`${PREFIX}autoreact mode\` - Toggle owner-only/public mode
• \`${PREFIX}autoreact users\` - Manage allowed users

📊 *Info & Tools:*
• \`${PREFIX}autoreact\` - Show status
• \`${PREFIX}autoreact status\` - Detailed status
• \`${PREFIX}autoreact clear\` - Clear reaction tracking

🎭 *Manual Reaction:*
• Reply to a message with: \`${PREFIX}autoreact react 😂\`

⚠️ *Rate Limit:* ${autoReactConfig.maxReactionsPerMinute} reactions per minute`
      }, { quoted: m });
      
    } catch (err) {
      console.error("AutoReact command error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ AutoReact command failed: ${err.message}`
      }, { quoted: m });
    }
  }
};