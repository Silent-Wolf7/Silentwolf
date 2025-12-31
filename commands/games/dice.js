import fs from 'fs/promises';
import path from 'path';

// In-memory storage (replace with database in production)
const userPoints = new Map();
const activeGames = new Map();

export default {
    name: "dice",
    alias: ["roll", "diceroll", "rolldice"],
    desc: "Roll dice with multiple game modes and betting",
    category: "games",
    usage: `.dice\n.dice 100\n.dice 50 double\n.dice battle @user 200\n.dice stats\n.dice leaderboard\n.dice help`,
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            const userId = m.key.participant || m.key.remoteJid;
            const userName = m.pushName || "Player";
            
            // Initialize user points if not exists
            if (!userPoints.has(userId)) {
                userPoints.set(userId, {
                    points: 1000, // Starting points
                    wins: 0,
                    losses: 0,
                    totalRolls: 0,
                    totalWon: 0,
                    totalLost: 0,
                    highestWin: 0
                });
            }
            
            const userData = userPoints.get(userId);
            
            // Help command
            if (args[0] === 'help' || args.length === 0) {
                return await showHelp(sock, m, chatId, userData);
            }
            
            // Stats command
            if (args[0] === 'stats') {
                return await showStats(sock, m, chatId, userId, userData, userName);
            }
            
            // Leaderboard command
            if (args[0] === 'leaderboard' || args[0] === 'lb') {
                return await showLeaderboard(sock, m, chatId);
            }
            
            // Daily bonus command
            if (args[0] === 'daily') {
                return await giveDailyBonus(sock, m, chatId, userId, userData);
            }
            
            // Check for active game
            if (activeGames.has(chatId)) {
                const game = activeGames.get(chatId);
                if (game.players.has(userId) && game.type === 'battle') {
                    return await handleBattleMove(sock, m, args, game, userId, userName);
                }
            }
            
            // Parse bet amount
            let betAmount = 0;
            let gameMode = 'normal';
            let targetUser = null;
            
            if (args.length > 0) {
                // Check for game modes
                if (args.includes('double') || args.includes('2x')) {
                    gameMode = 'double';
                } else if (args.includes('triple') || args.includes('3x')) {
                    gameMode = 'triple';
                } else if (args.includes('battle') || args.includes('vs') || args.includes('pvp')) {
                    gameMode = 'battle';
                } else if (args.includes('highlow')) {
                    gameMode = 'highlow';
                }
                
                // Parse bet amount (first number found)
                for (const arg of args) {
                    const bet = parseInt(arg);
                    if (!isNaN(bet) && bet > 0) {
                        betAmount = bet;
                        break;
                    }
                }
                
                // Check for mentioned user in battle mode
                if (gameMode === 'battle' && m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                    targetUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
                }
            }
            
            // Handle different game modes
            switch (gameMode) {
                case 'battle':
                    return await startBattle(sock, m, chatId, userId, userName, targetUser, betAmount);
                case 'double':
                    return await playDoubleOrNothing(sock, m, chatId, userId, userName, betAmount);
                case 'triple':
                    return await playTripleChance(sock, m, chatId, userId, userName, betAmount);
                case 'highlow':
                    return await playHighLow(sock, m, chatId, userId, userName, betAmount);
                default:
                    return await playNormalDice(sock, m, chatId, userId, userName, betAmount);
            }
            
        } catch (error) {
            console.error("Dice game error:", error);
            if (m.key?.remoteJid) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `❌ *Game Error:* ${error.message}\n\nUse \`.dice help\` for instructions.`
                }, { quoted: m });
            }
        }
    }
};

// ============= GAME MODES =============

