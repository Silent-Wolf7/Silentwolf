









import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCurrentMenuStyle } from "./menustyle.js";
import { setLastMenu, getAllFieldsStatus } from "../menus/menuToggles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "menu",
  description: "Shows the Wolf Command Center in various styles",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const style = getCurrentMenuStyle();
    
    // Set the last used menu for toggle commands
    setLastMenu(style);

    console.log(`\n🐺 [MENU] Command received from: ${jid} | Using style: ${style}`);

    try {
      switch (style) {
      case 1: {
  // Add these helper functions (same as other cases)
  const getBotMode = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_mode.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
        path.join(__dirname, '../bot_mode.json'),  // Parent directory
        path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              // Format for display
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              
              return displayMode;
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {
      // Error handling
    }
    
    return '🌍 Public'; // Default fallback
  };
  
  const getBotName = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_settings.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
        path.join(__dirname, '../bot_settings.json'),  // Parent directory
        path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      // Fallback to environment variable
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {
      // Error handling
    }
    
    return 'WOLFBOT'; // Default fallback
  };

  // Load bot name using the helper function
  const botName = getBotName();
  const botMode = getBotMode();

  const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
  const imgPath2 = path.join(__dirname, "../media", "wolfbot.jpg");
  const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;

  if (!imagePath) {
    await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
    return;
  }

  const buffer = fs.readFileSync(imagePath);
  const caption = `*🐺🌕 *${botName}* 🌕🐺*
┌────────────────
│ 🏠 GROUP MANAGEMENT 🏠 
├────────────────
│ 🛡️ ADMIN & MODERATION 🛡️ 
├────────────────
│ add                     
│ promote                 
│ demote                  
│ kick                    
│ ban                     
│ unban                   
│ banlist                 
│ clearbanlist            
│ warn                    
│ mute                    
│ unmute                  
│ gctime                  
│ antileave               
│ antilink                
│ welcome                 
├────────────────
│ 🚫 AUTO-MODERATION 🚫   
├────────────────
│ antisticker             
│ antiviewonce  
│ antilink  
│ antiimage
│ antivideo
│ antiaudio
│ antimention
│ antistatusmention  
│ antigrouplink
├────────────────
│ 📊 GROUP INFO & TOOLS 📊 
├────────────────
│ groupinfo               
│ tagadmin                
│ tagall                  
│ hidetag                 
│ link                    
│ invite                  
│ revoke                  
│ setdesc                 
│ fangtrace               
│ getgpp                  
└────────────────

┌────────────────
│ 👑 OWNER CONTROLS 👑    
├────────────────
│ ⚡ CORE MANAGEMENT ⚡    
├────────────────
│ setbotname              
│ iamowner                
│ about                   
│ setprefix               
│ block                   
│ unblock                 
│ blockdetect             
│ silent                  
│ anticall                
│ mode                    ← ${botMode}
│ online                  
│ setpp                   
│ repo                    
├────────────────
│ 🔄 SYSTEM & MAINTENANCE 🛠️ 
├────────────────
│ restart                 
│ workingreload           
│ reloadenv               
│ getsettings             
│ setsetting              
│ test                    
│ disk                    
│ hostip                  
│ findcommands            
└────────────────

┌────────────────
│ ⚙️ AUTOMATION ⚙️
├────────────────
│ autoread                
│ autotyping              
│ autorecording           
│ autoreact               
│ autoreactstatus         
│ autobio                 
│ autorec                 
└────────────────

┌────────────────
│ ✨ GENERAL UTILITIES ✨  
├────────────────
│ 🔍 INFO & SEARCH 🔎     
├────────────────
│ ping                    
│ time                    
│ uptime                  
│ alive                   
│ define                  
│ news                    
│ covid                   
│ quote                   
│ prefixinfo              
├───────────────
│ 🔗 CONVERSION & MEDIA 📁 
├───────────────
│ translate               
│ shorturl                
│ qrencode                
│ take                    
│ toimage                 
│ tostatus                
│ toaudio                 
│ tovoice                 
│ save                    
│ url                     
├───────────────
│ 📝 PERSONAL TOOLS 📅    
├───────────────
│ goodmorning             
│ goodnight               
└────────────────

├────────────────
│ 🎵 MUSIC & MEDIA 🎶
├────────────────
│ play                    
│ song                    
│ lyrics                  
│ spotify                 
│ video                   
│ video2                  
│ bassboost               
│ trebleboost             
└────────────────

┌───────────────
│ 🤖 MEDIA & AI COMMANDS 🧠 
├───────────────
│ ⬇️ MEDIA DOWNLOADS 📥     
├───────────────
│ youtube                 
│ tiktok                  
│ instagram               
│ facebook                
│ snapchat                
│ apk                     
├───────────────
│ 🎨 AI GENERATION 💡    
├───────────────
│ gpt                     
│ gemini                  
│ deepseek                
│ deepseek+               
│ analyze                 
│ suno                    
│ wolfbot                 
│ videogen                
└───────────────

┌───────────────
│ 🖼️ IMAGE TOOLS 🖼️
├───────────────
│ image                   
│ imagegenerate           
│ anime                   
│ art                     
│ real                    
└───────────────

┌───────────────
│ 🛡️ SECURITY & HACKING 🔒 
├───────────────
│ 🌐 NETWORK & INFO 📡   
├───────────────
│ ipinfo                  
│ shodan                  
│ iplookup                
│ getip                   
└───────────────

┌────────────────
│ 🎨 LOGO DESIGN STUDIO 🎨
├────────────────
│ 🌟 PREMIUM METALS 🌟    
├────────────────
│ goldlogo                
│ silverlogo              
│ platinumlogo            
│ chromelogo              
│ diamondlogo             
│ bronzelogo              
│ steelogo                
│ copperlogo              
│ titaniumlogo            
├────────────────
│ 🔥 ELEMENTAL EFFECTS 🔥  
├────────────────
│ firelogo                
│ icelogo                 
│ iceglowlogo             
│ lightninglogo           
│ aqualogo                
│ rainbowlogo             
│ sunlogo                 
│ moonlogo                
├────────────────
│ 🎭 MYTHICAL & MAGICAL 🧙  
├────────────────
│ dragonlogo              
│ phoenixlogo             
│ wizardlogo              
│ crystallogo             
│ darkmagiclogo           
├────────────────
│ 🌌 DARK & GOTHIC 🌑     
├────────────────
│ shadowlogo              
│ smokelogo               
│ bloodlogo               
├────────────────
│ 💫 GLOW & NEON EFFECTS 🌈  
├────────────────
│ neonlogo                
│ glowlogo                
├────────────────
│ 🤖 TECH & FUTURISTIC 🚀  
├────────────────
│ matrixlogo              
└────────────────
┌────────────────
│ 🐙 GITHUB COMMANDS 🐙
├────────────────
│ gitclone
│ gitinfo
│ repo
│ commits
│ stars
│ watchers
│ release
└────────────────

🐺🌕 POWERED BY WOLF TECH 🌕🐺
*`;

  await sock.sendMessage(jid, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m });
  break;
}
case 2: {
  // Add these helper functions (same as other cases)
  const getBotMode = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_mode.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
        path.join(__dirname, '../bot_mode.json'),  // Parent directory
        path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              // Format for display
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              
              return displayMode;
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {
      // Error handling
    }
    
    return '🌍 Public'; // Default fallback
  };
  
  const getBotName = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_settings.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
        path.join(__dirname, '../bot_settings.json'),  // Parent directory
        path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      // Fallback to environment variable
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {
      // Error handling
    }
    
    return 'WOLFBOT'; // Default fallback
  };

  // Load bot name and mode
  const botName = getBotName();
  const botMode = getBotMode();
  
  // 📝 Text Only
  const text = `🐺🌕 *${botName}* 🌕🐺 | Mode: ${botMode}
────────────────
> 🏠 *GROUP MANAGEMENT* — manage members & group
> • add — add user
> • promote — make admin
> • demote — remove admin
> • kick — remove user
> • ban — ban user
> • unban — unban user
> • banlist — show banned
> • clearbanlist — clear bans
> • warn — warn user
> • unwarn — remove warning
> • clearwarns — reset warnings
> • mute — mute user
> • unmute — unmute user
> • gctime — group time settings
> • lock — lock group
> • unlock — unlock group
> • welcome — set welcome message
> • goodbye — set goodbye message

> 🚫 *AUTO-MODERATION* — auto-protect group
> • antilink — block links
> • antisticker — block stickers
> • antiimage — block images
> • antivideo — block videos
> • antiaudio — block audio
> • antimention — block mentions
> • antistatusmention — block status mentions
> • antigrouplink — block group links

> 📊 *GROUP INFO & TOOLS* — group info commands
> • groupinfo — show info
> • tagadmin — mention admins
> • tagall — mention all
> • hidetag — hide mentions
> • link — show group link
> • invite — generate invite
> • revoke — revoke link
> • setname — change name
> • setdesc — change description
> • setgcpp — change group picture
> • fangtrace — trace user
> • disp — display group stats
> • kickall — kick all members
> • getgpp — get group picture

> 👑 *OWNER CONTROLS* — bot owner commands
> • setbotname — change bot name
> • setprefix — change prefix
> • block — block user
> • unblock — unblock user
> • silent — silent mode
> • mode — change bot mode (${botMode})
> • restart — restart bot
> • setpp — set bot profile
> • resetbotname — reset to default
> • quickname — set quick name

> 🔄 *SYSTEM & MAINTENANCE* — bot maintenance
> • restart — restart bot
> • update — update bot
> • backup — backup data
> • restore — restore data
> • cleardb — clear database
> • cleartemp — clear temp files
> • reloadenv — reload environment
> • test — test system
> • disk — check disk space
> • hostip — get host IP
> • findcommands — search commands

> ✨ *GENERAL UTILITIES* — info & conversions
> • ping — bot ping
> • time — current time
> • uptime — bot uptime
> • alive — check if bot is alive
> • define — word definition
> • news — latest news
> • weather — weather info
> • covid — covid stats
> • quote — random quotes
> • translate — translate text
> • shorturl — shorten URL
> • qrencode — QR encode
> • take — screenshot website
> • toimage — convert to image
> • tostatus — convert to status
> • toaudio — convert to audio
> • tovoice — convert to voice
> • save — save content
> • url — get URL info
> • goodmorning — morning message
> • goodnight — night message

> 🎵 *MUSIC & MEDIA* — entertainment
> • play — play music
> • song — download song
> • lyrics — get lyrics
> • spotify — spotify music
> • video — download video
> • video2 — alternative video
> • bassboost — bass boost audio
> • trebleboost — treble boost

> 🤖 *MEDIA & AI* — media & AI tools
> • youtube — YouTube downloader
> • tiktok — TikTok downloader
> • instagram — Instagram downloader
> • facebook — Facebook downloader
> • snapchat — Snapchat downloader
> • apk — APK downloader
> • gemini — Google AI
> • gpt — OpenAI ChatGPT
> • deepseek — DeepSeek AI
> • deepseek+ — DeepSeek advanced
> • wolfbot — Wolf AI assistant
> • analyze — analyze content
> • suno — Suno AI music
> • videogen — video generator

> 🖼️ *IMAGE TOOLS* — image generation
> • image — generate images
> • imagegenerate — AI image gen
> • anime — anime images
> • art — art images
> • real — realistic images

> 🛡️ *SECURITY & NETWORK* — network & scans
> • ipinfo — IP information
> • shodan — device scanning
> • iplookup — IP lookup
> • getip — get IP address
> • pwcheck — password strength
> • portscan — scan ports
> • subdomains — find subdomains

> 🎨 *LOGO DESIGN STUDIO* — design logos
> • goldlogo — gold style
> • silverlogo — silver style
> • platinumlogo — platinum style
> • chromelogo — chrome style
> • diamondlogo — diamond style
> • bronzelogo — bronze style
> • steelogo — steel style
> • copperlogo — copper style
> • titaniumlogo — titanium style
> • firelogo — fire effect
> • icelogo — ice effect
> • iceglowlogo — glowing ice
> • lightninglogo — lightning effect
> • aqualogo — water effect
> • rainbowlogo — rainbow colors
> • sunlogo — sun style
> • moonlogo — moon style
> • dragonlogo — dragon theme
> • phoenixlogo — phoenix theme
> • wizardlogo — wizard theme
> • crystallogo — crystal style
> • darkmagiclogo — dark magic
> • shadowlogo — shadow effect
> • smokelogo — smoke effect
> • bloodlogo — blood style
> • neonlogo — neon lights
> • glowlogo — glowing effect
> • matrixlogo — matrix style
> • 50+ more logo styles available

> ⚙️ *AUTOMATION* — auto features
> • autoread — auto read messages
> • autotyping — auto typing
> • autorecording — auto recording
> • autoreact — auto reactions
> • autoreactstatus — auto react to status
> • autobio — auto update bio
> • autorec — auto record

> 🐙 *GITHUB COMMANDS* — GitHub tools
> • gitclone — clone repository
> • gitinfo — repo information
> • repo — repository info
> • commits — view commits
> • stars — check stars
> • watchers — check watchers
> • release — view releases

────────────────
📌 *Prefix:* ${global.prefix || "."}
📌 *Mode:* ${botMode}
📌 *Total Commands:* 200+
📌 *Type "${global.prefix || "."}menu <style>" to change menu style*
📌 *Available styles: 1-7*

🐺🌕*POWERED BY WOLF TECH*🌕🐺
`; 
  await sock.sendMessage(jid, { text }, { quoted: m });
  break;
}








