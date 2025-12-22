

















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
// //       await run("git clean -fd -e node_modules -e tmp -e logs -e session -e settings.js -e config.json");
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

// // // Main command handler
// // export default {
// //   name: "update",
// //   description: "Update bot from wolf-bot repository",
// //   category: "owner",
// //   ownerOnly: true,

// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const sender = m.key.participant || m.key.remoteJid;
    
// //     // Send initial message
// //     await sock.sendMessage(jid, { 
// //       text: "🔄 Checking for updates from wolf-bot repository..." 
// //     }, { quoted: m });
    
// //     try {
// //       // Load settings
// //       const settings = await loadSettings();
      
// //       // Check if owner
// //       const isOwner = m.key.fromMe || 
// //         (settings.ownerNumber && sender.includes(settings.ownerNumber)) ||
// //         (settings.botOwner && sender.includes(settings.botOwner));
      
// //       if (!isOwner) {
// //         await sock.sendMessage(jid, { 
// //           text: "❌ Only the bot owner can update the bot." 
// //         }, { quoted: m });
// //         return;
// //       }
      
// //       // Parse arguments
// //       const forceMethod = args[0]?.toLowerCase();
// //       const isForceZip = forceMethod === 'zip';
// //       const isForceGit = forceMethod === 'git';
      
// //       let updateResult;
      
// //       // Check if we have git repo, initialize if not
// //       const hasGit = await hasGitRepo();
// //       if (!hasGit && !isForceZip) {
// //         await sock.sendMessage(jid, { 
// //           text: "📦 Initializing git repository for future updates..." 
// //         }, { quoted: m });
// //         await initGitRepo();
// //       }
      
// //       // Determine update method
// //       if ((hasGit && !isForceZip) || isForceGit) {
// //         // Git update from wolf-bot
// //         await sock.sendMessage(jid, { 
// //           text: "🌐 Checking for updates from wolf-bot git repository..." 
// //         }, { quoted: m });
        
// //         updateResult = await updateFromWolfBot();
        
// //         if (updateResult.alreadyUpToDate) {
// //           await sock.sendMessage(jid, { 
// //             text: `✅ Already up to date with wolf-bot!\nSource: ${updateResult.source}\nCommit: ${updateResult.newRev.substring(0, 7)}` 
// //           }, { quoted: m });
// //         } else {
// //           await sock.sendMessage(jid, { 
// //             text: `✅ Successfully updated from wolf-bot!\n\n` +
// //                   `Source: ${updateResult.source}\n` +
// //                   `Updated: ${updateResult.oldRev.substring(0, 7)} → ${updateResult.newRev.substring(0, 7)}\n` +
// //                   `Backup: ${updateResult.backupBranch || 'None'}` 
// //           }, { quoted: m });
// //         }
        
// //         // Install dependencies if package.json changed
// //         await sock.sendMessage(jid, { 
// //           text: "📦 Checking and installing dependencies..." 
// //         }, { quoted: m });
        
// //         try {
// //           if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
// //             await run("npm install --no-audit --no-fund --loglevel=error");
// //             await sock.sendMessage(jid, { 
// //               text: "✅ Dependencies installed successfully!" 
// //             }, { quoted: m });
// //           } else {
// //             await sock.sendMessage(jid, { 
// //               text: "⚠️ No package.json found, skipping dependency installation" 
// //             }, { quoted: m });
// //           }
// //         } catch (npmError) {
// //           console.error("npm install failed:", npmError);
// //           await sock.sendMessage(jid, { 
// //             text: `⚠️ npm install had issues: ${npmError.message}\nContinuing with restart...` 
// //           }, { quoted: m });
// //         }
        
// //       } else {
// //         // ZIP update from wolf-bot
// //         await sock.sendMessage(jid, { 
// //           text: "📦 Downloading update from wolf-bot repository..." 
// //         }, { quoted: m });
        
// //         updateResult = await updateViaZip();
        
