// // commands/gitclone.js - Standalone Git Clone Command
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import fs from 'fs';
// import path from 'path';
// import axios from 'axios';
// import { createWriteStream } from 'fs';
// import { pipeline } from 'stream/promises';
// import AdmZip from 'adm-zip';

// const execAsync = promisify(exec);

// export default {
//     name: 'gitclone',
//     alias: ['clone', 'download', 'repo', 'githubdl'],
//     description: 'Clone GitHub repositories and send files',
//     category: 'utility',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, prefix, extras) {
//         const chatId = msg.key.remoteJid;
        
//         if (!args[0]) {
//             return sock.sendMessage(chatId, {
//                 text: `📦 *GIT CLONE COMMAND*\n\nClone GitHub repositories and send files\n\n*Usage:*\n${prefix}gitclone <repository-url>\n\n*Examples:*\n${prefix}gitclone https://github.com/username/repo\n${prefix}gitclone username/repo\n${prefix}gitclone username/repo zip\n${prefix}gitclone username/repo file path/to/file.js`
//             }, { quoted: msg });
//         }
        
//         try {
//             // Extract repo info
//             let repoUrl = args[0];
//             const options = args.slice(1);
            
//             // Convert shorthand to full URL
//             if (!repoUrl.includes('://') && !repoUrl.includes('.')) {
//                 repoUrl = `https://github.com/${repoUrl}`;
//             }
            
//             // Validate GitHub URL
//             if (!repoUrl.includes('github.com')) {
//                 return sock.sendMessage(chatId, {
//                     text: '❌ Only GitHub repositories are supported.'
//                 }, { quoted: msg });
//             }
            
//             // Extract repo path
//             const urlParts = repoUrl.split('github.com/')[1]?.split('/');
//             if (!urlParts || urlParts.length < 2) {
//                 return sock.sendMessage(chatId, {
//                     text: '❌ Invalid GitHub URL format. Use: https://github.com/username/repository'
//                 }, { quoted: msg });
//             }
            
//             const username = urlParts[0];
//             const repoName = urlParts[1].replace('.git', '');
//             const repoFullName = `${username}/${repoName}`;
            
//             // Create unique temp directory
//             const timestamp = Date.now();
//             const tempDir = `./temp/clone_${timestamp}`;
//             const repoDir = path.join(tempDir, repoName);
            
//             // Ensure temp directory exists
//             if (!fs.existsSync('./temp')) {
//                 fs.mkdirSync('./temp', { recursive: true });
//             }
//             if (!fs.existsSync(tempDir)) {
//                 fs.mkdirSync(tempDir, { recursive: true });
//             }
            
//             // Send initial message
//             const loadingMsg = await sock.sendMessage(chatId, {
//                 text: `⏳ *Cloning Repository...*\n\n🔗 ${repoFullName}\n📁 Please wait, this may take a moment...`
//             });
            
//             // Try to clone using git
//             let cloneSuccess = await this.cloneWithGit(repoUrl, repoDir);
            
//             if (!cloneSuccess) {
//                 // Fallback to GitHub API download
//                 await sock.sendMessage(chatId, {
//                     text: '🔄 Git clone failed, trying GitHub download...'
//                 }, { edit: loadingMsg.key });
                
//                 cloneSuccess = await this.downloadFromGitHub(repoFullName, repoDir);
//             }
            
//             if (!cloneSuccess) {
//                 throw new Error('Failed to download repository');
//             }
            
//             // Check what user wants
//             if (options.includes('zip') || this.shouldSendAsZip(repoDir)) {
//                 await this.sendAsZip(sock, chatId, repoDir, repoName, loadingMsg);
//             } else if (options[0] === 'file' && options[1]) {
//                 const filePath = options.slice(1).join(' ');
//                 await this.sendFile(sock, chatId, repoDir, filePath, loadingMsg);
//             } else {
//                 await this.sendFileList(sock, chatId, repoDir, repoName, loadingMsg);
//             }
            
//             // Cleanup
//             this.cleanup(tempDir);
            
//         } catch (error) {
//             console.error('GitClone error:', error);
            
//             let errorMsg = `❌ *Error:* ${error.message}\n\n`;
//             errorMsg += `*Possible fixes:*\n`;
//             errorMsg += `• Ensure repository is public\n`;
//             errorMsg += `• Check internet connection\n`;
//             errorMsg += `• Try with "zip" option\n`;
//             errorMsg += `• Repository might be too large\n\n`;
//             errorMsg += `*Example:* ${prefix}gitclone username/repo zip`;
            
//             await sock.sendMessage(chatId, {
//                 text: errorMsg
//             }, { quoted: msg });
//         }
//     },
    
//     async cloneWithGit(repoUrl, targetDir) {
//         try {
//             console.log(`Cloning ${repoUrl} to ${targetDir}`);
            
//             // Use shallow clone for speed
//             const { stdout, stderr } = await execAsync(
//                 `git clone --depth 1 --single-branch "${repoUrl}" "${targetDir}"`,
//                 { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
//             );
            
//             console.log('Git clone output:', stdout.substring(0, 200));
            