case 3: {
  try {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // Add these helper functions (same as other cases)
    const getBotMode = () => {
      try {
        // Check multiple possible locations with priority order
        const possiblePaths = [
          './bot_mode.json',  // Root directory (most likely)
          path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
          path.join(__dirname, '../bot_mode.json'),  // Parent directory
          path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
          path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
          path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
        ];
        
        for (const modePath of possiblePaths) {
          if (fs.existsSync(modePath)) {
            try {
              const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
              
              if (modeData.mode) {
                // Format for display
                let displayMode;
                switch(modeData.mode.toLowerCase()) {
                  case 'public':
                    displayMode = '🌍 Public';
                    break;
                  case 'silent':
                    displayMode = '🔇 Silent';
                    break;
                  default:
                    displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
                }
                
                return displayMode;
              }
            } catch (parseError) {
              // Continue to next path
            }
          }
        }
        
        // Fallback to global variables
        if (global.BOT_MODE) {
          return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
        }
        if (global.mode) {
          return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
        }
        if (process.env.BOT_MODE) {
          return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
        }
        
      } catch (error) {
        // Error handling
      }
      
      return '🌍 Public'; // Default fallback
    };
    
    const getBotName = () => {
      try {
        // Check multiple possible locations with priority order
        const possiblePaths = [
          './bot_settings.json',  // Root directory (most likely)
          path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
          path.join(__dirname, '../bot_settings.json'),  // Parent directory
          path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
          path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
          path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
        ];
        
        for (const settingsPath of possiblePaths) {
          if (fs.existsSync(settingsPath)) {
            try {
              const settingsData = fs.readFileSync(settingsPath, 'utf8');
              const settings = JSON.parse(settingsData);
              
              if (settings.botName && settings.botName.trim() !== '') {
                return settings.botName.trim();
              }
            } catch (parseError) {
              // Continue to next path
            }
          }
        }
        
        // Fallback to global variables
        if (global.BOT_NAME) {
          return global.BOT_NAME;
        }
        
        // Fallback to environment variable
        if (process.env.BOT_NAME) {
          return process.env.BOT_NAME;
        }
        
      } catch (error) {
        // Error handling
      }
      
      return 'SILENT WOLF BOT'; // Default fallback for case 3
    };

    // Read owner information from owner.json
    let ownerJid = "";
    let ownerNumber = "";
    
    try {
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = await fs.readFile(ownerPath, "utf8");
        const ownerInfo = JSON.parse(ownerData);
        
        // Try different possible field names in owner.json
        if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
          ownerNumber = ownerInfo.owner.trim();
        } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
          ownerNumber = ownerInfo.number.trim();
        } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
          ownerNumber = ownerInfo.phone.trim();
        } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
          ownerNumber = ownerInfo.contact.trim();
        } else if (ownerInfo.OWNER_NUMBER && ownerInfo.OWNER_NUMBER.trim() !== '') {
          ownerNumber = ownerInfo.OWNER_NUMBER.trim();
        } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
          // If it's an array, take the first one
          ownerNumber = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
        }
        
        // Get JID
        if (ownerInfo.OWNER_JID && ownerInfo.OWNER_JID.trim() !== '') {
          ownerJid = ownerInfo.OWNER_JID.trim();
        } else if (ownerNumber) {
          ownerJid = `${ownerNumber}@s.whatsapp.net`;
        }
        
        console.log(`📋 Menu - Owner info loaded: ${ownerNumber} | ${ownerJid}`);
      }
    } catch (ownerError) {
      console.error("❌ Menu - Failed to read owner.json:", ownerError.message);
      // Fallback values
      ownerNumber = global.owner || process.env.OWNER_NUMBER || "254703397679";
      ownerJid = `${ownerNumber}@s.whatsapp.net`;
    }

    // Load bot name and mode
    const botName = getBotName();
    const botMode = getBotMode();
    
    console.log(`📋 Menu - Bot name: "${botName}" | Mode: ${botMode}`);

    // 🔧 Fetch GitHub user data
    const githubOwner = "777Wolf-dot";
    const githubUserUrl = `https://api.github.com/users/${githubOwner}`;
    
    let githubData = {
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      html_url: `https://github.com/${githubOwner}`,
      name: githubOwner,
      public_repos: "50+",
      followers: "100+"
    };
    
    try {
      const { data } = await axios.get(
        githubUserUrl,
        { 
          headers: { 
            "User-Agent": "Wolf-Bot-Menu",
            "Accept": "application/vnd.github.v3+json"
          },
          timeout: 5000
        }
      );
      githubData = {
        ...githubData,
        ...data,
        name: data.name || githubOwner
      };
    } catch (githubError) {
      console.log("⚠️ Using fallback GitHub data:", githubError.message);
    }

    // Get bot stats
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
    const memoryPercent = ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(1);

    const menuText = `
╭─── 🐺 *${botName}* 🐺 ───
│
│ 📊 *Bot Status:*
│ ⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
│ 💾 Memory: ${usedMemory}MB / ${totalMemory}MB (${memoryPercent}%)
│ ⚙️ Mode: ${botMode}
│ 👑 Owner: @${ownerNumber || "Unknown"}
│ 🔗 GitHub: ${githubData.name || githubOwner}
│
│────── BOT MENU ──────

│ ┌── GROUP MANAGEMENT ──
│ │ add
│ │ promote
│ │ demote
│ │ kick
│ │ ban
│ │ unban
│ │ banlist
│ │ clearbanlist
│ │ warn
│ │ mute
│ │ unmute
│ │ gctime
│ │ antisticker
│ │ groupinfo
│ │ tagadmin
│ │ tagall
│ │ hidetag
│ │ link
│ │ invite
│ │ revoke
│ │ setdesc
│ │ fangtrace
│ │ disp
│ │ kickall
│ │ getgpp
│ │ vcf
│ └─────────────────

│ ┌── OWNER CONTROLS ──
│ │ setprefix
│ │ block
│ │ unblock
│ │ silent
│ │ setbotname
│ │ setpp
│ │ restart
│ │ autotype
│ │ mode
│ │ resetbotname
│ └─────────────────

│ ┌── GENERAL UTILITIES ─
│ │ ping
│ │ time
│ │ uptime
│ │ about
│ │ repo
│ │ alive
│ │ define
│ │ wiki
│ │ news
│ │ weather
│ │ covid
│ │ quote
│ │ translate
│ │ shorturl
│ │ qrencode
│ │ qrdecode
│ │ reverseimage
│ │ toaudio
│ │ tovoice
│ │ save
│ │ goodmorning
│ │ goodnight
│ └─────────────────

│ ┌── MUSIC & FUN ──
│ │ play
│ │ song
│ │ lyrics
│ │ spotify
│ │ video
│ │ video2
│ │ bassboost
│ │ trebleboost
│ └─────────────────

│ ┌── MEDIA & AI ──
│ │ tiktokdl
│ │ instagram
│ │ youtube
│ │ facebook
│ │ snapchat
│ │ gemini
│ │ gpt
│ │ deepseek
│ │ wolfbot
│ │ videogen
│ │ suno
│ │ analyze
│ └─────────────────

│ ┌── IMAGE TOOLS ──
│ │ image
│ │ imagegenerate
│ │ anime
│ │ art
│ │ real
│ └─────────────────

│ ┌── SECURITY & HACKING ──
│ │ ipinfo
│ │ shodan
│ │ iplookup
│ │ getip
│ │ pwcheck
│ │ portscan
│ │ subdomains
│ └─────────────────

│ ┌── LOGO DESIGN ──
│ │ goldlogo
│ │ silverlogo
│ │ platinumlogo
│ │ chromelogo
│ │ diamondlogo
│ │ bronzelogo
│ │ steelogo
│ │ copperlogo
│ │ titaniumlogo
│ │ firelogo
│ │ icelogo
│ │ iceglowlogo
│ │ lightninglogo
│ │ aqualogo
│ │ rainbowlogo
│ │ sunlogo
│ │ moonlogo
│ │ volcanologo
│ │ thunderlogo
│ │ windlogo
│ │ earthlogo
│ │ waterlogo
│ │ forestlogo
│ │ dragonlogo
│ │ phoenixlogo
│ │ wizardlogo
│ │ crystallogo
│ │ magiclogo
│ │ darkmagiclogo
│ │ shadowlogo
│ │ smokelogo
│ │ bloodlogo
│ │ shadowflamelogo
│ │ venomlogo
│ │ skullogo
│ │ nightlogo
│ │ hellfirelogo
│ │ neonlogo
│ │ glowlogo
│ │ lightlogo
│ │ neonflamelogo
│ │ cyberlogo
│ │ matrixlogo
│ │ techlogo
│ │ hologramlogo
│ │ vaporlogo
│ │ pixelogo
│ │ futuristiclogo
│ │ digitalogo
│ │ cartoonlogo
│ │ comiclogo
│ │ graffitilogo
│ │ retrologo
│ │ popartlogo
│ └─────────────────

│── 🐺 POWERED BY WOLFTECH 🐺 ──

📌 *Usage:* Prefix + command (e.g., .ping)
📌 *Prefix:* ${global.prefix || "."}
📌 *Mode:* ${botMode}
📌 *Total Commands:* 150+
📌 *Need help?* Contact: @${ownerNumber}
    `.trim();

    await sock.sendMessage(
      jid,
      {
        text: menuText,
        contextInfo: {
          mentionedJid: ownerJid ? [ownerJid] : [],
          externalAdReply: {
            title: `🐺 ${botName}`,
            body: `Mode: ${botMode} | Uptime: ${hours}h | Owner: ${ownerNumber}`,
            mediaType: 1,
            thumbnailUrl: githubData.avatar_url,
            sourceUrl: githubData.html_url,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      },
      { quoted: m }
    );

    console.log(`✅ Menu sent with GitHub integration | Bot: "${botName}" | Owner: ${ownerNumber}`);

  } catch (err) {
    console.error("❌ Menu error:", err.message || err);
    
    // Fallback simple menu
    const fallbackText = `
╭── 🐺 SILENT WOLF BOT ──
│
│ 📁 Group Management: add, promote, demote, kick, ban, unban
│ 👑 Owner Controls: setprefix, block, unblock, restart
│ 🛠️ Utilities: ping, time, about, repo, alive, weather
│ 🎵 Music: play, song, bassboost
│ 🎭 Media & AI: tiktokdl, gemini, gpt, deepseek
│ 🔐 Security: ipinfo, shodan, iplookup
│ 🎨 Logo Design: 50+ logo styles available
│
╰── Prefix: ${global.prefix || "."} | Mode: ${global.mode || "public"}

💡 *Full menu temporarily unavailable*
👑 Maintained by: ${global.owner || "Owner"}
    `.trim();
    
    await sock.sendMessage(
      m.key.remoteJid,
      { 
        text: fallbackText,
        contextInfo: {
          externalAdReply: {
            title: "Wolf Bot Menu",
            body: "Basic menu - Full features available",
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
  break;
}














      case 4: {
  // 🖼️ Full info + image + commands
  
  // Add these helper functions (same as other cases)
  const getBotMode = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_mode.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
        path.join(__dirname, '../bot_mode.json'),  // Parent directory
        path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              // Format for display
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              
              return displayMode;
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {
      // Error handling
    }
    
    return '🌍 Public'; // Default fallback
  };
  
  const getBotName = () => {
    try {
      // Check multiple possible locations with priority order
      const possiblePaths = [
        './bot_settings.json',  // Root directory (most likely)
        path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
        path.join(__dirname, '../bot_settings.json'),  // Parent directory
        path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
        path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
        path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      // Fallback to global variables
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      // Fallback to environment variable
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {
      // Error handling
    }
    
    return 'WOLFBOT'; // Default fallback
  };
  
  // Load bot name using the helper function
  const botName = getBotName();
  
  const start = performance.now();
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const mnt = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const uptimeStr = `${h}h ${mnt}m ${s}s`;
  const speed = (performance.now() - start).toFixed(2);
  const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
  const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
  const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

  // Load owner from owner.json file (improved version)
  let ownerNumber = "Unknown";
  try {
    const ownerPath = path.join(__dirname, 'owner.json');
    if (fs.existsSync(ownerPath)) {
      const ownerData = fs.readFileSync(ownerPath, 'utf8');
      const ownerInfo = JSON.parse(ownerData);
      
      // Try different possible field names in owner.json
      if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
        ownerNumber = ownerInfo.owner.trim();
      } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
        ownerNumber = ownerInfo.number.trim();
      } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
        ownerNumber = ownerInfo.phone.trim();
      } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
        ownerNumber = ownerInfo.contact.trim();
      } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
        // If it's an array, take the first one
        ownerNumber = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
      }
    }
  } catch (ownerError) {
    // Fallback to environment variable or global
    ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
  }

  // Load bot mode using the helper function
  const botMode = getBotMode();

  const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
  const prefix = global.prefix || ".";
  const version = global.version || "v2.6.2";

  const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
  const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
  const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
  if (!imagePath) {
    await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
    return;
  }
  const buffer = fs.readFileSync(imagePath);

  const infoCaption = `
│────── ${botName} ──────│
┃ User: ${m.pushName || "Anonymous"}
┃ Owner: ${ownerNumber}
┃ Mode: ${botMode}
┃ Host: ${host}
┃ Speed: ${speed} ms
┃ Prefix: [ ${prefix} ]
┃ Uptime: ${uptimeStr}
┃ Version: ${version}
┃ Usage: ${usedMem} MB of ${totalMem} GB
┃ RAM: ${memBar} ${memPercent}%
└────────────────
`;

  const commandsText = `│ ┌── GROUP MANAGEMENT ──
│ │ add
│ │ promote
│ │ demote
│ │ kick
│ │ ban
│ │ unban
│ │ banlist
│ │ clearbanlist
│ │ warn
│ │ mute
│ │ unmute
│ │ gctime
│ │ antisticker
│ │ groupinfo
│ │ tagadmin
│ │ tagall
│ │ hidetag
│ │ link
│ │ invite
│ │ revoke
│ │ setdesc
│ │ fangtrace
│ │ disp
│ │ kickall
│ │ getgpp
│ │ vcf
│ └─────────────────

│ ┌── OWNER CONTROLS ──
│ │ setprefix
│ │ block
│ │ unblock
│ │ silent
│ │ setbotname
│ │ setpp
│ │ restart
│ │ autotype
│ │ mode
│ └─────────────────

│ ┌── GENERAL UTILITIES ─
│ │ ping
│ │ time
│ │ uptime
│ │ about
│ │ repo
│ │ alive
│ │ define
│ │ wiki
│ │ news
│ │ weather
│ │ covid
│ │ quote
│ │ translate
│ │ shorturl
│ │ qrencode
│ │ qrdecode
│ │ reverseimage
│ │ toaudio
│ │ tovoice
│ │ save
│ │ goodmorning
│ │ goodnight
│ └─────────────────

│ ┌── MUSIC & FUN ──
│ │ play
│ │ song
│ │ lyrics
│ │ spotify
│ │ video
│ │ video2
│ │ bassboost
│ │ trebleboost
│ └─────────────────

│ ┌── MEDIA & AI ──
│ │ tiktokdl
│ │ instagram
│ │ youtube
│ │ facebook
│ │ snapchat
│ │ gemini
│ │ gpt
│ │ deepseek
│ │ wolfbot
│ │ videogen
│ │ suno
│ │ analyze
│ └─────────────────

│ ┌── IMAGE TOOLS ──
│ │ image
│ │ imagegenerate
│ │ anime
│ │ art
│ │ real
│ └─────────────────

│ ┌── SECURITY & HACKING ──
│ │ ipinfo
│ │ shodan
│ │ iplookup
│ │ getip
│ │ pwcheck
│ │ portscan
│ │ subdomains
│ └─────────────────

│ ┌── LOGO DESIGN ──
│ │ goldlogo
│ │ silverlogo
│ │ platinumlogo
│ │ chromelogo
│ │ diamondlogo
│ │ bronzelogo
│ │ steelogo
│ │ copperlogo
│ │ titaniumlogo
│ │ firelogo
│ │ icelogo
│ │ iceglowlogo
│ │ lightninglogo
│ │ aqualogo
│ │ rainbowlogo
│ │ sunlogo
│ │ moonlogo
│ │ volcanologo
│ │ thunderlogo
│ │ windlogo
│ │ earthlogo
│ │ waterlogo
│ │ forestlogo
│ │ dragonlogo
│ │ phoenixlogo
│ │ wizardlogo
│ │ crystallogo
│ │ magiclogo
│ │ darkmagiclogo
│ │ shadowlogo
│ │ smokelogo
│ │ bloodlogo
│ │ shadowflamelogo
│ │ venomlogo
│ │ skullogo
│ │ nightlogo
│ │ hellfirelogo
│ │ neonlogo
│ │ glowlogo
│ │ lightlogo
│ │ neonflamelogo
│ │ cyberlogo
│ │ matrixlogo
│ │ techlogo
│ │ hologramlogo
│ │ vaporlogo
│ │ pixelogo
│ │ futuristiclogo
│ │ digitalogo
│ │ cartoonlogo
│ │ comiclogo
│ │ graffitilogo
│ │ retrologo
│ │ popartlogo
│ └─────────────────

│── 🐺 POWERED BY WOLFTECH 🐺 ──
`;

  await sock.sendMessage(jid, { image: buffer, caption: infoCaption + commandsText, mimetype: "image/jpeg" }, { quoted: m });
  break;
}





case 5: {
  // 📝 Full info + commands (with individual toggles)
  let finalText = "";
  
  // Add these helper functions at the start of case 5 (same as case 7)
  const getBotMode = () => {
    try {
      const possiblePaths = [
        './bot_mode.json',
        path.join(__dirname, 'bot_mode.json'),
        path.join(__dirname, '../bot_mode.json'),
        path.join(__dirname, '../../bot_mode.json'),
        path.join(__dirname, '../../../bot_mode.json'),
        path.join(__dirname, '../commands/owner/bot_mode.json'),
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                case 'private':
                  displayMode = '🔒 Private';
                  break;
                case 'group-only':
                  displayMode = '👥 Group Only';
                  break;
                case 'maintenance':
                  displayMode = '🛠️ Maintenance';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              return displayMode;
            }
          } catch (parseError) {}
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {}
    
    return '🌍 Public';
  };
  
  const getBotName = () => {
    try {
      const possiblePaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
        path.join(__dirname, '../../../bot_settings.json'),
        path.join(__dirname, '../commands/owner/bot_settings.json'),
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {}
    
    return 'WOLFBOT';
  };
  
  const getOwnerName = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.ownerName && settings.ownerName.trim() !== '') {
              return settings.ownerName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
          return ownerInfo.owner.trim();
        } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
          return ownerInfo.number.trim();
        } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
          return ownerInfo.phone.trim();
        } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
          return ownerInfo.contact.trim();
        } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
          const owner = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
          return owner;
        }
      }
      
      if (global.OWNER_NAME) {
        return global.OWNER_NAME;
      }
      if (global.owner) {
        return global.owner;
      }
      if (process.env.OWNER_NUMBER) {
        return process.env.OWNER_NUMBER;
      }
      
    } catch (error) {}
    
    return 'Unknown';
  };
  
  const getBotPrefix = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.prefix && settings.prefix.trim() !== '') {
              return settings.prefix.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.prefix) {
        return global.prefix;
      }
      
      if (process.env.PREFIX) {
        return process.env.PREFIX;
      }
      
    } catch (error) {}
    
    return '.';
  };
  
  const getBotVersion = () => {
    try {
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.version && ownerInfo.version.trim() !== '') {
          return ownerInfo.version.trim();
        }
      }
      
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.version && settings.version.trim() !== '') {
              return settings.version.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.VERSION) {
        return global.VERSION;
      }
      
      if (global.version) {
        return global.version;
      }
      
      if (process.env.VERSION) {
        return process.env.VERSION;
      }
      
    } catch (error) {}
    
    return 'v1.0.0';
  };
  
  const getDeploymentPlatform = () => {
    // Detect deployment platform
    if (process.env.REPL_ID || process.env.REPLIT_DB_URL) {
      return {
        name: 'Replit',
        status: 'Active',
        icon: '🌀'
      };
    } else if (process.env.HEROKU_APP_NAME) {
      return {
        name: 'Heroku',
        status: 'Active',
        icon: '🦸'
      };
    } else if (process.env.RENDER_SERVICE_ID) {
      return {
        name: 'Render',
        status: 'Active',
        icon: '⚡'
      };
    } else if (process.env.RAILWAY_ENVIRONMENT) {
      return {
        name: 'Railway',
        status: 'Active',
        icon: '🚂'
      };
    } else if (process.env.VERCEL) {
      return {
        name: 'Vercel',
        status: 'Active',
        icon: '▲'
      };
    } else if (process.env.GLITCH_PROJECT_REMIX) {
      return {
        name: 'Glitch',
        status: 'Active',
        icon: '🎏'
      };
    } else if (process.env.KOYEB) {
      return {
        name: 'Koyeb',
        status: 'Active',
        icon: '☁️'
      };
    } else if (process.env.CYCLIC_URL) {
      return {
        name: 'Cyclic',
        status: 'Active',
        icon: '🔄'
      };
    } else if (process.env.PANEL) {
      return {
        name: 'PteroPanel',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.env.SSH_CONNECTION || process.env.SSH_CLIENT) {
      return {
        name: 'VPS/SSH',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.platform === 'win32') {
      return {
        name: 'Windows PC',
        status: 'Active',
        icon: '💻'
      };
    } else if (process.platform === 'linux') {
      return {
        name: 'Linux VPS',
        status: 'Active',
        icon: '🐧'
      };
    } else if (process.platform === 'darwin') {
      return {
        name: 'MacOS',
        status: 'Active',
        icon: '🍎'
      };
    } else {
      return {
        name: 'Local Machine',
        status: 'Active',
        icon: '🏠'
      };
    }
  };
  
  const getTimeZone = () => {
    try {
      // Try to get timezone from system
      if (process.env.TZ) {
        return process.env.TZ;
      }
      
      // Try to detect from Intl
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        return timeZone;
      }
      
      // Fallback based on environment
      if (process.env.REPL_ID) {
        return 'America/Los_Angeles'; // Replit default
      } else if (process.env.HEROKU_APP_NAME) {
        return 'UTC'; // Heroku default
      } else if (process.env.RENDER) {
        return 'UTC'; // Render default
      }
      
    } catch (error) {}
    
    return 'UTC';
  };
  
  const getCorePower = () => {
    try {
      const cpus = os.cpus();
      if (cpus && cpus.length > 0) {
        const model = cpus[0].model;
        const cores = cpus.length;
        const speed = cpus[0].speed;
        
        // Calculate performance score
        let performance = 'Low';
        let icon = '🐢';
        
        if (cores >= 8 && speed >= 3000) {
          performance = 'Ultra';
          icon = '🚀';
        } else if (cores >= 4 && speed >= 2500) {
          performance = 'High';
          icon = '⚡';
        } else if (cores >= 2 && speed >= 2000) {
          performance = 'Medium';
          icon = '⚙️';
        }
        
        return {
          cores: cores,
          speed: `${(speed / 1000).toFixed(1)} GHz`,
          performance: performance,
          icon: icon,
          model: model.length > 30 ? model.substring(0, 30) + '...' : model
        };
      }
    } catch (error) {}
    
    return {
      cores: 'N/A',
      speed: 'N/A',
      performance: 'Unknown',
      icon: '❓',
      model: 'Unknown CPU'
    };
  };
  
  // Get current time and date
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Load bot information using helper functions
  const botName = getBotName();
  const ownerName = getOwnerName();
  const botPrefix = getBotPrefix();
  const botVersion = getBotVersion();
  const botMode = getBotMode();
  const deploymentPlatform = getDeploymentPlatform();
  const timeZone = getTimeZone();
  const corePower = getCorePower();
  
  // Add bot name header before the info section
  finalText += `> *🐺🌕 *${botName}* 🌕🐺*\n`;
  
  // Add info section only if any field is enabled
  const fieldsStatus = getAllFieldsStatus(style);
  if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
    const start = performance.now();
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mnt = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${mnt}m ${s}s`;
    const speed = (performance.now() - start).toFixed(2);
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
    
    // SAFE CALCULATION: Prevent negative or invalid percentages
    const memPercentNum = ((usedMem / (totalMem * 1024)) * 100);
    const memPercent = Math.min(Math.max(parseFloat(memPercentNum.toFixed(0)), 0), 100);
    
    // SAFE BAR CALCULATION: Prevent negative repeat values
    const filledBars = Math.max(Math.floor(memPercent / 10), 0);
    const emptyBars = Math.max(10 - filledBars, 0);
    const memBar = "█".repeat(filledBars) + "░".repeat(emptyBars);
    
    // Get Node.js version
    const nodeVersion = process.version;
    
    // Calculate command speed in milliseconds
    const commandSpeed = `${speed}ms`;
    
    // Get CPU load with safe calculation
    const cpuLoad = Math.min(parseFloat(os.loadavg()[0].toFixed(2)), 5);
    const cpuLoadBars = Math.max(Math.floor(cpuLoad), 0);
    const cpuLoadEmpty = Math.max(5 - cpuLoadBars, 0);
    const cpuLoadBar = "█".repeat(cpuLoadBars) + "░".repeat(cpuLoadEmpty);
    
    const infoLines = [];
    
    // TIME & DATE SECTION
    if (fieldsStatus.time || fieldsStatus.date) {
      infoLines.push(`> ┃ Date: ${currentDate}`);
      infoLines.push(`> ┃ Time: ${currentTime}`);
    }
    
    // SYSTEM INFO SECTION
    if (fieldsStatus.user) infoLines.push(`> ┃ User: ${m.pushName || "Anonymous"}`);
    if (fieldsStatus.owner) infoLines.push(`> ┃ Owner: ${ownerName}`);
    if (fieldsStatus.mode) infoLines.push(`> ┃ Mode: ${botMode}`);
    if (fieldsStatus.prefix) infoLines.push(`> ┃ Prefix: [ ${botPrefix} ]`);
    if (fieldsStatus.version) infoLines.push(`> ┃ Version: ${botVersion}`);
    
    // DEPLOYMENT & PLATFORM
    if (fieldsStatus.host) {
      infoLines.push(`> ┃ Panel: ${deploymentPlatform.name}`);
      infoLines.push(`> ┃ Status: ${deploymentPlatform.status}`);
    }
    
    // PERFORMANCE METRICS
    if (fieldsStatus.speed) {
      infoLines.push(`> ┃ Speed: ${commandSpeed}`);
      infoLines.push(`> ┃ CPU Load: ${cpuLoadBar} ${cpuLoad}`);
    }

    if (fieldsStatus.uptime) infoLines.push(`> ┃ Uptime: ${uptimeStr}`);
    if (fieldsStatus.usage) infoLines.push(`> ┃ Usage: ${usedMem} MB of ${totalMem} GB`);
    if (fieldsStatus.ram) infoLines.push(`> ┃ RAM: ${memBar} ${memPercent}%`);

    // CORE POWER (HARDWARE INFO)
    if (fieldsStatus.ram || fieldsStatus.usage) { // Reuse existing toggles for core power
      infoLines.push(`> ┃ ${corePower.icon} Cores: ${corePower.cores} @ ${corePower.speed}`);
      infoLines.push(`> ┃ Power: ${corePower.performance} Performance`);
      infoLines.push(`> ┃ CPU: ${corePower.model}`);
    }
    
    // NODE & TECH STACK
    if (fieldsStatus.version) { // Reuse version toggle for Node info
      infoLines.push(`> ┃ Node: ${nodeVersion}`);
      infoLines.push(`> ┃ Timezone: ${timeZone}`);
    }

    if (infoLines.length > 0) {
      const infoText = `> ┌────────────────\n${infoLines.join('\n')}\n> └────────────────\n`;
      finalText += infoText;
    }
  }

  const commandsText = `> ┌────────────────
> │ 🏠 *GROUP MANAGEMENT* 🏠 
> ├────────────────
> │ 🛡️ *ADMIN & MODERATION* 🛡️ 
> ├────────────────
> │ • add                     
> │ • promote                 
> │ • demote                  
> │ • kick                    
> │ • kickall                 
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • resetwarn               
> │ • setwarn                 
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • antileave               
> │ • antilink                
> │ • welcome                 
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antisticker             
> │ • antiviewonce  
> │ • antilink  
> │ • antiimage
> │ • antivideo
> │ • antiaudio
> │ • antimention
> │ • antistatusmention  
> │ • antigrouplink
> ├────────────────
> │ 📊 *GROUP INFO & TOOLS* 📊 
> ├────────────────
> │ • groupinfo               
> │ • tagadmin                
> │ • tagall                  
> │ • hidetag                 
> │ • link                    
> │ • invite                  
> │ • revoke                  
> │ • setdesc                 
> │ • fangtrace               
> │ • getgpp                  
> └────────────────

> ┌────────────────
> │ 🎨 *MENU COMMANDS* 🎨
> ├────────────────
> │ • togglemenuinfo
> │ • setmenuimage
> │ • resetmenuinfo
> │ • menustyle
> └────────────────

> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setbotname              
> │ • setowner                
> │ • setprefix               
> │ • iamowner                
> │ • about                   
> │ • block                   
> │ • unblock                 
> │ • blockdetect             
> │ • silent                  
> │ • anticall                
> │ • mode                    
> │ • online                  
> │ • setpp                   
> │ • repo                    
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • workingreload           
> │ • reloadenv               
> │ • getsettings             
> │ • setsetting              
> │ • test                    
> │ • disk                    
> │ • hostip                  
> │ • findcommands            
> └────────────────

> ┌────────────────
> │ ⚙️ *AUTOMATION* ⚙️
> ├────────────────
> │ • autoread                
> │ • autotyping              
> │ • autorecording           
> │ • autoreact               
> │ • autoreactstatus         
> │ • autobio                 
> │ • autorec                 
> └────────────────

> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎
> ├────────────────
> │ • alive
> │ • ping
> │ • ping2
> │ • time
> │ • connection
> │ • define
> │ • news
> │ • covid
> │ • iplookup
> │ • getip
> │ • getpp
> │ • getgpp
> │ • prefixinfo
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁
> ├───────────────
> │ • shorturl
> │ • qrencode
> │ • take
> │ • imgbb
> │ • tiktok
> │ • save
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅
> ├───────────────
> │ • pair
> │ • resetwarn
> │ • setwarn
> └────────────────

> ┌────────────────
> │ 🎵 *MUSIC & MEDIA* 🎶
> ├────────────────
> │ • play                    
> │ • song                    
> │ • lyrics                  
> │ • spotify                 
> │ • video                   
> │ • video2                  
> │ • bassboost               
> │ • trebleboost             
> └────────────────

> ┌───────────────
> │ 🤖 *MEDIA & AI COMMANDS* 🧠 
> ├───────────────
> │ ⬇️ *MEDIA DOWNLOADS* 📥     
> ├───────────────
> │ • youtube                 
> │ • tiktok                 
> │ • instagram               
> │ • facebook                
> │ • snapchat                
> │ • apk                     
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gpt                     
> │ • gemini                  
> │ • deepseek                
> │ • deepseek+               
> │ • analyze                 
> │ • suno                    
> │ • wolfbot                 
> │ • videogen                
> └───────────────

> ┌───────────────
> │ 🖼️ *IMAGE TOOLS* 🖼️
> ├───────────────
> │ • image                   
> │ • imagegenerate           
> │ • anime                   
> │ • art                     
> │ • real                    
> └───────────────

> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo                  
> │ • shodan                  
> │ • iplookup                
> │ • getip                   
> └───────────────

> ┌────────────────
> │ 🎨 *LOGO DESIGN STUDIO* 🎨
> ├────────────────
> │ 🌟 *PREMIUM METALS* 🌟    
> ├────────────────
> │ • goldlogo                
> │ • silverlogo              
> │ • platinumlogo            
> │ • chromelogo              
> │ • diamondlogo             
> │ • bronzelogo              
> │ • steelogo                
> │ • copperlogo              
> │ • titaniumlogo            
> ├────────────────
> │ 🔥 *ELEMENTAL EFFECTS* 🔥  
> ├────────────────
> │ • firelogo                
> │ • icelogo                 
> │ • iceglowlogo             
> │ • lightninglogo           
> │ • aqualogo                
> │ • rainbowlogo             
> │ • sunlogo                 
> │ • moonlogo                
> ├────────────────
> │ 🎭 *MYTHICAL & MAGICAL* 🧙  
> ├────────────────
> │ • dragonlogo              
> │ • phoenixlogo             
> │ • wizardlogo              
> │ • crystallogo             
> │ • darkmagiclogo           
> ├────────────────
> │ 🌌 *DARK & GOTHIC* 🌑     
> ├────────────────
> │ • shadowlogo              
> │ • smokelogo               
> │ • bloodlogo               
> ├────────────────
> │ 💫 *GLOW & NEON EFFECTS* 🌈  
> ├────────────────
> │ • neonlogo                
> │ • glowlogo                
> ├────────────────
> │ 🤖 *TECH & FUTURISTIC* 🚀  
> ├────────────────
> │ • matrixlogo              
> └────────────────

> ┌────────────────
> │ 🐙 *GITHUB COMMANDS* 🐙
> ├────────────────
> │ • gitclone
> │ • gitinfo
> │ • repo
> │ • commits
> │ • stars
> │ • watchers
> │ • release
> └────────────────

> ┌────────────────
> │ 🌸 *ANIME COMMANDS* 🌸
> ├────────────────
> │ • awoo
> │ • bj
> │ • bully
> │ • cringe
> │ • cry
> │ • cuddle
> │ • dance
> │ • glomp
> │ • highfive
> │ • kill
> │ • kiss
> │ • lick
> │ • megumin
> │ • neko
> │ • pat
> │ • shinobu
> │ • trap
> │ • trap2
> │ • waifu
> │ • wink
> │ • yeet
> └────────────────

> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`;

  finalText += commandsText;
  await sock.sendMessage(jid, { text: finalText }, { quoted: m });
  break;
}











case 6: {
  // 🖼️ Full info + image + commands (with individual toggles)
  let finalCaption = "";
  
  // Add these helper functions at the start of case 6 (same as case 7)
  const getBotMode = () => {
    try {
      const possiblePaths = [
        './bot_mode.json',
        path.join(__dirname, 'bot_mode.json'),
        path.join(__dirname, '../bot_mode.json'),
        path.join(__dirname, '../../bot_mode.json'),
        path.join(__dirname, '../../../bot_mode.json'),
        path.join(__dirname, '../commands/owner/bot_mode.json'),
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                case 'private':
                  displayMode = '🔒 Private';
                  break;
                case 'group-only':
                  displayMode = '👥 Group Only';
                  break;
                case 'maintenance':
                  displayMode = '🛠️ Maintenance';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              return displayMode;
            }
          } catch (parseError) {}
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {}
    
    return '🌍 Public';
  };
  
  const getBotName = () => {
    try {
      const possiblePaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
        path.join(__dirname, '../../../bot_settings.json'),
        path.join(__dirname, '../commands/owner/bot_settings.json'),
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {}
    
    return 'WOLFBOT';
  };
  
  const getOwnerName = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.ownerName && settings.ownerName.trim() !== '') {
              return settings.ownerName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
          return ownerInfo.owner.trim();
        } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
          return ownerInfo.number.trim();
        } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
          return ownerInfo.phone.trim();
        } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
          return ownerInfo.contact.trim();
        } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
          const owner = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
          return owner;
        }
      }
      
      if (global.OWNER_NAME) {
        return global.OWNER_NAME;
      }
      if (global.owner) {
        return global.owner;
      }
      if (process.env.OWNER_NUMBER) {
        return process.env.OWNER_NUMBER;
      }
      
    } catch (error) {}
    
    return 'Unknown';
  };
  
  const getBotPrefix = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.prefix && settings.prefix.trim() !== '') {
              return settings.prefix.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.prefix) {
        return global.prefix;
      }
      
      if (process.env.PREFIX) {
        return process.env.PREFIX;
      }
      
    } catch (error) {}
    
    return '.';
  };
  
  const getBotVersion = () => {
    try {
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.version && ownerInfo.version.trim() !== '') {
          return ownerInfo.version.trim();
        }
      }
      
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.version && settings.version.trim() !== '') {
              return settings.version.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.VERSION) {
        return global.VERSION;
      }
      
      if (global.version) {
        return global.version;
      }
      
      if (process.env.VERSION) {
        return process.env.VERSION;
      }
      
    } catch (error) {}
    
    return 'v1.0.0';
  };
  
  const getDeploymentPlatform = () => {
    // Detect deployment platform
    if (process.env.REPL_ID || process.env.REPLIT_DB_URL) {
      return {
        name: 'Replit',
        status: 'Active',
        icon: '🌀'
      };
    } else if (process.env.HEROKU_APP_NAME) {
      return {
        name: 'Heroku',
        status: 'Active',
        icon: '🦸'
      };
    } else if (process.env.RENDER_SERVICE_ID) {
      return {
        name: 'Render',
        status: 'Active',
        icon: '⚡'
      };
    } else if (process.env.RAILWAY_ENVIRONMENT) {
      return {
        name: 'Railway',
        status: 'Active',
        icon: '🚂'
      };
    } else if (process.env.VERCEL) {
      return {
        name: 'Vercel',
        status: 'Active',
        icon: '▲'
      };
    } else if (process.env.GLITCH_PROJECT_REMIX) {
      return {
        name: 'Glitch',
        status: 'Active',
        icon: '🎏'
      };
    } else if (process.env.KOYEB) {
      return {
        name: 'Koyeb',
        status: 'Active',
        icon: '☁️'
      };
    } else if (process.env.CYCLIC_URL) {
      return {
        name: 'Cyclic',
        status: 'Active',
        icon: '🔄'
      };
    } else if (process.env.PANEL) {
      return {
        name: 'PteroPanel',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.env.SSH_CONNECTION || process.env.SSH_CLIENT) {
      return {
        name: 'VPS/SSH',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.platform === 'win32') {
      return {
        name: 'Windows PC',
        status: 'Active',
        icon: '💻'
      };
    } else if (process.platform === 'linux') {
      return {
        name: 'Linux VPS',
        status: 'Active',
        icon: '🐧'
      };
    } else if (process.platform === 'darwin') {
      return {
        name: 'MacOS',
        status: 'Active',
        icon: '🍎'
      };
    } else {
      return {
        name: 'Local Machine',
        status: 'Active',
        icon: '🏠'
      };
    }
  };
  
  const getTimeZone = () => {
    try {
      // Try to get timezone from system
      if (process.env.TZ) {
        return process.env.TZ;
      }
      
      // Try to detect from Intl
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        return timeZone;
      }
      
      // Fallback based on environment
      if (process.env.REPL_ID) {
        return 'America/Los_Angeles'; // Replit default
      } else if (process.env.HEROKU_APP_NAME) {
        return 'UTC'; // Heroku default
      } else if (process.env.RENDER) {
        return 'UTC'; // Render default
      }
      
    } catch (error) {}
    
    return 'UTC';
  };
  
  const getCorePower = () => {
    try {
      const cpus = os.cpus();
      if (cpus && cpus.length > 0) {
        const model = cpus[0].model;
        const cores = cpus.length;
        const speed = cpus[0].speed;
        
        // Calculate performance score
        let performance = 'Low';
        let icon = '🐢';
        
        if (cores >= 8 && speed >= 3000) {
          performance = 'Ultra';
          icon = '🚀';
        } else if (cores >= 4 && speed >= 2500) {
          performance = 'High';
          icon = '⚡';
        } else if (cores >= 2 && speed >= 2000) {
          performance = 'Medium';
          icon = '⚙️';
        }
        
        return {
          cores: cores,
          speed: `${(speed / 1000).toFixed(1)} GHz`,
          performance: performance,
          icon: icon,
          model: model.length > 30 ? model.substring(0, 30) + '...' : model
        };
      }
    } catch (error) {}
    
    return {
      cores: 'N/A',
      speed: 'N/A',
      performance: 'Unknown',
      icon: '❓',
      model: 'Unknown CPU'
    };
  };
  
  // Get current time and date
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Load bot information using helper functions
  const botName = getBotName();
  const ownerName = getOwnerName();
  const botPrefix = getBotPrefix();
  const botVersion = getBotVersion();
  const botMode = getBotMode();
  const deploymentPlatform = getDeploymentPlatform();
  const timeZone = getTimeZone();
  const corePower = getCorePower();
  
  // Add bot name header before the info section
  finalCaption += `> 🐺🌕 *${botName}* 🌕🐺\n`;
  
  // Add info section only if any field is enabled
  const fieldsStatus = getAllFieldsStatus(style);
  if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
    const start = performance.now();
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mnt = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${mnt}m ${s}s`;
    const speed = (performance.now() - start).toFixed(2);
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
    
    // SAFE CALCULATION: Prevent negative or invalid percentages
    const memPercentNum = ((usedMem / (totalMem * 1024)) * 100);
    const memPercent = Math.min(Math.max(parseFloat(memPercentNum.toFixed(0)), 0), 100);
    
    // SAFE BAR CALCULATION: Prevent negative repeat values
    const filledBars = Math.max(Math.floor(memPercent / 10), 0);
    const emptyBars = Math.max(10 - filledBars, 0);
    const memBar = "█".repeat(filledBars) + "░".repeat(emptyBars);
    
    // Get Node.js version
    const nodeVersion = process.version;
    
    // Calculate command speed in milliseconds
    const commandSpeed = `${speed}ms`;
    
    // Get CPU load with safe calculation
    const cpuLoad = Math.min(parseFloat(os.loadavg()[0].toFixed(2)), 5);
    const cpuLoadBars = Math.max(Math.floor(cpuLoad), 0);
    const cpuLoadEmpty = Math.max(5 - cpuLoadBars, 0);
    const cpuLoadBar = "█".repeat(cpuLoadBars) + "░".repeat(cpuLoadEmpty);
    
    const infoLines = [];
    
    // TIME & DATE SECTION
    if (fieldsStatus.time || fieldsStatus.date) {
      infoLines.push(`> ┃ Date: ${currentDate}`);
      infoLines.push(`> ┃ Time: ${currentTime}`);
    }
    
    // SYSTEM INFO SECTION
    if (fieldsStatus.user) infoLines.push(`> ┃ User: ${m.pushName || "Anonymous"}`);
    if (fieldsStatus.owner) infoLines.push(`> ┃ Owner: ${ownerName}`);
    if (fieldsStatus.mode) infoLines.push(`> ┃ Mode: ${botMode}`);
    if (fieldsStatus.prefix) infoLines.push(`> ┃ Prefix: [ ${botPrefix} ]`);
    if (fieldsStatus.version) infoLines.push(`> ┃ Version: ${botVersion}`);
    
    // DEPLOYMENT & PLATFORM
    if (fieldsStatus.host) {
      infoLines.push(`> ┃ Panel: ${deploymentPlatform.name}`);
      infoLines.push(`> ┃ Status: ${deploymentPlatform.status}`);
    }
    
    // PERFORMANCE METRICS
    if (fieldsStatus.speed) {
      infoLines.push(`> ┃ Speed: ${commandSpeed}`);
      infoLines.push(`> ┃ CPU Load: ${cpuLoadBar} ${cpuLoad}`);
    }

    if (fieldsStatus.uptime) infoLines.push(`> ┃ Uptime: ${uptimeStr}`);
    if (fieldsStatus.usage) infoLines.push(`> ┃ Usage: ${usedMem} MB of ${totalMem} GB`);
    if (fieldsStatus.ram) infoLines.push(`> ┃ RAM: ${memBar} ${memPercent}%`);

    // CORE POWER (HARDWARE INFO)
    if (fieldsStatus.ram || fieldsStatus.usage) { // Reuse existing toggles for core power
      infoLines.push(`> ┃ ${corePower.icon} Cores: ${corePower.cores} @ ${corePower.speed}`);
      infoLines.push(`> ┃ Power: ${corePower.performance} Performance`);
      infoLines.push(`> ┃ CPU: ${corePower.model}`);
    }
    
    // NODE & TECH STACK
    if (fieldsStatus.version) { // Reuse version toggle for Node info
      infoLines.push(`> ┃ Node: ${nodeVersion}`);
      infoLines.push(`> ┃ Timezone: ${timeZone}`);
    }

    if (infoLines.length > 0) {
      const infoCaption = `> ┌────────────────\n${infoLines.join('\n')}\n> └────────────────\n`;
      finalCaption += infoCaption;
    }
  }

  const commandsText = `> ┌────────────────
> │ 🏠 *GROUP MANAGEMENT* 🏠 
> ├────────────────
> │ 🛡️ *ADMIN & MODERATION* 🛡️ 
> ├────────────────
> │ • add                     
> │ • promote                 
> │ • demote                  
> │ • kick                    
> │ • kickall                 
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • resetwarn               
> │ • setwarn                 
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • antileave               
> │ • antilink                
> │ • welcome                 
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antisticker             
> │ • antiviewonce  
> │ • antilink  
> │ • antiimage
> │ • antivideo
> │ • antiaudio
> │ • antimention
> │ • antistatusmention  
> │ • antigrouplink
> ├────────────────
> │ 📊 *GROUP INFO & TOOLS* 📊 
> ├────────────────
> │ • groupinfo               
> │ • tagadmin                
> │ • tagall                  
> │ • hidetag                 
> │ • link                    
> │ • invite                  
> │ • revoke                  
> │ • setdesc                 
> │ • fangtrace               
> │ • getgpp                  
> └────────────────

> ┌────────────────
> │ 🎨 *MENU COMMANDS* 🎨
> ├────────────────
> │ • togglemenuinfo
> │ • setmenuimage
> │ • resetmenuinfo
> │ • menustyle
> └────────────────

> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setbotname              
> │ • setowner                
> │ • setprefix               
> │ • iamowner                
> │ • about                   
> │ • block                   
> │ • unblock                 
> │ • blockdetect             
> │ • silent                  
> │ • anticall                
> │ • mode                    
> │ • online                  
> │ • setpp                   
> │ • repo                    
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • workingreload           
> │ • reloadenv               
> │ • getsettings             
> │ • setsetting              
> │ • test                    
> │ • disk                    
> │ • hostip                  
> │ • findcommands            
> └────────────────

> ┌────────────────
> │ ⚙️ *AUTOMATION* ⚙️
> ├────────────────
> │ • autoread                
> │ • autotyping              
> │ • autorecording           
> │ • autoreact               
> │ • autoreactstatus         
> │ • autobio                 
> │ • autorec                 
> └────────────────

> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎
> ├────────────────
> │ • alive
> │ • ping
> │ • ping2
> │ • time
> │ • connection
> │ • define
> │ • news
> │ • covid
> │ • iplookup
> │ • getip
> │ • getpp
> │ • getgpp
> │ • prefixinfo
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁
> ├───────────────
> │ • shorturl
> │ • qrencode
> │ • take
> │ • imgbb
> │ • tiktok
> │ • save
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅
> ├───────────────
> │ • pair
> │ • resetwarn
> │ • setwarn
> └────────────────

> ┌────────────────
> │ 🎵 *MUSIC & MEDIA* 🎶
> ├────────────────
> │ • play                    
> │ • song                    
> │ • lyrics                  
> │ • spotify                 
> │ • video                   
> │ • video2                  
> │ • bassboost               
> │ • trebleboost             
> └────────────────

> ┌───────────────
> │ 🤖 *MEDIA & AI COMMANDS* 🧠 
> ├───────────────
> │ ⬇️ *MEDIA DOWNLOADS* 📥     
> ├───────────────
> │ • youtube                 
> │ • tiktok                 
> │ • instagram               
> │ • facebook                
> │ • snapchat                
> │ • apk                     
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gpt                     
> │ • gemini                  
> │ • deepseek                
> │ • deepseek+               
> │ • analyze                 
> │ • suno                    
> │ • wolfbot                 
> │ • videogen                
> └───────────────

> ┌───────────────
> │ 🖼️ *IMAGE TOOLS* 🖼️
> ├───────────────
> │ • image                   
> │ • imagegenerate           
> │ • anime                   
> │ • art                     
> │ • real                    
> └───────────────

> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo                  
> │ • shodan                  
> │ • iplookup                
> │ • getip                   
> └───────────────

> ┌────────────────
> │ 🎨 *LOGO DESIGN STUDIO* 🎨
> ├────────────────
> │ 🌟 *PREMIUM METALS* 🌟    
> ├────────────────
> │ • goldlogo                
> │ • silverlogo              
> │ • platinumlogo            
> │ • chromelogo              
> │ • diamondlogo             
> │ • bronzelogo              
> │ • steelogo                
> │ • copperlogo              
> │ • titaniumlogo            
> ├────────────────
> │ 🔥 *ELEMENTAL EFFECTS* 🔥  
> ├────────────────
> │ • firelogo                
> │ • icelogo                 
> │ • iceglowlogo             
> │ • lightninglogo           
> │ • aqualogo                
> │ • rainbowlogo             
> │ • sunlogo                 
> │ • moonlogo                
> ├────────────────
> │ 🎭 *MYTHICAL & MAGICAL* 🧙  
> ├────────────────
> │ • dragonlogo              
> │ • phoenixlogo             
> │ • wizardlogo              
> │ • crystallogo             
> │ • darkmagiclogo           
> ├────────────────
> │ 🌌 *DARK & GOTHIC* 🌑     
> ├────────────────
> │ • shadowlogo              
> │ • smokelogo               
> │ • bloodlogo               
> ├────────────────
> │ 💫 *GLOW & NEON EFFECTS* 🌈  
> ├────────────────
> │ • neonlogo                
> │ • glowlogo                
> ├────────────────
> │ 🤖 *TECH & FUTURISTIC* 🚀  
> ├────────────────
> │ • matrixlogo              
> └────────────────

> ┌────────────────
> │ 🐙 *GITHUB COMMANDS* 🐙
> ├────────────────
> │ • gitclone
> │ • gitinfo
> │ • repo
> │ • commits
> │ • stars
> │ • watchers
> │ • release
> └────────────────

> ┌────────────────
> │ 🌸 *ANIME COMMANDS* 🌸
> ├────────────────
> │ • awoo
> │ • bj
> │ • bully
> │ • cringe
> │ • cry
> │ • cuddle
> │ • dance
> │ • glomp
> │ • highfive
> │ • kill
> │ • kiss
> │ • lick
> │ • megumin
> │ • neko
> │ • pat
> │ • shinobu
> │ • trap
> │ • trap2
> │ • waifu
> │ • wink
> │ • yeet
> └────────────────

> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`;

  finalCaption += commandsText;

  const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
  const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
  const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
  if (!imagePath) {
    await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
    return;
  }
  const buffer = fs.readFileSync(imagePath);

  await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
  break;
}










