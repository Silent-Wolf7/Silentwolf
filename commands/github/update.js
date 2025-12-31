import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
import { createRequire } from 'module';
import { createWriteStream } from "fs";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

/* -------------------- Configuration -------------------- */
const UPDATE_ZIP_URL = "https://github.com/777Wolf-dot/wolf-bot/archive/refs/heads/main.zip";
const GIT_REPO_URL = "https://github.com/777Wolf-dot/wolf-bot.git";
const OWNER_REPO_URL = "https://github.com/777Wolf-dot/Silent-Wolf--Bot.git";

// Timeout configurations
const DOWNLOAD_TIMEOUT = 120000; // 2 minutes
const EXTRACTION_TIMEOUT = 180000; // 3 minutes
const COPY_TIMEOUT = 300000; // 5 minutes
const PRESERVE_TIMEOUT = 30000; // 30 seconds

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

/* -------------------- Async Download with Progress -------------------- */
async function downloadWithProgress(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'WolfBot-Updater/2.0',
        'Accept': '*/*'
      },
      timeout: DOWNLOAD_TIMEOUT
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        res.resume();
        return downloadWithProgress(new URL(redirectUrl, url).toString(), dest, onProgress)
          .then(resolve)
          .catch(reject);
      }
      
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      const totalSize = parseInt(res.headers['content-length']) || 0;
      let downloaded = 0;
      const fileStream = createWriteStream(dest);
      
      res.on('data', (chunk) => {
        downloaded += chunk.length;
        if (onProgress && totalSize > 0) {
          const percent = Math.round((downloaded / totalSize) * 100);
          onProgress(percent, downloaded, totalSize);
        }
      });
      
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
    
    req.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
    
    req.on('timeout', () => {
      req.destroy();
      fs.unlink(dest, () => reject(new Error('Download timeout')));
    });
  });
}

/* -------------------- Fast Preserve Files (Skip large dirs) -------------------- */
async function preserveEssentialFiles() {
  console.log('Preserving essential files...');
  
  const essentialFiles = [
    'settings.js',
    'config.json',
    '.env',
    'baileys_store.json'
  ];
  
  const essentialDirs = [
    'session',
    'data',
    'logs'
  ];
  
  const preserveDir = path.join(process.cwd(), 'tmp_preserve_fast');
  if (fs.existsSync(preserveDir)) {
    await fsPromises.rm(preserveDir, { recursive: true, force: true });
  }
  await fsPromises.mkdir(preserveDir, { recursive: true });
  
  const preserved = [];
  
  // Preserve essential files
  for (const file of essentialFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      if (fs.existsSync(filePath)) {
        const preservePath = path.join(preserveDir, file);
        await fsPromises.copyFile(filePath, preservePath);
        preserved.push(file);
        console.log(`Preserved file: ${file}`);
      }
    } catch (error) {
      console.warn(`Could not preserve ${file}:`, error.message);
    }
  }
  
  // Preserve essential directories (with size limit)
  for (const dir of essentialDirs) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      if (fs.existsSync(dirPath)) {
        const stat = await fsPromises.stat(dirPath);
        if (stat.isDirectory()) {
          // Skip if directory is too large (> 50MB)
          const dirSize = await getDirectorySize(dirPath);
          if (dirSize > 50 * 1024 * 1024) { // 50MB
            console.log(`Skipping large directory ${dir} (${formatBytes(dirSize)})`);
            continue;
          }
          
          const preservePath = path.join(preserveDir, dir);
          await copyDirectoryFast(dirPath, preservePath);
          preserved.push(dir);
          console.log(`Preserved directory: ${dir} (${formatBytes(dirSize)})`);
        }
      }
    } catch (error) {
      console.warn(`Could not preserve ${dir}:`, error.message);
    }
  }
  
  return { preserveDir, preserved };
}

/* -------------------- Fast Directory Copy -------------------- */
async function copyDirectoryFast(src, dest, timeout = PRESERVE_TIMEOUT) {
  await fsPromises.mkdir(dest, { recursive: true });
  
  const entries = await fsPromises.readdir(src, { withFileTypes: true });
  const copyPromises = [];
  
  for (const entry of entries) {
    if (copyPromises.length > 10) {
      // Process in batches to avoid too many simultaneous operations
      await Promise.all(copyPromises);
      copyPromises.length = 0;
    }
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyPromises.push(copyDirectoryFast(srcPath, destPath, timeout));
    } else {
      copyPromises.push(
        Promise.race([
          fsPromises.copyFile(srcPath, destPath),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Copy timeout')), timeout)
          )
        ]).catch(error => {
          console.warn(`Failed to copy ${srcPath}:`, error.message);
        })
      );
    }
  }
  
  if (copyPromises.length > 0) {
    await Promise.all(copyPromises);
  }
}

