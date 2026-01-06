import axios from 'axios';

export default {
  name: 'joke',
  description: 'Get random jokes and have fun',
  category: 'fun',
  aliases: ['jokes', 'funny', 'laugh', 'humor'],
  usage: 'joke [category] or joke [command]',
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    
    // ====== HELP SECTION ======
    if (args.length === 0 || args[0].toLowerCase() === 'help') {
      const helpText = `😂 *WOLFBOT JOKES*\n\n` +
        `💡 *Usage:*\n` +
        `• \`${PREFIX}joke\` - Random joke\n` +
        `• \`${PREFIX}joke daily\` - Daily joke\n` +
        `• \`${PREFIX}joke dark\` - Dark humor\n` +
        `• \`${PREFIX}joke pun\` - Pun jokes\n` +
        `• \`${PREFIX}joke list\` - Show categories\n` +
``;
      
      return sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    // ====== LIST CATEGORIES ======
    if (args[0].toLowerCase() === 'list') {
      const categoriesText = `📋 *JOKE CATEGORIES*\n\n` +
        `🎭 *Available Categories:*\n` +
        `1. *general* - General jokes (default)\n` +
        `2. *programming* - Tech & programming jokes\n` +
        `3. *dark* - Dark humor (18+)\n` +
        `4. *pun* - Pun jokes\n` +
        `5. *knock* - Knock-knock jokes\n` +
        `6. *dad* - Dad jokes\n` +
        `7. *random* - Completely random\n\n` +
        
        `💡 *Usage:*\n` +
        `\`${PREFIX}joke programming\`\n` +
        `\`${PREFIX}joke dark\`\n` +
        `\`${PREFIX}joke pun\`\n\n` +
        
       ``;
      
      return sock.sendMessage(jid, { text: categoriesText }, { quoted: m });
    }

    // ====== DAILY JOKE ======
    if (args[0].toLowerCase() === 'daily') {
      try {
        // Send processing message
        const statusMsg = await sock.sendMessage(jid, {
          text: `📅 *Fetching Daily Joke...*\n\n⏳ Please wait...`
        }, { quoted: m });

        // Get joke
        const joke = await getJoke('daily');
        
        // Format daily joke
        const dailyText = `📅 *DAILY JOKE*\n\n` +
                         `📝 *Joke of the Day:*\n${joke.joke}\n\n` +
                         `🎭 *Category:* ${joke.category || 'Daily Special'}\n` +
                         `📊 *Type:* ${joke.type || 'Single'}\n` +
                         `⭐ *Special:* Daily Featured Joke\n\n` +
                         `💡 *Tomorrow:* Use \`${PREFIX}joke daily\` again!`;
        
        // Update with joke
        await sock.sendMessage(jid, {
          text: dailyText,
          edit: statusMsg.key
        });
        
        return;
        
      } catch (error) {
        // Fallback to random joke
        console.log('Daily joke failed, using random:', error.message);
        args[0] = 'random';
      }
    }

    // ====== STATS COMMAND ======
    if (args[0].toLowerCase() === 'stats') {
      // Simple stats (you can expand this with database)
      const statsText = `📊 *JOKE STATISTICS*\n\n` +
                       `😂 *Jokes Told:* Many!\n` +
                       `🎭 *Categories Available:* 7+\n` +
                       `⭐ *Favorite:* Random jokes\n` +
                       `📅 *Daily Jokes:* Unlimited\n\n` +
                       `💡 *Most Popular Categories:*\n` +
                       `1. General jokes\n` +
                       `2. Programming jokes\n` +
                       `3. Dad jokes\n\n` +
                       `⚡ *Keep laughing with:*\n` +
                       `\`${PREFIX}joke\` - Random joke\n` +
                       `\`${PREFIX}joke list\` - All categories`;
      
      return sock.sendMessage(jid, { text: statsText }, { quoted: m });
    }

    // ====== GET JOKE BY CATEGORY ======
    try {
      const category = args[0].toLowerCase();
      const validCategories = ['general', 'programming', 'dark', 'pun', 'knock', 'dad', 'random', 'knock-knock'];
      
      let jokeCategory = 'general';
      if (validCategories.includes(category)) {
        jokeCategory = category;
      } else if (category === 'knock') {
        jokeCategory = 'knock-knock';
      }
      
      // ====== PROCESSING MESSAGE ======
      const categoryNames = {
        'general': 'General',
        'programming': 'Programming',
        'dark': 'Dark Humor',
        'pun': 'Pun',
        'knock-knock': 'Knock-Knock',
        'dad': 'Dad Joke',
        'random': 'Random'
      };
      
      const statusText = `😂 *Fetching ${categoryNames[jokeCategory] || 'Random'} Joke...*\n\n` +
                        `🎭 *Category:* ${categoryNames[jokeCategory] || 'Random'}\n` +
                        `⚡ *Searching for funny content...*`;
      
      const statusMsg = await sock.sendMessage(jid, {
        text: statusText
      }, { quoted: m });

      // ====== API REQUEST ======
      const joke = await getJoke(jokeCategory);
      
      // ====== UPDATE STATUS ======
      await sock.sendMessage(jid, {
        text: `😂 *Fetching Joke...* ✅\n⚡ *Formatting joke...*`,
        edit: statusMsg.key
      });

      // ====== FORMAT JOKE BASED ON TYPE ======
      let jokeText = '';
      const reaction = getJokeReaction(jokeCategory);
      
      if (joke.type === 'twopart') {
        // Two-part joke (setup & delivery)
        jokeText = `${reaction} *${categoryNames[jokeCategory] || 'Random'} Joke*\n\n` +
                  `🎭 *Setup:*\n${joke.setup}\n\n` +
                  `😂 *Punchline:*\n${joke.delivery}\n\n` +
                  `📊 *Type:* Two-part joke\n` +
                  `⭐ *Category:* ${joke.category || jokeCategory}`;
        
      } else {
        // Single joke
        jokeText = `${reaction} *${categoryNames[jokeCategory] || 'Random'} Joke*\n\n` +
                  `📝 *Joke:*\n${joke.joke}\n\n` +
                  `📊 *Type:* Single joke\n` +
                  `⭐ *Category:* ${joke.category || jokeCategory}`;
      }
      
      // Add footer
      jokeText += `\n\n💡 *Want more?*\n` +
                 `• \`${PREFIX}joke\` - Another random\n` +
                 `• \`${PREFIX}joke list\` - All categories\n` +
                 `• \`${PREFIX}joke daily\` - Daily joke`;
      
      // ====== SEND JOKE ======
      await sock.sendMessage(jid, {
        text: jokeText,
        edit: statusMsg.key
      });

    } catch (error) {
      console.error('❌ [JOKE] ERROR:', error);
      
      let errorMessage = `❌ *JOKE FAILED*\n\n`;
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += `• Joke API is down\n`;
        errorMessage += `• Please try again later\n`;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += `• Request timeout\n`;
        errorMessage += `• Joke server is slow\n`;
      } else if (error.response?.status === 404) {
        errorMessage += `• Joke category not found\n`;
        errorMessage += `• Use \`${PREFIX}joke list\` for categories\n`;
      } else {
        errorMessage += `• Error: ${error.message}\n`;
      }
      
      errorMessage += `\n💡 *Try these instead:*\n`;
      errorMessage += `\`${PREFIX}joke\` - Random joke\n`;
      errorMessage += `\`${PREFIX}joke general\` - General jokes\n`;
      errorMessage += `\`${PREFIX}joke dad\` - Dad jokes`;
      
      // Send error
      await sock.sendMessage(jid, {
        text: errorMessage
      }, { quoted: m });
    }
  },
};

