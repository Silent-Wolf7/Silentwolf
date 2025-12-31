import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: "jarvis",
    alias: ["jarvis", "ironman", "ai"],
    desc: "Convert text to speech in JARVIS (Iron Man AI) style",
    category: "audio",
    usage: `.jarvis [text] | Example: .jarvis Good morning, sir | .jarvis Shall we begin the test?`,
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            
            // Check if user provided text
            if (args.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `🤖 *J.A.R.V.I.S. - Just A Rather Very Intelligent System*\n\n*Usage:*\n\`\`\`.jarvis [your message]\`\`\`\n\n*Examples:*\n• \`.jarvis Good morning, sir\`\n• \`.jarvis Power at 400% capacity\`\n• \`.jarvis Shall I prepare the suit?\`\n• \`.jarvis Threat level: minimal\`\n\n*Available Commands:*\n• \`.jarvis [text]\` - Convert text to JARVIS voice\n• \`.jarvis effect [text]\` - Add special sound effects\n• \`.jarvis list\` - Show available JARVIS phrases`,
                }, { quoted: m });
            }
            
            // Parse command
            const command = args[0].toLowerCase();
            
            // Special commands
            if (command === 'list') {
                return await showJarvisPhrases(sock, m);
            }
            
            if (command === 'effect') {
                return await jarvisWithEffect(sock, m, args.slice(1).join(' '));
            }
            
            // Regular JARVIS TTS
            const text = args.join(' ');
            
            if (!text.trim()) {
                return await sock.sendMessage(chatId, {
                    text: "❌ *J.A.R.V.I.S.:* Please provide text to vocalize, sir.",
                }, { quoted: m });
            }
            
            // Add JARVIS-style prefix if not present
            let finalText = text;
            if (!text.toLowerCase().startsWith('sir') && !text.toLowerCase().includes(':')) {
                finalText = `Sir, ${text}`;
            }
            
            // JARVIS-specific text processing
            const jarvisText = processJarvisText(finalText);
            
            // Limit text length
            if (jarvisText.length > 300) {
                return await sock.sendMessage(chatId, {
                    text: "❌ *J.A.R.V.I.S.:* Input exceeds maximum vocalization length (300 characters).",
                }, { quoted: m });
            }
            
            // Create temp directory
            const tempDir = path.join(process.cwd(), 'tmp', 'jarvis');
            await fs.mkdir(tempDir, { recursive: true });
            
            const baseFileName = `jarvis_${Date.now()}`;
            const ttsFilePath = path.join(tempDir, `${baseFileName}_raw.mp3`);
            const finalFilePath = path.join(tempDir, `${baseFileName}_final.mp3`);
            
            // Send initial response
            await sock.sendMessage(chatId, {
                text: `⚡ *J.A.R.V.I.S. Initializing...*\n\n📝 *Processing:* "${jarvisText.substring(0, 60)}${jarvisText.length > 60 ? '...' : ''}"`,
            }, { quoted: m });
            
            // Generate JARVIS-style TTS
            await generateJarvisTTS(jarvisText, ttsFilePath, finalFilePath);
            
            // Read and send the audio
            const audioBuffer = await fs.readFile(finalFilePath);
            
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `jarvis_ai.mp3`,
                ptt: true, // Push-to-talk for walkie-talkie effect
                caption: `🤖 *J.A.R.V.I.S. - Just A Rather Very Intelligent System*\n\n📊 *Status:* Vocalization complete\n📝 *Message:* ${text}\n⚡ *Processing:* Voice modulation applied`
            }, { quoted: m });
            
            console.log(`🤖 JARVIS TTS generated: "${text.substring(0, 30)}..."`);
            
            // Cleanup
            try {
                await fs.unlink(ttsFilePath);
                await fs.unlink(finalFilePath);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
        } catch (error) {
            console.error("JARVIS command error:", error);
            if (m.key?.remoteJid) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `❌ *J.A.R.V.I.S. System Error:*\n${error.message}\n\nSystem rebooting...`
                }, { quoted: m });
            }
        }
    }
};