// Normal dice roll
async function playNormalDice(sock, m, chatId, userId, userName, betAmount) {
    const userData = userPoints.get(userId);
    
    // Validate bet
    if (betAmount > 0) {
        if (betAmount > userData.points) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Insufficient Points!*\n\nYour balance: ${userData.points} 🪙\nBet amount: ${betAmount} 🪙\n\nUse \`.dice daily\` to get free points.`
            }, { quoted: m });
        }
        
        if (betAmount < 10) {
            return await sock.sendMessage(chatId, {
                text: "❌ Minimum bet is 10 🪙"
            }, { quoted: m });
        }
        
        // Deduct bet
        userData.points -= betAmount;
    }
    
    // Roll dice (1-6)
    const playerRoll = rollDice();
    const botRoll = rollDice();
    
    // Calculate result
    let resultText = '';
    let pointsWon = 0;
    
    if (betAmount > 0) {
        if (playerRoll > botRoll) {
            // Win: get double
            pointsWon = betAmount * 2;
            userData.points += pointsWon;
            userData.wins++;
            userData.totalWon += pointsWon;
            userData.highestWin = Math.max(userData.highestWin, pointsWon);
            resultText = `🎉 *YOU WIN!* (+${pointsWon} 🪙)`;
        } else if (playerRoll < botRoll) {
            // Lose: bet lost
            userData.losses++;
            userData.totalLost += betAmount;
            resultText = `💔 *YOU LOSE!* (-${betAmount} 🪙)`;
        } else {
            // Tie: bet returned
            userData.points += betAmount;
            resultText = `🤝 *IT'S A TIE!* (Bet returned)`;
        }
    }
    
    userData.totalRolls++;
    
    // Create dice visualization
    const diceVisual = createDiceVisual(playerRoll, botRoll);
    
    const message = `
🎲 *DICE ROLL - ${userName}* 🎲

${diceVisual}

🎯 *Your Roll:* ${playerRoll}
🤖 *Bot Roll:* ${botRoll}

${resultText || "🎲 *Just rolling for fun!*"}

💰 *Balance:* ${userData.points} 🪙
${betAmount > 0 ? `📊 *Bet:* ${betAmount} 🪙` : ''}
${pointsWon > 0 ? `✨ *Won:* ${pointsWon} 🪙` : ''}

*Type \`.dice 100\` to bet 100 points!*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [userId]
    }, { quoted: m });
}

// Double or Nothing mode
async function playDoubleOrNothing(sock, m, chatId, userId, userName, betAmount) {
    const userData = userPoints.get(userId);
    
    if (betAmount <= 0) {
        return await sock.sendMessage(chatId, {
            text: "❌ *Double or Nothing*\n\nUsage: `.dice 100 double`\nMinimum bet: 50 🪙"
        }, { quoted: m });
    }
    
    if (betAmount < 50) {
        return await sock.sendMessage(chatId, {
            text: "❌ Minimum bet for Double or Nothing is 50 🪙"
        }, { quoted: m });
    }
    
    if (betAmount > userData.points) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Insufficient Points!*\n\nYour balance: ${userData.points} 🪙`
        }, { quoted: m });
    }
    
    // Deduct bet
    userData.points -= betAmount;
    userData.totalRolls++;
    
    // Roll two dice, need both to be 6 to win 4x
    const roll1 = rollDice();
    const roll2 = rollDice();
    
    let resultText = '';
    let pointsWon = 0;
    
    if (roll1 === 6 && roll2 === 6) {
        // Jackpot: 4x
        pointsWon = betAmount * 4;
        userData.points += pointsWon;
        userData.wins++;
        userData.totalWon += pointsWon;
        userData.highestWin = Math.max(userData.highestWin, pointsWon);
        resultText = `🎰 *JACKPOT! DOUBLE SIX!* (+${pointsWon} 🪙)\n💰 *4x WIN!*`;
    } else if (roll1 === roll2) {
        // Win: 2x for any double
        pointsWon = betAmount * 2;
        userData.points += pointsWon;
        userData.wins++;
        userData.totalWon += pointsWon;
        resultText = `🎯 *DOUBLE!* (+${pointsWon} 🪙)\n💰 *2x WIN!*`;
    } else {
        // Lose
        userData.losses++;
        userData.totalLost += betAmount;
        resultText = `💔 *NO DOUBLE!* (-${betAmount} 🪙)\n😔 *Better luck next time!*`;
    }
    
    const message = `
🎲 *DOUBLE OR NOTHING* 🎲

🎯 *${userName}'s Roll:*
🎲 ${getDiceEmoji(roll1)}  ${getDiceEmoji(roll2)}

📊 *Numbers:* ${roll1} & ${roll2}

${resultText}

💰 *Balance:* ${userData.points} 🪙
📈 *Bet:* ${betAmount} 🪙

*Rolled doubles to win big!*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [userId]
    }, { quoted: m });
}

// Triple Chance mode
async function playTripleChance(sock, m, chatId, userId, userName, betAmount) {
    const userData = userPoints.get(userId);
    
    if (betAmount <= 0) {
        return await sock.sendMessage(chatId, {
            text: "❌ *Triple Chance*\n\nUsage: `.dice 100 triple`\nMinimum bet: 100 🪙"
        }, { quoted: m });
    }
    
    if (betAmount < 100) {
        return await sock.sendMessage(chatId, {
            text: "❌ Minimum bet for Triple Chance is 100 🪙"
        }, { quoted: m });
    }
    
    if (betAmount > userData.points) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Insufficient Points!*\n\nYour balance: ${userData.points} 🪙`
        }, { quoted: m });
    }
    
    // Deduct bet
    userData.points -= betAmount;
    userData.totalRolls++;
    
    // Roll three dice
    const rolls = [rollDice(), rollDice(), rollDice()];
    const sum = rolls.reduce((a, b) => a + b, 0);
    
    let resultText = '';
    let pointsWon = 0;
    let multiplier = 0;
    
    if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) {
        // Three of a kind: 10x
        multiplier = 10;
        pointsWon = betAmount * multiplier;
        resultText = `🎰 *THREE OF A KIND!* (+${pointsWon} 🪙)\n💰 *${multiplier}x JACKPOT!*`;
    } else if (sum >= 16) {
        // High sum: 3x
        multiplier = 3;
        pointsWon = betAmount * multiplier;
        resultText = `🎯 *HIGH ROLL!* (+${pointsWon} 🪙)\n💰 *${multiplier}x WIN!*`;
    } else if (sum <= 6) {
        // Low sum: 2x
        multiplier = 2;
        pointsWon = betAmount * multiplier;
        resultText = `🎯 *LOW ROLL!* (+${pointsWon} 🪙)\n💰 *${multiplier}x WIN!*`;
    } else {
        // Lose
        resultText = `💔 *YOU LOSE!* (-${betAmount} 🪙)\n😔 *Sum was ${sum}*`;
    }
    
    if (pointsWon > 0) {
        userData.points += pointsWon;
        userData.wins++;
        userData.totalWon += pointsWon;
        userData.highestWin = Math.max(userData.highestWin, pointsWon);
    } else {
        userData.losses++;
        userData.totalLost += betAmount;
    }
    
    const message = `
🎲 *TRIPLE CHANCE* 🎲

🎯 *${userName}'s Rolls:*
${rolls.map((roll, i) => `🎲 Roll ${i+1}: ${getDiceEmoji(roll)} (${roll})`).join('\n')}

📊 *Total Sum:* ${sum}

${resultText}

💰 *Balance:* ${userData.points} 🪙
📈 *Bet:* ${betAmount} 🪙

*Three dice, triple the excitement!*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [userId]
    }, { quoted: m });
}

// Battle mode (PvP)
async function startBattle(sock, m, chatId, userId, userName, targetUser, betAmount) {
    if (!targetUser) {
        return await sock.sendMessage(chatId, {
            text: "❌ *Dice Battle*\n\nUsage: `.dice battle @user 200`\nMention a user to challenge them!"
        }, { quoted: m });
    }
    
    if (targetUser === userId) {
        return await sock.sendMessage(chatId, {
            text: "❌ You can't battle yourself!"
        }, { quoted: m });
    }
    
    const challengerData = userPoints.get(userId);
    const targetData = userPoints.get(targetUser) || {
        points: 1000,
        wins: 0,
        losses: 0,
        totalRolls: 0,
        totalWon: 0,
        totalLost: 0,
        highestWin: 0
    };
    userPoints.set(targetUser, targetData);
    
    if (betAmount <= 0) betAmount = 100;
    if (betAmount < 50) {
        return await sock.sendMessage(chatId, {
            text: "❌ Minimum battle bet is 50 🪙"
        }, { quoted: m });
    }
    
    // Check both players have enough points
    if (challengerData.points < betAmount) {
        return await sock.sendMessage(chatId, {
            text: `❌ You don't have enough points!\nYour balance: ${challengerData.points} 🪙`
        }, { quoted: m });
    }
    
    if (targetData.points < betAmount) {
        return await sock.sendMessage(chatId, {
            text: "❌ The challenged player doesn't have enough points!"
        }, { quoted: m });
    }
    
    // Create battle game
    const gameId = `${chatId}_${Date.now()}`;
    const battleGame = {
        id: gameId,
        type: 'battle',
        players: new Map([
            [userId, {
                name: userName,
                roll: null,
                accepted: true,
                pointsDeducted: false
            }],
            [targetUser, {
                name: 'Opponent',
                roll: null,
                accepted: false,
                pointsDeducted: false
            }]
        ]),
        betAmount,
        pot: betAmount * 2,
        status: 'waiting',
        turn: userId,
        timeout: setTimeout(() => {
            endBattleByTimeout(chatId, gameId);
        }, 120000) // 2 minutes timeout
    };
    
    activeGames.set(chatId, battleGame);
    
    // Deduct points from challenger
    challengerData.points -= betAmount;
    challengerData.totalRolls++;
    
    const targetName = await getUsername(sock, targetUser) || 'Opponent';
    battleGame.players.get(targetUser).name = targetName;
    
    const message = `
⚔️ *DICE BATTLE CHALLENGE* ⚔️

🎯 *Challenger:* ${userName}
🎯 *Opponent:* ${targetName}
💰 *Battle Pot:* ${battleGame.pot} 🪙

${userName} has challenged ${targetName} to a dice battle!

🏆 *Winner takes all!*

*${targetName}, type \`.dice accept\` within 2 minutes to accept the challenge!*
*Or type \`.dice decline\` to reject it.*

⚡ *First to roll higher wins the pot!*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [userId, targetUser]
    }, { quoted: m });
}

async function handleBattleMove(sock, m, args, game, userId, userName) {
    const chatId = m.key.remoteJid;
    const action = args[0]?.toLowerCase();
    
    if (action === 'accept') {
        const player = game.players.get(userId);
        if (!player) return;
        
        if (player.accepted) {
            return await sock.sendMessage(chatId, {
                text: "✅ You've already accepted the battle!"
            }, { quoted: m });
        }
        
        // Deduct points from accepting player
        const userData = userPoints.get(userId);
        if (userData.points < game.betAmount) {
            return await sock.sendMessage(chatId, {
                text: "❌ You don't have enough points to join the battle!"
            }, { quoted: m });
        }
        
        userData.points -= game.betAmount;
        userData.totalRolls++;
        player.accepted = true;
        player.pointsDeducted = true;
        
        // Start the battle
        game.status = 'active';
        clearTimeout(game.timeout);
        
        // Both players roll
        for (const [playerId, playerData] of game.players) {
            playerData.roll = rollDice();
        }
        
        // Determine winner
        const playersArray = Array.from(game.players.entries());
        const [winnerId, winnerData] = playersArray.reduce((a, b) => 
            a[1].roll > b[1].roll ? a : b
        );
        
        // Check for tie
        const isTie = playersArray[0][1].roll === playersArray[1][1].roll;
        
        if (isTie) {
            // Return bets to both players
            playersArray.forEach(([playerId, playerData]) => {
                const playerUserData = userPoints.get(playerId);
                playerUserData.points += game.betAmount;
            });
            
            const message = `
