// import axios from 'axios';

// export default {
//   name: 'gemini',
//   description: 'Google Gemini AI - Advanced multimodal AI by Google',
//   category: 'ai',
//   aliases: ['geminiai', 'googleai', 'googlegemini', 'gai', 'gem', 'dualai', 'multimodal'],
//   usage: 'gemini [question, text, or describe image]',
  
//   async execute(sock, m, args, PREFIX, extra) {
//     const jid = m.key.remoteJid;
//     const senderJid = m.key.participant || jid;
    
//     // ====== HELP SECTION ======
//     if (args.length === 0 || args[0].toLowerCase() === 'help') {
//       const helpText = `🤖 *GOOGLE GEMINI AI*\n` +
//         `⚡ *Google\'s Most Advanced Multimodal AI*\n` +
//         `💡 *Usage:*\n` +
//         `• \`${PREFIX}gemini your question\`\n` +
//         `• \`${PREFIX}geminiai hello\`\n` +
//         `• \`${PREFIX}googleai explain with images\`\n` +
//         ``;
      
//       return sock.sendMessage(jid, { text: helpText }, { quoted: m });
//     }

//     // ====== SPECIAL COMMANDS ======
//     const specialCommands = {
//       'image': 'image',
//       'describe': 'image',
//       'analyze': 'image',
//       'visual': 'visual',
//       'picture': 'visual',
//       'photo': 'visual',
//       'code': 'code',
//       'program': 'code',
//       'debug': 'debug',
//       'fix': 'debug',
//       'creative': 'creative',
//       'write': 'creative',
//       'story': 'creative',
//       'poem': 'creative',
//       'explain': 'explain',
//       'detailed': 'explain',
//       'technical': 'technical',
//       'science': 'science',
//       'math': 'math',
//       'calculate': 'math',
//       'translate': 'translate',
//       'multilingual': 'translate',
//       'summary': 'summary',
//       'summarize': 'summary',
//       'compare': 'compare',
//       'analysis': 'analysis',
//       'research': 'research'
//     };

//     let query = args.join(' ');
//     let mode = 'general';
//     let enhancedPrompt = '';

//     // Check for special command modes
//     const firstWord = args[0].toLowerCase();
//     if (specialCommands[firstWord]) {
//       mode = specialCommands[firstWord];
//       query = args.slice(1).join(' ');
      
//       switch(mode) {
//         case 'image':
//         case 'visual':
//           enhancedPrompt = `Analyze/describe visual content: ${query}`;
//           break;
//         case 'code':
//           enhancedPrompt = `Generate optimized code with explanations: ${query}`;
//           break;
//         case 'debug':
//           enhancedPrompt = `Debug and fix errors in: ${query}`;
//           break;
//         case 'creative':
//           enhancedPrompt = `Create engaging creative content: ${query}`;
//           break;
//         case 'explain':
//           enhancedPrompt = `Explain in detail with examples: ${query}`;
//           break;
//         case 'technical':
//         case 'science':
//           enhancedPrompt = `Provide technical/scientific explanation: ${query}`;
//           break;
//         case 'math':
//           enhancedPrompt = `Solve mathematical problem with steps: ${query}`;
//           break;
//         case 'translate':
//           enhancedPrompt = `Translate accurately: ${query}`;
//           break;
//         case 'summary':
//           enhancedPrompt = `Summarize concisely: ${query}`;
//           break;
//         case 'compare':
//           enhancedPrompt = `Compare and contrast: ${query}`;
//           break;
//         case 'analysis':
//           enhancedPrompt = `Provide detailed analysis: ${query}`;
//           break;
//         case 'research':
//           enhancedPrompt = `Research and present findings: ${query}`;
//           break;
//       }
//     } else {
//       enhancedPrompt = query;
//     }

//     // Check for image message (Gemini is multimodal)
//     const hasImage = m.message?.imageMessage;
//     const hasQuotedImage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

//     if (hasImage || hasQuotedImage) {
//       mode = 'image';
//       enhancedPrompt = `Analyze this image: ${query || 'Describe what you see'}`;
//     }

