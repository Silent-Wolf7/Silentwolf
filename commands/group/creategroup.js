import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "creategroup",
  description: "Create WhatsApp groups automatically",
  category: "owner",
  ownerOnly: true,
  aliases: ["cg", "makegroup", "newgroup"],
  usage: "<name> [participants...]",
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const { jidManager } = extra;
    const senderJid = m.key.participant || jid;
    
    // ====== OWNER CHECK ======
    const isOwner = jidManager.isOwner(m);
    if (!isOwner) {
      const cleaned = jidManager.cleanJid(senderJid);
      let errorMsg = `❌ *Owner Only Command!*\n\n`;
      errorMsg += `Only the bot owner can create groups.\n\n`;
      errorMsg += `🔍 *Debug Info:*\n`;
      errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
      errorMsg += `├─ Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
      errorMsg += `└─ From Me: ${m.key.fromMe ? '✅ YES' : '❌ NO'}\n`;
      
      return sock.sendMessage(jid, { text: errorMsg }, { quoted: m });
    }

    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === "help") {
      const helpText = `👥 *CREATE GROUP COMMAND*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}creategroup GroupName\`\n` +
        `• \`${PREFIX}creategroup "Group Name"\`\n` +
        `• \`${PREFIX}creategroup GroupName 1234567890 9876543210\`\n` +
        `• \`${PREFIX}creategroup Family 1234567890 -d "Family group chat"\`\n\n` +
        
        `⚙️ *Options:*\n` +
        `• \`-d "description"\` - Set group description\n` +
        `• \`-a\` - Make announcements only (admins can post)\n` +
        `• \`-r\` - Restrict (only admins can change settings)\n\n` +
        
        `📋 *Requirements:*\n` +
        `• Group name: 1-25 characters\n` +
        `• Participants: Must be WhatsApp numbers\n` +
        `• Numbers: Include country code (e.g., 254...)\n` +
        `• Bot: Must be in participants' contacts\n\n` +
        
        `🔧 *Aliases:* ${PREFIX}cg, ${PREFIX}makegroup, ${PREFIX}newgroup\n\n` +
        
        `💡 *Examples:*\n` +
        `\`${PREFIX}cg MyGroup\`\n` +
        `\`${PREFIX}cg "Office Team" 254712345678 254798765432\`\n` +
        `\`${PREFIX}cg Family 254712345678 -d "Our family chat group"\``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== INITIAL STATUS ======
    const statusMsg = await sock.sendMessage(jid, { 
      text: "🔄 *Initializing group creation...*" 
    }, { quoted: m });

    try {
      // ====== PARSE ARGUMENTS ======
      let groupName = "";
      const participants = [];
      let description = "";
      let announcementsOnly = false;
      let restrict = false;
      
      let i = 0;
      let collectingName = true;
      
      while (i < args.length) {
        const arg = args[i];
        
        // Check for flags
        if (arg === '-d' && i + 1 < args.length) {
          description = args[i + 1].replace(/"/g, '');
          i += 2;
          continue;
        }
        
        if (arg === '-a') {
          announcementsOnly = true;
          i++;
          continue;
        }
        
        if (arg === '-r') {
          restrict = true;
          i++;
          continue;
        }
        
        // Handle quoted group names
        if (collectingName && (arg.startsWith('"') || groupName.includes('"'))) {
          groupName += (groupName ? ' ' : '') + arg;
          
          // Check if name is complete (closing quote)
          if (arg.endsWith('"') || groupName.replace(/"/g, '').split(' ').length > 3) {
            collectingName = false;
            groupName = groupName.replace(/"/g, '').trim();
          }
          i++;
          continue;
        }
        
        // Regular parsing
        if (collectingName) {
          // Check if this looks like a phone number
          const isPhoneNumber = /^[\d+]{8,}$/.test(arg.replace(/[-()\s]/g, ''));
          
          if (isPhoneNumber && groupName) {
            // This is a phone number, stop collecting name
            collectingName = false;
            participants.push(arg);
          } else if (!groupName || !isPhoneNumber) {
            // Still collecting name
            groupName += (groupName ? ' ' : '') + arg;
          } else {
            // First argument is phone number? Use default name
            groupName = "New Group";
            participants.push(arg);
            collectingName = false;
          }
        } else {
          // Collecting participants
          participants.push(arg);
        }
        
        i++;
      }
      
      // If no name collected, use default
      if (!groupName || groupName.trim() === "") {
        groupName = "WolfBot Group";
      }

      // ====== VALIDATION ======
      groupName = groupName.trim();
      
      // Name length validation
      if (groupName.length > 25) {
        await sock.sendMessage(jid, { 
          text: `❌ *Group Name Too Long!*\n\n` +
                `Maximum 25 characters allowed.\n` +
                `Current: ${groupName.length} characters\n\n` +
                `💡 *Tip:* Use shorter name or abbreviation`,
          edit: statusMsg.key 
        });
        return;
      }
      
      if (groupName.length < 1) {
        await sock.sendMessage(jid, { 
          text: "❌ *Invalid Group Name!*\n\nPlease provide a valid group name.",
          edit: statusMsg.key 
        });
        return;
      }

      // ====== PREPARE PARTICIPANTS ======
      await sock.sendMessage(jid, { 
        text: `🔄 *Initializing group creation...* ✅\n👥 *Processing participants...*`,
        edit: statusMsg.key 
      });

      const validParticipants = [];
      const invalidParticipants = [];
      
      // Add command sender
      if (!validParticipants.includes(senderJid)) {
        validParticipants.push(senderJid);
      }
      
      // Add bot
      const botJid = sock.user?.id || sock.userID;
      if (botJid && !validParticipants.includes(botJid)) {
        validParticipants.push(botJid);
      }
      
      // Process provided participants
      for (const p of participants) {
        try {
          // Clean the JID
          const cleaned = jidManager.cleanJid(p);
          
          if (cleaned.isValidNumber && cleaned.cleanJid) {
            const participantJid = cleaned.cleanJid.includes('@') ? 
              cleaned.cleanJid : cleaned.cleanJid + '@s.whatsapp.net';
            
            if (!validParticipants.includes(participantJid)) {
              validParticipants.push(participantJid);
            }
          } else {
            invalidParticipants.push(p);
          }
        } catch (e) {
          invalidParticipants.push(p);
        }
      }
      
      // Check minimum participants (WhatsApp requires at least 3 including bot)
      if (validParticipants.length < 3) {
        await sock.sendMessage(jid, { 
          text: `❌ *Not Enough Participants!*\n\n` +
                `WhatsApp requires at least 3 participants (including you and bot).\n` +
                `Current: ${validParticipants.length} participants\n\n` +
                `💡 *Tip:* Add more numbers like:\n` +
                `\`${PREFIX}cg "${groupName}" 254712345678 254798765432\``,
          edit: statusMsg.key 
        });
        return;
      }

      // ====== CREATE GROUP ======
      console.log(`👥 Attempting to create group: "${groupName}" with ${validParticipants.length} participants`);
      
      await sock.sendMessage(jid, { 
        text: `🔄 *Initializing group creation...* ✅\n👥 *Processing participants...* ✅\n🚀 *Creating group...*`,
        edit: statusMsg.key 
      });

      // FIX: WhatsApp requires unique participants list
      const uniqueParticipants = [...new Set(validParticipants)];
      
      try {
        const group = await sock.groupCreate(groupName, uniqueParticipants);
        
        if (!group || !group.gid) {
          throw new Error("Failed to create group - invalid response");
        }
        
        const groupJid = group.gid;
        console.log(`✅ Group created: ${groupJid}`);

        // ====== CONFIGURE GROUP ======
        await sock.sendMessage(jid, { 
          text: `🔄 *Initializing group creation...* ✅\n👥 *Processing participants...* ✅\n🚀 *Creating group...* ✅\n⚙️ *Configuring group...*`,
          edit: statusMsg.key 
        });

        // 1. Make bot admin
        try {
          await sock.groupParticipantsUpdate(groupJid, [botJid], "promote");
          console.log(`✅ Bot promoted to admin`);
        } catch (adminError) {
          console.log(`⚠️ Could not promote bot: ${adminError.message}`);
        }

        // 2. Set description if provided
        if (description) {
          try {
            await sock.groupUpdateDescription(groupJid, description);
            console.log(`✅ Description set: ${description.substring(0, 30)}...`);
          } catch (descError) {
            console.log(`⚠️ Could not set description: ${descError.message}`);
          }
        }

        // 3. Configure group settings
        try {
          if (announcementsOnly) {
            await sock.groupSettingUpdate(groupJid, 'announcement');
          } else {
            await sock.groupSettingUpdate(groupJid, 'not_announcement');
          }
          
          if (restrict) {
            await sock.groupSettingUpdate(groupJid, 'locked');
          } else {
            await sock.groupSettingUpdate(groupJid, 'unlocked');
          }
        } catch (settingsError) {
          console.log(`⚠️ Could not update settings: ${settingsError.message}`);
        }

        // ====== SEND WELCOME MESSAGES ======
        // Welcome in new group
        const welcomeText = `👋 *Welcome to ${groupName}!*\n\n` +
          `This group was created using WolfBot.\n\n` +
          `📌 *Commands:* Use ${PREFIX}help\n` +
          `👤 *Created by:* ${senderJid.split('@')[0]}\n` +
          `🤖 *Bot Prefix:* ${PREFIX}\n\n` +
          `✨ Enjoy your group!`;
        
        await sock.sendMessage(groupJid, { text: welcomeText });

        // ====== PREPARE SUCCESS MESSAGE ======
        await sock.sendMessage(jid, { 
          text: `🔄 *Initializing group creation...* ✅\n👥 *Processing participants...* ✅\n🚀 *Creating group...* ✅\n⚙️ *Configuring group...* ✅\n✅ *Group Created Successfully!*`,
          edit: statusMsg.key 
        });

        // Get invite link
        let inviteLink = "Not available";
        try {
          const inviteCode = await sock.groupInviteCode(groupJid);
          if (inviteCode) {
            inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
          }
        } catch (inviteError) {
          console.log(`⚠️ Could not get invite link: ${inviteError.message}`);
        }

        // Build success message
        let successMsg = `✅ *GROUP CREATED SUCCESSFULLY!*\n\n` +
          `📛 *Name:* ${groupName}\n` +
          `🔗 *Group ID:* ${groupJid}\n` +
          `👥 *Total Members:* ${uniqueParticipants.length}\n` +
          `🤖 *Bot Status:* Admin ✅\n`;
        
        if (description) {
          successMsg += `📝 *Description:* ${description}\n`;
        }
        
        successMsg += `🔐 *Settings:* `;
        successMsg += announcementsOnly ? 'Announcements Only ' : '';
        successMsg += restrict ? 'Restricted ' : '';
        successMsg += !announcementsOnly && !restrict ? 'Normal' : '';
        successMsg += `\n`;
        
        if (uniqueParticipants.length > 0) {
          successMsg += `\n📋 *Participants Added:*\n`;
          const maxToShow = 8;
          const toShow = uniqueParticipants.slice(0, maxToShow);
          
          toShow.forEach((p, idx) => {
            const num = p.split('@')[0];
            const isYou = p === senderJid ? ' 👤' : p === botJid ? ' 🤖' : '';
            successMsg += `├─ ${idx + 1}. ${num}${isYou}\n`;
          });
          
          if (uniqueParticipants.length > maxToShow) {
            successMsg += `└─ ...and ${uniqueParticipants.length - maxToShow} more\n`;
          }
        }
        
        if (invalidParticipants.length > 0) {
          successMsg += `\n⚠️ *Invalid (Not Added):*\n`;
          invalidParticipants.slice(0, 5).forEach((p, idx) => {
            successMsg += `├─ ${p}\n`;
          });
          if (invalidParticipants.length > 5) {
            successMsg += `└─ ...${invalidParticipants.length - 5} more\n`;
          }
          successMsg += `💡 *Tip:* Use format: 254712345678 (with country code)\n`;
        }
        
        successMsg += `\n🔗 *Invite Link:* ${inviteLink}\n\n` +
          `📌 *Quick Commands:*\n` +
          `• ${PREFIX}gcinfo - Group info\n` +
          `• ${PREFIX}invite - Get invite link\n` +
          `• ${PREFIX}tagall - Mention everyone\n`;

        // Send final success message
        await sock.sendMessage(jid, { text: successMsg });

        // ====== LOG TO FILE ======
        try {
          const logDir = path.join(__dirname, "../../logs");
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          
          const logFile = path.join(logDir, "groups.json");
          let groups = [];
          
          if (fs.existsSync(logFile)) {
            groups = JSON.parse(fs.readFileSync(logFile, 'utf8'));
          }
          
          groups.push({
            id: groupJid,
            name: groupName,
            createdBy: senderJid.split('@')[0],
            created: new Date().toISOString(),
            members: uniqueParticipants.length,
            invite: inviteLink
          });
          
          fs.writeFileSync(logFile, JSON.stringify(groups, null, 2));
          console.log(`📝 Logged to ${logFile}`);
        } catch (logError) {
          console.log(`⚠️ Could not log: ${logError.message}`);
        }

      } catch (createError) {
        console.error("❌ Group creation failed:", createError);
        
        // Handle specific WhatsApp errors
        let errorMsg = `❌ *FAILED TO CREATE GROUP*\n\n`;
        
        if (createError.message.includes("bad-request") || createError.data === 400) {
          errorMsg += `• *Invalid request format*\n`;
          errorMsg += `• WhatsApp rejected the creation request\n\n`;
          errorMsg += `🔧 *Possible Solutions:*\n`;
          errorMsg += `1. Check participant numbers are valid\n`;
          errorMsg += `2. Ensure bot is authorized\n`;
          errorMsg += `3. Try with fewer participants\n`;
          errorMsg += `4. Wait a few minutes and retry\n`;
        } else if (createError.message.includes("401") || createError.message.includes("unauthorized")) {
          errorMsg += `• *Not Authorized*\n`;
          errorMsg += `• Bot may need phone verification\n`;
        } else if (createError.message.includes("429") || createError.message.includes("rate limit")) {
          errorMsg += `• *Rate Limited*\n`;
          errorMsg += `• Too many requests\n`;
          errorMsg += `• Wait 1-2 minutes\n`;
        } else if (createError.message.includes("participant")) {
          errorMsg += `• *Invalid Participants*\n`;
          errorMsg += `• Check phone numbers format\n`;
          errorMsg += `• Example: 254712345678\n`;
        } else {
          errorMsg += `• Error: ${createError.message}\n`;
        }
        
        errorMsg += `\n💡 *Try this format:*\n`;
        errorMsg += `\`${PREFIX}cg "Test Group" 254712345678 254798765432\``;
        
        throw new Error(errorMsg);
      }

    } catch (error) {
      console.error("❌ [CREATEGROUP] ERROR:", error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: error.message || "❌ Unknown error occurred",
          edit: statusMsg.key 
        });
      } else {
        await sock.sendMessage(jid, { 
          text: error.message || "❌ Unknown error occurred" 
        }, { quoted: m });
      }
    }
  },
};