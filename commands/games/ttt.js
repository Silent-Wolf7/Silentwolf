import fs from 'fs/promises';
import path from 'path';

const activeGames = new Map();
const gameStats = new Map();

export default {
    name: "tictactoe",
    alias: ["ttt", "xoxo"],
    desc: "Play Tic Tac Toe with friends or AI",
    category: "games",
    usage: `.ttt @friend - Challenge a friend\n.ttt ai - Play against AI\n.ttt join - Join a game\n.ttt move [1-9] - Make a move\n.ttt surrender - Surrender game\n.ttt stats - Your statistics`,
    
    async execute(sock, m, args) {
        try {
            const chatId = m.key.remoteJid;
            const userId = m.key.participant || m.key.remoteJid;
            const userName = m.pushName || "Player";
            
            // Initialize stats
            if (!gameStats.has(userId)) {
                gameStats.set(userId, { wins: 0, losses: 0, draws: 0, total: 0 });
            }
            
            const action = args[0]?.toLowerCase();
            
            // Help command
            if (!action || action === 'help') {
                return await showHelp(sock, m, chatId);
            }
            
            // Stats command
            if (action === 'stats') {
                return await showStats(sock, m, chatId, userId, userName);
            }
            
            // Leaderboard
            if (action === 'leaderboard' || action === 'lb') {
                return await showLeaderboard(sock, m, chatId);
            }
            
            // Check for active game
            const existingGame = findUserGame(userId);
            if (existingGame) {
                return await handleGameAction(sock, m, args, existingGame, userId, userName);
            }
            
            // Start new game
            if (action === 'ai' || action === 'bot') {
                return await startAIGame(sock, m, chatId, userId, userName);
            }
            
            // Challenge friend
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                const opponentId = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
                if (opponentId === userId) {
                    return await sock.sendMessage(chatId, { text: "❌ You can't play against yourself!" }, { quoted: m });
                }
                return await startPvPGame(sock, m, chatId, userId, opponentId, userName);
            }
            
            // Join random game
            if (action === 'join' || action === 'random') {
                return await joinRandomGame(sock, m, chatId, userId, userName);
            }
            
            // Show available games
            if (action === 'list' || action === 'games') {
                return await showAvailableGames(sock, m, chatId);
            }
            
            return await showHelp(sock, m, chatId);
            
        } catch (error) {
            console.error("Tic Tac Toe error:", error);
            await sock.sendMessage(m.key.remoteJid, {
                text: `❌ Error: ${error.message}\nUse .ttt help for instructions`
            }, { quoted: m });
        }
    }
};

// ============= GAME LOGIC =============

async function startPvPGame(sock, m, chatId, player1Id, player2Id, player1Name) {
    // Check if opponent is already in a game
    if (findUserGame(player2Id)) {
        return await sock.sendMessage(chatId, {
            text: "❌ That player is already in a game!"
        }, { quoted: m });
    }
    
    const player2Name = await getUsername(sock, player2Id) || "Player 2";
    const gameId = `${chatId}_${Date.now()}`;
    
    const game = {
        id: gameId,
        chatId,
        board: Array(9).fill(null),
        players: [
            { id: player1Id, name: player1Name, symbol: '❌', isTurn: true },
            { id: player2Id, name: player2Name, symbol: '⭕', isTurn: false }
        ],
        currentPlayer: 0,
        status: 'waiting',
        moves: 0,
        createdAt: Date.now(),
        timeout: setTimeout(() => endGameByTimeout(gameId), 300000) // 5 minutes
    };
    
    activeGames.set(gameId, game);
    
    const boardDisplay = generateBoard(game.board);
    const message = `
🎮 *TIC TAC TOE - NEW GAME* 🎮

${boardDisplay}

👤 *Player 1:* ${player1Name} ❌
👤 *Player 2:* ${player2Name} ⭕

🎯 *Current Turn:* ${player1Name} ❌

*${player2Name}, type \`.ttt accept\` to accept the challenge!*
*Or type \`.ttt decline\` to reject it.*

📍 *Positions (1-9):*
1️⃣ 2️⃣ 3️⃣
4️⃣ 5️⃣ 6️⃣
7️⃣ 8️⃣ 9️⃣

*Game will auto-cancel in 5 minutes.*
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [player1Id, player2Id]
    }, { quoted: m });
}

async function startAIGame(sock, m, chatId, userId, userName) {
    const gameId = `${chatId}_${Date.now()}`;
    
    const game = {
        id: gameId,
        chatId,
        board: Array(9).fill(null),
        players: [
            { id: userId, name: userName, symbol: '❌', isTurn: true },
            { id: 'ai', name: 'AI Bot 🤖', symbol: '⭕', isTurn: false }
        ],
        currentPlayer: 0,
        status: 'active',
        moves: 0,
        difficulty: args[1] || 'medium',
        createdAt: Date.now()
    };
    
    activeGames.set(gameId, game);
    
    const boardDisplay = generateBoard(game.board);
    const message = `
🤖 *TIC TAC TOE VS AI* 🤖

${boardDisplay}

👤 *You:* ${userName} ❌
🤖 *AI:* ${game.players[1].name} ⭕

🎯 *Your Turn First!*

📍 *Make a move:* \`.ttt move [1-9]\`
*Example:* \`.ttt move 5\` for center

📍 *Positions (1-9):*
1️⃣ 2️⃣ 3️⃣
4️⃣ 5️⃣ 6️⃣
7️⃣ 8️⃣ 9️⃣
    `.trim();
    
    await sock.sendMessage(chatId, { text: message }, { quoted: m });
}

