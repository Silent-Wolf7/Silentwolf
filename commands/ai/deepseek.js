// commands/ai/deepseek.js
import fetch from "node-fetch";

export default {
  name: "deepseek",
  alias: ["ds", "wolfseek", "deepai", "deep", "wolf"],
  desc: "Talk with WolfBot's DeepSeek AI via OpenRouter 🐺🧠",
  category: "AI",
  usage: ".deepseek <your question>",
  cooldown: 2,

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();

    try {
      // Check if user provided query
      if (!query) {
        return sock.sendMessage(jid, {
          text: `🐺 *WolfBot DeepSeek* 🧠\n\n` +
                `*Powered by WolfTech*\n\n` +
                `*Usage:* .deepseek <your question>\n\n` +
                `*Examples:*\n` +
                `• deepseek Explain quantum computing\n` +
                `• deepseek Write Python code\n` +
                `• deepseek Solve math problem\n\n` +
                `🐺 *WolfBot Enhanced*`
        }, { quoted: m });
      }

      // Validate query length
      if (query.length > 8000) {
        return sock.sendMessage(jid, {
          text: "❌ *Query too long!*\n\nMaximum 8000 characters allowed."
        }, { quoted: m });
      }

      // Get API key from embedded function
      const apiKey = getOpenRouterKey();
      
      if (!apiKey || !apiKey.startsWith('sk-or-v1')) {
        return sock.sendMessage(jid, {
          text: `⚠️ *API Configuration*\n\n` +
                `OpenRouter API key needs setup.\n` +
                `Contact WolfBot administrator.`
        }, { quoted: m });
      }

      // Check cooldown
      const cooldown = checkCooldown(m.sender, this.cooldown);
      if (!cooldown.allowed) {
        return sock.sendMessage(jid, {
          text: `⏳ *Please wait*\n\n` +
                `Cooldown: ${cooldown.remaining}s remaining\n` +
                `WolfBot is thinking... 🐺`
        }, { quoted: m });
      }

      // Send processing message
      const processingMsg = await sock.sendMessage(jid, {
        text: "🌌 *WolfBot is thinking with DeepSeek...*\n\n" +
              "Powered by OpenRouter API 🧠"
      }, { quoted: m });

      // Call OpenRouter API for DeepSeek
      const result = await callOpenRouter(query, apiKey, "deepseek/deepseek-chat");

      if (!result.success) {
        let errorAction = "Try rephrasing your question";
        let errorEmoji = "❌";
        
        if (result.error?.includes("rate limit") || result.error?.includes("quota")) {
          errorAction = "Wait a few minutes and try again";
          errorEmoji = "⏳";
        } else if (result.error?.includes("key") || result.error?.includes("auth")) {
          errorAction = "Contact bot administrator";
          errorEmoji = "🔑";
        } else if (result.error?.includes("context")) {
          errorAction = "Make your question shorter";
          errorEmoji = "📝";
        }
        
        return sock.sendMessage(jid, {
          text: `${errorEmoji} *OpenRouter Error*\n\n` +
                `*Error:* ${result.error}\n\n` +
                `💡 *Action:* ${errorAction}`,
          edit: processingMsg.key
        });
      }

      // Format and send response
      const wolfReply = formatDeepSeekResponse(
        result.reply, 
        query, 
        result.usage,
        result.model
      );

      await sock.sendMessage(jid, {
        text: wolfReply,
        edit: processingMsg.key
      });

      // Log usage
      logUsage(m.sender, query, result.usage, result.model);

    } catch (err) {
      console.error("❌ [DEEPSEEK ERROR]:", err);
      
      await sock.sendMessage(jid, {
        text: `🐺 *WolfBot Error*\n\n` +
              `*Details:* ${err.message || 'Unknown error'}\n\n` +
              `🔧 *Solutions:*\n` +
              `• Try again in a moment\n` +
              `• Use shorter questions\n` +
              `• Use .gpt for alternative AI`
      }, { quoted: m });
    }
  }
};

// ============================================
// EMBEDDED API KEY FUNCTION (Obfuscated)
// ============================================

function getOpenRouterKey() {
  // Method 1: Character codes array (obfuscated) - OpenRouter key
  const keyParts = [
    // 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
    [115, 107, 45, 111, 114, 45, 118, 49, 45, 101, 54, 50, 53, 49, 100, 55, 50, 49, 102, 50, 51, 54, 54, 55, 98, 102, 98, 51, 97, 56, 98, 98, 97, 52, 49, 51, 51, 49, 50, 100, 53, 55, 53, 98, 57, 101, 49, 49, 55, 54, 55, 51, 100, 97, 99, 55, 50, 56, 97, 53, 54, 50, 97, 100, 57, 101, 101, 99, 48, 50, 101, 48, 52]
  ];

  // Convert character codes to string
  const apiKey = keyParts.map(part => 
    part.map(c => String.fromCharCode(c)).join('')
  ).join('');

  // Verify it's correct
  if (apiKey.startsWith('sk-or-v1') && apiKey.length === 73) {
    return apiKey;
  }

  // Alternative method: Hex encoding
  return getOpenRouterKeyAlternative();
}

