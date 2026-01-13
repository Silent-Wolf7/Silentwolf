import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fs from 'fs';

export default {
  name: 'tiksearch',
  description: 'Search TikTok videos',
  aliases: ['tiktoksearch', 'ttsearch', 'tsearch'],
  category: 'media',
  usage: 'tiksearch [search query]',
  
  async execute(sock, m, args, PREFIX) {
    const jid = m.key.remoteJid;
    
    try {
      // Show help if no arguments
      if (args.length === 0 || args[0]?.toLowerCase() === 'help') {
        const helpText = `🔍 *WOLFBOT TIKTOK SEARCH*\n\n` +
          `📌 *Usage:*\n` +
          `• \`${PREFIX}tiksearch <search query>\`\n` +
          `• \`${PREFIX}tiksearch trending\`\n` +
          `• \`${PREFIX}ttsearch funny videos\`\n\n` +
          
          `✨ *Features:*\n` +
          `• Search TikTok videos by keywords\n` +
          `• Get direct TikTok video links\n` +
          `• Shows video details (likes, comments, shares)\n` +
          `• Multiple search sources\n\n` +
          
          `📥 *Download:*\n` +
          `• Use \`${PREFIX}tiktok <url>\` to download\n` +
          `• Videos download without watermark\n` +
          `• High quality MP4 format\n\n` +
          
          `🎬 *Examples:*\n` +
          `\`${PREFIX}tiksearch funny cats\`\n` +
          `\`${PREFIX}ttsearch music trends\`\n` +
          `\`${PREFIX}tiksearch trending now\``;
        
        return sock.sendMessage(jid, { text: helpText }, { quoted: m });
      }

      // Parse arguments
      let query = args.join(' ');
      let limit = 15; // Default number of results
      
      // Check for limit flag
      if (query.includes('-n ') || query.includes('-l ')) {
        const limitMatch = query.match(/-(n|l)\s+(\d+)/);
        if (limitMatch && limitMatch[2]) {
          limit = parseInt(limitMatch[2]);
          query = query.replace(limitMatch[0], '').trim();
          limit = Math.min(Math.max(1, limit), 30); // Limit between 1-30
        }
      }
      
      // Send processing message
      const processingMsg = await sock.sendMessage(jid, {
        text: `🔍 *Searching TikTok...*\n\n` +
              `📝 *Query:* "${query}"\n` +
              `📊 *Results:* ${limit} videos`
      }, { quoted: m });

      // Search TikTok videos
      const searchResults = await searchTikTok(query, limit);
      
      if (!searchResults || searchResults.length === 0) {
        await sock.sendMessage(jid, {
          text: `❌ *No Results Found!*\n\nCould not find any TikTok videos for "${query}".\n\n💡 *Try:*\n• Different keywords\n• Trending topics\n• Popular hashtags`,
          edit: processingMsg.key
        });
        return;
      }

      // Format results in WOLFBOT style
      let resultText = `🅦🅞🅛🅕🅑🅞🅣 TIKTOK SEARCH: "${query}"\n\n`;
      
      // Add header information
      resultText += `📈 *Found ${searchResults.length} videos*\n\n`;
      
      // Display results
      searchResults.forEach((video, index) => {
        resultText += `*${index + 1}. ${video.title || 'TikTok Video'}*\n`;
        resultText += `🅦 *URL:* ${video.url}\n`;
        
        if (video.duration) {
          resultText += `🅞 *Duration:* ${video.duration}\n`;
        }
        
        if (video.likes) {
          resultText += `🅛 *Likes:* ${formatCount(video.likes)}\n`;
        }
        
        if (video.comments) {
          resultText += `🅕 *Comments:* ${formatCount(video.comments)}\n`;
        }
        
        if (video.shares) {
          resultText += `🅑 *Shares:* ${formatCount(video.shares)}\n`;
        }
        
        if (video.author) {
          resultText += `🅞 *Creator:* @${video.author}\n`;
        }
        
        if (video.created) {
          resultText += `🅣 *Posted:* ${video.created}\n`;
        }
        
        // Add quality/format info
        resultText += `🅘 *Format:* MP4 • No Watermark\n`;
        
        resultText += `\n`;
      });
      
      // Add footer with instructions
      resultText += `┌───────────────────────\n`;
      resultText += `│ 🅦🅞🅛🅕🅑🅞🅣 TIKTOK DOWNLOAD\n`;
      resultText += `├───────────────────────\n`;
      resultText += `│ • Copy any URL above\n`;
      resultText += `│ • Use: \`${PREFIX}tiktok <url>\`\n`;
      resultText += `│ • Downloads without watermark\n`;
      resultText += `│ • MP4 format • HD quality\n`;
      resultText += `│ • Fast processing\n`;
      resultText += `└────────────────────────\n\n`;
      resultText += `🎬 *Tip:* Videos download in MP4 without watermark`;

      // Send the search results
      await sock.sendMessage(jid, {
        text: resultText
      }, { quoted: m });

      // Update processing message
      await sock.sendMessage(jid, {
        text: `✅ *Search Complete!*\n\nFound ${searchResults.length} TikTok videos for "${query}".\n\nUse \`${PREFIX}tiktok <url>\` to download any video.`,
        edit: processingMsg.key
      });

    } catch (error) {
      console.error('❌ [TIKSEARCH] ERROR:', error);
      
      await sock.sendMessage(jid, {
        text: `❌ *Search Failed!*\n\nError: ${error.message}\n\n💡 *Try again with:*\n• Different keywords\n• Check your connection\n• Wait a few moments`
      }, { quoted: m });
    }
  }
};