// case 7: {
//   // Similar to case 6 - apply the same individual toggle logic
//   // ... (same pattern as case 6)
  
//   // 🖼️ Full info + image + commands (with individual toggles)
//   let finalCaption = "";
  
//   // Add these helper functions at the start of case 7
//   const getBotMode = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for bot_mode.json...');
      
//       // Check multiple possible locations with priority order
//       const possiblePaths = [
//         './bot_mode.json',  // Root directory (most likely)
//         path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
//         path.join(__dirname, '../bot_mode.json'),  // Parent directory
//         path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
//         path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
//         path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
//       ];
      
//       for (const modePath of possiblePaths) {
//         if (fs.existsSync(modePath)) {
//           console.log(`✅ DEBUG: Found bot_mode.json at: ${modePath}`);
//           try {
//             const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
//             console.log(`📊 DEBUG: Mode data:`, modeData);
            
//             if (modeData.mode) {
//               // Format for display
//               let displayMode;
//               switch(modeData.mode.toLowerCase()) {
//                 case 'public':
//                   displayMode = '🌍 Public';
//                   break;
//                 case 'silent':
//                   displayMode = '🔇 Silent';
//                   break;
//                 default:
//                   displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
//               }
              
//               console.log(`✅ DEBUG: Mode loaded: ${modeData.mode} -> ${displayMode}`);
//               return displayMode;
//             }
//           } catch (parseError) {
//             console.error(`❌ DEBUG: Error parsing ${modePath}:`, parseError);
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No bot_mode.json found in any path, checking global...');
      
