// import dotenv from "dotenv";
// dotenv.config();

// const OWNER_NUMBER = (process.env.OWNER_NUMBER || "").replace(/[^0-9]/g, "");

// export default {
//   name: "getnumber",
//   alias: ["numbers", "extractnumbers", "getjid", "getmembers", "extract"],
//   description: "Extracts all members' real WhatsApp phone numbers from the group.",
//   category: "group",
  
//   async execute(sock, m, args) {
//     try {
//       const jid = m.key.remoteJid;
//       if (!jid || !jid.endsWith("@g.us")) {
//         await sock.sendMessage(jid || (m.key && m.key.remoteJid), { 
//           text: "📱 This command only works inside a group chat." 
//         }, { quoted: m });
//         return;
//       }

//       // ----- CHECK PERMISSIONS -----
//       const rawSender = m.key.participant || m.key.remoteJid || "";
//       const senderNumber = String(rawSender).split("@")[0];
//       const isOwner = senderNumber === OWNER_NUMBER;

//       // Fetch group metadata
//       const metadata = await sock.groupMetadata(jid);
//       const participants = Array.isArray(metadata?.participants) ? metadata.participants : [];

//       // Check if sender is admin or owner
//       const senderEntry = participants.find(p => {
//         const pid = (p?.id || p?.jid || p).toString();
//         return pid.split?.("@")?.[0] === senderNumber;
//       });

//       const senderIsAdmin = !!(senderEntry && (
//         senderEntry.admin === "admin" || 
//         senderEntry.admin === "superadmin" || 
//         senderEntry.isAdmin || 
//         senderEntry.isSuperAdmin
//       ));

//       if (!isOwner && !senderIsAdmin) {
//         await sock.sendMessage(jid, { 
//           text: "🔒 Only group admins or the bot owner can use this command." 
//         }, { quoted: m });
//         return;
//       }

//       // ----- EXTRACT REAL NUMBERS -----
//       await sock.sendMessage(jid, { 
//         text: "🔍 Extracting real phone numbers from group members..." 
//       }, { quoted: m });

//       // Process participants to get real phone numbers
//       const realNumbers = new Set(); // Use Set to avoid duplicates
//       const adminNumbers = new Set();
//       const superAdminNumbers = new Set();
//       const allMembers = [];
      
//       let failedExtractions = 0;

//       for (const participant of participants) {
//         try {
//           let participantJid = "";
//           let phoneNumber = "";
          
//           // Try different methods to extract real JID
//           if (typeof participant === "string") {
//             participantJid = participant;
//           } else if (participant.id) {
//             participantJid = participant.id;
//           } else if (participant.jid) {
//             participantJid = participant.jid;
//           } else if (participant.user) {
//             participantJid = participant.user;
//           }
          
//           if (!participantJid || !participantJid.includes("@")) {
//             failedExtractions++;
//             continue;
//           }

//           // Extract the number part from JID
//           phoneNumber = participantJid.split("@")[0];
          
//           // Clean the number - remove any non-numeric characters
//           phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
          
//           // Filter out LIDs (Lightweight IDs) - they're usually shorter or have specific patterns
//           // Real WhatsApp numbers are usually 9-15 digits and don't contain letters/special chars
//           if (!phoneNumber || phoneNumber.length < 9 || phoneNumber.length > 15) {
//             failedExtractions++;
//             continue;
//           }
          
//           // Check if it looks like a real phone number (not a LID)
//           if (/^\d{9,15}$/.test(phoneNumber)) {
//             // Check admin status
//             const isAdmin = !!(participant.admin === "admin" || participant.isAdmin);
//             const isSuperAdmin = !!(participant.admin === "superadmin" || participant.isSuperAdmin);
            
//             if (isSuperAdmin) {
//               superAdminNumbers.add(phoneNumber);
//             } else if (isAdmin) {
//               adminNumbers.add(phoneNumber);
//             }
            
//             realNumbers.add(phoneNumber);
            
//             allMembers.push({
//               number: phoneNumber,
//               jid: participantJid,
//               isAdmin: isAdmin,
//               isSuperAdmin: isSuperAdmin,
//               status: isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Member"
//             });
//           } else {
//             failedExtractions++;
//           }
          
//         } catch (error) {
//           console.error("Error processing participant:", error);
//           failedExtractions++;
//         }
//       }

//       // Convert Sets to Arrays
//       const uniqueNumbers = Array.from(realNumbers);
//       const superAdmins = Array.from(superAdminNumbers);
//       const admins = Array.from(adminNumbers);
//       const regularMembers = uniqueNumbers.filter(num => 
//         !superAdmins.includes(num) && !admins.includes(num)
//       );

