import axios from 'axios';

export default {
  name: 'bard',
  description: 'Google Bard AI - Conversational AI by Google',
  category: 'ai',
  aliases: ['bardai', 'googlebard', 'gbard', 'googai', 'palm', 'palm2'],
  usage: 'bard [question or conversation]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const senderJid = m.key.participant || jid;
    
    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === 'help') {
      const helpText = `🤖 *GOOGLE BARD AI*\n` +
        `⚡ *Google\'s Conversational AI Assistant*\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}bard your question\`\n` +
        `• \`${PREFIX}bard hello\`\n` +
        `• \`${PREFIX}bard explain something\`\n` +
       ``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== SPECIAL COMMANDS ======
    const specialCommands = {
      'search': 'search',
      'news': 'news',
      'weather': 'weather',
      'define': 'define',
      'meaning': 'define',
      'whois': 'whois',
      'whatis': 'whatis',
      'latest': 'latest',
      'update': 'latest',
      'current': 'current',
      'code': 'code',
      'program': 'code',
      'write': 'write',
      'email': 'write',
      'letter': 'write',
      'explain': 'explain',
      'howto': 'howto',
      'guide': 'howto',
      'translate': 'translate',
      'convert': 'convert',
      'calculate': 'calculate',
      'math': 'calculate'
    };

    let query = args.join(' ');
    let mode = 'general';
    let enhancedPrompt = '';

    // Check for special command modes
    const firstWord = args[0].toLowerCase();
    if (specialCommands[firstWord]) {
      mode = specialCommands[firstWord];
      query = args.slice(1).join(' ');
      
      switch(mode) {
        case 'search':
          enhancedPrompt = `Search for up-to-date information: ${query}`;
          break;
        case 'news':
          enhancedPrompt = `Provide latest news about: ${query}`;
          break;
        case 'weather':
          enhancedPrompt = `Get weather information for: ${query}`;
          break;
        case 'define':
          enhancedPrompt = `Define or explain meaning of: ${query}`;
          break;
        case 'whois':
          enhancedPrompt = `Provide information about person/entity: ${query}`;
          break;
        case 'whatis':
          enhancedPrompt = `Explain what is: ${query}`;
          break;
        case 'latest':
          enhancedPrompt = `Latest updates/information about: ${query}`;
          break;
        case 'current':
          enhancedPrompt = `Current status/information about: ${query}`;
          break;
        case 'code':
          enhancedPrompt = `Write code for: ${query}. Include comments.`;
          break;
        case 'write':
          enhancedPrompt = `Write professionally: ${query}`;
          break;
        case 'explain':
          enhancedPrompt = `Explain in detail: ${query}`;
          break;
        case 'howto':
          enhancedPrompt = `Provide step-by-step guide: ${query}`;
          break;
        case 'translate':
          enhancedPrompt = `Translate: ${query}`;
          break;
        case 'convert':
          enhancedPrompt = `Convert/calculate: ${query}`;
          break;
        case 'calculate':
          enhancedPrompt = `Calculate/mathematical solution: ${query}`;
          break;
      }
    } else {
      enhancedPrompt = query;
    }

    try {
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `⚡ *GOOGLE BARD*\n` +
              `🚀 *Connecting to Google AI...*\n` +
              `📝 "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`
      }, { quoted: m });

      // ====== API REQUEST (Using Keith's Bard API) ======
      const apiUrl = 'https://apiskeith.vercel.app/ai/bard';
      
      console.log(`🤖 Bard Query [${mode}]: ${query}`);
      console.log(`🔗 Using API: ${apiUrl}`);
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          q: enhancedPrompt || query
        },
        timeout: 30000, // 30 seconds for Google AI
        headers: {
          'User-Agent': 'WolfBot-Bard/1.0 (Google-AI-Assistant)',
          'Accept': 'application/json',
          'X-Requested-With': 'WolfBot',
          'Referer': 'https://apiskeith.vercel.app/',
          'Origin': 'https://apiskeith.vercel.app',
          'Cache-Control': 'no-cache'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      console.log(`✅ Bard Response status: ${response.status}`);
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `⚡ *GOOGLE BARD*\n` +
              `🚀 *Connecting...* ✅\n` +
              `🔍 *Searching Google AI...*\n` +
              `⚡ *Generating intelligent response...*`,
        edit: statusMsg.key
      });

      // ====== PARSE RESPONSE ======
      let aiResponse = '';
      let metadata = {
        creator: 'Google AI',
        model: 'Bard/PaLM 2',
        status: true,
        source: 'Keith API'
      };
      
      // Parse Keith API response format
      if (response.data && typeof response.data === 'object') {
        const data = response.data;
        
        console.log('📊 Bard API Response structure:', Object.keys(data));
        
        // Extract based on Keith API structure
        if (data.status === true && data.result) {
          aiResponse = data.result;
          console.log('✅ Using data.result');
        } else if (data.response) {
          aiResponse = data.response;
          console.log('✅ Using data.response');
        } else if (data.answer) {
          aiResponse = data.answer;
          console.log('✅ Using data.answer');
        } else if (data.text) {
          aiResponse = data.text;
          console.log('✅ Using data.text');
        } else if (data.content) {
          aiResponse = data.content;
          console.log('✅ Using data.content');
        } else if (data.message) {
          aiResponse = data.message;
          console.log('✅ Using data.message');
        } else if (data.data) {
          aiResponse = data.data;
          console.log('✅ Using data.data');
        } else if (data.error) {
          // API returned an error
          console.log('❌ API error:', data.error);
          throw new Error(data.error || 'Bard API returned error');
        } else {
          // Try to extract any text
          console.log('🔍 Attempting to extract text from response object');
          aiResponse = extractBardResponse(data);
        }
      } else if (typeof response.data === 'string') {
        console.log('✅ Response is string');
        aiResponse = response.data;
      } else {
        console.log('❌ Invalid response format');
        throw new Error('Invalid API response format');
      }
      
      // Check if response is empty
      if (!aiResponse || aiResponse.trim() === '') {
        console.log('❌ Empty response');
        throw new Error('Bard returned empty response');
      }
      
      // Clean response
      aiResponse = aiResponse.trim();
      console.log(`📝 Response length: ${aiResponse.length} characters`);
      
      // Check for error indicators
      const lowerResponse = aiResponse.toLowerCase();
      if (lowerResponse.includes('error:') || 
          lowerResponse.startsWith('error') ||
          lowerResponse.includes('failed to') ||
          lowerResponse.includes('unavailable') ||
          lowerResponse.includes('not found')) {
        console.log('❌ Response contains error indicator');
        throw new Error(aiResponse);
      }
      
      // Format response based on mode
      aiResponse = formatBardResponse(aiResponse, mode, query);
      
      // Truncate if too long for WhatsApp
      if (aiResponse.length > 2500) {
        aiResponse = aiResponse.substring(0, 2500) + '\n\n... (response truncated for WhatsApp)';
      }

      // ====== FORMAT FINAL MESSAGE ======
      let resultText = `🤖 *GOOGLE BARD AI*\n\n`;
      
      // Mode indicator with emoji
      if (mode !== 'general') {
        const modeIcons = {
          'search': '🔍',
          'news': '📰',
          'weather': '🌤️',
          'define': '📖',
          'whois': '👤',
          'whatis': '❓',
          'latest': '🔄',
          'current': '⏱️',
          'code': '💻',
          'write': '✍️',
          'explain': '📚',
          'howto': '📋',
          'translate': '🌐',
          'convert': '🔄',
          'calculate': '🧮'
        };
        const modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1);
        resultText += `${modeIcons[mode] || '⚡'} *Mode:* ${modeDisplay}\n\n`;
      }
      
      // Query display
      const displayQuery = query.length > 80 ? query.substring(0, 80) + '...' : query;
      resultText += `🎯 *Query:* ${displayQuery}\n\n`;
      
      // Bard Response
      resultText += `✨ *Bard\'s Response:*\n${aiResponse}\n\n`;
      
      // Footer with Google branding
      resultText += `⚡ *Powered by Google Bard AI*\n`;
      //resultText += `🔗 *via Keith API*\n`;
      resultText += `🌐 *Real-time information*`;

      // ====== SEND FINAL ANSWER ======
      console.log('📤 Sending final response to WhatsApp');
      await sock.sendMessage(jid, {
        text: resultText,
        edit: statusMsg.key
      });

      console.log(`✅ Bard response sent successfully`);

    } catch (error) {
      console.error('❌ [Google Bard] ERROR:', error);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = `❌ *GOOGLE BARD ERROR*\n\n`;
      
      // Detailed error handling
      if (error.code === 'ECONNREFUSED') {
        errorMessage += `• Bard API server is down\n`;
        errorMessage += `• Google AI service unavailable\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• Request timed out (30s)\n`;
        errorMessage += `• Google AI is processing\n`;
        errorMessage += `• Try simpler query\n`;
      } else if (error.code === 'ENOTFOUND') {
        errorMessage += `• Cannot connect to Bard API\n`;
        errorMessage += `• Check internet connection\n`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += `• Connection aborted\n`;
        errorMessage += `• Network issue detected\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Rate limit exceeded\n`;
        errorMessage += `• Too many Bard requests\n`;
        errorMessage += `• Wait 2-3 minutes\n`;
      } else if (error.response?.status === 404) {
        errorMessage += `• Bard endpoint not found\n`;
        errorMessage += `• API may have changed\n`;
      } else if (error.response?.status === 500) {
        errorMessage += `• Google AI internal error\n`;
        errorMessage += `• Service temporarily down\n`;
      } else if (error.response?.status === 403) {
        errorMessage += `• Access forbidden\n`;
        errorMessage += `• API key may be invalid\n`;
      } else if (error.response?.status === 400) {
        errorMessage += `• Bad request to Bard\n`;
        errorMessage += `• Query may be malformed\n`;
      } else if (error.response?.data) {
        // Extract API error
        const apiError = error.response.data;
        console.log('📊 API Error response:', apiError);
        
        if (apiError.error) {
          errorMessage += `• Bard Error: ${apiError.error}\n`;
        } else if (apiError.message) {
          errorMessage += `• Error: ${apiError.message}\n`;
        } else if (apiError.details) {
          errorMessage += `• Details: ${apiError.details}\n`;
        } else if (typeof apiError === 'string') {
          errorMessage += `• Error: ${apiError}\n`;
        }
      } else if (error.message) {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n🔧 *Troubleshooting:*\n`;
      errorMessage += `1. Try simpler/shorter query\n`;
      errorMessage += `2. Wait 1-2 minutes before retry\n`;
      errorMessage += `3. Check internet connection\n`;
      errorMessage += `4. Use other AI commands:\n`;
      errorMessage += `   • \`${PREFIX}gpt\` - GPT-5\n`;
      errorMessage += `   • \`${PREFIX}metai\` - Meta AI\n`;
      errorMessage += `   • \`${PREFIX}mistral\` - Mistral AI\n`;
      errorMessage += `5. Try rephrasing your question\n`;
      
      // Try to send error message
      try {
        console.log('📤 Sending error message to user');
        await sock.sendMessage(jid, {
          text: errorMessage
        }, { quoted: m });
      } catch (sendError) {
        console.error('❌ Failed to send error message:', sendError);
      }
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Extract text from Bard API response
function extractBardResponse(obj, depth = 0) {
  if (depth > 3) return 'Response too complex';
  
  // If it's a string, return it
  if (typeof obj === 'string') {
    return obj;
  }
  
  // If array, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => extractBardResponse(item, depth + 1))
              .filter(text => text && text.trim())
              .join('\n');
  }
  
  // If object, look for common response fields
  if (obj && typeof obj === 'object') {
    // Priority fields for Bard/Google AI
    const priorityFields = [
      'result', 'response', 'answer', 'text', 'content', 
      'message', 'output', 'choices', 'candidates'
    ];
    
    for (const field of priorityFields) {
      if (obj[field]) {
        const extracted = extractBardResponse(obj[field], depth + 1);
        if (extracted && extracted.trim()) {
          return extracted;
        }
      }
    }
    
    // Try to extract from any string property
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].trim()) {
        return obj[key];
      }
    }
    
    // Try to stringify the object
    try {
      const stringified = JSON.stringify(obj, null, 2);
      if (stringified.length < 1000) {
        return stringified;
      }
    } catch (e) {
      // Ignore stringify errors
    }
  }
  
  return 'Could not extract response from API';
}