//       // Fallback to global variables
//       if (global.BOT_MODE) {
//         console.log(`✅ DEBUG: Found global.BOT_MODE: ${global.BOT_MODE}`);
//         return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
//       if (global.mode) {
//         console.log(`✅ DEBUG: Found global.mode: ${global.mode}`);
//         return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
//       if (process.env.BOT_MODE) {
//         console.log(`✅ DEBUG: Found process.env.BOT_MODE: ${process.env.BOT_MODE}`);
//         return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getBotMode:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default mode: 🌍 Public');
//     return '🌍 Public'; // Default fallback
//   };
  
//   // ADD THIS NEW HELPER FUNCTION FOR BOT NAME
//   const getBotName = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for bot_settings.json...');
      
//       // Check multiple possible locations with priority order
//       const possiblePaths = [
//         './bot_settings.json',  // Root directory (most likely)
//         path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
//         path.join(__dirname, '../bot_settings.json'),  // Parent directory
//         path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
//         path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
//         path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
//       ];
      
//       for (const settingsPath of possiblePaths) {
//         if (fs.existsSync(settingsPath)) {
//           console.log(`✅ DEBUG: Found bot_settings.json at: ${settingsPath}`);
//           try {
//             const settingsData = fs.readFileSync(settingsPath, 'utf8');
//             const settings = JSON.parse(settingsData);
//             console.log(`📊 DEBUG: Settings data:`, settings);
            