//     try {
//       // ====== PROCESSING MESSAGE ======
//       const processingText = hasImage || hasQuotedImage 
//         ? `🖼️ *GEMINI AI (Multimodal)*\n\n🚀 *Processing image with Gemini...*`
//         : `⚡ *GOOGLE GEMINI*\n\n🚀 *Initializing Gemini AI...*\n\n📝 "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`;
      
//       const statusMsg = await sock.sendMessage(jid, {
//         text: processingText
//       }, { quoted: m });

//       // ====== API REQUEST (Using Keith's Gemini API) ======
//       const apiUrl = 'https://apiskeith.vercel.app/ai/gemini';
      
//       console.log(`🤖 Gemini Query [${mode}]: ${query}`);
//       console.log(`🎨 Has Image: ${hasImage || hasQuotedImage}`);
      
//       const response = await axios({
//         method: 'GET',
//         url: apiUrl,
//         params: {
//           q: enhancedPrompt || query
//         },
//         timeout: 35000, // 35 seconds for advanced AI
//         headers: {
//           'User-Agent': 'WolfBot-Gemini/1.0 (Multimodal-AI)',
//           'Accept': 'application/json',
//           'X-Requested-With': 'WolfBot',
//           'Referer': 'https://apiskeith.vercel.app/',
//           'Origin': 'https://apiskeith.vercel.app',
//           'Cache-Control': 'no-cache'
//         },
//         validateStatus: function (status) {
//           return status >= 200 && status < 500;
//         }
//       });

//       console.log(`✅ Gemini Response status: ${response.status}`);
      
//       // ====== UPDATE STATUS ======
//       const updateText = hasImage || hasQuotedImage
//         ? `⚡ *GEMINI AI*\n🖼️ *Processing image...* ✅\n🧠 *Analyzing visual content...*\n⚡ *Generating multimodal response...*`
//         : `⚡ *GOOGLE GEMINI*\n🚀 *Initializing...* ✅\n🧠 *Processing with Gemini AI...*\n⚡ *Generating advanced response...*`;
      
//       await sock.sendMessage(jid, {
//         text: updateText,
//         edit: statusMsg.key
//       });

//       // ====== PARSE RESPONSE ======
//       let aiResponse = '';
//       let metadata = {
//         creator: 'Google AI',
//         model: 'Gemini Pro',
//         multimodal: (hasImage || hasQuotedImage),
//         status: true,
//         source: 'Keith API'
//       };
      
//       // Parse Keith API response format
//       if (response.data && typeof response.data === 'object') {
//         const data = response.data;
        
//         console.log('📊 Gemini API Response structure:', Object.keys(data));
        
//         // Extract based on Keith API structure
//         if (data.status === true && data.result) {
//           aiResponse = data.result;
//           console.log('✅ Using data.result');
//         } else if (data.response) {
//           aiResponse = data.response;
//           console.log('✅ Using data.response');
//         } else if (data.answer) {
//           aiResponse = data.answer;
//           console.log('✅ Using data.answer');
//         } else if (data.text) {
//           aiResponse = data.text;
//           console.log('✅ Using data.text');
//         } else if (data.content) {
//           aiResponse = data.content;
//           console.log('✅ Using data.content');
//         } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//           // Gemini API format
//           aiResponse = data.candidates[0].content.parts[0]?.text || '';
//           console.log('✅ Using Gemini candidates format');
//         } else if (data.message) {
//           aiResponse = data.message;
//           console.log('✅ Using data.message');
//         } else if (data.data) {
//           aiResponse = data.data;
//           console.log('✅ Using data.data');
//         } else if (data.error) {
//           console.log('❌ API error:', data.error);
//           throw new Error(data.error || 'Gemini API returned error');
//         } else {
//           console.log('🔍 Attempting to extract text from response object');
//           aiResponse = extractGeminiResponse(data);
//         }
//       } else if (typeof response.data === 'string') {
//         console.log('✅ Response is string');
//         aiResponse = response.data;
//       } else {
//         console.log('❌ Invalid response format');
//         throw new Error('Invalid API response format');
//       }
      
