import fs from 'fs/promises';
import path from 'path';

const userBalances = new Map();
const coinStats = new Map();
const activeBets = new Map();

export default {
    name: "coinflip",
    alias: ["cf", "flip", "coin"],
    desc: "Flip a coin with betting and multiplayer",
    category: "games",
    usage: `.coinflip heads 100\n.coinflip tails 200\n.coinflip challenge @user 500\n.coinflip stats\n.coinflip leaderboard\n.coinflip daily`,
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            const userId = m.key.participant || m.key.remoteJid;
            const userName = m.pushName || "Player";
            
            // Initialize user
            initUser(userId, userName);
            const userData = userBalances.get(userId);
            
            // Help command
            if (args.length === 0 || args[0] === 'help') {
                return await showHelp(sock, m, chatId, userData);
            }
            
            // Stats command
            if (args[0] === 'stats') {
                return await showStats(sock, m, chatId, userId, userData, userName);
            }
            
            // Leaderboard
            if (args[0] === 'leaderboard' || args[0] === 'lb') {
                return await showLeaderboard(sock, m, chatId);
            }
            
            // Daily bonus
            if (args[0] === 'daily') {
                return await giveDailyBonus(sock, m, chatId, userId, userData, userName);
            }
            
            // Balance check
            if (args[0] === 'balance' || args[0] === 'bal') {
                return await showBalance(sock, m, chatId, userId, userData, userName);
            }
            
            // Challenge player
            if (args[0] === 'challenge' || args[0] === 'vs') {
                return await startChallenge(sock, m, chatId, userId, userName, args);
            }
            
            // Accept challenge
            if (args[0] === 'accept') {
                return await acceptChallenge(sock, m, chatId, userId, userName);
            }
            
            // Cancel challenge
            if (args[0] === 'cancel') {
                return await cancelChallenge(sock, m, chatId, userId);
            }
            
            // Regular coin flip
            return await flipCoin(sock, m, chatId, userId, userName, args);
            
        } catch (error) {
            console.error("Coin flip error:", error);
            await sock.sendMessage(m.key.remoteJid, {
                text: `❌ Error: ${error.message}\nUse .coinflip help for instructions`
            }, { quoted: m });
        }
    }
};

// ============= GAME FUNCTIONS =============

