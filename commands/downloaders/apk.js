




// // ====== apk.js - DIRECT FILE SENDER ======
// // Save as: ./commands/downloads/apk.js

// import fs from 'fs';
// import https from 'https';
// import http from 'http';
// import { tmpdir } from 'os';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default {
//     name: 'apk',
//     alias: ['app', 'apkdownload'],
//     description: 'Download and send APK files',
//     category: 'downloads',
    
//     async execute(sock, msg, args) {
//         const { remoteJid } = msg.key;
        
//         if (!args.length) {
//             return await sock.sendMessage(remoteJid, {
//                 text: `📱 *APK DOWNLOADER*\n\n.apk <name>\n\nExamples:\n• .apk facebook\n• .apk whatsapp\n• .apk termux\n• .apk surebet\n\n.apk list - Show all apps`
//             }, { quoted: msg });
//         }
        
//         const appName = args.join(' ').toLowerCase().trim();
        
//         // Show app list
//         if (appName === 'list') {
//             const apps = Object.keys(this.apkDatabase).map(a => `• ${a}`).join('\n');
//             return await sock.sendMessage(remoteJid, {
//                 text: `📱 *AVAILABLE APPS*\n\n${apps}\n\nTotal: ${Object.keys(this.apkDatabase).length} apps\n\n.apk <name> to download`
//             }, { quoted: msg });
//         }
        
//         // Get app data
//         const appData = this.getAppData(appName);
        
//         if (!appData) {
//             return await sock.sendMessage(remoteJid, {
//                 text: `❌ *${appName.toUpperCase()}* not found.\nType .apk list for available apps`
//             }, { quoted: msg });
//         }
        
//         // Send downloading message
//         await sock.sendMessage(remoteJid, {
//             text: `⬇️ *Downloading ${appData.name}...*\n📦 ${appData.size}\n⏳ Please wait...`
//         }, { quoted: msg });
        
//         try {
//             // Download APK
//             const apkBuffer = await this.downloadAPK(appData.url);
            
//             if (!apkBuffer || apkBuffer.length === 0) {
//                 throw new Error('Download failed');
//             }
            
//             // Send APK as document
//             await sock.sendMessage(remoteJid, {
//                 document: apkBuffer,
//                 fileName: `${appData.name.replace(/\s+/g, '_')}.apk`,
//                 mimetype: 'application/vnd.android.package-archive',
//                 caption: `📱 *${appData.name}*\n📦 ${appData.size}\n✅ Ready to install`
//             }, { quoted: msg });
            
//         } catch (error) {
//             console.error('APK Error:', error);
            
//             // Fallback to sending link
//             await sock.sendMessage(remoteJid, {
//                 text: `❌ *Couldn't send APK file*\n\n📱 *${appData.name}*\n🔗 Download: ${appData.url}\n📦 ${appData.size}\n\n⚠️ Tap link to download`
//             }, { quoted: msg });
//         }
//     },
    
