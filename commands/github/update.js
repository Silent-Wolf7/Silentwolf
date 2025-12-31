
// // import { exec } from "child_process";
// // import { promisify } from "util";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const execAsync = promisify(exec);
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Enhanced exec with timeout
// // async function run(cmd, timeout = 30000) {
// //   try {
// //     const { stdout, stderr } = await execAsync(cmd, { timeout });
// //     if (stderr && !stderr.includes('warning')) {
// //       console.warn(`Command stderr: ${stderr}`);
// //     }
// //     return stdout.trim();
// //   } catch (error) {
// //     console.error(`Command failed: ${cmd}`, error.message);
// //     throw error;
// //   }
// // }

// // // Check if git repository exists
// // async function hasGitRepo() {
// //   const gitPath = path.join(process.cwd(), ".git");
// //   return fs.existsSync(gitPath);
// // }

// // // Get current git branch
// // async function getCurrentBranch() {
// //   try {
// //     return await run("git rev-parse --abbrev-ref HEAD");
// //   } catch (error) {
// //     return "main"; // default branch
// //   }
// // }

// // // Initialize git repo if it doesn't exist
// // async function initGitRepo() {
// //   try {
// //     if (!await hasGitRepo()) {
// //       console.log("Initializing git repository...");
// //       await run("git init");
// //       await run("git remote add origin https://github.com/777Wolf-dot/Silent-Wolf--Bot.git");
// //       await run("git fetch origin");
// //       await run("git checkout -b main --track origin/main || git checkout -b main");
// //       console.log("Git repository initialized");
// //       return true;
// //     }
// //     return false;
// //   } catch (error) {
// //     console.error("Failed to initialize git repo:", error);
// //     return false;
// //   }
// // }

// // // Update from wolf-bot repo (your update source)
// // async function updateFromWolfBot() {
// //   try {
// //     // Save current state
// //     const oldRev = await run("git rev-parse HEAD").catch(() => "unknown");
// //     const currentBranch = await getCurrentBranch();
    
// //     console.log(`Current branch: ${currentBranch}, Old revision: ${oldRev.substring(0, 7)}`);
    
// //     // Add wolf-bot as upstream if not already added
// //     try {
// //       await run("git remote get-url wolf-bot-upstream");
// //     } catch {
// //       console.log("Adding wolf-bot as upstream remote...");
// //       await run("git remote add wolf-bot-upstream https://github.com/777Wolf-dot/wolf-bot.git");
// //     }
    
// //     // Fetch from both remotes
// //     console.log("Fetching updates from both remotes...");
// //     await run("git fetch --all --prune");
    
// //     // Check what branch to update from
// //     let sourceBranch = "main";
// //     let sourceRemote = "wolf-bot-upstream";
    
// //     // Try to find matching branch in wolf-bot repo
// //     try {
// //       const wolfBotBranches = await run("git ls-remote --heads wolf-bot-upstream");
// //       const branches = wolfBotBranches.split('\n').map(line => {
// //         const match = line.match(/refs\/heads\/(.+)/);
// //         return match ? match[1] : null;
// //       }).filter(Boolean);
      
// //       if (branches.includes(currentBranch)) {
// //         sourceBranch = currentBranch;
// //         console.log(`Found matching branch in wolf-bot: ${currentBranch}`);
// //       } else {
// //         console.log(`Branch ${currentBranch} not found in wolf-bot, using main branch`);
// //       }
// //     } catch (error) {
// //       console.warn("Could not check wolf-bot branches:", error.message);
// //     }
    
// //     // Get new revision from wolf-bot
// //     const newRev = await run(`git rev-parse wolf-bot-upstream/${sourceBranch}`);
// //     const alreadyUpToDate = oldRev === newRev;
    
// //     if (alreadyUpToDate) {
// //       console.log("Already up to date with wolf-bot repo");
// //       return { 
// //         oldRev, 
// //         newRev, 
// //         alreadyUpToDate, 
// //         source: `wolf-bot/${sourceBranch}`,
// //         type: "git"
// //       };
// //     }
    
// //     console.log(`Updating from wolf-bot/${sourceBranch}: ${oldRev.substring(0, 7)} → ${newRev.substring(0, 7)}`);
    
// //     // Create backup branch just in case
// //     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
// //     const backupBranch = `backup-before-update-${timestamp}`;
// //     await run(`git branch ${backupBranch}`);
// //     console.log(`Created backup branch: ${backupBranch}`);
    
// //     // Reset to wolf-bot's latest
// //     await run(`git reset --hard wolf-bot-upstream/${sourceBranch}`);
    
// //     // Try to preserve important local files
// //     await preserveLocalFiles();
    
// //     // Clean untracked files (be careful)
// //     try {
// //       await run("git clean -fd -e node_modules -e tmp -e logs -e session -e settings.js -e config.json -e .env");
// //     } catch (cleanError) {
// //       console.warn("Git clean failed:", cleanError.message);
// //     }
    
// //     return { 
// //       oldRev, 
// //       newRev, 
// //       alreadyUpToDate, 
// //       source: `wolf-bot/${sourceBranch}`,
// //       backupBranch,
// //       type: "git"
// //     };
    
// //   } catch (error) {
// //     console.error("Update from wolf-bot failed:", error);
    
// //     // Try to restore from backup
// //     try {
// //       const branches = await run("git branch --list backup-before-update-*");
// //       if (branches) {
// //         const latestBackup = branches.split('\n').filter(b => b.trim()).pop().trim();
// //         await run(`git reset --hard ${latestBackup}`);
// //         console.log(`Restored from backup: ${latestBackup}`);
// //       }
// //     } catch (restoreError) {
// //       console.error("Could not restore from backup:", restoreError);
// //     }
    
// //     throw new Error(`Update from wolf-bot failed: ${error.message}`);
// //   }
// // }

// // // Preserve important local files that shouldn't be overwritten
// // async function preserveLocalFiles() {
// //   const filesToPreserve = [
// //     'settings.js',
// //     'config.json',
// //     '.env',
// //     'session',
// //     'data',
// //     'logs'
// //   ];
  
// //   const tmpDir = path.join(process.cwd(), 'tmp_preserve');
// //   if (!fs.existsSync(tmpDir)) {
// //     fs.mkdirSync(tmpDir, { recursive: true });
// //   }
  
// //   for (const file of filesToPreserve) {
// //     const filePath = path.join(process.cwd(), file);
// //     const tmpPath = path.join(tmpDir, file);
    
// //     if (fs.existsSync(filePath)) {
// //       if (fs.statSync(filePath).isDirectory()) {
// //         // Copy directory
// //         await copyDir(filePath, tmpPath);
// //       } else {
// //         // Copy file
// //         fs.copyFileSync(filePath, tmpPath);
// //       }
// //       console.log(`Preserved: ${file}`);
// //     }
// //   }
  
// //   // After update, restore preserved files
// //   if (fs.existsSync(tmpDir)) {
// //     const preservedItems = fs.readdirSync(tmpDir);
// //     for (const item of preservedItems) {
// //       const srcPath = path.join(tmpDir, item);
// //       const destPath = path.join(process.cwd(), item);
      
// //       if (fs.existsSync(destPath)) {
// //         // If it's a directory, merge contents
// //         if (fs.statSync(srcPath).isDirectory() && fs.statSync(destPath).isDirectory()) {
// //           await copyDir(srcPath, destPath);
// //         } else {
// //           // Keep the preserved version
// //           if (fs.statSync(destPath).isDirectory()) {
// //             fs.rmSync(destPath, { recursive: true });
// //           }
// //           if (fs.statSync(srcPath).isDirectory()) {
// //             await copyDir(srcPath, destPath);
// //           } else {
// //             fs.copyFileSync(srcPath, destPath);
// //           }
// //         }
// //       } else {
// //         // Copy if doesn't exist
// //         if (fs.statSync(srcPath).isDirectory()) {
// //           await copyDir(srcPath, destPath);
// //         } else {
// //           fs.copyFileSync(srcPath, destPath);
// //         }
// //       }
// //     }
    
// //     // Cleanup
// //     fs.rmSync(tmpDir, { recursive: true });
// //   }
// // }

// // // Update via ZIP from wolf-bot repo
// // async function updateViaZip() {
// //   const zipUrl = "https://github.com/777Wolf-dot/wolf-bot/archive/refs/heads/main.zip";
// //   const tmpDir = path.join(process.cwd(), "tmp_update");
// //   const zipPath = path.join(tmpDir, "wolf-bot-update.zip");
// //   const extractDir = path.join(tmpDir, "extracted");
  
