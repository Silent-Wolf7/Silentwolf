import axios from 'axios';

export default {
  name: 'gpt',
  description: 'GPT-5 AI assistant for advanced conversations',
  category: 'ai',
  aliases: ['gpt5', 'ai5', 'askgpt', 'wolfai'],
  usage: 'gpt [question] or [command]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const senderJid = m.key.participant || jid;
    
    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === 'help') {
      const helpText = `🤖 *WOLFBOT GPT-5*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}gpt your question\`\n` +
        `• \`${PREFIX}gpt5 hello\`\n` +
        `• \`${PREFIX}ai5 how are you?\`\n\n` +        
``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== SPECIAL COMMANDS ======
    const specialCommands = {
      'code': 'code',
      'program': 'code',
      'coding': 'code',
      'creative': 'creative',
      'write': 'creative',
      'story': 'creative',
      'explain': 'explain',
      'whatis': 'explain',
      'define': 'explain'
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
        case 'code':
          enhancedPrompt = `You are an expert programmer. Provide clean, efficient code with explanations. Format code in code blocks. Question: ${query}`;
          break;
        case 'creative':
          enhancedPrompt = `You are a creative writer. Be imaginative, descriptive, and engaging. Write: ${query}`;
          break;
        case 'explain':
          enhancedPrompt = `You are a patient teacher. Explain clearly with examples and analogies. Topic: ${query}`;
          break;
      }
    } else {
      enhancedPrompt = query;
    }

    try {
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `⚡ *WOLFBOT GPT-5*\n\n` +
              `🚀 *Initializing GPT-5...*\n\n` +
              `📝 "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`
      }, { quoted: m });

      // ====== API REQUEST ======
      const apiUrl = 'https://iamtkm.vercel.app/ai/gpt5';
      const apiKey = 'tkm';
      
      console.log(`🤖 GPT-5 Query [${mode}]: ${query}`);
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          apikey: apiKey,
          text: enhancedPrompt || query
        },
        timeout: 35000, // 35 seconds for GPT-5
        headers: {
          'User-Agent': 'WolfBot-GPT5/1.0',
          'Accept': 'application/json',
          'X-Requested-With': 'WolfBot'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      console.log(`✅ GPT-5 Response status: ${response.status}`);
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `⚡ *WOLFBOT GPT-5*\n` +
              `🚀 *Initializing...* ✅\n` +
              `🧠 *Processing with GPT-5...*\n` +
              `⚡ *Generating response...*`,
        edit: statusMsg.key
      });

      // ====== PARSE RESPONSE ======
      let aiResponse = '';
      let metadata = {
        creator: 'Unknown',
        model: 'GPT-5',
        tokens: 'N/A'
      };
      
      if (response.data && typeof response.data === 'object') {
        const data = response.data;
        
        // Extract based on expected structure
        if (data.status === true && data.result) {
          aiResponse = data.result;
          metadata.creator = data.creator || 'cod3uchiha';
        } else if (data.response) {
          aiResponse = data.response;
        } else if (data.answer) {
          aiResponse = data.answer;
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          // OpenAI-like format
          aiResponse = data.choices[0].message.content;
          metadata.model = data.model || 'GPT-5';
          metadata.tokens = data.usage?.total_tokens || 'N/A';
        } else {
          // Fallback: try to extract any text
          aiResponse = JSON.stringify(data, null, 2).substring(0, 1500);
        }
      } else if (typeof response.data === 'string') {
        aiResponse = response.data;
      } else {
        aiResponse = 'GPT-5 is currently unavailable. Please try again later.';
      }
      
      // Format code blocks for WhatsApp
      aiResponse = formatResponse(aiResponse, mode);
      
      // Truncate if too long
      if (aiResponse.length > 2500) {
        aiResponse = aiResponse.substring(0, 2500) + '\n\n... (response truncated due to length)';
      }

      // ====== FORMAT FINAL MESSAGE ======
      let resultText = `🤖 *WOLFBOT GPT-5*\n\n`;
      
      // Mode indicator
      if (mode !== 'general') {
        const modeIcons = {
          'code': '👨‍💻',
          'creative': '🎨',
          'explain': '👨‍🏫'
        };
        resultText += `${modeIcons[mode] || '⚡'} *Mode:* ${mode.toUpperCase()}\n\n`;
      }
      
      // Question (truncated if long)
      const displayQuery = query.length > 80 ? query.substring(0, 80) + '...' : query;
      resultText += `🎯 *Question:* ${displayQuery}\n\n`;
      
      // AI Response
      resultText += `✨ *GPT-5 Response:*\n${aiResponse}\n\n`;
      
      // Metadata
      // resultText += `📊 *Response Info:*\n`;
      // resultText += `• Model: ${metadata.model}\n`;
      // resultText += `• Creator: ${metadata.creator}\n`;
      // if (metadata.tokens !== 'N/A') {
      //   resultText += `• Tokens: ${metadata.tokens}\n`;
      // }
      // resultText += `• Status: ✅ Success\n\n`;
      
      // Tips based on mode
      // resultText += `💡 *Tips:*\n`;
      // switch(mode) {
      //   case 'code':
      //     resultText += `• Use \`${PREFIX}gpt code\` for programming help\n`;
      //     resultText += `• Specify language for better results\n`;
      //     resultText += `• Ask for explanations of code\n`;
      //     break;
      //   case 'creative':
      //     resultText += `• Use \`${PREFIX}gpt creative\` for writing\n`;
      //     resultText += `• Be descriptive in your prompts\n`;
      //     resultText += `• Ask for different styles\n`;
      //     break;
      //   case 'explain':
      //     resultText += `• Use \`${PREFIX}gpt explain\` for explanations\n`;
      //     resultText += `• Ask follow-up questions\n`;
      //     resultText += `• Request examples\n`;
      //     break;
      //   default:
      //     resultText += `• Use \`${PREFIX}gpt code\` for programming\n`;
      //     resultText += `• Use \`${PREFIX}gpt creative\` for writing\n`;
      //     resultText += `• Use \`${PREFIX}gpt explain\` for explanations\n`;
      // }
      
      resultText += `\n⚡ *Powered by WOLFTECH*`;

      // ====== SEND FINAL ANSWER ======
      await sock.sendMessage(jid, {
        text: resultText,
        edit: statusMsg.key
      });

    } catch (error) {
      console.error('❌ [GPT-5] ERROR:', error);
      
      let errorMessage = `❌ *GPT-5 ERROR*\n\n`;
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += `• GPT-5 API server is down\n`;
        errorMessage += `• Please try again later\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• GPT-5 thinking time exceeded (35s)\n`;
        errorMessage += `• Complex queries may take longer\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Rate limit exceeded\n`;
        errorMessage += `• Too many GPT-5 requests\n`;
        errorMessage += `• Wait 1-2 minutes\n`;
      } else if (error.response?.status === 503) {
        errorMessage += `• GPT-5 service overloaded\n`;
        errorMessage += `• Try simpler questions\n`;
      } else if (error.response?.data) {
        // Try to extract API error message
        try {
          const apiError = error.response.data;
          if (apiError.error) {
            errorMessage += `• API Error: ${apiError.error}\n`;
          }
        } catch (e) {
          errorMessage += `• Error: ${error.message}\n`;
        }
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n🔧 *Troubleshooting:*\n`;
      errorMessage += `1. Try shorter/simpler questions\n`;
      errorMessage += `2. Wait 1 minute before retrying\n`;
      errorMessage += `3. Check internet connection\n`;
      errorMessage += `4. Use \`${PREFIX}copilot\` as alternative\n`;
      
      // Send error message
      try {
        if (m.messageId) {
          await sock.sendMessage(jid, {
            text: errorMessage,
            edit: m.messageId
          });
        } else {
          await sock.sendMessage(jid, {
            text: errorMessage
          }, { quoted: m });
        }
      } catch (sendError) {
        await sock.sendMessage(jid, {
          text: '❌ GPT-5 service is currently unavailable.'
        }, { quoted: m });
      }
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Format response based on mode
function formatResponse(text, mode) {
  if (!text) return '';
  
  // For code mode, ensure code blocks are properly formatted
  if (mode === 'code') {
    // Check if text already has code blocks
    if (!text.includes('```')) {
      // Add code blocks if missing
      const lines = text.split('\n');
      let inCode = false;
      const formattedLines = [];
      
      for (const line of lines) {
        // Detect code-like lines (indented or containing programming keywords)
        if (isCodeLine(line) && !inCode) {
          formattedLines.push('```');
          inCode = true;
        } else if (!isCodeLine(line) && inCode) {
          formattedLines.push('```');
          inCode = false;
        }
        formattedLines.push(line);
      }
      
      if (inCode) {
        formattedLines.push('```');
      }
      
      return formattedLines.join('\n');
    }
  }
  
  // For creative mode, ensure proper paragraph breaks
  if (mode === 'creative') {
    return text.replace(/\n\s*\n/g, '\n\n');
  }
  
  return text;
}

// Detect if a line looks like code
function isCodeLine(line) {
  const codeIndicators = [
    'function', 'def ', 'class ', 'import ', 'export ', 'const ', 'let ', 'var ',
    'if (', 'for (', 'while (', 'return ', 'console.log', 'print(', 'System.out',
    'public ', 'private ', 'protected ', 'void ', 'int ', 'string ', 'bool',
    '#include', 'using ', 'namespace ', '<?php', '<html', '<script', 'css',
    'python', 'javascript', 'java', 'c++', 'c#', 'php', 'html', 'css', 'sql'
  ];
  
  const trimmedLine = line.trim().toLowerCase();
  
  // Check for indentation (common in code)
  if (line.startsWith('    ') || line.startsWith('\t')) {
    return true;
  }
  
  // Check for code keywords
  for (const indicator of codeIndicators) {
    if (trimmedLine.includes(indicator.toLowerCase())) {
      return true;
    }
  }
  
  // Check for common code patterns
  if (trimmedLine.includes('=') && trimmedLine.includes(';')) {
    return true;
  }
  
  if (trimmedLine.includes('(') && trimmedLine.includes(')') && trimmedLine.includes('{')) {
    return true;
  }
  
  return false;
}