//       // Check if response is empty
//       if (!aiResponse || aiResponse.trim() === '') {
//         console.log('❌ Empty response');
//         throw new Error('Gemini returned empty response');
//       }
      
//       // Clean response
//       aiResponse = aiResponse.trim();
//       console.log(`📝 Response length: ${aiResponse.length} characters`);
      
//       // Check for error indicators
//       const lowerResponse = aiResponse.toLowerCase();
//       if (lowerResponse.includes('error:') || 
//           lowerResponse.startsWith('error') ||
//           lowerResponse.includes('failed to') ||
//           lowerResponse.includes('unavailable') ||
//           lowerResponse.includes('not found') ||
//           lowerResponse.includes('rate limit')) {
//         console.log('❌ Response contains error indicator');
//         throw new Error(aiResponse);
//       }
      
//       // Format response based on mode
//       aiResponse = formatGeminiResponse(aiResponse, mode, query, hasImage || hasQuotedImage);
      
//       // Truncate if too long for WhatsApp
//       if (aiResponse.length > 2800) {
//         aiResponse = aiResponse.substring(0, 2800) + '\n\n... (response truncated for WhatsApp)';
//       }

//       // ====== FORMAT FINAL MESSAGE ======
//       let resultText = `🤖 *GOOGLE GEMINI AI*\n\n`;
      
//       // Mode indicator with emoji
//       if (mode !== 'general') {
//         const modeIcons = {
//           'image': '🖼️',
//           'visual': '👁️',
//           'code': '💻',
//           'debug': '🐛',
//           'creative': '🎨',
//           'explain': '📚',
//           'technical': '🔧',
//           'science': '🔬',
//           'math': '🧮',
//           'translate': '🌐',
//           'summary': '📋',
//           'compare': '⚖️',
//           'analysis': '🔍',
//           'research': '📊'
//         };
//         const modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1);
//         const modeEmoji = modeIcons[mode] || '⚡';
        
//         // Add multimodal indicator for image mode
//         if (mode === 'image' && (hasImage || hasQuotedImage)) {
//           resultText += `${modeEmoji} *Mode:* MULTIMODAL (Image Analysis)\n\n`;
//         } else {
//           resultText += `${modeEmoji} *Mode:* ${modeDisplay.toUpperCase()}\n\n`;
//         }
//       } else if (hasImage || hasQuotedImage) {
//         resultText += `🖼️ *Mode:* IMAGE ANALYSIS\n\n`;
//       }
      
//       // Query display
//       const displayQuery = query.length > 80 ? query.substring(0, 80) + '...' : query;
//       if (query) {
//         resultText += `🎯 *Query:* ${displayQuery}\n\n`;
//       }
      
//       // Add image indicator
//       if (hasImage || hasQuotedImage) {
//         resultText += `📸 *Image detected and analyzed*\n\n`;
//       }
      
//       // Gemini Response
//       resultText += `✨ *Gemini Response:*\n${aiResponse}\n\n`;
      
//       // Footer with Gemini branding
//       resultText += `⚡ *Powered by Google Gemini AI*\n`;
//       //resultText += `🔗 *via Keith API*\n`;
//       if (hasImage || hasQuotedImage) {
//         resultText += `🎨 *Multimodal AI (Text + Image)*`;
//       } else {
//         resultText += `🧠 *Advanced Reasoning AI*`;
//       }

//       // ====== SEND FINAL ANSWER ======
//       console.log('📤 Sending final response to WhatsApp');
//       await sock.sendMessage(jid, {
//         text: resultText,
//         edit: statusMsg.key
//       });

//       console.log(`✅ Gemini response sent successfully`);

//     } catch (error) {
//       console.error('❌ [Google Gemini] ERROR:', error);
//       console.error('❌ Error stack:', error.stack);
      
//       let errorMessage = `❌ *GOOGLE GEMINI ERROR*\n\n`;
      
