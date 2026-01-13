import axios from 'axios';

export default {
  name: 'tiktokinfo',
  description: 'Get TikTok account information',
  aliases: ['ttinfo', 'tkinfo', 'tiktokstats'],
  category: 'media',
  usage: 'tiktokinfo [username]',
  
  async execute(sock, m, args, PREFIX) {
    const jid = m.key.remoteJid;
    
    try {
      // Show help if no arguments
      if (args.length === 0 || args[0]?.toLowerCase() === 'help') {
        const helpText = `📊 *TIKTOK ACCOUNT INFO*\n\n` +
          `📌 *Usage:*\n` +
          `• \`${PREFIX}tiktokinfo <username>\`\n` +
          `• \`${PREFIX}ttinfo @username\`\n\n` +
          
          `✨ *Information Provided:*\n` +
          `• Followers count\n` +
          `• Following count\n` +
          `• Total likes\n` +
          `• Video count\n` +
          `• Bio/description\n` +
          `• Verified status\n` +
          `• Profile link\n\n` +
          
          `🎯 *Examples:*\n` +
          `\`${PREFIX}tiktokinfo khaby.lame\`\n` +
          `\`${PREFIX}ttinfo @zachking\``;
        
        return sock.sendMessage(jid, { text: helpText }, { quoted: m });
      }

      // Get username from arguments
      let username = args.join(' ').trim();
      
      // Remove @ symbol if present
      if (username.startsWith('@')) {
        username = username.substring(1);
      }
      
      // Remove any URL parts
      username = username.replace('https://www.tiktok.com/', '')
                        .replace('https://tiktok.com/', '')
                        .replace('@', '')
                        .trim();
      
      if (!username) {
        return sock.sendMessage(jid, {
          text: `❌ *Please provide a TikTok username!*\n\nExample: \`${PREFIX}tiktokinfo khaby.lame\``
        }, { quoted: m });
      }

      // Send processing message
      const processingMsg = await sock.sendMessage(jid, {
        text: `🔍 *Fetching TikTok Account...*\n\n` +
              `👤 *Username:* @${username}\n` +
              `⏳ *Getting real-time data...*`
      }, { quoted: m });

      console.log(`[TIKTOK INFO] Fetching account: @${username}`);
      
      // Get account information using reliable methods
      const accountInfo = await getTikTokAccountInfo(username);
      
      if (!accountInfo || accountInfo.error) {
        await sock.sendMessage(jid, {
          text: `❌ *Account Data Unavailable!*\n\nCould not fetch data for @${username}.\n\n💡 *Possible reasons:*\n• Account is private\n• Account doesn't exist\n• TikTok API is temporarily unavailable\n\n✅ *Try:*\n• Check username spelling\n• Make sure account is public\n• Try again in a few minutes`,
          edit: processingMsg.key
        });
        return;
      }

      // Create account info display
      let accountText = `╔══════════════════════════════╗\n`;
      accountText += `║    📊 TIKTOK ACCOUNT INFO    ║\n`;
      accountText += `╚══════════════════════════════╝\n\n`;
      
      accountText += `👤 *USER PROFILE*\n`;
      accountText += `├─ *Username:* @${accountInfo.username}\n`;
      accountText += `├─ *Display Name:* ${accountInfo.displayName}\n`;
      
      if (accountInfo.verified) {
        accountText += `└─ *Status:* ✅ Verified Account\n\n`;
      } else {
        accountText += `└─ *Status:* Public Account\n\n`;
      }
      
      // Format numbers
      const formatNumber = (num) => {
        if (!num && num !== 0) return 'N/A';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
      };
      
      accountText += `📈 *ACCOUNT STATISTICS*\n`;
      accountText += `├─ 👥 *Followers:* ${formatNumber(accountInfo.followers)}\n`;
      accountText += `├─ 🤝 *Following:* ${formatNumber(accountInfo.following)}\n`;
      accountText += `├─ ❤️ *Total Likes:* ${formatNumber(accountInfo.likes)}\n`;
      accountText += `└─ 🎬 *Videos Posted:* ${formatNumber(accountInfo.videoCount)}\n\n`;
      
      if (accountInfo.bio && accountInfo.bio.trim().length > 0) {
        accountText += `📝 *BIO*\n${accountInfo.bio}\n\n`;
      }
      
      if (accountInfo.createdDate) {
        accountText += `📅 *Account Created:* ${accountInfo.createdDate}\n`;
      }
      
      if (accountInfo.region && accountInfo.region !== 'Global') {
        accountText += `🌍 *Region:* ${accountInfo.region}\n`;
      }
      
      accountText += `🔗 *Profile URL:* https://tiktok.com/@${accountInfo.username}\n\n`;
      accountText += `✅ *Data Source:* TikTok Public API\n`;
      accountText += `🔄 *Last Updated:* ${new Date().toLocaleString()}`;

      // Send the account info
      await sock.sendMessage(jid, {
        text: accountText
      }, { quoted: m });

      console.log(`✅ Sent account info for @${username}`);

      // Final update
      await sock.sendMessage(jid, {
        text: `✅ *Account Info Retrieved!*\n\nReal-time data for @${username} has been sent.`,
        edit: processingMsg.key
      });

    } catch (error) {
      console.error('❌ [TIKTOK INFO] ERROR:', error);
      
      await sock.sendMessage(jid, {
        text: `❌ *Failed to Fetch Account!*\n\nError: ${error.message}\n\n💡 *Try:*\n\`${PREFIX}tiktokinfo khaby.lame\`\n\`${PREFIX}ttinfo zachking\``
      }, { quoted: m });
    }
  }
};