function getOpenRouterKeyAlternative() {
  // Hex string for OpenRouter key
  const hexString = "736b2d6f722d76312d65363235316437323166323336363762666233613862626134313333313264353735623965313137363733646163373238613536326164396565633032653034";
  let result = '';
  for (let i = 0; i < hexString.length; i += 2) {
    result += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
  }
  return result;
}

// Backup method using Base64 segments
function getOpenRouterKeyBackup() {
  const base64Segments = [
    "c2stb3ItdjEtZTYyNTFkNzIxZjIzNjY3YmZiM2E4YmJhNDEzMzEyZDU3NWI5ZTExNzY3M2RhYzcyOGE1NjJhZDllZWMwMmUwNA=="
  ];
  
  return Buffer.from(base64Segments[0], 'base64').toString('utf-8');
}

// ============================================
// OPENROUTER API CALL FUNCTION
// ============================================

async function callOpenRouter(query, apiKey, model = "deepseek/deepseek-chat") {
  try {
    const startTime = Date.now();
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wolfbot.com", // Required by OpenRouter
        "X-Title": "WolfBot WhatsApp", // Optional but good practice
        "User-Agent": "WolfBot/1.0 (+https://wolfbot.com)"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are WolfBot, a helpful AI assistant powered by DeepSeek through OpenRouter.
                     Personality: Wise, friendly, and knowledgeable like a wolf spirit guide.
                     Style: Clear, concise, helpful. Use wolf metaphors occasionally.
                     Capabilities: Answer questions, write code, explain concepts, solve problems.
                     Important: Format code blocks properly. Be accurate and helpful.
                     Sign off as WolfBot.`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 4000, // OpenRouter allows more tokens
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      }),
      timeout: 60000 // 60 seconds for OpenRouter
    });

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      
      let errorMessage = "API request failed";
      const status = response.status;
      
      // OpenRouter specific error handling
      const errorMap = {
        400: "Invalid request - check your query format",
        401: "Invalid API key",
        402: "Payment required - credits exhausted",
        429: "Rate limit exceeded - try again later",
        500: "OpenRouter server error",
        502: "Model provider error",
        503: "Service temporarily unavailable"
      };
      
      if (errorMap[status]) {
        errorMessage = errorMap[status];
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      } else if (data.error?.type) {
        errorMessage = `Error: ${data.error.type}`;
      } else if (data.error) {
        errorMessage = String(data.error);
      }
      
      return {
        success: false,
        error: errorMessage,
        code: status,
        latency,
        details: data
      };
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      return {
        success: false,
        error: "No response from AI model",
        latency,
        details: data
      };
    }

    // Extract OpenRouter specific data
    const modelInfo = data.model || model;
    const usage = data.usage || {};
    const totalCost = data.usage?.total_cost || 0;

    return {
      success: true,
      reply: data.choices[0].message.content.trim(),
      model: modelInfo,
      usage: {
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0,
        total_cost: totalCost
      },
      id: data.id,
      latency,
      provider: "OpenRouter"
    };

  } catch (error) {
    console.error("OpenRouter Network Error:", error);
    
    let errorMsg = "Network error occurred";
    
    if (error.name === 'AbortError') {
      errorMsg = "Request timeout (60 seconds)";
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = "Cannot connect to OpenRouter API";
    } else if (error.message?.includes('fetch')) {
      errorMsg = "Network connection failed";
    }
    
    return {
      success: false,
      error: errorMsg,
      details: error.message
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDeepSeekResponse(reply, query, usage = {}, model = "DeepSeek") {
  // Truncate if too long for WhatsApp
  const maxLength = 3500;
  let finalReply = reply;
  
  if (reply.length > maxLength) {
    finalReply = reply.substring(0, maxLength - 200) + 
                "\n\n... (response truncated due to length limit)";
  }

  // Format code blocks better for WhatsApp
  finalReply = finalReply.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` (${lang})` : '';
    return `📝 *Code${language}:*\n${code}\n`;
  });

  // Format cost if available
  const costInfo = usage.total_cost ? 
    `\n💰 *Cost:* $${usage.total_cost.toFixed(6)}` : 
    '';
    
  const tokenInfo = usage.total_tokens ? 
    `📊 *Tokens:* ${usage.prompt_tokens || '?'} + ${usage.completion_tokens || '?'} = ${usage.total_tokens}` : 
    '';

  return `🐺 *WolfBot DeepSeek* 🧠
━━━━━━━━━━━━━━━━

*Powered by OpenRouter*
*Model:* ${model}

🗨️ *Query:*
${query.length > 100 ? query.substring(0, 100) + '...' : query}

━━━━━━━━━━━━━━━━

💭 *Response:*
${finalReply}

━━━━━━━━━━━━━━━━
${tokenInfo}
${costInfo}
⏱️ *Latency:* ${usage.latency || '?'}ms
🌐 *Context:* 128K tokens
🐺 *WolfBot Assistant* v2.0`;
}

// Cooldown management
const userCooldowns = new Map();

function checkCooldown(userId, cooldownSeconds = 2) {
  const now = Date.now();
  const lastUsed = userCooldowns.get(userId);
  
  if (lastUsed && (now - lastUsed) < cooldownSeconds * 1000) {
    const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastUsed)) / 1000);
    return {
      allowed: false,
      remaining
    };
  }
  
  userCooldowns.set(userId, now);
  return { allowed: true };
}

function logUsage(userId, query, usage, model) {
  const timestamp = new Date().toLocaleString();
  const logEntry = {
    userId,
    timestamp,
    queryLength: query.length,
    tokens: usage.total_tokens || 0,
    cost: usage.total_cost || 0,
    model: model || "deepseek-chat",
    provider: "OpenRouter"
  };
  
  console.log(`[OPENROUTER USAGE] ${userId}: ${query.substring(0, 30)}... ` +
              `(${usage.total_tokens || '?'} tokens, $${usage.total_cost || '0'})`);
  return logEntry;
}

// ============================================
// UTILITY FUNCTIONS (Exportable)
// ============================================

export const deepseekUtils = {
  // Core API call
  chat: async (prompt, options = {}) => {
    const apiKey = getOpenRouterKey();
    const model = options.model || "deepseek/deepseek-chat";
    return await callOpenRouter(prompt, apiKey, model);
  },

  // Available models on OpenRouter
  listModels: () => {
    return [
      { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", description: "General purpose AI" },
      { id: "deepseek/deepseek-coder", name: "DeepSeek Coder", description: "Code generation" },
      { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", description: "Meta's large model" },
      { id: "google/gemini-pro-1.5", name: "Gemini Pro", description: "Google's AI" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: "OpenAI's small model" }
    ];
  },

  // Code generation with DeepSeek Coder
  generateCode: async (prompt, language = "python") => {
    const systemPrompt = `You are WolfBot Code Assistant. Generate clean, efficient ${language} code with comments.`;
    const apiKey = getOpenRouterKey();
    
    const result = await callOpenRouter(
      `${systemPrompt}\n\nUser request: ${prompt}`,
      apiKey,
      "deepseek/deepseek-coder"
    );
    
    return result;
  },

  // API status check
  getApiStatus: () => {
    const key = getOpenRouterKey();
    return {
      configured: key && key.startsWith('sk-or-v1'),
      length: key?.length || 0,
      valid: key?.length === 73,
      provider: "OpenRouter",
      modelsAvailable: 5
    };
  },

  // Test connection
  testConnection: async () => {
    try {
      const apiKey = getOpenRouterKey();
      const result = await callOpenRouter("Say 'WolfBot via OpenRouter is connected'", apiKey);
      
      return {
        success: result.success,
        message: result.success ? 'OpenRouter API is working' : result.error,
        latency: result.latency,
        cost: result.usage?.total_cost || 0,
        apiKeyValid: apiKey && apiKey.length === 73
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        apiKeyValid: false
      };
    }
  },

  // Clear cooldown for user
  clearCooldown: (userId) => {
    userCooldowns.delete(userId);
    return true;
  },

  // Get usage statistics
  getUsageStats: () => {
    return {
      activeUsers: userCooldowns.size,
      cooldownEnabled: true,
      cooldownSeconds: 2,
      provider: "OpenRouter"
    };
  },

  // Switch model dynamically
  switchModel: async (prompt, modelId) => {
    const apiKey = getOpenRouterKey();
    return await callOpenRouter(prompt, apiKey, modelId);
  }
};

// OpenRouter specific models
export const OPENROUTER_MODELS = {
  DEEPSEEK_CHAT: "deepseek/deepseek-chat",
  DEEPSEEK_CODER: "deepseek/deepseek-coder",
  LLAMA_70B: "meta-llama/llama-3.1-70b-instruct",
  GEMINI_PRO: "google/gemini-pro-1.5",
  GPT4_MINI: "openai/gpt-4o-mini",
  CLAUDE_3_5: "anthropic/claude-3.5-sonnet"
};

// Optional: Get model pricing info
export const MODEL_PRICING = {
  "deepseek/deepseek-chat": {
    input: 0.00014, // $ per 1K tokens
    output: 0.00028,
    context: 128000
  },
  "deepseek/deepseek-coder": {
    input: 0.00014,
    output: 0.00028,
    context: 128000
  }
};

// Advanced: Conversation with history
async function callOpenRouterWithHistory(messages, apiKey, model = "deepseek/deepseek-chat") {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://wolfbot.com"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  return response.json();
}



















