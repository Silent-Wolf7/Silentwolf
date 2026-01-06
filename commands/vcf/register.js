// // File: ./commands/vcf/registervcf.js
// import { readFileSync, writeFileSync, existsSync } from 'fs';

// // VCF Configuration files
// const VCF_CONFIG_FILE = './vcf_config.json';
// const VCF_REGISTRATIONS_FILE = './vcf_registrations.json';

// // Function to get country info from API
// async function getCountryInfo(countryCode) {
//     try {
//         // Remove the + sign if present
//         const code = countryCode.replace('+', '');
        
//         // Try free Country.is API
//         const response = await fetch(`https://country.is/${code}`);
        
//         if (!response.ok) {
//             throw new Error(`API responded with status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         return {
//             flag: getFlagEmoji(data.country),
//             name: data.country,
//             code: code
//         };
//     } catch (error) {
//         console.error('Country API error:', error.message);
        
//         // Fallback to basic country detection
//         return getCountryFallback(countryCode);
//     }
// }

// // Fallback function if API fails
// function getCountryFallback(countryCode) {
//     const code = countryCode.replace('+', '');
    
//     // Common country codes as fallback
//     const commonCountries = {
//         '1': { flag: '🇺🇸', name: 'USA/Canada' },
//         '44': { flag: '🇬🇧', name: 'UK' },
//         '91': { flag: '🇮🇳', name: 'India' },
//         '234': { flag: '🇳🇬', name: 'Nigeria' },
//         '254': { flag: '🇰🇪', name: 'Kenya' },
//         '255': { flag: '🇹🇿', name: 'Tanzania' },
//         '256': { flag: '🇺🇬', name: 'Uganda' },
//         '233': { flag: '🇬🇭', name: 'Ghana' },
//         '27': { flag: '🇿🇦', name: 'South Africa' },
//         '234': { flag: '🇳🇬', name: 'Nigeria' },
//         '63': { flag: '🇵🇭', name: 'Philippines' },
//         '62': { flag: '🇮🇩', name: 'Indonesia' },
//         '92': { flag: '🇵🇰', name: 'Pakistan' },
//         '86': { flag: '🇨🇳', name: 'China' },
//         '81': { flag: '🇯🇵', name: 'Japan' },
//         '82': { flag: '🇰🇷', name: 'South Korea' },
//         '33': { flag: '🇫🇷', name: 'France' },
//         '49': { flag: '🇩🇪', name: 'Germany' },
//         '39': { flag: '🇮🇹', name: 'Italy' },
//         '34': { flag: '🇪🇸', name: 'Spain' },
//         '55': { flag: '🇧🇷', name: 'Brazil' },
//         '52': { flag: '🇲🇽', name: 'Mexico' },
//         '7': { flag: '🇷🇺', name: 'Russia' },
//         '90': { flag: '🇹🇷', name: 'Turkey' },
//         '98': { flag: '🇮🇷', name: 'Iran' },
//         '20': { flag: '🇪🇬', name: 'Egypt' },
//         '212': { flag: '🇲🇦', name: 'Morocco' },
//         '213': { flag: '🇩🇿', name: 'Algeria' },
//         '216': { flag: '🇹🇳', name: 'Tunisia' },
//         '218': { flag: '🇱🇾', name: 'Libya' }
//     };
    
//     // Try to find the country
//     for (const [cCode, info] of Object.entries(commonCountries)) {
//         if (code.startsWith(cCode)) {
//             return { ...info, code: cCode };
//         }
//     }
    
//     // Default fallback
//     return {
//         flag: '🌐',
//         name: 'Unknown Country',
//         code: code
//     };
// }

// // Get flag emoji from country code
// function getFlagEmoji(countryName) {
//     if (!countryName) return '🌐';
    