async function handleGameAction(sock, m, args, game, userId, userName) {
    const action = args[0]?.toLowerCase();
    const chatId = m.key.remoteJid;
    
    // Accept game
    if (action === 'accept') {
        if (game.status !== 'waiting') {
            return await sock.sendMessage(chatId, { text: "Game is not waiting for acceptance." });
        }
        
        const player2 = game.players[1];
        if (player2.id !== userId) {
            return await sock.sendMessage(chatId, { text: "This challenge is not for you!" });
        }
        
        game.status = 'active';
        clearTimeout(game.timeout);
        
        const boardDisplay = generateBoard(game.board);
        const message = `
🎮 *GAME ACCEPTED!* 🎮

${boardDisplay}

👤 *Player 1:* ${game.players[0].name} ❌
👤 *Player 2:* ${player2.name} ⭕

🎯 *Current Turn:* ${game.players[0].name} ❌

📍 *Make a move:* \`.ttt move [1-9]\`
*Example:* \`.ttt move 5\` for center
        `.trim();
        
        await sock.sendMessage(chatId, {
            text: message,
            mentions: [game.players[0].id, player2.id]
        });
        return;
    }
    
    // Decline game
    if (action === 'decline') {
        if (game.status !== 'waiting') return;
        
        const player2 = game.players[1];
        if (player2.id !== userId) return;
        
        await sock.sendMessage(chatId, {
            text: `❌ ${player2.name} declined the game challenge!`
        });
        
        activeGames.delete(game.id);
        clearTimeout(game.timeout);
        return;
    }
    
    // Surrender
    if (action === 'surrender' || action === 'ff' || action === 'forfeit') {
        const playerIndex = game.players.findIndex(p => p.id === userId);
        if (playerIndex === -1) return;
        
        const winnerIndex = playerIndex === 0 ? 1 : 0;
        const winner = game.players[winnerIndex];
        
        // Update stats
        updateStats(game.players[playerIndex].id, false);
        updateStats(winner.id, true);
        
        await sock.sendMessage(chatId, {
            text: `🏳️ *${game.players[playerIndex].name} surrendered!*\n\n🏆 *Winner:* ${winner.name} ${winner.symbol}`
        });
        
        activeGames.delete(game.id);
        if (game.timeout) clearTimeout(game.timeout);
        return;
    }
    
    // Make a move
    if (action === 'move' && args[1]) {
        return await handleMove(sock, m, game, userId, parseInt(args[1]));
    }
    
    // Show board
    if (action === 'board' || action === 'show') {
        const boardDisplay = generateBoard(game.board);
        const currentPlayer = game.players[game.currentPlayer];
        
        await sock.sendMessage(chatId, {
            text: `${boardDisplay}\n\n🎯 *Current Turn:* ${currentPlayer.name} ${currentPlayer.symbol}`
        });
        return;
    }
}

