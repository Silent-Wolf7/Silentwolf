






// import axios from "axios";

// export default {
//   name: "p",
//   description: "Check bot ping and status",

//   async execute(sock, m, args) {
//     try {
//       const jid = m.key.remoteJid;
//       const sender = m.key.participant || m.key.remoteJid;

//       const startTime = Date.now();
      
//       // 🔧 Fetch GitHub user data to get profile image
//       const owner = "777Wolf-dot";
//       const githubUserUrl = `https://api.github.com/users/${owner}`;
      
//       // Fetch GitHub user data
//       const { data: githubData } = await axios.get(
//         githubUserUrl,
//         { 
//           headers: { 
//             "User-Agent": "Silent-Wolf-Bot",
//             "Accept": "application/vnd.github.v3+json"
//           } 
//         }
//       );
      
//       const apiLatency = Date.now() - startTime;
      
//       // Get bot uptime if available
//       const uptime = process.uptime();
//       const hours = Math.floor(uptime / 3600);
//       const minutes = Math.floor((uptime % 3600) / 60);
//       const seconds = Math.floor(uptime % 60);
      
//       // Get memory usage
//       const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
//       const totalMemory = process.memoryUsage().heapTotal / 1024 / 1024;
      
//       const text = `
// ⚡ *BOT STATUS & PING*

// 📡 *Bot Latency:* ${apiLatency}ms
// ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
// 💾 *Memory:* ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB
// 👋 @${sender.split("@")[0]}, WolfBot is running smoothly!
//       `.trim();

//       await sock.sendMessage(
//         jid,
//         {
//           text,
//           contextInfo: {
//             mentionedJid: [sender],
//             externalAdReply: {
//               title: "🐺 Silent Wolf Bot Status",
//               body: `Ping: ${apiLatency}ms | Uptime: ${hours}h`,
//               mediaType: 1,
//               thumbnailUrl: githubData.avatar_url, // This will show your GitHub profile image
//               sourceUrl: githubData.html_url,
//               renderLargerThumbnail: true,
//               showAdAttribution: false
//             },
//           },
//         },
//         { quoted: m }
//       );

//       console.log(`✅ Ping command executed - Latency: ${apiLatency}ms`);

//     } catch (err) {
//       console.error("❌ Ping command error:", err.message || err);
      
//       // Fallback to basic info if API fails
//       const fallbackText = `
// ⚡ *BOT STATUS & PING*

// 📡 *Bot Latency:* Unable to measure
// ⏱️ *Uptime:* Calculating...
// 💾 *Memory:* Unknown
// 👤 *Developer:* 777Wolf-dot

// 👋 @${owner.split("@")[0]}, bot is still running!
// ⚠️ Connection issues detected
//       `.trim();

//       await sock.sendMessage(
//         m.key.remoteJid,
//         { 
//           text: fallbackText,
//           contextInfo: {
//             mentionedJid: [sender],
//             externalAdReply: {
//               title: "Silent Wolf Bot Status",
//               body: "Connection issues detected",
//               mediaType: 1,
//               thumbnailUrl: "https://avatars.githubusercontent.com/u/583231?v=4", // Default GitHub avatar
//               sourceUrl: "https://github.com/777Wolf-dot",
//               renderLargerThumbnail: true,
//               showAdAttribution: false
//             }
//           }
//         },
//         { quoted: m }
//       );
//     }
//   },
// };                







import axios from "axios";
import fs from "fs/promises";
import path from "path";