//             // Check if clone was successful
//             if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
//                 console.log('Git clone successful');
//                 return true;
//             }
            
//             return false;
//         } catch (error) {
//             console.error('Git clone failed:', error.message);
//             return false;
//         }
//     },
    
//     async downloadFromGitHub(repoFullName, targetDir) {
//         try {
//             console.log(`Downloading ${repoFullName} via GitHub API`);
            
//             // Download as zip from GitHub
//             const zipUrl = `https://github.com/${repoFullName}/archive/refs/heads/main.zip`;
            
//             // Try main branch first
//             const response = await axios({
//                 method: 'GET',
//                 url: zipUrl,
//                 responseType: 'stream',
//                 timeout: 60000
//             });
            
//             const zipPath = path.join(targetDir, '..', 'repo.zip');
//             const writer = createWriteStream(zipPath);
            
//             await pipeline(response.data, writer);
            
//             // Extract zip
//             const zip = new AdmZip(zipPath);
//             zip.extractAllTo(targetDir, true);
            
//             // Cleanup zip file
//             fs.unlinkSync(zipPath);
            
//             console.log('GitHub download successful');
//             return true;
//         } catch (error) {
//             console.error('GitHub download failed:', error.message);
            
//             // Try master branch as fallback
//             try {
//                 const masterZipUrl = `https://github.com/${repoFullName}/archive/refs/heads/master.zip`;
//                 const response = await axios({
//                     method: 'GET',
//                     url: masterZipUrl,
//                     responseType: 'stream',
//                     timeout: 60000
//                 });
                
//                 const zipPath = path.join(targetDir, '..', 'repo.zip');
//                 const writer = createWriteStream(zipPath);
                
//                 await pipeline(response.data, writer);
                
//                 const zip = new AdmZip(zipPath);
//                 zip.extractAllTo(targetDir, true);
                
//                 fs.unlinkSync(zipPath);
//                 return true;
//             } catch {
//                 return false;
//             }
//         }
//     },
    
//     shouldSendAsZip(dir) {
//         try {
//             const totalSize = this.getTotalSize(dir);
//             const fileCount = this.countFiles(dir);
            
//             // Send as zip if:
//             // 1. Total size > 10MB, OR
//             // 2. More than 50 files, OR
//             // 3. Contains binary/large files
//             return totalSize > 10 * 1024 * 1024 || fileCount > 50;
//         } catch {
//             return true;
//         }
//     },
    
//     getTotalSize(dir) {
//         let total = 0;
        
//         const walk = (currentDir) => {
//             const items = fs.readdirSync(currentDir);
            
//             for (const item of items) {
//                 if (item === '.git') continue;
                
//                 const itemPath = path.join(currentDir, item);
//                 const stat = fs.statSync(itemPath);
                
//                 if (stat.isDirectory()) {
//                     walk(itemPath);
//                 } else {
//                     total += stat.size;
//                 }
//             }
//         };
        
//         walk(dir);
//         return total;
//     },
    
//     countFiles(dir) {
//         let count = 0;
        
//         const walk = (currentDir) => {
//             const items = fs.readdirSync(currentDir);
            
//             for (const item of items) {
//                 if (item === '.git') continue;
                
//                 const itemPath = path.join(currentDir, item);
//                 const stat = fs.statSync(itemPath);
                
//                 if (stat.isDirectory()) {
//                     walk(itemPath);
//                 } else {
//                     count++;
//                 }
//             }
//         };
        
//         walk(dir);
//         return count;
//     },
    
//     async sendFileList(sock, chatId, dir, repoName, originalMsg) {
//         try {
//             const files = this.getFileList(dir);
            
//             if (files.length === 0) {
//                 await sock.sendMessage(chatId, {
//                     text: '📭 Repository appears to be empty.'
//                 }, { edit: originalMsg.key });
//                 return;
//             }
            
//             let message = `📂 *Repository: ${repoName}*\n\n`;
//             message += `📊 Total Files: ${files.length}\n`;
//             message += `📦 Total Size: ${this.formatSize(this.getTotalSize(dir))}\n\n`;
            
//             message += `📋 *File Structure:*\n\n`;
            
//             // Show directory tree
//             const tree = this.generateTree(dir);
//             message += tree.substring(0, 1500);
            
//             if (tree.length > 1500) {
//                 message += '\n... (truncated)';
//             }
            
//             message += `\n\n🔧 *Options:*\n`;
//             message += `• Send as ZIP: ${prefix}gitclone ${repoName} zip\n`;
//             message += `• Send specific file: ${prefix}gitclone ${repoName} file <path>\n\n`;
//             message += `💡 Large repositories are automatically sent as ZIP.`;
            
//             await sock.sendMessage(chatId, {
//                 text: message
//             }, { edit: originalMsg.key });
            
//             // Send sample files if they exist
//             await this.sendSampleFiles(sock, chatId, dir, files);
            
//         } catch (error) {
//             console.error('Send file list error:', error);
//             await sock.sendMessage(chatId, {
//                 text: '📋 Showing basic info due to large repository...'
//             }, { edit: originalMsg.key });
            
