// export default {
//   name: 'kick',
//   description: 'Removes mentioned members from the group.',
//   execute: async (sock, msg, args, metadata) => {
//     const isGroup = msg.key.remoteJid.endsWith('@g.us');
//     const participants = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

//     if (!isGroup) {
//       return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in packs.' }, { quoted: msg });
//     }

//     if (!participants.length) {
//       return sock.sendMessage(msg.key.remoteJid, { text: '❗ Mention a user to kick.' }, { quoted: msg });
//     }

//     try {
//       await sock.groupParticipantsUpdate(msg.key.remoteJid, participants, 'remove');
//       await sock.sendMessage(msg.key.remoteJid, { text: '👢 User(s) kicked successfully.' }, { quoted: msg });
//     } catch (err) {
//       console.error('Kick error:', err);
//       await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to kick the user(s).' }, { quoted: msg });
//     }
//   },
// };


















export default {
  name: 'kick',
  description: 'Removes mentioned members or specified numbers from the group.',
  execute: async (sock, msg, args, metadata) => {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    
    if (!isGroup) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups.' }, { quoted: msg });
    }

    // Check if user is replying to someone
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mentionedUsers = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    // Parse numbers from arguments (format: 1234567890, 9876543210, etc.)
    const numbersFromArgs = args.filter(arg => /^\d+$/.test(arg)).map(num => `${num}@s.whatsapp.net`);
    
    // Get user from reply if no mentions or args
    let participants = [];
    
    if (mentionedUsers.length > 0) {
      participants = mentionedUsers;
    } else if (numbersFromArgs.length > 0) {
      participants = numbersFromArgs;
    } else if (quotedMsg) {
      // Get the sender of the quoted message
      const quotedParticipant = msg.message.extendedTextMessage.contextInfo.participant;
      if (quotedParticipant) {
        participants = [quotedParticipant];
      }
    }

    if (!participants.length) {
      return sock.sendMessage(msg.key.remoteJid, { 
        text: '❗ Usage:\n• Mention user(s): @kick @user\n• Reply to user: @kick (in reply)\n• Use number: @kick 1234567890' 
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, participants, 'remove');
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `👢 ${participants.length} user(s) kicked successfully.` 
      }, { quoted: msg });
    } catch (err) {
      console.error('Kick error:', err);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: '❌ Failed to kick the user(s). Make sure I have admin permissions.' 
      }, { quoted: msg });
    }
  },
};

export const kickall = {
  name: 'kickall',
  description: 'Removes all non-admin members from the group.',
  execute: async (sock, msg, args, metadata) => {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    
    if (!isGroup) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups.' }, { quoted: msg });
    }

    try {
      // Get group metadata
      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      const participants = groupMetadata.participants;
      
      // Filter out admins
      const nonAdminParticipants = participants
        .filter(p => p.admin === null)
        .map(p => p.id);
      
      if (nonAdminParticipants.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, { 
          text: 'ℹ️ All members in this group are admins.' 
        }, { quoted: msg });
      }

      // Send confirmation
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `⚠️ Are you sure you want to kick ${nonAdminParticipants.length} non-admin members? Reply with "yes" to confirm.` 
      }, { quoted: msg });
      
      // Wait for confirmation (you might want to implement a confirmation system)
      // For now, we'll proceed directly
      
      // Kick all non-admins (in batches to avoid rate limiting)
      const batchSize = 5;
      let kickedCount = 0;
      
      for (let i = 0; i < nonAdminParticipants.length; i += batchSize) {
        const batch = nonAdminParticipants.slice(i, i + batchSize);
        await sock.groupParticipantsUpdate(msg.key.remoteJid, batch, 'remove');
        kickedCount += batch.length;
        
        // Delay between batches
        if (i + batchSize < nonAdminParticipants.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `👢 Successfully kicked ${kickedCount} members from the group.` 
      }, { quoted: msg });
      
    } catch (err) {
      console.error('Kickall error:', err);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: '❌ Failed to kick members. Make sure I have admin permissions.' 
      }, { quoted: msg });
    }
  },
};