// //         await sock.sendMessage(jid, { 
// //           text: `✅ ZIP update from wolf-bot complete!\n\n` +
// //                 `Source: ${updateResult.source}\n` +
// //                 `URL: ${updateResult.url}` 
// //         }, { quoted: m });
// //       }
      
// //       // Final restart
// //       await sock.sendMessage(jid, { 
// //         text: "🔄 Restarting Silent Wolf Bot...\nBot will be back in a few moments." 
// //       }, { quoted: m });
      
// //       // Small delay to ensure message is sent
// //       await new Promise(resolve => setTimeout(resolve, 1000));
      
// //       await restartProcess();
      
// //     } catch (error) {
// //       console.error("Update error:", error);
      
// //       let errorMessage = `❌ Update failed: ${error.message}`;
      
// //       // Add helpful suggestions
// //       if (error.message.includes('git') || error.message.includes('ZIP')) {
// //         errorMessage += "\n\n**Try these solutions:**\n";
// //         errorMessage += "1. Use different method: `!update git` or `!update zip`\n";
// //         errorMessage += "2. Check internet connection\n";
// //         errorMessage += "3. Ensure required tools are installed: git, curl, unzip\n";
// //         errorMessage += "4. Manually update from: https://github.com/777Wolf-dot/wolf-bot";
// //       }
      
// //       await sock.sendMessage(jid, { 
// //         text: errorMessage 
// //       }, { quoted: m });
// //     }
// //   }
// // };























// import { exec } from "child_process";
// import { promisify } from "util";
// import fs from "fs";
// import path from "path";

// const execAsync = promisify(exec);
// const isWindows = process.platform === 'win32';

// export class PanelManager {
//   constructor(panelPath = './panel') {
//     this.panelPath = panelPath;
//     this.panelPort = process.env.PANEL_PORT || 3000;
//   }
  
//   async startPanel() {
//     try {
//       const panelMain = this.findPanelMain();
//       if (!panelMain) {
//         throw new Error("Panel main file not found");
//       }
      
//       console.log(`🚀 Starting panel: ${panelMain}`);
      
//       if (isWindows) {
//         await execAsync(`start /B node "${panelMain}"`, { shell: true });
//       } else {
//         await execAsync(`nohup node "${panelMain}" > panel.log 2>&1 &`, { shell: true });
//       }
      
//       // Wait for panel to start
//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       return { success: true, pid: await this.getPanelPid() };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
  
//   async stopPanel() {
//     try {
//       const pid = await this.getPanelPid();
//       if (pid) {
//         if (isWindows) {
//           await execAsync(`taskkill /F /PID ${pid}`, { shell: true });
//         } else {
//           await execAsync(`kill -9 ${pid}`, { shell: true });
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
  
//   async restartPanel() {
//     await this.stopPanel();
//     return await this.startPanel();
//   }
  
//   async getPanelStatus() {
//     try {
//       const pid = await this.getPanelPid();
//       const running = !!pid;
      
//       // Check if port is listening
//       let portOpen = false;
//       if (running) {
//         if (isWindows) {
//           const result = await execAsync(`netstat -ano | findstr :${this.panelPort}`, { shell: true });
//           portOpen = result.stdout.includes(`:${this.panelPort}`);
//         } else {
//           const result = await execAsync(`netstat -tuln | grep :${this.panelPort}`, { shell: true });
//           portOpen = !!result.stdout;
//         }
//       }
      
//       return {
//         running,
//         pid,
//         port: this.panelPort,
//         portOpen,
//         path: this.panelPath
//       };
//     } catch (error) {
//       return { running: false, error: error.message };
//     }
//   }
  
//   async getPanelPid() {
//     try {
//       if (isWindows) {
//         const result = await execAsync(
//           `Get-WmiObject Win32_Process -Filter "name='node.exe'" | ` +
//           `Where-Object {$_.CommandLine -like '*${this.panelPath.replace(/\\/g, '\\\\')}*'} | ` +
//           `Select-Object -ExpandProperty ProcessId`,
//           { shell: 'powershell' }
//         );
//         return result.stdout.trim();
//       } else {
//         const result = await execAsync(`pgrep -f "${this.panelPath}"`, { shell: true });
//         return result.stdout.trim();
//       }
//     } catch (error) {
//       return null;
//     }
//   }
  
