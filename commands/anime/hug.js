import fetch from 'node-fetch';

const HUG_TYPES = {
    'random': 'hug',
    'anime': 'anime-hug',
    'bear': 'bear-hug',
    'cat': 'cat-hug',
    'dog': 'dog-hug',
    'friend': 'friend-hug',
    'group': 'group-hug',
    'tight': 'tight-hug',
    'warm': 'warm-hug',
    'virtual': 'virtual-hug',
    'cute': 'cute-hug',
    'happy': 'happy-hug',
    'sad': 'sad-hug',
    'comfort': 'comfort-hug',
    'love': 'love-hug'
};

// Multiple API endpoints for variety
const HUG_APIS = [
    'https://api.waifu.pics/sfw/hug',
    'https://api.catboys.com/img',  // Anime images
    'https://some-random-api.com/animu/hug'  // Alternative API
];

const userHugStats = new Map();
const recentHugImages = new Set(); // Track recent images to avoid repeats

// Multiple fallback GIFs for each type
const FALLBACK_GIFS = {
    'random': [
        'https://i.giphy.com/media/3ZnBrkqoaI2hq/giphy.webp',
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'anime': [
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp',
        'https://i.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/ArLxZ4QiC1Q52/giphy.webp'
    ],
    'bear': [
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp'
    ],
    'cat': [
        'https://i.giphy.com/media/ArLxZ4QiC1Q52/giphy.webp',
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/3ZnBrkqoaI2hq/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'dog': [
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp'
    ],
    'friend': [
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'group': [
        'https://i.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'tight': [
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'warm': [
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'virtual': [
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'cute': [
        'https://i.giphy.com/media/ArLxZ4QiC1Q52/giphy.webp',
        'https://i.giphy.com/media/3ZnBrkqoaI2hq/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp',
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp'
    ],
    'happy': [
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'sad': [
        'https://i.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'comfort': [
        'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.webp',
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ],
    'love': [
        'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.webp',
        'https://i.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.webp',
        'https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.webp',
        'https://i.giphy.com/media/od5H3PmEG5EVq/giphy.webp'
    ]
};

export default {
    name: "hug",
    alias: ["hugme", "hugs", "cuddle", "embrace"],
    desc: "Send different hugs to someone!",
    category: "fun",
    usage: `.hug - Random hug\n.hug @user - Hug a user\n.hug [type] - Specific hug type\n.hug types - List all hug types\n.hug stats - Your hug statistics`,
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            const senderId = m.key.participant || m.key.remoteJid;
            const senderName = m.pushName || "User";
            
            // Initialize user stats
            if (!userHugStats.has(senderId)) {
                userHugStats.set(senderId, {
                    name: senderName,
                    hugsGiven: 0,
                    hugsReceived: 0,
                    favoriteType: 'random',
                    lastHugged: null,
                    totalHugs: 0,
                    uniqueHugs: new Set(), // Track unique hug images seen
                    hugTypes: {}
                });
            }
            
            const action = args[0]?.toLowerCase();
            
            // List hug types
            if (action === 'types' || action === 'list') {
                return await showHugTypes(sock, m, chatId);
            }
            
            // Show stats
            if (action === 'stats') {
                return await showStats(sock, m, chatId, senderId);
            }
            
            // Show help
            if (action === 'help') {
                return await showHelp(sock, m, chatId);
            }
            
            // Check for mentioned users
            let mentionedUsers = [];
            let targetUserId = null;
            let targetUserName = "everyone";
            
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                mentionedUsers = m.message.extendedTextMessage.contextInfo.mentionedJid;
            }
            
            // Determine hug type
            let hugType = 'random';
            let hugTypeName = 'Random Hug';
            
            if (action && HUG_TYPES[action]) {
                hugType = action;
                hugTypeName = formatHugTypeName(action);
            }
            
            // Determine target
            if (mentionedUsers.length > 0) {
                // Hug specific mentioned user(s)
                targetUserId = mentionedUsers[0];
                
                // Get target user's name
                try {
                    const targetUser = await sock.onWhatsApp(targetUserId);
                    if (targetUser && targetUser.length > 0) {
                        targetUserName = targetUser[0].name || targetUser[0].jid.split('@')[0];
                    }
                } catch (error) {
                    console.error("Error getting user info:", error);
                    targetUserName = "Friend";
                }
                
                // Update stats for both users
                updateHugStats(senderId, targetUserId, hugType);
                
                // Send hug to specific user
                return await sendHug(sock, m, chatId, senderName, targetUserName, hugType, hugTypeName, true);
                
            } else if (action && !HUG_TYPES[action]) {
                // If argument is not a hug type, assume it's text for self-hug
                return await sendHug(sock, m, chatId, senderName, senderName, hugType, hugTypeName, false);
                
            } else {
                // Hug everyone or self-hug
                updateHugStats(senderId, null, hugType);
                return await sendHug(sock, m, chatId, senderName, "everyone", hugType, hugTypeName, false);
            }
            
        } catch (error) {
            console.error("Hug command error:", error);
            await sock.sendMessage(m.key.remoteJid, {
                text: `❌ Error sending hug: ${error.message}\nUse .hug help for instructions`
            }, { quoted: m });
        }
    }
};

async function sendHug(sock, m, chatId, senderName, targetName, hugType, hugTypeName, isTargeted) {
    try {
        // Get hug GIF from API with variety
        const hugData = await getHugGif(hugType, senderName);
        
        if (!hugData || !hugData.url) {
            return await sock.sendMessage(chatId, {
                text: "❌ Couldn't get a hug GIF. Try again!"
            }, { quoted: m });
        }
        
        // Track this unique hug image
        const senderStats = userHugStats.get(m.key.participant || m.key.remoteJid);
        if (senderStats && senderStats.uniqueHugs) {
            senderStats.uniqueHugs.add(hugData.url);
        }
        
        // Create caption based on hug type and target
        let caption = createHugCaption(senderName, targetName, hugTypeName, isTargeted, hugData.isFallback);
        
        // Add hug count and variety info
        if (senderStats) {
            const uniqueCount = senderStats.uniqueHugs?.size || 0;
            caption += `\n\n📊 *Hug Variety:* ${uniqueCount} different hugs sent!`;
            
            // Random fun fact about hugs
            const funFacts = [
                "💖 Hugs release oxytocin, the 'love hormone'!",
                "🤗 20-second hugs can reduce stress and blood pressure!",
                "💕 Hugging boosts your immune system!",
                "✨ The average hug lasts 3 seconds, but 20-second hugs have therapeutic effects!",
                "🌟 Hugs can instantly boost mood and happiness levels!",
                "💝 Physical touch through hugs can reduce feelings of loneliness!",
                "🫂 Hugging increases feelings of trust and safety!"
            ];
            
            if (Math.random() > 0.5) {
                const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
                caption += `\n${randomFact}`;
            }
        }
        
        // Send the hug GIF with caption
        await sock.sendMessage(chatId, {
            image: { url: hugData.url },
            caption: caption,
            mentions: isTargeted ? [targetName.includes('@') ? targetName : null].filter(Boolean) : []
        }, { quoted: m });
        
        // Store this hug in recent history
        addRecentHug(hugData.url);
        
        // Send follow-up message with hug variety
        if (Math.random() > 0.7) { // 30% chance
            setTimeout(async () => {
                const varietyMessage = getVarietyMessage(hugType);
                await sock.sendMessage(chatId, {
                    text: varietyMessage
                });
            }, 1000);
        }
        
    } catch (error) {
        console.error("Send hug error:", error);
        throw error;
    }
}

async function getHugGif(hugType = 'random', userName = 'User') {
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Try different APIs randomly for variety
            const apiIndex = Math.floor(Math.random() * HUG_APIS.length);
            let apiUrl = HUG_APIS[apiIndex];
            let requestData = null;
            
            // Prepare request based on API
            if (apiUrl.includes('waifu.pics')) {
                requestData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: HUG_TYPES[hugType] || HUG_TYPES.random })
                };
            } else if (apiUrl.includes('catboys.com')) {
                // Catboys API is GET only
                requestData = { method: 'GET' };
            } else {
                // Other APIs
                requestData = { method: 'GET' };
            }
            
            const response = await fetch(apiUrl, {
                ...requestData,
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Different APIs return different response formats
                let imageUrl = null;
                
                if (data.url) {
                    imageUrl = data.url;
                } else if (data.link) {
                    imageUrl = data.link;
                } else if (data.image) {
                    imageUrl = data.image;
                } else if (data.data?.url) {
                    imageUrl = data.data.url;
                }
                
                if (imageUrl && !recentHugImages.has(imageUrl)) {
                    return {
                        url: imageUrl,
                        type: hugType,
                        api: apiUrl,
                        isFallback: false
                    };
                }
            }
        } catch (error) {
            console.log(`API attempt ${attempt} failed:`, error.message);
            if (attempt === maxAttempts) {
                console.log("All API attempts failed, using fallback GIFs");
            }
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // If all APIs fail, use fallback GIFs with variety
    return getVariedFallbackGif(hugType, userName);
}

function getVariedFallbackGif(hugType, userName) {
    // Hash the user's name to get consistent but varied results
    const nameHash = Array.from(userName).reduce((hash, char) => {
        return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    
    // Get available GIFs for this type
    const availableGifs = FALLBACK_GIFS[hugType] || FALLBACK_GIFS.random;
    
    // Select GIF based on name hash and current time for variety
    const timeBasedIndex = Math.floor(Date.now() / 10000) % availableGifs.length; // Change every 10 seconds
    const nameBasedIndex = Math.abs(nameHash) % availableGifs.length;
    const randomIndex = (timeBasedIndex + nameBasedIndex) % availableGifs.length;
    
    // Select a different GIF if this one was recently used
    let selectedIndex = randomIndex;
    for (let i = 0; i < availableGifs.length; i++) {
        const testIndex = (randomIndex + i) % availableGifs.length;
        if (!recentHugImages.has(availableGifs[testIndex])) {
            selectedIndex = testIndex;
            break;
        }
    }
    
    return {
        url: availableGifs[selectedIndex],
        type: hugType,
        api: 'fallback',
        isFallback: true
    };
}

function createHugCaption(senderName, targetName, hugTypeName, isTargeted, isFallback = false) {
    // Different hug messages for variety
    const hugMessages = {
        'random': [
            `🤗 *Random Hug!* A surprise embrace!`,
            `✨ *Mystery Hug!* You never know what you'll get!`,
            `🎲 *Lucky Hug!* Random act of kindness!`,
            `🎁 *Surprise Hug!* An unexpected embrace!`,
            `🌈 *Colorful Hug!* Full of surprises!`
        ],
        'anime': [
            `🌸 *Anime Hug!* Kawaii desu~`,
            `🎌 *Japanese Hug!* Daisuki! (I love you!)`,
            `✨ *Manga Hug!* Straight from the pages!`,
            `🎎 *Kawaii Hug!* Too cute to handle!`,
            `🌸 *Sakura Hug!* Blooming with affection!`
        ],
        'bear': [
            `🐻 *Bear Hug!* Rawr! Extra fuzzy!`,
            `🧸 *Teddy Bear Hug!* Super cuddly!`,
            `🌲 *Wilderness Hug!* Nature's embrace!`,
            `🏔️ *Mountain Hug!* Strong and steady!`,
            `🐾 *Paw-some Hug!* Bear-y special!`
        ]
    };
    
    // Select message based on hug type
    let message = "";
    if (hugMessages[hugTypeName.toLowerCase().replace(' hug', '')]) {
        const messages = hugMessages[hugTypeName.toLowerCase().replace(' hug', '')];
        message = messages[Math.floor(Math.random() * messages.length)];
    } else {
        // Generic messages for other types
        const genericMessages = [
            `🤗 *${hugTypeName}!* Warm embrace incoming!`,
            `💖 *${hugTypeName}!* Spread the love!`,
            `✨ *${hugTypeName}!* Positive vibes!`,
            `🫂 *${hugTypeName}!* Comfort and care!`,
            `🌟 *${hugTypeName}!* Shining with affection!`
        ];
        message = genericMessages[Math.floor(Math.random() * genericMessages.length)];
    }
    
    let caption = `${message}\n\n`;
    
    // Different recipient messages
    const recipientMessages = {
        targeted: [
            `From: *${senderName}* 🤗\nTo: *${targetName}* 💖`,
            `🤝 *${senderName}* → *${targetName}*\nConnection established!`,
            `💕 ${senderName} shares love with ${targetName}!`,
            `✨ ${senderName} sends positive energy to ${targetName}!`,
            `🫂 ${senderName} embraces ${targetName} with care!`
        ],
        group: [
            `From: *${senderName}* 🌟\nTo: *Everyone in the chat!* 🎉`,
            `👨‍👩‍👧‍👦 Group hug initiated by ${senderName}!`,
            `🌈 ${senderName} shares love with the whole group!`,
            `🎊 Community embrace from ${senderName}!`,
            `🤗 ${senderName} hugs everyone at once!`
        ],
        self: [
            `*${senderName} gives themselves a well-deserved hug!* 💝`,
            `✨ ${senderName} practices self-care with a hug!`,
            `💖 ${senderName} shows themselves some love!`,
            `🫂 Self-embrace from ${senderName}!`,
            `🌟 ${senderName} deserves this hug!`
        ]
    };
    
    if (isTargeted) {
        const messages = recipientMessages.targeted;
        caption += messages[Math.floor(Math.random() * messages.length)];
    } else if (targetName === "everyone") {
        const messages = recipientMessages.group;
        caption += messages[Math.floor(Math.random() * messages.length)];
    } else {
        const messages = recipientMessages.self;
        caption += messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Add different quotes
    const quotes = [
        `\n\n💕 *"A hug is a perfect gift - one size fits all, and nobody minds if you exchange it."*`,
        `\n\n🌟 *"Sometimes the simplest things mean the most."*`,
        `\n\n✨ *"Hugs are the universal medicine."*`,
        `\n\n💖 *"The best therapy is a long hug from someone who cares."*`,
        `\n\n🤗 *"No matter how hard the day, a hug makes it better."*`,
        `\n\n🫂 *"Hugs: the silent way of saying 'You matter to me.'"*`,
        `\n\n🌈 *"A hug is like a boomerang - you get it back right away."*`
    ];
    
    caption += quotes[Math.floor(Math.random() * quotes.length)];
    
    // Add variety indicator if using fallback
    if (isFallback) {
        caption += `\n\n🔧 *Using cached hug #${Math.floor(Math.random() * 100) + 1}*`;
    }
    
    return caption;
}

function updateHugStats(senderId, targetId, hugType) {
    // Update sender's stats
    const senderStats = userHugStats.get(senderId);
    if (senderStats) {
        senderStats.hugsGiven++;
        senderStats.totalHugs++;
        senderStats.lastHugged = Date.now();
        
        // Update hug type statistics
        senderStats.hugTypes[hugType] = (senderStats.hugTypes[hugType] || 0) + 1;
        
        // Find most used type
        let favoriteType = 'random';
        let maxCount = 0;
        for (const [type, count] of Object.entries(senderStats.hugTypes)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteType = type;
            }
        }
        senderStats.favoriteType = favoriteType;
    }
    
    // Update target's stats if specified
    if (targetId && targetId !== senderId) {
        if (!userHugStats.has(targetId)) {
            userHugStats.set(targetId, {
                name: "Unknown User",
                hugsGiven: 0,
                hugsReceived: 0,
                favoriteType: 'random',
                lastHugged: Date.now(),
                totalHugs: 0,
                uniqueHugs: new Set(),
                hugTypes: {}
            });
        }
        
        const targetStats = userHugStats.get(targetId);
        if (targetStats) {
            targetStats.hugsReceived++;
            targetStats.totalHugs++;
            targetStats.lastHugged = Date.now();
        }
    }
}

function addRecentHug(url) {
    recentHugImages.add(url);
    
    // Limit recent images to 50
    if (recentHugImages.size > 50) {
        const first = Array.from(recentHugImages)[0];
        recentHugImages.delete(first);
    }
    
    // Auto-clear after 1 hour
    setTimeout(() => {
        recentHugImages.delete(url);
    }, 3600000);
}

function getVarietyMessage(hugType) {
    const messages = [
        `💡 *Tip:* Try \`.hug ${getRandomDifferentType(hugType)}\` for a different style!`,
        `🎨 *Variety is the spice of life!* Try other hug types!`,
        `🌈 *Different hugs, same love!* Explore all hug types with \`.hug types\``,
        `✨ *Keep the love flowing!* Each hug type has its own special vibe!`,
        `🤗 *Hug Explorer:* You've tried ${hugType}, now try another type!`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomDifferentType(currentType) {
    const types = Object.keys(HUG_TYPES).filter(t => t !== currentType);
    return types[Math.floor(Math.random() * types.length)];
}

function formatHugTypeName(type) {
    const names = {
        'random': 'Random Hug',
        'anime': 'Anime Hug',
        'bear': 'Bear Hug',
        'cat': 'Cat Hug',
        'dog': 'Dog Hug',
        'friend': 'Friend Hug',
        'group': 'Group Hug',
        'tight': 'Tight Hug',
        'warm': 'Warm Hug',
        'virtual': 'Virtual Hug',
        'cute': 'Cute Hug',
        'happy': 'Happy Hug',
        'sad': 'Sad Hug',
        'comfort': 'Comfort Hug',
        'love': 'Love Hug'
    };
    
    return names[type] || 'Random Hug';
}

async function showHugTypes(sock, m, chatId) {
    let typesText = `🤗 *AVAILABLE HUG TYPES* 🤗\n\n`;
    
    const typesArray = Object.keys(HUG_TYPES);
    const midPoint = Math.ceil(typesArray.length / 2);
    
    // Display in two columns for readability
    for (let i = 0; i < midPoint; i++) {
        const type1 = typesArray[i];
        const type2 = typesArray[i + midPoint];
        
        let line = `• \`.hug ${type1}\` - ${formatHugTypeName(type1)}`;
        if (type2) {
            line += ` | \`.hug ${type2}\` - ${formatHugTypeName(type2)}`;
        }
        typesText += line + '\n';
    }
    
    typesText += `\n*Examples:*\n`;
    typesText += `• \`.hug @user\` - Random hug for user\n`;
    typesText += `• \`.hug anime @friend\` - Anime hug\n`;
    typesText += `• \`.hug bear tight\` - Bear hug for yourself\n`;
    typesText += `• \`.hug\` - Random hug for everyone\n\n`;
    
    typesText += `💖 *Each type gives different hugs every time!* 💖`;
    
    await sock.sendMessage(chatId, { text: typesText }, { quoted: m });
}

async function showStats(sock, m, chatId, userId) {
    const stats = userHugStats.get(userId) || {
        hugsGiven: 0,
        hugsReceived: 0,
        totalHugs: 0,
        favoriteType: 'random',
        uniqueHugs: new Set()
    };
    
    const favoriteName = formatHugTypeName(stats.favoriteType);
    const uniqueCount = stats.uniqueHugs?.size || 0;
    
    let statsText = `📊 *HUG STATISTICS* 📊\n\n`;
    statsText += `🤗 *Hugs Given:* ${stats.hugsGiven}\n`;
    statsText += `💖 *Hugs Received:* ${stats.hugsReceived}\n`;
    statsText += `📈 *Total Hugs:* ${stats.totalHugs}\n`;
    statsText += `🎨 *Unique Hugs:* ${uniqueCount} different images\n`;
    statsText += `⭐ *Favorite Type:* ${favoriteName}\n`;
    
    // Show hug type distribution
    if (stats.hugTypes && Object.keys(stats.hugTypes).length > 0) {
        statsText += `\n*Hug Type Distribution:*\n`;
        Object.entries(stats.hugTypes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([type, count]) => {
                const percentage = Math.round((count / stats.hugsGiven) * 100);
                const bar = '█'.repeat(Math.round(percentage / 10)) + '░'.repeat(10 - Math.round(percentage / 10));
                statsText += `${formatHugTypeName(type)}: ${bar} ${percentage}%\n`;
            });
    }
    
    if (stats.lastHugged) {
        const lastHugged = new Date(stats.lastHugged);
        statsText += `⏰ *Last Hugged:* ${lastHugged.toLocaleDateString()}\n`;
    }
    
    // Calculate hug variety score
    if (stats.hugsGiven > 0) {
        const varietyScore = Math.round((uniqueCount / stats.hugsGiven) * 100);
        statsText += `🌈 *Variety Score:* ${varietyScore}%\n`;
        
        if (varietyScore > 80) {
            statsText += `\n🎨 *Hug Artist!* You love trying different hugs!\n`;
        } else if (varietyScore > 60) {
            statsText += `\n✨ *Hug Explorer!* You enjoy variety!\n`;
        } else if (varietyScore > 40) {
            statsText += `\n🤗 *Consistent Hugger!* You have your favorites!\n`;
        } else {
            statsText += `\n💖 *Traditional Hugger!* You stick to what you love!\n`;
        }
    }
    
    statsText += `\n*Keep spreading different kinds of love!* 💕`;
    
    await sock.sendMessage(chatId, { text: statsText }, { quoted: m });
}

async function showHelp(sock, m, chatId) {
    const helpText = `🤗 *HUG COMMAND HELP* 🤗\n\n` +
        `*Basic Commands:*\n` +
        `• \`.hug\` - Send random hug to everyone\n` +
        `• \`.hug @user\` - Hug a specific user\n` +
        `• \`.hug types\` - List all 15+ hug types\n` +
        `• \`.hug stats\` - Your hug statistics & variety score\n` +
        `• \`.hug help\` - This help menu\n\n` +
        
        `*✨ Key Features:*\n` +
        `• Different GIF every time!\n` +
        `• 15+ unique hug types\n` +
        `• Variety tracking system\n` +
        `• Multiple API fallbacks\n` +
        `• Unique messages each time\n\n` +
        
        `*Popular Types:*\n` +
        `• anime - Anime-style hugs\n` +
        `• bear - Bear hugs\n` +
        `• cat - Cat cuddles\n` +
        `• dog - Doggy hugs\n` +
        `• group - Group hugs\n` +
        `• virtual - Digital hugs\n\n` +
        
        `*Examples:*\n` +
        `\`.hug @john\` - Random hug for John\n` +
        `\`.hug anime @sarah\` - Anime hug for Sarah\n` +
        `\`.hug bear\` - Bear hug for yourself\n` +
        `\`.hug group\` - Group hug for all\n\n` +
        
        `💝 *Every hug is unique! Try the same type multiple times!* 💝`;
    
    await sock.sendMessage(chatId, { text: helpText }, { quoted: m });
}

// Auto-clear recent images daily
setInterval(() => {
    console.log(`Clearing hug cache. Currently tracking: ${recentHugImages.size} images`);
    recentHugImages.clear();
}, 86400000); // 24 hours