import axios from 'axios';

export default {
  name: 'copilot',
  description: 'AI-powered assistant using Copilot API',
  category: 'ai',
 // aliases: ['ai', 'ask', 'gpt', 'chat'],
  usage: 'copilot [your question]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    try {
      // ====== HELP SECTION ======
      if (args.length === 0) {
        return sock.sendMessage(jid, {
          text: `🤖 *WOLFBOT COPILOT*\n\n` +
                `💡 *Usage:*\n` +
                `• \`${PREFIX}copilot Hello\`\n` +
                `• \`${PREFIX}copilot what is quantum computing\`\n` +
                `• \`${PREFIX}copilot write a poem about moon\`\n` +
                `• \`${PREFIX}copilot explain prada and sonata\`\n` +
                ``
        }, { quoted: m });
      }

      const query = args.join(' ');
      
      // ====== PROCESSING MESSAGE ======
      const statusMsg = await sock.sendMessage(jid, {
        text: `🤖 *WOLFBOT COPILOT*\n\n` +
              `💭 *Processing your request...*\n\n` +
              `🔍 "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`
      }, { quoted: m });

      console.log(`🤖 Copilot query: "${query}"`);
      
      // ====== API REQUEST ======
      const apiUrl = 'https://iamtkm.vercel.app/ai/copilot';
      const apiKey = 'tkm';
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          apikey: apiKey,
          text: query
        },
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
        }
      });

      console.log(`✅ Copilot API response:`, response.data);
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `🤖 *WOLFBOT COPILOT*` +
              `💭 *Processing...* ✅` +
              `⚡ *Formatting response...*`,
        edit: statusMsg.key
      });

      // ====== PARSE RESPONSE ======
      let aiResponse = '';
      let creator = 'Unknown';
      let citations = [];
      
      if (response.data && typeof response.data === 'object') {
        // Extract from the exact JSON structure we saw
        const data = response.data;
        
        if (data.status === true && data.result) {
          aiResponse = data.result;
          creator = data.creator || 'cod3uchiha';
          
          if (data.citations && Array.isArray(data.citations)) {
            citations = data.citations;
          }
        } else if (data.response) {
          aiResponse = data.response;
        } else if (data.answer) {
          aiResponse = data.answer;
        } else {
          // Fallback: stringify the response
          aiResponse = JSON.stringify(data, null, 2);
        }
      } else if (typeof response.data === 'string') {
        aiResponse = response.data;
      } else {
        aiResponse = 'No valid response received from AI.';
      }
      
      // Clean up the response if needed
      aiResponse = aiResponse.trim();
      
      // ====== FORMAT FINAL MESSAGE ======
      let resultText = `🤖 *WOLFBOT COPILOT*\n\n`;
      
      // Show question (truncated if too long)
      if (query.length > 100) {
        resultText += `🎯 *Question:*\n${query.substring(0, 100)}...\n\n`;
      } else {
        resultText += `🎯 *Question:*\n${query}\n\n`;
      }
      
      // Add AI response
      resultText += `✨ *Answer:*\n${aiResponse}\n\n`;
      
    //   // Add metadata
    //   resultText += `📊 *Response Info:*\n`;
    //   resultText += `• Creator: ${creator}\n`;
    //   resultText += `• Status: ✅ Success\n`;
      
    //   if (citations.length > 0) {
    //     resultText += `• Citations: ${citations.length} source(s)\n`;
    //   }
      
    //   resultText += `• API: iamtkm.vercel.app\n\n`;
      
    //   // Add conversation tips
    //   resultText += `💡 *Tips for better responses:*\n`;
    //   resultText += `• Be specific with your questions\n`;
    //   resultText += `• Ask follow-up questions\n`;
    //   resultText += `• Try creative or technical topics\n`;
    //   resultText += `• Use \`${PREFIX}copilot\` for anything!\n\n`;
      
      resultText += `⚡ *Powered by WolfTech*`;
      
      // ====== SEND FINAL ANSWER ======
      await sock.sendMessage(jid, {
        text: resultText,
        edit: statusMsg.key
      });

    } catch (error) {
      console.error('❌ [COPILOT] ERROR:', error);
      
      let errorMessage = `❌ *COPILOT ERROR*\n\n`;
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += `• API server is down\n`;
        errorMessage += `• Please try again later\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• Request timeout (30s)\n`;
        errorMessage += `• AI is thinking too long\n`;
      } else if (error.response?.status === 404) {
        errorMessage += `• API endpoint not found\n`;
      } else if (error.response?.status === 429) {
        errorMessage += `• Rate limited\n`;
        errorMessage += `• Too many requests\n`;
        errorMessage += `• Wait a few minutes\n`;
      } else if (error.response?.data) {
        // Show API error message if available
        const apiError = error.response.data;
        if (apiError.error || apiError.message) {
          errorMessage += `• API Error: ${apiError.error || apiError.message}\n`;
        }
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n🔧 *Troubleshooting:*\n`;
      errorMessage += `1. Check your internet connection\n`;
      errorMessage += `2. Try simpler/shorter questions\n`;
      errorMessage += `3. Wait 1-2 minutes and retry\n`;
      errorMessage += `4. Contact bot admin if persistent`;
      
      // Try to send error with edit
      try {
        await sock.sendMessage(jid, {
          text: errorMessage,
          edit: m.messageId || null
        });
      } catch (editError) {
        // Fallback to new message
        await sock.sendMessage(jid, {
          text: errorMessage
        }, { quoted: m });
      }
    }
  },
};