// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Helper function to extract number from JID
// function extractNumberFromJid(jid) {
//   if (!jid || typeof jid !== 'string') return null;
  
//   // Remove any device suffix (:0, :1, etc.)
//   jid = jid.split(':')[0];
  
//   // Check for standard WhatsApp JID formats
//   if (jid.includes('@s.whatsapp.net')) {
//     const number = jid.split('@')[0];
//     // Validate it's a number
//     if (/^\d+$/.test(number) && number.length >= 8 && number.length <= 16) {
//       return number;
//     }
//   }
  
//   // Check for group JID (might contain creator's number)
//   if (jid.includes('@g.us')) {
//     const groupId = jid.split('@')[0];
//     // Some group IDs contain creator's number: number-timestamp
//     if (groupId.includes('-')) {
//       const possibleNumber = groupId.split('-')[0];
//       if (/^\d+$/.test(possibleNumber)) {
//         return possibleNumber;
//       }
//     }
//   }
  
//   return null;
// }

// // Helper to format phone number with country code
// function formatPhoneNumber(number) {
//   if (!number) return null;
  
//   // Remove any non-digits
//   const cleanNumber = number.replace(/\D/g, '');
  
//   if (cleanNumber.length < 8) return null;
  
//   // Try to identify country
//   let formatted = cleanNumber;
//   let countryFlag = "🌍";
//   let countryName = "International";
  
//   // Country code detection
//   const countryCodes = {
//     '1': { name: "US/Canada", flag: "🇺🇸" },
//     '44': { name: "UK", flag: "🇬🇧" },
//     '91': { name: "India", flag: "🇮🇳" },
//     '254': { name: "Kenya", flag: "🇰🇪" },
//     '255': { name: "Tanzania", flag: "🇹🇿" },
//     '256': { name: "Uganda", flag: "🇺🇬" },
//     '234': { name: "Nigeria", flag: "🇳🇬" },
//     '27': { name: "South Africa", flag: "🇿🇦" },
//     '20': { name: "Egypt", flag: "🇪🇬" },
//     '212': { name: "Morocco", flag: "🇲🇦" },
//     '33': { name: "France", flag: "🇫🇷" },
//     '49': { name: "Germany", flag: "🇩🇪" },
//     '34': { name: "Spain", flag: "🇪🇸" },
//     '39': { name: "Italy", flag: "🇮🇹" },
//     '7': { name: "Russia", flag: "🇷🇺" },
//     '86': { name: "China", flag: "🇨🇳" },
//     '81': { name: "Japan", flag: "🇯🇵" },
//     '82': { name: "South Korea", flag: "🇰🇷" },
//     '62': { name: "Indonesia", flag: "🇮🇩" },
//     '63': { name: "Philippines", flag: "🇵🇭" },
//     '92': { name: "Pakistan", flag: "🇵🇰" },
//     '880': { name: "Bangladesh", flag: "🇧🇩" },
//     '94': { name: "Sri Lanka", flag: "🇱🇰" },
//   };
  
//   for (const [code, info] of Object.entries(countryCodes)) {
//     if (cleanNumber.startsWith(code)) {
//       countryFlag = info.flag;
//       countryName = info.name;
//       break;
//     }
//   }
  
//   // Format with + if it's a valid international number
//   if (cleanNumber.length >= 10) {
//     formatted = `+${cleanNumber}`;
//   }
  
//   return {
//     raw: cleanNumber,
//     formatted: formatted,
//     flag: countryFlag,
//     country: countryName,
//     length: cleanNumber.length,
//     isValid: cleanNumber.length >= 8 && cleanNumber.length <= 16
//   };
// }

// export default {
//   name: "getnumber",
//   description: "Extract WhatsApp number from user by replying or mentioning",
//   category: "utility",
//   aliases: ["extractnumber", "number", "phone", "jidtonumber"],
//   usage: "[@mention or reply to message]",
  
//   async execute(sock, m, args, PREFIX, extra) {
//     const jid = m.key.remoteJid;
//     const isGroup = jid.endsWith('@g.us');
//     const senderJid = m.key.participant || jid;
    
//     // ====== HELP SECTION ======
//     if (args[0]?.toLowerCase() === "help") {
//       const helpText = `📱 *EXTRACT PHONE NUMBER*\n\n` +
//         `💡 *Usage:*\n` +
//         `• \`${PREFIX}getnumber\` (reply to a message)\n` +
//         `• \`${PREFIX}getnumber @mention\`\n` +
//         `• \`${PREFIX}getnumber 254712345678\` (from raw JID)\n` +
//         `• \`${PREFIX}getnumber me\` (get your own number)\n\n` +
        
