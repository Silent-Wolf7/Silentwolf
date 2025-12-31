// import { downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";
// import fs from "fs/promises";
// import path from "path";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

// export default {
//     name: "bassboost",
//     alias: ["bass", "boost", "bb"],
//     desc: "Apply bass boost to audio files using FFmpeg",
//     category: "audio",
//     usage: ".bassboost [level] [reply to audio]\nLevels: low, medium, high (default: high)",
    
//     async execute(sock, m, args) {
//         try {
//             const chatId = m.key.remoteJid;
            
//             console.log("🎵 Bassboost command called");
            
//             // Check if it's a reply
//             if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//                 return await sock.sendMessage(chatId, {
//                     text: `🎵 *Bass Boost Command*\n\n*Usage:*\n• Reply to an audio with \`.bassboost\`\n• \`.bassboost high\` - Max bass\n• \`.bassboost medium\` - Medium bass\n• \`.bassboost low\` - Light bass\n\n*Supported formats:* MP3, M4A, OGG, WAV, etc.`,
//                 }, { quoted: m });
//             }
            
//             const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
//             const msgType = getContentType(quoted);
            
//             console.log("Detected message type:", msgType);
            
//             // Check if it's audio
//             let media;
//             let isAudio = false;
            
//             if (msgType === 'audioMessage') {
//                 media = quoted.audioMessage;
//                 isAudio = true;
//             } else if (msgType === 'documentMessage' && quoted.documentMessage) {
//                 const mime = quoted.documentMessage.mimetype || '';
//                 const fileName = quoted.documentMessage.fileName || '';
//                 if (mime.includes('audio/') || 
//                     fileName.match(/\.(mp3|m4a|ogg|wav|flac|aac)$/i)) {
//                     media = quoted.documentMessage;
//                     isAudio = true;
//                 }
//             }
            
//             if (!isAudio || !media) {
//                 return await sock.sendMessage(chatId, {
//                     text: "❌ *Please reply to an audio file!*\n\nSupported: MP3, M4A, OGG, WAV, etc.",
//                 }, { quoted: m });
//             }
            
//             // Determine bass level
//             let bassLevel = "high";
//             if (args.length > 0) {
//                 const level = args[0].toLowerCase();
//                 if (['low', 'medium', 'high'].includes(level)) {
//                     bassLevel = level;
//                 }
//             }
            
//             // Bass settings
//             const bassSettings = {
//                 low: "bass=g=5",
//                 medium: "bass=g=10",
//                 high: "bass=g=15"
//             };
            
//             const bassFilter = bassSettings[bassLevel];
            
//             // Send processing message
//             await sock.sendMessage(chatId, {
//                 text: `⏳ *Processing Audio...*\n\n🎚️ *Bass Level:* ${bassLevel.toUpperCase()}\n🔧 *Filter:* ${bassFilter}\n\nPlease wait, this may take a moment...`,
//             }, { quoted: m });
            
//             // Create temp directory
//             const tempDir = path.join(process.cwd(), "tmp", "bassboost");
//             await fs.mkdir(tempDir, { recursive: true });
            
//             const timestamp = Date.now();
//             const randomId = Math.random().toString(36).substring(7);
            
//             const inputFile = path.join(tempDir, `input_${timestamp}_${randomId}.mp3`);
//             const outputFile = path.join(tempDir, `bass_${timestamp}_${randomId}.mp3`);
            
//             // Download audio
//             const downloadType = msgType === 'audioMessage' ? 'audio' : 'document';
//             const stream = await downloadContentFromMessage(media, downloadType);
            
//             const chunks = [];
//             for await (const chunk of stream) {
//                 chunks.push(chunk);
//             }
            
//             const audioData = Buffer.concat(chunks);
//             await fs.writeFile(inputFile, audioData);
            
//             console.log(`✅ Downloaded: ${audioData.length} bytes`);
            