//       // ----- FORMAT OUTPUT -----
//       const totalRealNumbers = uniqueNumbers.length;
      
//       if (totalRealNumbers === 0) {
//         await sock.sendMessage(jid, { 
//           text: `❌ No valid phone numbers found in this group.\nFailed extractions: ${failedExtractions}` 
//         }, { quoted: m });
//         return;
//       }

//       // Sort numbers
//       uniqueNumbers.sort((a, b) => a.localeCompare(b));
//       superAdmins.sort((a, b) => a.localeCompare(b));
//       admins.sort((a, b) => a.localeCompare(b));
//       regularMembers.sort((a, b) => a.localeCompare(b));

//       // Create different output formats based on group size
//       let output = `📱 *REAL PHONE NUMBERS EXTRACTED*\n`;
//       output += `• Group: ${metadata.subject || "Unknown"}\n`;
//       output += `• Total Real Numbers: ${totalRealNumbers}\n`;
//       output += `• Super Admins: ${superAdmins.length}\n`;
//       output += `• Admins: ${admins.length}\n`;
//       output += `• Regular Members: ${regularMembers.length}\n`;
//       if (failedExtractions > 0) {
//         output += `• Failed Extractions: ${failedExtractions}\n`;
//       }
//       output += `\n══════════════════════════\n\n`;

//       // Format 1: Simple list (for smaller groups)
//       if (totalRealNumbers <= 30) {
//         output += `*📋 EXTRACTED NUMBERS:*\n\n`;
        
//         // Add super admins first
//         if (superAdmins.length > 0) {
//           output += `👑 *Super Admins:*\n`;
//           superAdmins.forEach((num, index) => {
//             output += `${index + 1}. ${num}\n`;
//           });
//           output += `\n`;
//         }
        
//         // Add admins
//         if (admins.length > 0) {
//           output += `⚡ *Admins:*\n`;
//           admins.forEach((num, index) => {
//             output += `${index + 1}. ${num}\n`;
//           });
//           output += `\n`;
//         }
        
//         // Add regular members
//         if (regularMembers.length > 0) {
//           output += `👤 *Members:*\n`;
//           regularMembers.forEach((num, index) => {
//             output += `${index + 1}. ${num}\n`;
//           });
//         }
        
//         // Add WhatsApp links
//         output += `\n*📲 WhatsApp Links:*\n`;
//         output += `Use: https://wa.me/[number] (without +)\n`;
//         const exampleNum = regularMembers[0] || superAdmins[0] || admins[0] || '254123456789';
//         output += `Example: https://wa.me/${exampleNum}\n`;
        
//         await sock.sendMessage(jid, { text: output }, { quoted: m });
        
//       } else {
//         // For larger groups, send formatted text file
//         output += `📁 Group has ${totalRealNumbers} real numbers.\n`;
//         output += `Generating formatted file...`;
        
//         await sock.sendMessage(jid, { text: output }, { quoted: m });
        
//         // Create comprehensive text file
//         let fileContent = `REAL WHATSAPP NUMBERS EXTRACTED\n`;
//         fileContent += `================================\n\n`;
//         fileContent += `Group Name: ${metadata.subject || "Unknown"}\n`;
//         fileContent += `Extraction Date: ${new Date().toLocaleString()}\n`;
//         fileContent += `Total Real Numbers: ${totalRealNumbers}\n`;
//         fileContent += `Super Admins: ${superAdmins.length}\n`;
//         fileContent += `Admins: ${admins.length}\n`;
//         fileContent += `Regular Members: ${regularMembers.length}\n`;
//         fileContent += `Failed Extractions: ${failedExtractions}\n\n`;
        
//         fileContent += `SUPER ADMINS:\n`;
//         fileContent += `${'-'.repeat(50)}\n`;
//         superAdmins.forEach((num, index) => {
//           fileContent += `${String(index + 1).padStart(3)}. ${num} (https://wa.me/${num})\n`;
//         });
        
//         fileContent += `\nADMINS:\n`;
//         fileContent += `${'-'.repeat(50)}\n`;
//         admins.forEach((num, index) => {
//           fileContent += `${String(index + 1).padStart(3)}. ${num} (https://wa.me/${num})\n`;
//         });
        
//         fileContent += `\nMEMBERS:\n`;
//         fileContent += `${'-'.repeat(50)}\n`;
//         regularMembers.forEach((num, index) => {
//           fileContent += `${String(index + 1).padStart(3)}. ${num} (https://wa.me/${num})\n`;
//         });
        
//         fileContent += `\n\nALL NUMBERS (TXT FORMAT):\n`;
//         fileContent += `${'-'.repeat(50)}\n`;
//         uniqueNumbers.forEach((num) => {
//           fileContent += `${num}\n`;
//         });
        