//     // Convert country name to flag emoji using regional indicators
//     try {
//         // Simple mapping for common countries
//         const flagMap = {
//             'United States': '🇺🇸',
//             'United Kingdom': '🇬🇧',
//             'India': '🇮🇳',
//             'Nigeria': '🇳🇬',
//             'Kenya': '🇰🇪',
//             'Tanzania': '🇹🇿',
//             'Uganda': '🇺🇬',
//             'Ghana': '🇬🇭',
//             'South Africa': '🇿🇦',
//             'Philippines': '🇵🇭',
//             'Indonesia': '🇮🇩',
//             'Pakistan': '🇵🇰',
//             'China': '🇨🇳',
//             'Japan': '🇯🇵',
//             'South Korea': '🇰🇷',
//             'France': '🇫🇷',
//             'Germany': '🇩🇪',
//             'Italy': '🇮🇹',
//             'Spain': '🇪🇸',
//             'Brazil': '🇧🇷',
//             'Mexico': '🇲🇽',
//             'Russia': '🇷🇺',
//             'Turkey': '🇹🇷',
//             'Iran': '🇮🇷',
//             'Egypt': '🇪🇬',
//             'Morocco': '🇲🇦',
//             'Algeria': '🇩🇿',
//             'Tunisia': '🇹🇳',
//             'Libya': '🇱🇾',
//             'Canada': '🇨🇦',
//             'Australia': '🇦🇺',
//             'New Zealand': '🇳🇿',
//             'Saudi Arabia': '🇸🇦',
//             'United Arab Emirates': '🇦🇪',
//             'Qatar': '🇶🇦',
//             'Kuwait': '🇰🇼',
//             'Oman': '🇴🇲',
//             'Bahrain': '🇧🇭'
//         };
        
//         return flagMap[countryName] || '🌐';
//     } catch (error) {
//         return '🌐';
//     }
// }

// // Parse phone number to extract country code and local number
// function parsePhoneNumber(input) {
//     // Clean the input - remove all non-digits except +
//     let cleaned = input.trim();
    
//     // If it starts with +, keep it
//     const hasPlus = cleaned.startsWith('+');
//     const digits = cleaned.replace(/\D/g, '');
    
//     // Try to extract country code
//     let countryCode = '';
//     let localNumber = '';
    
//     // Check for common country codes (1-3 digits)
//     const possibleCountryCodes = [
//         '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', 
//         '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', 
//         '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', 
//         '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', 
//         '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', 
//         '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', 
//         '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', 
//         '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', 
//         '266', '267', '268', '269', '290', '291', '297', '298', '299'
//     ];
    
//     // Sort by length (longest first) to match properly
//     possibleCountryCodes.sort((a, b) => b.length - a.length);
    
//     for (const code of possibleCountryCodes) {
//         if (digits.startsWith(code)) {
//             countryCode = code;
//             localNumber = digits.substring(code.length);
//             break;
//         }
//     }
    
//     // If no country code found, assume default or ask user
//     if (!countryCode) {
//         // If number is 10 digits, assume US/Canada (1) or local format
//         if (digits.length === 10) {
//             countryCode = '1'; // US/Canada default
//             localNumber = digits;
//         } else if (digits.length === 9) {
//             // Could be many countries, we'll need to ask
//             return { valid: false, error: 'Please include country code (e.g., +254712345678)' };
//         } else {
//             return { valid: false, error: 'Invalid phone number format' };
//         }
//     }
    
//     // Format for display
//     const formatted = `+${countryCode} ${localNumber.replace(/(\d{3})(?=\d)/g, '$1 ')}`;
    
//     return {
//         valid: true,
//         countryCode: countryCode,
//         localNumber: localNumber,
//         fullNumber: digits,
//         formatted: formatted,
//         hasPlus: hasPlus
//     };
// }

// // Load VCF config
// function loadVCFConfig() {
//     try {
//         if (existsSync(VCF_CONFIG_FILE)) {
//             return JSON.parse(readFileSync(VCF_CONFIG_FILE, 'utf8'));
//         }
//     } catch (error) {
//         console.error('❌ Error loading VCF config:', error);
//     }
//     return null;
// }

// // Load registrations
// function loadRegistrations() {
//     try {
//         if (existsSync(VCF_REGISTRATIONS_FILE)) {
//             return JSON.parse(readFileSync(VCF_REGISTRATIONS_FILE, 'utf8'));
//         }
//     } catch (error) {
//         console.error('❌ Error loading registrations:', error);
//     }
//     return [];
// }