//         `🔍 *What It Does:*\n` +
//         `• Extracts WhatsApp number from JID\n` +
//         `• Shows country and flag\n` +
//         `• Formats with international code\n` +
//         `• Works in groups and private chats\n\n` +
        
//         `🎯 *Examples:*\n` +
//         `1. Reply to someone's message with:\n\`${PREFIX}getnumber\`\n` +
//         `2. Mention someone:\n\`${PREFIX}getnumber @user\`\n` +
//         `3. Get your own:\n\`${PREFIX}getnumber me\`\n\n` +
        
//         `⚡ *Aliases:* ${PREFIX}number, ${PREFIX}phone, ${PREFIX}extractnumber\n\n` +
        
//         `⚠️ *Note:* Works only on users who have sent messages in the chat.`;
      
//       return sock.sendMessage(jid, { text: helpText }, { quoted: m });
//     }

//     // ====== PROCESS REQUEST ======
//     try {
//       let targetJid = null;
//       let targetName = "Unknown";
//       let methodUsed = "";
      
//       // Check if user wants their own number
//       if (args[0]?.toLowerCase() === "me" || args[0] === "self") {
//         targetJid = senderJid;
//         targetName = "You";
//         methodUsed = "self";
        
//         const senderNumber = extractNumberFromJid(senderJid);
//         if (!senderNumber) {
//           return sock.sendMessage(jid, { 
//             text: `❌ *Could not extract your number!*\n\nYour JID: ${senderJid}\n\nThis is unusual. Contact bot developer.`
//           }, { quoted: m });
//         }
//       }
      
//       // Check if replying to a message
//       else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
//         targetJid = m.message.extendedTextMessage.contextInfo.participant;
//         const quotedMsg = m.message.extendedTextMessage.contextInfo;
//         targetName = quotedMsg?.pushName || "Quoted User";
//         methodUsed = "reply";
        
//         console.log(`📱 Extracting number from reply to: ${targetJid}`);
//       }
      
//       // Check for mentions
//       else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
//         targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
//         targetName = "Mentioned User";
//         methodUsed = "mention";
        
//         console.log(`📱 Extracting number from mention: ${targetJid}`);
//       }
      
//       // Check if raw JID/number provided as argument
//       else if (args.length > 0) {
//         const input = args[0];
        
//         // Check if it's already a JID
//         if (input.includes('@s.whatsapp.net')) {
//           targetJid = input;
//           methodUsed = "raw_jid";
//         } 
//         // Check if it's a raw number
//         else if (/^\d+$/.test(input.replace(/[+\-\s()]/g, ''))) {
//           const cleanNum = input.replace(/\D/g, '');
//           targetJid = cleanNum + '@s.whatsapp.net';
//           methodUsed = "raw_number";
//         }
//         // Check for @ mention in text
//         else if (input.startsWith('@')) {
//           // Try to find user in group participants
//           if (isGroup) {
//             try {
//               const groupMetadata = await sock.groupMetadata(jid);
//               const mentionedNumber = input.substring(1);
              
//               // Find participant by number
//               const participant = groupMetadata.participants.find(p => {
//                 const num = extractNumberFromJid(p.id);
//                 return num && num.includes(mentionedNumber);
//               });
              
//               if (participant) {
//                 targetJid = participant.id;
//                 targetName = participant.name || participant.notify || "Group Member";
//                 methodUsed = "group_mention";
//               }
//             } catch (error) {
//               console.log("Error fetching group metadata:", error);
//             }
//           }
//         }
//       }
      
//       // If still no target, check if we're in a group and should process all participants
//       else if (args[0]?.toLowerCase() === "all" && isGroup) {
//         try {
//           const groupMetadata = await sock.groupMetadata(jid);
//           let resultText = `📱 *GROUP MEMBERS' NUMBERS*\n\n`;
//           resultText += `👥 Group: ${groupMetadata.subject}\n`;
//           resultText += `📊 Total Members: ${groupMetadata.participants.length}\n\n`;
          
//           let extractedCount = 0;
          
//           for (const participant of groupMetadata.participants) {
//             const numberInfo = formatPhoneNumber(extractNumberFromJid(participant.id));
//             if (numberInfo && numberInfo.isValid) {
//               extractedCount++;
//               const name = participant.name || participant.notify || `User ${extractedCount}`;
//               const role = participant.admin ? ' 👑' : participant.superAdmin ? ' 👑👑' : '';
              
