// // // // // import settingMenu from './settingMenu.js';
// // // // // import fs from 'fs';
// // // // // import path from 'path';
// // // // // import { fileURLToPath } from 'url';

// // // // // const __filename = fileURLToPath(import.meta.url);
// // // // // const __dirname = path.dirname(__filename);

// // // // // export default {
// // // // //   name: 'menu',
// // // // //   description: 'Displays the command menu',
// // // // //   async execute(sock, message, args, prefix) {
// // // // //     try {
// // // // //       const jid = message.key.remoteJid;
// // // // //       console.log("🐺 Menu command triggered by:", jid);

// // // // //       // 🕐 Step 1: Send loading message
// // // // //       await sock.sendMessage(jid, { text: '🕐 Summoning the *Wolf Command Center*... 🌕🐺' });

// // // // //       // 🖼️ Step 2: Locate the image file
// // // // //       const imagePath = path.join(__dirname, '../media/_wolfbo.png');
// // // // //       console.log("📁 Image path:", imagePath);

// // // // //       // Step 3: Check if image exists
// // // // //       if (!fs.existsSync(imagePath)) {
// // // // //         console.error("❌ Image not found at:", imagePath);
// // // // //         await sock.sendMessage(jid, { text: '⚠️ Could not find the wolf image at ' + imagePath });
// // // // //         return;
// // // // //       }

// // // // //       // Step 4: Read the image as a buffer
// // // // //       const imageBuffer = fs.readFileSync(imagePath);
// // // // //       console.log("✅ Image buffer loaded:", imageBuffer.length, "bytes");

// // // // //       // Step 5: Send the image with menu caption
// // // // //       await sock.sendMessage(
// // // // //         jid,
// // // // //         {
// // // // //           image: imageBuffer,
// // // // //           caption: settingMenu(prefix),
// // // // //           mimetype: 'image/png',
// // // // //         }
// // // // //       );

// // // // //       console.log("✅ Image with menu sent successfully!");

// // // // //     } catch (error) {
// // // // //       console.error("❌ Error sending menu:", error);
// // // // //       await sock.sendMessage(message.key.remoteJid, {
// // // // //         text: '❌ Error showing the Wolf Command Center. Check logs.',
// // // // //       });
// // // // //     }
// // // // //   },
// // // // // };















// // // // import fs from "fs";
// // // // import path from "path";

// // // // const menu = async (sock, m) => {
// // // //   try {
// // // //     // ✅ Automatically resolve absolute path to your image
// // // //     const __dirname = path.resolve();
// // // //     const imagePath = path.join(__dirname, "commands", "media", "wolfmenu.jpg");

// // // //     if (!fs.existsSync(imagePath)) {
// // // //       await sock.sendMessage(m.chat, {
// // // //         text: `⚠ Menu image not found at:\n${imagePath}`,
// // // //       });
// // // //       return;
// // // //     }

// // // //     const menuImage = fs.readFileSync(imagePath);

// // // //     const caption = `
// // // // 🐺🌕 *SILENT WOLF MENU* 🌕🐺

// // // // ┌───────────────
// // // // │ ⚔️ *GROUP COMMANDS*
// // // // ├───────────────
// // // // │ 🐺 .kick
// // // // │ 🐺 .add
// // // // │ 🐺 .promote
// // // // │ 🐺 .demote
// // // // │ 🐺 .mute
// // // // │ 🐺 .unmute
// // // // │ 🐺 .link
// // // // └───────────────

// // // // 🧠 *AI FEATURES*
// // // // │ 🤖 .ask
// // // // │ 🖋️ .summarize
// // // // │ 🗣️ .tts
// // // // │ 🐺 .wolfai

// // // // 🎵 *AUDIO TOOLS*
// // // // │ 🎧 .bass
// // // // │ 🎶 .pitch
// // // // │ 🎙️ .slow
// // // // │ ⚡ .fast

// // // // 🌐 *MEDIA*
// // // // │ 📥 .ytmp3
// // // // │ 🎬 .ytmp4
// // // // │ 📸 .igdl
// // // // │ 🐦 .twitdl

// // // // 🐾 *More power, more silence...* 🌕
// // // //     `;

// // // //     await sock.sendMessage(m.chat, {
// // // //       image: menuImage,
// // // //       caption: caption.trim(),
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("❌ Error sending menu:", err);
// // // //     await sock.sendMessage(m.chat, { text: "⚠ Failed to load menu." });
// // // //   }
// // // // };

// // // // export default menu;


 


// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // export default {
// //   name: "menu",
// //   description: "Shows the Wolf Command Center (image + caption)",
// //   async execute(sock, m) {
// //     const jid = m.key.remoteJid;

// //     console.log("\n🐺 [MENU] Command received from:", jid);

