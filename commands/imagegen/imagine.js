// // commands/ai/imagine.js
// import fs from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configuration for different AI image generators
// const AI_PROVIDERS = {
//     DALL_E: {
//         name: "DALL-E 3",
//         endpoint: "https://api.openai.com/v1/images/generations",
//         requiresKey: true,
//         cost: "premium",
//         quality: "excellent"
//     },
//     STABLE_DIFFUSION: {
//         name: "Stable Diffusion",
//         endpoint: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
//         requiresKey: true,
//         cost: "premium",
//         quality: "high"
//     },
//     LEONARDO: {
//         name: "Leonardo AI",
//         endpoint: "https://cloud.leonardo.ai/api/rest/v1/generations",
//         requiresKey: true,
//         cost: "premium",
//         quality: "excellent"
//     },
//     MIDJOURNEY: {
//         name: "Midjourney Style",
//         endpoint: "PROXY_REQUIRED",
//         requiresKey: true,
//         cost: "premium",
//         quality: "professional"
//     },
//     WOLFTECH: {
//         name: "WolfTech AI",
//         endpoint: "INTERNAL",
//         requiresKey: false,
//         cost: "free",
//         quality: "good"
//     }
// };

// // Image styles and presets
// const IMAGE_STYLES = {
//     REALISTIC: {
//         name: "📸 Realistic",
//         promptEnhancer: "hyperrealistic, 8k, detailed, photorealistic, masterpiece"
//     },
//     ANIME: {
//         name: "🎌 Anime",
//         promptEnhancer: "anime style, manga, studio ghibli, vibrant colors, detailed"
//     },
//     DIGITAL_ART: {
//         name: "🎨 Digital Art",
//         promptEnhancer: "digital art, concept art, trending on artstation, epic composition"
//     },
//     FANTASY: {
//         name: "🐉 Fantasy",
//         promptEnhancer: "fantasy art, magical, epic, detailed, dramatic lighting"
//     },
//     CYBERPUNK: {
//         name: "🤖 Cyberpunk",
//         promptEnhancer: "cyberpunk, neon lights, futuristic, dystopian, detailed"
//     },
//     MINIMALIST: {
//         name: "⚪ Minimalist",
//         promptEnhancer: "minimalist, clean lines, simple, elegant, white background"
//     },
//     WATERCOLOR: {
//         name: "🖌️ Watercolor",
//         promptEnhancer: "watercolor painting, artistic, soft edges, beautiful"
//     },
//     OIL_PAINTING: {
//         name: "🖼️ Oil Painting",
//         promptEnhancer: "oil painting, brush strokes, classical art, masterpiece"
//     },
//     PIXEL_ART: {
//         name: "👾 Pixel Art",
//         promptEnhancer: "pixel art, 8-bit, retro, video game style"
//     },
//     LOGO: {
//         name: "🔷 Logo Design",
//         promptEnhancer: "professional logo, clean, modern, vector, minimal"
//     }
// };

// // Aspect ratios
// const ASPECT_RATIOS = {
//     "1:1": { width: 1024, height: 1024 },
//     "16:9": { width: 1024, height: 576 },
//     "9:16": { width: 576, height: 1024 },
//     "4:3": { width: 1024, height: 768 },
//     "3:4": { width: 768, height: 1024 },
//     "21:9": { width: 1024, height: 438 }
// };

// export default {
//     name: "imagine",
//     alias: ["generate", "create", "aiart", "aiimage"],
//     desc: "Generate AI images using multiple AI models",
//     category: "AI",
//     usage: ".imagine <prompt> | .imagine style:anime prompt:a cat | .imagine list",
    
//     async execute(sock, m, args) {
//         const jid = m.key.remoteJid;
//         const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
        
//         // Parse arguments
//         const fullArgs = text.replace('.imagine', '').trim();
        
//         // Check for list command
//         if (fullArgs === 'list' || fullArgs === 'styles' || fullArgs === 'help') {
//             return await showStyles(sock, jid, m);
//         }
        
