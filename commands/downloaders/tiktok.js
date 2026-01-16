import axios from 'axios';

export default {
  name: 'tiktokinfo',
  description: 'Get TikTok account information',
  aliases: ['ttinfo', 'tkinfo', 'tiktokstats'],
  category: 'stalker',
  usage: 'tiktokinfo [username]',
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    
    try {
      // Show help if no arguments
      if (args.length === 0 || args[0]?.toLowerCase() === 'help') {
        const helpText = `📊 *TIKTOK ACCOUNT INFO*\n\n` +
          `📌 *Usage:*\n` +
          `• \`.tiktokinfo <username>\`\n` +
          `• \`.ttinfo @username\`\n\n` +
          
          `✨ *Information Provided:*\n` +
          `• Profile picture\n` +
          `• Followers count\n` +
          `• Following count\n` +
          `• Total likes\n` +
          `• Video count\n` +
          `• Friends count\n` +
          `• Bio/description\n` +
          `• Verified status\n` +
          `• Private status\n` +
          `• Account creation date\n` +
          `• Profile link\n\n` +
          
          `🎯 *Examples:*\n` +
          `\`.tiktokinfo keizzah4189\`\n` +
          `\`.ttinfo @khaby.lame\``;
        
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
          text: `❌ *Please provide a TikTok username!*\n\nExample: \`.tiktokinfo keizzah4189\``
        }, { quoted: m });
      }

      // Send processing message
      const processingMsg = await sock.sendMessage(jid, {
        text: `🔍 *Fetching TikTok Account...*\n\n` +
              `👤 *Username:* @${username}\n` +
              `⏳ *Please wait...*`
      }, { quoted: m });

      console.log(`[TIKTOK INFO] Fetching account: @${username}`);
      
      try {
        // Use the reliable API from stalk.js
        const res = await axios.get(`https://apiskeith.vercel.app/stalker/tiktok?user=${encodeURIComponent(username)}`);
        const data = res.data;

        if (!data.status || !data.result?.profile) {
          await sock.sendMessage(jid, {
            text: `❌ *Account Not Found!*\n\nCould not fetch data for @${username}.\n\n💡 *Possible reasons:*\n• Account doesn't exist\n• Account is private\n• API is temporarily unavailable\n\n✅ *Try:*\n• Check username spelling\n• Use exact username (case-sensitive)\n• Try again in a few minutes`,
            edit: processingMsg.key
          });
          return;
        }

        const { profile, stats } = data.result;
        
        // Create formatted caption
        const caption = `╔═══════════════════════════╗\n` +
                       `║   📊 TIKTOK PROFILE INFO   ║\n` +
                       `╚═══════════════════════════╝\n\n` +
                       
                       `👤 *PROFILE DETAILS*\n` +
                       `├─ Username: @${profile.username}\n` +
                       `├─ Name: ${profile.nickname}\n` +
                       `├─ ID: ${profile.id}\n` +
                       `├─ Bio: ${profile.bio || "—"}\n` +
                       `├─ Language: ${profile.language}\n` +
                       `├─ Private: ${profile.private ? "🔒 Yes" : "🔓 No"}\n` +
                       `├─ Verified: ${profile.verified ? "✅ Yes" : "❌ No"}\n` +
                       `└─ Created: ${new Date(profile.createdAt).toLocaleDateString()}\n\n` +
                       
                       `📈 *ACCOUNT STATISTICS*\n` +
                       `├─ Followers: ${formatNumber(stats.followers)}\n` +
                       `├─ Following: ${formatNumber(stats.following)}\n` +
                       `├─ Total Likes: ${formatNumber(stats.likes)}\n` +
                       `├─ Videos: ${formatNumber(stats.videos)}\n` +
                       `└─ Friends: ${formatNumber(stats.friends)}\n\n` +
                       
                       `🔗 *Profile URL:*\nhttps://tiktok.com/@${profile.username}\n\n` +
                       `📅 *Data fetched:* ${new Date().toLocaleString()}`;

        // Send profile picture with caption
        await sock.sendMessage(jid, {
          image: { url: profile.avatars?.large || profile.avatars?.medium || profile.avatars?.small },
          caption: caption
        }, { quoted: m });

        console.log(`✅ [TIKTOK INFO] Successfully sent profile for @${username}`);

        // Update processing message
        await sock.sendMessage(jid, {
          text: `✅ *Profile Retrieved Successfully!*\n\nDetailed information for @${profile.username} has been sent.`,
          edit: processingMsg.key
        });

      } catch (apiError) {
        console.error('❌ [TIKTOK INFO] API Error:', apiError);
        
        // Try fallback method if main API fails
        try {
          const fallbackInfo = await getFallbackTikTokInfo(username);
          
          if (fallbackInfo.error) {
            throw new Error(fallbackInfo.error);
          }
          
          const fallbackCaption = `╔═══════════════════════════╗\n` +
                                 `║   📊 TIKTOK PROFILE INFO   ║\n` +
                                 `╚═══════════════════════════╝\n\n` +
                                 
                                 `⚠️ *Using alternative data source*\n\n` +
                                 
                                 `👤 *PROFILE DETAILS*\n` +
                                 `├─ Username: @${fallbackInfo.username}\n` +
                                 `├─ Name: ${fallbackInfo.displayName}\n` +
                                 `└─ Verified: ${fallbackInfo.verified ? "✅ Yes" : "❌ No"}\n\n` +
                                 
                                 `📈 *ACCOUNT STATISTICS*\n` +
                                 `├─ Followers: ${formatNumber(fallbackInfo.followers)}\n` +
                                 `├─ Following: ${formatNumber(fallbackInfo.following)}\n` +
                                 `└─ Total Likes: ${formatNumber(fallbackInfo.likes)}\n\n` +
                                 
                                 `${fallbackInfo.bio ? `📝 *BIO*\n${fallbackInfo.bio}\n\n` : ''}` +
                                 `🔗 *Profile URL:*\nhttps://tiktok.com/@${fallbackInfo.username}\n\n` +
                                 `📅 *Data fetched:* ${new Date().toLocaleString()}`;
          
          await sock.sendMessage(jid, {
            text: fallbackCaption
          }, { quoted: m });
          
          await sock.sendMessage(jid, {
            text: `⚠️ *Partial Data Retrieved*\n\nUsing alternative source for @${username}. Some features may be limited.`,
            edit: processingMsg.key
          });
          
        } catch (fallbackError) {
          await sock.sendMessage(jid, {
            text: `❌ *Failed to Fetch Account!*\n\nError: ${apiError.message || 'API unavailable'}\n\n💡 *Try:*\n• Check if username is correct\n• Make sure account is public\n• Try again later`,
            edit: processingMsg.key
          });
        }
      }

    } catch (error) {
      console.error('❌ [TIKTOK INFO] Fatal Error:', error);
      
      await sock.sendMessage(jid, {
        text: `❌ *Unexpected Error!*\n\nAn error occurred while processing your request.\n\nError: ${error.message}`
      }, { quoted: m });
    }
  }
};