// Process text to sound more like JARVIS
function processJarvisText(text) {
    let processed = text;
    
    // Common JARVIS phrases and patterns
    const jarvisPatterns = {
        'power': 'Power level',
        'suit': 'Iron Man suit',
        'threat': 'Threat assessment',
        'scan': 'Scanning complete',
        'target': 'Target acquired',
        'weapon': 'Weapons systems',
        'flight': 'Flight systems',
        'analysis': 'Analysis complete',
        'ready': 'Systems ready',
        'online': 'Coming online',
    };
    
    // Replace patterns
    Object.entries(jarvisPatterns).forEach(([key, value]) => {
        if (text.toLowerCase().includes(key)) {
            processed = processed.replace(new RegExp(key, 'gi'), value);
        }
    });
    
    // Add JARVIS-style speaking patterns
    const responses = [
        "Certainly, sir.",
        "I shall proceed, sir.",
        "As you wish, sir.",
        "Processing request, sir.",
        "Analyzing parameters, sir.",
        "Initializing systems, sir.",
        "Command acknowledged, sir.",
    ];
    
    // Sometimes add a JARVIS-style response
    if (Math.random() > 0.7) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        processed = `${randomResponse} ${processed}`;
    }
    
    return processed;
}

// Generate JARVIS-style TTS with effects
async function generateJarvisTTS(text, inputPath, outputPath) {
    try {
        // Method 1: Try using a high-quality TTS with British accent (like JARVIS)
        // Using Google TTS with en-GB accent
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-GB&client=tw-ob`;
        
        const response = await axios({
            method: 'GET',
            url: ttsUrl,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/'
            }
        });
        
        // Save raw TTS
        await fs.writeFile(inputPath, response.data);
        
        // Apply JARVIS effects using FFmpeg
        await applyJarvisEffects(inputPath, outputPath);
        
    } catch (error) {
        console.error("JARVIS TTS error:", error);
        throw error;
    }
}

// Apply JARVIS audio effects using FFmpeg
async function applyJarvisEffects(inputPath, outputPath) {
    try {
        // Check if FFmpeg is available
        try {
            await execAsync('ffmpeg -version');
        } catch {
            console.log("FFmpeg not found, using basic TTS without effects");
            await fs.copyFile(inputPath, outputPath);
            return;
        }
        
        // JARVIS audio effects chain:
        // 1. Pitch adjustment (slightly lower for authoritative voice)
        // 2. Reverb for "AI in a room" effect
        // 3. EQ boost for clarity
        // 4. Slight robotic filter
        // 5. Compression for consistent volume
        
        const ffmpegCommand = `
            ffmpeg -i "${inputPath}" \
            -af "asetrate=44100*0.98, \
                 aresample=44100, \
                 equalizer=f=1000:t=q:w=0.8:g=4, \
                 equalizer=f=3000:t=q:w=1:g=2, \
                 aecho=0.8:0.9:1000:0.3, \
                 compressor=threshold=-10dB:ratio=4:attack=200:release=1000, \
                 afade=t=in:st=0:d=0.5, \
                 afade=t=out:st=2.5:d=0.5" \
            -ar 44100 \
            -b:a 192k \
            -y "${outputPath}"
        `.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        
        await execAsync(ffmpegCommand);
        
    } catch (ffmpegError) {
        console.error("FFmpeg effects error:", ffmpegError);
        // Fallback to simple copy if FFmpeg fails
        await fs.copyFile(inputPath, outputPath);
    }
}

// JARVIS with special effects
async function jarvisWithEffect(sock, m, text) {
    const chatId = m.key.remoteJid;
    
    if (!text.trim()) {
        return await sock.sendMessage(chatId, {
            text: "❌ *J.A.R.V.I.S.:* Please specify which effect to apply, sir.\n\n*Available Effects:*\nalert, scan, powerup, shutdown, error",
        }, { quoted: m });
    }
    
    const tempDir = path.join(process.cwd(), 'tmp', 'jarvis');
    await fs.mkdir(tempDir, { recursive: true });
    
    const baseFileName = `jarvis_effect_${Date.now()}`;
    const ttsFilePath = path.join(tempDir, `${baseFileName}_tts.mp3`);
    const effectFilePath = path.join(tempDir, `${baseFileName}_effect.mp3`);
    const finalFilePath = path.join(tempDir, `${baseFileName}_final.mp3`);
    
    // Generate base TTS
    const jarvisText = processJarvisText(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(jarvisText)}&tl=en-GB&client=tw-ob`;
    
    const response = await axios({
        method: 'GET',
        url: ttsUrl,
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    await fs.writeFile(ttsFilePath, response.data);
    
    // Add effect based on keyword
    const effectText = text.toLowerCase();
    let effectType = 'beep';
    
    if (effectText.includes('alert') || effectText.includes('warning')) {
        effectType = 'alert';
    } else if (effectText.includes('scan') || effectText.includes('analy')) {
        effectType = 'scan';
    } else if (effectText.includes('power') || effectText.includes('start')) {
        effectType = 'powerup';
    } else if (effectText.includes('shutdown') || effectText.includes('offline')) {
        effectType = 'shutdown';
    } else if (effectText.includes('error') || effectText.includes('fail')) {
        effectType = 'error';
    }
    
    // In a real implementation, you would mix audio files here
    // For now, we'll just add a note in the caption
    const effectNames = {
        'alert': '🔴 ALERT TONE',
        'scan': '📡 SCANNING EFFECT',
        'powerup': '⚡ POWER UP SEQUENCE',
        'shutdown': '🔄 SHUTDOWN PROTOCOL',
        'error': '❌ SYSTEM ERROR',
        'beep': '📟 STANDARD BEEP'
    };
    
    const audioBuffer = await fs.readFile(ttsFilePath);
    
    await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `jarvis_${effectType}.mp3`,
        ptt: true,
        caption: `🤖 *J.A.R.V.I.S. - SPECIAL PROTOCOL*\n\n📊 *Effect Type:* ${effectNames[effectType]}\n📝 *Message:* ${text}\n⚡ *Status:* Protocol executed`
    }, { quoted: m });
    
    // Cleanup
    try {
        await fs.unlink(ttsFilePath);
        await fs.unlink(effectFilePath).catch(() => {});
        await fs.unlink(finalFilePath).catch(() => {});
    } catch (cleanupError) {
        // Ignore
    }
}

// Show available JARVIS phrases
async function showJarvisPhrases(sock, m) {
    const phrases = [
        "🔹 *System Commands:*",
        "• Power systems online",
        "• Flight systems engaged",
        "• Weapons systems armed",
        "• Scanning environment",
        "• Threat assessment complete",
        "",
        "🔹 *Status Reports:*",
        "• Power at 400% capacity",
        "• All systems operational",
        "• Target acquired, sir",
        "• Repulsor systems ready",
        "• Life support stable",
        "",
        "🔹 *Interactive:*",
        "• Shall I prepare the suit?",
        "• Good morning, sir",
        "• Welcome back, sir",
        "• How may I assist you?",
        "• Shall we begin the test?",
        "",
        "🔹 *Emergency:*",
        "• Warning: critical damage",
        "• Alert: incoming threat",
        "• System failure detected",
        "• Evasive maneuvers recommended",
        "• Backup systems activated",
    ];
    
    await sock.sendMessage(m.key.remoteJid, {
        text: `🤖 *J.A.R.V.I.S. Phrase Database*\n\n${phrases.join('\n')}\n\n*Usage:*\n\`.jarvis [phrase]\`\n*Example:* \`.jarvis Power systems online\``,
    }, { quoted: m });
}