// // Save registrations
// function saveRegistrations(registrations) {
//     try {
//         writeFileSync(VCF_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
//         return true;
//     } catch (error) {
//         console.error('❌ Error saving registrations:', error);
//         return false;
//     }
// }

// // Check if user already registered
// function isAlreadyRegistered(registrations, phoneNumber, vcfTitle) {
//     return registrations.some(reg => 
//         reg.phoneNumber === phoneNumber && 
//         reg.eventTitle === vcfTitle
//     );
// }

// // Get user name from message
// async function getUserName(sock, jid) {
//     try {
//         const contact = await sock.onWhatsApp(jid);
//         if (contact?.[0]?.exists) {
//             return contact[0].name || contact[0].pushname || 'Unknown User';
//         }
//     } catch (error) {
//         console.log('⚠️ Could not fetch username:', error.message);
//     }
    
//     // Extract from JID as fallback
//     const parts = jid.split('@')[0].split(':');
//     return parts[0] || 'Unknown User';
// }

// export default {
//     name: 'registervcf',
//     alias: ['register', 'joinvcf', 'vcfregister'],
//     category: 'utility',
//     description: 'Register for active VCF event with your phone number',
//     ownerOnly: false,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
//         const senderJid = msg.key.participant || chatId;
        
//         // Check if there's an active VCF
//         const vcfConfig = loadVCFConfig();
        
//         if (!vcfConfig || !vcfConfig.active) {
//             return sock.sendMessage(chatId, {
//                 text: '❌ *No Active VCF*\nThere is no active VCF event to register for.'
//             }, { quoted: msg });
//         }
        
//         // Check if target reached (for target-based VCF)
//         if (vcfConfig.limitType === 'target' && vcfConfig.target) {
//             const registrations = loadRegistrations();
//             const currentCount = registrations.filter(r => r.eventTitle === vcfConfig.title).length;
            
//             if (currentCount >= vcfConfig.target) {
//                 return sock.sendMessage(chatId, {
//                     text: `❌ *Registration Full*\n\nVCF "${vcfConfig.title}" has reached its target of ${vcfConfig.target} participants.\n\nRegistration is now closed.`
//                 }, { quoted: msg });
//             }
//         }
        
//         // Check if time expired (for time-based VCF)
//         if (vcfConfig.limitType === 'time' && vcfConfig.endTime) {
//             if (Date.now() > vcfConfig.endTime.timestamp) {
//                 return sock.sendMessage(chatId, {
//                     text: `❌ *VCF Ended*\n\nVCF "${vcfConfig.title}" has ended.\nRegistration is now closed.`
//                 }, { quoted: msg });
//             }
//         }
        
//         // Get user's name
//         const userName = await getUserName(sock, senderJid);
        
//         // If no phone number provided, show help
//         if (args.length === 0) {
//             const helpMsg = `📱 *VCF REGISTRATION*\n\n` +
//                           `*Event:* ${vcfConfig.title}\n\n` +
//                           `To register, send your WhatsApp number:\n\n` +
//                           `*Format:* ${PREFIX}register <phone-number>\n\n` +
//                           `*Examples:*\n` +
//                           `${PREFIX}register +254712345678\n` +
//                           `${PREFIX}register 0712345678\n` +
//                           `${PREFIX}register 254712345678\n\n` +
//                           `*Note:* Include your country code for international numbers.\n` +
//                           `Your country flag will be detected automatically.`;
            
//             return sock.sendMessage(chatId, { text: helpMsg }, { quoted: msg });
//         }
        
//         // Parse phone number
//         const phoneInput = args.join('').trim();
//         const parsedPhone = parsePhoneNumber(phoneInput);
        
//         if (!parsedPhone.valid) {
//             return sock.sendMessage(chatId, {
//                 text: `❌ *Invalid Phone Number*\n\n${parsedPhone.error}\n\n` +
//                      `*Valid examples:*\n` +
//                      `• +254712345678 (Kenya)\n` +
//                      `• +919876543210 (India)\n` +
//                      `• +447123456789 (UK)\n` +
//                      `• +12345678901 (USA/Canada)`
//             }, { quoted: msg });
//         }
        