// //     try {
// //       // Step 1: Notify user
// //       await sock.sendMessage(jid, { text: "🕐 Summoning the *Wolf Command Center*... 🌕🐺" }, { quoted: m });
// //       console.log("✅ Step 1: Sent loading message");

// //       // Step 2: Try image paths
// //       const path1 = path.join(__dirname, "media", "wolfbot.jpg");
// //       const path2 = path.join(__dirname, "../media", "wolfbot.jpg");

// //       console.log("🔍 Checking paths:\n1️⃣", path1, "\n2️⃣", path2);

// //       let imagePath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : null;

// //       if (!imagePath) {
// //         console.error("❌ Step 2: Image not found in both paths!");
// //         await sock.sendMessage(jid, { text: "⚠️ Image 'wolfmenu.jpg' not found in /commands/media/ or /media/." }, { quoted: m });
// //         return;
// //       }

// //       console.log("✅ Step 2: Found image at:", imagePath);

// //       // Step 3: Read image buffer
// //       const imageBuffer = fs.readFileSync(imagePath);
// //       console.log("✅ Step 3: Image loaded successfully (" + imageBuffer.length + " bytes)");

// //       // Step 4: Prepare caption
// //       const caption = `
// // 🐺🌕 *WOLF BOT* 🌕🐺

// // ┌────────────────
// // │ 🏠 *GROUP MANAGEMENT* 🏠 
// // ├────────────────
// // │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// // ├────────────────
// // │ • add                     
// // │ • promote                 
// // │ • demote                  
// // │ • kick                    
// // │ • ban                     
// // │ • unban                   
// // │ • banlist                 
// // │ • clearbanlist            
// // │ • warn                    
// // │ • unwarn                  
// // │ • clearwarns              
// // │ • mute                    
// // │ • unmute                  
// // │ • gctime                  
// // │ • lock                    
// // │ • unlock                  
// // ├────────────────
// // │ 🚫 *AUTO-MODERATION* 🚫   
// // ├────────────────
// // │ • antilink                
// // │ • antisticker             
// // │ • antiimage               
// // │ • antivideo               
// // ├────────────────
// // │ 📊 *GROUP INFO & TOOLS* 📊 
// // ├────────────────
// // │ • groupinfo               
// // │ • tagadmin                
// // │ • tagall                  
// // │ • hidetag                 
// // │ • link                    
// // │ • invite                  
// // │ • revoke                  
// // │ • setname                 
// // │ • setdesc                 
// // │ • setgcpp                 
// // │ • welcome                 
// // │ • goodbye                 
// // │ • fangtrace               
// // │ • disp                    
// // └────────────────

// // ┌────────────────
// // │ 👑 *OWNER CONTROLS* 👑    
// // ├────────────────
// // │ ⚡ *CORE MANAGEMENT* ⚡    
// // ├────────────────
// // │ • setprefix               
// // │ • setantilink             
// // │ • block                   
// // │ • unblock                 
// // │ • silent                  
// // │ • default                 
// // │ • runcode                 
// // ├────────────────
// // │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// // ├────────────────
// // │ • restart                 
// // │ • update                  
// // │ • gcrestart               
// // │ • backup                  
// // │ • restore                 
// // │ • cleardb                 
// // │ • cleartemp               
// // └────────────────

// // ┌────────────────
// // │ ✨ *GENERAL UTILITIES* ✨  
// // ├────────────────
// // │ 🔍 *INFO & SEARCH* 🔎     
// // ├────────────────
// // │ • ping                    
// // │ • time                    
// // │ • calc                    
// // │ • define                  
// // │ • dictionary              
// // │ • wiki                    
// // │ • news                    
// // │ • weather                 
// // │ • covid                    
// // │ • stock                   
// // │ • currency                
// // ├───────────────
// // │ 🔗 *CONVERSION & MEDIA* 📁 
// // ├───────────────
// // │ • translate               
// // │ • convert                 
// // │ • shorturl                
// // │ • expandurl               
// // │ • qrencode                
// // │ • qrdecode                
// // │ • reverseimage            
// // │ • tomp3                   
// // │ • tovideo                 
// // │ • tosticker               
// // ├───────────────
// // │ 📝 *PERSONAL TOOLS* 📅    
// // ├───────────────
// // │ • reminder                
// // │ • todo                    
// // └───────────────

// // ├────────────────
// // │ 🎵 *MUSIC & FUN* 🎶
// // ├────────────────
// // │ • play