//         fileContent += `\n\nALL NUMBERS WITH LINKS:\n`;
//         fileContent += `${'-'.repeat(50)}\n`;
//         uniqueNumbers.forEach((num, index) => {
//           const member = allMembers.find(m => m.number === num);
//           const status = member?.status || "Member";
//           fileContent += `${String(index + 1).padStart(4)}. ${num} - ${status} - https://wa.me/${num}\n`;
//         });
        
//         // Send as text file
//         const fileName = `Real_Numbers_${metadata.subject?.replace(/[^a-zA-Z0-9]/g, '_') || 'Group'}_${Date.now()}.txt`;
//         await sock.sendMessage(jid, {
//           document: Buffer.from(fileContent),
//           fileName: fileName,
//           mimetype: 'text/plain',
//           caption: `📱 Extracted ${totalRealNumbers} real WhatsApp numbers`
//         }, { quoted: m });
//       }

//       // ----- ALWAYS GENERATE CSV FILE -----
//       await sock.sendMessage(jid, { 
//         text: "📊 Generating CSV file with all numbers..." 
//       }, { quoted: m });
      
//       // Create CSV content with WhatsApp links
//       let csvContent = "No,Phone Number,Status,WhatsApp Link,International Format\n";
//       uniqueNumbers.forEach((num, index) => {
//         const member = allMembers.find(m => m.number === num);
//         const status = member?.status || "Member";
//         const whatsappLink = `https://wa.me/${num}`;
//         const intlFormat = `+${num}`;
//         csvContent += `${index + 1},${num},${status},${whatsappLink},${intlFormat}\n`;
//       });
      
//       await sock.sendMessage(jid, {
//         document: Buffer.from(csvContent),
//         fileName: `WhatsApp_Numbers_${Date.now()}.csv`,
//         mimetype: 'text/csv',
//         caption: `📊 ${totalRealNumbers} real WhatsApp numbers extracted`
//       }, { quoted: m });

//       // ----- BONUS: Send as VCF (vCard) file if requested -----
//       if (args.includes('vcf') || args.includes('vcard') || args.includes('contact')) {
//         await sock.sendMessage(jid, { 
//           text: "📇 Generating vCard file for contacts..." 
//         }, { quoted: m });
        
//         // Create vCard content
//         let vcfContent = "";
//         uniqueNumbers.forEach((num, index) => {
//           const member = allMembers.find(m => m.number === num);
//           const status = member?.status || "Member";
//           const groupName = metadata.subject ? metadata.subject.substring(0, 20) : 'Group';
//           vcfContent += `BEGIN:VCARD\n`;
//           vcfContent += `VERSION:3.0\n`;
//           vcfContent += `FN:${status} ${index + 1} (${groupName})\n`;
//           vcfContent += `TEL;TYPE=CELL:+${num}\n`;
//           vcfContent += `NOTE:Extracted from "${metadata.subject || 'WhatsApp Group'}" on ${new Date().toLocaleDateString()}\n`;
//           vcfContent += `END:VCARD\n\n`;
//         });
        
//         await sock.sendMessage(jid, {
//           document: Buffer.from(vcfContent),
//           fileName: `WhatsApp_Contacts_${Date.now()}.vcf`,
//           mimetype: 'text/vcard',
//           caption: `📇 ${totalRealNumbers} contacts in vCard format`
//         }, { quoted: m });
//       }

//       // Final summary
//       let summary = `✅ Extraction Complete!\n\n`;
//       summary += `📊 Statistics:\n`;
//       summary += `• Real Numbers Found: ${totalRealNumbers}\n`;
//       summary += `• Super Admins: ${superAdmins.length}\n`;
//       summary += `• Admins: ${admins.length}\n`;
//       summary += `• Regular Members: ${regularMembers.length}\n`;
//       summary += `• Failed: ${failedExtractions}\n\n`;
//       summary += `📁 Files Sent:\n`;
//       summary += `• CSV file with all numbers\n`;
//       summary += `• Text file with formatted list\n`;
//       if (args.includes('vcf') || args.includes('vcard') || args.includes('contact')) {
//         summary += `• vCard file for contacts\n`;
//       }
//       summary += `\n💡 Use: https://wa.me/[number] to chat (without +)`;
      
//       await sock.sendMessage(jid, { text: summary }, { quoted: m });

//     } catch (err) {
//       console.error("getnumber error:", err);
//       try {
//         await sock.sendMessage(m.key.remoteJid, { 
//           text: `❌ Error extracting numbers: ${err.message || "Unknown error"}\n\nTry using the .getjid command for JIDs instead.` 
//         }, { quoted: m });
//       } catch (e) {
//         console.error("Failed to send error message:", e);
//       }
//     }
//   }
// };