//             await this.sendAsZip(sock, chatId, dir, repoName, originalMsg);
//         }
//     },
    
//     getFileList(dir, baseDir = dir) {
//         const files = [];
        
//         const walk = (currentDir) => {
//             const items = fs.readdirSync(currentDir);
            
//             for (const item of items) {
//                 if (item === '.git') continue;
                
//                 const itemPath = path.join(currentDir, item);
//                 const stat = fs.statSync(itemPath);
//                 const relativePath = path.relative(baseDir, itemPath);
                
//                 if (stat.isDirectory()) {
//                     files.push({
//                         type: 'dir',
//                         name: item,
//                         path: relativePath,
//                         size: 0
//                     });
//                     walk(itemPath);
//                 } else {
//                     files.push({
//                         type: 'file',
//                         name: item,
//                         path: relativePath,
//                         size: stat.size,
//                         ext: path.extname(item)
//                     });
//                 }
//             }
//         };
        
//         walk(dir);
//         return files;
//     },
    
//     generateTree(dir, prefix = '', depth = 0, maxDepth = 3) {
//         if (depth > maxDepth) return '';
        
//         let tree = '';
//         const items = fs.readdirSync(dir).filter(item => item !== '.git');
        
//         items.sort((a, b) => {
//             const aPath = path.join(dir, a);
//             const bPath = path.join(dir, b);
//             const aIsDir = fs.statSync(aPath).isDirectory();
//             const bIsDir = fs.statSync(bPath).isDirectory();
            
//             // Directories first
//             if (aIsDir && !bIsDir) return -1;
//             if (!aIsDir && bIsDir) return 1;
//             return a.localeCompare(b);
//         });
        
//         for (let i = 0; i < items.length; i++) {
//             const item = items[i];
//             const itemPath = path.join(dir, item);
//             const isLast = i === items.length - 1;
//             const stat = fs.statSync(itemPath);
//             const isDir = stat.isDirectory();
            
//             tree += prefix + (isLast ? '└── ' : '├── ');
            
//             if (isDir) {
//                 tree += `📁 ${item}/\n`;
//                 tree += this.generateTree(
//                     itemPath,
//                     prefix + (isLast ? '    ' : '│   '),
//                     depth + 1,
//                     maxDepth
//                 );
//             } else {
//                 const size = this.formatSize(stat.size);
//                 tree += `📄 ${item} (${size})\n`;
//             }
//         }
        
//         return tree;
//     },
    
//     async sendSampleFiles(sock, chatId, dir, files) {
//         try {
//             // Find small text files to send as samples
//             const textFiles = files
//                 .filter(f => f.type === 'file' && f.size < 50000)
//                 .filter(f => ['.txt', '.js', '.py', '.json', '.md', '.html', '.css', '.yml', '.yaml'].includes(f.ext))
//                 .slice(0, 3);
            
//             for (const file of textFiles) {
//                 try {
//                     const content = fs.readFileSync(path.join(dir, file.path), 'utf8');
                    
//                     if (content.length > 0) {
//                         const preview = content.substring(0, 1500);
//                         await sock.sendMessage(chatId, {
//                             text: `📄 *${file.name}*\n\`\`\`${file.ext.substring(1)}\n${preview}\n\`\`\``
//                         });
//                         await this.delay(1000);
//                     }
//                 } catch {
//                     // Skip if can't read
//                 }
//             }
//         } catch (error) {
//             // Ignore sample file errors
//         }
//     },
    
//     async sendAsZip(sock, chatId, dir, repoName, originalMsg) {
//         try {
//             await sock.sendMessage(chatId, {
//                 text: '📦 Creating ZIP archive...'
//             }, { edit: originalMsg.key });
            
//             const zipPath = `./temp/${repoName}_${Date.now()}.zip`;
//             const zip = new AdmZip();
            
//             // Add all files to zip
//             this.addDirectoryToZip(zip, dir, repoName);
            
//             // Save zip
//             zip.writeZip(zipPath);
            
//             const zipSize = fs.statSync(zipPath).size;
            
//             if (zipSize > 100 * 1024 * 1024) {
//                 fs.unlinkSync(zipPath);
//                 throw new Error(`ZIP too large (${this.formatSize(zipSize)}). Max is 100MB.`);
//             }
            
//             await sock.sendMessage(chatId, {
//                 document: fs.readFileSync(zipPath),
//                 fileName: `${repoName}.zip`,
//                 mimetype: 'application/zip',
//                 caption: `📦 *${repoName}.zip*\n\n✅ Repository packaged as ZIP\n📊 Size: ${this.formatSize(zipSize)}\n📁 Contains all repository files\n🔧 Extract to view contents`
//             }, { edit: originalMsg.key });
            
//             // Cleanup zip
//             setTimeout(() => {
//                 if (fs.existsSync(zipPath)) {
//                     fs.unlinkSync(zipPath);
//                 }
//             }, 30000);
            
//         } catch (error) {
//             console.error('ZIP creation error:', error);
            