//       // Detailed error handling
//       if (error.code === 'ECONNREFUSED') {
//         errorMessage += `• Gemini API server is down\n`;
//         errorMessage += `• Google AI service unavailable\n`;
//       } else if (error.code === 'ETIMEDOUT') {
//         errorMessage += `• Request timed out (35s)\n`;
//         errorMessage += `• Gemini processing complex request\n`;
//         errorMessage += `• Try simpler query\n`;
//       } else if (error.code === 'ENOTFOUND') {
//         errorMessage += `• Cannot connect to Gemini API\n`;
//         errorMessage += `• Check internet connection\n`;
//       } else if (error.code === 'ECONNABORTED') {
//         errorMessage += `• Connection aborted\n`;
//         errorMessage += `• Network issue detected\n`;
//       } else if (error.response?.status === 429) {
//         errorMessage += `• Rate limit exceeded\n`;
//         errorMessage += `• Too many Gemini requests\n`;
//         errorMessage += `• Wait 2-3 minutes\n`;
//       } else if (error.response?.status === 404) {
//         errorMessage += `• Gemini endpoint not found\n`;
//         errorMessage += `• API may have changed\n`;
//       } else if (error.response?.status === 500) {
//         errorMessage += `• Google AI internal error\n`;
//         errorMessage += `• Service temporarily down\n`;
//       } else if (error.response?.status === 403) {
//         errorMessage += `• Access forbidden\n`;
//         errorMessage += `• API key may be invalid\n`;
//       } else if (error.response?.status === 400) {
//         errorMessage += `• Bad request to Gemini\n`;
//         errorMessage += `• Query may be malformed\n`;
//       } else if (error.response?.status === 413) {
//         errorMessage += `• Request too large\n`;
//         errorMessage += `• Image may be too big\n`;
//         errorMessage += `• Try smaller image\n`;
//       } else if (error.response?.data) {
//         // Extract API error
//         const apiError = error.response.data;
//         console.log('📊 API Error response:', apiError);
        
//         if (apiError.error) {
//           errorMessage += `• Gemini Error: ${apiError.error}\n`;
//         } else if (apiError.message) {
//           errorMessage += `• Error: ${apiError.message}\n`;
//         } else if (apiError.details) {
//           errorMessage += `• Details: ${apiError.details}\n`;
//         } else if (typeof apiError === 'string') {
//           errorMessage += `• Error: ${apiError}\n`;
//         }
//       } else if (error.message) {
//         errorMessage += `• Error: ${error.message}\n`;
//       }
      
//       errorMessage += `\n🔧 *Troubleshooting:*\n`;
//       errorMessage += `1. Try simpler/shorter query\n`;
      
//       if (hasImage || hasQuotedImage) {
//         errorMessage += `2. Image may be too large/complex\n`;
//         errorMessage += `3. Try text-only query\n`;
//       } else {
//         errorMessage += `2. Wait 1-2 minutes before retry\n`;
//       }
      
//       errorMessage += `4. Check internet connection\n`;
//       errorMessage += `5. Use other AI commands:\n`;
//       errorMessage += `   • \`${PREFIX}bard\` - Google Bard\n`;
//       errorMessage += `   • \`${PREFIX}gpt\` - GPT-5\n`;
//       errorMessage += `   • \`${PREFIX}metai\` - Meta AI\n`;
//       errorMessage += `6. Try rephrasing your question\n`;
      
//       // Try to send error message
//       try {
//         console.log('📤 Sending error message to user');
//         await sock.sendMessage(jid, {
//           text: errorMessage
//         }, { quoted: m });
//       } catch (sendError) {
//         console.error('❌ Failed to send error message:', sendError);
//       }
//     }
//   },
// };

// // ====== HELPER FUNCTIONS ======

// // Extract text from Gemini API response
// function extractGeminiResponse(obj, depth = 0) {
//   if (depth > 3) return 'Response structure too complex';
  
//   // If it's a string, return it
//   if (typeof obj === 'string') {
//     return obj;
//   }
  
//   // If array, process each item
//   if (Array.isArray(obj)) {
//     const texts = obj.map(item => extractGeminiResponse(item, depth + 1))
//                      .filter(text => text && text.trim());
//     return texts.join('\n');
//   }
  