//         // Check if no prompt provided
//         if (!fullArgs || fullArgs.length === 0) {
//             return await sock.sendMessage(jid, { 
//                 text: `⚠️ *Please provide a prompt!*\n\nExample: .imagine a beautiful sunset over mountains\n\n📝 *Advanced Usage:*\n• .imagine style:cyberpunk prompt:futuristic city\n• .imagine ratio:16:9 prompt:landscape\n• .imagine list (to see all styles)`,
//                 contextInfo: {
//                     forwardingScore: 1,
//                     externalAdReply: {
//                         title: "🐺 WOLFTECH AI IMAGINE",
//                         body: "AI Image Generation Command",
//                         thumbnailUrl: "https://i.ibb.co/BKBXjGbt/f418318e7c6e.jpg",
//                         sourceUrl: "https://github.com/777Wolf-dot",
//                         mediaType: 1
//                     }
//                 }
//             }, { quoted: m });
//         }
        
//         // Parse parameters
//         let prompt = fullArgs;
//         let style = "REALISTIC";
//         let ratio = "1:1";
//         let model = "WOLFTECH";
//         let negativePrompt = "";
        
//         // Check for parameters
//         const params = fullArgs.split(' ');
//         const paramMap = {};
        
//         for (let i = 0; i < params.length; i++) {
//             if (params[i].includes(':')) {
//                 const [key, ...valueParts] = params[i].split(':');
//                 const value = valueParts.join(':');
//                 paramMap[key.toLowerCase()] = value;
//                 // Remove parameter from prompt
//                 prompt = prompt.replace(params[i], '').trim();
//             }
//         }
        
//         // Apply parameters
//         if (paramMap.style) {
//             const styleKey = Object.keys(IMAGE_STYLES).find(
//                 key => IMAGE_STYLES[key].name.toLowerCase().includes(paramMap.style.toLowerCase()) ||
//                       key.toLowerCase() === paramMap.style.toLowerCase()
//             );
//             if (styleKey) style = styleKey;
//         }
        
//         if (paramMap.ratio && ASPECT_RATIOS[paramMap.ratio]) {
//             ratio = paramMap.ratio;
//         }
        
//         if (paramMap.model) {
//             const modelKey = Object.keys(AI_PROVIDERS).find(
//                 key => key.toLowerCase() === paramMap.model.toLowerCase()
//             );
//             if (modelKey) model = modelKey;
//         }
        
//         if (paramMap.negative) {
//             negativePrompt = paramMap.negative;
//         }
        
//         // Enhance prompt with style
//         const enhancedPrompt = `${prompt}, ${IMAGE_STYLES[style].promptEnhancer}`;
        
//         // Send processing message
//         const processingMsg = await sock.sendMessage(jid, { 
//             text: `🔄 *Generating your image...*\n\n📝 *Prompt:* ${prompt}\n🎨 *Style:* ${IMAGE_STYLES[style].name}\n📐 *Ratio:* ${ratio}\n🤖 *AI:* ${AI_PROVIDERS[model].name}\n\n⏳ *Estimated time:* 10-30 seconds`,
//             contextInfo: {
//                 forwardingScore: 1,
//                 externalAdReply: {
//                     title: "🐺 WOLFTECH AI IMAGINE",
//                     body: "Processing your request...",
//                     thumbnailUrl: "https://i.ibb.co/BKBXjGbt/f418318e7c6e.jpg",
//                     sourceUrl: "https://github.com/777Wolf-dot",
//                     mediaType: 1
//                 }
//             }
//         }, { quoted: m });
        
//         try {
//             // Generate image (using mock for now, but you can integrate real APIs)
//             const imageBuffer = await generateMockImage(enhancedPrompt, style, ratio, model);
            
//             if (!imageBuffer) {
//                 throw new Error("Failed to generate image");
//             }
            
//             // Create caption with details
//             const caption = `
// ✅ *Image Generated Successfully!*

// 📝 *Prompt:* ${prompt}
// 🎨 *Style:* ${IMAGE_STYLES[style].name}
// 📐 *Aspect Ratio:* ${ratio}
// 🤖 *AI Model:* ${AI_PROVIDERS[model].name}
// ⚡ *Powered by:* WolfTech AI Studio