// //   try {
// //     // Create backup of important files
// //     await preserveLocalFiles();
    
// //     // Clean/create temp directory
// //     if (fs.existsSync(tmpDir)) {
// //       await run(`rm -rf ${tmpDir}`);
// //     }
// //     fs.mkdirSync(tmpDir, { recursive: true });
// //     fs.mkdirSync(extractDir, { recursive: true });
    
// //     console.log(`Downloading ZIP from wolf-bot: ${zipUrl}`);
    
// //     // Download using curl or wget
// //     let downloadCmd;
// //     if (await run("which curl").then(() => true).catch(() => false)) {
// //       downloadCmd = `curl -L "${zipUrl}" -o "${zipPath}" --connect-timeout 30 --max-time 300 --silent --show-error`;
// //     } else if (await run("which wget").then(() => true).catch(() => false)) {
// //       downloadCmd = `wget "${zipUrl}" -O "${zipPath}" --timeout=30 --tries=3 --quiet`;
// //     } else {
// //       throw new Error("Neither curl nor wget is available");
// //     }
    
// //     await run(downloadCmd);
    
// //     if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
// //       throw new Error("Downloaded ZIP file is empty or doesn't exist");
// //     }
    
// //     console.log(`Downloaded ${fs.statSync(zipPath).size} bytes from wolf-bot`);
    
// //     // Extract ZIP
// //     console.log("Extracting ZIP...");
    
// //     if (await run("which unzip").then(() => true).catch(() => false)) {
// //       await run(`unzip -o "${zipPath}" -d "${extractDir}"`);
// //     } else if (await run("which 7z").then(() => true).catch(() => false)) {
// //       await run(`7z x "${zipPath}" -o"${extractDir}" -y`);
// //     } else {
// //       throw new Error("No extraction tool found (install unzip or 7z)");
// //     }
    
// //     // Find the extracted content (GitHub ZIPs have wolf-bot-main folder)
// //     const extractedItems = fs.readdirSync(extractDir);
// //     let sourceDir = extractDir;
    
// //     // Look for wolf-bot-main folder
// //     const wolfBotFolder = extractedItems.find(item => 
// //       item.toLowerCase().includes('wolf-bot')
// //     );
    
// //     if (wolfBotFolder) {
// //       sourceDir = path.join(extractDir, wolfBotFolder);
// //       console.log(`Found source folder: ${wolfBotFolder}`);
// //     }
    
// //     console.log(`Copying files from ${sourceDir} to ${process.cwd()}`);
    
// //     // Files/directories to exclude from update
// //     const excludeItems = [
// //       '.git',
// //       'node_modules',
// //       'tmp',
// //       'logs',
// //       'session',
// //       'data',
// //       'settings.js',
// //       'config.json',
// //       '.env',
// //       'tmp_update',
// //       'tmp_preserve'
// //     ];
    
// //     // Copy files, excluding protected items
// //     await copyDirWithExclude(sourceDir, process.cwd(), excludeItems);
    
// //     // Cleanup
// //     await run(`rm -rf ${tmpDir}`);
    
// //     return { 
// //       success: true, 
// //       source: "wolf-bot ZIP",
// //       url: zipUrl 
// //     };
// //   } catch (error) {
// //     // Cleanup on error
// //     if (fs.existsSync(tmpDir)) {
// //       await run(`rm -rf ${tmpDir}`).catch(() => {});
// //     }
// //     throw new Error(`ZIP update from wolf-bot failed: ${error.message}`);
// //   }
// // }

// // // Helper function to copy directory with exclusions
// // async function copyDirWithExclude(src, dest, exclude = []) {
// //   if (!fs.existsSync(dest)) {
// //     fs.mkdirSync(dest, { recursive: true });
// //   }
  
// //   const entries = fs.readdirSync(src, { withFileTypes: true });
  
// //   for (const entry of entries) {
// //     const srcPath = path.join(src, entry.name);
// //     const destPath = path.join(dest, entry.name);
    
// //     // Check if excluded
// //     if (exclude.some(pattern => {
// //       if (pattern.includes('*')) {
// //         const regex = new RegExp(pattern.replace(/\*/g, '.*'));
// //         return regex.test(entry.name);
// //       }
// //       return entry.name === pattern;
// //     })) {
// //       console.log(`Skipping excluded: ${entry.name}`);
// //       continue;
// //     }
    
// //     if (entry.isDirectory()) {
// //       if (!fs.existsSync(destPath)) {
// //         fs.mkdirSync(destPath, { recursive: true });
// //       }
// //       await copyDirWithExclude(srcPath, destPath, exclude);
// //     } else {
// //       // Skip if destination is a protected file that should be preserved
// //       const isProtected = ['settings.js', 'config.json', '.env'].includes(entry.name.toLowerCase());
// //       if (isProtected && fs.existsSync(destPath)) {
// //         console.log(`Preserving existing: ${entry.name}`);
// //         continue;
// //       }
      
// //       fs.copyFileSync(srcPath, destPath);
// //       console.log(`Copied: ${entry.name}`);
// //     }
// //   }
// // }

// // // Copy directory (simple version)
// // async function copyDir(src, dest) {
// //   if (!fs.existsSync(dest)) {
// //     fs.mkdirSync(dest, { recursive: true });
// //   }
  
// //   const entries = fs.readdirSync(src, { withFileTypes: true });
  
// //   for (const entry of entries) {
// //     const srcPath = path.join(src, entry.name);
// //     const destPath = path.join(dest, entry.name);
    
// //     if (entry.isDirectory()) {
// //       await copyDir(srcPath, destPath);
// //     } else {
// //       fs.copyFileSync(srcPath, destPath);
// //     }
// //   }
// // }

// // // Enhanced settings loader
// // async function loadSettings() {
// //   const possiblePaths = [
// //     path.join(process.cwd(), "settings.js"),
// //     path.join(process.cwd(), "config", "settings.js"),
// //     path.join(__dirname, "..", "settings.js"),
// //     path.join(__dirname, "..", "..", "settings.js"),
// //   ];
  
// //   for (const settingsPath of possiblePaths) {
// //     try {
// //       if (fs.existsSync(settingsPath)) {
// //         console.log(`Loading settings from: ${settingsPath}`);
// //         const module = await import(`file://${settingsPath}`);
// //         return module.default || module;
// //       }
// //     } catch (error) {
// //       console.warn(`Failed to load settings from ${settingsPath}:`, error.message);
// //       continue;
// //     }
// //   }
  
// //   console.warn("No settings file found, using empty settings");
// //   return {};
// // }

// // // Restart process
// // async function restartProcess() {
// //   console.log("Restarting bot...");
  
// //   try {
// //     // Try PM2 first
// //     if (await run("which pm2").then(() => true).catch(() => false)) {
// //       console.log("Restarting with PM2...");
// //       await run("pm2 restart all");
// //       return;
// //     }
    
// //     // Try forever
// //     if (await run("which forever").then(() => true).catch(() => false)) {
// //       console.log("Restarting with Forever...");
// //       await run("forever restartall");
// //       return;
// //     }
    
// //     // If no process manager, just exit
// //     console.log("No process manager found, exiting...");
// //     process.exit(0);
    
// //   } catch (error) {
// //     console.error("Restart failed:", error);
// //     // Force exit
// //     process.exit(0);
// //   }
// // }

// // // Update progress bar animation
// // function getProgressBar(percentage) {
// //   const filled = Math.round((percentage / 100) * 10);
// //   const empty = 10 - filled;
// //   return `█`.repeat(filled) + `▒`.repeat(empty);
// // }

// // // Main command handler
// // export default {
// //   name: "update",
// //   description: "Update bot from wolf-bot repository",
// //   category: "owner",
// //   ownerOnly: true,

// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const sender = m.key.participant || m.key.remoteJid;
    
// //     // Send initial message and store its key for editing
// //     const initialMessage = await sock.sendMessage(jid, { 
// //       text: "🔄 WolfBot Update System\nChecking for updates...\nInitializing update process..."
// //     }, { quoted: m });
    
// //     let updateMessageKey = initialMessage.key;
    
// //     // Edit message helper
// //     const editMessage = async (text) => {
// //       try {
// //         await sock.sendMessage(jid, { 
// //           text,
// //           edit: updateMessageKey
// //         }, { quoted: m });
// //       } catch (error) {
// //         console.log("Could not edit message, sending new one:", error.message);
// //         const newMsg = await sock.sendMessage(jid, { text }, { quoted: m });
// //         updateMessageKey = newMsg.key;
// //       }
// //     };
    