// // ┌───────────────
// // │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// // ├───────────────
// // │ ⬇️ *MEDIA DOWNLOADS* 📥     
// // ├───────────────
// // │ • ytdl                    
// // │ • spotifydl               
// // │ • tiktokdl                
// // │ • instadl                 
// // │ • twitterdl               
// // │ • mediafire               
// // ├───────────────
// // │ 🎨 *AI GENERATION* 💡    
// // ├───────────────
// // │ • gemini                  
// // │ • gpt                     
// // │ • deepseek                
// // │ • chat                    
// // │ • summary                 
// // │ • imagine                 
// // │ • dalle                   
// // └───────────────

// // ┌───────────────
// // │ 🛡️ *SECURITY & HACKING* 🔒 
// // ├───────────────
// // │ 🌐 *NETWORK & INFO* 📡   
// // ├───────────────
// // │ • ipinfo              
// // │ • whois               
// // │ • dnslookup           
// // │ • host                
// // │ • reverseip           
// // │ • ssllabs             
// // │ • shodan              
// // ├────────────────
// // │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// // ├────────────────
// // │ • pwcheck             
// // │ • breach              
// // │ • portscan            
// // │ • httpheaders         
// // │ • subdomains          
// // │ • encode              
// // │ • decode              
// // │ • consent             
// // │ • scan-now            
// // │ • scan-status         
// // │ • security-tips       
// // └────────────────

// // 🐺🌕*POWERED BY WOLF TECH*🌕🐺

// // `;

// //       console.log("✅ Step 4: Caption prepared");

// //       // Step 5: Send image with caption
// //       await sock.sendMessage(
// //         jid,
// //         {
// //           image: imageBuffer,
// //           caption,
// //           mimetype: "image/jpeg",
// //         },
// //         { quoted: m }
// //       );

// //       console.log("✅ Step 5: Menu sent successfully with image + caption");

// //     } catch (err) {
// //       console.error("❌ [MENU] ERROR CAUGHT:");
// //       console.error(err);
// //       await sock.sendMessage(
// //         m.key.remoteJid,
// //         { text: "⚠ Failed to load menu. Check console logs for details." },
// //         { quoted: m }
// //       );
// //     }
// //   },
// // };






// import os from "os";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// // per-menu toggles
// // import { getCurrentMenuStyle, menuToggles } from "./menustyle.js";
// import { getCurrentMenuStyle } from "./menustyle.js";
// //import { currentMenu } from "../menus/menuToggles.js";
// import { setLastMenu, menuToggles } from "../menus/menuToggles.js";




// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   name: "menu",
//   description: "Shows the Wolf Command Center in various styles",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const style = getCurrentMenuStyle();

//     console.log(`\n🐺 [MENU] Command received from: ${jid} | Using style: ${style}`);

//     try {
//       switch (style) {
//         case 1: {
//           // ✅ Image Menu
//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media", "wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;

//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }

//           const buffer = fs.readFileSync(imagePath);
//           const caption = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// *`; // Use your full command list here

//           await sock.sendMessage(jid, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }

//         case 2: {
//           // 📝 Text Only
//           const text = `🐺🌕 *WOLF BOT* 🌕🐺
// ────────────────
// > 🏠 *GROUP MANAGEMENT* — manage members & group
// > • add — add user
// > • promote — make admin
// > • demote — remove admin
// > • kick — remove user
// > • ban — ban user
// > • unban — unban user
// > • banlist — show banned
// > • clearbanlist — clear bans
// > • warn — warn user
// > • unwarn — remove warning
// > • clearwarns — reset warnings
// > • mute — mute user
// > • unmute — unmute user
// > • gctime — group time settings
// > • lock — lock group
// > • unlock — unlock group

// > 🚫 *AUTO-MODERATION* — auto-protect group
// > • antilink — block links
// > • antisticker — block stickers
// > • antiimage — block images
// > • antivideo — block videos

// > 📊 *GROUP INFO & TOOLS* — group info commands
// > • groupinfo — show info
// > • tagadmin — mention admins
// > • tagall — mention all
// > • hidetag — hide mentions
// > • link — show group link
// > • invite — generate invite
// > • revoke — revoke link
// > • setname — change name
// > • setdesc — change description
// > • setgcpp — change group picture
// > • welcome — set welcome message
// > • goodbye — set goodbye message
// > • fangtrace — trace user
// > • disp — display group stats

// > 👑 *OWNER CONTROLS* — bot owner commands
// > • setprefix — change prefix
// > • setantilink — toggle antilink
// > • block — block user
// > • unblock — unblock user
// > • silent — silent mode
// > • default — reset settings
// > • runcode — run code

// > 🔄 *SYSTEM & MAINTENANCE* — bot maintenance
// > • restart — restart bot
// > • update — update bot
// > • gcrestart — restart group
// > • backup — backup data
// > • restore — restore data
// > • cleardb — clear database
// > • cleartemp — clear temp files