//               resultText += `${extractedCount}. ${name}${role}\n`;
//               resultText += `   📞 ${numberInfo.formatted} ${numberInfo.flag}\n`;
//               resultText += `   🌍 ${numberInfo.country}\n\n`;
              
//               // Limit output to avoid too long message
//               if (extractedCount >= 15) {
//                 resultText += `... and ${groupMetadata.participants.length - extractedCount} more members\n`;
//                 break;
//               }
//             }
//           }
          
//           resultText += `\n✅ Extracted ${extractedCount}/${groupMetadata.participants.length} numbers`;
          
//           if (extractedCount === 0) {
//             resultText = `❌ *No numbers could be extracted!*\n\nCould not extract any valid numbers from group participants.`;
//           }
          
//           return sock.sendMessage(jid, { text: resultText }, { quoted: m });
          
//         } catch (error) {
//           console.error("Error processing group members:", error);
//           return sock.sendMessage(jid, { 
//             text: `❌ *Failed to fetch group members!*\n\nError: ${error.message}`
//           }, { quoted: m });
//         }
//       }
      
//       // If no target found, show help
//       if (!targetJid) {
//         return sock.sendMessage(jid, { 
//           text: `❌ *No target specified!*\n\n💡 *How to use:*\n1. Reply to a message with \`${PREFIX}getnumber\`\n2. Mention someone: \`${PREFIX}getnumber @user\`\n3. Get your own: \`${PREFIX}getnumber me\`\n\nUse \`${PREFIX}getnumber help\` for more info.`
//         }, { quoted: m });
//       }
      
//       // ====== EXTRACT AND FORMAT NUMBER ======
//       const rawNumber = extractNumberFromJid(targetJid);
      
//       if (!rawNumber) {
//         let errorMsg = `❌ *Could not extract number!*\n\n`;
//         errorMsg += `🔍 *Target:* ${targetName}\n`;
//         errorMsg += `🔗 *JID:* ${targetJid}\n`;
//         errorMsg += `🎯 *Method:* ${methodUsed}\n\n`;
        
//         if (targetJid.includes('@g.us')) {
//           errorMsg += `⚠️ This appears to be a group JID, not a user.\n`;
//           errorMsg += `Group JIDs don't contain full phone numbers.\n`;
//         } else if (targetJid.includes('status@broadcast')) {
//           errorMsg += `⚠️ This is the status broadcast JID.\n`;
//         } else if (targetJid.includes('@broadcast')) {
//           errorMsg += `⚠️ This is a broadcast list JID.\n`;
//         } else {
//           errorMsg += `⚠️ JID format not recognized.\n`;
//           errorMsg += `Expected format: 254712345678@s.whatsapp.net\n`;
//         }
        
//         errorMsg += `\n💡 *Try:*\n• Reply to a user's actual message\n• Mention someone who has sent messages\n• Use \`${PREFIX}getnumber me\` for your own number`;
        
//         return sock.sendMessage(jid, { text: errorMsg }, { quoted: m });
//       }
      
//       // Format the number
//       const formattedNumber = formatPhoneNumber(rawNumber);
      
//       if (!formattedNumber || !formattedNumber.isValid) {
//         return sock.sendMessage(jid, { 
//           text: `❌ *Invalid number extracted!*\n\nExtracted: ${rawNumber}\n\nNumber appears to be invalid or malformed.`
//         }, { quoted: m });
//       }
      
//       // ====== CREATE RESULT MESSAGE ======
//       let resultText = `📱 *PHONE NUMBER EXTRACTED*\n\n`;
      
//       // Add user info
//       resultText += `👤 *User:* ${targetName}\n`;
      
//       if (methodUsed) {
//         resultText += `🎯 *Method:* ${methodUsed.replace(/_/g, ' ').toUpperCase()}\n`;
//       }
      
//       resultText += `\n📞 *Phone Number:*\n`;
//       resultText += `┌─ Raw: ${formattedNumber.raw}\n`;
//       resultText += `├─ Formatted: ${formattedNumber.formatted}\n`;
//       resultText += `├─ Length: ${formattedNumber.length} digits\n`;
//       resultText += `├─ Country: ${formattedNumber.country}\n`;
//       resultText += `└─ Flag: ${formattedNumber.flag}\n\n`;
      