// //     // Animate progress
// //     const animateProgress = async (baseText, progress = 0) => {
// //       const bar = getProgressBar(progress);
// //       const progressText = `${baseText}\n${bar} ${progress}%`;
// //       await editMessage(progressText);
// //     };
    
// //     try {
// //       // Load settings
// //       await animateProgress("🔍 Loading bot settings...", 10);
// //       const settings = await loadSettings();
      
// //       // Check if owner
// //       const isOwner = m.key.fromMe || 
// //         (settings.ownerNumber && sender.includes(settings.ownerNumber)) ||
// //         (settings.botOwner && sender.includes(settings.botOwner));
      
// //       if (!isOwner) {
// //         await editMessage("❌ Permission Denied\nOnly the bot owner can update the bot.");
// //         return;
// //       }
      
// //       // Parse arguments
// //       const forceMethod = args[0]?.toLowerCase();
// //       const isForceZip = forceMethod === 'zip';
// //       const isForceGit = forceMethod === 'git';
      
// //       let updateResult;
      
// //       // Check if we have git repo, initialize if not
// //       await animateProgress("📁 Checking git repository...", 20);
// //       const hasGit = await hasGitRepo();
      
// //       if (!hasGit && !isForceZip) {
// //         await animateProgress("📦 Initializing git repository...", 30);
// //         await initGitRepo();
// //       }
      
// //       // Determine update method
// //       if ((hasGit && !isForceZip) || isForceGit) {
// //         // Git update from wolf-bot
// //         await animateProgress("🌐 Checking wolf-bot repository...", 40);
        
// //         updateResult = await updateFromWolfBot();
        
// //         if (updateResult.alreadyUpToDate) {
// //           await editMessage(
// //             "✅ Already Up to Date!\n" +
// //             `Source: ${updateResult.source}\n` +
// //             `Commit: ${updateResult.newRev.substring(0, 7)}\n` +
// //             "No updates available."
// //           );
// //         } else {
// //           await animateProgress("📥 Installing updates...", 60);
          
// //           // Install dependencies if package.json changed
// //           try {
// //             if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
// //               await animateProgress("📦 Installing dependencies...", 70);
// //               await run("npm install --no-audit --no-fund --loglevel=error");
// //               await animateProgress("✅ Dependencies installed!", 80);
// //             }
// //           } catch (npmError) {
// //             console.error("npm install failed:", npmError);
// //           }
          
// //           await editMessage(
// //             "✅ Update Complete!\n" +
// //             `Source: ${updateResult.source}\n` +
// //             `Updated: ${updateResult.oldRev.substring(0, 7)} → ${updateResult.newRev.substring(0, 7)}\n` +
// //             `Backup: ${updateResult.backupBranch || 'None'}\n` +
// //             "Preparing to restart..."
// //           );
// //         }
// //       } else {
// //         // ZIP update from wolf-bot
// //         await animateProgress("📦 Downloading wolf-bot update...", 40);
        
// //         updateResult = await updateViaZip();
        
// //         await animateProgress("📂 Extracting files...", 60);
// //         await animateProgress("📝 Installing updates...", 80);
        
// //         await editMessage(
// //           "✅ ZIP Update Complete!\n" +
// //           `Source: ${updateResult.source}\n` +
// //           `URL: ${updateResult.url}\n` +
// //           "Preparing to restart..."
// //         );
// //       }
      
// //       // Final restart
// //       await animateProgress("🔄 Restarting WolfBot...", 95);
      
// //       // Small delay to ensure message is sent
// //       await new Promise(resolve => setTimeout(resolve, 1000));
      
// //       // Send final message
// //       await editMessage(
// //         "🚀 Restarting Now!\n" +
// //         "Bot will be back in a few moments...\n" +
// //         "WolfBot is updating..."
// //       );
      
// //       await restartProcess();
      
// //     } catch (error) {
// //       console.error("Update error:", error);
      
// //       let errorMessage = 
// //         "❌ Update Failed\n" +
// //         `Error: ${error.message}\n\n`;
      
// //       // Add helpful suggestions
// //       if (error.message.includes('git') || error.message.includes('ZIP')) {
// //         errorMessage += "Try these solutions:\n";
// //         errorMessage += "• Use different method: `!update git` or `!update zip`\n";
// //         errorMessage += "• Check internet connection\n";
// //         errorMessage += "• Ensure required tools are installed: git, curl, unzip\n";
// //         errorMessage += "• Manually update from: https://github.com/777Wolf-dot/wolf-bot";
// //       }
      
// //       await editMessage(errorMessage);
// //     }
// //   }
// // };








// import { exec } from "child_process";
// import { promisify } from "util";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { createRequire } from 'module';

// const execAsync = promisify(exec);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const require = createRequire(import.meta.url);

// // Enhanced exec with timeout
// async function run(cmd, timeout = 30000) {
//   try {
//     const { stdout, stderr } = await execAsync(cmd, { timeout });
//     if (stderr && !stderr.includes('warning')) {
//       console.warn(`Command stderr: ${stderr}`);
//     }
//     return stdout.trim();
//   } catch (error) {
//     console.error(`Command failed: ${cmd}`, error.message);
//     throw error;
//   }
// }

// // Cache for clearing require cache
// const originalRequireResolve = require.resolve;
// const moduleCache = new Map();

// // Clear module cache for hot reload
// function clearModuleCache(modulePath) {
//   const normalizedPath = path.resolve(modulePath);
  
//   // Clear from require.cache
//   if (require.cache) {
//     for (const key in require.cache) {
//       if (key.includes(normalizedPath)) {
//         delete require.cache[key];
//       }
//     }
//   }
  
//   // Clear from module cache
//   moduleCache.delete(normalizedPath);
  
//   // Clear from import cache (ES modules)
//   // Note: Node.js doesn't have a public API for ES module cache
//   // We'll handle this differently for ES modules
// }

// // Hot reload handler registry
// const hotReloadHandlers = new Set();

// // Register a module for hot reload
// export function registerForHotReload(modulePath, reloadCallback) {
//   const normalizedPath = path.resolve(modulePath);
//   hotReloadHandlers.add({
//     path: normalizedPath,
//     callback: reloadCallback
//   });
//   return () => hotReloadHandlers.delete(normalizedPath);
// }

// // Execute hot reload for updated modules
// async function executeHotReload(updatedFiles = []) {
//   console.log(`🔄 Hot reloading ${updatedFiles.length} updated modules`);
  
//   const reloadResults = [];
  
//   for (const handler of hotReloadHandlers) {
//     // Check if this handler's module was updated
//     const needsReload = updatedFiles.some(filePath => 
//       filePath.includes(handler.path) || 
//       handler.path.includes(path.dirname(filePath))
//     );
    
//     if (needsReload) {
//       try {
//         console.log(`Hot reloading: ${handler.path}`);
        
//         // Clear cache first
//         clearModuleCache(handler.path);
        
//         // Execute reload callback
//         const result = await handler.callback();
//         reloadResults.push({
//           path: handler.path,
//           success: true,
//           result
//         });
        
//         console.log(`✅ Successfully hot reloaded: ${handler.path}`);
//       } catch (error) {
//         console.error(`❌ Failed to hot reload ${handler.path}:`, error);
//         reloadResults.push({
//           path: handler.path,
//           success: false,
//           error: error.message
//         });
//       }
//     }
//   }
  
//   return reloadResults;
// }

// // Enhanced file watcher for dynamic updates
// class FileWatcher {
//   constructor() {
//     this.watchers = new Map();
//     this.debounceTimers = new Map();
//   }
  
//   watchFile(filePath, callback, debounceMs = 1000) {
//     const normalizedPath = path.resolve(filePath);
    
//     if (this.watchers.has(normalizedPath)) {
//       this.unwatchFile(normalizedPath);
//     }
    
//     try {
//       const watcher = fs.watch(normalizedPath, (eventType) => {
//         if (eventType === 'change') {
//           // Debounce to prevent multiple rapid triggers
//           if (this.debounceTimers.has(normalizedPath)) {
//             clearTimeout(this.debounceTimers.get(normalizedPath));
//           }
          
//           this.debounceTimers.set(normalizedPath, setTimeout(() => {
//             console.log(`📁 File changed: ${normalizedPath}`);
//             callback(normalizedPath);
//             this.debounceTimers.delete(normalizedPath);
//           }, debounceMs));
//         }
//       });
      