⚔️ *DICE BATTLE - TIE!* ⚔️

🎲 *Rolls:*
${playersArray.map(([id, data]) => `• ${data.name}: ${getDiceEmoji(data.roll)} (${data.roll})`).join('\n')}

🤝 *It's a tie!*

💰 *Bets have been returned to both players.*

🎮 *Battle over!*
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: message,
                mentions: playersArray.map(([id]) => id)
            });
            
            activeGames.delete(chatId);
            return;
        }
        
        // Award winner
        const winnerUserData = userPoints.get(winnerId);
        winnerUserData.points += game.pot;
        winnerUserData.wins++;
        winnerUserData.totalWon += game.pot;
        winnerUserData.highestWin = Math.max(winnerUserData.highestWin, game.pot);
        
        // Loser stats
        const loserId = playersArray.find(([id]) => id !== winnerId)[0];
        const loserUserData = userPoints.get(loserId);
        loserUserData.losses++;
        loserUserData.totalLost += game.betAmount;
        
        const message = `
⚔️ *DICE BATTLE RESULTS* ⚔️

🎲 *Rolls:*
${playersArray.map(([id, data]) => `• ${data.name}: ${getDiceEmoji(data.roll)} (${data.roll})`).join('\n')}

🏆 *WINNER:* ${winnerData.name}!
💰 *Prize:* ${game.pot} 🪙

🎯 *Winning Roll:* ${winnerData.roll}

💰 *New Balance:* ${winnerUserData.points} 🪙

🎮 *Battle over!*
        `.trim();
        
        await sock.sendMessage(chatId, {
            text: message,
            mentions: playersArray.map(([id]) => id)
        });
        
        activeGames.delete(chatId);
        
    } else if (action === 'decline') {
        const player = game.players.get(userId);
        if (!player) return;
        
        // Return points to challenger
        const challengerId = Array.from(game.players.keys())[0];
        const challengerData = userPoints.get(challengerId);
        challengerData.points += game.betAmount;
        
        await sock.sendMessage(chatId, {
            text: `❌ ${userName} declined the battle challenge!\n\n💰 ${game.players.get(challengerId).name}'s bet has been returned.`
        }, { quoted: m });
        
        activeGames.delete(chatId);
        clearTimeout(game.timeout);
    }
}