export default {
  name: "p",
  description: "Check bot ping and status",

  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      // Read owner information from owner.json
      let ownerJid = "";
      let ownerNumber = "";
      
      try {
        const ownerPath = path.join(process.cwd(), "owner.json");
        const ownerData = await fs.readFile(ownerPath, "utf8");
        const ownerInfo = JSON.parse(ownerData);
        
        ownerJid = ownerInfo.OWNER_JID || ownerInfo.OWNER_CLEAN_JID || "";
        ownerNumber = ownerInfo.OWNER_NUMBER || ownerInfo.OWNER_CLEAN_NUMBER || "";
        
        console.log(`📋 Owner info loaded: ${ownerNumber} | ${ownerJid}`);
      } catch (ownerError) {
        console.error("❌ Failed to read owner.json:", ownerError.message);
        // Fallback to hardcoded owner if file not found
      
      }

      const startTime = Date.now();
      
      // 🔧 Fetch GitHub user data to get profile image
      const githubOwner = "777Wolf-dot";
      const githubUserUrl = `https://api.github.com/users/${githubOwner}`;
      
      // Fetch GitHub user data
      const { data: githubData } = await axios.get(
        githubUserUrl,
        { 
          headers: { 
            "User-Agent": "Silent-Wolf-Bot",
            "Accept": "application/vnd.github.v3+json"
          } 
        }
      );
      
      const apiLatency = Date.now() - startTime;
      
      // Get bot uptime if available
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      // Get memory usage
      const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const totalMemory = process.memoryUsage().heapTotal / 1024 / 1024;
      
      // Extract owner name from JID for mention
      const ownerForMention = ownerNumber || ownerJid.split("@")[0] || "Owner";
      
      const text = `
⚡ *BOT STATUS & PING*

📡 *Bot Latency:* ${apiLatency}ms
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *Memory:* ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB
🐺 *Maintained by:* @${ownerForMention}
🔧 *GitHub:* ${githubOwner}
      `.trim();

      await sock.sendMessage(
        jid,
        {
          text,
          contextInfo: {
            mentionedJid: ownerJid ? [ownerJid] : [], // Tag the owner from owner.json
            externalAdReply: {
              title: "🐺 Silent Wolf Bot Status",
              body: `Ping: ${apiLatency}ms | Uptime: ${hours}h`,
              mediaType: 1,
              thumbnailUrl: githubData.avatar_url,
              sourceUrl: githubData.html_url,
              renderLargerThumbnail: true,
              showAdAttribution: false
            },
          },
        },
        { quoted: m }
      );

      console.log(`✅ Ping command executed - Latency: ${apiLatency}ms | Owner tagged: ${ownerJid}`);

    } catch (err) {
      console.error("❌ Ping command error:", err.message || err);
      
      // Try to read owner info again for fallback
      let fallbackOwnerJid = "";
      let fallbackOwnerNumber = "";
      
      try {
        const ownerPath = path.join(process.cwd(), "owner.json");
        const ownerData = await fs.readFile(ownerPath, "utf8");
        const ownerInfo = JSON.parse(ownerData);
        
        fallbackOwnerJid = ownerInfo.OWNER_JID || ownerInfo.OWNER_CLEAN_JID || "";
        fallbackOwnerNumber = ownerInfo.OWNER_NUMBER || ownerInfo.OWNER_CLEAN_NUMBER || "";
      } catch {
        fallbackOwnerJid = "254703397679@s.whatsapp.net";
        fallbackOwnerNumber = "254703397679";
      }
      
      const fallbackText = `
⚡ *BOT STATUS & PING*

📡 *Bot Latency:* Unable to measure
⏱️ *Uptime:* Calculating...
💾 *Memory:* Unknown
🐺 *Maintained by:* @${fallbackOwnerNumber || "Owner"}

⚠️ Connection issues detected
      `.trim();

      await sock.sendMessage(
        m.key.remoteJid,
        { 
          text: fallbackText,
          contextInfo: {
            mentionedJid: fallbackOwnerJid ? [fallbackOwnerJid] : [],
            externalAdReply: {
              title: "Silent Wolf Bot Status",
              body: "Connection issues detected",
              mediaType: 1,
              thumbnailUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
              sourceUrl: "https://github.com/777Wolf-dot",
              renderLargerThumbnail: true,
              showAdAttribution: false
            }
          }
        },
        { quoted: m }
      );
    }
  },
};