//       this.watchers.set(normalizedPath, watcher);
//       console.log(`👁️  Watching file: ${normalizedPath}`);
//     } catch (error) {
//       console.error(`Failed to watch file ${normalizedPath}:`, error);
//     }
//   }
  
//   watchDirectory(dirPath, callback, recursive = true, debounceMs = 1000) {
//     const normalizedPath = path.resolve(dirPath);
    
//     if (!fs.existsSync(normalizedPath)) {
//       console.warn(`Directory does not exist: ${normalizedPath}`);
//       return;
//     }
    
//     try {
//       const watcher = fs.watch(normalizedPath, { recursive }, (eventType, filename) => {
//         if (filename && eventType === 'change') {
//           const fullPath = path.join(normalizedPath, filename);
          
//           // Debounce
//           const key = `${normalizedPath}:${filename}`;
//           if (this.debounceTimers.has(key)) {
//             clearTimeout(this.debounceTimers.get(key));
//           }
          
//           this.debounceTimers.set(key, setTimeout(() => {
//             console.log(`📁 File in directory changed: ${fullPath}`);
//             callback(fullPath);
//             this.debounceTimers.delete(key);
//           }, debounceMs));
//         }
//       });
      
//       this.watchers.set(normalizedPath, watcher);
//       console.log(`👁️  Watching directory: ${normalizedPath} (recursive: ${recursive})`);
      
//       // Also watch subdirectories for new files
//       if (recursive) {
//         this.watchSubdirectories(normalizedPath, callback, debounceMs);
//       }
//     } catch (error) {
//       console.error(`Failed to watch directory ${normalizedPath}:`, error);
//     }
//   }
  
//   watchSubdirectories(dirPath, callback, debounceMs) {
//     try {
//       const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
//       for (const entry of entries) {
//         if (entry.isDirectory()) {
//           const subDirPath = path.join(dirPath, entry.name);
//           this.watchDirectory(subDirPath, callback, true, debounceMs);
//         }
//       }
//     } catch (error) {
//       console.error(`Failed to watch subdirectories of ${dirPath}:`, error);
//     }
//   }
  
//   unwatchFile(filePath) {
//     const normalizedPath = path.resolve(filePath);
    
//     if (this.watchers.has(normalizedPath)) {
//       this.watchers.get(normalizedPath).close();
//       this.watchers.delete(normalizedPath);
//       console.log(`👁️  Stopped watching: ${normalizedPath}`);
//     }
    
//     // Clear any debounce timer
//     if (this.debounceTimers.has(normalizedPath)) {
//       clearTimeout(this.debounceTimers.get(normalizedPath));
//       this.debounceTimers.delete(normalizedPath);
//     }
//   }
  
//   unwatchAll() {
//     for (const [path, watcher] of this.watchers) {
//       watcher.close();
//     }
//     this.watchers.clear();
    
//     for (const timer of this.debounceTimers.values()) {
//       clearTimeout(timer);
//     }
//     this.debounceTimers.clear();
    
//     console.log('👁️  Stopped all file watchers');
//   }
// }

// // Create global file watcher instance
// export const fileWatcher = new FileWatcher();

// // Check if git repository exists
// async function hasGitRepo() {
//   const gitPath = path.join(process.cwd(), ".git");
//   return fs.existsSync(gitPath);
// }

// // Get current git branch
// async function getCurrentBranch() {
//   try {
//     return await run("git rev-parse --abbrev-ref HEAD");
//   } catch (error) {
//     return "main"; // default branch
//   }
// }

// // Initialize git repo if it doesn't exist
// async function initGitRepo() {
//   try {
//     if (!await hasGitRepo()) {
//       console.log("Initializing git repository...");
//       await run("git init");
//       await run("git remote add origin https://github.com/777Wolf-dot/Silent-Wolf--Bot.git");
//       await run("git fetch origin");
//       await run("git checkout -b main --track origin/main || git checkout -b main");
//       console.log("Git repository initialized");
//       return true;
//     }
//     return false;
//   } catch (error) {
//     console.error("Failed to initialize git repo:", error);
//     return false;
//   }
// }

// // Update from wolf-bot repo (your update source)
// async function updateFromWolfBot(hotReload = false) {
//   let updatedFiles = [];
//   const changesDir = path.join(process.cwd(), 'tmp_changes');
  
//   try {
//     // Save current state
//     const oldRev = await run("git rev-parse HEAD").catch(() => "unknown");
//     const currentBranch = await getCurrentBranch();
    
//     console.log(`Current branch: ${currentBranch}, Old revision: ${oldRev.substring(0, 7)}`);
    
//     // Add wolf-bot as upstream if not already added
//     try {
//       await run("git remote get-url wolf-bot-upstream");
//     } catch {
//       console.log("Adding wolf-bot as upstream remote...");
//       await run("git remote add wolf-bot-upstream https://github.com/777Wolf-dot/wolf-bot.git");
//     }
    
//     // Fetch from both remotes
//     console.log("Fetching updates from both remotes...");
//     await run("git fetch --all --prune");
    
//     // Check what branch to update from
//     let sourceBranch = "main";
//     let sourceRemote = "wolf-bot-upstream";
    
//     // Try to find matching branch in wolf-bot repo
//     try {
//       const wolfBotBranches = await run("git ls-remote --heads wolf-bot-upstream");
//       const branches = wolfBotBranches.split('\n').map(line => {
//         const match = line.match(/refs\/heads\/(.+)/);
//         return match ? match[1] : null;
//       }).filter(Boolean);
      
//       if (branches.includes(currentBranch)) {
//         sourceBranch = currentBranch;
//         console.log(`Found matching branch in wolf-bot: ${currentBranch}`);
//       } else {
//         console.log(`Branch ${currentBranch} not found in wolf-bot, using main branch`);
//       }
//     } catch (error) {
//       console.warn("Could not check wolf-bot branches:", error.message);
//     }
    
//     // Get new revision from wolf-bot
//     const newRev = await run(`git rev-parse wolf-bot-upstream/${sourceBranch}`);
//     const alreadyUpToDate = oldRev === newRev;
    
//     if (alreadyUpToDate) {
//       console.log("Already up to date with wolf-bot repo");
//       return { 
//         oldRev, 
//         newRev, 
//         alreadyUpToDate, 
//         source: `wolf-bot/${sourceBranch}`,
//         type: "git",
//         updatedFiles: []
//       };
//     }
    
//     console.log(`Updating from wolf-bot/${sourceBranch}: ${oldRev.substring(0, 7)} → ${newRev.substring(0, 7)}`);
    
//     // For hot reload, get list of changed files
//     if (hotReload) {
//       try {
//         // Get diff between current and new
//         const diffOutput = await run(`git diff --name-only ${oldRev} wolf-bot-upstream/${sourceBranch}`);
//         updatedFiles = diffOutput.split('\n').filter(line => line.trim());
//         console.log(`Changed files detected: ${updatedFiles.length} files`);
        
//         if (updatedFiles.length > 0) {
//           // Create temporary directory for changes
//           if (fs.existsSync(changesDir)) {
//             fs.rmSync(changesDir, { recursive: true });
//           }
//           fs.mkdirSync(changesDir, { recursive: true });
          
//           // Save current versions of changed files
//           for (const file of updatedFiles) {
//             if (fs.existsSync(file)) {
//               const destDir = path.join(changesDir, path.dirname(file));
//               if (!fs.existsSync(destDir)) {
//                 fs.mkdirSync(destDir, { recursive: true });
//               }
//               fs.copyFileSync(file, path.join(changesDir, file));
//             }
//           }
//         }
//       } catch (error) {
//         console.warn("Could not get diff:", error.message);
//       }
//     }
    
//     // Create backup branch just in case
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const backupBranch = `backup-before-update-${timestamp}`;
//     await run(`git branch ${backupBranch}`);
//     console.log(`Created backup branch: ${backupBranch}`);
    
//     // Reset to wolf-bot's latest
//     await run(`git reset --hard wolf-bot-upstream/${sourceBranch}`);
    
//     // Try to preserve important local files
//     await preserveLocalFiles();
    
//     // Clean untracked files (be careful)
//     try {
//       await run("git clean -fd -e node_modules -e tmp -e logs -e session -e settings.js -e config.json -e .env");
//     } catch (cleanError) {
//       console.warn("Git clean failed:", cleanError.message);
//     }
    
