import axios from 'axios';
import sharp from 'sharp';

export default {
  name: 'gay',
  description: 'Add rainbow effect to profile picture',
  category: 'fun',
  aliases: ['rainbow', 'pride', 'lgbtq', 'gaypic'],
  usage: 'gay (reply to any message)',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    // ====== SHOW HELP IF NO ARGS AND NO REPLY ======
    const hasReply = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (args.length === 0 && !hasReply) {
      const helpText = `🏳️‍🌈 *RAINBOW PROFILE EFFECT*\n\n` +
        `💡 *Usage (Reply-based only):*\n` +
        `• Reply to any message with \`${PREFIX}gay\`\n` +
        `• Works exactly like \`${PREFIX}remini\`\n\n` +
        
        `✨ *How to use:*\n` +
        `1. Reply to ANY message\n` +
        `2. Type \`${PREFIX}gay\`\n` +
        `3. Get rainbow profile picture\n\n` +
        
        `🎯 *Examples:*\n` +
        `\`${PREFIX}gay\` (reply to any message)\n` +
        `\`${PREFIX}rainbow\` (alias)\n` +
        `\`${PREFIX}pride\` (alias)`;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== HELP COMMAND EXPLICIT ======
    if (args[0]?.toLowerCase() === 'help') {
      const helpText = `🏳️‍🌈 *RAINBOW PROFILE EFFECT*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}gay\` (reply to any message)\n` +
        `• \`${PREFIX}rainbow\` (alias)\n\n` +
        
        `✨ *Works like remini:*\n` +
        `1. Reply to any message\n` +
        `2. Type command\n` +
        `3. Get result\n\n` +
        
        `📌 *Example:* Reply to a message with \`${PREFIX}gay\``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    try {
      // ====== DETERMINE TARGET USER ======
      let targetJid = null;
      let targetName = 'User';
      
      // CHECK 1: Is user replying to a message? (EXACTLY LIKE REMINI)
      if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        console.log('✅ Detected reply to message');
        
        const quoted = m.message.extendedTextMessage.contextInfo;
        
        // Get the sender of the quoted message
        if (quoted.participant) {
          targetJid = quoted.participant;
          targetName = quoted.pushName || 'User';
          console.log(`🎯 Target from reply: ${targetJid} (${targetName})`);
        } else {
          // If no participant, use the remoteJid (group chat)
          targetJid = quoted.remoteJid || jid;
          targetName = 'User';
          console.log(`🎯 Target from remoteJid: ${targetJid}`);
        }
      } 
      // CHECK 2: If no reply, use command sender
      else {
        targetJid = m.key.participant || jid;
        targetName = 'You';
        console.log(`🎯 Using sender as target: ${targetJid} (${targetName})`);
      }
      
      // Validate we have a target
      if (!targetJid) {
        return sock.sendMessage(jid, {
          text: `❌ *COULDN'T FIND USER!*\n\nReply to someone's message first.\n\n💡 Example: Reply to a message with \`${PREFIX}gay\``
        }, { quoted: m });
      }
      
      // Get phone number for display
      const targetNumber = targetJid.split('@')[0] || 'Unknown';
      
      console.log(`📋 Processing for: ${targetName} (${targetNumber})`);
      
      // ====== SEND PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `🏳️‍🌈 *RAINBOW PROFILE*\n\n` +
              `👤 *User:* ${targetName}\n` +
              `⏳ *Fetching profile...*`
      }, { quoted: m });
      
      // ====== GET PROFILE PICTURE ======
      let profilePicBuffer = null;
      
      try {
        // Get profile picture URL
        const profilePicUrl = await sock.profilePictureUrl(targetJid, 'image');
        
        if (!profilePicUrl) {
          throw new Error('No profile picture found');
        }
        
        console.log(`📸 Downloading profile picture...`);
        
        // Download the image
        const response = await axios.get(profilePicUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'WhatsApp-Bot/1.0'
          }
        });
        
        profilePicBuffer = Buffer.from(response.data);
        console.log(`✅ Profile picture downloaded: ${profilePicBuffer.length} bytes`);
        
        // Update status
        await sock.sendMessage(jid, {
          text: `🏳️‍🌈 *RAINBOW PROFILE*\n\n` +
                `👤 *User:* ${targetName}\n` +
                `📱 *Number:* ${targetNumber}\n\n` +
                `⏳ *Fetching profile...* ✅\n` +
                `🎨 *Adding rainbow effect...*`,
          edit: statusMsg.key
        });
        
      } catch (error) {
        console.log(`⚠️ Profile picture error: ${error.message}`);
        
        // Create default avatar
        await sock.sendMessage(jid, {
          text: `🏳️‍🌈 *RAINBOW PROFILE*\n\n` +
                `👤 *User:* ${targetName}\n` +
                `📱 *Number:* ${targetNumber}\n\n` +
                `⏳ *Fetching profile...* ⚠️\n` +
                `🎨 *Creating rainbow avatar...*`,
          edit: statusMsg.key
        });
        
        // Create simple avatar
        const firstLetter = targetName.charAt(0).toUpperCase();
        const svg = `
          <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="400" fill="#FF6B6B"/>
            <circle cx="200" cy="200" r="150" fill="white"/>
            <text x="200" y="220" font-family="Arial" font-size="120" 
                  fill="#FF6B6B" text-anchor="middle" font-weight="bold">
              ${firstLetter}
            </text>
          </svg>
        `;
        
        profilePicBuffer = Buffer.from(svg);
      }
      
      // ====== APPLY RAINBOW EFFECT ======
      await sock.sendMessage(jid, {
        text: `🏳️‍🌈 *RAINBOW PROFILE*\n\n` +
              `👤 *User:* ${targetName}\n` +
              `📱 *Number:* ${targetNumber}\n\n` +
              `⏳ *Fetching profile...* ✅\n` +
              `🎨 *Adding rainbow effect...* 🔄`,
        edit: statusMsg.key
      });
      
      let finalImageBuffer;
      
      try {
        // Apply rainbow effect
        finalImageBuffer = await applyRainbowEffect(profilePicBuffer);
        console.log(`✅ Rainbow effect applied successfully`);
        
      } catch (error) {
        console.error('Rainbow effect error:', error);
        // Use original if effect fails
        finalImageBuffer = profilePicBuffer;
      }
      
      // ====== SEND FINAL IMAGE ======
      await sock.sendMessage(jid, {
        text: `🏳️‍🌈 *RAINBOW PROFILE*\n\n` +
              `👤 *User:* ${targetName}\n` +
              `📱 *Number:* ${targetNumber}\n\n` +
              `⏳ *Fetching profile...* ✅\n` +
              `🎨 *Adding rainbow effect...* ✅\n` +
              `📤 *Sending result...*`,
        edit: statusMsg.key
      });
      
      // Send the image with reply
      await sock.sendMessage(jid, {
        image: finalImageBuffer,
        caption: `🌈 *RAINBOW PROFILE PICTURE*\n\n` +
                `👤 *User:* ${targetName}\n` +
                `📱 *Number:* ${targetNumber}\n` +
                `🎨 *Effect:* Pride Rainbow Filter\n\n` +
                `🏳️‍🌈 *Love Wins!* 🏳️‍⚧️\n` +
                `✨ Use \`${PREFIX}gay\` on others too!`,
        quoted: m // This makes it reply to the command
      });
      
      // Final status update
      await sock.sendMessage(jid, {
        text: `✅ *RAINBOW EFFECT COMPLETE!*\n\n` +
              `🌈 Added rainbow to ${targetName}'s profile!\n` +
              `✨ Image sent as reply above`,
        edit: statusMsg.key
      });
      
    } catch (error) {
      console.error('❌ [GAY] ERROR:', error);
      
      const errorMessage = `❌ *PROCESSING FAILED!*\n\n` +
        `Error: ${error.message}\n\n` +
        `💡 *How to use:*\n` +
        `• Reply to ANY message\n` +
        `• Type \`${PREFIX}gay\`\n` +
        `• That's it!\n\n` +
        `📌 *Example:* Reply to this message with \`${PREFIX}gay\``;
      
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  },
};