//       // Add WhatsApp actions
//       resultText += `⚡ *WhatsApp Actions:*\n`;
//       resultText += `• Chat: wa.me/${formattedNumber.raw}\n`;
//       resultText += `• Call: tel:${formattedNumber.formatted}\n`;
      
//       // Add context info if in group
//       if (isGroup) {
//         try {
//           const groupMetadata = await sock.groupMetadata(jid);
//           const participant = groupMetadata.participants.find(p => p.id === targetJid);
          
//           if (participant) {
//             resultText += `\n👥 *Group Info:*\n`;
//             resultText += `• Group: ${groupMetadata.subject}\n`;
//             resultText += `• Role: ${participant.admin ? 'Admin 👑' : participant.superAdmin ? 'Super Admin 👑👑' : 'Member'}\n`;
//           }
//         } catch (error) {
//           console.log("Could not fetch group metadata:", error);
//         }
//       }
      
//       // Add JID info
//       resultText += `\n🔗 *Technical Info:*\n`;
//       resultText += `• JID: ${targetJid}\n`;
//       resultText += `• Extracted: ${rawNumber}\n`;
      
//       // Add timestamp
//       resultText += `\n⏰ *Extracted at:* ${new Date().toLocaleTimeString()}`;
      
//       // Add usage tips
//       resultText += `\n\n💡 *Quick Actions:*\n`;
//       resultText += `• \`${PREFIX}save ${formattedNumber.raw}\` - Save as contact\n`;
//       resultText += `• \`${PREFIX}invite ${formattedNumber.raw}\` - Invite to group\n`;
      
//       // ====== SEND RESULT ======
//       await sock.sendMessage(jid, { text: resultText }, { quoted: m });
      
//       // ====== LOG THE EXTRACTION ======
//       try {
//         const logDir = path.join(__dirname, "../../logs");
//         if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        
//         const logFile = path.join(logDir, "number_extractions.json");
//         let extractions = [];
        
//         if (fs.existsSync(logFile)) {
//           extractions = JSON.parse(fs.readFileSync(logFile, 'utf8'));
//         }
        
//         extractions.push({
//           timestamp: new Date().toISOString(),
//           extractor: extractNumberFromJid(senderJid),
//           target: extractNumberFromJid(targetJid),
//           targetJid: targetJid,
//           method: methodUsed,
//           chatType: isGroup ? 'group' : 'private',
//           groupInfo: isGroup ? { jid: jid } : null
//         });
        
//         // Keep only last 1000 entries
//         if (extractions.length > 1000) {
//           extractions = extractions.slice(-1000);
//         }
        
//         fs.writeFileSync(logFile, JSON.stringify(extractions, null, 2));
//         console.log(`📝 Logged number extraction: ${formattedNumber.raw}`);
        
//       } catch (logError) {
//         console.log("⚠️ Could not log extraction:", logError.message);
//       }
      
//     } catch (error) {
//       console.error("❌ [GETNUMBER] ERROR:", error);
      
//       let errorMsg = `❌ *Extraction Failed!*\n\n`;
//       errorMsg += `Error: ${error.message || 'Unknown error'}\n\n`;
//       errorMsg += `💡 *Troubleshooting:*\n`;
//       errorMsg += `1. Ensure you're replying to a valid message\n`;
//       errorMsg += `2. The user must have sent a message in this chat\n`;
//       errorMsg += `3. Try in a different chat\n`;
//       errorMsg += `4. Contact bot developer if issue persists`;
      
//       await sock.sendMessage(jid, { text: errorMsg }, { quoted: m });
//     }
//   },
// };























import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and save mappings
const MAPPINGS_FILE = path.join(__dirname, "../../data/jid_mappings.json");

function loadMappings() {
  try {
    if (fs.existsSync(MAPPINGS_FILE)) {
      return JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8'));
    }
  } catch (error) {
    console.log("⚠️ Error loading mappings:", error);
  }
  return {};
}