//     return { 
//       oldRev, 
//       newRev, 
//       alreadyUpToDate, 
//       source: `wolf-bot/${sourceBranch}`,
//       backupBranch,
//       type: "git",
//       updatedFiles,
//       changesDir: updatedFiles.length > 0 ? changesDir : null
//     };
    
//   } catch (error) {
//     console.error("Update from wolf-bot failed:", error);
    
//     // Try to restore from backup
//     try {
//       const branches = await run("git branch --list backup-before-update-*");
//       if (branches) {
//         const latestBackup = branches.split('\n').filter(b => b.trim()).pop().trim();
//         await run(`git reset --hard ${latestBackup}`);
//         console.log(`Restored from backup: ${latestBackup}`);
//       }
//     } catch (restoreError) {
//       console.error("Could not restore from backup:", restoreError);
//     }
    
//     throw new Error(`Update from wolf-bot failed: ${error.message}`);
//   }
// }

// // Preserve important local files that shouldn't be overwritten
// async function preserveLocalFiles() {
//   const filesToPreserve = [
//     'settings.js',
//     'config.json',
//     '.env',
//     'session',
//     'data',
//     'logs',
//     'tmp_changes'
//   ];
  
//   const tmpDir = path.join(process.cwd(), 'tmp_preserve');
//   if (!fs.existsSync(tmpDir)) {
//     fs.mkdirSync(tmpDir, { recursive: true });
//   }
  
//   for (const file of filesToPreserve) {
//     const filePath = path.join(process.cwd(), file);
//     const tmpPath = path.join(tmpDir, file);
    
//     if (fs.existsSync(filePath)) {
//       if (fs.statSync(filePath).isDirectory()) {
//         // Copy directory
//         await copyDir(filePath, tmpPath);
//       } else {
//         // Copy file
//         fs.copyFileSync(filePath, tmpPath);
//       }
//       console.log(`Preserved: ${file}`);
//     }
//   }
  
//   // After update, restore preserved files
//   if (fs.existsSync(tmpDir)) {
//     const preservedItems = fs.readdirSync(tmpDir);
//     for (const item of preservedItems) {
//       const srcPath = path.join(tmpDir, item);
//       const destPath = path.join(process.cwd(), item);
      
//       if (fs.existsSync(destPath)) {
//         // If it's a directory, merge contents
//         if (fs.statSync(srcPath).isDirectory() && fs.statSync(destPath).isDirectory()) {
//           await copyDir(srcPath, destPath);
//         } else {
//           // Keep the preserved version
//           if (fs.statSync(destPath).isDirectory()) {
//             fs.rmSync(destPath, { recursive: true });
//           }
//           if (fs.statSync(srcPath).isDirectory()) {
//             await copyDir(srcPath, destPath);
//           } else {
//             fs.copyFileSync(srcPath, destPath);
//           }
//         }
//       } else {
//         // Copy if doesn't exist
//         if (fs.statSync(srcPath).isDirectory()) {
//           await copyDir(srcPath, destPath);
//         } else {
//           fs.copyFileSync(srcPath, destPath);
//         }
//       }
//     }
    
//     // Cleanup
//     fs.rmSync(tmpDir, { recursive: true });
//   }
// }

// // Update via ZIP from wolf-bot repo
// async function updateViaZip(hotReload = false) {
//   const zipUrl = "https://github.com/777Wolf-dot/wolf-bot/archive/refs/heads/main.zip";
//   const tmpDir = path.join(process.cwd(), "tmp_update");
//   const zipPath = path.join(tmpDir, "wolf-bot-update.zip");
//   const extractDir = path.join(tmpDir, "extracted");
  
//   try {
//     // Create backup of important files
//     await preserveLocalFiles();
    
//     // Clean/create temp directory
//     if (fs.existsSync(tmpDir)) {
//       await run(`rm -rf ${tmpDir}`);
//     }
//     fs.mkdirSync(tmpDir, { recursive: true });
//     fs.mkdirSync(extractDir, { recursive: true });
    
//     console.log(`Downloading ZIP from wolf-bot: ${zipUrl}`);
    
//     // Download using curl or wget
//     let downloadCmd;
//     if (await run("which curl").then(() => true).catch(() => false)) {
//       downloadCmd = `curl -L "${zipUrl}" -o "${zipPath}" --connect-timeout 30 --max-time 300 --silent --show-error`;
//     } else if (await run("which wget").then(() => true).catch(() => false)) {
//       downloadCmd = `wget "${zipUrl}" -O "${zipPath}" --timeout=30 --tries=3 --quiet`;
//     } else {
//       throw new Error("Neither curl nor wget is available");
//     }
    
//     await run(downloadCmd);
    
//     if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
//       throw new Error("Downloaded ZIP file is empty or doesn't exist");
//     }
    
//     console.log(`Downloaded ${fs.statSync(zipPath).size} bytes from wolf-bot`);
    
//     // Extract ZIP
//     console.log("Extracting ZIP...");
    
//     if (await run("which unzip").then(() => true).catch(() => false)) {
//       await run(`unzip -o "${zipPath}" -d "${extractDir}"`);
//     } else if (await run("which 7z").then(() => true).catch(() => false)) {
//       await run(`7z x "${zipPath}" -o"${extractDir}" -y`);
//     } else {
//       throw new Error("No extraction tool found (install unzip or 7z)");
//     }
    
//     // Find the extracted content (GitHub ZIPs have wolf-bot-main folder)
//     const extractedItems = fs.readdirSync(extractDir);
//     let sourceDir = extractDir;
    
//     // Look for wolf-bot-main folder
//     const wolfBotFolder = extractedItems.find(item => 
//       item.toLowerCase().includes('wolf-bot')
//     );
    
//     if (wolfBotFolder) {
//       sourceDir = path.join(extractDir, wolfBotFolder);
//       console.log(`Found source folder: ${wolfBotFolder}`);
//     }
    
//     console.log(`Copying files from ${sourceDir} to ${process.cwd()}`);
    
//     // Files/directories to exclude from update
//     const excludeItems = [
//       '.git',
//       'node_modules',
//       'tmp',
//       'logs',
//       'session',
//       'data',
//       'settings.js',
//       'config.json',
//       '.env',
//       'tmp_update',
//       'tmp_preserve',
//       'tmp_changes'
//     ];
    
//     // For hot reload, track what files were updated
//     const updatedFiles = [];
    
//     // Copy files, excluding protected items
//     await copyDirWithExclude(sourceDir, process.cwd(), excludeItems, hotReload ? updatedFiles : null);
    
//     // Cleanup
//     await run(`rm -rf ${tmpDir}`);
    
//     return { 
//       success: true, 
//       source: "wolf-bot ZIP",
//       url: zipUrl,
//       updatedFiles: hotReload ? updatedFiles : []
//     };
//   } catch (error) {
//     // Cleanup on error
//     if (fs.existsSync(tmpDir)) {
//       await run(`rm -rf ${tmpDir}`).catch(() => {});
//     }
//     throw new Error(`ZIP update from wolf-bot failed: ${error.message}`);
//   }
// }

// // Helper function to copy directory with exclusions
// async function copyDirWithExclude(src, dest, exclude = [], updatedFiles = null) {
//   if (!fs.existsSync(dest)) {
//     fs.mkdirSync(dest, { recursive: true });
//   }
  
//   const entries = fs.readdirSync(src, { withFileTypes: true });
  
//   for (const entry of entries) {
//     const srcPath = path.join(src, entry.name);
//     const destPath = path.join(dest, entry.name);
    
//     // Check if excluded
//     if (exclude.some(pattern => {
//       if (pattern.includes('*')) {
//         const regex = new RegExp(pattern.replace(/\*/g, '.*'));
//         return regex.test(entry.name);
//       }
//       return entry.name === pattern;
//     })) {
//       console.log(`Skipping excluded: ${entry.name}`);
//       continue;
//     }
    
//     if (entry.isDirectory()) {
//       if (!fs.existsSync(destPath)) {
//         fs.mkdirSync(destPath, { recursive: true });
//       }
//       await copyDirWithExclude(srcPath, destPath, exclude, updatedFiles);
//     } else {
//       // Skip if destination is a protected file that should be preserved
//       const isProtected = ['settings.js', 'config.json', '.env'].includes(entry.name.toLowerCase());
//       if (isProtected && fs.existsSync(destPath)) {
//         console.log(`Preserving existing: ${entry.name}`);
//         continue;
//       }
      