// 💡 *Tip:* Use \`.imagine list\` to see all available styles!
// 🔧 *Upgrade:* Get premium models with \`.hosting\`
// `.trim();
            
//             // Send the generated image
//             await sock.sendMessage(jid, {
//                 image: imageBuffer,
//                 caption: caption,
//                 mimetype: 'image/jpeg',
//                 contextInfo: {
//                     forwardingScore: 1,
//                     externalAdReply: {
//                         title: "🐺 WOLFTECH AI IMAGINE",
//                         body: "AI Image Generation Complete",
//                         thumbnailUrl: "https://i.ibb.co/BKBXjGbt/f418318e7c6e.jpg",
//                         sourceUrl: "https://github.com/777Wolf-dot",
//                         mediaType: 1
//                     }
//                 }
//             }, { quoted: m });
            
//             // Delete processing message
//             await sock.sendMessage(jid, { delete: processingMsg.key });
            
//         } catch (error) {
//             console.error("Image generation error:", error);
            
//             await sock.sendMessage(jid, { 
//                 text: `❌ *Image generation failed!*\n\nError: ${error.message}\n\n🔧 *Troubleshooting:*\n• Try a simpler prompt\n• Check your internet connection\n• Use a different style\n• Contact support for premium features`,
//                 contextInfo: {
//                     forwardingScore: 1,
//                     externalAdReply: {
//                         title: "🐺 WOLFTECH AI IMAGINE",
//                         body: "Generation Failed - Try Again",
//                         thumbnailUrl: "https://i.ibb.co/BKBXjGbt/f418318e7c6e.jpg",
//                         sourceUrl: "https://github.com/777Wolf-dot",
//                         mediaType: 1
//                     }
//                 }
//             }, { quoted: m });
//         }
//     }
// };

// // Helper function to show available styles
// async function showStyles(sock, jid, m) {
//     let stylesText = `🎨 *AVAILABLE IMAGE STYLES*\n\n`;
    
//     Object.entries(IMAGE_STYLES).forEach(([key, style]) => {
//         stylesText += `• *${style.name}* \`style:${key.toLowerCase()}\`\n`;
//     });
    
//     stylesText += `\n📐 *ASPECT RATIOS*\n`;
//     Object.keys(ASPECT_RATIOS).forEach(ratio => {
//         stylesText += `• \`ratio:${ratio}\`\n`;
//     });
    
//     stylesText += `\n🤖 *AI MODELS*\n`;
//     Object.entries(AI_PROVIDERS).forEach(([key, provider]) => {
//         const status = provider.cost === "free" ? "✅ Free" : "💰 Premium";
//         stylesText += `• *${provider.name}* \`model:${key.toLowerCase()}\` (${status})\n`;
//     });
    
//     stylesText += `
// 📖 *USAGE EXAMPLES:*
// \`.imagine a mystical forest\`
// \`.imagine style:cyberpunk prompt:futuristic city at night\`
// \`.imagine ratio:16:9 prompt:mountain landscape sunset\`
// \`.imagine model:stable_diffusion prompt:portrait of a warrior\`

// 🔧 *Upgrade to premium for:* DALL-E 3, Stable Diffusion, Leonardo AI, Midjourney
// 💻 *Get WolfTech panel:* \`.hosting\`
// `.trim();
    
//     await sock.sendMessage(jid, { 
//         text: stylesText,
//         contextInfo: {
//             forwardingScore: 1,
//             externalAdReply: {
//                 title: "🐺 WOLFTECH AI IMAGINE",
//                 body: "All Available Styles & Models",
//                 thumbnailUrl: "https://i.ibb.co/BKBXjGbt/f418318e7c6e.jpg",
//                 sourceUrl: "https://github.com/777Wolf-dot",
//                 mediaType: 1
//             }
//         }
//     }, { quoted: m });
// }

// // Mock image generation (replace with actual API calls)
// async function generateMockImage(prompt, style, ratio, model) {
//     try {
//         // For now, return a placeholder image
//         // In production, you'd integrate with actual AI APIs
        