async function handleMove(sock, m, game, userId, position) {
    const chatId = m.key.remoteJid;
    
    // Validate move
    if (isNaN(position) || position < 1 || position > 9) {
        return await sock.sendMessage(chatId, { text: "❌ Invalid move! Use numbers 1-9." });
    }
    
    const boardIndex = position - 1;
    
    // Check if it's player's turn
    const currentPlayer = game.players[game.currentPlayer];
    if (currentPlayer.id !== userId) {
        return await sock.sendMessage(chatId, { 
            text: `❌ Not your turn! It's ${currentPlayer.name}'s turn.` 
        });
    }
    
    // Check if position is empty
    if (game.board[boardIndex] !== null) {
        return await sock.sendMessage(chatId, { text: "❌ That position is already taken!" });
    }
    
    // Make move
    game.board[boardIndex] = currentPlayer.symbol;
    game.moves++;
    
    // Check for win
    if (checkWin(game.board, currentPlayer.symbol)) {
        // Update stats
        updateStats(currentPlayer.id, true);
        updateStats(game.players[1 - game.currentPlayer].id, false);
        
        const boardDisplay = generateBoard(game.board);
        await sock.sendMessage(chatId, {
            text: `🏆 *${currentPlayer.name} WINS!* ${currentPlayer.symbol}\n\n${boardDisplay}\n\n🎮 *Game Over!*`
        });
        
        activeGames.delete(game.id);
        if (game.timeout) clearTimeout(game.timeout);
        return;
    }
    
    // Check for draw
    if (game.moves === 9) {
        // Update stats for draw
        updateStats(game.players[0].id, null);
        updateStats(game.players[1].id, null);
        
        const boardDisplay = generateBoard(game.board);
        await sock.sendMessage(chatId, {
            text: `🤝 *IT'S A DRAW!*\n\n${boardDisplay}\n\n🎮 *Game Over!*`
        });
        
        activeGames.delete(game.id);
        if (game.timeout) clearTimeout(game.timeout);
        return;
    }
    
    // Switch turn
    game.currentPlayer = 1 - game.currentPlayer;
    
    // If playing against AI, let AI make a move
    if (game.players[game.currentPlayer].id === 'ai') {
        setTimeout(() => makeAIMove(sock, game), 1000);
    }
    
    // Show updated board
    const boardDisplay = generateBoard(game.board);
    const nextPlayer = game.players[game.currentPlayer];
    
    await sock.sendMessage(chatId, {
        text: `${boardDisplay}\n\n✅ *Move placed at position ${position}*\n\n🎯 *Next Turn:* ${nextPlayer.name} ${nextPlayer.symbol}`
    });
}

function makeAIMove(sock, game) {
    if (!activeGames.has(game.id)) return;
    
    const aiPlayer = game.players[game.currentPlayer];
    let move;
    
    // Simple AI logic
    if (game.difficulty === 'hard') {
        move = getBestMove(game.board, aiPlayer.symbol);
    } else {
        // Medium AI: try to win, then block, then random
        move = getSmartMove(game.board, aiPlayer.symbol);
    }
    
    if (move === -1) {
        // Random move
        const emptySpots = game.board.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
        if (emptySpots.length > 0) {
            move = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }
    }
    
    if (move !== -1) {
        game.board[move] = aiPlayer.symbol;
        game.moves++;
        
        // Check AI win
        if (checkWin(game.board, aiPlayer.symbol)) {
            const humanPlayer = game.players[1 - game.currentPlayer];
            updateStats(humanPlayer.id, false);
            
            const boardDisplay = generateBoard(game.board);
            sock.sendMessage(game.chatId, {
                text: `🤖 *AI WINS!* ${aiPlayer.symbol}\n\n${boardDisplay}\n\n🎮 *Game Over!*`
            });
            
            activeGames.delete(game.id);
            return;
        }
        
        // Check draw
        if (game.moves === 9) {
            const humanPlayer = game.players[1 - game.currentPlayer];
            updateStats(humanPlayer.id, null);
            
            const boardDisplay = generateBoard(game.board);
            sock.sendMessage(game.chatId, {
                text: `🤝 *IT'S A DRAW!*\n\n${boardDisplay}\n\n🎮 *Game Over!*`
            });
            
            activeGames.delete(game.id);
            return;
        }
        
        // Switch back to human
        game.currentPlayer = 1 - game.currentPlayer;
        
        const boardDisplay = generateBoard(game.board);
        const humanPlayer = game.players[game.currentPlayer];
        
        sock.sendMessage(game.chatId, {
            text: `🤖 *AI placed at position ${move + 1}*\n\n${boardDisplay}\n\n🎯 *Your Turn:* ${humanPlayer.name} ${humanPlayer.symbol}`
        });
    }
}

// ============= UTILITY FUNCTIONS =============