//   findPanelMain() {
//     const possibleFiles = [
//       path.join(this.panelPath, 'index.js'),
//       path.join(this.panelPath, 'app.js'),
//       path.join(this.panelPath, 'server.js'),
//       path.join(this.panelPath, 'main.js'),
//       path.join(process.cwd(), 'panel.js'),
//       path.join(process.cwd(), 'src', 'panel.js')
//     ];
    
//     for (const file of possibleFiles) {
//       if (fs.existsSync(file)) {
//         return file;
//       }
//     }
//     return null;
//   }
// }








import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Panel-specific configurations
const PANEL_MODE = process.env.PANEL_MODE === 'true' || false;
const PANEL_PORT = process.env.PANEL_PORT || 3000;
const PANEL_PATH = process.env.PANEL_PATH || './panel';

// Detect OS
const isWindows = process.platform === 'win32';
const shell = isWindows ? 'powershell' : 'bash';

// Enhanced exec with OS compatibility
async function run(cmd, timeout = 30000) {
  try {
    const command = isWindows ? 
      `powershell -Command "${cmd.replace(/"/g, '\\"')}"` : 
      cmd;
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout, 
      shell: true,
      windowsHide: true 
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.warn(`Command stderr: ${stderr}`);
    }
    return stdout.trim();
  } catch (error) {
    console.error(`Command failed: ${cmd}`, error.message);
    throw error;
  }
}

// Safe git command that handles empty repos
async function gitSafe(cmd, defaultValue = null) {
  try {
    return await run(`git ${cmd}`);
  } catch (error) {
    if (error.message.includes('fatal: not a git repository')) {
      throw new Error("Not a git repository");
    }
    if (error.message.includes('ambiguous argument') || 
        error.message.includes('unknown revision')) {
      // Empty repository - return default value
      return defaultValue;
    }
    throw error;
  }
}

// Check if git repository exists (even if empty)
async function hasGitRepo() {
  const gitPath = path.join(process.cwd(), ".git");
  return fs.existsSync(gitPath);
}

// Check if git repo has commits
async function hasGitCommits() {
  try {
    const result = await run("git rev-list --count HEAD 2>/dev/null || echo 0");
    return parseInt(result) > 0;
  } catch (error) {
    return false;
  }
}

// Get current git branch (handles empty repos)
async function getCurrentBranch() {
  try {
    // Try to get branch from git
    const branch = await gitSafe("rev-parse --abbrev-ref HEAD", "main");
    if (branch && branch !== "HEAD") {
      return branch;
    }
    
    // Check if we're on a branch
    const symbolicRef = await gitSafe("symbolic-ref --short HEAD", null);
    if (symbolicRef) {
      return symbolicRef;
    }
    
    return "main"; // default branch
  } catch (error) {
    return "main";
  }
}

// Get current revision (handles empty repos)
async function getCurrentRevision() {
  try {
    const rev = await gitSafe("rev-parse HEAD", "unknown");
    return rev === "HEAD" ? "unknown" : rev;
  } catch (error) {
    return "unknown";
  }
}

// Initialize git repo properly with first commit
async function initGitRepo() {
  try {
    if (!await hasGitRepo()) {
      console.log("Initializing git repository...");
      await run("git init");
      
      // Add remotes
      await run("git remote add origin https://github.com/777Wolf-dot/Silent-Wolf--Bot.git");
      await run("git remote add wolf-bot-upstream https://github.com/777Wolf-dot/wolf-bot.git");
      
      console.log("✅ Git repository initialized with remotes");
      return { initialized: true, hasCommits: false };
    }
    
    // Check if repo has commits
    const hasCommits = await hasGitCommits();
    return { initialized: false, hasCommits };
    
  } catch (error) {
    console.error("Failed to initialize git repo:", error);
    throw new Error(`Git init failed: ${error.message}`);
  }
}