// > ✨ *GENERAL UTILITIES* — info & conversions
// > • ping — bot ping
// > • time — current time
// > • calc — calculator
// > • define — word definition
// > • dictionary — word lookup
// > • wiki — search wiki
// > • news — latest news
// > • weather — weather info
// > • covid — covid stats
// > • stock — stock info
// > • currency — convert currency
// > • translate — translate text
// > • convert — convert formats
// > • shorturl — shorten URL
// > • expandurl — expand URL
// > • qrencode — QR encode
// > • qrdecode — QR decode
// > • reverseimage — reverse image search
// > • tomp3 — video to mp3
// > • tovideo — convert to video
// > • tosticker — convert to sticker
// > • reminder — set reminder
// > • todo — add todo

// > 🎵 *MUSIC & FUN* — entertainment
// > • play — play music

// > 🤖 *MEDIA & AI* — media & AI tools
// > • ytdl — download YouTube
// > • spotifydl — download Spotify
// > • tiktokdl — download TikTok
// > • instadl — download Instagram
// > • twitterdl — download Twitter
// > • mediafire — download Mediafire
// > • gemini — AI chat
// > • gpt — AI chat
// > • deepseek — AI search
// > • chat — AI conversation
// > • summary — text summary
// > • imagine — generate images
// > • dalle — generate images

// > 🛡️ *SECURITY & HACKING* — network & scans
// > • ipinfo — IP info
// > • whois — domain info
// > • dnslookup — DNS lookup
// > • host — host info
// > • reverseip — reverse IP lookup
// > • ssllabs — SSL check
// > • shodan — scan device
// > • pwcheck — password check
// > • breach — check breach
// > • portscan — scan ports
// > • httpheaders — fetch headers
// > • subdomains — list subdomains
// > • encode — encode text
// > • decode — decode text
// > • consent — consent check
// > • scan-now — run full scan
// > • scan-status — scan status
// > • security-tips — show tips

// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `; 
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//         case 3: {
//           // 📄 Full description
//           const text = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺`; 
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//         case 4: {
//           // 🔥 Ad Style
//           const text = `🐺 *WOLF BOT POWER MENU* 🌕\n\n🔥 Boost your group management\n💎 Unlock exclusive admin tools\n✨ Use AI & Media features\n*Style 4: Ad Style*`;
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//      case 5: {
//   // 📝 Full info + commands (image removed)

//   const start = performance.now();
//   const uptime = process.uptime();
//   const h = Math.floor(uptime / 3600);
//   const mnt = Math.floor((uptime % 3600) / 60);
//   const s = Math.floor(uptime % 60);
//   const uptimeStr = `${h}h ${mnt}m ${s}s`;
//   const speed = (performance.now() - start).toFixed(2);
//   const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//   const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//   const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//   const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//   const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//   const host = process.env.REPL_ID
//     ? "Replit"
//     : process.env.HEROKU_APP_NAME
//     ? "Heroku"
//     : process.env.RENDER
//     ? "Render"
//     : "Panel";
//   const prefix = global.prefix || ".";
//   const version = global.version || "v2.6.2";

//   const infoText = `
// > ────────────────
// > ┃ User: ${m.pushName || "Anonymous"}
// > ┃ Owner: ${ownerNumber}
// > ┃ Mode: ${global.mode || "private"}
// > ┃ Host: ${host}
// > ┃ Speed: ${speed} ms
// > ┃ Prefix: [ ${prefix} ]
// > ┃ Uptime: ${uptimeStr}
// > ┃ Version: ${version}
// > ┃ Usage: ${usedMem} MB of ${totalMem} GB
// > ┃ RAM: ${memBar} ${memPercent}%
// > └────────────────
// `;

//   const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//   await sock.sendMessage(jid, { text: infoText + commandsText }, { quoted: m });
//   break;
// }


//         case 6: {
//           // 🖼️ Full info + image + commands



//           const start = performance.now();
//           const uptime = process.uptime();
//           const h = Math.floor(uptime / 3600);
//           const mnt = Math.floor((uptime % 3600) / 60);
//           const s = Math.floor(uptime % 60);
//           const uptimeStr = `${h}h ${mnt}m ${s}s`;
//           const speed = (performance.now() - start).toFixed(2);
//           const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//           const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//           const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//           const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//           const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//           const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//           const prefix = global.prefix || ".";
//           const version = global.version || "v2.6.2";

//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }
//           const buffer = fs.readFileSync(imagePath);

//           const infoCaption = `
// ────────────────
// ┃ User: ${m.pushName || "Anonymous"}
// ┃ Owner: ${ownerNumber}
// ┃ Mode: ${global.mode || "private"}
// ┃ Host: ${host}
// ┃ Speed: ${speed} ms
// ┃ Prefix: [ ${prefix} ]
// ┃ Uptime: ${uptimeStr}
// ┃ Version: ${version}
// ┃ Usage: ${usedMem} MB of ${totalMem} GB
// ┃ RAM: ${memBar} ${memPercent}%
// └────────────────
// `;

