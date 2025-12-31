import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export default {
    name: "tts",
    alias: ["say", "speak"],
    desc: "Convert text to speech",
    category: "audio",
    usage: ".tts [language] [text] | Example: .tts en Hello world | .tts id Halo dunia",
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            
            // Check if user provided text
            if (args.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `🎤 *TTS (Text-to-Speech)*\n\n*Usage:*\n\`\`\`.tts [language] [text]\`\`\`\n\n*Examples:*\n• \`.tts en Hello world\` (English)\n• \`.tts id Halo dunia\` (Indonesian)\n• \`.tts ja こんにちは\` (Japanese)\n• \`.tts es Hola mundo\` (Spanish)\n\n*Available Languages:*\nen, id, ja, es, fr, de, ru, pt, ar, hi, zh, ko`,
                }, { quoted: m });
            }
            
            // Parse language and text
            let language = 'en'; // default
            let text = '';
            
            // Check if first argument is a language code
            const langCodes = ['en', 'id', 'ja', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'zh', 'ko'];
            if (langCodes.includes(args[0].toLowerCase())) {
                language = args[0].toLowerCase();
                text = args.slice(1).join(' ');
            } else {
                text = args.join(' ');
            }
            
            if (!text.trim()) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Please provide text to convert to speech.\nExample: `.tts Hello how are you?`",
                }, { quoted: m });
            }
            
            // Limit text length
            if (text.length > 500) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Text too long! Maximum 500 characters.",
                }, { quoted: m });
            }
            
            // Send processing message
            // await sock.sendMessage(chatId, {
            //     text: `⏳ Converting to speech...\nLanguage: ${language.toUpperCase()}\nText: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            // }, { quoted: m });
            
            // Create temp directory
            const tempDir = path.join(process.cwd(), 'tmp', 'tts');
            await fs.mkdir(tempDir, { recursive: true });
            const fileName = `tts_${Date.now()}.mp3`;
            const filePath = path.join(tempDir, fileName);
            
            // Method 1: Google TTS API
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${language}&client=tw-ob`;
            
            try {
                const response = await axios({
                    method: 'GET',
                    url: ttsUrl,
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                // Save the audio file
                await fs.writeFile(filePath, response.data);
                
                // Read and send the audio
                const audioBuffer = await fs.readFile(filePath);
                
                await sock.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `tts_${language}.mp3`,
                    caption: `✅ *Text-to-Speech Complete*\n\n📝 *Text:* ${text}\n🌐 *Language:* ${language.toUpperCase()}\n🔊 *Voice:* Google TTS`
                }, { quoted: m });
                
                console.log(`✅ TTS generated for: "${text.substring(0, 30)}..."`);
                
            } catch (apiError) {
                console.error("Google TTS API error:", apiError);
                
                // Fallback to alternative method
                await sock.sendMessage(chatId, {
                    text: "⚠️ Google TTS failed, trying alternative method...",
                }, { quoted: m });
                
                // Try alternative TTS service
                await useAlternativeTTS(sock, m, text, language, filePath);
            }
            
            // Cleanup
            try {
                await fs.unlink(filePath);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
        } catch (error) {
            console.error("TTS command error:", error);
            if (m.key?.remoteJid) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `❌ *TTS Error:* ${error.message}\n\nPlease try again with shorter text.`
                }, { quoted: m });
            }
        }
    }
};

// Alternative TTS method
async function useAlternativeTTS(sock, m, text, language, filePath) {
    try {
        const chatId = m.key.remoteJid;
        
        // Using voicerss.org API (requires API key - free tier available)
        // Sign up at https://www.voicerss.org/api/ for free API key
        const apiKey = 'YOUR_VOICERSS_API_KEY'; // Replace with your API key
        
        if (apiKey === 'YOUR_VOICERSS_API_KEY') {
            // If no API key, use simple simulation
            await sock.sendMessage(chatId, {
                text: `🔊 *TTS Simulation*\n\nFor real TTS, please:\n1. Get API key from voicerss.org\n2. Replace in code: apiKey = 'YOUR_KEY'\n\n*Your text would sound like:*\n"${text}"`,
            }, { quoted: m });
            return;
        }
        
        // If you have API key
        const response = await axios.get(`http://api.voicerss.org/?key=${apiKey}&hl=${language}&src=${encodeURIComponent(text)}&c=MP3`);
        
        if (response.data) {
            await fs.writeFile(filePath, response.data);
            const audioBuffer = await fs.readFile(filePath);
            
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `✅ TTS Complete (VoiceRSS)`
            }, { quoted: m });
        }
        
    } catch (error) {
        console.error("Alternative TTS failed:", error);
        throw error;
    }
}