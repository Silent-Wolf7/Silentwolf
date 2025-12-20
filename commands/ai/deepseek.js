// commands/ai/deepseek.js
import fetch from "node-fetch";

export default {
  name: "deepseek",
  alias: ["ds", "ai", "ask"],
  desc: "Talk with DeepSeek AI via OpenRouter 🤖 (FREE CREDITS AVAILABLE)",
  category: "AI",
  usage: ".deepseek <your question>",
  async execute(sock, m, args) {
    try {
      const query = args.join(" ");
      if (!query) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "🤖 *DeepSeek AI Assistant*\n━━━━━━━━━━━━━━━━━\nI'm ready to help! Powered by DeepSeek through OpenRouter.\n\n*Usage:* .deepseek What is quantum computing?\n*Example:* .deepseek Write a Python function"
        }, { quoted: m });
      }

      // Use OpenRouter API key from .env
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "🔑 *API Key Missing*\n━━━━━━━━━━━━━━━━━\nAdd to your .env file:\n\nOPENROUTER_API_KEY=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\n\nThen restart your bot."
        }, { quoted: m });
      }

      // Show typing indicator
      await sock.sendPresenceUpdate('composing', m.key.remoteJid);

      // Call OpenRouter API (with DeepSeek model)
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://silent-wolf-bot.com", // Required by OpenRouter
          "X-Title": "Silent Wolf AI Bot" // Optional but good practice
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat", // Using DeepSeek through OpenRouter
          messages: [
            {
              role: "system",
              content: `You are Silent Wolf, a helpful AI assistant with a wolf-themed personality. You're wise, mysterious, and helpful. Provide accurate answers with a touch of wolf/wilderness metaphors when appropriate.

Guidelines:
1. Be concise but thorough
2. Format with *bold* for emphasis
3. Use emojis sparingly: 🐺✨🌲🌑
4. For code, use proper formatting
5. Keep answers under 1500 tokens`
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: false
        })
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API Error:", response.status, errorText);
        
        let errorMessage = "Unknown error";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.error || errorText;
        } catch (e) {
          errorMessage = errorText.substring(0, 200);
        }
        
        // Handle specific errors
        if (response.status === 429) {
          return sock.sendMessage(m.key.remoteJid, {
            text: "⏳ *Rate Limited*\nPlease wait 30 seconds before trying again.\n\nOpenRouter has rate limits to prevent abuse."
          }, { quoted: m });
        }
        
        if (response.status === 402) {
          return sock.sendMessage(m.key.remoteJid, {
            text: "💳 *Free Credits Used*\n━━━━━━━━━━━━━━━━━\nYou've used your 100 free credits!\n\n*Get more:*\n1. Visit https://openrouter.ai/account\n2. Click 'Add Credits' ($1 = ~500 requests)\n3. Or create new account with different email\n\n*Alternative:* Use .localai for completely free AI"
          }, { quoted: m });
        }
        
        if (response.status === 401) {
          return sock.sendMessage(m.key.remoteJid, {
            text: "🔐 *Invalid API Key*\nCheck your OPENROUTER_API_KEY in .env\n\nGet new key: https://openrouter.ai/api-keys"
          }, { quoted: m });
        }
        
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      // Parse successful response
      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || "No response generated.";
      
      // Get usage stats
      const usage = data.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || 0;
      const cost = data.usage?.total_cost || 0;

      // Format the reply
      const formattedReply = `
🐺✨ *Silent Wolf AI* 
━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━
📊 *Stats:* ${totalTokens} tokens (${promptTokens}→${completionTokens})
💰 *Cost:* $${cost.toFixed(6)}
🤖 *Model:* DeepSeek Chat
🔗 *Via:* OpenRouter
`;

      // Send the response
      await sock.sendMessage(m.key.remoteJid, { text: formattedReply }, { quoted: m });

    } catch (err) {
      console.error("DeepSeek Error:", err);
      
      // User-friendly error message
      let errorMessage = err.message;
      if (err.message.includes("fetch failed") || err.message.includes("network")) {
        errorMessage = "Network error. Check your internet connection.";
      }
      
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ *AI Service Error*\n━━━━━━━━━━━━━━━━━\n${errorMessage}\n\n*Troubleshooting:*\n1. Check if API key is valid\n2. Visit https://openrouter.ai/activity to see credits\n3. Try .ai command for other options`
      }, { quoted: m });
    }
  }
};