//   // If object, look for common response fields
//   if (obj && typeof obj === 'object') {
//     // Priority fields for Gemini
//     const priorityFields = [
//       'text', 'content', 'result', 'response', 'answer',
//       'message', 'output', 'candidates', 'parts'
//     ];
    
//     // Check for Gemini-specific structure
//     if (obj.candidates && Array.isArray(obj.candidates)) {
//       const candidate = obj.candidates[0];
//       if (candidate && candidate.content && candidate.content.parts) {
//         const parts = candidate.content.parts.map(part => part.text).filter(Boolean);
//         if (parts.length > 0) {
//           return parts.join('\n');
//         }
//       }
//     }
    
//     // Check standard fields
//     for (const field of priorityFields) {
//       if (obj[field]) {
//         const extracted = extractGeminiResponse(obj[field], depth + 1);
//         if (extracted && extracted.trim()) {
//           return extracted;
//         }
//       }
//     }
    
//     // Try to extract from any string property
//     for (const key in obj) {
//       if (typeof obj[key] === 'string' && obj[key].trim()) {
//         return obj[key];
//       }
//     }
    
//     // Try to stringify the object
//     try {
//       const stringified = JSON.stringify(obj, null, 2);
//       if (stringified.length < 1500) {
//         return stringified;
//       }
//     } catch (e) {
//       // Ignore stringify errors
//     }
//   }
  
//   return 'Could not extract response from Gemini API';
// }

// // Format Gemini response based on mode
// function formatGeminiResponse(text, mode, originalQuery, hasImage = false) {
//   if (!text) return 'No response received from Google Gemini';
  
//   // Clean up
//   text = text.trim();
  
//   // Remove excessive markdown
//   text = cleanGeminiResponse(text);
  
//   // Special formatting based on mode
//   switch(mode) {
//     case 'image':
//     case 'visual':
//       text = formatImageAnalysisResponse(text, hasImage);
//       break;
//     case 'code':
//       text = formatCodeResponse(text);
//       break;
//     case 'debug':
//       text = formatDebugResponse(text);
//       break;
//     case 'creative':
//       text = formatCreativeResponse(text);
//       break;
//     case 'explain':
//     case 'technical':
//     case 'science':
//       text = formatTechnicalResponse(text, mode);
//       break;
//     case 'math':
//       text = formatMathResponse(text);
//       break;
//     case 'translate':
//       text = formatTranslationResponse(text);
//       break;
//     case 'summary':
//       text = formatSummaryResponse(text);
//       break;
//     case 'compare':
//       text = formatCompareResponse(text);
//       break;
//     case 'analysis':
//     case 'research':
//       text = formatAnalysisResponse(text);
//       break;
//     default:
//       text = formatGeneralResponse(text, hasImage);
//   }
  
//   // Ensure proper spacing for WhatsApp
//   text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  
//   return text;
// }

// // Clean Gemini response
// function cleanGeminiResponse(text) {
//   // Remove citation markers
//   text = text.replace(/\[\d+\]/g, '');
//   text = text.replace(/^\*\*Gemini:\*\*/gmi, '');
//   text = text.replace(/^\*\*Response:\*\*/gmi, '');
  
//   // Clean markdown but preserve structure
//   text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  
//   // Remove excessive whitespace
//   text = text.replace(/\s+/g, ' ');
//   text = text.replace(/\n\s+/g, '\n');
  
//   return text;
// }

// // Format image analysis responses
// function formatImageAnalysisResponse(text, hasImage) {
//   if (!text.startsWith('🖼️') && !text.startsWith('👁️')) {
//     if (hasImage) {
//       text = `🖼️ *Image Analysis:*\n${text}`;
//     } else {
//       text = `👁️ *Visual Description:*\n${text}`;
//     }
//   }
  
//   // Add structure for detailed analysis
//   if (text.length > 200) {
//     const lines = text.split('\n');
//     if (lines.length > 5) {
//       const structuredLines = lines.map((line, index) => {
//         const trimmed = line.trim();
//         if (index === 0) return `📸 ${trimmed}`;
//         if (trimmed.toLowerCase().includes('contains') || trimmed.toLowerCase().includes('shows')) {
//           return `🔍 ${trimmed}`;
//         }
//         if (trimmed.includes(':')) {
//           return `• ${trimmed}`;
//         }
//         return trimmed;
//       });
//       text = structuredLines.join('\n');
//     }
//   }
  