// Format Bard response based on mode
function formatBardResponse(text, mode, originalQuery) {
  if (!text) return 'No response received from Google Bard';
  
  // Clean up
  text = text.trim();
  
  // Remove excessive markdown
  text = cleanGoogleResponse(text);
  
  // Special formatting based on mode
  switch(mode) {
    case 'search':
    case 'news':
    case 'latest':
    case 'current':
      text = formatSearchResponse(text);
      break;
    case 'weather':
      text = formatWeatherResponse(text);
      break;
    case 'define':
    case 'whois':
    case 'whatis':
      text = formatDefinitionResponse(text);
      break;
    case 'code':
      text = formatCodeResponse(text);
      break;
    case 'write':
      text = formatWritingResponse(text);
      break;
    case 'explain':
    case 'howto':
      text = formatExplanationResponse(text);
      break;
    case 'translate':
      text = formatTranslationResponse(text);
      break;
    case 'calculate':
    case 'convert':
      text = formatCalculationResponse(text);
      break;
    default:
      text = formatGeneralResponse(text);
  }
  
  // Ensure proper spacing for WhatsApp
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return text;
}

// Clean Google/Bard response
function cleanGoogleResponse(text) {
  // Remove Google-specific formatting
  text = text.replace(/\[\d+\]/g, ''); // Remove citation numbers [1], [2], etc.
  text = text.replace(/^Google: /gmi, '');
  text = text.replace(/^Bard: /gmi, '');
  
  // Clean markdown
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  
  return text;
}