//             let errorMsg = `❌ Failed to create ZIP: ${error.message}\n\n`;
//             errorMsg += `*Alternative options:*\n`;
//             errorMsg += `1. Clone manually: \`git clone https://github.com/${repoName}\`\n`;
//             errorMsg += `2. Download directly from GitHub\n`;
//             errorMsg += `3. Try smaller repository`;
            
//             await sock.sendMessage(chatId, {
//                 text: errorMsg
//             }, { edit: originalMsg.key });
//         }
//     },
    
//     addDirectoryToZip(zip, dir, baseName) {
//         const items = fs.readdirSync(dir);
        
//         for (const item of items) {
//             if (item === '.git') continue;
            
//             const itemPath = path.join(dir, item);
//             const relativePath = path.relative(dir, itemPath);
//             const zipPath = path.join(baseName, relativePath);
//             const stat = fs.statSync(itemPath);
            
//             if (stat.isDirectory()) {
//                 this.addDirectoryToZip(zip, itemPath, baseName);
//             } else {
//                 try {
//                     const content = fs.readFileSync(itemPath);
//                     zip.addFile(zipPath, content);
//                 } catch {
//                     // Skip if can't read
//                 }
//             }
//         }
//     },
    
//     async sendFile(sock, chatId, dir, filePath, originalMsg) {
//         try {
//             const fullPath = path.join(dir, filePath);
            
//             if (!fs.existsSync(fullPath)) {
//                 await sock.sendMessage(chatId, {
//                     text: `❌ File not found: ${filePath}\n\nUse exact path from file list.`
//                 }, { edit: originalMsg.key });
//                 return;
//             }
            
//             const stat = fs.statSync(fullPath);
//             const fileName = path.basename(filePath);
//             const ext = path.extname(filePath).toLowerCase();
            
//             if (stat.size > 16 * 1024 * 1024) {
//                 throw new Error(`File too large (${this.formatSize(stat.size)}). Max is 16MB.`);
//             }
            
//             // For text files
//             const textExts = ['.txt', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.h', '.html', '.css', '.json', '.xml', '.md', '.yml', '.yaml', '.env', '.sh', '.bash', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
            
//             if (textExts.includes(ext) && stat.size < 100000) {
//                 const content = fs.readFileSync(fullPath, 'utf8');
//                 const lang = ext.substring(1) || 'txt';
                
//                 let preview = content.substring(0, 3000);
//                 if (content.length > 3000) {
//                     preview += '\n... (truncated)';
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: `📄 *${fileName}*\n📊 ${this.formatSize(stat.size)}\n📁 ${filePath}\n\n\`\`\`${lang}\n${preview}\n\`\`\``
//                 }, { edit: originalMsg.key });
//             } else {
//                 // Send as document
//                 await sock.sendMessage(chatId, {
//                     document: fs.readFileSync(fullPath),
//                     fileName: fileName,
//                     mimetype: this.getMimeType(ext),
//                     caption: `📄 ${fileName}\n📊 ${this.formatSize(stat.size)}\n📁 ${filePath}`
//                 }, { edit: originalMsg.key });
//             }
            
//         } catch (error) {
//             console.error('Send file error:', error);
//             await sock.sendMessage(chatId, {
//                 text: `❌ Failed to send file: ${error.message}`
//             }, { edit: originalMsg.key });
//         }
//     },
    
//     getMimeType(ext) {
//         const types = {
//             '.txt': 'text/plain',
//             '.js': 'text/javascript',
//             '.json': 'application/json',
//             '.html': 'text/html',
//             '.css': 'text/css',
//             '.md': 'text/markdown',
//             '.py': 'text/x-python',
//             '.java': 'text/x-java',
//             '.cpp': 'text/x-c++',
//             '.c': 'text/x-c',
//             '.pdf': 'application/pdf',
//             '.zip': 'application/zip',
//             '.jpg': 'image/jpeg',
//             '.jpeg': 'image/jpeg',
//             '.png': 'image/png',
//             '.gif': 'image/gif'
//         };
        
//         return types[ext] || 'application/octet-stream';
//     },
    
//     formatSize(bytes) {
//         if (bytes === 0) return '0 B';
//         const k = 1024;
//         const sizes = ['B', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     },
    
//     cleanup(dir) {
//         try {
//             if (fs.existsSync(dir)) {
//                 fs.rmSync(dir, { recursive: true, force: true });
//                 console.log(`Cleaned up: ${dir}`);
//             }
//         } catch (error) {
//             console.error('Cleanup error:', error);
//         }
//     },
    
//     delay(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }
// };







































































































// commands/gitclone.js - Enhanced Git Clone with Auto-Edit Messages
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