//       // Check if file is different (for hot reload tracking)
//       let fileChanged = true;
//       if (updatedFiles !== null && fs.existsSync(destPath)) {
//         try {
//           const srcContent = fs.readFileSync(srcPath, 'utf8');
//           const destContent = fs.readFileSync(destPath, 'utf8');
//           fileChanged = srcContent !== destContent;
//         } catch {
//           fileChanged = true;
//         }
//       }
      
//       if (fileChanged) {
//         fs.copyFileSync(srcPath, destPath);
//         console.log(`Copied: ${entry.name}`);
        
//         if (updatedFiles !== null) {
//           updatedFiles.push(destPath);
//         }
//       }
//     }
//   }
// }

// // Copy directory (simple version)
// async function copyDir(src, dest) {
//   if (!fs.existsSync(dest)) {
//     fs.mkdirSync(dest, { recursive: true });
//   }
  
//   const entries = fs.readdirSync(src, { withFileTypes: true });
  
//   for (const entry of entries) {
//     const srcPath = path.join(src, entry.name);
//     const destPath = path.join(dest, entry.name);
    
//     if (entry.isDirectory()) {
//       await copyDir(srcPath, destPath);
//     } else {
//       fs.copyFileSync(srcPath, destPath);
//     }
//   }
// }

// // Enhanced settings loader with hot reload support
// async function loadSettings() {
//   const possiblePaths = [
//     path.join(process.cwd(), "settings.js"),
//     path.join(process.cwd(), "config", "settings.js"),
//     path.join(__dirname, "..", "settings.js"),
//     path.join(__dirname, "..", "..", "settings.js"),
//   ];
  
//   let settings = {};
  
//   for (const settingsPath of possiblePaths) {
//     try {
//       if (fs.existsSync(settingsPath)) {
//         console.log(`Loading settings from: ${settingsPath}`);
        
//         // Clear any existing cache
//         clearModuleCache(settingsPath);
        
//         // Load the module
//         const module = await import(`file://${settingsPath}`);
//         settings = module.default || module;
        
//         // Watch for changes if not already watching
//         if (!fileWatcher.watchers.has(settingsPath)) {
//           fileWatcher.watchFile(settingsPath, async () => {
//             console.log(`🔄 Settings file changed, reloading...`);
//             try {
//               clearModuleCache(settingsPath);
//               const newModule = await import(`file://${settingsPath}`);
//               Object.assign(settings, newModule.default || newModule);
//               console.log(`✅ Settings reloaded successfully`);
//             } catch (error) {
//               console.error(`❌ Failed to reload settings:`, error);
//             }
//           });
//         }
        
//         break;
//       }
//     } catch (error) {
//       console.warn(`Failed to load settings from ${settingsPath}:`, error.message);
//       continue;
//     }
//   }
  
//   if (Object.keys(settings).length === 0) {
//     console.warn("No settings file found, using empty settings");
//   }
  
//   return settings;
// }

// // Dynamic command loader with hot reload
// export class DynamicCommandLoader {
//   constructor(commandsDir = path.join(process.cwd(), 'commands')) {
//     this.commandsDir = commandsDir;
//     this.commands = new Map();
//     this.commandFiles = new Map();
//   }
  
//   async loadAllCommands() {
//     console.log(`📂 Loading commands from: ${this.commandsDir}`);
    
//     if (!fs.existsSync(this.commandsDir)) {
//       console.warn(`Commands directory not found: ${this.commandsDir}`);
//       return this.commands;
//     }
    
//     const files = fs.readdirSync(this.commandsDir)
//       .filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
    
//     for (const file of files) {
//       await this.loadCommand(file);
//     }
    
//     // Watch for changes
//     this.watchCommands();
    
//     return this.commands;
//   }
  
//   async loadCommand(filename) {
//     const filePath = path.join(this.commandsDir, filename);
    
//     try {
//       // Clear cache
//       clearModuleCache(filePath);
      
//       // Import the module
//       const module = await import(`file://${filePath}`);
//       const command = module.default || module;
      
//       if (command && command.name) {
//         this.commands.set(command.name, command);
//         this.commandFiles.set(command.name, filePath);
//         console.log(`✅ Loaded command: ${command.name}`);
//         return command;
//       } else {
//         console.warn(`Invalid command module in ${filename}`);
//       }
//     } catch (error) {
//       console.error(`❌ Failed to load command ${filename}:`, error);
//     }
    
//     return null;
//   }
  
//   watchCommands() {
//     // Watch the commands directory for changes
//     fileWatcher.watchDirectory(this.commandsDir, async (changedPath) => {
//       const filename = path.basename(changedPath);
      
//       if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
//         console.log(`🔄 Command file changed: ${filename}`);
        
//         // Find which command this file belongs to
//         for (const [cmdName, cmdPath] of this.commandFiles.entries()) {
//           if (cmdPath === changedPath) {
//             // Reload the command
//             await this.loadCommand(filename);
//             console.log(`✅ Reloaded command: ${cmdName}`);
//             break;
//           }
//         }
//       }
//     });
//   }
  
//   getCommand(name) {
//     return this.commands.get(name);
//   }
  
//   getAllCommands() {
//     return Array.from(this.commands.values());
//   }
// }

// // Dynamic event handler loader
// export class DynamicEventHandler {
//   constructor(handlersDir = path.join(process.cwd(), 'handlers')) {
//     this.handlersDir = handlersDir;
//     this.handlers = new Map();
//   }
  
//   async loadAllHandlers() {
//     console.log(`📂 Loading event handlers from: ${this.handlersDir}`);
    
//     if (!fs.existsSync(this.handlersDir)) {
//       console.warn(`Handlers directory not found: ${this.handlersDir}`);
//       return this.handlers;
//     }
    
//     const files = fs.readdirSync(this.handlersDir)
//       .filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
    
//     for (const file of files) {
//       await this.loadHandler(file);
//     }
    
//     // Watch for changes
//     this.watchHandlers();
    
//     return this.handlers;
//   }
  
//   async loadHandler(filename) {
//     const filePath = path.join(this.handlersDir, filename);
    
//     try {
//       // Clear cache
//       clearModuleCache(filePath);
      
//       // Import the module
//       const module = await import(`file://${filePath}`);
//       const handler = module.default || module;
      
//       if (handler && handler.event) {
//         this.handlers.set(handler.event, handler);
//         console.log(`✅ Loaded handler for event: ${handler.event}`);
//         return handler;
//       } else {
//         console.warn(`Invalid handler module in ${filename}`);
//       }
//     } catch (error) {
//       console.error(`❌ Failed to load handler ${filename}:`, error);
//     }
    
//     return null;
//   }
  
//   watchHandlers() {
//     // Watch the handlers directory for changes
//     fileWatcher.watchDirectory(this.handlersDir, async (changedPath) => {
//       const filename = path.basename(changedPath);
      
//       if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
//         console.log(`🔄 Handler file changed: ${filename}`);
//         await this.loadHandler(filename);
//       }
//     });
//   }
  
//   getHandler(event) {
//     return this.handlers.get(event);
//   }
// }

// // Update progress bar animation
// function getProgressBar(percentage) {
//   const filled = Math.round((percentage / 100) * 10);
//   const empty = 10 - filled;
//   return `█`.repeat(filled) + `▒`.repeat(empty);
// }

// // Main command handler
// export default {
//   name: "update",
//   description: "Update bot from wolf-bot repository (with hot reload)",
//   category: "owner",
//   ownerOnly: true,

//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const sender = m.key.participant || m.key.remoteJid;
    
//     // Send initial message and store its key for editing
//     const initialMessage = await sock.sendMessage(jid, { 
//       text: "🔄 WolfBot Update System\nChecking for updates...\nInitializing update process..."
//     }, { quoted: m });
    
//     let updateMessageKey = initialMessage.key;
    
//     // Edit message helper
//     const editMessage = async (text) => {
//       try {
//         await sock.sendMessage(jid, { 
//           text,
//           edit: updateMessageKey
//         }, { quoted: m });
//       } catch (error) {
//         console.log("Could not edit message, sending new one:", error.message);
//         const newMsg = await sock.sendMessage(jid, { text }, { quoted: m });
//         updateMessageKey = newMsg.key;
//       }
//     };
    
//     // Animate progress
//     const animateProgress = async (baseText, progress = 0) => {
//       const bar = getProgressBar(progress);
//       const progressText = `${baseText}\n${bar} ${progress}%`;
//       await editMessage(progressText);
//     };
    