//   return text;
// }

// // Format code responses
// function formatCodeResponse(text) {
//   // Check for code blocks
//   if (!text.includes('```')) {
//     // Add code blocks if looks like code
//     if (isCodeLike(text)) {
//       const language = detectProgrammingLanguage(text);
//       text = `💻 *${language.toUpperCase()} Code:*\n\`\`\`${language}\n${text}\n\`\`\``;
//     }
//   } else {
//     // Format existing code blocks
//     text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
//       const language = lang || detectProgrammingLanguage(code);
//       return `💻 *${language.toUpperCase()} Code:*\n\`\`\`${language}\n${code.trim()}\n\`\`\``;
//     });
//   }
  
//   return text;
// }

// // Format debug responses
// function formatDebugResponse(text) {
//   // Add bug emoji and structure
//   if (!text.startsWith('🐛')) {
//     text = `🐛 *Debug Report:*\n${text}`;
//   }
  
//   // Format error/solution sections
//   const sections = text.split(/(error:|solution:|fix:|issue:)/gi);
//   if (sections.length > 1) {
//     let formatted = '';
//     for (let i = 0; i < sections.length; i++) {
//       const section = sections[i].trim();
//       if (section.match(/error:/i)) {
//         formatted += `❌ *Error Found:*\n`;
//       } else if (section.match(/solution:|fix:/i)) {
//         formatted += `✅ *Solution:*\n`;
//       } else if (section.match(/issue:/i)) {
//         formatted += `⚠️ *Issue:*\n`;
//       } else if (section) {
//         formatted += `${section}\n`;
//       }
//     }
//     text = formatted.trim();
//   }
  
//   return text;
// }

// // Format creative responses
// function formatCreativeResponse(text) {
//   if (!text.startsWith('🎨')) {
//     text = `🎨 *Creative Content:*\n${text}`;
//   }
  
//   // Add artistic formatting for poems/stories
//   if (text.toLowerCase().includes('poem') || text.split('\n').some(line => line.trim().match(/^[A-Z][a-z]*\s+[A-Z][a-z]*$/))) {
//     text = text.replace(/\n/g, '\n    ');
//   }
  
//   return text;
// }

// // Format technical/scientific responses
// function formatTechnicalResponse(text, mode) {
//   const icons = {
//     'explain': '📚',
//     'technical': '🔧',
//     'science': '🔬'
//   };
  
//   const icon = icons[mode] || '📚';
//   if (!text.startsWith(icon)) {
//     text = `${icon} *${mode.toUpperCase()}:*\n${text}`;
//   }
  
//   // Add structure for technical explanations
//   const lines = text.split('\n');
//   if (lines.length > 4) {
//     const structuredLines = lines.map((line, index) => {
//       const trimmed = line.trim();
//       if (index === 0) return trimmed;
//       if (trimmed.match(/^\d+[\.\)]/) || trimmed.toLowerCase().startsWith('step')) {
//         return `📌 ${trimmed}`;
//       }
//       if (trimmed.includes(':')) {
//         return `• ${trimmed}`;
//       }
//       return trimmed;
//     });
//     text = structuredLines.join('\n');
//   }
  
//   return text;
// }

// // Format math responses
// function formatMathResponse(text) {
//   if (!text.startsWith('🧮')) {
//     text = `🧮 *Mathematical Solution:*\n${text}`;
//   }
  
//   // Highlight final answer
//   const answerMatch = text.match(/(?:answer|result|solution|equals?)[:\s]*([^.\n]+)/i);
//   if (answerMatch) {
//     const answer = answerMatch[1].trim();
//     text = text.replace(answerMatch[0], `✅ *Answer:* ${answer}`);
//   }
  
//   return text;
// }

// // Format translation responses
// function formatTranslationResponse(text) {
//   if (!text.startsWith('🌐')) {
//     text = `🌐 *Translation:*\n${text}`;
//   }
  