async function flipCoin(sock, m, chatId, userId, userName, args) {
    const userData = userBalances.get(userId);
    
    // Parse bet
    let betChoice = 'heads'; // Default
    let betAmount = 0;
    
    for (const arg of args) {
        const lowerArg = arg.toLowerCase();
        if (lowerArg === 'heads' || lowerArg === 'head' || lowerArg === 'h') {
            betChoice = 'heads';
        } else if (lowerArg === 'tails' || lowerArg === 'tail' || lowerArg === 't') {
            betChoice = 'tails';
        } else {
            const amount = parseInt(arg);
            if (!isNaN(amount) && amount > 0) {
                betAmount = amount;
            }
        }
    }
    
    // Validate bet
    if (betAmount > 0) {
        if (betAmount < 10) {
            return await sock.sendMessage(chatId, {
                text: "❌ Minimum bet is 10 🪙"
            }, { quoted: m });
        }
        
        if (betAmount > userData.balance) {
            return await sock.sendMessage(chatId, {
                text: `❌ Insufficient balance!\nYour balance: ${userData.balance} 🪙\nBet: ${betAmount} 🪙`
            }, { quoted: m });
        }
        
        // Deduct bet
        userData.balance -= betAmount;
        userData.totalBet += betAmount;
    }
    
    // Send flipping animation with stages
    const flipMsg = await sock.sendMessage(chatId, {
        text: `🪙 *${userName} is flipping a coin...*\n\n⚡ The coin spins in the air...\n\n⬜⬜⬜`,
        mentions: [userId]
    }, { quoted: m });
    
    // Stage 1 animation
    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(chatId, {
        text: `🪙 *${userName} is flipping a coin...*\n\n⚡ The coin spins faster...\n\n🟩⬜⬜`,
        edit: flipMsg.key
    });
    
    // Stage 2 animation
    await new Promise(resolve => setTimeout(resolve, 500));
    await sock.sendMessage(chatId, {
        text: `🪙 *${userName} is flipping a coin...*\n\n⚡ Almost there...\n\n🟩🟩⬜`,
        edit: flipMsg.key
    });
    
    // Stage 3 animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Determine result
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const resultEmoji = result === 'heads' ? '👑' : '🐍';
    const choiceEmoji = betChoice === 'heads' ? '👑' : '🐍';
    
    let winAmount = 0;
    let resultText = '';
    let isWin = false;
    
    if (betAmount > 0) {
        if (betChoice === result) {
            // Win: 1.9x payout (5% house edge)
            winAmount = Math.floor(betAmount * 1.9);
            userData.balance += winAmount;
            userData.wins++;
            userData.totalWon += winAmount;
            userData.profit += (winAmount - betAmount);
            userData.highestWin = Math.max(userData.highestWin, winAmount);
            isWin = true;
            resultText = `🎉 *YOU WIN!* (+${winAmount} 🪙)\n💰 *Payout:* 1.9x`;
        } else {
            // Lose
            userData.losses++;
            userData.totalLost += betAmount;
            userData.profit -= betAmount;
            resultText = `💔 *YOU LOSE!* (-${betAmount} 🪙)`;
        }
        
        userData.totalFlips++;
    }
    
    // Update streak
    if (betAmount > 0) {
        if (isWin) {
            userData.currentStreak = Math.max(1, userData.currentStreak + 1);
            userData.longestStreak = Math.max(userData.longestStreak, userData.currentStreak);
        } else {
            userData.currentStreak = 0;
        }
    }
    
    // Final result message
    const message = `
🪙 *COIN FLIP RESULT* 🪙

${result === 'heads' ? '👑 HEADS' : '🐍 TAILS'}

🎯 *Your Choice:* ${betChoice.toUpperCase()} ${choiceEmoji}
🎲 *Result:* ${result.toUpperCase()} ${resultEmoji}

${betAmount > 0 ? `
${resultText}

💰 *Bet:* ${betAmount} 🪙
${isWin ? `✨ *Won:* ${winAmount} 🪙` : ''}
💎 *Balance:* ${userData.balance} 🪙
${userData.currentStreak > 1 ? `🔥 *Win Streak:* ${userData.currentStreak}` : ''}
` : '🎲 *Just flipping for fun!*'}

${betAmount > 0 && isWin ? `*Next: .coinflip ${result === 'heads' ? 'tails' : 'heads'} ${Math.floor(betAmount * 0.5)}*` : ''}
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        edit: flipMsg.key
    });
    
    // Save data
    saveData();
}

async function startChallenge(sock, m, chatId, userId, userName, args) {
    const userData = userBalances.get(userId);
    
    // Find mentioned user
    let opponentId = null;
    let betAmount = 100; // Default
    
    if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        opponentId = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    
    // Parse bet amount
    for (const arg of args) {
        const amount = parseInt(arg);
        if (!isNaN(amount) && amount > 0) {
            betAmount = amount;
            break;
        }
    }
    
    if (!opponentId) {
        return await sock.sendMessage(chatId, {
            text: "❌ Please mention a user to challenge!\nExample: `.coinflip challenge @user 500`"
        }, { quoted: m });
    }
    
    if (opponentId === userId) {
        return await sock.sendMessage(chatId, {
            text: "❌ You can't challenge yourself!"
        }, { quoted: m });
    }
    
    // Check if opponent exists
    const opponentData = userBalances.get(opponentId) || initUser(opponentId, "Opponent");
    
    // Validate bet
    if (betAmount < 50) {
        return await sock.sendMessage(chatId, {
            text: "❌ Minimum challenge bet is 50 🪙"
        });
    }
    
    if (userData.balance < betAmount) {
        return await sock.sendMessage(chatId, {
            text: `❌ You don't have enough coins!\nYour balance: ${userData.balance} 🪙`
        });
    }
    
    if (opponentData.balance < betAmount) {
        return await sock.sendMessage(chatId, {
            text: "❌ Your opponent doesn't have enough coins!"
        });
    }
    
    // Check for existing challenge
    const existingChallenge = findChallenge(userId, opponentId);
    if (existingChallenge) {
        return await sock.sendMessage(chatId, {
            text: "❌ You already have an active challenge with this user!"
        });
    }
    
    // Create challenge
    const challengeId = `${chatId}_${Date.now()}`;
    const challenge = {
        id: challengeId,
        chatId,
        challenger: { id: userId, name: userName, choice: null },
        opponent: { id: opponentId, name: opponentData.name, choice: null },
        betAmount,
        pot: betAmount * 2,
        status: 'pending',
        createdAt: Date.now(),
        challengeMsg: null,
        timeout: setTimeout(() => expireChallenge(challengeId), 120000) // 2 minutes
    };
    
    activeBets.set(challengeId, challenge);
    
    const opponentName = await getUsername(sock, opponentId) || "Opponent";
    challenge.opponent.name = opponentName;
    
    const message = `
⚔️ *COIN FLIP CHALLENGE* ⚔️

👤 *Challenger:* ${userName}
🎯 *Opponent:* ${opponentName}
💰 *Bet Amount:* ${betAmount} 🪙 each
🏆 *Total Pot:* ${challenge.pot} 🪙

📝 *How to play:*
1. Both players choose heads or tails
2. Coin is flipped
3. Player with correct guess wins the pot!
4. If both guess wrong, coin is flipped again

🎮 *${opponentName}, type:* \`.coinflip accept\`
*to accept the challenge!*

*Or choose your side directly:*
\`.coinflip heads\` or \`.coinflip tails\`

⏰ *Challenge expires in 2 minutes*
    `.trim();
    
    const challengeMsg = await sock.sendMessage(chatId, {
        text: message,
        mentions: [userId, opponentId]
    }, { quoted: m });
    
    challenge.challengeMsg = challengeMsg;
}