//           const commandsText = `
// 🐺🌕 *WOLF BOT* 🌕🐺

// ┌───────────────
// │ 🏠 *GROUP MANAGEMENT*
// ├───────────────
// │ • add
// │ • promote
// │ • demote
// │ • kick
// │ • ban
// │ • unban
// │ • banlist
// │ • clearbanlist
// │ • warn
// │ • unwarn
// │ • clearwarns
// │ • mute
// │ • unmute
// │ • gctime
// │ • lock
// │ • unlock
// └───────────────

// ... (rest of commands here) ...

// 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//           await sock.sendMessage(jid, { image: buffer, caption: infoCaption + commandsText, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }


//  case 7: {
//           // 🖼️ Full info + image + commands
 
    


//           const start = performance.now();
//           const uptime = process.uptime();
//           const h = Math.floor(uptime / 3600);
//           const mnt = Math.floor((uptime % 3600) / 60);
//           const s = Math.floor(uptime % 60);
//           const uptimeStr = `${h}h ${mnt}m ${s}s`;
//           const speed = (performance.now() - start).toFixed(2);
//           const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//           const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//           const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//           const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//           const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//           const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//           const prefix = global.prefix || ".";
//           const version = global.version || "v2.6.2";

//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }
//           const buffer = fs.readFileSync(imagePath);

//           const infoCaption = `
// ────────────────
// ┃ User: ${m.pushName || "Anonymous"}
// ┃ Owner: ${ownerNumber}
// ┃ Mode: ${global.mode || "private"}
// ┃ Host: ${host}
// ┃ Speed: ${speed} ms
// ┃ Prefix: [ ${prefix} ]
// ┃ Uptime: ${uptimeStr}
// ┃ Version: ${version}
// ┃ Usage: ${usedMem} MB of ${totalMem} GB
// ┃ RAM: ${memBar} ${memPercent}%
// └────────────────
// `;

//           const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//           await sock.sendMessage(jid, { image: buffer, caption: infoCaption + commandsText, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }


//         default:
//           await sock.sendMessage(jid, { text: "❌ Unknown menu style. Reverting to default (Style 1)." }, { quoted: m });
//           break;
//       }

//       console.log("✅ Menu sent successfully");

//     } catch (err) {
//       console.error("❌ [MENU] ERROR:", err);
//       await sock.sendMessage(jid, { text: "⚠ Failed to load menu." }, { quoted: m });
//     }
//   },
// };













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
  
  // Add these helper functions (same as cases 6 & 7)
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

    const infoLines = [];
    // Bot name is already in the header, so we don't duplicate it here
    if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
    if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
    if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${botMode}`);  // Use the loaded botMode
    if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
    if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
    if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
    if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
    if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
    if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
    if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

    if (infoLines.length > 0) {
      const infoText = `> ┌────────────────\n${infoLines.map(line => `> ${line}`).join('\n')}\n> └────────────────\n`;
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
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • unwarn                  
> │ • clearwarns              
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • lock                    
> │ • unlock                  
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antilink               
> │ • antisticker            
> │ • antiimage              
> │ • antivideo             
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
> │ • setname                 
> │ • setdesc                 
> │ • setgcpp                 
> │ • welcome                 
> │ • goodbye                 
> │ • fangtrace               
> │ • disp                    
> └────────────────

> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setprefix               
> │ • setantilink             
> │ • block                   
> │ • unblock                 
> │ • silent                  
> │ • default                 
> │ • runcode                 
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • update                  
> │ • gcrestart               
> │ • backup                  
> │ • restore                 
> │ • cleardb                 
> │ • cleartemp               
> └────────────────

> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨  
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎     
> ├────────────────
> │ • ping                    
> │ • time                    
> │ • calc                    
> │ • define                  
> │ • dictionary              
> │ • wiki                    
> │ • news                    
> │ • weather                 
> │ • covid                   
> │ • stock                   
> │ • currency               
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁 
> ├───────────────
> │ • translate               
> │ • convert                 
> │ • shorturl                
> │ • expandurl               
> │ • qrencode                
> │ • qrdecode                
> │ • reverseimage            
> │ • tomp3                   
> │ • tovideo                 
> │ • tosticker               
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅    
> ├───────────────
> │ • reminder                
> │ • todo                   
> └───────────────

> ├────────────────
> │ 🎵 *MUSIC & FUN* 🎶
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
> │ • ytdl                    
> │ • spotifydl               
> │ • tiktokdl                
> │ • instadl                 
> │ • twitterdl               
> │ • mediafire               
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gemini                  
> │ • gpt                     
> │ • deepseek                
> │ • chat                    
> │ • summary                 
> │ • imagine                 
> │ • dalle                   
> └───────────────

> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo              
> │ • whois               
> │ • dnslookup          
> │ • host               
> │ • reverseip           
> │ • ssllabs             
> │ • shodan              
> ├────────────────
> │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
> ├────────────────
> │ • pwcheck             
> │ • breach              
> │ • portscan            
> │ • httpheaders         
> │ • subdomains          
> │ • encode              
> │ • decode              
> │ • consent             
> │ • scan-now            
> │ • scan-status         
> │ • security-tips       
> └────────────────

> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`;

  finalText += commandsText;
  await sock.sendMessage(jid, { text: finalText }, { quoted: m });
  break;
}