// Format search/news responses
function formatSearchResponse(text) {
  // Add timestamp for news/search results
  const now = new Date();
  const timestamp = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  return `🔍 *Latest Information (${timestamp}):*\n${text}`;
}

// Format weather responses
function formatWeatherResponse(text) {
  // Add weather emoji if not present
  const weatherEmojis = ['☀️', '🌤️', '⛅', '🌧️', '⛈️', '❄️', '🌪️', '🌫️'];
  let hasWeatherEmoji = false;
  
  for (const emoji of weatherEmojis) {
    if (text.includes(emoji)) {
      hasWeatherEmoji = true;
      break;
    }
  }
  
  if (!hasWeatherEmoji && !text.startsWith('🌤️')) {
    text = `🌤️ *Weather Report:*\n${text}`;
  }
  
  return text;
}

// Format definition responses
function formatDefinitionResponse(text) {
  if (!text.startsWith('📖') && !text.startsWith('❓')) {
    text = `📖 *Definition/Information:*\n${text}`;
  }
  
  return text;
}

// Format code responses
function formatCodeResponse(text) {
  // Check for code blocks
  if (!text.includes('```')) {
    // Add code blocks if looks like code
    if (isCodeLike(text)) {
      // Try to detect language
      const language = detectProgrammingLanguage(text);
      text = `💻 *${language} Code:*\n\`\`\`${language}\n${text}\n\`\`\``;
    }
  }
  
  return text;
}