//             // Apply bass boost with FFmpeg
//             try {
//                 // First, check if FFmpeg is available
//                 try {
//                     await execPromise('ffmpeg -version');
//                 } catch (ffmpegError) {
//                     throw new Error("FFmpeg is not installed! Please install FFmpeg first.");
//                 }
                
//                 // FFmpeg command for bass boost
//                 // Using equalizer filter for better compatibility
//                 const ffmpegCmd = `ffmpeg -i "${inputFile}" -af "equalizer=f=110:width_type=h:width=300:g=${bassLevel === 'low' ? 8 : bassLevel === 'medium' ? 12 : 15}" -acodec libmp3lame -b:a 192k "${outputFile}" -y`;
                
//                 console.log("Running FFmpeg command:", ffmpegCmd);
                
//                 await execPromise(ffmpegCmd);
                
//                 // Check if output file was created
//                 try {
//                     await fs.access(outputFile);
//                 } catch {
//                     throw new Error("FFmpeg failed to create output file");
//                 }
                
//                 const outputStats = await fs.stat(outputFile);
//                 if (outputStats.size === 0) {
//                     throw new Error("Output file is empty");
//                 }
                
//                 // Read and send the processed audio
//                 const outputBuffer = await fs.readFile(outputFile);
                
//                 await sock.sendMessage(chatId, {
//                     audio: outputBuffer,
//                     mimetype: 'audio/mpeg',
//                     fileName: `bass_boosted_${bassLevel}.mp3`,
//                     caption: `✅ *Bass Boost Applied!*\n\n🎚️ *Level:* ${bassLevel.toUpperCase()}\n📊 *Original:* ${formatSize(audioData.length)}\n🎛️ *Processed:* ${formatSize(outputBuffer.length)}\n\n🔊 Enhanced with FFmpeg`
//                 }, { quoted: m });
                
//                 console.log("✅ Bass boost completed successfully");
                
//             } catch (ffmpegError) {
//                 console.error("FFmpeg error:", ffmpegError);
                
//                 // Fallback option if FFmpeg fails
//                 await sock.sendMessage(chatId, {
//                     text: `⚠️ *FFmpeg Error:* ${ffmpegError.message}\n\nTrying alternative method...`,
//                 }, { quoted: m });
                
//                 // Try alternative processing or send original
//                 await sendFallbackAudio(sock, chatId, inputFile, bassLevel, m);
//             }
            
//             // Cleanup
//             try {
//                 await fs.unlink(inputFile).catch(() => {});
//                 await fs.unlink(outputFile).catch(() => {});
//             } catch (cleanupError) {
//                 console.error("Cleanup error:", cleanupError);
//             }
            
//         } catch (error) {
//             console.error("Bassboost command error:", error);
            
//             if (m.key?.remoteJid) {
//                 await sock.sendMessage(m.key.remoteJid, {
//                     text: `❌ *Bass Boost Failed*\n\nError: ${error.message}\n\n💡 *Tips:*\n1. Make sure FFmpeg is installed\n2. Try with shorter audio\n3. Check file format`,
//                 }, { quoted: m });
//             }
//         }
//     }
// };

// // Helper function to format file size
// function formatSize(bytes) {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// // Fallback function if FFmpeg fails
// async function sendFallbackAudio(sock, chatId, inputFile, bassLevel, m) {
//     try {
//         const buffer = await fs.readFile(inputFile);
        
//         await sock.sendMessage(chatId, {
//             audio: buffer,
//             mimetype: 'audio/mpeg',
//             caption: `⚠️ *Bass Boost (Simulation)*\n\nFFmpeg failed, sending original audio.\nRequested level: ${bassLevel.toUpperCase()}\n\n💡 *Install FFmpeg for real processing:*\n• Windows: Download from ffmpeg.org\n• Mac: \`brew install ffmpeg\`\n• Linux: \`sudo apt install ffmpeg\``
//         }, { quoted: m });
//     } catch (fallbackError) {
//         throw fallbackError;
//     }
// }