//         case 6: {
//           // 🖼️ Full info + image + commands (with individual toggles)
//           let finalCaption = "";
          
//           // Add info section only if any field is enabled
//           const fieldsStatus = getAllFieldsStatus(style);
//           if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
//             const start = performance.now();
//             const uptime = process.uptime();
//             const h = Math.floor(uptime / 3600);
//             const mnt = Math.floor((uptime % 3600) / 60);
//             const s = Math.floor(uptime % 60);
//             const uptimeStr = `${h}h ${mnt}m ${s}s`;
//             const speed = (performance.now() - start).toFixed(2);
//             const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//             const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//             const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//             const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//             const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//             const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//             const prefix = global.prefix || ".";
//             const version = global.version || "v2.6.2";

//             const infoLines = [];
//             if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
//             if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
//             if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${global.mode || "private"}`);
//             if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
//             if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
//             if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
//             if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
//             if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
//             if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
//             if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

//             if (infoLines.length > 0) {
//               const infoCaption = `────────────────\n${infoLines.join('\n')}\n└────────────────\n`;
//               finalCaption += infoCaption;
//             }
//           }

//           const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────

// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────

// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play


// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────

// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────

// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//           finalCaption += commandsText;

//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }
//           const buffer = fs.readFileSync(imagePath);

//           await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }

case 6: {
  // 🖼️ Full info + image + commands (with individual toggles)
  let finalCaption = "";
  
  // Add these helper functions (same as case 7)
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

    const infoLines = [];
    // Bot name is already in the header, so we don't duplicate it here
    if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
    if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
    if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${botMode}`);  // Use the loaded botMode
    if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
    if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
    if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
    if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
    if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
    if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
    if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

    if (infoLines.length > 0) {
      const infoCaption = `> ┌────────────────\n${infoLines.map(line => `> ${line}`).join('\n')}\n> └────────────────\n`;
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
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • unwarn                  
> │ • clearwarns              
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • lock                    
> │ • unlock                  
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antilink               
> │ • antisticker            
> │ • antiimage              
> │ • antivideo             
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
> │ • setname                 
> │ • setdesc                 
> │ • setgcpp                 
> │ • welcome                 
> │ • goodbye                 
> │ • fangtrace               
> │ • disp                    
> └────────────────

> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setprefix               
> │ • setantilink             
> │ • block                   
> │ • unblock                 
> │ • silent                  
> │ • default                 
> │ • runcode                 
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • update                  
> │ • gcrestart               
> │ • backup                  
> │ • restore                 
> │ • cleardb                 
> │ • cleartemp               
> └────────────────

> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨  
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎     
> ├────────────────
> │ • ping                    
> │ • time                    
> │ • calc                    
> │ • define                  
> │ • dictionary              
> │ • wiki                    
> │ • news                    
> │ • weather                 
> │ • covid                   
> │ • stock                   
> │ • currency               
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁 
> ├───────────────
> │ • translate               
> │ • convert                 
> │ • shorturl                
> │ • expandurl               
> │ • qrencode                
> │ • qrdecode                
> │ • reverseimage            
> │ • tomp3                   
> │ • tovideo                 
> │ • tosticker               
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅    
> ├───────────────
> │ • reminder                
> │ • todo                   
> └───────────────

> ├────────────────
> │ 🎵 *MUSIC & FUN* 🎶
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
> │ • ytdl                    
> │ • spotifydl               
> │ • tiktokdl                
> │ • instadl                 
> │ • twitterdl               
> │ • mediafire               
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gemini                  
> │ • gpt                     
> │ • deepseek                
> │ • chat                    
> │ • summary                 
> │ • imagine                 
> │ • dalle                   
> └───────────────

> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo              
> │ • whois               
> │ • dnslookup          
> │ • host               
> │ • reverseip           
> │ • ssllabs             
> │ • shodan              
> ├────────────────
> │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
> ├────────────────
> │ • pwcheck             
> │ • breach              
> │ • portscan            
> │ • httpheaders         
> │ • subdomains          
> │ • encode              
> │ • decode              
> │ • consent             
> │ • scan-now            
> │ • scan-status         
> │ • security-tips       
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


case 7: {
  // Similar to case 6 - apply the same individual toggle logic
  // ... (same pattern as case 6)
  
  // 🖼️ Full info + image + commands (with individual toggles)
  let finalCaption = "";
  
  // Add these helper functions at the start of case 7
  const getBotMode = () => {
    try {
      console.log('🔍 DEBUG: Looking for bot_mode.json...');
      
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
          console.log(`✅ DEBUG: Found bot_mode.json at: ${modePath}`);
          try {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            console.log(`📊 DEBUG: Mode data:`, modeData);
            
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
              
              console.log(`✅ DEBUG: Mode loaded: ${modeData.mode} -> ${displayMode}`);
              return displayMode;
            }
          } catch (parseError) {
            console.error(`❌ DEBUG: Error parsing ${modePath}:`, parseError);
          }
        }
      }
      
      console.log('⚠️ DEBUG: No bot_mode.json found in any path, checking global...');
      
      // Fallback to global variables
      if (global.BOT_MODE) {
        console.log(`✅ DEBUG: Found global.BOT_MODE: ${global.BOT_MODE}`);
        return global.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (global.mode) {
        console.log(`✅ DEBUG: Found global.mode: ${global.mode}`);
        return global.mode === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      if (process.env.BOT_MODE) {
        console.log(`✅ DEBUG: Found process.env.BOT_MODE: ${process.env.BOT_MODE}`);
        return process.env.BOT_MODE === 'silent' ? '🔇 Silent' : '🌍 Public';
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error in getBotMode:', error);
    }
    
    console.log('⚠️ DEBUG: Using default mode: 🌍 Public');
    return '🌍 Public'; // Default fallback
  };
  
  // ADD THIS NEW HELPER FUNCTION FOR BOT NAME
  const getBotName = () => {
    try {
      console.log('🔍 DEBUG: Looking for bot_settings.json...');
      
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
          console.log(`✅ DEBUG: Found bot_settings.json at: ${settingsPath}`);
          try {
            const settingsData = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);
            console.log(`📊 DEBUG: Settings data:`, settings);
            
            if (settings.botName && settings.botName.trim() !== '') {
              const loadedName = settings.botName.trim();
              console.log(`✅ DEBUG: Bot name loaded: "${loadedName}"`);
              return loadedName;
            }
          } catch (parseError) {
            console.error(`❌ DEBUG: Error parsing ${settingsPath}:`, parseError);
          }
        }
      }
      
      console.log('⚠️ DEBUG: No bot_settings.json found in any path, checking global...');
      
      // Fallback to global variables
      if (global.BOT_NAME) {
        console.log(`✅ DEBUG: Found global.BOT_NAME: ${global.BOT_NAME}`);
        return global.BOT_NAME;
      }
      
      // Fallback to environment variable
      if (process.env.BOT_NAME) {
        console.log(`✅ DEBUG: Found process.env.BOT_NAME: ${process.env.BOT_NAME}`);
        return process.env.BOT_NAME;
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error in getBotName:', error);
    }
    
    console.log('⚠️ DEBUG: Using default bot name: WOLFBOT');
    return 'WOLFBOT'; // Default fallback
  };
  
  // ADD THIS NEW HELPER FUNCTION FOR OWNER NAME
  const getOwnerName = () => {
    try {
      console.log('🔍 DEBUG: Looking for owner name...');
      
      // First priority: Check bot_settings.json for custom owner name
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
            
            // Check for owner name in bot_settings.json
            if (settings.ownerName && settings.ownerName.trim() !== '') {
              console.log(`✅ DEBUG: Custom owner name found: "${settings.ownerName}"`);
              return settings.ownerName.trim();
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      console.log('⚠️ DEBUG: No custom owner name found, checking owner.json...');
      
      // Second priority: Load from owner.json (original method)
      const ownerPath = path.join(__dirname, 'owner.json');
      if (fs.existsSync(ownerPath)) {
        const ownerData = fs.readFileSync(ownerPath, 'utf8');
        const ownerInfo = JSON.parse(ownerData);
        
        // Try different possible field names in owner.json
        if (ownerInfo.owner && ownerInfo.owner.trim() !== '') {
          console.log(`✅ DEBUG: Owner from owner.json: "${ownerInfo.owner}"`);
          return ownerInfo.owner.trim();
        } else if (ownerInfo.number && ownerInfo.number.trim() !== '') {
          console.log(`✅ DEBUG: Owner number from owner.json: "${ownerInfo.number}"`);
          return ownerInfo.number.trim();
        } else if (ownerInfo.phone && ownerInfo.phone.trim() !== '') {
          console.log(`✅ DEBUG: Owner phone from owner.json: "${ownerInfo.phone}"`);
          return ownerInfo.phone.trim();
        } else if (ownerInfo.contact && ownerInfo.contact.trim() !== '') {
          console.log(`✅ DEBUG: Owner contact from owner.json: "${ownerInfo.contact}"`);
          return ownerInfo.contact.trim();
        } else if (Array.isArray(ownerInfo) && ownerInfo.length > 0) {
          // If it's an array, take the first one
          const owner = typeof ownerInfo[0] === 'string' ? ownerInfo[0] : "Unknown";
          console.log(`✅ DEBUG: Owner from array: "${owner}"`);
          return owner;
        }
      }
      
      console.log('⚠️ DEBUG: No owner.json found, checking global...');
      
      // Third priority: Global variables
      if (global.OWNER_NAME) {
        console.log(`✅ DEBUG: Found global.OWNER_NAME: ${global.OWNER_NAME}`);
        return global.OWNER_NAME;
      }
      if (global.owner) {
        console.log(`✅ DEBUG: Found global.owner: ${global.owner}`);
        return global.owner;
      }
      if (process.env.OWNER_NUMBER) {
        console.log(`✅ DEBUG: Found process.env.OWNER_NUMBER: ${process.env.OWNER_NUMBER}`);
        return process.env.OWNER_NUMBER;
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error in getOwnerName:', error);
    }
    
    console.log('⚠️ DEBUG: Using default owner: Unknown');
    return 'Unknown'; // Default fallback
  };
  
  // ADD THIS NEW HELPER FUNCTION FOR PREFIX
  const getBotPrefix = () => {
    try {
      console.log('🔍 DEBUG: Looking for prefix...');
      
      // First priority: Check bot_settings.json for custom prefix
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
            
            // Check for prefix in bot_settings.json
            if (settings.prefix && settings.prefix.trim() !== '') {
              console.log(`✅ DEBUG: Custom prefix found: "${settings.prefix}"`);
              return settings.prefix.trim();
            }
          } catch (parseError) {
            // Continue to next path
          }
        }
      }
      
      console.log('⚠️ DEBUG: No custom prefix found, checking global...');
      
      // Second priority: Global prefix
      if (global.prefix) {
        console.log(`✅ DEBUG: Found global.prefix: ${global.prefix}`);
        return global.prefix;
      }
      
      // Third priority: Environment variable
      if (process.env.PREFIX) {
        console.log(`✅ DEBUG: Found process.env.PREFIX: ${process.env.PREFIX}`);
        return process.env.PREFIX;
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error in getBotPrefix:', error);
    }
    
    console.log('⚠️ DEBUG: Using default prefix: .');
    return '.'; // Default fallback
  };
  
  // Load bot name using the helper function
  const botName = getBotName();
  const ownerName = getOwnerName();
  const botPrefix = getBotPrefix();
  console.log(`✅ Menu display - Bot: "${botName}" | Owner: "${ownerName}" | Prefix: "${botPrefix}"`);
  
  // Add bot name header before the info section
  finalCaption += `┌────────────────
│ 🐺 ${botName}  MENU 🐺
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
    const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
    const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

    // Load bot mode using the helper function
    const botMode = getBotMode();
    console.log(`✅ Menu display mode: ${botMode}`);

    const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
    const version = global.version || "v2.6.2";

    const infoLines = [];
    // Bot name is already in the header, so we don't duplicate it here
    if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
    if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerName}`);  // Use loaded owner name
    if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${botMode}`);  // Use the loaded botMode
    if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
    if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
    if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${botPrefix} ]`);  // Use loaded prefix
    if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
    if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
    if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
    if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

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
│ mode                    ← Shows/sets bot mode (owner only)
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














// case 7: {
//   // Similar to case 6 - apply the same individual toggle logic
//   // ... (same pattern as case 6)
  
//   // 🖼️ Full info + image + commands (with individual toggles)
//   let finalCaption = "";
  
//   // Add this helper function at the start of case 7
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
  
//   // Load bot name from JSON file
//   let botName = "WOLFBOT"; // Default
//   try {
//     const settingsPath = path.join(__dirname, 'bot_settings.json');
//     if (fs.existsSync(settingsPath)) {
//       const settingsData = fs.readFileSync(settingsPath, 'utf8');
//       const settings = JSON.parse(settingsData);
//       if (settings.botName && settings.botName.trim() !== '') {
//         botName = settings.botName.trim();
//       }
//     }
//   } catch (error) {
//     console.error('Error loading bot name:', error);
//   }
  
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