//             if (settings.botName && settings.botName.trim() !== '') {
//               const loadedName = settings.botName.trim();
//               console.log(`✅ DEBUG: Bot name loaded: "${loadedName}"`);
//               return loadedName;
//             }
//           } catch (parseError) {
//             console.error(`❌ DEBUG: Error parsing ${settingsPath}:`, parseError);
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No bot_settings.json found in any path, checking global...');
      
//       // Fallback to global variables
//       if (global.BOT_NAME) {
//         console.log(`✅ DEBUG: Found global.BOT_NAME: ${global.BOT_NAME}`);
//         return global.BOT_NAME;
//       }
      
//       // Fallback to environment variable
//       if (process.env.BOT_NAME) {
//         console.log(`✅ DEBUG: Found process.env.BOT_NAME: ${process.env.BOT_NAME}`);
//         return process.env.BOT_NAME;
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getBotName:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default bot name: WOLFBOT');
//     return 'WOLFBOT'; // Default fallback
//   };
  
//   // Load bot name using the helper function
//   const botName = getBotName();
//   console.log(`✅ Menu display bot name: "${botName}"`);
  
//   // Add bot name header before the info section
//   finalCaption += `┌────────────────
// │ 🐺 ${botName}  MENU 🐺
// └────────────────\n\n`;
  
//   // Add info section only if any field is enabled
//   const fieldsStatus = getAllFieldsStatus(style);
//   if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
//     const start = performance.now();
//     const uptime = process.uptime();
//     const h = Math.floor(uptime / 3600);
//     const mnt = Math.floor((uptime % 3600) / 60);
//     const s = Math.floor(uptime % 60);
//     const uptimeStr = `${h}h ${mnt}m ${s}s`;
//     const speed = (performance.now() - start).toFixed(2);
//     const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//     const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//     const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//     const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//     // Load owner from owner.json file
//     let ownerNumber = "Unknown";
//     try {
//       const ownerPath = path.join(__dirname, 'owner.json');
//       if (fs.existsSync(ownerPath)) {
//         const ownerData = fs.readFileSync(ownerPath, 'utf8');
//         const ownerInfo = JSON.parse(ownerData);
        
//         // Try different possible field names in owner.json
//         if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
//           ownerNumber = ownerInfo.owner.trim();
//         } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
//           ownerNumber = ownerInfo.number.trim();
//         } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
//           ownerNumber = ownerInfo.phone.trim();
//         } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
//           ownerNumber = ownerInfo.contact.trim();
//         } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
//           // If it's an array, take the first one
//           ownerNumber = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
//         }
//       }
//     } catch (ownerError) {
//       console.error('Error loading owner from owner.json:', ownerError);
//       // Fallback to environment variable or global
//       ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//     }

//     // Load bot mode using the helper function
//     const botMode = getBotMode();
//     console.log(`✅ Menu display mode: ${botMode}`);

//     const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//     const prefix = global.prefix || ".";
//     const version = global.version || "v2.6.2";

//     const infoLines = [];
//     // Bot name is already in the header, so we don't duplicate it here
//     if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
//     if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
//     if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${botMode}`);  // Use the loaded botMode
//     if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
//     if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
//     if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
//     if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
//     if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
//     if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
//     if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

//     if (infoLines.length > 0) {
//       const infoCaption = `┌────────────────\n${infoLines.join('\n')}\n└────────────────\n\n`;
//       finalCaption += infoCaption;
//     }
//   }