//         // Get country info using API
//         let countryInfo;
//         try {
//             countryInfo = await getCountryInfo(parsedPhone.countryCode);
//         } catch (error) {
//             console.error('Failed to get country info:', error);
//             countryInfo = getCountryFallback(parsedPhone.countryCode);
//         }
        
//         // Load existing registrations
//         const registrations = loadRegistrations();
        
//         // Check if already registered
//         if (isAlreadyRegistered(registrations, parsedPhone.fullNumber, vcfConfig.title)) {
//             return sock.sendMessage(chatId, {
//                 text: `✅ *Already Registered*\n\nYou are already registered for "${vcfConfig.title}" with number:\n${parsedPhone.formatted}\n\nNo need to register again.`
//             }, { quoted: msg });
//         }
        
//         // Create registration data
//         const registration = {
//             eventTitle: vcfConfig.title,
//             userName: userName,
//             userJid: senderJid,
//             phoneNumber: parsedPhone.fullNumber,
//             formattedNumber: parsedPhone.formatted,
//             countryCode: parsedPhone.countryCode,
//             countryFlag: countryInfo.flag,
//             countryName: countryInfo.name,
//             registrationTime: new Date().toISOString(),
//             chatType: chatId.includes('@g.us') ? 'group' : 'dm',
//             chatId: chatId
//         };
        
//         // Add any additional info if required by VCF
//         if (vcfConfig.settings.requirePhone) {
//             // Phone is already captured
//         }
        
//         // You can add email, location etc. here based on vcfConfig.settings
        
//         // Save registration
//         registrations.push(registration);
        
//         if (saveRegistrations(registrations)) {
//             // Update VCF participant count
//             vcfConfig.currentParticipants = (vcfConfig.currentParticipants || 0) + 1;
//             // For target-based VCF, check if limit reached
//             if (vcfConfig.limitType === 'target' && vcfConfig.target) {
//                 if (vcfConfig.currentParticipants >= vcfConfig.target) {
//                     vcfConfig.limitReached = true;
//                 }
//             }
//             // Save updated config
//             const { writeFileSync } = await import('fs');
//             writeFileSync(VCF_CONFIG_FILE, JSON.stringify(vcfConfig, null, 2));
            
//             // Create success message
//             let successMsg = `✅ *REGISTRATION SUCCESSFUL!*\n\n`;
//             successMsg += `📝 *Event:* ${vcfConfig.title}\n`;
//             successMsg += `👤 *Name:* ${userName}\n`;
//             successMsg += `${countryInfo.flag} *Country:* ${countryInfo.name}\n`;
//             successMsg += `📞 *Phone:* ${parsedPhone.formatted}\n`;
//             successMsg += `📅 *Registered:* ${new Date().toLocaleString()}\n`;
//             successMsg += `👥 *Total Participants:* ${vcfConfig.currentParticipants}`;
            
//             if (vcfConfig.limitType === 'target') {
//                 successMsg += `/${vcfConfig.target}`;
//             }
            
//             successMsg += `\n\n*Registration ID:* ${registration.phoneNumber.slice(-6)}`;
            
//             // Add progress info for target-based VCF
//             if (vcfConfig.limitType === 'target' && vcfConfig.target) {
//                 const percentage = Math.round((vcfConfig.currentParticipants / vcfConfig.target) * 100);
//                 const progressBar = createProgressBar(percentage, 20);
                
//                 successMsg += `\n\n📊 *Progress:* ${percentage}%\n`;
//                 successMsg += `${progressBar}\n`;
                
//                 if (vcfConfig.currentParticipants >= vcfConfig.target) {
//                     successMsg += `🎉 *TARGET REACHED!* Registration is now closed.`;
//                 } else {
//                     const remaining = vcfConfig.target - vcfConfig.currentParticipants;
//                     successMsg += `🎯 *Remaining spots:* ${remaining}`;
//                 }
//             }
            
