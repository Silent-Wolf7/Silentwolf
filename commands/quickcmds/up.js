// import axios from "axios";
// import os from "os";

// export default {
//   name: "up",
//   description: "Check bot uptime and system status",

//   async execute(sock, m, args) {
//     try {
//       const jid = m.key.remoteJid;
//       const sender = m.key.participant || m.key.remoteJid;

//       // Get bot uptime first (fast)
//       const uptime = process.uptime();
//       const days = Math.floor(uptime / (3600 * 24));
//       const hours = Math.floor((uptime % (3600 * 24)) / 3600);
//       const minutes = Math.floor((uptime % 3600) / 60);
//       const seconds = Math.floor(uptime % 60);
      
//       // Get memory usage
//       const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
//       const totalMemory = process.memoryUsage().heapTotal / 1024 / 1024;
//       const memoryPercent = ((usedMemory / totalMemory) * 100).toFixed(1);
      
//       // Get start time
//       const startTime = new Date(Date.now() - (uptime * 1000));
//       const startTimeFormatted = startTime.toLocaleString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
      
//       // Get system info
//       const platform = os.platform();
//       const arch = os.arch();
//       const cpus = os.cpus();
//       const cpuCores = cpus.length;
//       const cpuModel = cpus[0]?.model || "Unknown";
      
//       // Try to get GitHub data (but don't let it block the response)
//       let githubAvatar = "https://avatars.githubusercontent.com/u/583231?v=4";
//       let githubName = "777Wolf-dot";
//       let githubUrl = "https://github.com/777Wolf-dot";
      
//       try {
//         const { data: githubData } = await axios.get(
//           "https://api.github.com/users/777Wolf-dot",
//           { 
//             headers: { 
//               "User-Agent": "Silent-Wolf-Bot",
//               "Accept": "application/vnd.github.v3+json"
//             },
//             timeout: 3000 // 3 second timeout
//           }
//         );
//         githubAvatar = githubData.avatar_url;
//         githubName = githubData.name || "777Wolf-dot";
//         githubUrl = githubData.html_url;
//       } catch (githubErr) {
//         console.log("GitHub API failed, using defaults");
//       }
      
//       const text = `
// ⏱️ *BOT UPTIME & SYSTEM STATUS*

// 🕐 *Uptime:* ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s
// 📅 *Started:* ${startTimeFormatted}
// 💾 *Memory:* ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB (${memoryPercent}%)
// ⚡ *CPU:* ${cpuModel}
// 👋 @${sender.split("@")[0]}, bot has been running for ${days > 0 ? `${days} days, ` : ''}${hours} hours, ${minutes} minutes!
//       `.trim();

//       await sock.sendMessage(
//         jid,
//         {
//           text,
//           contextInfo: {
//             mentionedJid: [sender],
//             externalAdReply: {
//               title: "🐺 Silent Wolf Bot Uptime",
//               body: `Uptime: ${days}d ${hours}h ${minutes}m`,
//               mediaType: 1,
//               thumbnailUrl: githubAvatar,
//               sourceUrl: githubUrl,
//               renderLargerThumbnail: true,
//               showAdAttribution: false
//             },
//           },
//         },
//         { quoted: m }
//       );

//       console.log(`✅ Uptime command executed - Running for ${days}d ${hours}h ${minutes}m`);

//     } catch (err) {
//       console.error("❌ Uptime command error:", err.message || err);
      
//       // Ultra simple fallback
//       const uptime = process.uptime();
//       const days = Math.floor(uptime / (3600 * 24));
//       const hours = Math.floor((uptime % (3600 * 24)) / 3600);
//       const minutes = Math.floor((uptime % 3600) / 60);
      
//       const fallbackText = `⏱️ Bot Uptime: ${days}d ${hours}h ${minutes}m\n👋 @${sender.split("@")[0]}, bot is running!`;
      
//       await sock.sendMessage(
//         m.key.remoteJid,
//         { text: fallbackText },
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

      // Read owner information from owner.json (for display only, not for tagging)
      let ownerNumber = "";
      let ownerName = "";
      
      try {
        const ownerPath = path.join(process.cwd(), "owner.json");
        const ownerData = await fs.readFile(ownerPath, "utf8");
        const ownerInfo = JSON.parse(ownerData);
        
        ownerNumber = ownerInfo.OWNER_NUMBER || ownerInfo.OWNER_CLEAN_NUMBER || "";
        ownerName = ownerInfo.OWNER_NAME || ownerInfo.OWNER || "Owner";
        
        console.log(`📋 Owner info loaded: ${ownerName} | ${ownerNumber}`);
      } catch (ownerError) {
        console.error("❌ Failed to read owner.json:", ownerError.message);
        ownerName = "Owner";
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
      
      const text = `
⚡ *BOT STATUS & PING*

📡 *Bot Latency:* ${apiLatency}ms
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *Memory:* ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB
🐺 *Maintained by:* ${ownerName}
🔧 *GitHub:* ${githubOwner}

👋 @${sender.split("@")[0]}, bot is responding!
      `.trim();

      await sock.sendMessage(
        jid,
        {
          text,
          contextInfo: {
            mentionedJid: [sender], // Tag the command sender instead of owner
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

      console.log(`✅ Ping command executed - Latency: ${apiLatency}ms | Sender tagged: ${sender.split("@")[0]}`);

    } catch (err) {
      console.error("❌ Ping command error:", err.message || err);
      
      // Fallback response
      const fallbackText = `
⚡ *BOT STATUS & PING*

📡 *Bot Latency:* Unable to measure
⏱️ *Uptime:* Calculating...
💾 *Memory:* Unknown
🐺 *Maintained by:* Owner

⚠️ Connection issues detected
👋 @${sender.split("@")[0]}, bot is having issues!
      `.trim();

      await sock.sendMessage(
        m.key.remoteJid,
        { 
          text: fallbackText,
          contextInfo: {
            mentionedJid: [sender], // Tag the sender in fallback too
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