// Pull from wolf-bot for empty repository (first setup)
async function pullWolfBotForEmptyRepo() {
  try {
    console.log("Setting up empty repository with wolf-bot content...");
    
    // Fetch from wolf-bot
    await run("git fetch wolf-bot-upstream main");
    
    // Reset to wolf-bot (this creates the first commit)
    await run("git reset --hard wolf-bot-upstream/main");
    
    // Now we should have commits
    const hasCommits = await hasGitCommits();
    if (!hasCommits) {
      throw new Error("Failed to get commits from wolf-bot");
    }
    
    console.log("✅ Successfully pulled wolf-bot into empty repository");
    return true;
  } catch (error) {
    console.error("Pull for empty repo failed:", error);
    throw error;
  }
}

// Update from wolf-bot repo (handles empty repos)
async function updateFromWolfBot() {
  try {
    // Check if we have commits
    const hasCommits = await hasGitCommits();
    
    if (!hasCommits) {
      console.log("Empty repository detected, performing initial pull...");
      return await pullWolfBotForEmptyRepo();
    }
    
    // We have commits, proceed with normal update
    const oldRev = await getCurrentRevision();
    const currentBranch = await getCurrentBranch();
    
    console.log(`Current branch: ${currentBranch}, Revision: ${oldRev.substring(0, 7)}`);
    
    // Add wolf-bot upstream if needed
    try {
      await run("git remote get-url wolf-bot-upstream");
    } catch {
      await run("git remote add wolf-bot-upstream https://github.com/777Wolf-dot/wolf-bot.git");
    }
    
    // Fetch updates
    console.log("Fetching updates...");
    await run("git fetch --all --prune");
    
    // Get new revision
    const newRev = await run("git rev-parse wolf-bot-upstream/main");
    const alreadyUpToDate = oldRev === newRev;
    
    if (alreadyUpToDate) {
      return { 
        oldRev, 
        newRev, 
        alreadyUpToDate, 
        source: "wolf-bot/main",
        type: "git",
        wasEmpty: false
      };
    }
    
    console.log(`Updating: ${oldRev.substring(0, 7)} → ${newRev.substring(0, 7)}`);
    
    // Create backup branch (only if we have commits)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBranch = `backup-${timestamp}`;
    
    try {
      await run(`git branch ${backupBranch}`);
      console.log(`Created backup branch: ${backupBranch}`);
    } catch (backupError) {
      console.warn("Could not create backup branch:", backupError.message);
    }
    
    // Update to latest
    await run("git reset --hard wolf-bot-upstream/main");
    
    return { 
      oldRev, 
      newRev, 
      alreadyUpToDate, 
      source: "wolf-bot/main",
      backupBranch,
      type: "git",
      wasEmpty: false
    };
    
  } catch (error) {
    console.error("Git update failed:", error);
    
    // Check if it's an empty repo error
    if (error.message.includes('not a valid object name') || 
        error.message.includes('ambiguous argument')) {
      throw new Error("Git repository is empty. Try initial setup first.");
    }
    
    throw new Error(`Git update failed: ${error.message}`);
  }
}

// OS-compatible file operations
async function copyDirOS(src, dest) {
  if (isWindows) {
    // Windows: use xcopy or native copy
    if (await run('where xcopy').then(() => true).catch(() => false)) {
      await run(`xcopy "${src}" "${dest}" /E /I /H /Y /Q`);
    } else {
      // Native Node.js copy
      await copyDirNative(src, dest);
    }
  } else {
    // Linux/Mac
    await run(`cp -r "${src}" "${dest}"`);
  }
}

async function deleteDirOS(dirPath) {
  if (fs.existsSync(dirPath)) {
    if (isWindows) {
      await run(`rmdir /s /q "${dirPath}"`);
    } else {
      await run(`rm -rf "${dirPath}"`);
    }
  }
}