// ====== HELPER FUNCTIONS ======

async function applyRainbowEffect(imageBuffer) {
  // Simple rainbow effect using tint and overlay
  const image = sharp(imageBuffer);
  
  // Get metadata
  const metadata = await image.metadata();
  const width = metadata.width || 400;
  const height = metadata.height || 400;
  
  // Create rainbow overlay
  const overlayData = Buffer.alloc(width * height * 4);
  
  // Rainbow colors (RGBA)
  const rainbowColors = [
    [255, 0, 0, 100],      // Red - 40% opacity
    [255, 127, 0, 100],    // Orange
    [255, 255, 0, 100],    // Yellow
    [0, 255, 0, 100],      // Green
    [0, 0, 255, 100],      // Blue
    [75, 0, 130, 100],     // Indigo
    [148, 0, 211, 100]     // Violet
  ];
  
  // Create gradient
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Diagonal gradient
      const pos = (x + y) / (width + height);
      const colorPos = pos * 7;
      const colorIdx = Math.floor(colorPos) % 7;
      const blend = colorPos - Math.floor(colorPos);
      
      const color1 = rainbowColors[colorIdx];
      const color2 = rainbowColors[(colorIdx + 1) % 7];
      
      // Blend colors
      overlayData[idx] = Math.round(color1[0] * (1 - blend) + color2[0] * blend);     // R
      overlayData[idx + 1] = Math.round(color1[1] * (1 - blend) + color2[1] * blend); // G
      overlayData[idx + 2] = Math.round(color1[2] * (1 - blend) + color2[2] * blend); // B
      overlayData[idx + 3] = Math.round(color1[3] * (1 - blend) + color2[3] * blend); // A
    }
  }
  
  // Create overlay
  const overlay = sharp(overlayData, {
    raw: { width, height, channels: 4 }
  });
  
  // Apply overlay with blend mode
  return image
    .composite([{ input: await overlay.png().toBuffer(), blend: 'overlay' }])
    .modulate({ brightness: 1.1, saturation: 1.2 })
    .jpeg({ quality: 90 })
    .toBuffer();
}