// ====== HELPER FUNCTIONS ======

// Format numbers with K/M/B suffix
function formatNumber(num) {
  if (!num && num !== 0) return 'N/A';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Fallback method using simple web scraping
async function getFallbackTikTokInfo(username) {
  try {
    // Try a simple approach using public APIs
    const apis = [
      `https://api.tok.gg/v1/users/@${username}`,
      `https://tiktok-info.p.rapidapi.com/api/getUserInfo?username=${username}`,
      `https://www.tiktok.com/@${username}`
    ];
    
    for (const api of apis) {
      try {
        const response = await axios.get(api, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        if (response.status === 200) {
          const html = response.data;
          
          // Try to extract basic info from HTML
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
          if (titleMatch) {
            const title = titleMatch[1];
            const displayName = title.replace(' TikTok', '').replace(/\(@[^)]+\)/, '').trim();
            
            // Check if account exists
            if (html.includes('Couldn\'t find this account') || html.includes('Page not found')) {
              return { error: 'Account not found' };
            }
            
            // Extract bio from meta description
            const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
            const bio = descMatch ? descMatch[1] : '';
            
            // Try to extract basic stats from description
            let followers = 0, following = 0, likes = 0;
            
            if (bio) {
              const followerMatch = bio.match(/([\d.,]+[KM]?)\s*Followers/i);
              if (followerMatch) followers = parseNumber(followerMatch[1]);
              
              const followingMatch = bio.match(/([\d.,]+[KM]?)\s*Following/i);
              if (followingMatch) following = parseNumber(followingMatch[1]);
              
              const likesMatch = bio.match(/([\d.,]+[KM]?)\s*Likes/i);
              if (likesMatch) likes = parseNumber(likesMatch[1]);
            }
            
            const verified = html.includes('verifiedBadge') || title.includes('✅');
            
            return {
              username: username,
              displayName: displayName || username,
              followers: followers,
              following: following,
              likes: likes,
              bio: bio,
              verified: verified,
              error: null
            };
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return { error: 'All fallback methods failed' };
  } catch (error) {
    return { error: error.message };
  }
}

// Parse number from string
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