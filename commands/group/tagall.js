// export default {
//   name: 'tagall',
//   description: 'Mentions all members in the group in a formatted list.',
//   execute: async (sock, msg, args, metadata) => {
//     const isGroup = msg.key.remoteJid.endsWith('@g.us');

//     if (!isGroup) {
//       return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups.' }, { quoted: msg });
//     }

//     try {
//       // Get group metadata
//       const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
//       const participants = groupMetadata.participants;
      
//       // Get all participants except the bot itself and status accounts
//       const allParticipants = participants
//         .filter(participant => !participant.id.includes('status') && participant.id !== sock.user.id.split(':')[0] + '@s.whatsapp.net')
//         .map(participant => ({
//           id: participant.id,
//           name: participant.name || participant.notify || participant.id.split('@')[0],
//           admin: participant.admin || 'member'
//         }));

//       if (allParticipants.length === 0) {
//         return sock.sendMessage(msg.key.remoteJid, { text: 'ℹ️ No members to tag.' }, { quoted: msg });
//       }

//       // Get optional custom message from args
//       const customMessage = args.length > 0 ? args.join(' ') : '📢 Attention everyone!';
      
//       // Separate admins and members
//       const admins = allParticipants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
//       const members = allParticipants.filter(p => p.admin !== 'admin' && p.admin !== 'superadmin');
      
//       // Create the header
//       let formattedText = `${customMessage}\n\n`;
      
//       // Top border
//       formattedText += "┌────────────────────┐\n";
      
//       // Group info section
//       const groupName = groupMetadata.subject || 'Group';
//       formattedText += `│ Group: ${groupName}\n`;
//       formattedText += `│ Total Members: ${allParticipants.length}\n`;
//       formattedText += "├───────────────────┤\n";
      
//       // Admins section
//       if (admins.length > 0) {
//         formattedText += `│ 👑 ADMINS (${admins.length})\n`;
//         formattedText += "├───────────────────┤\n";
//         admins.forEach((participant, index) => {
//           const paddedNumber = (index + 1).toString().padStart(2, '0');
//           const name = participant.name.length > 15 ? participant.name.substring(0, 12) + '...' : participant.name.padEnd(15, ' ');
//           formattedText += `│ ${paddedNumber}. @${name}\n`;
//         });
//         if (members.length > 0) {
//           formattedText += "├───────────────────┤\n";
//         }
//       }
      
//       // Members section
//       if (members.length > 0) {
//         formattedText += `│ 👥 MEMBERS (${members.length})\n`;
//         formattedText += "├───────────────────┤\n";
//         members.forEach((participant, index) => {
//           const paddedNumber = (admins.length + index + 1).toString().padStart(2, '0');
//           const name = participant.name.length > 15 ? participant.name.substring(0, 12) + '...' : participant.name.padEnd(15, ' ');
//           formattedText += `│ ${paddedNumber}. @${name}\n`;
//         });
//       }
      
//       // Bottom border
//       formattedText += "└────────────────────┘\n\n";
      
//       // Footer message
//       formattedText += `📍 All ${allParticipants.length} members have been notified.`;

//       // Collect all mention IDs
//       const mentionIds = allParticipants.map(p => p.id);

//       // Send message with mentions
//       await sock.sendMessage(msg.key.remoteJid, { 
//         text: formattedText,
//         mentions: mentionIds
//       }, { quoted: msg });

//     } catch (err) {
//       console.error('Tagall error:', err);
//       await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to tag members.' }, { quoted: msg });
//     }
//   },
// };






export default {
  name: 'tagall',
  description: 'Tags all members with group profile picture.',
  execute: async (sock, msg, args, metadata) => {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');

    if (!isGroup) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups.' }, { quoted: msg });
    }

    try {
      // Get group metadata
      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      const participants = groupMetadata.participants;
      
      // Get all participants except the bot itself and status accounts
      const allParticipants = participants
        .filter(participant => !participant.id.includes('status') && participant.id !== sock.user.id.split(':')[0] + '@s.whatsapp.net')
        .map(participant => ({
          id: participant.id,
          name: participant.name || participant.notify || participant.id.split('@')[0],
          admin: participant.admin || 'member'
        }));

      if (allParticipants.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, { text: 'ℹ️ No members to tag.' }, { quoted: msg });
      }

      // Get optional custom message from args
      const customMessage = args.length > 0 ? args.join(' ') : '📢 Attention everyone!';
      
      // Separate admins and members
      const admins = allParticipants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const members = allParticipants.filter(p => p.admin !== 'admin' && p.admin !== 'superadmin');
      
      // Create the caption text
      let captionText = `${customMessage}\n\n`;
      
      // Group info
      const groupName = groupMetadata.subject || 'Group';
      captionText += `🏷️ *${groupName}*\n`;
      captionText += `👥 Total: ${allParticipants.length} members\n`;
      captionText += `\n`;
      
      // Top border
      captionText += "┏━━━━━━━━━━━━━━━━━━━━┓\n";
      
      // Admins section
      if (admins.length > 0) {
        captionText += `┃ 👑 *ADMINS* (${admins.length})\n`;
        captionText += "┣━━━━━━━━━━━━━━━━━━━━┫\n";
        admins.forEach((participant, index) => {
          const paddedNumber = (index + 1).toString().padStart(2, '0');
          const name = participant.name.length > 20 ? participant.name.substring(0, 17) + '...' : participant.name.padEnd(20, ' ');
          captionText += `┃ ${paddedNumber}. @${name}\n`;
        });
        if (members.length > 0) {
          captionText += "┣━━━━━━━━━━━━━━━━━━━━┫\n";
        }
      }
      
      // Members section
      if (members.length > 0) {
        captionText += `┃ 👤 *MEMBERS* (${members.length})\n`;
        captionText += "┣━━━━━━━━━━━━━━━━━━━━┫\n";
        members.forEach((participant, index) => {
          const startNum = admins.length > 0 ? admins.length : 0;
          const paddedNumber = (startNum + index + 1).toString().padStart(2, '0');
          const name = participant.name.length > 20 ? participant.name.substring(0, 17) + '...' : participant.name.padEnd(20, ' ');
          captionText += `┃ ${paddedNumber}. @${name}\n`;
        });
      }
      
      // Bottom border
      captionText += "┗━━━━━━━━━━━━━━━━━━━━━┛\n\n";
      
      // Footer with timestamp
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      captionText += `⏰ Tagged on ${dateString} at ${timeString}`;

      // Collect all mention IDs
      const mentionIds = allParticipants.map(p => p.id);

      // Try to get group profile picture
      let profilePicture;
      try {
        // Try to fetch profile picture
        profilePicture = await sock.profilePictureUrl(msg.key.remoteJid, 'image');
      } catch (err) {
        console.log('No profile picture found for group, using default...');
        profilePicture = null;
      }

      // Send message with or without profile picture
      if (profilePicture) {
        // Download the image
        const response = await fetch(profilePicture);
        const buffer = await response.arrayBuffer();
        
        await sock.sendMessage(msg.key.remoteJid, { 
          image: Buffer.from(buffer),
          caption: captionText,
          mentions: mentionIds
        }, { quoted: msg });
      } else {
        // Send without image if no profile picture
        await sock.sendMessage(msg.key.remoteJid, { 
          text: captionText,
          mentions: mentionIds
        }, { quoted: msg });
      }

    } catch (err) {
      console.error('Tagall error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to tag members.' }, { quoted: msg });
    }
  },
};