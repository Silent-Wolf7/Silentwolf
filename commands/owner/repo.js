

















import axios from "axios";

export default {
  name: "repo",
  description: "Shows bot GitHub repository",

  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      // 🔧 Updated with your GitHub repository
      const owner = "777Wolf-dot";
      const repo = "Silent-Wolf--Bot";
      const repoUrl = `https://github.com/${owner}/${repo}`;

      // 🌐 Fetch real-time repo info from GitHub API
      const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        { 
          headers: { 
            "User-Agent": "Silent-Wolf-Bot",
            "Accept": "application/vnd.github.v3+json"
          } 
        }
      );

      // 📊 Fetch additional statistics for real-time data
      let commitsCount = 0;
      let issuesCount = 0;
      let pullRequestsCount = 0;
      
      try {
        // Get commits count
        const commitsRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
          { headers: { "User-Agent": "Silent-Wolf-Bot" } }
        );
        // Extract from Link header if available
        if (commitsRes.headers.link) {
          const lastPageMatch = commitsRes.headers.link.match(/page=(\d+)>; rel="last"/);
          commitsCount = lastPageMatch ? parseInt(lastPageMatch[1]) : 0;
        }
      } catch (e) {
        commitsCount = 0;
      }

      try {
        // Get open issues count
        const issuesRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=1`,
          { headers: { "User-Agent": "Silent-Wolf-Bot" } }
        );
        if (issuesRes.headers.link) {
          const lastPageMatch = issuesRes.headers.link.match(/page=(\d+)>; rel="last"/);
          issuesCount = lastPageMatch ? parseInt(lastPageMatch[1]) : 0;
        }
      } catch (e) {
        issuesCount = 0;
      }

      try {
        // Get open pull requests count
        const prRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=1`,
          { headers: { "User-Agent": "Silent-Wolf-Bot" } }
        );
        if (prRes.headers.link) {
          const lastPageMatch = prRes.headers.link.match(/page=(\d+)>; rel="last"/);
          pullRequestsCount = lastPageMatch ? parseInt(lastPageMatch[1]) : 0;
        }
      } catch (e) {
        pullRequestsCount = 0;
      }

      // Format date
      const updatedDate = new Date(data.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const text = `
🐺*SILENT WOLF BOT REPOSITORY*

📦 *Repository:* ${data.name}
⭐ *Stars:* ${data.stargazers_count}
🍴 *Forks:* ${data.forks_count}
👁️ *Watchers:* ${data.watchers_count}
🔗 *Repository URL:* ${repoUrl}

👋 @${sender.split("@")[0]}, support the project by giving it a ⭐ star!
      `.trim();

      await sock.sendMessage(
        jid,
        {
          text,
          contextInfo: {
            mentionedJid: [sender],
            externalAdReply: {
              title: "🐺 Silent Wolf Bot",
              body: data.description || "WhatsApp Bot Repository",
              mediaType: 1,
              thumbnailUrl: data.owner.avatar_url,
              sourceUrl: repoUrl,
              renderLargerThumbnail: true,
              showAdAttribution: false
            },
          },
        },
        { quoted: m }
      );

      console.log("✅ Repo command executed successfully - Real-time data fetched");

    } catch (err) {
      console.error("❌ Repo command error:", err.message || err);
      
      // Fallback to basic repo info if API fails
      const fallbackText = `
🐺 *SILENT WOLF BOT REPOSITORY* 🐺

📦 *Repository:* Silent-Wolf--Bot
👤 *Owner:* 777Wolf-dot
🔗 *GitHub:* https://github.com/777Wolf-dot/Silent-Wolf--Bot.git

⭐ Star the repository to support development!
🍴 Fork it to customize for your needs!

Note: Could not fetch real-time statistics.
      `.trim();

      await sock.sendMessage(
        m.key.remoteJid,
        { 
          text: fallbackText,
          contextInfo: {
            externalAdReply: {
              title: "Silent Wolf Bot",
              body: "WhatsApp Bot Repository",
              mediaType: 1,
              sourceUrl: "https://github.com/777Wolf-dot/Silent-Wolf--Bot.git",
              renderLargerThumbnail: true
            }
          }
        },
        { quoted: m }
      );
    }
  },
};