// High Low mode
async function playHighLow(sock, m, chatId, userId, userName, betAmount) {
    // Implementation for high/low guessing game
    // User predicts if next roll will be higher or lower
}

// ============= UTILITY FUNCTIONS =============

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function getDiceEmoji(number) {
    const diceEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
    return diceEmojis[number - 1] || '🎲';
}

function createDiceVisual(playerRoll, botRoll) {
    const playerEmoji = getDiceEmoji(playerRoll);
    const botEmoji = getDiceEmoji(botRoll);
    
    return `
┌─────────┐    ┌─────────┐
│         │    │         │
│    ${playerEmoji}    │ VS │    ${botEmoji}    │
│         │    │         │
└─────────┘    └─────────┘
    `.trim();
}

async function showHelp(sock, m, chatId, userData) {
    const helpText = `
🎲 *DICE GAME COMMANDS* 🎲

💰 *Your Balance:* ${userData.points} 🪙

🎯 *Game Modes:*
• \`.dice\` 
• \`.dice 100\`
• \`.dice 100 double\`
• \`.dice 100 triple\`
• \`.dice battle @user 200\`

📊 *Info Commands:*
• \`.dice stats\`
• \`.dice leaderboard\` 
• \`.dice daily\`
• \`.dice help\`

🎮 *Battle Commands:*
• \`.dice accept\` 
• \`.dice decline\`

⚡ *Rules:*
• Higher roll wins vs bot
• Doubles win 2x (Double or Nothing)
• Three of a kind wins 10x
• Battle: Winner takes all pot

💡 *Tips:*
• Start with \`.dice daily\` for free points
• Minimum bet: 10 🪙
• Have fun and gamble responsibly!
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: helpText
    }, { quoted: m });
}

async function showStats(sock, m, chatId, userId, userData, userName) {
    const winRate = userData.totalRolls > 0 
        ? ((userData.wins / userData.totalRolls) * 100).toFixed(1)
        : 0;
    
    const statsText = `
📊 *DICE STATS - ${userName}* 📊

💰 *Balance:* ${userData.points} 🪙

🏆 *Wins:* ${userData.wins}
💔 *Losses:* ${userData.losses}
🎯 *Win Rate:* ${winRate}%

📈 *Total Rolls:* ${userData.totalRolls}
✨ *Total Won:* ${userData.totalWon} 🪙
📉 *Total Lost:* ${userData.totalLost} 🪙

💰 *Highest Win:* ${userData.highestWin} 🪙

📊 *Net Profit:* ${userData.totalWon - userData.totalLost} 🪙

🏅 *Rank:* #${await getPlayerRank(userId)}
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: statsText,
        mentions: [userId]
    }, { quoted: m });
}