//     try {
//       // Load settings
//       await animateProgress("🔍 Loading bot settings...", 10);
//       const settings = await loadSettings();
      
//       // Check if owner
//       const isOwner = m.key.fromMe || 
//         (settings.ownerNumber && sender.includes(settings.ownerNumber)) ||
//         (settings.botOwner && sender.includes(settings.botOwner));
      
//       if (!isOwner) {
//         await editMessage("❌ Permission Denied\nOnly the bot owner can update the bot.");
//         return;
//       }
      
//       // Parse arguments
//       const forceMethod = args[0]?.toLowerCase();
//       const isForceZip = forceMethod === 'zip';
//       const isForceGit = forceMethod === 'git';
//       const hotReload = args.includes('hot') || args.includes('live');
//       const softUpdate = args.includes('soft') || args.includes('no-restart');
      
//       let updateResult;
      
//       // Check if we have git repo, initialize if not
//       await animateProgress("📁 Checking git repository...", 20);
//       const hasGit = await hasGitRepo();
      
//       if (!hasGit && !isForceZip) {
//         await animateProgress("📦 Initializing git repository...", 30);
//         await initGitRepo();
//       }
      
//       // Determine update method
//       if ((hasGit && !isForceZip) || isForceGit) {
//         // Git update from wolf-bot
//         await animateProgress("🌐 Checking wolf-bot repository...", 40);
        
//         updateResult = await updateFromWolfBot(hotReload || softUpdate);
        
//         if (updateResult.alreadyUpToDate) {
//           await editMessage(
//             "✅ Already Up to Date!\n" +
//             `Source: ${updateResult.source}\n` +
//             `Commit: ${updateResult.newRev.substring(0, 7)}\n` +
//             "No updates available."
//           );
//           return;
//         } else {
//           await animateProgress("📥 Installing updates...", 60);
          
//           // Install dependencies if package.json changed
//           const needsNpmInstall = updateResult.updatedFiles.some(file => 
//             file.includes('package.json') || file.includes('package-lock.json')
//           );
          
//           if (needsNpmInstall) {
//             await animateProgress("📦 Installing dependencies...", 70);
//             try {
//               await run("npm install --no-audit --no-fund --loglevel=error");
//               await animateProgress("✅ Dependencies installed!", 80);
//             } catch (npmError) {
//               console.error("npm install failed:", npmError);
//             }
//           }
          
//           // Hot reload if requested and possible
//           if ((hotReload || softUpdate) && updateResult.updatedFiles.length > 0) {
//             await animateProgress("🔄 Performing hot reload...", 85);
            
//             try {
//               const reloadResults = await executeHotReload(updateResult.updatedFiles);
//               const successCount = reloadResults.filter(r => r.success).length;
              
//               await editMessage(
//                 "✅ Hot Update Complete!\n" +
//                 `Source: ${updateResult.source}\n` +
//                 `Updated: ${updateResult.oldRev.substring(0, 7)} → ${updateResult.newRev.substring(0, 7)}\n` +
//                 `Files Updated: ${updateResult.updatedFiles.length}\n` +
//                 `Hot Reloaded: ${successCount}/${reloadResults.length} modules\n` +
//                 `Backup: ${updateResult.backupBranch || 'None'}\n` +
//                 "Bot continues running without restart! 🎉"
//               );
              
//               // Cleanup
//               if (updateResult.changesDir && fs.existsSync(updateResult.changesDir)) {
//                 fs.rmSync(updateResult.changesDir, { recursive: true });
//               }
              
//               return;
//             } catch (reloadError) {
//               console.error("Hot reload failed:", reloadError);
//               await editMessage(
//                 "⚠️ Update Applied but Hot Reload Failed\n" +
//                 "Some files were updated but couldn't be reloaded.\n" +
//                 "Restart may be required for full effect."
//               );
//             }
//           }
          
//           await editMessage(
//             "✅ Update Complete!\n" +
//             `Source: ${updateResult.source}\n` +
//             `Updated: ${updateResult.oldRev.substring(0, 7)} → ${updateResult.newRev.substring(0, 7)}\n` +
//             `Files Updated: ${updateResult.updatedFiles.length}\n` +
//             `Backup: ${updateResult.backupBranch || 'None'}\n` +
//             "Preparing to restart..."
//           );
//         }
//       } else {
//         // ZIP update from wolf-bot
//         await animateProgress("📦 Downloading wolf-bot update...", 40);
        
//         updateResult = await updateViaZip(hotReload || softUpdate);
        
//         await animateProgress("📂 Extracting files...", 60);
//         await animateProgress("📝 Installing updates...", 80);
        
//         await editMessage(
//           "✅ ZIP Update Complete!\n" +
//           `Source: ${updateResult.source}\n` +
//           `URL: ${updateResult.url}\n` +
//           `Files Updated: ${updateResult.updatedFiles.length}\n` +
//           "Preparing to restart..."
//         );
//       }
      
//       // Only restart if not doing soft update
//       if (!softUpdate && !hotReload) {
//         await animateProgress("🔄 Restarting WolfBot...", 95);
        
//         // Small delay to ensure message is sent
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Send final message
//         await editMessage(
//           "🚀 Restarting Now!\n" +
//           "Bot will be back in a few moments...\n" +
//           "WolfBot is updating..."
//         );
        
//         // Restart the process
//         await restartProcess();
//       } else {
//         await editMessage(
//           "✅ Soft Update Complete!\n" +
//           "Updates have been applied without restart.\n" +
//           "Some changes may require restart to take full effect."
//         );
//       }
      
//     } catch (error) {
//       console.error("Update error:", error);
      
//       let errorMessage = 
//         "❌ Update Failed\n" +
//         `Error: ${error.message}\n\n`;
      
//       // Add helpful suggestions
//       if (error.message.includes('git') || error.message.includes('ZIP')) {
//         errorMessage += "Try these solutions:\n";
//         errorMessage += "• Use different method: `!update git` or `!update zip`\n";
//         errorMessage += "• Use hot reload: `!update hot`\n";
//         errorMessage += "• Soft update (no restart): `!update soft`\n";
//         errorMessage += "• Check internet connection\n";
//         errorMessage += "• Ensure required tools are installed: git, curl, unzip\n";
//         errorMessage += "• Manually update from: https://github.com/777Wolf-dot/wolf-bot";
//       }
      
//       await editMessage(errorMessage);
//     }
//   }
// };

// // Simple restart function (kept for compatibility)
// async function restartProcess() {
//   console.log("Restarting bot...");
  
//   try {
//     // Try PM2 first
//     if (await run("which pm2").then(() => true).catch(() => false)) {
//       console.log("Restarting with PM2...");
//       await run("pm2 restart all");
//       return;
//     }
    
//     // Try forever
//     if (await run("which forever").then(() => true).catch(() => false)) {
//       console.log("Restarting with Forever...");
//       await run("forever restartall");
//       return;
//     }
    
//     // If no process manager, just exit
//     console.log("No process manager found, exiting...");
//     process.exit(0);
    
//   } catch (error) {
//     console.error("Restart failed:", error);
//     // Force exit
//     process.exit(0);
//   }
// }






























































import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import { createRequire } from 'module';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

/* -------------------- Configuration -------------------- */
const UPDATE_ZIP_URL = "https://github.com/777Wolf-dot/wolf-bot/archive/refs/heads/main.zip";
const GIT_REPO_URL = "https://github.com/777Wolf-dot/wolf-bot.git";
const OWNER_REPO_URL = "https://github.com/777Wolf-dot/Silent-Wolf--Bot.git";

/* -------------------- Enhanced Helpers -------------------- */
async function run(cmd, timeout = 60000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || stdout || err.message));
      resolve(stdout.toString().trim());
    });
  });
}

async function hasGitRepo() {
  const gitDir = path.join(process.cwd(), '.git');
  if (!fs.existsSync(gitDir)) return false;
  try {
    await run('git --version');
    return true;
  } catch {
    return false;
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : require('http');
    const req = client.get(url, { 
      headers: { 'User-Agent': 'WolfBot-Updater/2.0' } 
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    });
    req.on('error', err => fs.unlink(dest, () => reject(err)));
  });
}