async function acceptChallenge(sock, m, chatId, userId, userName) {
    const userData = userBalances.get(userId);
    
    // Find challenge where user is opponent
    let challenge = null;
    for (const [id, ch] of activeBets) {
        if (ch.status === 'pending' && ch.opponent.id === userId) {
            challenge = ch;
            break;
        }
    }
    
    if (!challenge) {
        return await sock.sendMessage(chatId, {
            text: "❌ No pending challenges found for you!"
        }, { quoted: m });
    }
    
    // Check balance
    if (userData.balance < challenge.betAmount) {
        await sock.sendMessage(chatId, {
            text: `❌ You don't have enough coins!\nNeeded: ${challenge.betAmount} 🪙\nYour balance: ${userData.balance} 🪙`
        });
        
        activeBets.delete(challenge.id);
        clearTimeout(challenge.timeout);
        return;
    }
    
    // Update challenge message
    const message = `
✅ *CHALLENGE ACCEPTED!*

👤 *Players:*
• ${challenge.challenger.name}
• ${challenge.opponent.name}

💰 *Pot:* ${challenge.pot} 🪙

🎯 *Now both players choose heads or tails:*
\`.coinflip heads\` or \`.coinflip tails\`

*The coin will be flipped once both players have chosen!*

⏰ *Make your choice within 1 minute*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        edit: challenge.challengeMsg.key,
        mentions: [challenge.challenger.id, challenge.opponent.id]
    });
    
    // Update challenge
    challenge.status = 'waiting_choices';
    clearTimeout(challenge.timeout);
    
    // Set new timeout
    challenge.timeout = setTimeout(() => expireChallenge(challenge.id), 60000);
}

async function cancelChallenge(sock, m, chatId, userId) {
    // Find user's challenges
    const userChallenges = [];
    
    for (const [id, challenge] of activeBets) {
        if ((challenge.challenger.id === userId || challenge.opponent.id === userId) && 
            challenge.status === 'pending') {
            userChallenges.push(challenge);
        }
    }
    
    if (userChallenges.length === 0) {
        return await sock.sendMessage(chatId, {
            text: "❌ No pending challenges to cancel!"
        }, { quoted: m });
    }
    
    // Cancel all user's challenges
    for (const challenge of userChallenges) {
        clearTimeout(challenge.timeout);
        activeBets.delete(challenge.id);
        
        if (challenge.challengeMsg) {
            await sock.sendMessage(chatId, {
                text: `❌ *Challenge cancelled by ${challenge.challenger.id === userId ? 'challenger' : 'opponent'}!*`,
                edit: challenge.challengeMsg.key
            });
        }
    }
}

// Handle coin choice for challenges
async function handleCoinChoice(sock, m, chatId, userId, userName, choice) {
    // Find challenge where user needs to choose
    let challenge = null;
    
    for (const [id, ch] of activeBets) {
        if (ch.status === 'waiting_choices' && 
            (ch.challenger.id === userId || ch.opponent.id === userId)) {
            
            // Check if user already chose
            const isChallenger = ch.challenger.id === userId;
            const userField = isChallenger ? 'challenger' : 'opponent';
            
            if (!ch[userField].choice) {
                challenge = ch;
                ch[userField].choice = choice;
                break;
            }
        }
    }
    
    if (!challenge) {
        // Not in a challenge, do regular flip
        return await flipCoin(sock, m, chatId, userId, userName, [choice]);
    }
    
    // Update challenge message with choice
    const otherPlayer = challenge.challenger.id === userId ? challenge.opponent : challenge.challenger;
    const choiceMsg = await sock.sendMessage(chatId, {
        text: `✅ *${userName} chose ${choice.toUpperCase()}!*\n\nWaiting for ${otherPlayer.name} to choose...\n\n🕐 *Time remaining: 60 seconds*`,
        edit: challenge.challengeMsg.key,
        mentions: [challenge.challenger.id, challenge.opponent.id]
    });
    
    // Check if both players have chosen
    const bothChosen = challenge.challenger.choice && challenge.opponent.choice;
    
    if (bothChosen) {
        // Create flipping animation for challenge
        const flipMsg = await sock.sendMessage(chatId, {
            text: `⚔️ *CHALLENGE COIN FLIP*\n\n🎯 Both players have chosen!\n\n🪙 Flipping the coin...\n\n⬜⬜⬜`
        });
        
        // Animation stages
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(chatId, {
            text: `⚔️ *CHALLENGE COIN FLIP*\n\n🎯 Both players have chosen!\n\n🪙 Coin spinning...\n\n🟩⬜⬜`,
            edit: flipMsg.key
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        await sock.sendMessage(chatId, {
            text: `⚔️ *CHALLENGE COIN FLIP*\n\n🎯 Both players have chosen!\n\n🪙 Almost there...\n\n🟩🟩⬜`,
            edit: flipMsg.key
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Deduct bets
        const challengerData = userBalances.get(challenge.challenger.id);
        const opponentData = userBalances.get(challenge.opponent.id);
        
        challengerData.balance -= challenge.betAmount;
        challengerData.totalBet += challenge.betAmount;
        opponentData.balance -= challenge.betAmount;
        opponentData.totalBet += challenge.betAmount;
        
        // Flip coin
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        
        // Determine winner(s)
        const challengerCorrect = challenge.challenger.choice === result;
        const opponentCorrect = challenge.opponent.choice === result;
        
        let winner = null;
        let isTie = false;
        
        if (challengerCorrect && !opponentCorrect) {
            winner = challenge.challenger;
        } else if (!challengerCorrect && opponentCorrect) {
            winner = challenge.opponent;
        } else if (challengerCorrect && opponentCorrect) {
            isTie = true;
        }
        
        if (winner) {
            // Single winner
            const winnerData = userBalances.get(winner.id);
            winnerData.balance += challenge.pot;
            winnerData.wins++;
            winnerData.totalWon += challenge.pot;
            winnerData.profit += challenge.betAmount;
            winnerData.highestWin = Math.max(winnerData.highestWin, challenge.pot);
            winnerData.totalFlips++;
            
            const loserId = winner.id === challenge.challenger.id ? challenge.opponent.id : challenge.challenger.id;
            const loserData = userBalances.get(loserId);
            loserData.losses++;
            loserData.totalLost += challenge.betAmount;
            loserData.profit -= challenge.betAmount;
            loserData.totalFlips++;
            
            const message = `
⚔️ *CHALLENGE COMPLETE* ⚔️

🎲 *Coin Result:* ${result.toUpperCase()} ${result === 'heads' ? '👑' : '🐍'}

👤 *${challenge.challenger.name}:* ${challenge.challenger.choice} ${challenge.challenger.choice === result ? '✅' : '❌'}
👤 *${challenge.opponent.name}:* ${challenge.opponent.choice} ${challenge.opponent.choice === result ? '✅' : '❌'}

🏆 *WINNER:* ${winner.name}!
💰 *Prize:* ${challenge.pot} 🪙

🎉 *Congratulations!*
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: message,
                edit: flipMsg.key,
                mentions: [challenge.challenger.id, challenge.opponent.id]
            });
            
        } else if (isTie) {
            // Both correct - split pot
            const challengerData = userBalances.get(challenge.challenger.id);
            const opponentData = userBalances.get(challenge.opponent.id);
            
            const halfPot = challenge.betAmount;
            challengerData.balance += halfPot;
            opponentData.balance += halfPot;
            
            challengerData.totalFlips++;
            opponentData.totalFlips++;
            
            const message = `
⚔️ *CHALLENGE - TIE!* ⚔️

🎲 *Coin Result:* ${result.toUpperCase()} ${result === 'heads' ? '👑' : '🐍'}

👤 *${challenge.challenger.name}:* ${challenge.challenger.choice} ✅
👤 *${challenge.opponent.name}:* ${challenge.opponent.choice} ✅

🤝 *Both players guessed correctly!*

💰 *Each player gets their bet back.*

*Amazing coincidence!*
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: message,
                edit: flipMsg.key,
                mentions: [challenge.challenger.id, challenge.opponent.id]
            });
            
        } else {
            // Both wrong - flip again
            const message = `
⚔️ *NOBODY GUESSED RIGHT!* ⚔️

🎲 *Coin Result:* ${result.toUpperCase()} ${result === 'heads' ? '👑' : '🐍'}

👤 *${challenge.challenger.name}:* ${challenge.challenger.choice} ❌
👤 *${challenge.opponent.name}:* ${challenge.opponent.choice} ❌

🔄 *Flipping coin again...*

*Both players choose again:*
\`.coinflip heads\` or \`.coinflip tails\`

⏰ *30 seconds to choose*
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: message,
                edit: flipMsg.key,
                mentions: [challenge.challenger.id, challenge.opponent.id]
            });
            
            // Reset choices for next round
            challenge.challenger.choice = null;
            challenge.opponent.choice = null;
            
            // Update challenge message
            challenge.challengeMsg = flipMsg;
            
            // Set new timeout
            clearTimeout(challenge.timeout);
            challenge.timeout = setTimeout(() => expireChallenge(challenge.id), 30000);
            
            return;
        }
        
        // Cleanup
        clearTimeout(challenge.timeout);
        activeBets.delete(challenge.id);
        
    } else {
        // Update timer on challenge message
        const timeLeft = Math.floor((challenge.createdAt + 120000 - Date.now()) / 1000);
        if (timeLeft > 0) {
            setTimeout(() => {
                if (activeBets.has(challenge.id)) {
                    sock.sendMessage(chatId, {
                        text: `✅ *${userName} chose ${choice.toUpperCase()}!*\n\nWaiting for ${otherPlayer.name} to choose...\n\n🕐 *Time remaining: ${timeLeft - 1} seconds*`,
                        edit: challenge.challengeMsg.key,
                        mentions: [challenge.challenger.id, challenge.opponent.id]
                    });
                }
            }, 1000);
        }
    }
    
    saveData();
}

// ============= UTILITY FUNCTIONS =============

function initUser(userId, userName) {
    if (!userBalances.has(userId)) {
        userBalances.set(userId, {
            name: userName,
            balance: 1000,
            wins: 0,
            losses: 0,
            totalFlips: 0,
            totalBet: 0,
            totalWon: 0,
            totalLost: 0,
            profit: 0,
            highestWin: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastDaily: 0
        });
    }
    return userBalances.get(userId);
}

function findChallenge(userId1, userId2) {
    for (const challenge of activeBets.values()) {
        if ((challenge.challenger.id === userId1 && challenge.opponent.id === userId2) ||
            (challenge.challenger.id === userId2 && challenge.opponent.id === userId1)) {
            return challenge;
        }
    }
    return null;
}

async function showHelp(sock, m, chatId, userData) {
    const helpMsg = await sock.sendMessage(chatId, {
        text: `🪙 *Loading Coin Flip Help...*\n\n⬜⬜⬜⬜⬜`
    }, { quoted: m });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const helpText = `
🪙 *COIN FLIP COMMANDS* 🪙

💰 *Your Balance:* ${userData.balance} 🪙

🎯 *Basic Game:*
• \`.coinflip heads 100\` - Bet 100 on heads
• \`.coinflip tails 200\` - Bet 200 on tails
• \`.coinflip 50\` - Bet 50 on last choice

⚔️ *Challenges:*
• \`.coinflip challenge @user 500\` - Challenge player
• \`.coinflip accept\` - Accept challenge
• \`.coinflip cancel\` - Cancel your challenges

📊 *Info Commands:*
• \`.coinflip stats\` - Your statistics
• \`.coinflip leaderboard\` - Top players
• \`.coinflip daily\` - Daily bonus
• \`.coinflip balance\` - Check balance

💰 *Payouts:*
• Single player: 1.9x (5% house edge)
• Challenge: Winner takes all pot
• Minimum bet: 10 🪙
• Challenge min: 50 🪙

💡 *Tips:*
• Bet on your lucky side!
• Challenge friends for bigger pots
• Claim daily bonus every 24h
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: helpText,
        edit: helpMsg.key
    });
}

async function showStats(sock, m, chatId, userId, userData, userName) {
    const statsMsg = await sock.sendMessage(chatId, {
        text: `📊 *Loading ${userName}'s Statistics...*\n\n⬜⬜⬜`
    }, { quoted: m });
    
    const winRate = userData.totalFlips > 0 
        ? ((userData.wins / userData.totalFlips) * 100).toFixed(1)
        : 0;
    
    const statsText = `
📊 *COIN FLIP STATS - ${userName}* 📊

💰 *Balance:* ${userData.balance} 🪙
📈 *Net Profit:* ${userData.profit} 🪙

🏆 *Wins:* ${userData.wins}
💔 *Losses:* ${userData.losses}
🎯 *Win Rate:* ${winRate}%

🎲 *Total Flips:* ${userData.totalFlips}
💰 *Total Bet:* ${userData.totalBet} 🪙
✨ *Total Won:* ${userData.totalWon} 🪙
📉 *Total Lost:* ${userData.totalLost} 🪙

💰 *Highest Win:* ${userData.highestWin} 🪙
🔥 *Longest Streak:* ${userData.longestStreak}
⚡ *Current Streak:* ${userData.currentStreak}

🎮 *Keep flipping to improve your stats!*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: statsText,
        edit: statsMsg.key,
        mentions: [userId]
    });
}

async function showLeaderboard(sock, m, chatId) {
    const lbMsg = await sock.sendMessage(chatId, {
        text: `🏆 *Loading Leaderboard...*\n\n⬜⬜⬜`
    });
    
    const allPlayers = Array.from(userBalances.entries())
        .map(([id, data]) => ({ id, ...data }))
        .filter(p => p.totalFlips > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
    
    let leaderboardText = `🏆 *COIN FLIP LEADERBOARD* 🏆\n\n`;
    
    for (let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        const username = player.name || `Player ${i+1}`;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        
        leaderboardText += `${medal} *${username}*\n`;
        leaderboardText += `   💰 ${player.balance} 🪙 | 🏆 ${player.wins} wins\n\n`;
    }
    
    if (allPlayers.length === 0) {
        leaderboardText += "No players yet! Be the first to flip coins!";
    }
    
    leaderboardText += `\n*Flip coins to climb the ranks!*`;
    
    await sock.sendMessage(chatId, {
        text: leaderboardText,
        edit: lbMsg.key
    });
}

async function giveDailyBonus(sock, m, chatId, userId, userData, userName) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - userData.lastDaily < oneDay) {
        const nextDaily = new Date(userData.lastDaily + oneDay);
        const hoursLeft = Math.ceil((nextDaily - now) / (60 * 60 * 1000));
        
        return await sock.sendMessage(chatId, {
            text: `⏳ *Already claimed today!*\n\nNext bonus in ${hoursLeft} hours.\n💰 Balance: ${userData.balance} 🪙`
        }, { quoted: m });
    }
    
    const dailyMsg = await sock.sendMessage(chatId, {
        text: `🎁 *Checking Daily Bonus...*\n\n🔍 Calculating your reward...`
    }, { quoted: m });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bonus = Math.floor(Math.random() * 300) + 200; // 200-500 random
    userData.balance += bonus;
    userData.lastDaily = now;
    
    await sock.sendMessage(chatId, {
        text: `🎁 *DAILY BONUS!* 🎁\n\n💰 +${bonus} 🪙 added!\n\n📊 *New Balance:* ${userData.balance} 🪙\n\n*Come back tomorrow for more!*`,
        edit: dailyMsg.key
    });
    
    saveData();
}

async function showBalance(sock, m, chatId, userId, userData, userName) {
    const balanceMsg = await sock.sendMessage(chatId, {
        text: `💰 *Checking Balance...*`
    }, { quoted: m });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await sock.sendMessage(chatId, {
        text: `💰 *${userName}'s Balance:* ${userData.balance} 🪙\n\n*Keep flipping to increase your coins!*`,
        edit: balanceMsg.key,
        mentions: [userId]
    });
}