async function getDirectorySize(dir) {
  let totalSize = 0;
  
  try {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        totalSize += await getDirectorySize(entryPath);
      } else {
        try {
          const stat = await fsPromises.stat(entryPath);
          totalSize += stat.size;
        } catch {
          // Skip if can't stat
        }
      }
    }
  } catch {
    // Return 0 if can't read directory
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/* -------------------- Fast ZIP Update (Skip node_modules) -------------------- */
async function updateViaZip(zipUrl = UPDATE_ZIP_URL) {
  console.log(`Starting fast ZIP update from: ${zipUrl}`);
  
  const tmpDir = path.join(process.cwd(), 'tmp_update_fast');
  const zipPath = path.join(tmpDir, 'update.zip');
  const extractTo = path.join(tmpDir, 'extracted');
  
  try {
    // Clean up old temp dir
    if (fs.existsSync(tmpDir)) {
      await fsPromises.rm(tmpDir, { recursive: true, force: true });
    }
    await fsPromises.mkdir(tmpDir, { recursive: true });
    await fsPromises.mkdir(extractTo, { recursive: true });
    
    // Preserve essential files (fast, skip large dirs)
    const { preserveDir, preserved } = await preserveEssentialFiles();
    console.log(`Preserved ${preserved.length} items: ${preserved.join(', ')}`);
    
    // Download with progress
    console.log('Downloading update...');
    let lastProgress = 0;
    
    await downloadWithProgress(zipUrl, zipPath, (percent, downloaded, total) => {
      if (percent >= lastProgress + 10 || percent === 100) {
        console.log(`Download: ${percent}% (${formatBytes(downloaded)}/${formatBytes(total)})`);
        lastProgress = percent;
      }
    });
    
    // Verify download
    const stat = await fsPromises.stat(zipPath);
    if (stat.size === 0) {
      throw new Error('Downloaded file is empty');
    }
    console.log(`Downloaded ${formatBytes(stat.size)}`);
    
    // Extract ZIP with timeout
    console.log('Extracting ZIP...');
    await Promise.race([
      extractZip(zipPath, extractTo),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Extraction timeout')), EXTRACTION_TIMEOUT)
      )
    ]);
    
    // Find extracted root
    const entries = await fsPromises.readdir(extractTo);
    let root = extractTo;
    
    if (entries.length === 1) {
      const singleEntry = path.join(extractTo, entries[0]);
      const stat = await fsPromises.stat(singleEntry);
      if (stat.isDirectory()) {
        root = singleEntry;
        console.log(`Found root directory: ${entries[0]}`);
      }
    }
    
    // Copy files selectively (skip large dirs and existing content)
    console.log('Copying essential files...');
    const copied = await copyEssentialFiles(root, process.cwd());
    
    // Restore preserved files
    console.log('Restoring preserved files...');
    await restorePreservedFiles(preserveDir);
    
    // Cleanup
    console.log('Cleaning up...');
    await fsPromises.rm(tmpDir, { recursive: true, force: true });
    
    return {
      success: true,
      copiedFiles: copied,
      url: zipUrl,
      fileCount: copied.length
    };
    
  } catch (error) {
    console.error('ZIP update failed:', error);
    
    // Cleanup on error
    try {
      if (fs.existsSync(tmpDir)) {
        await fsPromises.rm(tmpDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp dir:', cleanupError);
    }
    
    throw error;
  }
}

/* -------------------- Selective File Copy -------------------- */
async function copyEssentialFiles(src, dest) {
  const copied = [];
  const ignorePatterns = [
    /^node_modules$/,
    /^\.git$/,
    /^tmp/,
    /^temp/,
    /^logs$/,
    /^session$/,
    /^data$/,
    /^tmp_.*$/,
    /^\.env$/,
    /^settings\.js$/,
    /^config\.json$/,
    /^baileys_store\.json$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /\.log$/,
    /\.cache$/
  ];
  
  async function copyDir(srcPath, destPath, relative = '') {
    try {
      const entries = await fsPromises.readdir(srcPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // Check if should be ignored
        if (ignorePatterns.some(pattern => pattern.test(entry.name))) {
          continue;
        }
        
        const entrySrc = path.join(srcPath, entry.name);
        const entryDest = path.join(destPath, entry.name);
        const entryRelative = relative ? path.join(relative, entry.name) : entry.name;
        
        if (entry.isDirectory()) {
          await fsPromises.mkdir(entryDest, { recursive: true });
          await copyDir(entrySrc, entryDest, entryRelative);
        } else {
          // Skip if file already exists and is newer
          let shouldCopy = true;
          try {
            const srcStat = await fsPromises.stat(entrySrc);
            const destStat = await fsPromises.stat(entryDest);
            
            // Only copy if source is newer
            shouldCopy = srcStat.mtimeMs > destStat.mtimeMs;
          } catch {
            // Destination doesn't exist or can't stat
            shouldCopy = true;
          }
          
          if (shouldCopy) {
            await fsPromises.copyFile(entrySrc, entryDest);
            copied.push(entryRelative);
            
            // Log every 10 files
            if (copied.length % 10 === 0) {
              console.log(`Copied ${copied.length} files...`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error copying from ${srcPath}:`, error.message);
    }
  }
  
  await copyDir(src, dest);
  return copied;
}

/* -------------------- Restore Preserved Files -------------------- */
async function restorePreservedFiles(preserveDir) {
  if (!fs.existsSync(preserveDir)) return;
  
  try {
    const entries = await fsPromises.readdir(preserveDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(preserveDir, entry.name);
      const destPath = path.join(process.cwd(), entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectoryFast(srcPath, destPath);
      } else {
        await fsPromises.copyFile(srcPath, destPath);
      }
      console.log(`Restored: ${entry.name}`);
    }
    
    await fsPromises.rm(preserveDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to restore preserved files:', error.message);
  }
}

/* -------------------- Git Update (Fast) -------------------- */
async function updateViaGit() {
  try {
    console.log('Starting Git update...');
    
    // Check if we can use git
    try {
      await run('git --version');
    } catch {
      throw new Error('Git is not installed or not in PATH');
    }
    
    const oldRev = await run('git rev-parse HEAD').catch(() => 'unknown');
    console.log(`Current revision: ${oldRev.slice(0, 7)}`);
    
    // Check if we have wolf-bot upstream
    try {
      await run('git remote get-url wolf-bot-upstream');
    } catch {
      console.log('Adding wolf-bot-upstream remote...');
      await run(`git remote add wolf-bot-upstream ${GIT_REPO_URL}`);
    }
    
    // Fetch updates
    console.log('Fetching updates...');
    await run('git fetch wolf-bot-upstream');
    
    // Check current branch
    const currentBranch = await run('git rev-parse --abbrev-ref HEAD').catch(() => 'main');
    
    // Get latest from upstream
    let newRev;
    try {
      newRev = await run(`git rev-parse wolf-bot-upstream/${currentBranch}`);
    } catch {
      newRev = await run('git rev-parse wolf-bot-upstream/main');
    }
    
    if (oldRev === newRev) {
      console.log('Already up to date');
      return {
        oldRev,
        newRev,
        alreadyUpToDate: true,
        branch: currentBranch,
        files: []
      };
    }
    
    console.log(`Updating to: ${newRev.slice(0, 7)}`);
    
    // Create backup
    const timestamp = Date.now();
    const backupBranch = `backup-${timestamp}`;
    await run(`git branch ${backupBranch}`);
    
    // Fast-forward merge
    await run(`git merge --ff-only ${newRev}`);
    
    return {
      oldRev,
      newRev,
      alreadyUpToDate: false,
      branch: currentBranch,
      backupBranch,
      files: []
    };
    
  } catch (error) {
    console.error('Git update failed:', error);
    
    // Try to revert if something went wrong
    try {
      const branches = await run('git branch --list backup-*');
      if (branches) {
        const backupList = branches.split('\n').filter(b => b.trim());
        if (backupList.length > 0) {
          const latestBackup = backupList[backupList.length - 1].trim();
          console.log(`Reverting to backup: ${latestBackup}`);
          await run(`git reset --hard ${latestBackup}`);
        }
      }
    } catch (revertError) {
      console.error('Could not revert:', revertError);
    }
    
    throw error;
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
    
    // Check if owner
    const isOwner = m.key.fromMe || sender.includes("947") || sender.includes("owner-number");
    if (!isOwner) {
      return sock.sendMessage(jid, {
        text: '❌ Only bot owner can use .update command'
      }, { quoted: m });
    }
    
    let statusMessage;
    try {
      // Send initial message
      statusMessage = await sock.sendMessage(jid, {
        text: '🔄 **WolfBot Fast Update**\nStarting update process...'
      }, { quoted: m });
      
      const editStatus = async (text) => {
        try {
          await sock.sendMessage(jid, {
            text,
            edit: statusMessage.key
          });
        } catch {
          // If editing fails, send new message
          const newMsg = await sock.sendMessage(jid, { text }, { quoted: m });
          statusMessage = newMsg;
        }
      };
      
      await editStatus('🔄 **Checking update method...**');
      
      // Parse arguments
      const forceMethod = args[0]?.toLowerCase();
      const useZip = forceMethod === 'zip';
      const useGit = forceMethod === 'git';
      const softUpdate = args.includes('soft') || args.includes('no-restart');
      
      let result;
      
      if (useGit || (!useZip && await hasGitRepo())) {
        await editStatus('🌐 **Using Git update method**\nFetching latest changes...');
        result = await updateViaGit();
        
        if (result.alreadyUpToDate) {
          await editStatus(`✅ **Already Up to Date**\nBranch: ${result.branch}\nCommit: ${result.newRev?.slice(0, 7) || 'N/A'}`);
          return;
        }
        
        await editStatus(`✅ **Git Update Complete**\nUpdated to: ${result.newRev?.slice(0, 7) || 'N/A'}\nInstalling dependencies...`);
        
      } else {
        await editStatus('📥 **Using ZIP update method**\nDownloading latest version...\nThis may take a few minutes...');
        result = await updateViaZip();
        
        await editStatus(`✅ **ZIP Update Complete**\nFiles updated: ${result.fileCount || 0}\nInstalling dependencies...`);
      }
      
      // Install dependencies (skip if soft update)
      if (!softUpdate) {
        await editStatus('📦 **Installing dependencies...**\nRunning npm install...');
        
        try {
          // Use faster npm install
          await run('npm ci --no-audit --no-fund --silent', 180000);
          await editStatus('✅ **Dependencies installed**');
        } catch (npmError) {
          console.warn('npm install failed, trying fallback:', npmError.message);
          try {
            await run('npm install --no-audit --no-fund --loglevel=error', 180000);
            await editStatus('⚠️ **Dependencies installed with warnings**');
          } catch {
            await editStatus('⚠️ **Could not install all dependencies**\nContinuing anyway...');
          }
        }
      }
      
      // Restart or finish
      if (softUpdate) {
        await editStatus('✅ **Update Applied Successfully**\nRunning without restart.\nSome changes may need restart to take effect.');
      } else {
        await editStatus('✅ **Update Complete!**\nRestarting bot in 3 seconds...');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Restart process
        await sock.sendMessage(jid, {
          text: '🔄 **Restarting Now...**\nBot will be back in a moment!'
        }, { quoted: m });
        
        try {
          await run('pm2 restart all', 10000);
        } catch {
          console.log('PM2 restart failed, exiting process...');
          process.exit(0);
        }
      }
      
    } catch (err) {
      console.error('Update failed:', err);
      
      let errorText = `❌ **Update Failed**\nError: ${err.message || err}\n\n`;
      
      if (err.message.includes('timeout')) {
        errorText += '**Reason:** Operation timed out\n';
        errorText += '**Solution:** Try again with better internet connection\n';
      } else if (err.message.includes('HTTP')) {
        errorText += '**Reason:** Download failed\n';
        errorText += '**Solution:** Check internet or try .update git\n';
      } else if (err.message.includes('Git')) {
        errorText += '**Reason:** Git operation failed\n';
        errorText += '**Solution:** Try .update zip instead\n';
      }
      
      errorText += '\n**Manual Update:**\n';
      errorText += `1. Visit: ${GIT_REPO_URL}\n`;
      errorText += '2. Download ZIP\n';
      errorText += '3. Extract and replace files\n';
      
      try {
        if (statusMessage?.key) {
          await sock.sendMessage(jid, { text: errorText, edit: statusMessage.key });
        } else {
          await sock.sendMessage(jid, { text: errorText }, { quoted: m });
        }
      } catch {
        // Ignore if can't send error
      }
    }
  }
};

/* -------------------- Export Utilities -------------------- */
export async function loadSettings() {
  const paths = [
    path.join(process.cwd(), 'settings.js'),
    path.join(process.cwd(), 'config', 'settings.js'),
  ];
  
  for (const settingsPath of paths) {
    try {
      if (fs.existsSync(settingsPath)) {
        const module = await import(`file://${settingsPath}`);
        return module.default || module;
      }
    } catch {
      // Continue to next path
    }
  }
  
  return {};
}

/* -------------------- Extract Zip Utility -------------------- */
async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    await run(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force"`);
    return;
  }
  
  // Try different extraction tools
  const tools = [
    { cmd: 'unzip', args: `-o "${zipPath}" -d "${outDir}"` },
    { cmd: '7z', args: `x "${zipPath}" -o"${outDir}" -y` },
    { cmd: 'busybox', args: `unzip "${zipPath}" -d "${outDir}"` },
  ];
  
  for (const tool of tools) {
    try {
      await run(`which ${tool.cmd}`);
      console.log(`Extracting with ${tool.cmd}...`);
      await run(`${tool.cmd} ${tool.args}`);
      return;
    } catch {
      continue;
    }
  }
  
  throw new Error('No extraction tool found');
}