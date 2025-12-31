import axios from 'axios';

export default {
  name: 'grouplink',
  description: 'Get group invite link with thumbnail',
  category: 'group',

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const prefix = '#';
    
    // Check if it's a group
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, { 
        text: `❌ This command only works in groups\n\nUse: \`${prefix}grouplink\` in a group` 
      }, { quoted: m });
      return;
    }

    try {
      await sock.sendMessage(jid, { 
        text: `🔗 *Getting group link...*` 
      }, { quoted: m });

      // Get group info
      const groupInfo = await sock.groupMetadata(jid);
      const groupName = groupInfo.subject || 'Group';
      const members = groupInfo.participants?.length || 0;

      // Generate invite code
      let inviteCode;
      try {
        inviteCode = await sock.groupInviteCode(jid);
      } catch (error) {
        // Try to revoke and create new
        await sock.groupRevokeInvite(jid);
        await new Promise(resolve => setTimeout(resolve, 1000));
        inviteCode = await sock.groupInviteCode(jid);
      }

      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      
      // Try to get group profile picture
      let profilePic = null;
      try {
        const profileUrl = await sock.profilePictureUrl(jid, 'image');
        if (profileUrl) {
          const response = await axios.get(profileUrl, {
            responseType: 'arraybuffer',
            timeout: 5000
          });
          profilePic = Buffer.from(response.data);
        }
      } catch (picError) {
        console.log('No profile picture found');
      }

      // Create message
      const messageText = 
        `🔗 *${groupName}*\n\n` +
        `👥 Members: ${members}\n` +
        `🔗 Link: ${inviteLink}\n\n` +
        `📌 *How to join:*\n` +
        `1. Tap the link above\n` +
        `2. Open in WhatsApp\n` +
        `3. Tap "Join Group"`;

      // Send with or without thumbnail
      if (profilePic) {
        await sock.sendMessage(jid, {
          image: profilePic,
          caption: messageText
        }, { quoted: m });
      } else {
        await sock.sendMessage(jid, {
          text: messageText
        }, { quoted: m });
      }

      console.log(`✅ Group link sent for: ${groupName}`);

    } catch (error) {
      console.error('❌ Error:', error);
      
      let errorMsg = `❌ *Failed to get group link*\n`;
      
      if (error.message.includes('admin')) {
        errorMsg += `\nBot needs admin permissions\nMake me admin and try again`;
      } else {
        errorMsg += `\nError: ${error.message}`;
      }
      
      await sock.sendMessage(jid, { 
        text: errorMsg 
      }, { quoted: m });
    }
  }
};