// Detect if text is code-like
function isCodeLike(text) {
  const codePatterns = [
    /function\s+\w+\s*\(/i,
    /def\s+\w+\s*\(/i,
    /class\s+\w+/i,
    /import\s+/i,
    /export\s+/i,
    /const\s+|let\s+|var\s+/i,
    /console\.log|print\(|System\.out/i,
    /if\s*\(|for\s*\(|while\s*\(/i,
    /return\s+/i,
    /<\?php|<\/?[a-z][^>]*>/i
  ];
  
  let score = 0;
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      score++;
      if (score >= 2) return true;
    }
  }
  
  return false;
}

// Detect programming language
function detectProgrammingLanguage(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('function') && !lowerText.includes('def ')) return 'javascript';
  if (lowerText.includes('def ')) return 'python';
  if (lowerText.includes('public class') || lowerText.includes('System.out')) return 'java';
  if (lowerText.includes('#include') || lowerText.includes('using namespace')) return 'cpp';
  if (lowerText.includes('<?php')) return 'php';
  if (lowerText.includes('<html') || lowerText.includes('<div')) return 'html';
  
  return 'code';
}

// Format writing responses
function formatWritingResponse(text) {
  if (!text.startsWith('✍️')) {
    text = `✍️ *Professional Writing:*\n${text}`;
  }
  
  return text;
}

// Format explanation responses
function formatExplanationResponse(text) {
  // Add step numbers if it's a guide
  const lines = text.split('\n');
  if (lines.length > 3) {
    const stepLines = lines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed && (trimmed.toLowerCase().startsWith('step') || 
                     trimmed.match(/^\d+[\.\)]/) ||
                     trimmed.includes(':'))) {
        return `📌 ${trimmed}`;
      }
      return line;
    });
    text = stepLines.join('\n');
  }
  
  if (!text.startsWith('📚')) {
    text = `📚 *Detailed Explanation:*\n${text}`;
  }
  
  return text;
}

// Format translation responses
function formatTranslationResponse(text) {
  if (!text.startsWith('🌐')) {
    text = `🌐 *Translation:*\n${text}`;
  }
  
  return text;
}

// Format calculation responses
function formatCalculationResponse(text) {
  // Highlight final answer
  const answerMatch = text.match(/(?:answer|result|solution|equals?)[:\s]*([^.\n]+)/i);
  if (answerMatch) {
    const answer = answerMatch[1].trim();
    text = text.replace(answerMatch[0], `✅ *Answer:* ${answer}`);
  }
  
  if (!text.startsWith('🧮')) {
    text = `🧮 *Calculation:*\n${text}`;
  }
  
  return text;
}

// Format general responses
function formatGeneralResponse(text) {
  // Add Bard branding if not present
  if (!text.startsWith('🤖') && !text.startsWith('✨') && !text.startsWith('⚡')) {
    text = `✨ *Bard says:*\n${text}`;
  }
  
  return text;
}