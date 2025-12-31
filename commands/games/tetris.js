import fs from 'fs/promises';
import path from 'path';

const activeGames = new Map();
const tetrisStats = new Map();
const leaderboard = new Map();

// Tetromino shapes (7 classic pieces)
const TETROMINOS = {
    I: [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    O: [
        [1,1],
        [1,1]
    ],
    T: [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ],
    S: [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    Z: [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    J: [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    L: [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ]
};

const TETROMINO_COLORS = {
    I: '🟦', O: '🟨', T: '🟪', 
    S: '🟩', Z: '🟥', J: '🟫', L: '🟧'
};

const TETROMINO_NAMES = {
    I: 'I-Piece', O: 'O-Piece', T: 'T-Piece',
    S: 'S-Piece', Z: 'Z-Piece', J: 'J-Piece', L: 'L-Piece'
};

// Game controls - simplified command system
const GAME_CONTROLS = {
    // Movement controls
    'a': 'left', '←': 'left', 'l': 'left',
    'd': 'right', '→': 'right', 'r': 'right',
    's': 'down', '↓': 'down',
    'w': 'rotate', '↑': 'rotate', 'rot': 'rotate',
    ' ': 'drop', 'drop': 'drop', 'hard': 'drop',
    
    // Quick piece selection
    '1': 'piece1', '2': 'piece2', '3': 'piece3',
    'p1': 'piece1', 'p2': 'piece2', 'p3': 'piece3',
    
    // Game management
    'pause': 'pause', 'p': 'pause',
    'resume': 'resume', 'unpause': 'resume',
    'stop': 'stop', 'quit': 'stop', 'end': 'stop',
    
    // Info commands
    'status': 'status', 'board': 'status',
    'help': 'help', 'h': 'help',
    'stats': 'stats',
    'leaderboard': 'leaderboard', 'lb': 'leaderboard', 'top': 'leaderboard'
};

// Global sock reference for interval callbacks
let globalSock = null;

// Load stats on startup
loadStats().catch(console.error);

export default {
    name: "tetris",
    alias: ["tetrisgame", "trs", "t"],
    desc: "Play Tetris in WhatsApp - Easy controls! Just use: .t [action]",
    category: "games",
    usage: `.t - Start/continue game\n.t [a/d/s/w/space] - Move piece (a=left, d=right, s=down, w=rotate, space=drop)\n.t [1/2/3] - Choose piece (1-3)\n.t pause/resume/stop - Manage game\n.t stats/leaderboard - View scores`,
    
    async execute(sock, m, args) {
        try {
            // Store sock reference for use in interval callbacks
            globalSock = sock;
            
            const chatId = m.key.remoteJid;
            const userId = m.key.participant || m.key.remoteJid;
            const userName = m.pushName || "Player";
            
            // Initialize stats
            if (!tetrisStats.has(userId)) {
                tetrisStats.set(userId, {
                    name: userName,
                    highScore: 0,
                    totalGames: 0,
                    totalScore: 0,
                    totalLines: 0,
                    totalPieces: 0,
                    longestGame: 0,
                    lastPlayed: 0
                });
            }
            
            const action = args[0]?.toLowerCase();
            
            // Check for active game
            const gameId = `${chatId}_${userId}`;
            const game = activeGames.get(gameId);
            const hasActiveGame = game && !game.gameOver;
            
            // 🚀 SIMPLIFIED COMMAND SYSTEM 🚀
            
            // If no action and no active game, start new game
            if (!action) {
                if (hasActiveGame) {
                    // Show current game status
                    return await showGameStatus(sock, m, chatId, game);
                } else {
                    // Start new game
                    return await startNewGame(sock, m, chatId, userId, userName, gameId);
                }
            }
            
            // Check if action is a valid control
            const controlAction = GAME_CONTROLS[action];
            
            // 🎮 Start new game with any action if no active game
            if (!hasActiveGame && !['help', 'stats', 'leaderboard'].includes(controlAction || action)) {
                // Auto-start game when using game controls
                const newGame = await startNewGame(sock, m, chatId, userId, userName, gameId);
                if (action && controlAction) {
                    // After starting, process the action
                    setTimeout(async () => {
                        await processGameAction(sock, gameId, controlAction);
                    }, 500);
                }
                return newGame;
            }
            
            // Info commands (work even without active game)
            if (!action || action === 'help' || controlAction === 'help') {
                return await showHelp(sock, m, chatId);
            }
            
            if (action === 'stats' || controlAction === 'stats') {
                return await showStats(sock, m, chatId, userId, userName);
            }
            
            if (action === 'leaderboard' || controlAction === 'lb' || controlAction === 'top' || controlAction === 'leaderboard') {
                return await showLeaderboard(sock, m, chatId);
            }
            
            // If there's an active game, process the action
            if (hasActiveGame) {
                return await processGameAction(sock, gameId, controlAction || action);
            }
            
            // If we get here, show help
            return await showHelp(sock, m, chatId);
            
        } catch (error) {
            console.error("Tetris error:", error);
            await sock.sendMessage(m.key.remoteJid, {
                text: `❌ Error: ${error.message}\nUse .t for help`
            }, { quoted: m });
        }
    }
};

// ============= SIMPLIFIED GAME ACTION PROCESSOR =============

async function processGameAction(sock, gameId, action) {
    const game = activeGames.get(gameId);
    if (!game) return;
    
    const chatId = game.chatId;
    
    // Map action to actual game function
    switch(action) {
        // Movement controls
        case 'left':
            return await handleMove(game, 'left');
        case 'right':
            return await handleMove(game, 'right');
        case 'down':
            return await handleMove(game, 'down');
        case 'rotate':
            return await handleRotate(game);
        case 'drop':
            return await handleDrop(game);
            
        // Piece selection
        case 'piece1':
            return await handlePieceSelection(game, 1);
        case 'piece2':
            return await handlePieceSelection(game, 2);
        case 'piece3':
            return await handlePieceSelection(game, 3);
            
        // Game management
        case 'pause':
            return await handlePause(game);
        case 'resume':
            return await handleResume(game);
        case 'stop':
            return await handleStop(game);
        case 'status':
            return await handleStatus(game);
            
        default:
            // If action not recognized, show quick help
            await sock.sendMessage(chatId, {
                text: `❌ Unknown action: ${action}\n\n💡 Quick controls:\n• a/d/s/w/space - Move\n• 1/2/3 - Choose piece\n• pause/resume/stop\n\nType .t for full help`
            });
    }
}

// ============= GAME FUNCTIONS =============

async function startNewGame(sock, m, chatId, userId, userName, gameId) {
    // Game board: 10x20 grid
    const boardWidth = 10;
    const boardHeight = 20;
    
    // Initialize empty board
    const board = Array(boardHeight).fill().map(() => Array(boardWidth).fill(0));
    
    // Generate initial 3-piece queue
    const pieceQueue = generatePieceQueue(3);
    
    const game = {
        id: gameId,
        chatId,
        userId,
        userName,
        boardWidth,
        boardHeight,
        board,
        currentPiece: null,
        pieceQueue: pieceQueue,
        pieceX: Math.floor(boardWidth / 2) - 1,
        pieceY: 0,
        score: 0,
        level: 1,
        linesCleared: 0,
        speed: 1000, // ms per drop
        gameTime: 0,
        paused: false,
        gameOver: false,
        waitingForSelection: true,
        createdAt: Date.now(),
        lastMove: Date.now(),
        interval: null,
        gameMessage: null,
        totalPieces: 0,
        selectedPiecesHistory: [],
        autoDropEnabled: true
    };
    
    activeGames.set(gameId, game);
    
    // Update stats
    const stats = tetrisStats.get(userId);
    stats.totalGames++;
    stats.lastPlayed = Date.now();
    
    // Show initial game with piece selection
    await showGameDisplay(game, true);
    
    return game;
}

function generatePieceQueue(count) {
    const pieces = [];
    const pieceTypes = Object.keys(TETROMINOS);
    
    for (let i = 0; i < count; i++) {
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        pieces.push({
            type: randomType,
            rotation: 0,
            index: i + 1
        });
    }
    
    return pieces;
}

// ============= SIMPLIFIED ACTION HANDLERS =============

async function handleMove(game, direction) {
    if (game.paused || game.gameOver || game.waitingForSelection) {
        return;
    }
    
    let success = false;
    switch(direction) {
        case 'left':
            success = movePieceLeft(game);
            break;
        case 'right':
            success = movePieceRight(game);
            break;
        case 'down':
            success = await movePieceDown(game, false);
            if (!success) {
                await lockPiece(game);
                await checkLines(game);
            }
            break;
    }
    
    if (success) {
        await updateGameDisplay(game, `✅ Moved ${direction}`);
    }
}

async function handleRotate(game) {
    if (game.paused || game.gameOver || game.waitingForSelection) {
        return;
    }
    
    const success = rotatePiece(game);
    if (success) {
        await updateGameDisplay(game, '🔄 Rotated');
    }
}

async function handleDrop(game) {
    if (game.paused || game.gameOver || game.waitingForSelection) {
        return;
    }
    
    const linesDropped = hardDrop(game);
    await lockPiece(game);
    await checkLines(game);
    
    await updateGameDisplay(game, `⚡ Dropped ${linesDropped} lines`);
}

async function handlePieceSelection(game, choice) {
    if (game.paused || game.gameOver || !game.waitingForSelection) {
        return;
    }
    
    if (choice < 1 || choice > 3 || choice > game.pieceQueue.length) {
        return;
    }
    
    // Get selected piece
    const selectedPiece = game.pieceQueue[choice - 1];
    
    // Set as current piece
    game.currentPiece = {
        type: selectedPiece.type,
        rotation: 0
    };
    
    // Reset position
    game.pieceX = Math.floor(game.boardWidth / 2) - 1;
    game.pieceY = 0;
    
    // Remove selected piece from queue and add new one
    game.pieceQueue.splice(choice - 1, 1);
    const pieceTypes = Object.keys(TETROMINOS);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    game.pieceQueue.push({
        type: randomType,
        rotation: 0,
        index: game.pieceQueue.length + 1
    });
    
    // Record selection
    game.selectedPiecesHistory.push(selectedPiece.type);
    game.totalPieces++;
    game.waitingForSelection = false;
    
    // Check if piece can be placed
    if (!isValidPosition(game, game.pieceX, game.pieceY, game.currentPiece.rotation)) {
        await gameOver(game, 'blocked');
        return;
    }
    
    // Start auto-drop timer
    startAutoDrop(game);
    
    // Update display
    await updateGameDisplay(game, `✅ Selected: ${TETROMINO_NAMES[selectedPiece.type]}`);
}

async function handlePause(game) {
    if (game.paused || game.gameOver) return;
    
    game.paused = true;
    clearInterval(game.interval);
    game.interval = null;
    
    await updateGameDisplay(game, '⏸️ Game Paused');
}

async function handleResume(game) {
    if (!game.paused || game.gameOver) return;
    
    game.paused = false;
    if (!game.waitingForSelection) {
        startAutoDrop(game);
    }
    
    await updateGameDisplay(game, '▶️ Game Resumed');
}

async function handleStop(game) {
    if (game.gameOver) return;
    
    await stopGame(game);
}

async function handleStatus(game) {
    await updateGameDisplay(game);
}

// ============= GAME LOGIC FUNCTIONS =============

function movePieceLeft(game) {
    const testX = game.pieceX - 1;
    if (isValidPosition(game, testX, game.pieceY, game.currentPiece.rotation)) {
        game.pieceX = testX;
        game.lastMove = Date.now();
        return true;
    }
    return false;
}

function movePieceRight(game) {
    const testX = game.pieceX + 1;
    if (isValidPosition(game, testX, game.pieceY, game.currentPiece.rotation)) {
        game.pieceX = testX;
        game.lastMove = Date.now();
        return true;
    }
    return false;
}

async function movePieceDown(game, isAutoMove) {
    const testY = game.pieceY + 1;
    
    if (isValidPosition(game, game.pieceX, testY, game.currentPiece.rotation)) {
        game.pieceY = testY;
        game.lastMove = Date.now();
        return true;
    } else {
        if (!isAutoMove) {
            await lockPiece(game);
            await checkLines(game);
        }
        return false;
    }
}

function rotatePiece(game) {
    const currentPiece = game.currentPiece;
    const newRotation = (currentPiece.rotation + 1) % 4;
    
    if (isValidPosition(game, game.pieceX, game.pieceY, newRotation)) {
        currentPiece.rotation = newRotation;
        game.lastMove = Date.now();
        return true;
    }
    
    // Try wall kicks
    for (let kick of [1, -1, 2, -2]) {
        const testX = game.pieceX + kick;
        if (isValidPosition(game, testX, game.pieceY, newRotation)) {
            game.pieceX = testX;
            currentPiece.rotation = newRotation;
            game.lastMove = Date.now();
            return true;
        }
    }
    
    return false;
}

function hardDrop(game) {
    let linesDropped = 0;
    
    for (let y = game.pieceY + 1; y <= game.boardHeight; y++) {
        if (!isValidPosition(game, game.pieceX, y, game.currentPiece.rotation)) {
            linesDropped = y - 1 - game.pieceY;
            game.pieceY = y - 1;
            break;
        }
    }
    
    game.lastMove = Date.now();
    return linesDropped;
}

function startAutoDrop(game) {
    if (game.interval) {
        clearInterval(game.interval);
    }
    
    game.interval = setInterval(async () => {
        if (game.paused || game.gameOver || game.waitingForSelection) {
            return;
        }
        
        const moved = await movePieceDown(game, true);
        if (!moved) {
            await lockPiece(game);
            await checkLines(game);
        }
        
        game.gameTime = Date.now() - game.createdAt;
        
    }, game.speed);
}

async function lockPiece(game) {
    if (!game.currentPiece) return;
    
    const piece = game.currentPiece;
    const shape = getPieceShape(piece);
    
    // Place piece on board
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardY = game.pieceY + y;
                const boardX = game.pieceX + x;
                
                if (boardY >= 0) {
                    game.board[boardY][boardX] = piece.type;
                }
            }
        }
    }
    
    // Check for game over
    if (game.pieceY <= 0) {
        await gameOver(game, 'top');
        return;
    }
    
    // Clear current piece
    game.currentPiece = null;
    game.waitingForSelection = true;
    
    if (game.interval) {
        clearInterval(game.interval);
        game.interval = null;
    }
    
    // Update stats
    const stats = tetrisStats.get(game.userId);
    if (stats) {
        stats.totalPieces++;
    }
    
    // Show next piece selection
    await updateGameDisplay(game, '✅ Piece locked! Choose next piece');
}

async function checkLines(game) {
    let linesCleared = 0;
    
    for (let y = game.boardHeight - 1; y >= 0; y--) {
        if (game.board[y].every(cell => cell !== 0)) {
            game.board.splice(y, 1);
            game.board.unshift(Array(game.boardWidth).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        game.linesCleared += linesCleared;
        
        const pointsPerLine = [40, 100, 300, 1200];
        const basePoints = pointsPerLine[linesCleared - 1] || 0;
        game.score += basePoints * game.level;
        
        const newLevel = Math.floor(game.linesCleared / 10) + 1;
        if (newLevel > game.level) {
            game.level = newLevel;
            game.speed = Math.max(100, 1000 - (game.level * 100));
        }
        
        const stats = tetrisStats.get(game.userId);
        if (stats) {
            stats.totalLines += linesCleared;
        }
        
        if (globalSock) {
            await showLineClear(game, linesCleared);
        }
    }
}

async function showLineClear(game, linesCleared) {
    if (!game.gameMessage || !globalSock) return;
    
    const lineMessages = {
        1: '🟦 Single!',
        2: '🟦🟦 Double!',
        3: '🟦🟦🟦 Triple!!',
        4: '🟦🟦🟦🟦 TETRIS!!!'
    };
    
    const message = lineMessages[linesCleared] || `🎯 ${linesCleared} Lines!`;
    
    for (let i = 0; i < 2; i++) {
        await globalSock.sendMessage(game.chatId, {
            text: `${message}\n\n${renderBoard(game, true)}`,
            edit: game.gameMessage.key
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await globalSock.sendMessage(game.chatId, {
            text: `${message}\n\n${renderBoard(game)}`,
            edit: game.gameMessage.key
        });
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

// ============= DISPLAY FUNCTIONS =============

async function showGameDisplay(game, isNewGame = false) {
    if (!globalSock) return;
    
    const boardDisplay = renderBoard(game);
    const speedText = getSpeedText(game.speed);
    
    let statusMessage = '';
    if (isNewGame) {
        statusMessage = '🎮 *NEW TETRIS GAME!* 🎮\n\n';
    } else if (game.paused) {
        statusMessage = '⏸️ *GAME PAUSED*\n\n';
    } else if (game.gameOver) {
        statusMessage = '💀 *GAME OVER*\n\n';
    } else {
        statusMessage = '▶️ *TETRIS*\n\n';
    }
    
    let controlsHelp = '';
    if (game.waitingForSelection) {
        // Show piece selection
        controlsHelp = '\n*🎯 CHOOSE A PIECE:*\n';
        for (let i = 0; i < game.pieceQueue.length; i++) {
            const piece = game.pieceQueue[i];
            controlsHelp += `${i + 1}. ${TETROMINO_COLORS[piece.type]} ${TETROMINO_NAMES[piece.type]}\n`;
        }
        controlsHelp += '\n*Type:* .t 1/2/3\n';
    } else {
        // Show movement controls
        controlsHelp = '\n*🎮 QUICK CONTROLS:*\n';
        controlsHelp += '• .t a / .t d - Move left/right\n';
        controlsHelp += '• .t s - Move down\n';
        controlsHelp += '• .t w - Rotate\n';
        controlsHelp += '• .t space - Hard drop\n';
        controlsHelp += '• .t pause/resume/stop\n';
    }
    
    const message = `${statusMessage}${boardDisplay}

👤 *Player:* ${game.userName}
🎯 *Score:* ${game.score}
📊 *Level:* ${game.level}
📏 *Lines:* ${game.linesCleared}
🧩 *Pieces:* ${game.totalPieces}
⚡ *Speed:* ${speedText}
⏱️ *Time:* ${formatTime(Math.floor(game.gameTime / 1000))}
${controlsHelp}
💡 *Tip:* Just type .t [action] to play!`;

    if (game.gameMessage) {
        try {
            await globalSock.sendMessage(game.chatId, {
                text: message,
                edit: game.gameMessage.key,
                mentions: [game.userId]
            });
        } catch (error) {
            console.error("Failed to edit game message:", error);
            game.gameMessage = await globalSock.sendMessage(game.chatId, {
                text: message,
                mentions: [game.userId]
            });
        }
    } else {
        game.gameMessage = await globalSock.sendMessage(game.chatId, {
            text: message,
            mentions: [game.userId]
        });
    }
}

async function updateGameDisplay(game, actionMessage = '') {
    if (!globalSock) return;
    
    const boardDisplay = renderBoard(game);
    const speedText = getSpeedText(game.speed);
    
    let statusEmoji = game.paused ? '⏸️' : (game.waitingForSelection ? '🎯' : '▶️');
    let statusText = game.paused ? 'PAUSED' : (game.waitingForSelection ? 'CHOOSE PIECE' : 'PLAYING');
    
    let quickControls = '';
    if (game.waitingForSelection) {
        quickControls = '\n*🎯 Available:* .t 1  .t 2  .t 3\n';
    } else {
        quickControls = '\n*🎮 Quick:* .t a  .t d  .t s  .t w  .t space\n';
    }
    
    const message = `${statusEmoji} *TETRIS - ${statusText}*
${actionMessage ? `\n*${actionMessage}*\n` : ''}
${boardDisplay}

🎯 *Score:* ${game.score} | 📊 *Level:* ${game.level}
📏 *Lines:* ${game.linesCleared} | ⚡ *Speed:* ${speedText}
${quickControls}
💡 Just type .t [action] to play!`;

    try {
        await globalSock.sendMessage(game.chatId, {
            text: message,
            edit: game.gameMessage.key,
            mentions: [game.userId]
        });
    } catch (error) {
        console.error("Failed to edit game message:", error);
    }
}

async function gameOver(game, reason) {
    game.gameOver = true;
    if (game.interval) {
        clearInterval(game.interval);
        game.interval = null;
    }
    
    const stats = tetrisStats.get(game.userId);
    const gameDuration = Math.floor((Date.now() - game.createdAt) / 1000);
    
    if (stats) {
        stats.totalScore += game.score;
        stats.longestGame = Math.max(stats.longestGame, gameDuration);
        
        if (game.score > stats.highScore) {
            stats.highScore = game.score;
            updateLeaderboard(game.userId, game.userName, game.score);
        }
    }
    
    const reasonText = reason === 'top' ? '💥 Reached the top!' : '🚫 No space!';
    const durationText = formatTime(gameDuration);
    const isHighScore = game.score === stats?.highScore;
    
    // Show piece history
    let historyText = '';
    if (game.selectedPiecesHistory.length > 0) {
        historyText = '\n*Piece History:* ';
        const recentPieces = game.selectedPiecesHistory.slice(-8);
        historyText += recentPieces.map(p => TETROMINO_COLORS[p]).join(' ');
    }
    
    const boardDisplay = renderBoard(game, false, true);
    
    const message = `💀 *GAME OVER - ${reasonText}*

${boardDisplay}

🏁 *FINAL SCORE:* ${game.score}
📊 *Level Reached:* ${game.level}
📏 *Lines Cleared:* ${game.linesCleared}
🧩 *Pieces Placed:* ${game.totalPieces}
⏱️ *Game Time:* ${durationText}
${historyText}

${isHighScore ? '🎉 *NEW HIGH SCORE!* 🎉\n' : ''}
*Play again:* .t`;

    if (game.gameMessage && globalSock) {
        try {
            await globalSock.sendMessage(game.chatId, {
                text: message,
                edit: game.gameMessage.key,
                mentions: [game.userId]
            });
        } catch (error) {
            console.error("Failed to edit game over message:", error);
        }
    }
    
    activeGames.delete(game.id);
    saveStats();
}

async function stopGame(game) {
    if (!game) return;
    
    if (game.interval) {
        clearInterval(game.interval);
        game.interval = null;
    }
    
    const gameDuration = Math.floor((Date.now() - game.createdAt) / 1000);
    const durationText = formatTime(gameDuration);
    
    const stats = tetrisStats.get(game.userId);
    if (stats) {
        stats.totalScore += game.score;
    }
    
    const message = `🏳️ *GAME STOPPED*

🎯 *Final Score:* ${game.score}
📏 *Lines Cleared:* ${game.linesCleared}
🧩 *Pieces Placed:* ${game.totalPieces}
⏱️ *Time Played:* ${durationText}

*Play again:* .t`;

    if (game.gameMessage && globalSock) {
        try {
            await globalSock.sendMessage(game.chatId, {
                text: message,
                edit: game.gameMessage.key,
                mentions: [game.userId]
            });
        } catch (error) {
            console.error("Failed to edit stop message:", error);
        }
    }
    
    activeGames.delete(game.id);
    saveStats();
}

// ============= UTILITY FUNCTIONS =============

function renderBoard(game, flash = false, gameOver = false) {
    const { board, currentPiece, pieceX, pieceY, boardWidth, boardHeight } = game;
    let display = '';
    
    // Top border
    display += '┌' + '──'.repeat(boardWidth) + '┐\n';
    
    for (let y = 0; y < boardHeight; y++) {
        display += '│';
        for (let x = 0; x < boardWidth; x++) {
            let cell = '⬜';
            
            if (board[y][x] !== 0) {
                const pieceType = board[y][x];
                cell = flash ? '🟦' : (gameOver ? '🟥' : TETROMINO_COLORS[pieceType]);
            }
            
            if (currentPiece && !game.waitingForSelection) {
                const pieceShape = getPieceShape(currentPiece);
                const pieceYPos = y - pieceY;
                const pieceXPos = x - pieceX;
                
                if (pieceYPos >= 0 && pieceYPos < pieceShape.length &&
                    pieceXPos >= 0 && pieceXPos < pieceShape[0].length &&
                    pieceShape[pieceYPos][pieceXPos]) {
                    cell = flash ? '🟦' : TETROMINO_COLORS[currentPiece.type];
                }
            }
            
            display += cell;
        }
        display += '│\n';
    }
    
    // Bottom border
    display += '└' + '──'.repeat(boardWidth) + '┘';
    
    return display;
}

function getPieceShape(piece) {
    const baseShape = TETROMINOS[piece.type];
    let shape = baseShape;
    
    for (let i = 0; i < piece.rotation; i++) {
        shape = rotateMatrix(shape);
    }
    
    return shape;
}

function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            result[j][N - 1 - i] = matrix[i][j];
        }
    }
    
    return result;
}

function isValidPosition(game, x, y, rotation) {
    if (!game.currentPiece) return false;
    
    const testPiece = { type: game.currentPiece.type, rotation };
    const shape = getPieceShape(testPiece);
    
    for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px]) {
                const boardX = x + px;
                const boardY = y + py;
                
                if (boardX < 0 || boardX >= game.boardWidth || boardY >= game.boardHeight) {
                    return false;
                }
                
                if (boardY >= 0 && game.board[boardY][boardX] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function getSpeedText(speed) {
    if (speed >= 1000) return '🐌 Slow';
    if (speed >= 700) return '🚶 Normal';
    if (speed >= 500) return '🏃 Fast';
    if (speed >= 300) return '⚡ Very Fast';
    return '🔥 Extreme';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateLeaderboard(userId, userName, score) {
    leaderboard.set(userId, {
        name: userName,
        score,
        date: Date.now()
    });
    
    const sorted = Array.from(leaderboard.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 100);
    
    leaderboard.clear();
    for (const [id, data] of sorted) {
        leaderboard.set(id, data);
    }
}

// ============= INFO COMMANDS =============

async function showHelp(sock, m, chatId) {
    const helpText = `
🎮 *TETRIS - EASY TO PLAY!* 🎮

*🚀 SUPER SIMPLE COMMANDS:*
• \`.t\` - Start/continue game
• \`.t [action]\` - Do action (see below)

*🎮 GAME ACTIONS:*
*Movement:*
• \`.t a\` / \`.t d\` - Move left/right
• \`.t s\` - Move down
• \`.t w\` - Rotate piece
• \`.t space\` - Hard drop

*Piece Selection:*
• \`.t 1\` / \`.t 2\` / \`.t 3\` - Choose piece

*Game Control:*
• \`.t pause\` - Pause game
• \`.t resume\` - Resume game
• \`.t stop\` - End game

*Info:*
• \`.t stats\` - Your statistics
• \`.t leaderboard\` - High scores

*🎯 HOW TO PLAY:*
1. Type \`.t\` to start
2. Choose piece with \`.t 1/2/3\`
3. Move piece with \`.t a/d/s/w/space\`
4. When piece lands, choose next piece
5. Complete lines to score points!

*💡 TIPS:*
• Game auto-starts when you use controls
• Just keep typing \`.t [action]\` to play
• Use \`.t space\` for quick drops
• Plan ahead when choosing pieces

*Example game session:*
.t          # Start game
.t 2        # Choose piece 2
.t d        # Move right
.t w        # Rotate
.t space    # Hard drop
.t 1        # Choose next piece
.t s        # Move down
...and so on!

*🎮 Piece colors:*
🟦 I-Piece  🟨 O-Piece  🟪 T-Piece
🟩 S-Piece  🟥 Z-Piece  🟫 J-Piece  🟧 L-Piece

*Ready to play? Just type:* .t
    `.trim();
    
    await sock.sendMessage(chatId, { text: helpText }, { quoted: m });
}

async function showStats(sock, m, chatId, userId, userName) {
    const stats = tetrisStats.get(userId) || {
        highScore: 0, totalGames: 0, totalScore: 0,
        totalLines: 0, totalPieces: 0, longestGame: 0
    };
    
    const avgScore = stats.totalGames > 0 ? Math.floor(stats.totalScore / stats.totalGames) : 0;
    const avgLines = stats.totalGames > 0 ? Math.floor(stats.totalLines / stats.totalGames) : 0;
    const avgPieces = stats.totalGames > 0 ? Math.floor(stats.totalPieces / stats.totalGames) : 0;
    const avgTime = stats.totalGames > 0 ? Math.floor(stats.longestGame / stats.totalGames) : 0;
    
    const statsText = `
📊 *TETRIS STATS - ${userName}* 📊

🏆 *High Score:* ${stats.highScore}
🎮 *Total Games:* ${stats.totalGames}
🎯 *Total Score:* ${stats.totalScore}
📏 *Total Lines:* ${stats.totalLines}
🧩 *Total Pieces:* ${stats.totalPieces}

📈 *Average Score:* ${avgScore}
📈 *Average Lines:* ${avgLines}
📈 *Average Pieces:* ${avgPieces}
⏱️ *Longest Game:* ${formatTime(stats.longestGame)}
⏱️ *Average Time:* ${formatTime(avgTime)}

${stats.lastPlayed ? `*Last Played:* ${new Date(stats.lastPlayed).toLocaleDateString()}` : ''}

*Keep playing to improve your stats!*
    `.trim();
    
    await sock.sendMessage(chatId, { text: statsText }, { quoted: m });
}

async function showLeaderboard(sock, m, chatId) {
    const allScores = Array.from(leaderboard.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    
    let leaderboardText = `🏆 *TETRIS LEADERBOARD* 🏆\n\n`;
    
    if (allScores.length === 0) {
        leaderboardText += "No scores yet! Be the first to play!\nType `.t` to start!";
    } else {
        for (let i = 0; i < allScores.length; i++) {
            const player = allScores[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
            const date = new Date(player.date).toLocaleDateString();
            
            leaderboardText += `${medal} *${player.name}*\n`;
            leaderboardText += `   🏆 ${player.score} points | 📅 ${date}\n\n`;
        }
    }
    
    leaderboardText += `\n*Play:* .t`;
    
    await sock.sendMessage(chatId, { text: leaderboardText });
}

// ============= DATA PERSISTENCE =============

async function saveStats() {
    const data = {
        tetrisStats: Array.from(tetrisStats.entries()),
        leaderboard: Array.from(leaderboard.entries()),
        timestamp: Date.now()
    };
    
    try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
        await fs.writeFile(
            path.join(process.cwd(), 'data', 'tetris_stats.json'),
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("Failed to save tetris stats:", error);
    }
}

async function loadStats() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'tetris_stats.json');
        const data = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(data);
        
        if (parsed.tetrisStats) {
            for (const [userId, stats] of parsed.tetrisStats) {
                tetrisStats.set(userId, stats);
            }
        }
        
        if (parsed.leaderboard) {
            for (const [userId, data] of parsed.leaderboard) {
                leaderboard.set(userId, data);
            }
        }
        
        console.log(`📊 Loaded Tetris stats: ${tetrisStats.size} players`);
    } catch (error) {
        console.log("No existing Tetris stats found, starting fresh...");
    }
}

// Auto-cleanup inactive games
setInterval(() => {
    const now = Date.now();
    const sock = globalSock;
    
    for (const [gameId, game] of activeGames) {
        if (now - game.lastMove > 300000) { // 5 minutes inactivity
            if (game.interval) clearInterval(game.interval);
            
            if (game.gameMessage && sock) {
                try {
                    sock.sendMessage(game.chatId, {
                        text: `⏰ *Game auto-ended*\n\nFinal Score: ${game.score}\n\nPlay again: .t`,
                        edit: game.gameMessage.key
                    });
                } catch (error) {
                    console.error("Failed to send auto-end message:", error);
                }
            }
            activeGames.delete(gameId);
        }
    }
}, 60000);

// Auto-save stats
setInterval(saveStats, 300000);

// Save on exit
process.on('beforeExit', saveStats);
process.on('SIGINT', () => {
    saveStats().then(() => process.exit(0));
});