//         // Check if we have a default image
//         const defaultImagePath = path.join(__dirname, '../../media/wolfbot.jpg');
//         if (fs.existsSync(defaultImagePath)) {
//             return fs.readFileSync(defaultImagePath);
//         }
        
//         // If no image exists, create a simple text-based image
//         return await createTextImage(prompt, style, ratio);
        
//     } catch (error) {
//         console.error("Mock generation error:", error);
//         return null;
//     }
// }

// // Create a text-based placeholder image
// async function createTextImage(prompt, style, ratio) {
//     const { createCanvas } = await import('canvas');
    
//     const dimensions = ASPECT_RATIOS[ratio] || ASPECT_RATIOS["1:1"];
//     const canvas = createCanvas(dimensions.width, dimensions.height);
//     const ctx = canvas.getContext('2d');
    
//     // Background gradient based on style
//     let gradient;
//     switch(style) {
//         case 'CYBERPUNK':
//             gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
//             gradient.addColorStop(0, '#0a0a2a');
//             gradient.addColorStop(1, '#ff00ff');
//             break;
//         case 'ANIME':
//             gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
//             gradient.addColorStop(0, '#ffb6c1');
//             gradient.addColorStop(1, '#87ceeb');
//             break;
//         case 'FANTASY':
//             gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
//             gradient.addColorStop(0, '#4b0082');
//             gradient.addColorStop(1, '#ffd700');
//             break;
//         default:
//             gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
//             gradient.addColorStop(0, '#1a1a2e');
//             gradient.addColorStop(1, '#16213e');
//     }
    
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
//     // Add WolfTech logo/text
//     ctx.fillStyle = '#ffffff';
//     ctx.font = 'bold 40px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('🐺 WOLFTECH AI', dimensions.width / 2, dimensions.height / 2 - 50);
    
//     ctx.font = '20px Arial';
//     ctx.fillText('IMAGE GENERATOR', dimensions.width / 2, dimensions.height / 2);
    
//     ctx.font = '16px Arial';
//     ctx.fillText(`Style: ${style}`, dimensions.width / 2, dimensions.height / 2 + 40);
//     ctx.fillText(`Ratio: ${ratio}`, dimensions.width / 2, dimensions.height / 2 + 70);
    
//     // Truncate prompt if too long
//     const displayPrompt = prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
//     ctx.fillText(`"${displayPrompt}"`, dimensions.width / 2, dimensions.height / 2 + 110);
    
//     // Footer
//     ctx.font = '14px Arial';
//     ctx.fillStyle = '#cccccc';
//     ctx.fillText('Upgrade to premium for real AI generation', dimensions.width / 2, dimensions.height - 30);
    
//     // Return buffer
//     return canvas.toBuffer('image/jpeg', { quality: 0.9 });
// }

































// commands/ai/imagine.js
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import fs from 'fs';

// Import caption system
let getUserCaption;

async function initializeCaptionSystem() {
  try {
    const tiktokModule = await import('./tiktok.js');
    getUserCaption = tiktokModule.getUserCaption || ((userId) => "🎨 Created with WolfTech AI");
  } catch (error) {
    getUserCaption = (userId) => "🎨 Created with WolfTech AI";
  }
}

initializeCaptionSystem();

function getCaption(userId) {
  if (typeof getUserCaption === 'function') {
    return getUserCaption(userId);
  }
  return "🎨 Created with WolfTech AI";
}