//   const commandsText = `┌────────────────
// │ 🏠 GROUP MANAGEMENT 🏠 
// ├────────────────
// │ 🛡️ ADMIN & MODERATION 🛡️ 
// ├────────────────
// │ add                     
// │ promote                 
// │ demote                  
// │ kick                    
// │ kickall                 
// │ ban                     
// │ unban                   
// │ banlist                 
// │ clearbanlist            
// │ warn                    
// │ resetwarn               
// │ setwarn                 
// │ mute                    
// │ unmute                  
// │ gctime                  
// │ antileave               
// │ antilink                
// │ welcome                 
// ├────────────────
// │ 🚫 AUTO-MODERATION 🚫   
// ├────────────────
// │ antisticker             
// │ antiviewonce  
// │ antilink  
// │ antiimage
// │ antivideo
// │ antiaudio
// │ antimention
// │ antistatusmention  
// │ antigrouplink
// ├────────────────
// │ 📊 GROUP INFO & TOOLS 📊 
// ├────────────────
// │ groupinfo               
// │ tagadmin                
// │ tagall                  
// │ hidetag                 
// │ link                    
// │ invite                  
// │ revoke                  
// │ setdesc                 
// │ fangtrace               
// │ getgpp                  
// └────────────────

// ┌────────────────
// │ 🎨 MENU COMMANDS 🎨
// ├────────────────
// │ togglemenuinfo
// │ setmenuimage
// │ resetmenuinfo
// └────────────────

// ┌────────────────
// │ 👑 OWNER CONTROLS 👑    
// ├────────────────
// │ ⚡ CORE MANAGEMENT ⚡    
// ├────────────────
// │ setbotname              
// │ iamowner                
// │ about                   
// │ setprefix               
// │ block                   
// │ unblock                 
// │ blockdetect             
// │ silent                  
// │ anticall                
// │ mode                    ← Shows/sets bot mode (owner only)
// │ online                  
// │ setpp                   
// │ repo                    
// ├────────────────
// │ 🔄 SYSTEM & MAINTENANCE 🛠️ 
// ├────────────────
// │ restart                 
// │ workingreload           
// │ reloadenv               
// │ getsettings             
// │ setsetting              
// │ test                    
// │ disk                    
// │ hostip                  
// │ findcommands            
// └────────────────

// ┌────────────────
// │ ⚙️ AUTOMATION ⚙️
// ├────────────────
// │ autoread                
// │ autotyping              
// │ autorecording           
// │ autoreact               
// │ autoreactstatus         
// │ autobio                 
// │ autorec                 
// └────────────────

// ┌────────────────
// │ ✨ GENERAL UTILITIES ✨  
// ├────────────────
// │ 🔍 INFO & SEARCH 🔎     
// ├────────────────
// │ ping                    
// │ time                    
// │ uptime                  
// │ alive                   
// │ define                  
// │ news                    
// │ covid                   
// │ quote                   
// │ prefixinfo              
// ├───────────────
// │ 🔗 CONVERSION & MEDIA 📁 
// ├───────────────
// │ translate               
// │ shorturl                
// │ qrencode                
// │ take                    
// │ toimage                 
// │ tostatus                
// │ toaudio                 
// │ tovoice                 
// │ save                    
// │ url                     
// ├───────────────
// │ 📝 PERSONAL TOOLS 📅    
// ├───────────────
// │ goodmorning             
// │ goodnight               
// └────────────────

// ├────────────────
// │ 🎵 MUSIC & MEDIA 🎶
// ├────────────────
// │ play                    
// │ song                    
// │ lyrics                  
// │ spotify                 
// │ video                   
// │ video2                  
// │ bassboost               
// │ trebleboost             
// └────────────────

// ┌───────────────
// │ 🤖 MEDIA & AI COMMANDS 🧠 
// ├───────────────
// │ ⬇️ MEDIA DOWNLOADS 📥     
// ├───────────────
// │ youtube                 
// │ tiktok                  
// │ instagram               
// │ facebook                
// │ snapchat                
// │ apk                     
// ├───────────────
// │ 🎨 AI GENERATION 💡    
// ├───────────────
// │ gpt                     
// │ gemini                  
// │ deepseek                
// │ deepseek+               
// │ analyze                 
// │ suno                    
// │ wolfbot                 
// │ videogen                
// └───────────────

// ┌───────────────
// │ 🖼️ IMAGE TOOLS 🖼️
// ├───────────────
// │ image                   
// │ imagegenerate           
// │ anime                   
// │ art                     
// │ real                    
// └───────────────

// ┌───────────────
// │ 🛡️ SECURITY & HACKING 🔒 
// ├───────────────
// │ 🌐 NETWORK & INFO 📡   
// ├───────────────
// │ ipinfo                  
// │ shodan                  
// │ iplookup                
// │ getip                   
// └───────────────

// ┌────────────────
// │ 🎨 LOGO DESIGN STUDIO 🎨
// ├────────────────
// │ 🌟 PREMIUM METALS 🌟    
// ├────────────────
// │ goldlogo                
// │ silverlogo              
// │ platinumlogo            
// │ chromelogo              
// │ diamondlogo             
// │ bronzelogo              
// │ steelogo                
// │ copperlogo              
// │ titaniumlogo            
// ├────────────────
// │ 🔥 ELEMENTAL EFFECTS 🔥  
// ├────────────────
// │ firelogo                
// │ icelogo                 
// │ iceglowlogo             
// │ lightninglogo           
// │ aqualogo                
// │ rainbowlogo             
// │ sunlogo                 
// │ moonlogo                
// ├────────────────
// │ 🎭 MYTHICAL & MAGICAL 🧙  
// ├────────────────
// │ dragonlogo              
// │ phoenixlogo             
// │ wizardlogo              
// │ crystallogo             
// │ darkmagiclogo           
// ├────────────────
// │ 🌌 DARK & GOTHIC 🌑     
// ├────────────────
// │ shadowlogo              
// │ smokelogo               
// │ bloodlogo               
// ├────────────────
// │ 💫 GLOW & NEON EFFECTS 🌈  
// ├────────────────
// │ neonlogo                
// │ glowlogo                
// ├────────────────
// │ 🤖 TECH & FUTURISTIC 🚀  
// ├────────────────
// │ matrixlogo              
// └────────────────
// ┌────────────────
// │ 🐙 GITHUB COMMANDS 🐙
// ├────────────────
// │ gitclone
// │ gitinfo
// │ repo
// │ commits
// │ stars
// │ watchers
// │ release
// └────────────────


// 🐺🌕POWERED BY WOLFTECH🌕🐺

// `;

//   finalCaption += commandsText;

//   const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//   const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//   const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//   if (!imagePath) {
//     await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//     return;
//   }
//   const buffer = fs.readFileSync(imagePath);

//   await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
//   break;
// }


// case 7: {
//   // Similar to case 6 - apply the same individual toggle logic
//   // ... (same pattern as case 6)
  
//   // 🖼️ Full info + image + commands (with individual toggles)
//   let finalCaption = "";
  
//   // Add these helper functions at the start of case 7
//   const getBotMode = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for bot_mode.json...');
      
//       // Check multiple possible locations with priority order
//       const possiblePaths = [
//         './bot_mode.json',  // Root directory (most likely)
//         path.join(__dirname, 'bot_mode.json'),  // Same directory as menu
//         path.join(__dirname, '../bot_mode.json'),  // Parent directory
//         path.join(__dirname, '../../bot_mode.json'),  // 2 levels up
//         path.join(__dirname, '../../../bot_mode.json'),  // 3 levels up
//         path.join(__dirname, '../commands/owner/bot_mode.json'),  // Owner commands directory
//       ];
      
//       for (const modePath of possiblePaths) {
//         if (fs.existsSync(modePath)) {
//           console.log(`✅ DEBUG: Found bot_mode.json at: ${modePath}`);
//           try {
//             const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
//             console.log(`📊 DEBUG: Mode data:`, modeData);
            
//             if (modeData.mode) {
//               // Format for display
//               let displayMode;
//               switch(modeData.mode.toLowerCase()) {
//                 case 'public':
//                   displayMode = '🌍 Public';
//                   break;
//                 case 'silent':
//                   displayMode = '🔇 Silent';
//                   break;
//                 default:
//                   displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
//               }
              
//               console.log(`✅ DEBUG: Mode loaded: ${modeData.mode} -> ${displayMode}`);
//               return displayMode;
//             }
//           } catch (parseError) {
//             console.error(`❌ DEBUG: Error parsing ${modePath}:`, parseError);
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No bot_mode.json found in any path, checking global...');
      
//       // Fallback to global variables
//       if (global.BOT_MODE) {
//         console.log(`✅ DEBUG: Found global.BOT_MODE: ${global.BOT_MODE}`);
//         return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
//       if (global.mode) {
//         console.log(`✅ DEBUG: Found global.mode: ${global.mode}`);
//         return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
//       if (process.env.BOT_MODE) {
//         console.log(`✅ DEBUG: Found process.env.BOT_MODE: ${process.env.BOT_MODE}`);
//         return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getBotMode:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default mode: 🌍 Public');
//     return '🌍 Public'; // Default fallback
//   };
  
//   // ADD THIS NEW HELPER FUNCTION FOR BOT NAME
//   const getBotName = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for bot_settings.json...');
      
//       // Check multiple possible locations with priority order
//       const possiblePaths = [
//         './bot_settings.json',  // Root directory (most likely)
//         path.join(__dirname, 'bot_settings.json'),  // Same directory as menu
//         path.join(__dirname, '../bot_settings.json'),  // Parent directory
//         path.join(__dirname, '../../bot_settings.json'),  // 2 levels up
//         path.join(__dirname, '../../../bot_settings.json'),  // 3 levels up
//         path.join(__dirname, '../commands/owner/bot_settings.json'),  // Owner commands directory
//       ];
      
//       for (const settingsPath of possiblePaths) {
//         if (fs.existsSync(settingsPath)) {
//           console.log(`✅ DEBUG: Found bot_settings.json at: ${settingsPath}`);
//           try {
//             const settingsData = fs.readFileSync(settingsPath, 'utf8');
//             const settings = JSON.parse(settingsData);
//             console.log(`📊 DEBUG: Settings data:`, settings);
            
//             if (settings.botName && settings.botName.trim() !== '') {
//               const loadedName = settings.botName.trim();
//               console.log(`✅ DEBUG: Bot name loaded: "${loadedName}"`);
//               return loadedName;
//             }
//           } catch (parseError) {
//             console.error(`❌ DEBUG: Error parsing ${settingsPath}:`, parseError);
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No bot_settings.json found in any path, checking global...');
      
//       // Fallback to global variables
//       if (global.BOT_NAME) {
//         console.log(`✅ DEBUG: Found global.BOT_NAME: ${global.BOT_NAME}`);
//         return global.BOT_NAME;
//       }
      
//       // Fallback to environment variable
//       if (process.env.BOT_NAME) {
//         console.log(`✅ DEBUG: Found process.env.BOT_NAME: ${process.env.BOT_NAME}`);
//         return process.env.BOT_NAME;
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getBotName:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default bot name: WOLFBOT');
//     return 'WOLFBOT'; // Default fallback
//   };
  
//   // ADD THIS NEW HELPER FUNCTION FOR OWNER NAME
//   const getOwnerName = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for owner name...');
      
//       // First priority: Check bot_settings.json for custom owner name
//       const botSettingsPaths = [
//         './bot_settings.json',
//         path.join(__dirname, 'bot_settings.json'),
//         path.join(__dirname, '../bot_settings.json'),
//         path.join(__dirname, '../../bot_settings.json'),
//       ];
      
//       for (const settingsPath of botSettingsPaths) {
//         if (fs.existsSync(settingsPath)) {
//           try {
//             const settingsData = fs.readFileSync(settingsPath, 'utf8');
//             const settings = JSON.parse(settingsData);
            
//             // Check for owner name in bot_settings.json
//             if (settings.ownerName && settings.ownerName.trim() !== '') {
//               console.log(`✅ DEBUG: Custom owner name found: "${settings.ownerName}"`);
//               return settings.ownerName.trim();
//             }
//           } catch (parseError) {
//             // Continue to next path
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No custom owner name found, checking owner.json...');
      
//       // Second priority: Load from owner.json (original method)
//       const ownerPath = path.join(__dirname, 'owner.json');
//       if (fs.existsSync(ownerPath)) {
//         const ownerData = fs.readFileSync(ownerPath, 'utf8');
//         const ownerInfo = JSON.parse(ownerData);
        
//         // Try different possible field names in owner.json
//         if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
//           console.log(`✅ DEBUG: Owner from owner.json: "${ownerInfo.owner}"`);
//           return ownerInfo.owner.trim();
//         } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
//           console.log(`✅ DEBUG: Owner number from owner.json: "${ownerInfo.number}"`);
//           return ownerInfo.number.trim();
//         } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
//           console.log(`✅ DEBUG: Owner phone from owner.json: "${ownerInfo.phone}"`);
//           return ownerInfo.phone.trim();
//         } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
//           console.log(`✅ DEBUG: Owner contact from owner.json: "${ownerInfo.contact}"`);
//           return ownerInfo.contact.trim();
//         } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
//           // If it's an array, take the first one
//           const owner = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
//           console.log(`✅ DEBUG: Owner from array: "${owner}"`);
//           return owner;
//         }
//       }
      
//       console.log('⚠️ DEBUG: No owner.json found, checking global...');
      
//       // Third priority: Global variables
//       if (global.OWNER_NAME) {
//         console.log(`✅ DEBUG: Found global.OWNER_NAME: ${global.OWNER_NAME}`);
//         return global.OWNER_NAME;
//       }
//       if (global.owner) {
//         console.log(`✅ DEBUG: Found global.owner: ${global.owner}`);
//         return global.owner;
//       }
//       if (process.env.OWNER_NUMBER) {
//         console.log(`✅ DEBUG: Found process.env.OWNER_NUMBER: ${process.env.OWNER_NUMBER}`);
//         return process.env.OWNER_NUMBER;
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getOwnerName:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default owner: Unknown');
//     return 'Unknown'; // Default fallback
//   };
  
//   // ADD THIS NEW HELPER FUNCTION FOR PREFIX
//   const getBotPrefix = () => {
//     try {
//       console.log('🔍 DEBUG: Looking for prefix...');
      
//       // First priority: Check bot_settings.json for custom prefix
//       const botSettingsPaths = [
//         './bot_settings.json',
//         path.join(__dirname, 'bot_settings.json'),
//         path.join(__dirname, '../bot_settings.json'),
//         path.join(__dirname, '../../bot_settings.json'),
//       ];
      