// ====== HELPER FUNCTIONS ======

// Get joke from API
async function getJoke(category = 'general') {
  try {
    const apiUrl = 'https://iamtkm.vercel.app/fun/joke';
    
    const response = await axios({
      method: 'GET',
      url: apiUrl,
      params: {
        apikey: 'tkm',
        category: category === 'daily' ? 'random' : category
      },
      timeout: 15000,
      headers: {
        'User-Agent': 'WolfBot-Jokes/1.0',
        'Accept': 'application/json'
      }
    });

    console.log(`😂 Joke API response status: ${response.status}`);
    
    if (response.data && typeof response.data === 'object') {
      const data = response.data;
      
      // Parse based on expected API response format
      if (data.status === true && data.result) {
        // Format: {"status": true, "result": {"joke": "..."}}
        if (typeof data.result === 'string') {
          return { joke: data.result, type: 'single', category: category };
        } else if (data.result.joke) {
          return { 
            joke: data.result.joke, 
            type: data.result.type || 'single',
            category: data.result.category || category 
          };
        } else if (data.result.setup && data.result.delivery) {
          return {
            setup: data.result.setup,
            delivery: data.result.delivery,
            type: 'twopart',
            category: data.result.category || category
          };
        }
      } else if (data.joke) {
        // Format: {"joke": "..."}
        return { joke: data.joke, type: 'single', category: category };
      } else if (data.setup && data.delivery) {
        // Format: {"setup": "...", "delivery": "..."}
        return {
          setup: data.setup,
          delivery: data.delivery,
          type: 'twopart',
          category: data.category || category
        };
      } else {
        // Fallback: use any text field
        const textFields = ['text', 'content', 'message', 'quote'];
        for (const field of textFields) {
          if (data[field]) {
            return { joke: data[field], type: 'single', category: category };
          }
        }
        
        // Last resort: stringify
        return { joke: JSON.stringify(data), type: 'single', category: 'random' };
      }
    }
    
    // If response is string
    if (typeof response.data === 'string') {
      return { joke: response.data, type: 'single', category: category };
    }
    
    throw new Error('Invalid joke response format');
    
  } catch (error) {
    console.error('Joke API error:', error);
    
    // Return fallback jokes if API fails
    return getFallbackJoke(category);
  }
}

