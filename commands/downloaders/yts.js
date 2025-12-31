








import axios from 'axios';
import yts from 'yt-search';

export default {
  name: 'yts',
  description: 'Search YouTube videos with detailed information',
  usage: 'yts [search query]',
  execute: async (sock, msg, args) => {
    try {
      if (args.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ *Please provide a search query*\n\n📌 *Usage:*\n• `!yts song name`\n• `!yts funny videos`\n• `!yts tutorial 2024`'
        }, { quoted: msg });
      }

      const query = args.join(' ');
      
      // Send processing message
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🔍 *Searching YouTube for:* "${query}"`
      }, { quoted: msg });

      // Use yt-search package (more reliable)
      const searchResults = await searchYouTube(query);
      
      if (!searchResults || searchResults.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ No results found. Try different keywords.'
        }, { quoted: msg });
      }

      // Format results in the requested style
      let resultText = `📑 *YOUTUBE SEARCH RESULTS:* "${query}"\n\n`;
      
      searchResults.slice(0, 15).forEach((video, index) => {
        resultText += `*${index + 1}. ${video.title}*\n`;
        resultText += `🌐 *URL:* ${video.url}\n`;
        resultText += `⏱️ *Duration:* ${video.duration}\n`;
        resultText += `🪟 *Views:* ${formatViews(video.views)}\n`;
        resultText += `⤴️ *Uploaded:* ${video.ago}\n`;
        resultText += `🧾 *Channel:* ${video.author.name}\n`;
        resultText += `\n`;
      });
      
      resultText += `🌍 *Tip:* Use !ytplay <url> to download audio\n`;
      resultText += `🗺️ Use !ytv <url> to download video`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: resultText
      }, { quoted: msg });

    } catch (error) {
      console.error('YouTube search error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Search failed. Please try again later.'
      }, { quoted: msg });
    }
  },
};

// Format views count
function formatViews(views) {
  if (!views) return 'N/A';
  
  if (typeof views === 'string') {
    return views;
  }
  
  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + 'B';
  } else if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

// Search YouTube using yt-search package
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos || [];
  } catch (error) {
    console.log('yt-search failed:', error.message);
    return await fallbackSearch(query);
  }
}

// Fallback search using Invidious API
async function fallbackSearch(query) {
  const instances = [
    'https://invidious.fdn.fr',
    'https://inv.nadeko.net',
    'https://yewtu.be',
    'https://invidious.weblibre.org'
  ];

  for (const instance of instances) {
    try {
      const response = await axios.get(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        { timeout: 8000 }
      );
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(video => ({
          title: video.title,
          url: `https://youtube.com/watch?v=${video.videoId}`,
          duration: video.lengthSeconds ? formatDuration(video.lengthSeconds) : 'N/A',
          views: video.viewCount || 0,
          ago: video.publishedText || 'N/A',
          author: { name: video.author || 'Unknown' }
        }));
      }
    } catch (error) {
      console.log(`Instance ${instance} failed:`, error.message);
      continue;
    }
  }
  
  return [];
}

// Format duration from seconds to HH:MM:SS or MM:SS
function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}