//     // APK Database with direct download URLs
//     apkDatabase: {
//         'facebook': {
//             name: 'Facebook Lite',
//             url: 'https://fb.me/facebooklite',
//             size: '2.3 MB',
//             type: 'apk'
//         },
//         'whatsapp': {
//             name: 'WhatsApp',
//             url: 'https://web.archive.org/web/20230101000000/https://www.whatsapp.com/android/current/WhatsApp.apk',
//             size: '45 MB',
//             type: 'apk'
//         },
//         'messenger': {
//             name: 'Messenger Lite',
//             url: 'https://fb.me/messengerlite',
//             size: '1.8 MB',
//             type: 'apk'
//         },
//         'instagram': {
//             name: 'Instagram Lite',
//             url: 'https://d1.apkpure.com/b/APK/com.instagram.lite?version=latest',
//             size: '2.1 MB',
//             type: 'apk'
//         },
//         'telegram': {
//             name: 'Telegram',
//             url: 'https://telegram.org/dl/android/apk',
//             size: '45 MB',
//             type: 'apk'
//         },
//         'termux': {
//             name: 'Termux',
//             url: 'https://f-droid.org/repo/com.termux_118.apk',
//             size: '85 MB',
//             type: 'apk',
//             note: 'Terminal emulator'
//         },
//         'calculator': {
//             name: 'Calculator',
//             url: 'https://d.apkpure.com/b/APK/com.google.android.calculator?version=latest',
//             size: '5.4 MB',
//             type: 'apk'
//         },
//         'vpn': {
//             name: 'VPN App',
//             url: 'https://d.apkpure.com/b/APK/com.vpn?version=latest',
//             size: '8.2 MB',
//             type: 'apk'
//         },
//         'notepad': {
//             name: 'Notepad',
//             url: 'https://d.apkpure.com/b/APK/com.farmerbb.notepad?version=latest',
//             size: '3.1 MB',
//             type: 'apk'
//         },
//         'adblock': {
//             name: 'AdBlock',
//             url: 'https://d.apkpure.com/b/APK/com.adblock?version=latest',
//             size: '7.5 MB',
//             type: 'apk'
//         },
//         'spotify': {
//             name: 'Spotify Lite',
//             url: 'https://d.apkpure.com/b/APK/com.spotify.lite?version=latest',
//             size: '15 MB',
//             type: 'apk'
//         },
//         'youtube': {
//             name: 'YouTube Go',
//             url: 'https://d.apkpure.com/b/APK/com.google.android.apps.youtube.mango?version=latest',
//             size: '12 MB',
//             type: 'apk'
//         },
//         'surebet': {
//             name: 'SureBet',
//             url: 'https://apkpure.com/surebet/com.surebet/download?from=details',
//             size: '25 MB',
//             type: 'apk',
//             note: 'Betting app'
//         },
//         'pubg': {
//             name: 'PUBG Mobile Lite',
//             url: 'https://d.apkpure.com/b/APK/com.tencent.iglite?version=latest',
//             size: '650 MB',
//             type: 'apk',
//             note: 'Large file - use Wi-Fi'
//         },
//         'chrome': {
//             name: 'Chrome Browser',
//             url: 'https://d.apkpure.com/b/APK/com.android.chrome?version=latest',
//             size: '90 MB',
//             type: 'apk'
//         },
//         'twitter': {
//             name: 'Twitter Lite',
//             url: 'https://d.apkpure.com/b/APK/com.twitter.android.lite?version=latest',
//             size: '3.2 MB',
//             type: 'apk'
//         },
//         'netflix': {
//             name: 'Netflix',
//             url: 'https://d.apkpure.com/b/APK/com.netflix.mediaclient?version=latest',
//             size: '25 MB',
//             type: 'apk'
//         },
//         'tiktok': {
//             name: 'TikTok Lite',
//             url: 'https://d.apkpure.com/b/APK/com.zhiliaoapp.musically.go?version=latest',
//             size: '35 MB',
//             type: 'apk'
//         },
//         'snapchat': {
//             name: 'Snapchat',
//             url: 'https://d.apkpure.com/b/APK/com.snapchat.android?version=latest',
//             size: '85 MB',
//             type: 'apk'
//         },
//         'discord': {
//             name: 'Discord',
//             url: 'https://d.apkpure.com/b/APK/com.discord?version=latest',
//             size: '65 MB',
//             type: 'apk'
//         }
//     },
    
//     // Get app data by name
//     getAppData(appName) {
//         // Direct match
//         if (this.apkDatabase[appName]) {
//             return this.apkDatabase[appName];
//         }
        
//         // Partial match
//         for (const [key, data] of Object.entries(this.apkDatabase)) {
//             if (appName.includes(key) || key.includes(appName)) {
//                 return data;
//             }
//         }
        
//         // Common variations
//         const variations = {
//             'fb': 'facebook',
//             'wa': 'whatsapp',
//             'ig': 'instagram',
//             'yt': 'youtube',
//             'tg': 'telegram',
//             'sp': 'spotify',
//             'tt': 'tiktok',
//             'calc': 'calculator',
//             'note': 'notepad',
//             'vp': 'vpn',
//             'ad': 'adblock',
//             'snap': 'snapchat',
//             'dc': 'discord',
//             'twit': 'twitter',
//             'net': 'netflix',
//             'term': 'termux',
//             'sure': 'surebet',
//             'bet': 'surebet'
//         };
        
//         if (variations[appName]) {
//             return this.apkDatabase[variations[appName]];
//         }
        
//         return null;
//     },
    