function generateBoard(board) {
    const cells = board.map((cell, idx) => cell || (idx + 1).toString());
    
    return `
┌───┬───┬───┐
│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
├───┼───┼───┤
│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
├───┼───┼───┤
│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
└───┴───┴───┘
    `.trim();
}

function checkWin(board, symbol) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // columns
        [0,4,8], [2,4,6] // diagonals
    ];
    
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === symbol)
    );
}

function getSmartMove(board, symbol) {
    const opponent = symbol === '❌' ? '⭕' : '❌';
    
    // Try to win
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = symbol;
            if (checkWin(board, symbol)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    
    // Try to block opponent
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = opponent;
            if (checkWin(board, opponent)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    
    // Take center if available
    if (board[4] === null) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(idx => board[idx] === null);
    if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    
    return -1;
}

function getBestMove(board, symbol) {
    // Minimax algorithm for hard AI
    return minimax(board, symbol, symbol).index;
}

function minimax(newBoard, player, maximizingPlayer) {
    const availSpots = newBoard.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
    const opponent = maximizingPlayer === '❌' ? '⭕' : '❌';
    
    // Check for terminal states
    if (checkWin(newBoard, maximizingPlayer)) return { score: 10 };
    if (checkWin(newBoard, opponent)) return { score: -10 };
    if (availSpots.length === 0) return { score: 0 };
    
    const moves = [];
    
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        
        newBoard[availSpots[i]] = player;
        
        if (player === maximizingPlayer) {
            const result = minimax(newBoard, opponent, maximizingPlayer);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, maximizingPlayer, maximizingPlayer);
            move.score = result.score;
        }
        
        newBoard[availSpots[i]] = null;
        moves.push(move);
    }
    
    let bestMove;
    if (player === maximizingPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    return moves[bestMove];
}

function findUserGame(userId) {
    for (const game of activeGames.values()) {
        if (game.players.some(p => p.id === userId)) {
            return game;
        }
    }
    return null;
}

function updateStats(userId, won) {
    if (userId === 'ai') return;
    
    const stats = gameStats.get(userId) || { wins: 0, losses: 0, draws: 0, total: 0 };
    
    if (won === true) {
        stats.wins++;
    } else if (won === false) {
        stats.losses++;
    } else {
        stats.draws++;
    }
    
    stats.total++;
    gameStats.set(userId, stats);
}

async function showHelp(sock, m, chatId) {
    const helpText = `
🎮 *TIC TAC TOE COMMANDS* 🎮

*Start Games:*
• \`.ttt @friend\`
• \`.ttt ai\`
• \`.ttt join\`
• \`.ttt list\` 

*Game Commands:*
• \`.ttt move [1-9]\`
• \`.ttt board\`
• \`.ttt surrender\`
• \`.ttt accept\`
• \`.ttt decline\`

*Info Commands:*
• \`.ttt stats\`
• \`.ttt leaderboard\`
• \`.ttt help\`

📍 *Board Positions:*
1️⃣ 2️⃣ 3️⃣
4️⃣ 5️⃣ 6️⃣
7️⃣ 8️⃣ 9️⃣

*Example:* \`.ttt move 5\` places in center
    `.trim();
    
    await sock.sendMessage(chatId, { text: helpText }, { quoted: m });
}

async function showStats(sock, m, chatId, userId, userName) {
    const stats = gameStats.get(userId) || { wins: 0, losses: 0, draws: 0, total: 0 };
    const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;
    
    const statsText = `
📊 *TIC TAC TOE STATS - ${userName}* 📊

🏆 *Wins:* ${stats.wins}
💔 *Losses:* ${stats.losses}
🤝 *Draws:* ${stats.draws}
📈 *Total Games:* ${stats.total}
🎯 *Win Rate:* ${winRate}%

*Keep playing to improve your rank!*
    `.trim();
    
    await sock.sendMessage(chatId, { text: statsText }, { quoted: m });
}

async function showLeaderboard(sock, m, chatId) {
    const allPlayers = Array.from(gameStats.entries())
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);
    
    let leaderboardText = `🏆 *TIC TAC TOE LEADERBOARD* 🏆\n\n`;
    
    for (let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        const username = await getUsername(sock, player.id) || `Player ${i+1}`;
        const winRate = player.total > 0 ? ((player.wins / player.total) * 100).toFixed(1) : 0;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        
        leaderboardText += `${medal} *${username}*\n`;
        leaderboardText += `   🏆 ${player.wins} wins | 📈 ${winRate}% win rate\n\n`;
    }
    
    await sock.sendMessage(chatId, { text: leaderboardText });
}