//       for (const settingsPath of botSettingsPaths) {
//         if (fs.existsSync(settingsPath)) {
//           try {
//             const settingsData = fs.readFileSync(settingsPath, 'utf8');
//             const settings = JSON.parse(settingsData);
            
//             // Check for prefix in bot_settings.json
//             if (settings.prefix && settings.prefix.trim() !== '') {
//               console.log(`✅ DEBUG: Custom prefix found: "${settings.prefix}"`);
//               return settings.prefix.trim();
//             }
//           } catch (parseError) {
//             // Continue to next path
//           }
//         }
//       }
      
//       console.log('⚠️ DEBUG: No custom prefix found, checking global...');
      
//       // Second priority: Global prefix
//       if (global.prefix) {
//         console.log(`✅ DEBUG: Found global.prefix: ${global.prefix}`);
//         return global.prefix;
//       }
      
//       // Third priority: Environment variable
//       if (process.env.PREFIX) {
//         console.log(`✅ DEBUG: Found process.env.PREFIX: ${process.env.PREFIX}`);
//         return process.env.PREFIX;
//       }
      
//     } catch (error) {
//       console.error('❌ DEBUG: Error in getBotPrefix:', error);
//     }
    
//     console.log('⚠️ DEBUG: Using default prefix: .');
//     return '.'; // Default fallback
//   };
  
//   // Load bot name using the helper function
//   const botName = getBotName();
//   const ownerName = getOwnerName();
//   const botPrefix = getBotPrefix();
//   console.log(`✅ Menu display - Bot: "${botName}" | Owner: "${ownerName}" | Prefix: "${botPrefix}"`);
  
//   // Add bot name header before the info section
//   finalCaption += `┌────────────────
// │ 🐺 ${botName}  MENU 🐺
// └────────────────\n\n`;
  
//   // Add info section only if any field is enabled
//   const fieldsStatus = getAllFieldsStatus(style);
//   if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
//     const start = performance.now();
//     const uptime = process.uptime();
//     const h = Math.floor(uptime / 3600);
//     const mnt = Math.floor((uptime % 3600) / 60);
//     const s = Math.floor(uptime % 60);
//     const uptimeStr = `${h}h ${mnt}m ${s}s`;
//     const speed = (performance.now() - start).toFixed(2);
//     const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//     const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//     const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//     const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//     // Load bot mode using the helper function
//     const botMode = getBotMode();
//     console.log(`✅ Menu display mode: ${botMode}`);

//     const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//     const version = global.version || "v2.6.2";

//     const infoLines = [];
//     // Bot name is already in the header, so we don't duplicate it here
//     if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
//     if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerName}`);  // Use loaded owner name
//     if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${botMode}`);  // Use the loaded botMode
//     if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
//     if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
//     if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${botPrefix} ]`);  // Use loaded prefix
//     if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
//     if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
//     if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
//     if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

//     if (infoLines.length > 0) {
//       const infoCaption = `┌────────────────\n${infoLines.join('\n')}\n└────────────────\n\n`;
//       finalCaption += infoCaption;
//     }
//   }

//   const commandsText = `┌────────────────
// │ 🏠 GROUP MANAGEMENT 🏠 
// ├────────────────
// │ 🛡️ ADMIN & MODERATION 🛡️ 
// ├────────────────
// │ add                     
// │ promote                 
// │ demote                  
// │ kick                    
// │ kickall                 
// │ ban                     
// │ unban                   
// │ banlist                 
// │ clearbanlist            
// │ warn                    
// │ resetwarn               
// │ setwarn                 
// │ mute                    
// │ unmute                  
// │ gctime                  
// │ antileave               
// │ antilink                
// │ welcome                 
// ├────────────────
// │ 🚫 AUTO-MODERATION 🚫   
// ├────────────────
// │ antisticker             
// │ antiviewonce  
// │ antilink  
// │ antiimage
// │ antivideo
// │ antiaudio
// │ antimention
// │ antistatusmention  
// │ antigrouplink
// ├────────────────
// │ 📊 GROUP INFO & TOOLS 📊 
// ├────────────────
// │ groupinfo               
// │ tagadmin                
// │ tagall                  
// │ hidetag                 
// │ link                    
// │ invite                  
// │ revoke                  
// │ setdesc                 
// │ fangtrace               
// │ getgpp                  
// └────────────────

// ┌────────────────
// │ 🎨 MENU COMMANDS 🎨
// ├────────────────
// │ togglemenuinfo
// │ setmenuimage
// │ resetmenuinfo
// └────────────────

// ┌────────────────
// │ 👑 OWNER CONTROLS 👑    
// ├────────────────
// │ ⚡ CORE MANAGEMENT ⚡    
// ├────────────────
// │ setbotname              
// │ setowner                
// │ setprefix               
// │ iamowner                
// │ about                   
// │ block                   
// │ unblock                 
// │ blockdetect             
// │ silent                  
// │ anticall                
// │ mode                    ← Shows/sets bot mode (owner only)
// │ online                  
// │ setpp                   
// │ repo                    
// ├────────────────
// │ 🔄 SYSTEM & MAINTENANCE 🛠️ 
// ├────────────────
// │ restart                 
// │ workingreload           
// │ reloadenv               
// │ getsettings             
// │ setsetting              
// │ test                    
// │ disk                    
// │ hostip                  
// │ findcommands            
// └────────────────

// ┌────────────────
// │ ⚙️ AUTOMATION ⚙️
// ├────────────────
// │ autoread                
// │ autotyping              
// │ autorecording           
// │ autoreact               
// │ autoreactstatus         
// │ autobio                 
// │ autorec                 
// └────────────────

// ┌────────────────
// │ ✨ GENERAL UTILITIES ✨  
// ├────────────────
// │ 🔍 INFO & SEARCH 🔎     
// ├────────────────
// │ ping                    
// │ time                    
// │ uptime                  
// │ alive                   
// │ define                  
// │ news                    
// │ covid                   
// │ quote                   
// │ prefixinfo              
// ├───────────────
// │ 🔗 CONVERSION & MEDIA 📁 
// ├───────────────
// │ translate               
// │ shorturl                
// │ qrencode                
// │ take                    
// │ toimage                 
// │ tostatus                
// │ toaudio                 
// │ tovoice                 
// │ save                    
// │ url                     
// ├───────────────
// │ 📝 PERSONAL TOOLS 📅    
// ├───────────────
// │ goodmorning             
// │ goodnight               
// └────────────────

// ├────────────────
// │ 🎵 MUSIC & MEDIA 🎶
// ├────────────────
// │ play                    
// │ song                    
// │ lyrics                  
// │ spotify                 
// │ video                   
// │ video2                  
// │ bassboost               
// │ trebleboost             
// └────────────────

// ┌───────────────
// │ 🤖 MEDIA & AI COMMANDS 🧠 
// ├───────────────
// │ ⬇️ MEDIA DOWNLOADS 📥     
// ├───────────────
// │ youtube                 
// │ tiktok                 
// │ instagram               
// │ facebook                
// │ snapchat                
// │ apk                     
// ├───────────────
// │ 🎨 AI GENERATION 💡    
// ├───────────────
// │ gpt                     
// │ gemini                  
// │ deepseek                
// │ deepseek+               
// │ analyze                 
// │ suno                    
// │ wolfbot                 
// │ videogen                
// └───────────────

// ┌───────────────
// │ 🖼️ IMAGE TOOLS 🖼️
// ├───────────────
// │ image                   
// │ imagegenerate           
// │ anime                   
// │ art                     
// │ real                    
// └───────────────

// ┌───────────────
// │ 🛡️ SECURITY & HACKING 🔒 
// ├───────────────
// │ 🌐 NETWORK & INFO 📡   
// ├───────────────
// │ ipinfo                  
// │ shodan                  
// │ iplookup                
// │ getip                   
// └───────────────

// ┌────────────────
// │ 🎨 LOGO DESIGN STUDIO 🎨
// ├────────────────
// │ 🌟 PREMIUM METALS 🌟    
// ├────────────────
// │ goldlogo                
// │ silverlogo              
// │ platinumlogo            
// │ chromelogo              
// │ diamondlogo             
// │ bronzelogo              
// │ steelogo                
// │ copperlogo              
// │ titaniumlogo            
// ├────────────────
// │ 🔥 ELEMENTAL EFFECTS 🔥  
// ├────────────────
// │ firelogo                
// │ icelogo                 
// │ iceglowlogo             
// │ lightninglogo           
// │ aqualogo                
// │ rainbowlogo             
// │ sunlogo                 
// │ moonlogo                
// ├────────────────
// │ 🎭 MYTHICAL & MAGICAL 🧙  
// ├────────────────
// │ dragonlogo              
// │ phoenixlogo             
// │ wizardlogo              
// │ crystallogo             
// │ darkmagiclogo           
// ├────────────────
// │ 🌌 DARK & GOTHIC 🌑     
// ├────────────────
// │ shadowlogo              
// │ smokelogo               
// │ bloodlogo               
// ├────────────────
// │ 💫 GLOW & NEON EFFECTS 🌈  
// ├────────────────
// │ neonlogo                
// │ glowlogo                
// ├────────────────
// │ 🤖 TECH & FUTURISTIC 🚀  
// ├────────────────
// │ matrixlogo              
// └────────────────
// ┌────────────────
// │ 🐙 GITHUB COMMANDS 🐙
// ├────────────────
// │ gitclone
// │ gitinfo
// │ repo
// │ commits
// │ stars
// │ watchers
// │ release
// └────────────────


// 🐺🌕POWERED BY WOLFTECH🌕🐺

// `;

//   finalCaption += commandsText;

//   const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//   const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//   const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//   if (!imagePath) {
//     await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//     return;
//   }
//   const buffer = fs.readFileSync(imagePath);

//   await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
//   break;
// }


