// ====== HELPER FUNCTIONS ======

// Format large numbers (like TikTok does)
function formatCount(count) {
  if (!count) return '0';
  
  const num = typeof count === 'string' ? parseInt(count.replace(/,/g, '')) || 0 : count;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format duration in seconds to MM:SS
function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Main TikTok search function
async function searchTikTok(query, limit = 15) {
  try {
    console.log(`[TIKSEARCH] Searching for: "${query}" (limit: ${limit})`);
    
    // Try multiple search APIs
    const apis = [
      searchTikTokApi,
      searchSnapTik,
      searchTikWM
    ];
    
    for (const api of apis) {
      try {
        const results = await api(query, limit);
        if (results && results.length > 0) {
          console.log(`✅ [TIKSEARCH] Found ${results.length} results using ${api.name}`);
          return results.slice(0, limit);
        }
      } catch (error) {
        console.log(`[TIKSEARCH] API ${api.name} failed:`, error.message);
        continue;
      }
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ [TIKSEARCH] Search error:', error);
    return [];
  }
}

// API 1: TikTok API (via third-party)
async function searchTikTokApi(query, limit) {
  try {
    const response = await axios.get('https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/', {
      params: {
        aweme_id: '',
        count: limit,
        max_cursor: 0,
        min_cursor: 0,
        type: 0,
        query: query
      },
      headers: {
        'User-Agent': 'com.ss.android.ugc.trill/2613 (Linux; U; Android 12; en_US; Pixel 6; Build/SP2A.220405.004; Cronet/TTNetVersion:5b5bf0e7 2022-07-11)',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive'
      },
      timeout: 10000
    });

    if (response.data?.aweme_list) {
      return response.data.aweme_list.map(video => ({
        title: video.desc || 'TikTok Video',
        url: `https://www.tiktok.com/@${video.author?.unique_id}/video/${video.aweme_id}`,
        duration: formatDuration(video.duration || 0),
        likes: video.statistics?.digg_count || 0,
        comments: video.statistics?.comment_count || 0,
        shares: video.statistics?.share_count || 0,
        author: video.author?.unique_id || 'unknown',
        created: video.create_time ? new Date(video.create_time * 1000).toLocaleDateString() : 'Recently'
      }));
    }
  } catch (error) {
    throw new Error(`TikTok API failed: ${error.message}`);
  }
  return [];
}

// API 2: SnapTik search
async function searchSnapTik(query, limit) {
  try {
    const response = await axios.get('https://snaptik.app/ajax/search.php', {
      params: {
        q: query,
        lang: 'en'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://snaptik.app/',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (response.data?.html) {
      // Parse HTML response to extract video links
      const videoRegex = /href="(\/video\?url=https?:\/\/[^"]+)"/g;
      const matches = [...response.data.html.matchAll(videoRegex)];
      
      return matches.slice(0, limit).map((match, index) => {
        const fullUrl = `https://snaptik.app${match[1]}`;
        return {
          title: `TikTok Video ${index + 1}`,
          url: extractTikTokUrl(fullUrl) || fullUrl,
          duration: 'Unknown',
          likes: 'Unknown',
          comments: 'Unknown',
          shares: 'Unknown',
          author: 'Various',
          created: 'Unknown'
        };
      });
    }
  } catch (error) {
    throw new Error(`SnapTik failed: ${error.message}`);
  }
  return [];
}

// API 3: TikWM search
async function searchTikWM(query, limit) {
  try {
    const response = await axios.get('https://tikwm.com/api/feed/search', {
      params: {
        keywords: query,
        count: limit,
        cursor: 0,
        web: 1,
        hd: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://tikwm.com'
      },
      timeout: 10000
    });

    if (response.data?.data?.videos) {
      return response.data.data.videos.map(video => ({
        title: video.title || video.desc || 'TikTok Video',
        url: `https://www.tiktok.com/@${video.author?.unique_id}/video/${video.video_id}`,
        duration: formatDuration(video.duration),
        likes: video.digg_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        author: video.author?.unique_id || 'unknown',
        created: video.create_time ? new Date(video.create_time * 1000).toLocaleDateString() : 'Recently'
      }));
    }
  } catch (error) {
    throw new Error(`TikWM failed: ${error.message}`);
  }
  return [];
}

// Extract TikTok URL from proxy URLs
function extractTikTokUrl(proxyUrl) {
  try {
    const url = new URL(proxyUrl);
    const params = new URLSearchParams(url.search);
    const tiktokUrl = params.get('url');
    
    if (tiktokUrl && tiktokUrl.includes('tiktok.com')) {
      return tiktokUrl;
    }
  } catch (error) {
    // If URL parsing fails, try regex
    const match = proxyUrl.match(/url=(https?:\/\/[^&]+)/);
    if (match && match[1].includes('tiktok.com')) {
      return match[1];
    }
  }
  return null;
}

// Fallback search using web scraping
async function fallbackSearch(query, limit) {
  try {
    // Try to use a TikTok search proxy
    const response = await axios.get('https://www.tiktok.com/search', {
      params: {
        q: query,
        t: Date.now()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });

    if (response.data) {
      // Extract video URLs from HTML
      const videoUrls = extractVideoUrlsFromHtml(response.data);
      return videoUrls.slice(0, limit).map((url, index) => ({
        title: `TikTok Video ${index + 1}`,
        url: url,
        duration: 'Unknown',
        likes: 'Unknown',
        comments: 'Unknown',
        shares: 'Unknown',
        author: 'Various',
        created: 'Unknown'
      }));
    }
  } catch (error) {
    console.log('Fallback search failed:', error.message);
  }
  return [];
}

// Extract video URLs from HTML
function extractVideoUrlsFromHtml(html) {
  const urls = [];
  
  // Look for TikTok video links
  const patterns = [
    /https:\/\/www\.tiktok\.com\/@[\w.]+\/video\/\d+/g,
    /https:\/\/vm\.tiktok\.com\/[\w\d]+/g,
    /https:\/\/vt\.tiktok\.com\/[\w\d]+/g,
    /https:\/\/m\.tiktok\.com\/v\/\d+\.html/g
  ];
  
  patterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      urls.push(...matches);
    }
  });
  
  // Remove duplicates
  return [...new Set(urls)];
}

// Function to test if a URL is accessible
async function testUrlAccessibility(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}