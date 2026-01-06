export default {
  name: 'getjid',
  description: 'Get user JID from reply, mention, or number',
  category: 'utility',
  
  async execute(sock, m, args) {
    const send = async (text) => {
      return sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };
    
    // Function to convert LID to regular JID
    const convertLidToJid = async (lid) => {
      if (!lid.endsWith('@lid')) return lid;
      
      try {
        // Extract the LID number (the long number before @lid)
        const lidNumber = lid.split('@')[0];
        
        // For LIDs, we need to handle them differently
        // Usually, the actual phone number is encoded in the LID
        // But for display purposes, we can show both formats
        
        // Note: LID to phone number conversion isn't always straightforward
        // WhatsApp encodes additional info in LIDs
        
        return {
          lid: lid,
          possibleJid: `${lidNumber.slice(-12)}@s.whatsapp.net`, // Try last 12 digits
          isLid: true,
          lidNumber: lidNumber
        };
      } catch (error) {
        return { lid: lid, error: error.message };
      }
    };
    
    // Function to get phone number from JID/LID
    const getCleanNumber = (jid) => {
      const number = jid.split('@')[0];
      // Remove any non-numeric characters
      return number.replace(/\D/g, '');
    };
    
    try {
      // Case 1: Get JID from replied message
      if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        const repliedJid = m.message.extendedTextMessage.contextInfo.participant;
        const number = getCleanNumber(repliedJid);
        
        // Check if it's a LID
        const isLid = repliedJid.endsWith('@lid');
        
        let response = '';
        
        if (isLid) {
          // Handle LID format
          const converted = await convertLidToJid(repliedJid);
          
          response = `📱 *JID from Reply* (LID Detected)
👤 *LID Number:* \`${number}\`
🔗 *Full LID:* \`${repliedJid}\`
📝 *Type:* Linked ID (New WhatsApp System)

⚠️ *Note:* This is a Linked ID (LID), not a regular JID
💡 *LID Characteristics:*
• Used for multi-device support
• May not be the actual phone number
• Contains encoded device information

🔄 *Possible Conversion:*
• LID: \`${repliedJid}\`
• Possible JID: \`${converted.possibleJid}\`
• Raw Number: \`${number}\`

📌 *Usage:* 
• Most bot functions accept LIDs
• For database, store as: \`${repliedJid}\``;
        } else {
          // Handle regular JID
          response = `📱 *JID from Reply*
👤 *Number:* \`${number}\`
🔗 *JID:* \`${repliedJid}\`
📝 *Type:* User JID

📋 *Formats:*
• Clean JID: \`${number}@s.whatsapp.net\`
• Raw JID: \`${repliedJid}\`
• Number only: \`${number}\``;
        }
        
        await send(response);
        return;
      }
      
      // Case 2: Get JID from mention
      if (args[0]?.startsWith('@')) {
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
          return await send("❌ Please mention a user with @username");
        }
        
        const number = getCleanNumber(mentionedJid);
        const isLid = mentionedJid.endsWith('@lid');
        
        let response = `👥 *JID from Mention*\n`;
        
        if (isLid) {
          response += `📞 *LID Number:* \`${number}\`
🔗 *Full LID:* \`${mentionedJid}\`
📝 *Type:* Linked ID

💡 *This is a Linked ID (LID)*
• New WhatsApp multi-device format
• Use as-is for messaging
• May differ from actual phone number`;
        } else {
          response += `📞 *Number:* \`${number}\`
🔗 *JID:* \`${mentionedJid}\`
📝 *Type:* User JID

💡 *Tip:* This is the actual WhatsApp ID used by the system.`;
        }
        
        await send(response);
        return;
      }
      
      // Case 3: Get JID from phone number input
      if (args[0]) {
        const input = args[0];
        const cleanNumber = input.replace(/\D/g, '');
        
        // Always use regular JID format for manual input
        const jid = `${cleanNumber}@s.whatsapp.net`;
        
        await send(`🔍 *JID Result*
📟 *Input:* ${input}
📞 *Number:* \`${cleanNumber}\`
🔗 *Full JID:* \`${jid}\`
🌐 *Server:* \`s.whatsapp.net\`

💡 *Note:* Manual input always uses regular JID format.
For LIDs, use reply or mention methods.

🛠️ *Usage examples:*
• Send message: \`/msg ${jid} Hello\`
• Add to group: \`${jid}\``);
        return;
      }
      
      // Case 4: Get sender's own JID
      const senderJid = m.key.participant || m.key.remoteJid;
      const senderNumber = getCleanNumber(senderJid);
      const isSenderLid = senderJid.endsWith('@lid');
      
      let selfResponse = `👤 *Your JID Information*\n`;
      
      if (isSenderLid) {
        selfResponse += `📱 *Your LID:* \`${senderJid}\`
🔢 *LID Number:* \`${senderNumber}\`
🏷️ *Type:* Linked ID
📝 *From:* ${m.key.fromMe ? 'Yourself (bot)' : 'Other user'}

⚠️ *You're using Linked ID format*
• This is normal for newer WhatsApp versions
• LIDs work for all bot functions
• Store this ID for user tracking`;
      } else {
        selfResponse += `📱 *Your Number:* \`${senderNumber}\`
🔗 *Your JID:* \`${senderJid}\`
🏷️ *Message From:* ${m.key.fromMe ? 'Yourself (bot)' : 'Other user'}`;
      }
      
      selfResponse += `

📍 *Chat Context:*
• Chat JID: \`${m.key.remoteJid}\`
• Is Group: ${m.key.remoteJid.endsWith('@g.us') ? '✅ Yes' : '❌ No'}`;
      
      if (m.key.participant) {
        selfResponse += `\n• Participant: \`${m.key.participant}\``;
      }
      
      await send(selfResponse);
      
    } catch (error) {
      console.error('GetJID Error:', error);
      await send(`❌ *Error getting JID*
📝 ${error.message}

💡 *Usage:*
• Reply to a message: \`/getjid\`
• Mention someone: \`/getjid @username\`
• Phone number: \`/getjid 254703397679\`
• Full JID: \`/getjid 254703397679@s.whatsapp.net\`

⚠️ *Note:* Replies may show LIDs (@lid) instead of regular JIDs.
This is normal for WhatsApp's new system.`);
    }
  }
};