async function getUsername(sock, userId) {
    try {
        const contact = await sock.onWhatsApp(userId);
        return contact?.[0]?.name || contact?.[0]?.pushname || null;
    } catch {
        return null;
    }
}

async function joinRandomGame(sock, m, chatId, userId, userName) {
    // Find waiting games
    const waitingGames = Array.from(activeGames.values())
        .filter(game => game.status === 'waiting' && 
               !game.players.some(p => p.id === userId));
    
    if (waitingGames.length === 0) {
        return await sock.sendMessage(chatId, {
            text: "❌ No available games to join!\n\nStart one with `.ttt ai` or `.ttt @friend`"
        }, { quoted: m });
    }
    
    const game = waitingGames[0];
    game.players[1].id = userId;
    game.players[1].name = userName;
    game.status = 'active';
    clearTimeout(game.timeout);
    
    const boardDisplay = generateBoard(game.board);
    const message = `
🎮 *GAME JOINED!* 🎮

${boardDisplay}

👤 *Player 1:* ${game.players[0].name} ❌
👤 *Player 2:* ${userName} ⭕

🎯 *Current Turn:* ${game.players[0].name} ❌

📍 *Make a move:* \`.ttt move [1-9]\`
    `.trim();
    
    await sock.sendMessage(chatId, {
        text: message,
        mentions: [game.players[0].id, userId]
    });
}

async function showAvailableGames(sock, m, chatId) {
    const waitingGames = Array.from(activeGames.values())
        .filter(game => game.status === 'waiting');
    
    if (waitingGames.length === 0) {
        return await sock.sendMessage(chatId, {
            text: "⏳ No waiting games available.\n\nStart one with `.ttt ai` or challenge a friend!"
        }, { quoted: m });
    }
    
    let gamesText = `🎮 *AVAILABLE GAMES* (${waitingGames.length})\n\n`;
    
    waitingGames.forEach((game, index) => {
        const timeAgo = Math.floor((Date.now() - game.createdAt) / 60000);
        gamesText += `*Game ${index + 1}:*\n`;
        gamesText += `👤 ${game.players[0].name} is waiting\n`;
        gamesText += `⏱️ Waiting for: ${timeAgo} minutes\n`;
        gamesText += `📍 *Join:* \`.ttt join\`\n\n`;
    });
    
    gamesText += `*Type \`.ttt join\` to join any game!*`;
    
    await sock.sendMessage(chatId, { text: gamesText });
}

function endGameByTimeout(gameId) {
    if (activeGames.has(gameId)) {
        const game = activeGames.get(gameId);
        
        if (game.status === 'waiting') {
            sock.sendMessage(game.chatId, {
                text: `⏰ *Game cancelled due to timeout!*\n\nNo one accepted the challenge.`
            });
        } else if (game.status === 'active') {
            const inactivePlayer = game.players[game.currentPlayer];
            const winner = game.players[1 - game.currentPlayer];
            
            updateStats(inactivePlayer.id, false);
            updateStats(winner.id, true);
            
            sock.sendMessage(game.chatId, {
                text: `⏰ *Game ended by timeout!*\n\n${inactivePlayer.name} took too long.\n🏆 *Winner:* ${winner.name} ${winner.symbol}`
            });
        }
        
        activeGames.delete(gameId);
    }
}

// Auto-cleanup every hour
setInterval(() => {
    const now = Date.now();
    for (const [gameId, game] of activeGames) {
        if (now - game.createdAt > 3600000) { // 1 hour
            activeGames.delete(gameId);
        }
    }
}, 3600000);

// Save/Load stats (optional)
async function saveStats() {
    const data = {
        gameStats: Array.from(gameStats.entries()),
        timestamp: Date.now()
    };
    
    await fs.writeFile(
        path.join(process.cwd(), 'data', 'ttt_stats.json'),
        JSON.stringify(data, null, 2)
    );
}

async function loadStats() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), 'data', 'ttt_stats.json'),
            'utf8'
        );
        const parsed = JSON.parse(data);
        
        for (const [userId, stats] of parsed.gameStats) {
            gameStats.set(userId, stats);
        }
    } catch (error) {
        console.log("No TTT stats found, starting fresh");
    }
}

loadStats();
setInterval(saveStats, 300000); // Save every 5 minutes