function saveMappings(mappings) {
  try {
    const dir = path.dirname(MAPPINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
    return true;
  } catch (error) {
    console.log("❌ Error saving mappings:", error);
    return false;
  }
}

// Main function to extract JID from any message context
function extractTargetJidFromMessage(m, senderJid) {
  const jid = m.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');
  
  console.log(`🔍 Extracting JID from message...`);
  console.log(`📱 Chat JID: ${jid}`);
  console.log(`👥 Is Group: ${isGroup}`);
  console.log(`👤 Sender: ${senderJid}`);
  
  // Method 1: Check if it's a reply to a message
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    // This is a reply in a group
    const participantJid = m.message.extendedTextMessage.contextInfo.participant;
    console.log(`✅ Found from reply (group): ${participantJid}`);
    return {
      jid: participantJid,
      source: 'reply_in_group',
      name: m.message.extendedTextMessage.contextInfo?.pushName || 'Group User'
    };
  }
  
  // Method 2: Check if it's a reply in private chat
  if (m.message?.extendedTextMessage?.contextInfo?.stanzaId) {
    // In private chat, the participant is the chat JID itself
    console.log(`✅ Found from reply (private): ${jid}`);
    return {
      jid: jid,
      source: 'reply_in_private',
      name: 'Private Chat User'
    };
  }
  
  // Method 3: Check for mentions
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    const mentionedJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    console.log(`✅ Found from mention: ${mentionedJid}`);
    return {
      jid: mentionedJid,
      source: 'mention',
      name: 'Mentioned User'
    };
  }
  
  // Method 4: Check if message is from a user (not a reply)
  if (m.key.participant && isGroup) {
    // This is a regular message in a group
    console.log(`✅ Found from group participant: ${m.key.participant}`);
    return {
      jid: m.key.participant,
      source: 'group_message',
      name: m.pushName || 'Group Member'
    };
  }
  
  // Method 5: For private messages (not replies)
  if (!isGroup && !m.message?.extendedTextMessage?.contextInfo) {
    // In private chat, the sender is the chat JID
    console.log(`✅ Found from private message: ${jid}`);
    return {
      jid: jid,
      source: 'private_message',
      name: 'Private Chat User'
    };
  }
  
  // Method 6: Self command
  console.log(`⚠️ Could not extract target, defaulting to sender: ${senderJid}`);
  return {
    jid: senderJid,
    source: 'self_fallback',
    name: 'You'
  };
}

// Get JID type
function getJidType(jid) {
  if (!jid || typeof jid !== 'string') return 'unknown';
  
  if (jid.endsWith('@s.whatsapp.net')) return 'standard';
  if (jid.endsWith('@lid')) return 'linked_device';
  if (jid.endsWith('@g.us')) return 'group';
  
  return 'unknown';
}

// Extract number from JID
function extractNumberFromJid(jid) {
  if (!jid || typeof jid !== 'string') return null;
  
  // Remove device suffix
  const cleanJid = jid.split(':')[0];
  
  if (cleanJid.endsWith('@s.whatsapp.net')) {
    const number = cleanJid.replace('@s.whatsapp.net', '');
    
    if (/^\d+$/.test(number) && number.length >= 8 && number.length <= 15) {
      return number;
    }
  }
  
  return null;
}

// Format phone number
function formatPhoneNumber(number) {
  if (!number) return null;
  
  const cleanNumber = number.replace(/\D/g, '');
  
  if (cleanNumber.length < 9 || cleanNumber.length > 15) {
    return null;
  }
  
  // Country detection
  const countryCodes = {
    '254': { name: "Kenya", flag: "🇰🇪" },
    '255': { name: "Tanzania", flag: "🇹🇿" },
    '256': { name: "Uganda", flag: "🇺🇬" },
    '1': { name: "US/Canada", flag: "🇺🇸" },
    '44': { name: "UK", flag: "🇬🇧" },
    '91': { name: "India", flag: "🇮🇳" },
    '92': { name: "Pakistan", flag: "🇵🇰" },
  };
  
  let countryFlag = "🌍";
  let countryName = "Unknown";
  let countryCode = "";
  
  for (const [code, info] of Object.entries(countryCodes)) {
    if (cleanNumber.startsWith(code)) {
      countryFlag = info.flag;
      countryName = info.name;
      countryCode = code;
      break;
    }
  }
  
  // Special handling for Kenya
  if (!countryCode && cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
    countryFlag = "🇰🇪";
    countryName = "Kenya";
    countryCode = "254";
  }
  
  return {
    raw: cleanNumber,
    formatted: `+${cleanNumber}`,
    flag: countryFlag,
    country: countryName,
    countryCode: countryCode,
    length: cleanNumber.length,
    isValid: true
  };
}