// Native directory copy
async function copyDirNative(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirNative(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Session backup/restore
async function backupSession() {
  const sessionPath = path.join(process.cwd(), "session");
  const backupPath = path.join(process.cwd(), "session_backup_hot");
  
  if (fs.existsSync(sessionPath)) {
    // Remove old backup
    if (fs.existsSync(backupPath)) {
      await deleteDirOS(backupPath);
    }
    
    // Create backup
    await copyDirOS(sessionPath, backupPath);
    console.log("✅ Session backed up");
    return backupPath;
  }
  return null;
}

async function restoreSession() {
  const sessionPath = path.join(process.cwd(), "session");
  const backupPath = path.join(process.cwd(), "session_backup_hot");
  
  if (fs.existsSync(backupPath)) {
    // Restore critical files only
    const criticalFiles = ['creds.json', 'app-state-sync-version', 'pre-key', 'session'];
    
    for (const file of criticalFiles) {
      const backupFile = path.join(backupPath, file);
      const sessionFile = path.join(sessionPath, file);
      
      if (fs.existsSync(backupFile)) {
        if (fs.existsSync(sessionFile)) {
          // Backup current file first
          const tempBackup = path.join(process.cwd(), `temp_${file}`);
          if (fs.existsSync(sessionFile)) {
            if (fs.statSync(sessionFile).isDirectory()) {
              await copyDirOS(sessionFile, tempBackup);
            } else {
              fs.copyFileSync(sessionFile, tempBackup);
            }
          }
          
          // Restore from backup
          if (fs.statSync(backupFile).isDirectory()) {
            await copyDirOS(backupFile, sessionFile);
          } else {
            fs.copyFileSync(backupFile, sessionFile);
          }
          
          // Cleanup temp
          if (fs.existsSync(tempBackup)) {
            await deleteDirOS(tempBackup);
          }
        }
      }
    }
    
    // Cleanup backup
    await deleteDirOS(backupPath);
    console.log("✅ Session restored");
  }
}

// ZIP update with panel support
async function updateViaZip() {
  const zipUrl = "https://github.com/777Wolf-dot/wolf-bot/archive/refs/heads/main.zip";
  const tmpDir = path.join(process.cwd(), "tmp_panel_update");
  const zipPath = path.join(tmpDir, "update.zip");
  
  try {
    // Backup session
    await backupSession();
    
    // Clean/create temp
    if (fs.existsSync(tmpDir)) {
      await deleteDirOS(tmpDir);
    }
    fs.mkdirSync(tmpDir, { recursive: true });
    
    console.log(`📥 Downloading from: ${zipUrl}`);
    
    // Download
    let downloadCmd;
    if (await run('which curl').then(() => true).catch(() => false)) {
      downloadCmd = `curl -L "${zipUrl}" -o "${zipPath}" --connect-timeout 30`;
    } else if (await run('which wget').then(() => true).catch(() => false)) {
      downloadCmd = `wget "${zipUrl}" -O "${zipPath}" --timeout=30`;
    } else if (isWindows) {
      downloadCmd = `powershell -Command "Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${zipPath}'"`;
    } else {
      throw new Error("No download tool available (install curl or wget)");
    }
    
    await run(downloadCmd);
    
    // Check download
    if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
      throw new Error("Download failed or file is empty");
    }
    
    console.log(`✅ Downloaded ${fs.statSync(zipPath).size} bytes`);
    
    // Extract
    console.log("📦 Extracting...");
    
    if (await run('which unzip').then(() => true).catch(() => false)) {
      await run(`unzip -o "${zipPath}" -d "${tmpDir}"`);
    } else if (await run('which 7z').then(() => true).catch(() => false)) {
      await run(`7z x "${zipPath}" -o"${tmpDir}" -y`);
    } else if (isWindows) {
      await run(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tmpDir}'"`);
    } else {
      throw new Error("No extraction tool available (install unzip or 7z)");
    }
    
    // Find source directory
    const items = fs.readdirSync(tmpDir);
    let sourceDir = tmpDir;
    
    const wolfFolder = items.find(item => item.includes('wolf-bot'));
    if (wolfFolder) {
      sourceDir = path.join(tmpDir, wolfFolder);
      console.log(`📁 Found source folder: ${wolfFolder}`);
    }
    
    console.log(`🔄 Copying files...`);
    
    // Copy with exclusions
    const exclude = ['.git', 'node_modules', 'session', 'tmp', 'logs', 
                    'settings.js', 'config.json', '.env', 'panel',
                    'session_backup_hot', 'tmp_panel_update'];
    
    await copyFilesExcluding(sourceDir, process.cwd(), exclude);
    
    // Cleanup
    await deleteDirOS(tmpDir);
    
    return { 
      success: true, 
      source: "wolf-bot ZIP",
      type: "zip"
    };
    
  } catch (error) {
    if (fs.existsSync(tmpDir)) {
      await deleteDirOS(tmpDir);
    }
    throw new Error(`ZIP update failed: ${error.message}`);
  }
}

async function copyFilesExcluding(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (exclude.includes(entry.name)) {
      console.log(`⏭️ Skipping: ${entry.name}`);
      continue;
    }
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      await copyFilesExcluding(srcPath, destPath, exclude);
    } else {
      // Don't overwrite config files
      if (['settings.js', 'config.json', '.env'].includes(entry.name) && 
          fs.existsSync(destPath)) {
        console.log(`💾 Preserving: ${entry.name}`);
        continue;
      }
      
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Smart restart that preserves panel
async function smartRestart(sock, jid) {
  console.log("🔄 Performing smart restart...");
  
  try {
    // Backup session
    await backupSession();
    
    // Send restarting message
    if (sock && jid) {
      await sock.sendMessage(jid, { 
        text: "🤖 Bot is performing a smart restart. Back in a moment..." 
      });
    }
    
    // Close WhatsApp connection gracefully
    if (sock && sock.ws && sock.ws.readyState === 1) {
      try {
        await sock.end();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.log("WhatsApp disconnect warning:", e.message);
      }
    }
    
    // Restore session
    await restoreSession();
    
    // Find main bot file
    const mainFiles = ['index.js', 'main.js', 'app.js', 'bot.js'];
    let mainFile = null;
    
    for (const file of mainFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        mainFile = filePath;
        break;
      }
    }
    
    if (!mainFile) {
      throw new Error("Main bot file not found");
    }
    
    // Start new bot process
    console.log(`🚀 Starting new bot process: ${mainFile}`);
    
    const child = spawn('node', [mainFile], {
      stdio: 'inherit',
      detached: true,
      shell: true,
      env: { 
        ...process.env, 
        HOT_RESTART: 'true',
        PANEL_MODE: PANEL_MODE ? 'true' : 'false'
      }
    });
    
    child.unref();
    
    // Exit old process after delay
    setTimeout(() => {
      console.log("👋 Old process exiting gracefully");
      process.exit(0);
    }, 5000);
    
    return true;
    
  } catch (error) {
    console.error("Smart restart failed:", error);
    throw error;
  }
}

// Load settings
async function loadSettings() {
  try {
    const settingsPath = path.join(process.cwd(), "settings.js");
    if (fs.existsSync(settingsPath)) {
      const module = await import(`file://${settingsPath}`);
      return module.default || module;
    }
  } catch (error) {
    console.warn("Settings load warning:", error);
  }
  return {};
}

// Install dependencies
async function installDependencies() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log("📦 Installing dependencies...");
      await run("npm install --no-audit --no-fund --silent");
      console.log("✅ Dependencies installed");
      return true;
    }
    console.log("⚠️ No package.json found");
    return false;
  } catch (error) {
    console.error("Dependency installation failed:", error);
    throw error;
  }
}