async function showLeaderboard(sock, m, chatId) {
    const allPlayers = Array.from(userPoints.entries())
        .map(([id, data]) => ({
            id,
            points: data.points,
            wins: data.wins,
            totalWon: data.totalWon
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);
    
    let leaderboardText = `🏆 *DICE LEADERBOARD* 🏆\n\n`;
    
    for (let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        const username = await getUsername(sock, player.id) || `Player ${i+1}`;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        
        leaderboardText += `${medal} *${username}*\n`;
        leaderboardText += `   💰 ${player.points} 🪙 | 🏆 ${player.wins} wins\n\n`;
    }
    
    if (allPlayers.length === 0) {
        leaderboardText += "No players yet! Be the first to roll dice!";
    }
    
    await sock.sendMessage(chatId, {
        text: leaderboardText
    }, { quoted: m });
}

async function getUsername(sock, userId) {
    try {
        const contact = await sock.onWhatsApp(userId);
        return contact?.[0]?.name || contact?.[0]?.pushname || null;
    } catch {
        return null;
    }
}

async function giveDailyBonus(sock, m, chatId, userId, userData) {
    const now = Date.now();
    const lastDaily = userData.lastDaily || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - lastDaily < oneDay) {
        const nextDaily = new Date(lastDaily + oneDay);
        const hoursLeft = Math.ceil((nextDaily - now) / (60 * 60 * 1000));
        
        return await sock.sendMessage(chatId, {
            text: `⏳ *Daily Bonus Already Claimed!*\n\nNext bonus available in ${hoursLeft} hours.\n\n💰 Current balance: ${userData.points} 🪙`
        }, { quoted: m });
    }
    
    const bonus = 500; // Daily bonus amount
    userData.points += bonus;
    userData.lastDaily = now;
    
    await sock.sendMessage(chatId, {
        text: `🎁 *DAILY BONUS CLAIMED!* 🎁\n\n💰 +${bonus} 🪙 added to your balance!\n\n📊 *New Balance:* ${userData.points} 🪙\n\nCome back tomorrow for more!`
    }, { quoted: m });
}

async function getPlayerRank(userId) {
    const allPlayers = Array.from(userPoints.entries())
        .sort((a, b) => b[1].points - a[1].points);
    
    const rank = allPlayers.findIndex(([id]) => id === userId) + 1;
    return rank || 'Unranked';
}

function endBattleByTimeout(chatId, gameId) {
    if (activeGames.has(chatId) && activeGames.get(chatId).id === gameId) {
        const game = activeGames.get(chatId);
        
        // Return points to players
        for (const [playerId, playerData] of game.players) {
            if (playerData.pointsDeducted) {
                const userData = userPoints.get(playerId);
                userData.points += game.betAmount;
            }
        }
        
        activeGames.delete(chatId);
    }
}

// Data persistence (optional)
async function saveData() {
    const data = {
        userPoints: Array.from(userPoints.entries()),
        timestamp: Date.now()
    };
    
    await fs.writeFile(
        path.join(process.cwd(), 'data', 'dice_game.json'),
        JSON.stringify(data, null, 2)
    );
}

async function loadData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), 'data', 'dice_game.json'),
            'utf8'
        );
        const parsed = JSON.parse(data);
        
        for (const [userId, userData] of parsed.userPoints) {
            userPoints.set(userId, userData);
        }
    } catch (error) {
        console.log("No saved data found, starting fresh");
    }
}

// Load data on startup
loadData();

// Auto-save every 5 minutes
setInterval(saveData, 5 * 60 * 1000);