// Save to JSON
function saveNumberToJson(originalJid, realNumber, formattedInfo, extractorJid, userName = "Unknown") {
  try {
    const dir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const jsonFile = path.join(dir, "getnumbers.json");
    let data = {};
    
    if (fs.existsSync(jsonFile)) {
      try {
        data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      } catch (e) {
        data = {};
      }
    }
    
    const timestamp = Date.now();
    const key = `USER_${realNumber}_${timestamp}`;
    
    // Get clean JID
    const cleanJid = originalJid.includes('@') ? originalJid.split(':')[0] : `${realNumber}@s.whatsapp.net`;
    
    // Prepare in EXACT requested format
    const entry = {
      "OWNER_JID": originalJid,
      "OWNER_NUMBER": realNumber,
      "OWNER_CLEAN_JID": cleanJid,
      "OWNER_CLEAN_NUMBER": realNumber,
      "ownerLID": originalJid.endsWith('@lid') ? originalJid : null,
      "EXTRACTED_AT": new Date().toISOString(),
      "EXTRACTED_BY": extractNumberFromJid(extractorJid) || 'unknown',
      "EXTRACTOR_JID": extractorJid,
      "USER_NAME": userName,
      "JID_TYPE": getJidType(originalJid),
      "COUNTRY": formattedInfo.country,
      "FLAG": formattedInfo.flag,
      "FORMATTED": formattedInfo.formatted
    };
    
    data[key] = entry;
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Saved: ${realNumber} (${userName})`);
    return true;
    
  } catch (error) {
    console.error("❌ Save error:", error);
    return false;
  }
}

// Get user name from message
function getUserNameFromMessage(m, targetJid) {
  // Try to get from pushName in message
  if (m.pushName) {
    return m.pushName;
  }
  
  // Try to get from quoted message
  if (m.message?.extendedTextMessage?.contextInfo?.pushName) {
    return m.message.extendedTextMessage.contextInfo.pushName;
  }
  
  // Default
  return "User";
}

export default {
  name: "getnumber",
  description: "Extract WhatsApp number from any context",
  category: "utility",
  aliases: ["gn", "num", "phonenum"],
  usage: "[reply to message] or [@mention] or [manual <number>]",
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const senderJid = m.key.participant || jid;
    const isGroup = jid.endsWith('@g.us');
    
    console.log(`\n📱 ===== GETNUMBER COMMAND =====`);
    console.log(`💬 Chat: ${jid} (${isGroup ? 'Group' : 'Private'})`);
    console.log(`👤 Sender: ${senderJid}`);
    console.log(`📝 Args: ${JSON.stringify(args)}`);
    
    // ====== HELP ======
    if (args[0]?.toLowerCase() === "help") {
      const helpText = `🔢 *NUMBER EXTRACTOR - ALL CONTEXTS*\n\n` +
        `💡 *Usage in Groups:*\n` +
        `1. Reply to user's message: \`${PREFIX}getnumber\`\n` +
        `2. Mention user: \`${PREFIX}getnumber @user\`\n` +
        `3. Self: \`${PREFIX}getnumber me\`\n\n` +
        
        `💡 *Usage in Private Chat:*\n` +
        `1. Reply to their message: \`${PREFIX}getnumber\`\n` +
        `2. Just use command: \`${PREFIX}getnumber\`\n\n` +
        
        `💡 *Manual Entry:*\n` +
        `\`${PREFIX}getnumber manual 254703397679\`\n\n` +
        
        `🔧 *Works With:*\n` +
        `• Group messages (replies)\n` +
        `• Private messages\n` +
        `• Mentions\n` +
        `• Self messages`;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
    
    // ====== MANUAL ENTRY ======
    if (args[0]?.toLowerCase() === "manual" && args[1]) {
      const manualNumber = args[1].replace(/\D/g, '');
      
      if (!/^\d{9,15}$/.test(manualNumber)) {
        return sock.sendMessage(jid, { 
          text: `❌ Invalid! Must be 9-15 digits.\nExample: ${PREFIX}getnumber manual 254703397679`
        }, { quoted: m });
      }
      
      let targetJid = null;
      let userName = "Manual Entry";
      
      // Get target from context if available
      const extracted = extractTargetJidFromMessage(m, senderJid);
      if (extracted.jid !== senderJid) {
        targetJid = extracted.jid;
        userName = extracted.name;
      } else {
        targetJid = `${manualNumber}@s.whatsapp.net`;
      }
      
      const formatted = formatPhoneNumber(manualNumber);
      
      if (!formatted) {
        return sock.sendMessage(jid, { 
          text: `❌ Invalid format for ${manualNumber}`
        }, { quoted: m });
      }
      
      // Save mapping if it's @lid
      if (targetJid.endsWith('@lid')) {
        const mappings = loadMappings();
        mappings[targetJid] = {
          realJid: `${manualNumber}@s.whatsapp.net`,
          manualEntry: true,
          mappedAt: new Date().toISOString()
        };
        saveMappings(mappings);
      }
      
      // Save to main JSON
      saveNumberToJson(targetJid, manualNumber, formatted, senderJid, userName);
      
      const resultText = `✅ *MANUAL ENTRY SAVED*\n\n` +
        `👤 *User:* ${userName}\n` +
        `📞 *Number:* ${formatted.formatted}\n` +
        `🌍 *Country:* ${formatted.country} ${formatted.flag}\n` +
        `🔗 *Linked JID:* ${targetJid}\n\n` +
        `💾 *Saved in correct JSON format!*`;
      
      return sock.sendMessage(jid, { text: resultText }, { quoted: m });
    }
    
    // ====== DEBUG INFO ======
    if (args[0]?.toLowerCase() === "debug") {
      let debugText = `🔍 *DEBUG INFORMATION*\n\n`;
      
      debugText += `💬 *Chat Info:*\n`;
      debugText += `├─ JID: ${jid}\n`;
      debugText += `├─ Type: ${isGroup ? 'Group 👥' : 'Private 👤'}\n`;
      debugText += `└─ Sender: ${senderJid}\n\n`;
      
      debugText += `📱 *Message Structure:*\n`;
      
      // Check message types
      if (m.message?.extendedTextMessage?.contextInfo) {
        const ctx = m.message.extendedTextMessage.contextInfo;
        debugText += `├─ Is Reply: ✅ Yes\n`;
        if (ctx.participant) debugText += `├─ Participant: ${ctx.participant}\n`;
        if (ctx.mentionedJid) debugText += `├─ Mentions: ${ctx.mentionedJid.length}\n`;
        if (ctx.pushName) debugText += `├─ Push Name: ${ctx.pushName}\n`;
      } else {
        debugText += `├─ Is Reply: ❌ No\n`;
      }
      
      if (m.key.participant) {
        debugText += `├─ Key Participant: ${m.key.participant}\n`;
      }
      
      if (m.pushName) {
        debugText += `├─ Push Name: ${m.pushName}\n`;
      }
      
      debugText += `\n🔧 *How to use:*\n`;
      debugText += `1. In group: Reply to user's message\n`;
      debugText += `2. In private: Just use command\n`;
      debugText += `3. Or mention: @username\n`;
      
      return sock.sendMessage(jid, { text: debugText }, { quoted: m });
    }

    // ====== MAIN EXTRACTION ======
    try {
      let targetInfo = null;
      let userName = "User";
      
      // Check for "me" command
      if (args[0]?.toLowerCase() === "me") {
        targetInfo = {
          jid: senderJid,
          source: 'self_command',
          name: 'You'
        };
      } else {
        // Extract target from message context
        targetInfo = extractTargetJidFromMessage(m, senderJid);
      }
      
      const targetJid = targetInfo.jid;
      const extractionSource = targetInfo.source;
      userName = targetInfo.name;
      
      console.log(`🎯 Target JID: ${targetJid}`);
      console.log(`🔍 Source: ${extractionSource}`);
      console.log(`👤 Name: ${userName}`);
      
      // Validate we got a target
      if (!targetJid) {
        const errorText = `❌ *NO TARGET FOUND!*\n\n` +
          `💡 *How to use in ${isGroup ? 'group' : 'private chat'}:*\n\n` +
          
          `*In Group:*\n` +
          `1. Reply to user's message\n` +
          `2. Mention user: @username\n` +
          `3. Self: \`${PREFIX}getnumber me\`\n\n` +
          
          `*In Private Chat:*\n` +
          `1. Just use command: \`${PREFIX}getnumber\`\n` +
          `2. Or: \`${PREFIX}getnumber me\`\n\n` +
          
          `*Debug:* \`${PREFIX}getnumber debug\`\n` +
          `*Manual:* \`${PREFIX}getnumber manual 254703397679\``;
        
        return sock.sendMessage(jid, { text: errorText }, { quoted: m });
      }
      
      // Check if target is valid
      const jidType = getJidType(targetJid);
      
      if (jidType === 'group') {
        return sock.sendMessage(jid, { 
          text: `❌ *Cannot extract from group JID!*\n\n${targetJid} is a group, not a user.`
        }, { quoted: m });
      }
      
      // Extract number
      let realNumber = extractNumberFromJid(targetJid);
      
      if (!realNumber) {
        // Try to handle @lid JIDs
        if (jidType === 'linked_device') {
          const mappings = loadMappings();
          
          if (mappings[targetJid] && mappings[targetJid].realJid) {
            realNumber = extractNumberFromJid(mappings[targetJid].realJid);
          }
        }
      }
      
      // If still no number
      if (!realNumber) {
        let errorText = `❌ *CANNOT EXTRACT NUMBER!*\n\n`;
        errorText += `🔍 *Target:* ${targetJid}\n`;
        errorText += `📋 *Type:* ${jidType.toUpperCase()}\n`;
        errorText += `🎯 *Source:* ${extractionSource.replace(/_/g, ' ')}\n\n`;
        
        if (jidType === 'linked_device') {
          errorText += `⚠️ *@lid JID Issue:*\n`;
          errorText += `Linked device JIDs don't contain phone numbers.\n\n`;
          errorText += `💡 *Solution:*\n`;
          errorText += `\`${PREFIX}getnumber manual 254703397679\`\n`;
          errorText += `(Reply to user's message first)`;
        } else {
          errorText += `💡 *Try:*\n`;
          errorText += `1. Make sure you're replying to a message\n`;
          errorText += `2. Try in a different context\n`;
          errorText += `3. Use manual entry`;
        }
        
        return sock.sendMessage(jid, { text: errorText }, { quoted: m });
      }
      
      // Format number
      const formatted = formatPhoneNumber(realNumber);
      
      if (!formatted) {
        return sock.sendMessage(jid, { 
          text: `❌ Invalid number format: ${realNumber}`
        }, { quoted: m });
      }
      
      // Save to JSON
      saveNumberToJson(targetJid, realNumber, formatted, senderJid, userName);
      
      // ====== CREATE RESULT ======
      let resultText = `✅ *NUMBER EXTRACTED SUCCESSFULLY!*\n\n`;
      
      resultText += `👤 *User:* ${userName}\n`;
      resultText += `💬 *Context:* ${isGroup ? 'Group 👥' : 'Private 👤'}\n`;
      resultText += `🎯 *Method:* ${extractionSource.replace(/_/g, ' ').toUpperCase()}\n`;
      resultText += `📋 *JID Type:* ${jidType.toUpperCase()}\n\n`;
      
      resultText += `📞 *Phone Number:*\n`;
      resultText += `├─ Number: ${formatted.raw}\n`;
      resultText += `├─ Formatted: ${formatted.formatted}\n`;
      resultText += `├─ Country: ${formatted.country} ${formatted.flag}\n`;
      resultText += `└─ Length: ${formatted.length} digits\n\n`;
      
      resultText += `🔗 *JID Information:*\n`;
      resultText += `├─ Original: ${targetJid}\n`;
      
      const cleanJid = targetJid.split(':')[0];
      if (cleanJid !== targetJid) {
        resultText += `├─ Clean: ${cleanJid}\n`;
      }
      
      resultText += `└─ Valid: ${formatted.isValid ? '✅ Yes' : '❌ No'}\n\n`;
      
      resultText += `💾 *JSON Format Saved:*\n\`\`\`json\n{\n  "OWNER_JID": "${targetJid}",\n  "OWNER_NUMBER": "${formatted.raw}",\n  "OWNER_CLEAN_JID": "${cleanJid}",\n  "OWNER_CLEAN_NUMBER": "${formatted.raw}",\n  "ownerLID": ${jidType === 'linked_device' ? `"${targetJid}"` : 'null'}\n}\n\`\`\`\n`;
      
      resultText += `⚡ *Quick Actions:*\n`;
      resultText += `• Chat: wa.me/${formatted.raw}\n`;
      resultText += `• Call: tel:${formatted.formatted}\n`;
      
      if (jidType === 'linked_device') {
        resultText += `• Save mapping: ${PREFIX}getnumber manual ${formatted.raw}`;
      }
      
      // ====== SEND RESULT ======
      await sock.sendMessage(jid, { text: resultText }, { quoted: m });
      
      console.log(`✅ Extraction successful for ${formatted.raw}`);
      
    } catch (error) {
      console.error("❌ [GETNUMBER] ERROR:", error);
      
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\n💡 Use ${PREFIX}getnumber debug for help.`
      }, { quoted: m });
    }
  },
};