//   return text;
// }

// // Format summary responses
// function formatSummaryResponse(text) {
//   if (!text.startsWith('📋')) {
//     text = `📋 *Summary:*\n${text}`;
//   }
  
//   // Ensure conciseness
//   const wordCount = text.split(' ').length;
//   if (wordCount > 150) {
//     const sentences = text.split(/[.!?]+/);
//     if (sentences.length > 4) {
//       text = sentences.slice(0, 4).join('.') + '.';
//     }
//   }
  
//   return text;
// }

// // Format comparison responses
// function formatCompareResponse(text) {
//   if (!text.startsWith('⚖️')) {
//     text = `⚖️ *Comparison:*\n${text}`;
//   }
  
//   // Add structure for pros/cons
//   text = text.replace(/pros:/gi, '✅ *Pros:*');
//   text = text.replace(/cons:/gi, '❌ *Cons:*');
//   text = text.replace(/advantages:/gi, '👍 *Advantages:*');
//   text = text.replace(/disadvantages:/gi, '👎 *Disadvantages:*');
  
//   return text;
// }

// // Format analysis responses
// function formatAnalysisResponse(text) {
//   if (!text.startsWith('🔍')) {
//     text = `🔍 *Analysis:*\n${text}`;
//   }
  
//   // Add structure
//   const sections = text.split(/(conclusion:|findings:|recommendation:|insights?:)/gi);
//   if (sections.length > 1) {
//     let formatted = '';
//     for (let i = 0; i < sections.length; i++) {
//       const section = sections[i].trim();
//       if (section.match(/conclusion:/i)) {
//         formatted += `📌 *Conclusion:*\n`;
//       } else if (section.match(/findings:/i)) {
//         formatted += `📊 *Findings:*\n`;
//       } else if (section.match(/recommendation:/i)) {
//         formatted += `💡 *Recommendation:*\n`;
//       } else if (section.match(/insights?:/i)) {
//         formatted += `🎯 *Insights:*\n`;
//       } else if (section) {
//         formatted += `${section}\n`;
//       }
//     }
//     text = formatted.trim();
//   }
  
//   return text;
// }

// // Format general responses
// function formatGeneralResponse(text, hasImage = false) {
//   // Add Gemini branding
//   if (!text.startsWith('🤖') && !text.startsWith('✨') && !text.startsWith('⚡')) {
//     if (hasImage) {
//       text = `✨ *Gemini (Multimodal):*\n${text}`;
//     } else {
//       text = `✨ *Gemini says:*\n${text}`;
//     }
//   }
  
//   return text;
// }

// // Detect if text is code-like
// function isCodeLike(text) {
//   const codePatterns = [
//     /function\s+\w+\s*\(/i,
//     /def\s+\w+\s*\(/i,
//     /class\s+\w+/i,
//     /import\s+|export\s+/i,
//     /const\s+|let\s+|var\s+/i,
//     /console\.|print\(|System\./i,
//     /if\s*\(|for\s*\(|while\s*\(/i,
//     /return\s+/i,
//     /<\?php|<\/?[a-z][^>]*>/i
//   ];
  
//   let score = 0;
//   for (const pattern of codePatterns) {
//     if (pattern.test(text)) {
//       score++;
//       if (score >= 2) return true;
//     }
//   }
  
//   return false;
// }

// // Detect programming language
// function detectProgrammingLanguage(text) {
//   const lowerText = text.toLowerCase();
  
//   if (lowerText.includes('def ') && lowerText.includes('print(')) return 'python';
//   if (lowerText.includes('function') && lowerText.includes('console.')) return 'javascript';
//   if (lowerText.includes('public class') || lowerText.includes('System.')) return 'java';
//   if (lowerText.includes('#include') || lowerText.includes('std::')) return 'cpp';
//   if (lowerText.includes('<?php')) return 'php';
//   if (lowerText.includes('<html') || lowerText.includes('<div')) return 'html';
//   if (lowerText.includes('SELECT') || lowerText.includes('FROM')) return 'sql';
  
//   return 'code';
// }