// Main command handler with empty repo support
let isUpdating = false;

export default {
  name: "update",
  description: "Update bot with empty repository support",
  category: "owner",
  ownerOnly: true,

  async execute(sock, m, args) {
    if (isUpdating) {
      await sock.sendMessage(m.key.remoteJid, { 
        text: "⏳ Update in progress. Please wait..." 
      }, { quoted: m });
      return;
    }
    
    isUpdating = true;
    const jid = m.key.remoteJid;
    const sender = m.key.participant || jid;
    
    try {
      // Initial message
      await sock.sendMessage(jid, { 
        text: "🔄 Starting update process..." 
      }, { quoted: m });
      
      // Load settings and check owner
      const settings = await loadSettings();
      const isOwner = m.key.fromMe || 
        (settings.ownerNumber && sender.includes(settings.ownerNumber));
      
      if (!isOwner) {
        await sock.sendMessage(jid, { 
          text: "❌ Owner only command." 
        }, { quoted: m });
        isUpdating = false;
        return;
      }
      
      // Parse command
      const command = args[0]?.toLowerCase();
      const forceZip = command === 'zip';
      const forceGit = command === 'git';
      const initOnly = command === 'init';
      
      // INITIALIZE GIT REPO
      if (initOnly) {
        await sock.sendMessage(jid, { 
          text: "⚙️ Initializing Git repository..." 
        }, { quoted: m });
        
        try {
          const result = await initGitRepo();
          if (result.initialized) {
            await sock.sendMessage(jid, { 
              text: "✅ Git repository initialized!\nUse `!update git` for first-time setup." 
            }, { quoted: m });
          } else {
            await sock.sendMessage(jid, { 
              text: result.hasCommits ? 
                "✅ Git repository already exists with commits." : 
                "⚠️ Git repository exists but has no commits." 
            }, { quoted: m });
          }
        } catch (error) {
          await sock.sendMessage(jid, { 
            text: `❌ Git initialization failed: ${error.message}` 
          }, { quoted: m });
        }
        
        isUpdating = false;
        return;
      }
      
      // Check Git status
      const hasGit = await hasGitRepo();
      const hasCommits = await hasGitCommits();
      
      // STATUS MESSAGE
      let statusMsg = `📊 Git Status:\n`;
      statusMsg += `• Repository: ${hasGit ? '✅' : '❌'}\n`;
      statusMsg += `• Commits: ${hasCommits ? '✅' : '❌ (empty)'}\n`;
      
      if (hasGit && hasCommits) {
        try {
          const branch = await getCurrentBranch();
          const rev = await getCurrentRevision();
          statusMsg += `• Branch: ${branch}\n`;
          statusMsg += `• Commit: ${rev.substring(0, 7)}\n`;
        } catch (e) {
          statusMsg += `• Error: ${e.message}\n`;
        }
      }
      
      await sock.sendMessage(jid, { text: statusMsg }, { quoted: m });
      
      // Handle empty repository
      if (hasGit && !hasCommits && !forceZip) {
        await sock.sendMessage(jid, { 
          text: "⚠️ Git repository is empty (no commits).\nPerforming initial setup from wolf-bot..." 
        }, { quoted: m });
        
        try {
          await pullWolfBotForEmptyRepo();
          await sock.sendMessage(jid, { 
            text: "✅ Initial setup complete! Repository now has wolf-bot content." 
          }, { quoted: m });
          
          // Install dependencies
          await sock.sendMessage(jid, { 
            text: "📦 Installing dependencies..." 
          }, { quoted: m });
          
          await installDependencies();
          await sock.sendMessage(jid, { 
            text: "✅ Dependencies installed!" 
          }, { quoted: m });
          
          // Smart restart
          await sock.sendMessage(jid, { 
            text: "🔄 Restarting bot with new setup..." 
          }, { quoted: m });
          
          await smartRestart(sock, jid);
          isUpdating = false;
          return;
          
        } catch (error) {
          throw new Error(`Initial setup failed: ${error.message}`);
        }
      }
      
      let updateResult;
      
      // GIT UPDATE (if we have commits)
      if ((hasGit && hasCommits && !forceZip) || forceGit) {
        if (!hasCommits && forceGit) {
          await sock.sendMessage(jid, { 
            text: "⚠️ Forcing Git update on empty repository. This will pull wolf-bot content." 
          }, { quoted: m });
        }
        
        await sock.sendMessage(jid, { 
          text: "🌐 Fetching Git updates..." 
        }, { quoted: m });
        
        updateResult = await updateFromWolfBot();
        
        if (updateResult === true) {
          // This was an empty repo initial pull
          await sock.sendMessage(jid, { 
            text: "✅ Successfully pulled wolf-bot into empty repository!" 
          }, { quoted: m });
        } else if (updateResult.alreadyUpToDate) {
          await sock.sendMessage(jid, { 
            text: `✅ Already up to date!\nCommit: ${updateResult.newRev.substring(0, 7)}` 
          }, { quoted: m });
          
          // Still install dependencies in case package.json changed
          await sock.sendMessage(jid, { 
            text: "📦 Checking dependencies..." 
          }, { quoted: m });
          
          try {
            await installDependencies();
            await sock.sendMessage(jid, { 
              text: "✅ Dependencies up to date!" 
            }, { quoted: m });
          } catch (error) {
            await sock.sendMessage(jid, { 
              text: `⚠️ Dependency check: ${error.message}` 
            }, { quoted: m });
          }
          
          isUpdating = false;
          return;
        } else {
          await sock.sendMessage(jid, { 
            text: `✅ Git update successful!\n${updateResult.oldRev.substring(0, 7)} → ${updateResult.newRev.substring(0, 7)}` 
          }, { quoted: m });
        }
        
        // Install dependencies
        await sock.sendMessage(jid, { 
          text: "📦 Installing dependencies..." 
        }, { quoted: m });
        
        try {
          await installDependencies();
          await sock.sendMessage(jid, { 
            text: "✅ Dependencies installed!" 
          }, { quoted: m });
        } catch (error) {
          console.error("npm error:", error);
          await sock.sendMessage(jid, { 
            text: `⚠️ npm install issues: ${error.message}` 
          }, { quoted: m });
        }
        
      } else {
        // ZIP UPDATE (fallback or forced)
        await sock.sendMessage(jid, { 
          text: "📦 Downloading ZIP update..." 
        }, { quoted: m });
        
        updateResult = await updateViaZip();
        await sock.sendMessage(jid, { 
          text: "✅ ZIP update complete!" 
        }, { quoted: m });
        
        // Install dependencies after ZIP update
        await sock.sendMessage(jid, { 
          text: "📦 Installing dependencies..." 
        }, { quoted: m });
        
        try {
          await installDependencies();
          await sock.sendMessage(jid, { 
            text: "✅ Dependencies installed!" 
          }, { quoted: m });
        } catch (error) {
          await sock.sendMessage(jid, { 
            text: `⚠️ Dependency warning: ${error.message}` 
          }, { quoted: m });
        }
      }
      
      // Smart restart
      await sock.sendMessage(jid, { 
        text: "🔄 Restarting bot with updates..." 
      }, { quoted: m });
      
      await smartRestart(sock, jid);
      
    } catch (error) {
      console.error("Update error:", error);
      
      let errorMsg = `❌ Update failed: ${error.message}`;
      
      // Add helpful tips based on error type
      if (error.message.includes('empty') || error.message.includes('no commits')) {
        errorMsg += "\n\n💡 **Solution:**";
        errorMsg += "\n1. Use `!update init` to initialize Git";
        errorMsg += "\n2. Then use `!update git` for first setup";
        errorMsg += "\n3. Or use `!update zip` for ZIP update";
      } else if (error.message.includes('git') || error.message.includes('not found')) {
        errorMsg += "\n\n💡 **Tips:**";
        errorMsg += "\n• Install Git: `apt-get install git` or download from git-scm.com";
        errorMsg += "\n• Use `!update zip` for ZIP update";
        errorMsg += "\n• Check internet connection";
      } else if (error.message.includes('download') || error.message.includes('curl')) {
        errorMsg += "\n\n💡 **Tips:**";
        errorMsg += "\n• Install curl: `apt-get install curl`";
        errorMsg += "\n• Or install wget: `apt-get install wget`";
        errorMsg += "\n• Check internet connection";
      }
      
      await sock.sendMessage(jid, { 
        text: errorMsg 
      }, { quoted: m });
      
      // Try to restore session
      try {
        await restoreSession();
      } catch (restoreError) {
        console.error("Session restore also failed:", restoreError);
      }
      
    } finally {
      isUpdating = false;
    }
  }
};