export default {
    name: 'gitclone',
    alias: ['clone', 'download', 'repo', 'githubdl'],
    description: 'Clone GitHub repositories and send files',
    category: 'utility',
    ownerOnly: true,
    
    async execute(sock, m, args, prefix, extras) {
        const chatId = m.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(chatId, {
                text: `
╭━━📦 *GIT CLONE COMMAND* 📦━━╮
┃  Clone GitHub repositories & send files
┃  
┃  *Usage:* ${prefix}gitclone <repo-url>
┃  
┃  *Examples:*
┃  ${prefix}gitclone username/repo
┃  ${prefix}gitclone url zip
┃  ${prefix}gitclone url file path
┃  
┃  *Options:*
┃  • zip - Send as ZIP archive
┃  • file <path> - Send specific file
┃  
╰━━━━━━━━━━━━━━━━━━━╯
`
            }, { quoted: m });
        }
        
        let loadingMessage = null;
        let repoFullName = '';
        let repoName = '';
        let tempDir = '';
        
        try {
            // Extract repo info
            let repoUrl = args[0];
            const options = args.slice(1);
            
            // Convert shorthand to full URL
            if (!repoUrl.includes('://') && !repoUrl.includes('.')) {
                repoUrl = `https://github.com/${repoUrl}`;
            }
            
            // Validate GitHub URL
            if (!repoUrl.includes('github.com')) {
                return sock.sendMessage(chatId, {
                    text: '❌ *Error:* Only GitHub repositories are supported.'
                }, { quoted: m });
            }
            
            // Extract repo path
            const urlParts = repoUrl.split('github.com/')[1]?.split('/');
            if (!urlParts || urlParts.length < 2) {
                return sock.sendMessage(chatId, {
                    text: '❌ *Error:* Invalid GitHub URL format.'
                }, { quoted: m });
            }
            
            const username = urlParts[0];
            repoName = urlParts[1].replace('.git', '');
            repoFullName = `${username}/${repoName}`;
            
            // Step 1: Initializing message
            loadingMessage = await sock.sendMessage(chatId, {
                text: `
╭━━🌌 *GIT CLONE INITIALIZED* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  🔗 *URL:* ${repoUrl}
┃  🚀 *Status:* Initializing...
┃  ⏳ *Progress:* █▒▒▒▒▒▒▒▒▒ 10%
╰━━━━━━━━━━━━━━╯
_🌙 Preparing to download repository..._
`
            }, { quoted: m });
            
            // Create unique temp directory
            const timestamp = Date.now();
            tempDir = `./temp/clone_${timestamp}`;
            const repoDir = path.join(tempDir, repoName);
            
            // Ensure temp directory exists
            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp', { recursive: true });
            }
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Step 2: Downloading message
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE IN PROGRESS* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  🔗 *URL:* ${repoUrl}
┃  🚀 *Status:* Downloading...
┃  ⏳ *Progress:* ████▒▒▒▒▒▒ 40%
┃  💾 *Method:* Git Clone
╰━━━━━━━━━━━━━━━━━━━━╯
_🌙 Cloning repository from GitHub..._
`, 1000);
            
            // Try to clone using git
            let cloneSuccess = await this.cloneWithGit(repoUrl, repoDir, sock, chatId, loadingMessage);
            
            if (!cloneSuccess) {
                // Step 3: Fallback to GitHub API
                await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE FALLBACK* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  🔗 *URL:* ${repoUrl}
┃  🚀 *Status:* Using GitHub API...
┃  ⏳ *Progress:* █████▒▒▒▒▒ 50%
┃  💾 *Method:* GitHub Direct Download
╰━━━━━━━━━━━━━━━━━╯
_🌙 Git failed, trying direct download..._
`, 1000);
                
                cloneSuccess = await this.downloadFromGitHub(repoFullName, repoDir, sock, chatId, loadingMessage);
            }
            
            if (!cloneSuccess) {
                throw new Error('Failed to download repository');
            }
            
            // Step 4: Processing files
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE PROCESSING* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  🔗 *URL:* ${repoUrl}
┃  🚀 *Status:* Processing files...
┃  ⏳ *Progress:* ████████▒▒ 80%
┃  📊 *Scanning:* Counting files...
╰━━━━━━━━━━━━━━━━╯
_🌙 Analyzing repository structure..._
`, 1000);
            
            // Check what user wants
            if (options.includes('zip') || this.shouldSendAsZip(repoDir)) {
                await this.sendAsZip(sock, chatId, repoDir, repoName, loadingMessage, repoFullName);
            } else if (options[0] === 'file' && options[1]) {
                const filePath = options.slice(1).join(' ');
                await this.sendFile(sock, chatId, repoDir, filePath, loadingMessage, repoFullName);
            } else {
                await this.sendFileList(sock, chatId, repoDir, repoName, loadingMessage, repoFullName);
            }
            
            // Cleanup
            this.cleanup(tempDir);
            
        } catch (error) {
            console.error('GitClone error:', error);
            
            if (loadingMessage) {
                await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE FAILED* 🌌━━╮
┃  📂 *Repository:* ${repoFullName || 'Unknown'}
┃  🔗 *Status:* ❌ Error
┃  🚨 *Reason:* ${error.message}
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━╯
_🌙 Failed to download repository..._
`, 0);
            }
            
            let errorMsg = `
╭━━❌ *DOWNLOAD FAILED* ❌━━╮
┃  
┃  *Repository:* ${repoFullName || args[0]}
┃  *Error:* ${error.message}
┃  
┃  *Possible fixes:*
┃  1. Check repository exists
┃  2. Ensure it's public
┃  3. Try with "zip" option
┃  4. Repository might be too large
┃  
┃  *Example:* ${prefix}gitclone ${args[0]} zip
┃  
╰━━━━━━━━━━━━━━━╯
`;
            
            await sock.sendMessage(chatId, {
                text: errorMsg
            }, { quoted: m });
            
            // Cleanup on error
            if (tempDir) this.cleanup(tempDir);
        }
    },
    
    async cloneWithGit(repoUrl, targetDir, sock, chatId, loadingMessage) {
        try {
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE IN PROGRESS* 🌌━━╮
┃  📂 *Status:* Cloning with Git...
┃  🔗 *Command:* git clone --depth 1
┃  ⏳ *Progress:* ███████▒▒▒ 70%
┃  📊 *Downloading:* Repository data
╰━━━━━━━━━━━━━━━╯
_🌙 Using shallow clone for speed..._
`, 500);
            
            const { stdout, stderr } = await execAsync(
                `git clone --depth 1 --single-branch "${repoUrl}" "${targetDir}"`,
                { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
            );
            
            // Check if clone was successful
            if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Git clone failed:', error.message);
            return false;
        }
    },
    
    async downloadFromGitHub(repoFullName, targetDir, sock, chatId, loadingMessage) {
        try {
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━🌌 *GIT CLONE IN PROGRESS* 🌌━━╮
┃  📂 *Status:* Downloading ZIP...
┃  🔗 *Source:* GitHub API
┃  ⏳ *Progress:* █████████▒ 90%
┃  📊 *Extracting:* ZIP archive
╰━━━━━━━━━━━━━━━╯
_🌙 Downloading repository as ZIP..._
`, 500);
            
            // Download as zip from GitHub
            const zipUrl = `https://github.com/${repoFullName}/archive/refs/heads/main.zip`;
            const zipPath = path.join(targetDir, '..', 'repo.zip');
            
            const response = await axios({
                method: 'GET',
                url: zipUrl,
                responseType: 'stream',
                timeout: 60000
            });
            
            const writer = createWriteStream(zipPath);
            await pipeline(response.data, writer);
            
            // Extract zip
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(targetDir, true);
            
            // Cleanup zip file
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }
            
            // Try master branch if main failed
            if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
                const masterZipUrl = `https://github.com/${repoFullName}/archive/refs/heads/master.zip`;
                const masterResponse = await axios({
                    method: 'GET',
                    url: masterZipUrl,
                    responseType: 'stream',
                    timeout: 60000
                });
                
                const masterZipPath = path.join(targetDir, '..', 'repo_master.zip');
                const masterWriter = createWriteStream(masterZipPath);
                await pipeline(masterResponse.data, masterWriter);
                
                const masterZip = new AdmZip(masterZipPath);
                masterZip.extractAllTo(targetDir, true);
                
                if (fs.existsSync(masterZipPath)) {
                    fs.unlinkSync(masterZipPath);
                }
            }
            
            return fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0;
        } catch (error) {
            console.error('GitHub download failed:', error.message);
            return false;
        }
    },
    
    shouldSendAsZip(dir) {
        try {
            const totalSize = this.getTotalSize(dir);
            const fileCount = this.countFiles(dir);
            
            // Send as zip if:
            // 1. Total size > 10MB, OR
            // 2. More than 50 files, OR
            // 3. Contains binary/large files
            return totalSize > 10 * 1024 * 1024 || fileCount > 50;
        } catch {
            return true;
        }
    },
    
    getTotalSize(dir) {
        let total = 0;
        
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                if (item === '.git') continue;
                
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    walk(itemPath);
                } else {
                    total += stat.size;
                }
            }
        };
        
        walk(dir);
        return total;
    },
    
    countFiles(dir) {
        let count = 0;
        
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                if (item === '.git') continue;
                
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    walk(itemPath);
                } else {
                    count++;
                }
            }
        };
        
        walk(dir);
        return count;
    },
    
    async sendFileList(sock, chatId, dir, repoName, originalMsg, repoFullName) {
        try {
            const files = this.getFileList(dir);
            const totalSize = this.getTotalSize(dir);
            const fileCount = files.length;
            
            // Final success message
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE COMPLETE* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ✅ *Status:* Successfully cloned!
┃  📊 *Files:* ${fileCount} files
┃  📦 *Size:* ${this.formatSize(totalSize)}
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━━━━━━╯
_🌙 Repository ready for viewing..._
`, 500);
            
            // Create file tree preview
            const tree = this.generateTree(dir);
            const truncatedTree = tree.length > 800 ? tree.substring(0, 800) + '\n... (truncated)' : tree;
            
            await sock.sendMessage(chatId, {
                text: `
╭━━📂 *REPOSITORY STRUCTURE* 📂━━╮
┃  
┃  *Repository:* ${repoName}
┃  *Total Files:* ${fileCount}
┃  *Total Size:* ${this.formatSize(totalSize)}
┃  
┃  *File Tree:*
${this.indentText(truncatedTree, 2)}
┃  
┃  *Commands:*
┃  • ${prefix}gitclone ${repoFullName} zip
┃  • ${prefix}gitclone ${repoFullName} file <path>
┃  
┃  *Sample files sent below...*
╰━━━━━━━━━━━━━━━╯
`
            }, { edit: originalMsg.key });
            
            // Send sample files
            await this.sendSampleFiles(sock, chatId, dir, files, repoName);
            
        } catch (error) {
            console.error('Send file list error:', error);
            
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE PROCESSING* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ⚠️ *Status:* Creating ZIP instead...
┃  📊 *Reason:* Too many files to list
┃  ⏳ *Progress:* ██████████ 95%
╰━━━━━━━━━━━━━━━━╯
_🌙 Repository is large, packaging as ZIP..._
`, 500);
            
            await this.sendAsZip(sock, chatId, dir, repoName, originalMsg, repoFullName);
        }
    },
    
    async sendAsZip(sock, chatId, dir, repoName, originalMsg, repoFullName) {
        try {
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE PROCESSING* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  📦 *Status:* Creating ZIP archive...
┃  ⏳ *Progress:* ██████████ 98%
┃  📊 *Compressing:* All files
╰━━━━━━━━━━━━━━╯
_🌙 Finalizing ZIP package..._
`, 1000);
            
            const zipPath = `./temp/${repoName}_${Date.now()}.zip`;
            const zip = new AdmZip();
            
            // Add all files to zip
            this.addDirectoryToZip(zip, dir, repoName);
            
            // Save zip
            zip.writeZip(zipPath);
            
            const zipSize = fs.statSync(zipPath).size;
            
            if (zipSize > 100 * 1024 * 1024) {
                fs.unlinkSync(zipPath);
                throw new Error(`ZIP too large (${this.formatSize(zipSize)}). Max is 100MB.`);
            }
            
            // Final success message
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE COMPLETE* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ✅ *Status:* ZIP ready!
┃  📦 *Size:* ${this.formatSize(zipSize)}
┃  📊 *Files:* Packaged as ZIP
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━━━━━━━╯
_🌙 Sending ZIP file now..._
`, 500);
            
            await sock.sendMessage(chatId, {
                document: fs.readFileSync(zipPath),
                fileName: `${repoName}.zip`,
                mimetype: 'application/zip',
                caption: `
╭━━📦 *REPOSITORY ZIP* 📦━━╮
┃  
┃  *Size:* ${this.formatSize(zipSize)}
┃  *Source:* ${repoFullName}
┃  
┃  *Contains:* All repository files
┃  *Extract:* Any ZIP program
┃  
┃  ✅ *Download Complete!*
┃  
╰━━━━━━━━━━━━━━━━━━╯
`
            }, { edit: originalMsg.key });
            
            // Cleanup zip
            setTimeout(() => {
                if (fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                }
            }, 30000);
            
        } catch (error) {
            console.error('ZIP creation error:', error);
            
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE FAILED* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ❌ *Status:* ZIP creation failed
┃  🚨 *Error:* ${error.message}
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━━━━━━╯
_🌙 Failed to create ZIP archive..._
`, 0);
            
            throw error;
        }
    },
    
    async sendFile(sock, chatId, dir, filePath, originalMsg, repoFullName) {
        try {
            const fullPath = path.join(dir, filePath);
            
            if (!fs.existsSync(fullPath)) {
                await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE ERROR* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ❌ *Status:* File not found
┃  📁 *Path:* ${filePath}
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━━━━━━╯
_🌙 File does not exist in repository..._
`, 0);
                return;
            }
            
            const stat = fs.statSync(fullPath);
            const fileName = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            if (stat.size > 16 * 1024 * 1024) {
                throw new Error(`File too large (${this.formatSize(stat.size)}). Max is 16MB.`);
            }
            
            await this.updateMessage(sock, chatId, originalMsg, `
╭━━🌌 *GIT CLONE COMPLETE* 🌌━━╮
┃  📂 *Repository:* ${repoFullName}
┃  ✅ *Status:* File ready!
┃  📄 *File:* ${fileName}
┃  📊 *Size:* ${this.formatSize(stat.size)}
┃  ⏳ *Progress:* ██████████ 100%
╰━━━━━━━━━━━━━━━━━━━╯
_🌙 Sending requested file..._
`, 500);
            
            // For text files
            const textExts = ['.txt', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.h', '.html', '.css', '.json', '.xml', '.md', '.yml', '.yaml', '.env', '.sh', '.bash', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
            
            if (textExts.includes(ext) && stat.size < 100000) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lang = ext.substring(1) || 'txt';
                
                let preview = content.substring(0, 3000);
                if (content.length > 3000) {
                    preview += '\n... (truncated)';
                }
                
                await sock.sendMessage(chatId, {
                    text: `
╭━━📄 *FILE CONTENT* 📄━━╮
┃  
┃  *File:* ${fileName}
┃  *Path:* ${filePath}
┃  *Size:* ${this.formatSize(stat.size)}
┃  *Repo:* ${repoFullName}
┃  
┃  *Content:*
┃  \`\`\`${lang}
${preview}
\`\`\`
┃  
╰━━━━━━━━━━━━━━━━━━╯
`
                }, { edit: originalMsg.key });
            } else {
                // Send as document
                await sock.sendMessage(chatId, {
                    document: fs.readFileSync(fullPath),
                    fileName: fileName,
                    mimetype: this.getMimeType(ext),
                    caption: `
╭━━📄 *FILE DOWNLOAD* 📄━━╮
┃  
┃  *File:* ${fileName}
┃  *Size:* ${this.formatSize(stat.size)}
┃  *Path:* ${filePath}
┃  *Repo:* ${repoFullName}
┃  
┃  ✅ *Download Complete!*
┃  
╰━━━━━━━━━━━━━━━━━━━╯
`
                }, { edit: originalMsg.key });
            }
            
        } catch (error) {
            console.error('Send file error:', error);
            throw error;
        }
    },
    
    async sendSampleFiles(sock, chatId, dir, files, repoName) {
        try {
            // Find small text files to send as samples
            const textFiles = files
                .filter(f => f.type === 'file' && f.size < 50000)
                .filter(f => ['.txt', '.js', '.py', '.json', '.md', '.html', '.css', '.yml', '.yaml'].includes(f.ext))
                .slice(0, 2);
            
            for (const file of textFiles) {
                try {
                    const content = fs.readFileSync(path.join(dir, file.path), 'utf8');
                    
                    if (content.length > 0) {
                        const preview = content.substring(0, 1500);
                        await sock.sendMessage(chatId, {
                            text: `
╭━━📄 *SAMPLE FILE* 📄━━╮
┃  
┃  *Size:* ${this.formatSize(file.size)}
┃  *Path:* ${file.path}
┃  
┃  *Preview:*
┃  \`\`\`${file.ext.substring(1) || 'txt'}
${preview}
\`\`\`
┃  
╰━━━━━━━━━━━━━━━━━━━╯
`
                        });
                        await this.delay(1000);
                    }
                } catch {
                    // Skip if can't read
                }
            }
        } catch (error) {
            // Ignore sample file errors
        }
    },
    
    // Helper methods
    getFileList(dir, baseDir = dir) {
        const files = [];
        
        const walk = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                if (item === '.git') continue;
                
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                const relativePath = path.relative(baseDir, itemPath);
                
                if (stat.isDirectory()) {
                    files.push({
                        type: 'dir',
                        name: item,
                        path: relativePath,
                        size: 0
                    });
                    walk(itemPath);
                } else {
                    files.push({
                        type: 'file',
                        name: item,
                        path: relativePath,
                        size: stat.size,
                        ext: path.extname(item)
                    });
                }
            }
        };
        
        walk(dir);
        return files;
    },
    
    generateTree(dir, prefix = '', depth = 0, maxDepth = 3) {
        if (depth > maxDepth) return '';
        
        let tree = '';
        const items = fs.readdirSync(dir).filter(item => item !== '.git');
        
        items.sort((a, b) => {
            const aPath = path.join(dir, a);
            const bPath = path.join(dir, b);
            const aIsDir = fs.statSync(aPath).isDirectory();
            const bIsDir = fs.statSync(bPath).isDirectory();
            
            // Directories first
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemPath = path.join(dir, item);
            const isLast = i === items.length - 1;
            const stat = fs.statSync(itemPath);
            const isDir = stat.isDirectory();
            
            tree += prefix + (isLast ? '└── ' : '├── ');
            
            if (isDir) {
                tree += `📁 ${item}/\n`;
                tree += this.generateTree(
                    itemPath,
                    prefix + (isLast ? '    ' : '│   '),
                    depth + 1,
                    maxDepth
                );
            } else {
                const size = this.formatSize(stat.size);
                tree += `📄 ${item} (${size})\n`;
            }
        }
        
        return tree;
    },
    
    addDirectoryToZip(zip, dir, baseName) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            if (item === '.git') continue;
            
            const itemPath = path.join(dir, item);
            const relativePath = path.relative(dir, itemPath);
            const zipPath = path.join(baseName, relativePath);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                this.addDirectoryToZip(zip, itemPath, baseName);
            } else {
                try {
                    const content = fs.readFileSync(itemPath);
                    zip.addFile(zipPath, content);
                } catch {
                    // Skip if can't read
                }
            }
        }
    },
    
    getMimeType(ext) {
        const types = {
            '.txt': 'text/plain',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.html': 'text/html',
            '.css': 'text/css',
            '.md': 'text/markdown',
            '.py': 'text/x-python',
            '.java': 'text/x-java',
            '.cpp': 'text/x-c++',
            '.c': 'text/x-c',
            '.pdf': 'application/pdf',
            '.zip': 'application/zip',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };
        
        return types[ext] || 'application/octet-stream';
    },
    
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    indentText(text, spaces) {
        const indent = ' '.repeat(spaces);
        return text.split('\n').map(line => indent + line).join('\n');
    },
    
    cleanup(dir) {
        try {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
                console.log(`Cleaned up: ${dir}`);
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    },
    
    async updateMessage(sock, chatId, message, newText, delayMs = 0) {
        if (delayMs > 0) {
            await this.delay(delayMs);
        }
        
        try {
            await sock.sendMessage(chatId, {
                text: newText,
                edit: message.key
            });
        } catch (error) {
            console.error('Failed to update message:', error);
        }
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};