case 7: {
  // 🖼️ Full info + image + commands (with individual toggles)
  let finalCaption = "";
  
  // Add these helper functions at the start of case 7
  const getBotMode = () => {
    try {
      const possiblePaths = [
        './bot_mode.json',
        path.join(__dirname, 'bot_mode.json'),
        path.join(__dirname, '../bot_mode.json'),
        path.join(__dirname, '../../bot_mode.json'),
        path.join(__dirname, '../../../bot_mode.json'),
        path.join(__dirname, '../commands/owner/bot_mode.json'),
      ];
      
      for (const modePath of possiblePaths) {
        if (fs.existsSync(modePath)) {
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            
            if (modeData.mode) {
              let displayMode;
              switch(modeData.mode.toLowerCase()) {
                case 'public':
                  displayMode = '🌍 Public';
                  break;
                case 'silent':
                  displayMode = '🔇 Silent';
                  break;
                case 'private':
                  displayMode = '🔒 Private';
                  break;
                case 'group-only':
                  displayMode = '👥 Group Only';
                  break;
                case 'maintenance':
                  displayMode = '🛠️ Maintenance';
                  break;
                default:
                  displayMode = `⚙️ ${modeData.mode.charAt(0).toUpperCase() + modeData.mode.slice(1)}`;
              }
              return displayMode;
            }
          } catch (parseError) {}
        }
      }
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {}
    
    return '🌍 Public';
  };
  
  const getBotName = () => {
    try {
      const possiblePaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
        path.join(__dirname, '../../../bot_settings.json'),
        path.join(__dirname, '../commands/owner/bot_settings.json'),
      ];
      
      for (const settingsPath of possiblePaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.botName && settings.botName.trim() !== '') {
              return settings.botName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.BOT_NAME) {
        return global.BOT_NAME;
      }
      
      if (process.env.BOT_NAME) {
        return process.env.BOT_NAME;
      }
      
    } catch (error) {}
    
    return 'WOLFBOT';
  };
  
  const getOwnerName = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.ownerName && settings.ownerName.trim() !== '') {
              return settings.ownerName.trim();
            }
          } catch (parseError) {}
        }
      }
      
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
          return ownerInfo.owner.trim();
        } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
          return ownerInfo.number.trim();
        } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
          return ownerInfo.phone.trim();
        } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
          return ownerInfo.contact.trim();
        } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
          const owner = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
          return owner;
        }
      }
      
      if (global.OWNER_NAME) {
        return global.OWNER_NAME;
      }
      if (global.owner) {
        return global.owner;
      }
      if (process.env.OWNER_NUMBER) {
        return process.env.OWNER_NUMBER;
      }
      
    } catch (error) {}
    
    return 'Unknown';
  };
  
  const getBotPrefix = () => {
    try {
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
        path.join(__dirname, '../../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.prefix && settings.prefix.trim() !== '') {
              return settings.prefix.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.prefix) {
        return global.prefix;
      }
      
      if (process.env.PREFIX) {
        return process.env.PREFIX;
      }
      
    } catch (error) {}
    
    return '.';
  };
  
  const getBotVersion = () => {
    try {
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        if (ownerInfo.version && ownerInfo.version.trim() !== '') {
          return ownerInfo.version.trim();
        }
      }
      
      const botSettingsPaths = [
        './bot_settings.json',
        path.join(__dirname, 'bot_settings.json'),
        path.join(__dirname, '../bot_settings.json'),
      ];
      
      for (const settingsPath of botSettingsPaths) {
        if (fs.existsSync(settingsPath)) {
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            
            if (settings.version && settings.version.trim() !== '') {
              return settings.version.trim();
            }
          } catch (parseError) {}
        }
      }
      
      if (global.VERSION) {
        return global.VERSION;
      }
      
      if (global.version) {
        return global.version;
      }
      
      if (process.env.VERSION) {
        return process.env.VERSION;
      }
      
    } catch (error) {}
    
    return 'v1.0.0';
  };
  
  const getDeploymentPlatform = () => {
    // Detect deployment platform
    if (process.env.REPL_ID || process.env.REPLIT_DB_URL) {
      return {
        name: 'Replit',
        status: 'Active',
        icon: '🌀'
      };
    } else if (process.env.HEROKU_APP_NAME) {
      return {
        name: 'Heroku',
        status: 'Active',
        icon: '🦸'
      };
    } else if (process.env.RENDER_SERVICE_ID) {
      return {
        name: 'Render',
        status: 'Active',
        icon: '⚡'
      };
    } else if (process.env.RAILWAY_ENVIRONMENT) {
      return {
        name: 'Railway',
        status: 'Active',
        icon: '🚂'
      };
    } else if (process.env.VERCEL) {
      return {
        name: 'Vercel',
        status: 'Active',
        icon: '▲'
      };
    } else if (process.env.GLITCH_PROJECT_REMIX) {
      return {
        name: 'Glitch',
        status: 'Active',
        icon: '🎏'
      };
    } else if (process.env.KOYEB) {
      return {
        name: 'Koyeb',
        status: 'Active',
        icon: '☁️'
      };
    } else if (process.env.CYCLIC_URL) {
      return {
        name: 'Cyclic',
        status: 'Active',
        icon: '🔄'
      };
    } else if (process.env.PANEL) {
      return {
        name: 'PteroPanel',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.env.SSH_CONNECTION || process.env.SSH_CLIENT) {
      return {
        name: 'VPS/SSH',
        status: 'Active',
        icon: '🖥️'
      };
    } else if (process.platform === 'win32') {
      return {
        name: 'Windows PC',
        status: 'Active',
        icon: '💻'
      };
    } else if (process.platform === 'linux') {
      return {
        name: 'Linux VPS',
        status: 'Active',
        icon: '🐧'
      };
    } else if (process.platform === 'darwin') {
      return {
        name: 'MacOS',
        status: 'Active',
        icon: '🍎'
      };
    } else {
      return {
        name: 'Local Machine',
        status: 'Active',
        icon: '🏠'
      };
    }
  };
  
  const getTimeZone = () => {
    try {
      // Try to get timezone from system
      if (process.env.TZ) {
        return process.env.TZ;
      }
      
      // Try to detect from Intl
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        return timeZone;
      }
      
      // Fallback based on environment
      if (process.env.REPL_ID) {
        return 'America/Los_Angeles'; // Replit default
      } else if (process.env.HEROKU_APP_NAME) {
        return 'UTC'; // Heroku default
      } else if (process.env.RENDER) {
        return 'UTC'; // Render default
      }
      
    } catch (error) {}
    
    return 'UTC';
  };
  
  const getCorePower = () => {
    try {
      const cpus = os.cpus();
      if (cpus && cpus.length > 0) {
        const model = cpus[0].model;
        const cores = cpus.length;
        const speed = cpus[0].speed;
        
        // Calculate performance score
        let performance = 'Low';
        let icon = '🐢';
        
        if (cores >= 8 && speed >= 3000) {
          performance = 'Ultra';
          icon = '🚀';
        } else if (cores >= 4 && speed >= 2500) {
          performance = 'High';
          icon = '⚡';
        } else if (cores >= 2 && speed >= 2000) {
          performance = 'Medium';
          icon = '⚙️';
        }
        
        return {
          cores: cores,
          speed: `${(speed / 1000).toFixed(1)} GHz`,
          performance: performance,
          icon: icon,
          model: model.length > 30 ? model.substring(0, 30) + '...' : model
        };
      }
    } catch (error) {}
    
    return {
      cores: 'N/A',
      speed: 'N/A',
      performance: 'Unknown',
      icon: '❓',
      model: 'Unknown CPU'
    };
  };
  
  // Get current time and date
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Load bot information using helper functions
  const botName = getBotName();
  const ownerName = getOwnerName();
  const botPrefix = getBotPrefix();
  const botVersion = getBotVersion();
  const botMode = getBotMode();
  const deploymentPlatform = getDeploymentPlatform();
  const timeZone = getTimeZone();
  const corePower = getCorePower();
  
  // Add bot name header before the info section
  finalCaption += `┌────────────────
│ 🐺 *${botName} MENU* 🐺
└────────────────\n\n`;
  
  // Add info section only if any field is enabled
  const fieldsStatus = getAllFieldsStatus(style);
  if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
    const start = performance.now();
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const mnt = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${mnt}m ${s}s`;
    const speed = (performance.now() - start).toFixed(2);
    const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
    
    // SAFE CALCULATION: Prevent negative or invalid percentages
    const memPercentNum = ((usedMem / (totalMem * 1024)) * 100);
    const memPercent = Math.min(Math.max(parseFloat(memPercentNum.toFixed(0)), 0), 100);
    
    // SAFE BAR CALCULATION: Prevent negative repeat values
    const filledBars = Math.max(Math.floor(memPercent / 10), 0);
    const emptyBars = Math.max(10 - filledBars, 0);
    const memBar = "█".repeat(filledBars) + "░".repeat(emptyBars);
    
    // Get Node.js version
    const nodeVersion = process.version;
    
    // Calculate command speed in milliseconds
    const commandSpeed = `${speed}ms`;
    
    // Get CPU load with safe calculation
    const cpuLoad = Math.min(parseFloat(os.loadavg()[0].toFixed(2)), 5);
    const cpuLoadBars = Math.max(Math.floor(cpuLoad), 0);
    const cpuLoadEmpty = Math.max(5 - cpuLoadBars, 0);
    const cpuLoadBar = "█".repeat(cpuLoadBars) + "░".repeat(cpuLoadEmpty);
    
    const infoLines = [];
    
    // TIME & DATE SECTION
    if (fieldsStatus.time || fieldsStatus.date) {
      infoLines.push(`*┃ Date: ${currentDate}*`);
      infoLines.push(`*┃ Time: ${currentTime}*`);
    }
    
    // SYSTEM INFO SECTION
    if (fieldsStatus.user) infoLines.push(`*┃ User: ${m.pushName || "Anonymous"}*`);
    if (fieldsStatus.owner) infoLines.push(`*┃ Owner: ${ownerName}*`);
    if (fieldsStatus.mode) infoLines.push(`*┃ Mode: ${botMode}*`);
    if (fieldsStatus.prefix) infoLines.push(`*┃ Prefix: [ ${botPrefix} ]*`);
    if (fieldsStatus.version) infoLines.push(`*┃ Version: ${botVersion}*`);
    
    // DEPLOYMENT & PLATFORM
    if (fieldsStatus.host) {
      infoLines.push(`*┃ Panel: ${deploymentPlatform.name}*`);
      infoLines.push(`*┃ Status: ${deploymentPlatform.status}*`);
    }
    
    // PERFORMANCE METRICS
    if (fieldsStatus.speed) {
      infoLines.push(`*┃ Speed: ${commandSpeed}*`);
      infoLines.push(`*┃ CPU Load: ${cpuLoadBar} ${cpuLoad}*`);
    }

    if (fieldsStatus.uptime) infoLines.push(`*┃ Uptime: ${uptimeStr}*`);
    if (fieldsStatus.usage) infoLines.push(`*┃ Usage: ${usedMem} MB of ${totalMem} GB*`);
    if (fieldsStatus.ram) infoLines.push(`*┃ RAM: ${memBar} ${memPercent}%*`);

    // CORE POWER (HARDWARE INFO)
    if (fieldsStatus.ram || fieldsStatus.usage) { // Reuse existing toggles for core power
      infoLines.push(`*┃ ${corePower.icon} Cores: ${corePower.cores} @ ${corePower.speed}*`);
      infoLines.push(`*┃ Power: ${corePower.performance} Performance*`);
      infoLines.push(`*┃ CPU: ${corePower.model}*`);
    }
    
    // NODE & TECH STACK
    if (fieldsStatus.version) { // Reuse version toggle for Node info
      infoLines.push(`*┃ Node: ${nodeVersion}*`);
      infoLines.push(`*┃ Timezone: ${timeZone}*`);
    }

    if (infoLines.length > 0) {
      const infoCaption = `┌────────────────\n${infoLines.join('\n')}\n└────────────────\n\n`;
      finalCaption += infoCaption;
    }
  }

  const commandsText = `┌────────────────
│ 🏠 GROUP MANAGEMENT 🏠 
├────────────────
│ 🛡️ ADMIN & MODERATION 🛡️ 
├────────────────
│ add                     
│ promote                 
│ demote                  
│ kick                    
│ kickall                 
│ ban                     
│ unban                   
│ banlist                 
│ clearbanlist            
│ warn                    
│ resetwarn               
│ setwarn                 
│ mute                    
│ unmute                  
│ gctime                  
│ antileave               
│ antilink                
│ welcome                 
├────────────────
│ 🚫 AUTO-MODERATION 🚫   
├────────────────
│ antisticker             
│ antiviewonce  
│ antilink  
│ antiimage
│ antivideo
│ antiaudio
│ antimention
│ antistatusmention  
│ antigrouplink
├────────────────
│ 📊 GROUP INFO & TOOLS 📊 
├────────────────
│ groupinfo               
│ tagadmin                
│ tagall                  
│ hidetag                 
│ link                    
│ invite                  
│ revoke                  
│ setdesc                 
│ fangtrace               
│ getgpp                  
└────────────────

┌────────────────
│ 🎨 MENU COMMANDS 🎨
├────────────────
│ togglemenuinfo
│ setmenuimage
│ resetmenuinfo
│ menustyle
└────────────────

┌────────────────
│ 👑 OWNER CONTROLS 👑    
├────────────────
│ ⚡ CORE MANAGEMENT ⚡    
├────────────────
│ setbotname              
│ setowner                
│ setprefix               
│ iamowner                
│ about                   
│ block                   
│ unblock                 
│ blockdetect             
│ silent                  
│ anticall                
│ mode                    
│ online                  
│ setpp                   
│ repo                    
├────────────────
│ 🔄 SYSTEM & MAINTENANCE 🛠️ 
├────────────────
│ restart                 
│ workingreload           
│ reloadenv               
│ getsettings             
│ setsetting              
│ test                    
│ disk                    
│ hostip                  
│ findcommands            
└────────────────

┌────────────────
│ ⚙️ AUTOMATION ⚙️
├────────────────
│ autoread                
│ autotyping              
│ autorecording           
│ autoreact               
│ autoreactstatus         
│ autobio                 
│ autorec                 
└────────────────
┌────────────────
│ ✨ GENERAL UTILITIES ✨
├────────────────
│ 🔍 INFO & SEARCH 🔎
├────────────────
│ alive
│ ping
│ ping2
│ time
│ connection
│ define
│ news
│ covid
│ iplookup
│ getip
│ getpp
│ getgpp
│ prefixinfo
├───────────────
│ 🔗 CONVERSION & MEDIA 📁
├───────────────
│ shorturl
│ qrencode
│ take
│ imgbb
│ tiktok
│ save
├───────────────
│ 📝 PERSONAL TOOLS 📅
├───────────────
│ pair
│ resetwarn
│ setwarn
└────────────────


├────────────────
│ 🎵 MUSIC & MEDIA 🎶
├────────────────
│ play                    
│ song                    
│ lyrics                  
│ spotify                 
│ video                   
│ video2                  
│ bassboost               
│ trebleboost             
└────────────────

┌───────────────
│ 🤖 MEDIA & AI COMMANDS 🧠 
├───────────────
│ ⬇️ MEDIA DOWNLOADS 📥     
├───────────────
│ youtube                 
│ tiktok                 
│ instagram               
│ facebook                
│ snapchat                
│ apk                     
├───────────────
│ 🎨 AI GENERATION 💡    
├───────────────
│ gpt                     
│ gemini                  
│ deepseek                
│ deepseek+               
│ analyze                 
│ suno                    
│ wolfbot                 
│ videogen                
└───────────────

┌───────────────
│ 🖼️ IMAGE TOOLS 🖼️
├───────────────
│ image                   
│ imagegenerate           
│ anime                   
│ art                     
│ real                    
└───────────────

┌───────────────
│ 🛡️ SECURITY & HACKING 🔒 
├───────────────
│ 🌐 NETWORK & INFO 📡   
├───────────────
│ ipinfo                  
│ shodan                  
│ iplookup                
│ getip                   
└───────────────

┌────────────────
│ 🎨 LOGO DESIGN STUDIO 🎨
├────────────────
│ 🌟 PREMIUM METALS 🌟    
├────────────────
│ goldlogo                
│ silverlogo              
│ platinumlogo            
│ chromelogo              
│ diamondlogo             
│ bronzelogo              
│ steelogo                
│ copperlogo              
│ titaniumlogo            
├────────────────
│ 🔥 ELEMENTAL EFFECTS 🔥  
├────────────────
│ firelogo                
│ icelogo                 
│ iceglowlogo             
│ lightninglogo           
│ aqualogo                
│ rainbowlogo             
│ sunlogo                 
│ moonlogo                
├────────────────
│ 🎭 MYTHICAL & MAGICAL 🧙  
├────────────────
│ dragonlogo              
│ phoenixlogo             
│ wizardlogo              
│ crystallogo             
│ darkmagiclogo           
├────────────────
│ 🌌 DARK & GOTHIC 🌑     
├────────────────
│ shadowlogo              
│ smokelogo               
│ bloodlogo               
├────────────────
│ 💫 GLOW & NEON EFFECTS 🌈  
├────────────────
│ neonlogo                
│ glowlogo                
├────────────────
│ 🤖 TECH & FUTURISTIC 🚀  
├────────────────
│ matrixlogo              
└────────────────
┌────────────────
│ 🐙 GITHUB COMMANDS 🐙
├────────────────
│ gitclone
│ gitinfo
│ repo
│ commits
│ stars
│ watchers
│ release
└────────────────
┌────────────────
│ 🌸 ANIME COMMANDS 🌸
├────────────────
│ awoo
│ bj
│ bully
│ cringe
│ cry
│ cuddle
│ dance
│ glomp
│ highfive
│ kill
│ kiss
│ lick
│ megumin
│ neko
│ pat
│ shinobu
│ trap
│ trap2
│ waifu
│ wink
│ yeet
└────────────────



🐺🌕POWERED BY WOLFTECH🌕🐺

`;

  finalCaption += commandsText;

  const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
  const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
  const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
  if (!imagePath) {
    await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
    return;
  }
  const buffer = fs.readFileSync(imagePath);

  await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
  break;
}







        default:
          await sock.sendMessage(jid, { text: "❌ Unknown menu style. Reverting to default (Style 1)." }, { quoted: m });
          break;
       

        
   
      }

      console.log("✅ Menu sent successfully");

    } catch (err) {
      console.error("❌ [MENU] ERROR:", err);
      await sock.sendMessage(jid, { text: "⚠ Failed to load menu." }, { quoted: m });
    }
  },
};