export default {
  name: "imagine",
  aliases: ["generate", "aiart", "create", "gen", "img"],
  description: "Generate AI images with multiple styles",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎨 *WolfTech AI Image Generator*\n\nUsage: imagine <prompt>\n\n*Examples:*\nimagine anime girl with blue hair and sword\nimagine cyberpunk city with flying cars\nimagine fantasy dragon on mountain\nimagine minimalist logo for tech company\n\n*Style Options:*\nimagine style:anime prompt:a cat\nimagine style:cyberpunk prompt:futuristic city\nimagine style:fantasy prompt:mystical forest\n\n*Available Styles:*\nanime, realistic, cyberpunk, fantasy, digital_art, oil_painting, watercolor, pixel_art, logo, minimalist\n\n*Commands:*\n• imagine list - Show all styles\n• imagine styles - Available styles\n• imagine help - More information` 
        }, { quoted: m });
        return;
      }

      const fullText = args.join(' ');
      
      // Check for list/help commands
      if (fullText === 'list' || fullText === 'styles') {
        return await showStyles(sock, jid, m);
      }
      
      if (fullText === 'help') {
        return await showHelp(sock, jid, m);
      }

      // Parse style and prompt
      let style = "realistic";
      let prompt = fullText;
      
      // Check for style parameter
      const styleMatch = fullText.match(/style:(\w+)/i);
      if (styleMatch) {
        style = styleMatch[1].toLowerCase();
        prompt = fullText.replace(/style:\w+/i, '').trim();
        
        // Remove "prompt:" prefix if present
        prompt = prompt.replace(/^prompt:\s*/i, '').trim();
      }
      
      // Check for prompt parameter
      const promptMatch = fullText.match(/prompt:(.+)/i);
      if (promptMatch && !styleMatch) {
        prompt = promptMatch[1].trim();
      }

      // Check prompt length
      if (prompt.length < 3) {
        await sock.sendMessage(jid, { 
          text: `❌ *Prompt too short*\n\nPlease provide a more detailed description.\nExample: "imagine a beautiful sunset over mountains"\nExample: "imagine style:cyberpunk futuristic city at night"` 
        }, { quoted: m });
        return;
      }

      // Send initial status
      statusMsg = await sock.sendMessage(jid, { 
        text: `🎨 *Generating AI image...*\n\n📝 *Prompt:* ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}\n🎭 *Style:* ${style}` 
      }, { quoted: m });

      // Generate image with selected style
      const result = await generateImageWithStyle(prompt, style);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Generating AI image...* ❌\n\n❌ ${result.error || 'Failed to generate image'}\n\n🔧 Try: imagine help`,
          edit: statusMsg.key 
        });
        return;
      }

      const { imagePath, modelUsed, generationTime, dimensions } = result;

      await sock.sendMessage(jid, { 
        text: `🎨 *Generating AI image...* ✅\n📤 *Sending image...*`,
        edit: statusMsg.key 
      });

      // Get user's caption
      const userCaption = getCaption(userId);
      
      // Create detailed caption
      const caption = `🎨 *AI Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎭 *Style:* ${style}\n🖼️ *Model:* ${modelUsed}\n📐 *Size:* ${dimensions}\n⏱️ *Time:* ${generationTime}s\n\n${userCaption}`;
      
      // Send the generated image
      await sock.sendMessage(jid, {
        image: readFileSync(imagePath),
        caption: caption
      });

      await sock.sendMessage(jid, { 
        text: `🎨 *Generating AI image...* ✅\n📤 *Sending image...* ✅\n\n✅ *Image generated successfully!*\n\nStyle: ${style}\nModel: ${modelUsed}\nTime: ${generationTime}s`,
        edit: statusMsg.key 
      });

      // Cleanup
      cleanupFile(imagePath);

    } catch (error) {
      console.error('Imagine command error:', error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Generating AI image...* ❌\n\n❌ Error: ${error.message.substring(0, 100)}\n\n🔧 Try: imagine help`,
          edit: statusMsg.key 
        });
      }
    }
  },
};

// ==================== IMAGE GENERATION FUNCTIONS ====================

async function generateImageWithStyle(prompt, style) {
  const tempDir = './temp/imagine';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const imagePath = `${tempDir}/imagine_${timestamp}.png`;

  try {
    // Enhance prompt based on style
    const enhancedPrompt = enhancePromptWithStyle(prompt, style);
    
    // Select model based on style
    const model = selectModelForStyle(style);
    
    // Try Prodia API first (most reliable)
    const prodiaResult = await tryProdiaGeneration(enhancedPrompt, model, imagePath);
    if (prodiaResult.success) return prodiaResult;

    // Try Pollinations.ai as backup
    const pollinationsResult = await tryPollinationsGeneration(enhancedPrompt, style, imagePath);
    if (pollinationsResult.success) return pollinationsResult;

    // Try alternative API
    const alternativeResult = await tryAlternativeAPI(enhancedPrompt, style, imagePath);
    if (alternativeResult.success) return alternativeResult;

    return { 
      success: false, 
      error: 'All image generation services are currently unavailable. Try again in a few minutes.' 
    };

  } catch (error) {
    console.error('Image generation error:', error);
    cleanupFile(imagePath);
    return { success: false, error: error.message };
  }
}

// ==================== SERVICE 1: PRODIA API ====================
async function tryProdiaGeneration(prompt, model, imagePath) {
  try {
    const startTime = Date.now();
    
    console.log(`Using Prodia model: ${model} for prompt: ${prompt.substring(0, 50)}...`);
    
    // Step 1: Create generation job
    const createResponse = await axios.post('https://api.prodia.com/v1/job', {
      model: model,
      prompt: prompt,
      negative_prompt: getNegativePromptForStyle(prompt, model),
      steps: 25,
      cfg_scale: 7,
      seed: -1,
      aspect_ratio: 'square'
    }, {
      headers: {
        'X-Prodia-Key': '', // Empty for free tier
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const jobId = createResponse.data.job;
    
    if (!jobId) {
      throw new Error('Failed to create generation job');
    }

    // Step 2: Wait for generation to complete
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max (500ms * 60)
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const statusResponse = await axios.get(`https://api.prodia.com/v1/job/${jobId}`, {
          timeout: 5000
        });
        
        if (statusResponse.data.status === 'succeeded') {
          imageUrl = statusResponse.data.imageUrl;
          break;
        } else if (statusResponse.data.status === 'failed') {
          throw new Error('Generation failed');
        }
        
        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (statusError) {
        // Continue waiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!imageUrl) {
      throw new Error('Generation timeout');
    }

    // Step 3: Download the generated image
    await downloadImageFile(imageUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `Prodia: ${getModelName(model)}`,
      generationTime,
      dimensions: '512x512',
      service: 'prodia'
    };

  } catch (error) {
    console.log('Prodia generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 2: POLLINATIONS API ====================
async function tryPollinationsGeneration(prompt, style, imagePath) {
  try {
    const startTime = Date.now();
    
    // Select model based on style
    let model = 'stable-diffusion-xl';
    if (style === 'anime') model = 'anything-v4.5';
    if (style === 'pixel_art') model = 'pixel-art';
    
    // URL encode prompt
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Pollinations API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=${model}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;
    
    console.log(`Using Pollinations model: ${model}`);
    
    // Download directly
    await downloadImageFile(apiUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `Pollinations: ${model}`,
      generationTime,
      dimensions: '512x512',
      service: 'pollinations'
    };

  } catch (error) {
    console.log('Pollinations generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 3: ALTERNATIVE API ====================
async function tryAlternativeAPI(prompt, style, imagePath) {
  try {
    const startTime = Date.now();
    
    // Use replicate-text2image API as backup
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://replicate-text2image.onrender.com/generate?prompt=${encodedPrompt}&width=512&height=512`;
    
    console.log('Using alternative API');
    
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 60000
    });

    // Save the image
    fs.writeFileSync(imagePath, response.data);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: 'Stable Diffusion',
      generationTime,
      dimensions: '512x512',
      service: 'alternative'
    };

  } catch (error) {
    console.log('Alternative API generation failed:', error.message);
    return { success: false };
  }
}

// ==================== STYLE ENHANCEMENT FUNCTIONS ====================

function enhancePromptWithStyle(prompt, style) {
  let enhanced = prompt;
  
  // Style-specific enhancements
  switch(style) {
    case 'anime':
      enhanced += ', anime style, manga, vibrant colors, detailed eyes, masterpiece, best quality';
      break;
      
    case 'cyberpunk':
      enhanced += ', cyberpunk, neon lights, futuristic, dystopian, night, rain, reflections, sci-fi';
      break;
      
    case 'fantasy':
      enhanced += ', fantasy art, magical, epic, detailed, dramatic lighting, concept art, digital painting';
      break;
      
    case 'digital_art':
      enhanced += ', digital art, trending on artstation, epic composition, detailed, masterpiece';
      break;
      
    case 'oil_painting':
      enhanced += ', oil painting, classical art, brush strokes, masterpiece, gallery artwork';
      break;
      
    case 'watercolor':
      enhanced += ', watercolor painting, artistic, soft edges, beautiful, delicate, traditional art';
      break;
      
    case 'pixel_art':
      enhanced += ', pixel art, 8-bit, retro, video game style, low resolution, pixelated';
      break;
      
    case 'logo':
      enhanced += ', logo design, vector, minimal, clean, professional, modern, flat design';
      break;
      
    case 'minimalist':
      enhanced += ', minimalist, simple, clean lines, elegant, white background, modern design';
      break;
      
    case 'realistic':
    default:
      enhanced += ', photorealistic, 8k, detailed, masterpiece, best quality, sharp focus';
      break;
  }
  
  return enhanced;
}

function selectModelForStyle(style) {
  // Prodia model IDs
  const models = {
    'anime': 'anything-v4.5-pruned.ckpt [65745d25]',
    'realistic': 'realisticVisionV51_v51VAE.safetensors [0ff765c1dc]',
    'cyberpunk': 'cyberrealistic_v33.safetensors [82b0d08518]',
    'fantasy': 'dreamshaper_8.safetensors [9d40847d7b]',
    'digital_art': 'deliberate_v3.safetensors [c13a45f2b2]',
    'oil_painting': 'lyriel_v16.safetensors [68fceea2b0]',
    'watercolor': 'aingdiffusion_v12.safetensors [e3b0f2b6a2]',
    'pixel_art': 'pixelart-xl.safetensors [5c7b842da4]',
    'logo': 'diffusion_models_project_fp16.safetensors [ca1e1cc8b2]',
    'minimalist': 'diffusion_models_project_fp16.safetensors [ca1e1cc8b2]'
  };
  
  return models[style] || models.realistic;
}

function getNegativePromptForStyle(prompt, model) {
  // Base negative prompts
  let negatives = 'worst quality, low quality, normal quality, blurry, jpeg artifacts, signature, watermark, username, error, ugly, disgusting, poorly drawn, bad anatomy, wrong anatomy';
  
  // Add style-specific negatives
  if (model.includes('realistic') || model.includes('photo')) {
    negatives += ', cartoon, anime, 3d, render, painting, drawing, sketch';
  }
  
  if (model.includes('anime') || model.includes('manga')) {
    negatives += ', realistic, photo, photograph, 3d, render';
  }
  
  // Add prompt-specific negatives
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('person') || promptLower.includes('face') || promptLower.includes('portrait')) {
    negatives += ', extra fingers, missing fingers, too many fingers, fused fingers, bad hands, poorly drawn hands';
  }
  
  return negatives;
}

function getModelName(modelId) {
  const modelMap = {
    'anything-v4.5-pruned.ckpt [65745d25]': 'Anything V4.5',
    'realisticVisionV51_v51VAE.safetensors [0ff765c1dc]': 'Realistic Vision V5.1',
    'cyberrealistic_v33.safetensors [82b0d08518]': 'CyberRealistic V33',
    'dreamshaper_8.safetensors [9d40847d7b]': 'DreamShaper 8',
    'deliberate_v3.safetensors [c13a45f2b2]': 'Deliberate V3',
    'lyriel_v16.safetensors [68fceea2b0]': 'Lyriel V16',
    'aingdiffusion_v12.safetensors [e3b0f2b6a2]': 'AingDiffusion V12',
    'pixelart-xl.safetensors [5c7b842da4]': 'PixelArt XL',
    'diffusion_models_project_fp16.safetensors [ca1e1cc8b2]': 'Diffusion Model'
  };
  
  return modelMap[modelId] || modelId;
}

// ==================== UTILITY FUNCTIONS ====================

async function downloadImageFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const writer = createWriteStream(filePath);
    
    axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': 'https://prodia.com/'
      }
    })
    .then(response => {
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error('Response is not an image'));
        return;
      }
      
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        if (existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 1024) { // At least 1KB
            resolve();
          } else {
            reject(new Error('Image file too small'));
          }
        } else {
          reject(new Error('File not created'));
        }
      });
      
      writer.on('error', reject);
    })
    .catch(error => {
      reject(error);
    });
  });
}