//             // Send success message
//             await sock.sendMessage(chatId, { text: successMsg }, { quoted: msg });
            
//             // Notify owner about new registration
//             try {
//                 const ownerNotification = `📥 *NEW VCF REGISTRATION*\n\n` +
//                                        `*Event:* ${vcfConfig.title}\n` +
//                                        `👤 *Participant:* ${userName}\n` +
//                                        `${countryInfo.flag} *From:* ${countryInfo.name}\n` +
//                                        `📞 *Phone:* ${parsedPhone.formatted}\n` +
//                                        `💬 *Via:* ${registration.chatType.toUpperCase()}\n` +
//                                        `⏰ *Time:* ${new Date().toLocaleString()}\n` +
//                                        `👥 *Total:* ${vcfConfig.currentParticipants}` +
//                                        `${vcfConfig.limitType === 'target' ? `/${vcfConfig.target}` : ''}`;
                
//                 await sock.sendMessage(vcfConfig.owner, { text: ownerNotification });
//             } catch (notifyError) {
//                 console.log('⚠️ Could not notify owner:', notifyError.message);
//             }
            
//         } else {
//             return sock.sendMessage(chatId, {
//                 text: '❌ Registration failed. Please try again.'
//             }, { quoted: msg });
//         }
//     }
// };

// // Helper function for progress bar
// function createProgressBar(percentage, length) {
//     const filled = Math.round((percentage / 100) * length);
//     const empty = length - filled;
//     return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
// }
























import fs from 'fs';
import path from 'path';

export default {
  name: 'register',
  description: 'Register a user',
  category: 'utility',
  
  async execute(sock, m, args) {
    const send = async (text) => {
      return sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };
    
    // Path for JSON storage
    const jsonPath = path.join(process.cwd(), 'registered_users.json');
    
    // Initialize JSON file if it doesn't exist
    if (!fs.existsSync(jsonPath)) {
      fs.writeFileSync(jsonPath, JSON.stringify([], null, 2));
    }
    
    // Check if user provided phone number
    if (args.length < 1) {
      return await send(`❌ *Usage:*\n• \`/register 254703397679\`\n• \`/register 254703397679 John Doe\`\n• \`/register 254703397679 John Doe staff\``);
    }
    
    // Extract phone number (first argument)
    const phone = args[0].replace(/\D/g, '');
    
    // Validate phone number
    if (phone.length < 10) {
      return await send('❌ Please provide a valid phone number (at least 10 digits)');
    }
    
    // Extract name (second argument, optional)
    const name = args.slice(1).join(' ').trim() || 'Unknown';
    
    // Generate JID
    const jid = `${phone}@s.whatsapp.net`;
    
    // Create user object
    const userData = {
      phone: phone,
      jid: jid,
      name: name,
      registeredAt: new Date().toISOString(),
      registeredBy: m.key.participant || m.key.remoteJid,
      chatId: m.key.remoteJid
    };
    
    try {
      // Read existing data
      const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Check if phone already exists
      const phoneExists = existingData.some(user => user.phone === phone);
      if (phoneExists) {
        return await send(`❌ Phone number \`${phone}\` is already registered!`);
      }
      
      // Add new user
      existingData.push(userData);
      
      // Write back to file
      fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
      
      // Send success message
      await send(`✅ *Registration Successful!*
      
📋 *User Details:*
📞 *Phone:* \`${phone}\`
👤 *Name:* ${name}
🔗 *JID:* \`${jid}\`
🆔 *Chat ID:* \`${m.key.remoteJid}\`
📅 *Registered:* ${new Date().toLocaleString()}

💾 *Stored in:* \`registered_users.json\`
👥 *Total Registered:* ${existingData.length} users`);
      
      // Also send the data as JSON for verification
      await sock.sendMessage(m.key.remoteJid, {
        text: `📊 *JSON Data:*\n\`\`\`json\n${JSON.stringify(userData, null, 2)}\n\`\`\``
      }, { quoted: m });
      
    } catch (error) {
      console.error('Registration error:', error);
      await send(`❌ *Registration Failed!*\nError: ${error.message}`);
    }
  }
};