// Get fallback joke if API fails
function getFallbackJoke(category) {
  const fallbackJokes = {
    general: [
      { joke: "Why don't scientists trust atoms?\nBecause they make up everything!", type: 'single' },
      { joke: "What do you call a fish with no eyes?\nFsh!", type: 'single' },
      { setup: "Why did the scarecrow win an award?", delivery: "Because he was outstanding in his field!", type: 'twopart' }
    ],
    programming: [
      { joke: "Why do programmers prefer dark mode?\nBecause light attracts bugs!", type: 'single' },
      { joke: "How many programmers does it take to change a light bulb?\nNone, that's a hardware issue.", type: 'single' }
    ],
    dad: [
      { joke: "I'm reading a book on anti-gravity.\nIt's impossible to put down!", type: 'single' },
      { joke: "Did you hear about the restaurant on the moon?\nGreat food, no atmosphere.", type: 'single' }
    ],
    pun: [
      { joke: "I used to be a baker, but I couldn't make enough dough.", type: 'single' },
      { joke: "I'm reading a book on teleportation.\nIt's bound to take me places!", type: 'single' }
    ],
    random: [
      { joke: "Why don't eggs tell jokes?\nThey'd crack each other up!", type: 'single' },
      { setup: "What do you call a bear with no teeth?", delivery: "A gummy bear!", type: 'twopart' }
    ]
  };
  
  const jokes = fallbackJokes[category] || fallbackJokes.general;
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  
  return {
    ...randomJoke,
    category: category,
    fallback: true
  };
}

// Get emoji reaction based on joke category
function getJokeReaction(category) {
  const reactions = {
    'general': '😂',
    'programming': '👨‍💻',
    'dark': '😈',
    'pun': '🎭',
    'knock-knock': '🚪',
    'dad': '👨',
    'random': '🎲',
    'daily': '📅'
  };
  
  return reactions[category] || '😂';
}