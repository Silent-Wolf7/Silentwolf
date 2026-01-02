import fetch from "node-fetch";

export default {
  name: "llama",
  alias: ["meta", "llama3", "wolfma"],
  desc: "Use Meta's Llama models via OpenRouter 🦙",
  category: "AI",
  usage: ".llama <your question>",
  cooldown: 3,

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();

    try {
      if (!query) {
        return sock.sendMessage(jid, {
          text: `🦙 *WolfBot Llama* 🧠\n\n` +
                `*Powered by WolfTech*\n\n` +
                `*Usage:* .llama <question>\n\n` +
                `*Available Models:*\n` +
                `• Llama 3.1 70B (default)\n` +
                `• Llama 3.1 8B (fast)\n` +
                `• Llama 3 70B\n\n` +
                `*Examples:*\n` +
                `• .llama Write a story\n` +
                `• .llama Explain AI\n` +
                `• .llama Code review\n\n` +
                `🐺 *WolfBot Enhanced*`
        }, { quoted: m });
      }

      // Get model choice if specified
      let model = "meta-llama/llama-3.1-70b-instruct";
      const argsLower = query.toLowerCase();
      
      if (argsLower.includes("--8b") || argsLower.includes("-fast")) {
        model = "meta-llama/llama-3.1-8b-instruct";
      } else if (argsLower.includes("--3")) {
        model = "meta-llama/llama-3-70b-instruct";
      }
      
      // Clean query from model flags
      const cleanQuery = query.replace(/--(8b|3|fast)/gi, "").trim();

      // Use your existing OpenRouter key
      const apiKey = getOpenRouterKey(); // Reuse from deepseek.js
      
      const processingMsg = await sock.sendMessage(jid, {
        text: `🦙 *Llama is thinking...*\n\n` +
              `Model: ${model.split('/').pop()}\n` +
              `Powered by WolfTech`
      }, { quoted: m });

      const result = await callOpenRouterLlama(cleanQuery, apiKey, model);

      if (!result.success) {
        return sock.sendMessage(jid, {
          text: `❌ *Llama Error*\n\n${result.error}`,
          edit: processingMsg.key
        });
      }

      const reply = formatLlamaResponse(result.reply, cleanQuery, result.model);
      
      await sock.sendMessage(jid, {
        text: reply,
        edit: processingMsg.key
      });

    } catch (err) {
      console.error("Llama error:", err);
      await sock.sendMessage(jid, {
        text: `❌ Error: ${err.message}`
      }, { quoted: m });
    }
  }
};

// Reuse your OpenRouter key function
function getOpenRouterKey() {
  // Copy the same function from deepseek.js
  const keyParts = [
    [115, 107, 45, 111, 114, 45, 118, 49, 45, 101, 54, 50, 53, 49, 100, 55, 50, 49, 102, 50, 51, 54, 54, 55, 98, 102, 98, 51, 97, 56, 98, 98, 97, 52, 49, 51, 51, 49, 50, 100, 53, 55, 53, 98, 57, 101, 49, 49, 55, 54, 55, 51, 100, 97, 99, 55, 50, 56, 97, 53, 54, 50, 97, 100, 57, 101, 101, 99, 48, 50, 101, 48, 52]
  ];
  return keyParts.map(part => part.map(c => String.fromCharCode(c)).join('')).join('');
}

async function callOpenRouterLlama(query, apiKey, model = "meta-llama/llama-3.1-70b-instruct") {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wolfbot.com"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are WolfBot Llama, an AI assistant powered by Meta's Llama model.
                     You are helpful, accurate, and friendly. 
                     Use emojis occasionally. Be concise but thorough.
                     If asked to write code, format it properly.
                     Sign off with 🦙 from WolfBot.`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "API error"
      };
    }

    return {
      success: true,
      reply: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage?.total_tokens
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function formatLlamaResponse(reply, query, model) {
  const modelName = model.split('/').pop().replace('-instruct', '');
  
  return `🦙 *WolfBot Llama* (${modelName})
━━━━━━━━━━━━━━━━

🗣️ *Question:*
${query.substring(0, 150)}${query.length > 150 ? '...' : ''}

━━━━━━━━━━━━━━━━

💭 *Response:*
${reply.substring(0, 3000)}

━━━━━━━━━━━━━━━━
*Powered by WolfTech*
🐺 *WolfBot AI Suite*`;
}