async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    await run(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force"`);
    return;
  }
  for (const tool of ['unzip', '7z', 'busybox unzip']) {
    try {
      await run(`command -v ${tool.split(' ')[0]}`);
      await run(`${tool} -o '${zipPath}' -d '${outDir}'`);
      return;
    } catch {}
  }
  throw new Error("No unzip tool found (unzip/7z/busybox).");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src);
  for (const entry of entries) {
    if (ignore.some(pattern => 
      pattern.includes('*') 
        ? new RegExp(pattern.replace(/\*/g, '.*')).test(entry)
        : entry === pattern
    )) continue;
    
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);

    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      outList.push(path.join(relative, entry).replace(/\\/g, '/'));
    }
  }
}

/* -------------------- Git Update -------------------- */
async function updateViaGit() {
  try {
    // Get current state
    const oldRev = await run('git rev-parse HEAD').catch(() => 'unknown');
    const currentBranch = await run('git rev-parse --abbrev-ref HEAD').catch(() => 'main');
    
    // Add or update wolf-bot upstream
    try {
      await run('git remote get-url wolf-bot-upstream');
    } catch {
      await run(`git remote add wolf-bot-upstream ${GIT_REPO_URL}`);
    }
    
    // Fetch updates
    await run('git fetch --all --prune');
    
    // Check if up to date
       const newRev = await run(`git rev-parse wolf-bot-upstream/${currentBranch}`).catch(async () => 
      await run('git rev-parse wolf-bot-upstream/main')
    );
    
    const alreadyUpToDate = oldRev === newRev;
    if (alreadyUpToDate) {
      return { oldRev, newRev, alreadyUpToDate, branch: currentBranch };
    }
    
    // Get changes
    const commits = await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBranch = `backup-${timestamp}`;
    await run(`git branch ${backupBranch}`);
    
    // Reset to new revision
    await run(`git reset --hard ${newRev}`);
    
    // Clean untracked files but preserve important ones
    const preserve = ['node_modules', 'session', 'data', 'tmp', 'logs', 'settings.js', 'config.json', '.env'];
    const preserveArgs = preserve.map(p => `-e ${p}`).join(' ');
    await run(`git clean -fd ${preserveArgs}`).catch(() => {});
    
    return { 
      oldRev, 
      newRev, 
      alreadyUpToDate, 
      branch: currentBranch,
      backupBranch,
      commits: commits ? commits.split('\n') : [],
      files: files ? files.split('\n') : []
    };
  } catch (error) {
    // Try to restore from any backup branch
    try {
      const branches = await run('git branch --list backup-*');
      if (branches) {
        const latestBackup = branches.split('\n').filter(b => b.trim()).pop().trim();
        await run(`git reset --hard ${latestBackup}`);
        console.log(`Restored from backup: ${latestBackup}`);
      }
    } catch {}
    throw error;
  }
}

/* -------------------- ZIP Update -------------------- */
async function updateViaZip(zipUrl = UPDATE_ZIP_URL) {
  const tmpDir = path.join(process.cwd(), 'tmp_update');
  fs.mkdirSync(tmpDir, { recursive: true });

  const zipPath = path.join(tmpDir, 'update.zip');
  const extractTo = path.join(tmpDir, 'extracted');
  
  try {
    // Download
    await downloadFile(zipUrl, zipPath);
    
    // Extract
    fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);
    
    // Find extracted root (GitHub ZIPs have folder)
    const entries = fs.readdirSync(extractTo);
    const root = entries.length === 1 && fs.lstatSync(path.join(extractTo, entries[0])).isDirectory()
      ? path.join(extractTo, entries[0])
      : extractTo;
    
    // Copy files, ignoring sensitive directories
    const ignore = ['node_modules', '.git', 'session', 'tmp', 'temp', 'data', 'logs'];
    const copied = [];
    copyRecursive(root, process.cwd(), ignore, '', copied);
    
    // Cleanup
    fs.rmSync(extractTo, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
    
    return { 
      success: true, 
      copiedFiles: copied,
      url: zipUrl 
    };
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    throw error;
  }
}

/* -------------------- Restart -------------------- */
async function restartProcess(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: '✅ Update complete! Restarting…' }, { quoted: message }).catch(() => {});
  try {
    await run('pm2 restart all');
  } catch {
    setTimeout(() => process.exit(0), 1000);
  }
}

/* -------------------- Module Cache Management -------------------- */
function clearModuleCache(modulePath) {
  const normalizedPath = path.resolve(modulePath);
  
  // Clear from require.cache
  if (require.cache) {
    for (const key in require.cache) {
      if (key.includes(normalizedPath)) {
        delete require.cache[key];
      }
    }
  }
}

/* -------------------- Main Command -------------------- */
export default {
  name: "update",
  description: "Update bot from wolf-bot repository",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    
    // Check if owner (simple check)
    const isOwner = m.key.fromMe || sender.includes("947") || sender.includes("owner-number");
    if (!isOwner) {
      return sock.sendMessage(jid, { 
        text: '❌ Only bot owner can use .update command' 
      }, { quoted: m });
    }
    
    let statusMessage;
    try {
      // Initial status
      statusMessage = await sock.sendMessage(jid, { 
        text: '🔄 Checking for updates...\nPlease wait...' 
      }, { quoted: m });
      
      // Parse arguments
      const forceMethod = args[0]?.toLowerCase();
      const useZip = forceMethod === 'zip' || forceMethod === 'force-zip';
      const useGit = forceMethod === 'git' || forceMethod === 'force-git';
      const hotReload = args.includes('hot') || args.includes('live');
      const softUpdate = args.includes('soft') || args.includes('no-restart');
      
      // Determine update method
      if ((await hasGitRepo() && !useZip) || useGit) {
        // Git update
        await sock.sendMessage(jid, { 
          text: '🌐 Updating via Git...', 
          edit: statusMessage.key 
        });
        
        const result = await updateViaGit();
        
        if (result.alreadyUpToDate) {
          await sock.sendMessage(jid, { 
            text: `✅ Already up to date!\nBranch: ${result.branch}\nCommit: ${result.newRev.slice(0, 7)}`, 
            edit: statusMessage.key 
          });
          return;
        }
        
        await sock.sendMessage(jid, { 
          text: `📥 Updated from ${result.oldRev.slice(0, 7)} to ${result.newRev.slice(0, 7)}\n` +
                `📦 ${result.files.length} files changed\n` +
                'Installing dependencies...', 
          edit: statusMessage.key 
        });
        
      } else {
        // ZIP update
        await sock.sendMessage(jid, { 
          text: '📥 Downloading update via ZIP...', 
          edit: statusMessage.key 
        });
        
        const result = await updateViaZip();
        
        await sock.sendMessage(jid, { 
          text: `✅ Extracted ${result.copiedFiles.length} files\n` +
                'Installing dependencies...', 
          edit: statusMessage.key 
        });
      }
      
      // Install dependencies
      await sock.sendMessage(jid, { 
        text: '📦 Installing npm packages...', 
        edit: statusMessage.key 
      });
      
      await run('npm install --no-audit --no-fund');
      
      // Hot reload or restart
      if (hotReload || softUpdate) {
        await sock.sendMessage(jid, { 
          text: '✅ Update applied without restart!\n' +
                'Some changes may require restart to take effect.', 
          edit: statusMessage.key 
        });
        
        // Clear module cache for updated files
        clearModuleCache(process.cwd());
        
      } else {
        await sock.sendMessage(jid, { 
          text: '✅ Update completed! Restarting bot...', 
          edit: statusMessage.key 
        });
        
        await restartProcess(sock, jid, m);
      }
      
    } catch (err) {
      console.error('Update failed:', err);
      const errorMsg = `❌ Update failed:\n${String(err.message || err).slice(0, 1000)}`;
      
      if (statusMessage?.key) {
        await sock.sendMessage(jid, { text: errorMsg, edit: statusMessage.key });
      } else {
        await sock.sendMessage(jid, { text: errorMsg }, { quoted: m });
      }
    }
  }
};

/* -------------------- Utility Functions -------------------- */
export async function loadSettings() {
  const possiblePaths = [
    path.join(process.cwd(), "settings.js"),
    path.join(process.cwd(), "config", "settings.js"),
  ];
  
  for (const settingsPath of possiblePaths) {
    try {
      if (fs.existsSync(settingsPath)) {
        clearModuleCache(settingsPath);
        const module = await import(`file://${settingsPath}`);
        return module.default || module;
      }
    } catch (error) {
      console.warn(`Failed to load settings from ${settingsPath}:`, error.message);
    }
  }
  
  return {};
}

// Helper for module hot reload (can be used by other modules)
export function registerForHotReload(modulePath, reloadCallback) {
  // Implementation for module watching can be added here
  return () => {};
}