async function getUsername(sock, userId) {
    try {
        const contact = await sock.onWhatsApp(userId);
        return contact?.[0]?.name || contact?.[0]?.pushname || null;
    } catch {
        return null;
    }
}

function expireChallenge(challengeId) {
    if (activeBets.has(challengeId)) {
        const challenge = activeBets.get(challengeId);
        
        if (challenge.challengeMsg) {
            sock.sendMessage(challenge.chatId, {
                text: `⏰ *Challenge expired!*\n\nNo response from ${challenge.status === 'pending' ? challenge.opponent.name : 'players'}.\n\n*Challenge cancelled.*`,
                edit: challenge.challengeMsg.key
            });
        }
        
        activeBets.delete(challengeId);
        clearTimeout(challenge.timeout);
    }
}

// ============= DATA PERSISTENCE =============

async function saveData() {
    const data = {
        userBalances: Array.from(userBalances.entries()),
        activeBets: Array.from(activeBets.entries()).map(([id, bet]) => [id, {
            ...bet,
            timeout: null,
            challengeMsg: null // Don't save message reference
        }]),
        timestamp: Date.now()
    };
    
    try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
        await fs.writeFile(
            path.join(process.cwd(), 'data', 'coinflip.json'),
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("Failed to save coinflip data:", error);
    }
}

async function loadData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), 'data', 'coinflip.json'),
            'utf8'
        );
        const parsed = JSON.parse(data);
        
        // Load user balances
        for (const [userId, userData] of parsed.userBalances) {
            userBalances.set(userId, userData);
        }
        
        // Load active bets (without timeouts)
        for (const [id, bet] of parsed.activeBets) {
            activeBets.set(id, bet);
        }
        
        console.log(`Loaded ${userBalances.size} users and ${activeBets.size} active bets`);
    } catch (error) {
        console.log("No coinflip data found, starting fresh");
    }
}

// Initialize
loadData();
setInterval(saveData, 300000); // Save every 5 minutes
setInterval(() => {
    // Cleanup expired challenges
    const now = Date.now();
    for (const [id, challenge] of activeBets) {
        if (now - challenge.createdAt > 300000) { // 5 minutes max
            expireChallenge(id);
        }
    }
}, 60000); // Check every minute