//     // Download APK file
//     downloadAPK(url) {
//         return new Promise((resolve, reject) => {
//             const protocol = url.startsWith('https') ? https : http;
            
//             const request = protocol.get(url, (response) => {
//                 if (response.statusCode !== 200) {
//                     reject(new Error(`Failed: ${response.statusCode}`));
//                     return;
//                 }
                
//                 const chunks = [];
//                 response.on('data', (chunk) => {
//                     chunks.push(chunk);
                    
//                     // Limit file size to prevent memory issues
//                     const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
//                     if (totalSize > 100 * 1024 * 1024) { // 100MB limit
//                         request.destroy();
//                         reject(new Error('File too large'));
//                     }
//                 });
                
//                 response.on('end', () => {
//                     const buffer = Buffer.concat(chunks);
//                     resolve(buffer);
//                 });
                
//                 response.on('error', reject);
                
//             }).on('error', reject);
            
//             // Set timeout
//             request.setTimeout(30000, () => {
//                 request.destroy();
//                 reject(new Error('Timeout'));
//             });
//         });
//     }
// };














































import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fs from 'fs';

export default {
  name: 'apk',
  description: 'Download APK files from trusted sources',
  category: 'downloader',

  async execute(sock, m, args) {
    console.log('📱 [APK] Command triggered');
    
    const jid = m.key.remoteJid;
    const prefix = '#';
    
    if (!args || !args[0]) {
      await sock.sendMessage(jid, { 
        text: `📱 *APK Downloader*\n💡 *Usage:*\n• \`${prefix}apk <app-name>\`\n\n📌 *Examples:*\n• \`${prefix}apk termux\`\n• \`${prefix}apk facebook\`\n• \`${prefix}apk whatsapp\`\n• \`${prefix}apk instagram\`\n• \`${prefix}apk tiktok\`` 
      }, { quoted: m });
      return;
    }

    const appName = args[0].toLowerCase();
    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for ${appName} APK...*` 
    }, { quoted: m });

    try {
      // Get download link from a simpler source
      const result = await getSimpleApkLink(appName);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `❌ *${result.error || 'APK not found'}*\n\n💡 *Try:*\n• Check spelling\n• Use: \`${prefix}apk list\` to see available apps\n• Visit: https://apkcombo.com`
        }, { quoted: m });
        return;
      }

      // If user wants to see list of available apps
      if (appName === 'list') {
        await sock.sendMessage(jid, { 
          text: result.message
        }, { quoted: m });
        return;
      }

      const { downloadUrl, appTitle } = result;
      
      // Send file info
      await sock.sendMessage(jid, { 
        text: `✅ *Found: ${appTitle}*\n\n📥 *Downloading APK...*` 
      }, { quoted: m });

      // Download APK to temp file
      const tempDir = './temp/apk';
      if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
      
      const safeAppName = appName.replace(/[^a-z0-9]/gi, '_');
      const tempFile = `${tempDir}/${safeAppName}_${Date.now()}.apk`;
      
      console.log(`📱 [APK] Downloading from: ${downloadUrl}`);
      await downloadApkFile(downloadUrl, tempFile);
      
      const fileSize = fs.statSync(tempFile).size;
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
      
      console.log(`📱 [APK] File size: ${fileSizeMB}MB`);
      
      // Check if file is too large
      if (fileSize > 100 * 1024 * 1024) {
        await sock.sendMessage(jid, { 
          text: `⚠️ *APK too large*\n• Size: ${fileSizeMB}MB\n• WhatsApp limit: 100MB\n\n💡 *Direct download link:*\n${downloadUrl}`
        }, { quoted: m });
        if (existsSync(tempFile)) fs.unlinkSync(tempFile);
        return;
      }
      
      // Read APK file
      const apkData = fs.readFileSync(tempFile);
      
      // Send APK as document
      await sock.sendMessage(jid, {
        document: apkData,
        fileName: `${appTitle.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: `📱 *${appTitle} APK*\n\n📦 *Size:* ${fileSizeMB}MB\n⚠️ *Install at your own risk!*`
      }, { quoted: m });
      
      console.log(`✅ [APK] APK sent successfully: ${appTitle}`);
      
      // Cleanup
      if (existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        console.log(`🧹 [APK] Cleaned up temp file: ${tempFile}`);
      }
      
      // Send installation guide
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sock.sendMessage(jid, { 
        text: getInstallationGuide(appName)
      }, { quoted: m });

    } catch (error) {
      console.error('❌ [APK] Command error:', error);
      
      let errorMsg = `❌ *Download failed*\n\n⚠️ *Error:* ${error.message}`;
      
      if (error.message.includes('timeout')) {
        errorMsg += "\n• Request timed out";
      } else if (error.message.includes('ENOTFOUND')) {
        errorMsg += "\n• Network error";
      }
      
      errorMsg += "\n\n💡 *Alternative:*\n• Visit: https://apkcombo.com\n• Search for app manually";
      
      await sock.sendMessage(jid, { 
        text: errorMsg
      }, { quoted: m });
    }
  }
};

// Simple function to get APK download links
async function getSimpleApkLink(appName) {
  try {
    console.log(`📱 [APK] Getting link for: ${appName}`);
    
    // List of available apps with direct download links
    const appDatabase = {
      // Termux apps
      'termux': {
        title: 'Termux',
        url: 'https://f-droid.org/repo/com.termux_118.apk',
        source: 'F-Droid'
      },
      'termux-api': {
        title: 'Termux:API',
        url: 'https://f-droid.org/repo/com.termux.api_51.apk',
        source: 'F-Droid'
      },
      'termux-styling': {
        title: 'Termux:Styling',
        url: 'https://f-droid.org/repo/com.termux.styling_26.apk',
        source: 'F-Droid'
      },
      
      // Social Media (using APKCombo which is more reliable)
      'facebook': {
        title: 'Facebook',
        url: 'https://d.apkcombo.com/apk/com.facebook.katana/Facebook_448.0.0.32.102.apk',
        source: 'APKCombo'
      },
      'facebook-lite': {
        title: 'Facebook Lite',
        url: 'https://d.apkcombo.com/apk/com.facebook.lite/Facebook-Lite_405.0.0.7.111.apk',
        source: 'APKCombo'
      },
      'messenger': {
        title: 'Messenger',
        url: 'https://d.apkcombo.com/apk/com.facebook.orca/Messenger_447.0.0.31.108.apk',
        source: 'APKCombo'
      },
      'whatsapp': {
        title: 'WhatsApp',
        url: 'https://d.apkcombo.com/apk/com.whatsapp/WhatsApp_2.24.13.78.apk',
        source: 'APKCombo'
      },
      'whatsapp-business': {
        title: 'WhatsApp Business',
        url: 'https://d.apkcombo.com/apk/com.whatsapp.w4b/WhatsApp-Business_2.24.12.79.apk',
        source: 'APKCombo'
      },
      'instagram': {
        title: 'Instagram',
        url: 'https://d.apkcombo.com/apk/com.instagram.android/Instagram_322.0.0.22.111.apk',
        source: 'APKCombo'
      },
      'instagram-lite': {
        title: 'Instagram Lite',
        url: 'https://d.apkcombo.com/apk/com.instagram.lite/Instagram-Lite_351.0.0.11.111.apk',
        source: 'APKCombo'
      },
      'tiktok': {
        title: 'TikTok',
        url: 'https://d.apkcombo.com/apk/com.zhiliaoapp.musically/TikTok_33.8.4.apk',
        source: 'APKCombo'
      },
      'telegram': {
        title: 'Telegram',
        url: 'https://d.apkcombo.com/apk/org.telegram.messenger/Telegram_10.8.6.apk',
        source: 'APKCombo'
      },
      'twitter': {
        title: 'Twitter (X)',
        url: 'https://d.apkcombo.com/apk/com.twitter.android/Twitter_10.27.0-release.0.apk',
        source: 'APKCombo'
      },
      'snapchat': {
        title: 'Snapchat',
        url: 'https://d.apkcombo.com/apk/com.snapchat.android/Snapchat_12.83.0.38.apk',
        source: 'APKCombo'
      },
      
      // Messaging
      'discord': {
        title: 'Discord',
        url: 'https://d.apkcombo.com/apk/com.discord/Discord_216.15.apk',
        source: 'APKCombo'
      },
      'signal': {
        title: 'Signal',
        url: 'https://updates.signal.org/android/Signal-Android-6.46.10.apk',
        source: 'Signal Official'
      },
      
      // Media
      'youtube': {
        title: 'YouTube',
        url: 'https://d.apkcombo.com/apk/com.google.android.youtube/YouTube_19.09.37.apk',
        source: 'APKCombo'
      },
      'youtube-music': {
        title: 'YouTube Music',
        url: 'https://d.apkcombo.com/apk/com.google.android.apps.youtube.music/YouTube-Music_6.42.52.apk',
        source: 'APKCombo'
      },
      'spotify': {
        title: 'Spotify',
        url: 'https://d.apkcombo.com/apk/com.spotify.music/Spotify_8.9.16.624.apk',
        source: 'APKCombo'
      },
      'netflix': {
        title: 'Netflix',
        url: 'https://d.apkcombo.com/apk/com.netflix.mediaclient/Netflix_8.101.0.apk',
        source: 'APKCombo'
      },
      
      // Browsers
      'chrome': {
        title: 'Google Chrome',
        url: 'https://d.apkcombo.com/apk/com.android.chrome/Chrome_121.0.6167.178.apk',
        source: 'APKCombo'
      },
      'firefox': {
        title: 'Firefox',
        url: 'https://d.apkcombo.com/apk/org.mozilla.firefox/Firefox_122.0.apk',
        source: 'APKCombo'
      },
      'brave': {
        title: 'Brave Browser',
        url: 'https://d.apkcombo.com/apk/com.brave.browser/Brave_1.62.153.apk',
        source: 'APKCombo'
      },
      
      // Tools
      'mx-player': {
        title: 'MX Player',
        url: 'https://d.apkcombo.com/apk/com.mxtech.videoplayer.ad/MX-Player_1.77.7.apk',
        source: 'APKCombo'
      },
      'vlc': {
        title: 'VLC Media Player',
        url: 'https://d.apkcombo.com/apk/org.videolan.vlc/VLC-3.6.0.apk',
        source: 'APKCombo'
      },
      'es-file-explorer': {
        title: 'ES File Explorer',
        url: 'https://d.apkcombo.com/apk/com.estrongs.android.pop/ES-File-Explorer_4.4.0.3.2.apk',
        source: 'APKCombo'
      },
      
      // Gaming
      'minecraft': {
        title: 'Minecraft PE',
        url: 'https://d.apkcombo.com/apk/com.mojang.minecraftpe/Minecraft_1.20.60.24.apk',
        source: 'APKCombo'
      },
      'pubg': {
        title: 'PUBG Mobile',
        url: 'https://d.apkcombo.com/apk/com.tencent.ig/PUBG-MOBILE_3.0.0.apk',
        source: 'APKCombo'
      },
      'free-fire': {
        title: 'Free Fire',
        url: 'https://d.apkcombo.com/apk/com.dts.freefireth/Free-Fire_1.102.1.apk',
        source: 'APKCombo'
      }
    };
    
    // Show list of available apps
    if (appName === 'list') {
      const categories = {
        '📱 Termux Apps': ['termux', 'termux-api', 'termux-styling'],
        '📱 Social Media': ['facebook', 'whatsapp', 'instagram', 'tiktok', 'telegram', 'twitter', 'snapchat'],
        '📱 Messaging': ['messenger', 'discord', 'signal'],
        '📱 Media': ['youtube', 'spotify', 'netflix', 'mx-player', 'vlc'],
        '📱 Browsers': ['chrome', 'firefox', 'brave'],
        '🎮 Games': ['minecraft', 'pubg', 'free-fire']
      };
      
      let message = `📱 *Available APKs*\n\n`;
      
      for (const [category, apps] of Object.entries(categories)) {
        message += `*${category}:*\n`;
        apps.forEach(app => {
          const appInfo = appDatabase[app];
          if (appInfo) {
            message += `• \`${app}\` - ${appInfo.title}\n`;
          }
        });
        message += '\n';
      }
      
      message += `💡 *Usage:* \`${prefix}apk <app-name>\``;
      
      return {
        success: true,
        message: message
      };
    }
    
    // Check if app exists in database
    if (!appDatabase[appName]) {
      // Try to find similar app
      const similarApps = Object.keys(appDatabase).filter(key => 
        key.includes(appName) || appName.includes(key)
      );
      
      if (similarApps.length > 0) {
        let message = `❌ *"${appName}" not found*\n\n📌 *Did you mean:*\n`;
        similarApps.slice(0, 5).forEach(app => {
          message += `• \`${app}\` - ${appDatabase[app].title}\n`;
        });
        message += `\n💡 Use \`${prefix}apk list\` to see all apps`;
        
        return {
          success: false,
          error: message
        };
      }
      
      return {
        success: false,
        error: `App "${appName}" not in database`
      };
    }
    
    const appInfo = appDatabase[appName];
    
    return {
      success: true,
      downloadUrl: appInfo.url,
      appTitle: appInfo.title,
      source: appInfo.source
    };
    
  } catch (error) {
    console.error('❌ [APK] Get link error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to download APK file
async function downloadApkFile(url, filePath) {
  console.log(`📱 [APK DOWNLOAD] Starting download from: ${url}`);
  
  const writer = createWriteStream(filePath);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 120000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://apkcombo.com/',
      'Sec-Fetch-Dest': 'document'
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ [APK DOWNLOAD] Finished downloading to: ${filePath}`);
      resolve();
    });
    writer.on('error', (err) => {
      console.error(`❌ [APK DOWNLOAD] Write error:`, err.message);
      if (existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
    response.data.on('error', (err) => {
      console.error(`❌ [APK DOWNLOAD] Response error:`, err.message);
      if (existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
  });
}

// Function to get installation guide
function getInstallationGuide(appName) {
  const guides = {
    'termux': `📱 *Termux Installation Guide*\n\n1. Install Termux APK\n2. Open Termux\n3. Update packages:\n   \`pkg update && pkg upgrade\`\n4. Install useful tools:\n   • Python: \`pkg install python\`\n   • Git: \`pkg install git\`\n   • Node.js: \`pkg install nodejs\`\n\n💡 *Tips:*\n• Use \`termux-setup-storage\` for storage access`,
    
    'whatsapp': `📱 *WhatsApp Installation*\n\n1. Install WhatsApp APK\n2. Open and verify your number\n3. Restore backup if available\n\n⚠️ *Warning:*\n• Only install from trusted sources\n• Keep app updated for security`,
    
    'facebook': `📱 *Facebook Installation*\n\n1. Install Facebook APK\n2. Login with your account\n3. Customize settings\n\n⚠️ *Note:*\n• Facebook Lite is lighter alternative\n• Messenger is separate app`,
    
    'instagram': `📱 *Instagram Installation*\n\n1. Install Instagram APK\n2. Login with your account\n3. Enable notifications\n\n💡 *Tips:*\n• Connect with friends\n• Share photos and videos`,
    
    'tiktok': `📱 *TikTok Installation*\n\n1. Install TikTok APK\n2. Create account or login\n3. Allow permissions\n\n💡 *Features:*\n• Create short videos\n• Discover trending content`,
    
    'youtube': `📱 *YouTube Installation*\n\n1. Install YouTube APK\n2. Login with Google account\n3. Subscribe to channels\n\n💡 *Features:*\n• Watch videos offline\n• Create playlists`,
    
    'spotify': `📱 *Spotify Installation*\n\n1. Install Spotify APK\n2. Login or create account\n3. Download music for offline\n\n💡 *Features:*\n• Millions of songs\n• Create playlists`,
    
    'telegram': `📱 *Telegram Installation*\n\n1. Install Telegram APK\n2. Verify phone number\n3. Import chats if available\n\n💡 *Features:*\n• Cloud storage\n• Secret chats\n• Large file support`,
    
    'minecraft': `📱 *Minecraft PE Installation*\n\n1. Install Minecraft APK\n2. Launch the game\n3. Create or join worlds\n\n💡 *Tips:*\n• Survival or creative mode\n• Multiplayer with friends`
  };
  
  const defaultGuide = `📱 *Installation Guide*\n\n1. Install the APK file\n2. Allow "Install from Unknown Sources"\n   (Settings → Security → Unknown Sources)\n3. Open the app and set it up\n\n⚠️ *Security Tips:*\n• Only install from trusted sources\n• Check app permissions\n• Keep apps updated`;
  
  return guides[appName] || defaultGuide;
}