function cleanupFile(filePath) {
  setTimeout(() => {
    try {
      if (existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Cleaned up imagine image: ${filePath}`);
      }
    } catch (e) {
      console.log('Imagine cleanup error:', e.message);
    }
  }, 10000);
}

// ==================== HELP FUNCTIONS ====================

async function showStyles(sock, jid, m) {
  const stylesText = `🎨 *Available AI Image Styles*\n\n` +
    `*Anime Styles:*\n` +
    `• \`anime\` - Anime/manga art style\n` +
    `• \`cyberpunk\` - Futuristic neon aesthetic\n` +
    `• \`fantasy\` - Magical fantasy art\n\n` +
    `*Art Styles:*\n` +
    `• \`digital_art\` - Digital painting\n` +
    `• \`oil_painting\` - Classical oil painting\n` +
    `• \`watercolor\` - Watercolor painting\n` +
    `• \`pixel_art\` - Retro pixel art\n\n` +
    `*Design Styles:*\n` +
    `• \`logo\` - Logo/vector design\n` +
    `• \`minimalist\` - Minimal clean design\n` +
    `• \`realistic\` - Photorealistic images\n\n` +
    `*Usage Examples:*\n` +
    `\`imagine style:anime prompt:a cat warrior\`\n` +
    `\`imagine style:cyberpunk prompt:futuristic city\`\n` +
    `\`imagine style:logo prompt:wolf tech logo\`\n\n` +
    `*Default:* If no style specified, uses realistic`;
  
  await sock.sendMessage(jid, { text: stylesText }, { quoted: m });
}

async function showHelp(sock, jid, m) {
  const helpText = `🎨 *WolfTech AI Image Generator Help*\n\n` +
    `*Basic Usage:*\n` +
    `• \`imagine [prompt]\` - Generate image\n` +
    `• \`imagine style:[style] prompt:[prompt]\` - Generate with specific style\n\n` +
    `*Examples:*\n` +
    `\`imagine a beautiful sunset over mountains\`\n` +
    `\`imagine style:anime prompt:cat girl with sword\`\n` +
    `\`imagine style:cyberpunk prompt:city at night\`\n` +
    `\`imagine style:logo prompt:tech company logo\`\n\n` +
    `*Prompt Tips:*\n` +
    `• Be descriptive - "A majestic dragon flying over snowy mountains at sunset"\n` +
    `• Include details - colors, lighting, mood, style references\n` +
    `• For people - describe appearance, clothing, expression\n` +
    `• For scenes - describe setting, time of day, weather\n\n` +
    `*Commands:*\n` +
    `• \`imagine list\` - Show all available styles\n` +
    `• \`imagine help\` - This help message\n\n` +
    `*Note:* Generation takes 10-30 seconds. Images are 512x512 pixels.`;
  
  await sock.sendMessage(jid, { text: helpText }, { quoted: m });
}

// ==================== ADDITIONAL COMMANDS ====================

export const imagineCommands = {
  "imaginehelp": {
    description: "AI image generation help",
    execute: async (sock, m, args) => {
      await showHelp(sock, m.key.remoteJid, m);
    }
  },
  
  "imagines": {
    description: "Quick image generation",
    execute: async (sock, m, args) => {
      if (!args[0]) {
        await sock.sendMessage(m.key.remoteJid, { 
          text: `🎨 Quick generate: imagines <prompt>\nExample: imagines cat wearing hat` 
        }, { quoted: m });
        return;
      }
      
      // Forward to imagine command
      const imagineModule = await import('./imagine.js');
      const prompt = args.join(' ');
      await imagineModule.default.execute(sock, { ...m, message: { conversation: `.imagine ${prompt}` } }, [prompt]);
    }
  }
};