// ====== HELPER FUNCTIONS ======

// Main function to get TikTok account info
async function getTikTokAccountInfo(username) {
  console.log(`[TIKTOK INFO] Getting account info for: @${username}`);
  
  // Try multiple reliable methods
  const methods = [
    getInfoFromTikTokShare,
    getInfoFromTikTokWeb,
    getInfoFromTikWM,
    getInfoFromSnapTik
  ];
  
  for (const method of methods) {
    try {
      console.log(`Trying method: ${method.name}`);
      const accountInfo = await method(username);
      
      if (accountInfo && 
          accountInfo.username && 
          accountInfo.displayName &&
          (accountInfo.followers > 0 || accountInfo.likes > 0)) {
        console.log(`✅ Success with ${method.name}`);
        return accountInfo;
      }
    } catch (error) {
      console.log(`${method.name} failed:`, error.message);
      continue;
    }
  }
  
  // Last resort: Try to get basic info
  return await getBasicAccountInfo(username);
}

// Method 1: TikTok Share API (most reliable)
async function getInfoFromTikTokShare(username) {
  try {
    // This endpoint often works better
    const response = await axios.get(`https://www.tiktok.com/share/user/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.tiktok.com/'
      },
      timeout: 15000
    });

    const html = response.data;
    
    // Try to extract from share page
    const userInfo = extractUserInfoFromSharePage(html, username);
    if (userInfo) return userInfo;
    
    throw new Error('No user info found');
  } catch (error) {
    throw new Error(`Share API failed: ${error.message}`);
  }
}

// Extract from share page
function extractUserInfoFromSharePage(html, username) {
  try {
    // Look for user data in script tags
    const scriptRegex = /<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({[^<]+})<\/script>/;
    const match = html.match(scriptRegex);
    
    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1]);
        
        // Navigate through the data structure
        const userModule = data?.UserModule?.users?.[username];
        if (userModule) {
          return {
            username: userModule.uniqueId || username,
            displayName: userModule.nickname || username,
            followers: userModule.followerCount || 0,
            following: userModule.followingCount || 0,
            likes: userModule.heartCount || 0,
            videoCount: userModule.videoCount || 0,
            bio: userModule.signature || '',
            verified: userModule.verified || false,
            region: userModule.region || 'Global',
            createdDate: userModule.createTime ? new Date(userModule.createTime * 1000).toLocaleDateString() : null
          };
        }
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
    }
    
    // Try to extract from meta tags
    return extractFromMetaTags(html, username);
  } catch (error) {
    console.log('Share page extraction error:', error.message);
    return null;
  }
}

// Method 2: TikTok Web Page
async function getInfoFromTikTokWeb(username) {
  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000
    });

    const html = response.data;
    return extractUserInfoFromWebPage(html, username);
  } catch (error) {
    throw new Error(`Web page failed: ${error.message}`);
  }
}

// Extract from web page
function extractUserInfoFromWebPage(html, username) {
  try {
    // Method 1: Try JSON-LD
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    const matches = html.match(jsonLdRegex);
    
    if (matches) {
      for (const match of matches) {
        try {
          const jsonStr = match.replace('<script type="application/ld+json">', '').replace('</script>', '').trim();
          const data = JSON.parse(jsonStr);
          
          if (data && data.author) {
            const extractNum = (text) => {
              if (!text) return 0;
              const clean = text.toString().replace(/,/g, '');
              const num = parseFloat(clean.replace(/[^0-9.]/g, ''));
              if (isNaN(num)) return 0;
              if (clean.toLowerCase().includes('k')) return num * 1000;
              if (clean.toLowerCase().includes('m')) return num * 1000000;
              if (clean.toLowerCase().includes('b')) return num * 1000000000;
              return num;
            };
            
            return {
              username: data.author.alternateName || username,
              displayName: data.author.name || username,
              followers: extractNum(data.author.interactionStatistic?.userInteractionCount || '0'),
              following: extractNum(data.author.follows?.totalItems || '0'),
              likes: extractNum(data.author.aggregateRating?.ratingCount || '0'),
              videoCount: extractNum(data.author.numberOfItems || '0'),
              bio: data.author.description || '',
              verified: data.author.verified || false,
              region: data.author.location || 'Global',
              createdDate: data.author.dateCreated || null
            };
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Method 2: Extract from meta tags
    return extractFromMetaTags(html, username);
    
  } catch (error) {
    console.log('Web page extraction error:', error.message);
    return null;
  }
}

// Extract from meta tags
function extractFromMetaTags(html, username) {
  try {
    const extractMeta = (property) => {
      const regex = new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const extractMetaName = (name) => {
      const regex = new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]*)"`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const ogTitle = extractMeta('og:title') || '';
    const ogDescription = extractMeta('og:description') || '';
    
    // Extract stats from description
    const extractNum = (text) => {
      if (!text) return 0;
      const clean = text.toString().replace(/,/g, '');
      const num = parseFloat(clean.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return 0;
      if (clean.toLowerCase().includes('k')) return num * 1000;
      if (clean.toLowerCase().includes('m')) return num * 1000000;
      if (clean.toLowerCase().includes('b')) return num * 1000000000;
      return num;
    };
    
    let followers = 0, following = 0, likes = 0, videoCount = 0;
    
    // Try to find followers
    const followerMatch = ogDescription.match(/([\d.,]+[KM]?)\s*Followers/i);
    if (followerMatch) followers = extractNum(followerMatch[1]);
    
    // Try to find following
    const followingMatch = ogDescription.match(/([\d.,]+[KM]?)\s*Following/i);
    if (followingMatch) following = extractNum(followingMatch[1]);
    
    // Try to find likes
    const likesMatch = ogDescription.match(/([\d.,]+[KM]?)\s*Likes/i);
    if (likesMatch) likes = extractNum(likesMatch[1]);
    
    // Try to find video count
    const videoMatch = ogDescription.match(/(\d+)\s*videos?/i);
    if (videoMatch) videoCount = parseInt(videoMatch[1]);
    
    // Clean display name
    let displayName = ogTitle
      .replace(' TikTok', '')
      .replace('(@' + username + ')', '')
      .trim();
    
    if (!displayName || displayName === 'TikTok') {
      displayName = username;
    }
    
    // Check if verified
    const verified = ogDescription.includes('Verified') || 
                     ogTitle.includes('✅') || 
                     html.includes('verifiedBadge');
    
    return {
      username: username,
      displayName: displayName,
      followers: followers,
      following: following,
      likes: likes,
      videoCount: videoCount,
      bio: ogDescription,
      verified: verified,
      region: 'Global',
      createdDate: null
    };
    
  } catch (error) {
    console.log('Meta tag extraction error:', error.message);
    return null;
  }
}

// Method 3: TikWM API
async function getInfoFromTikWM(username) {
  try {
    const response = await axios.get(`https://tikwm.com/api/user/info`, {
      params: {
        unique_id: username
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (response.data?.data?.user) {
      const user = response.data.data.user;
      return {
        username: user.unique_id || username,
        displayName: user.nickname || username,
        followers: user.follower_count || 0,
        following: user.following_count || 0,
        likes: user.total_favorited || 0,
        videoCount: user.aweme_count || 0,
        bio: user.signature || '',
        verified: user.verified || false,
        region: user.region || 'Global',
        createdDate: user.create_time ? new Date(user.create_time * 1000).toLocaleDateString() : null
      };
    }
    throw new Error('No user data');
  } catch (error) {
    throw new Error(`TikWM failed: ${error.message}`);
  }
}

// Method 4: SnapTik
async function getInfoFromSnapTik(username) {
  try {
    const response = await axios.get(`https://snaptik.app/user/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const html = response.data;
    
    // Extract from SnapTik page
    const userInfo = extractFromSnapTikPage(html, username);
    if (userInfo) return userInfo;
    
    throw new Error('No user info');
  } catch (error) {
    throw new Error(`SnapTik failed: ${error.message}`);
  }
}

// Extract from SnapTik page
function extractFromSnapTikPage(html, username) {
  try {
    // Look for user stats
    const statsRegex = /<div[^>]*class="[^"]*user-stats[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const statsMatch = html.match(statsRegex);
    
    if (statsMatch) {
      const statsHtml = statsMatch[1];
      
      // Extract numbers
      const extractStat = (label) => {
        const regex = new RegExp(`${label}[^>]*>([^<]+)<`, 'i');
        const match = statsHtml.match(regex);
        return match ? match[1].trim() : '0';
      };
      
      const followers = extractStat('Followers');
      const following = extractStat('Following');
      const likes = extractStat('Likes');
      
      // Extract display name
      const nameRegex = /<h1[^>]*>([^<]+)<\/h1>/;
      const nameMatch = html.match(nameRegex);
      const displayName = nameMatch ? nameMatch[1].trim() : username;
      
      // Extract bio
      const bioRegex = /<div[^>]*class="[^"]*user-bio[^"]*"[^>]*>([\s\S]*?)<\/div>/;
      const bioMatch = html.match(bioRegex);
      const bio = bioMatch ? bioMatch[1].trim() : '';
      
      return {
        username: username,
        displayName: displayName,
        followers: parseNumber(followers),
        following: parseNumber(following),
        likes: parseNumber(likes),
        videoCount: 0,
        bio: bio,
        verified: html.includes('verified') || false,
        region: 'Global',
        createdDate: null
      };
    }
    
    return null;
  } catch (error) {
    console.log('SnapTik extraction error:', error.message);
    return null;
  }
}

// Parse number from text
function parseNumber(text) {
  if (!text) return 0;
  const clean = text.toString().replace(/,/g, '');
  const num = parseFloat(clean.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  if (clean.toLowerCase().includes('k')) return num * 1000;
  if (clean.toLowerCase().includes('m')) return num * 1000000;
  if (clean.toLowerCase().includes('b')) return num * 1000000000;
  return num;
}

// Get basic account info as last resort
async function getBasicAccountInfo(username) {
  try {
    // Just verify account exists
    const response = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      const html = response.data;
      
      // Check if account exists (not 404 page)
      if (html.includes('Couldn\'t find this account') || 
          html.includes('Page not found')) {
        return { error: 'Account not found' };
      }
      
      // Get display name from title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
      const displayName = titleMatch ? 
        titleMatch[1].replace(' TikTok', '').replace('(@' + username + ')', '').trim() : 
        username;
      
      return {
        username: username,
        displayName: displayName,
        followers: 0,
        following: 0,
        likes: 0,
        videoCount: 0,
        bio: 'Account exists but statistics are private or unavailable',
        verified: false,
        region: 'Unknown',
        createdDate: null
      };
    }
    
    return { error: 'Account not found' };
  } catch (error) {
    if (error.response?.status === 404) {
      return { error: 'Account not found' };
    }
    return { error: error.message };
  }
}