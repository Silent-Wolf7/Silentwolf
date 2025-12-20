// commands/gitinfo.js - Improved with better URL parsing
import axios from 'axios';
import moment from 'moment';

export default {
    name: 'gitinfo',
    alias: ['repoinfo', 'githubinfo', 'gitstats'],
    description: 'Get detailed information about a GitHub repository',
    category: 'git',
    ownerOnly: true,
    
    async execute(sock, m, args, prefix, extras) {
        const chatId = m.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(chatId, {
                text: `
╭━━📊 *GIT REPOSITORY INFO* 📊━━╮
┃  
┃  ${prefix}gitinfo <username/repo>
┃  
┃  Examples:
┃  ${prefix}gitinfo Dark-Xploit/CypherX
┃  ${prefix}gitinfo facebook/react
┃  ${prefix}gitinfo https://github.com/user/repo
┃  
╰━━━━━━━━━━━━━━╯
`
            }, { quoted: m });
        }
        
        let loadingMessage = null;
        let repoPath = args[0];
        
        try {
            // Clean and parse the repository path
            repoPath = this.cleanGitHubUrl(repoPath);
            
            if (!this.isValidRepoPath(repoPath)) {
                throw new Error('Invalid format. Use: username/repository');
            }
            
            // Initial loading message
            loadingMessage = await sock.sendMessage(chatId, {
                text: `
╭━━📊 *FETCHING REPO INFO* 📊━━╮
┃  🔍 ${repoPath}
┃  ⏳ █▒▒▒▒▒▒▒▒▒ 10%
┃  🌙 Starting...
╰━━━━━━━━━━━━━━╯
`
            });
            
            // Update to fetching repo data
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━📊 *FETCHING REPO INFO* 📊━━╮
┃  🔍 ${repoPath}
┃  ⏳ ████▒▒▒▒▒▒ 40%
┃  🌙 Getting repo data...
╰━━━━━━━━━━━━━━━━━━╯
`, 800);
            
            // Fetch repository data with better error handling
            const repoData = await axios.get(`https://api.github.com/repos/${repoPath}`, {
                headers: { 
                    'User-Agent': 'WhatsApp-Bot',
                    'Accept': 'application/vnd.github.v3+json'
                },
                timeout: 15000
            }).catch(err => {
                const status = err.response?.status;
                if (status === 404) {
                    throw new Error(`Repository "${repoPath}" not found or is private`);
                } else if (status === 403) {
                    throw new Error('GitHub API rate limit exceeded. Try again later.');
                } else if (status === 401) {
                    throw new Error('Access denied. Repository might be private.');
                } else {
                    throw new Error(`GitHub API error: ${status || 'Network error'}`);
                }
            });
            
            const repo = repoData.data;
            
            // Update to fetching additional data
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━📊 *FETCHING REPO INFO* 📊━━╮
┃  🔍 ${repoPath}
┃  ⏳ ███████▒▒▒ 70%
┃  🌙 Getting extra data...
╰━━━━━━━━━━━━━━━━━━╯
`, 800);
            
            // Fetch all additional data in parallel with better error handling
            const requests = [
                axios.get(`https://api.github.com/repos/${repoPath}/contributors`, {
                    headers: { 'User-Agent': 'WhatsApp-Bot' },
                    params: { per_page: 10 }
                }).catch(() => ({ data: [] })),
                
                axios.get(`https://api.github.com/repos/${repoPath}/releases`, {
                    headers: { 'User-Agent': 'WhatsApp-Bot' },
                    params: { per_page: 5 }
                }).catch(() => ({ data: [] })),
                
                axios.get(`https://api.github.com/repos/${repoPath}/languages`, {
                    headers: { 'User-Agent': 'WhatsApp-Bot' }
                }).catch(() => ({ data: {} })),
                
                axios.get(`https://api.github.com/repos/${repoPath}/commits`, {
                    headers: { 'User-Agent': 'WhatsApp-Bot' },
                    params: { per_page: 5 }
                }).catch(() => ({ data: [] }))
            ];
            
            const [contributorsRes, releasesRes, languagesRes, commitsRes] = await Promise.all(requests);
            
            const contributors = contributorsRes.data;
            const releases = releasesRes.data;
            const languages = languagesRes.data;
            const commits = commitsRes.data;
            
            // Calculate language percentages
            const languageStats = this.calculateLanguageStats(languages);
            
            // Final processing message
            await this.updateMessage(sock, chatId, loadingMessage, `
╭━━📊 *FETCHING REPO INFO* 📊━━╮
┃  🔍 ${repoPath}
┃  ⏳ ██████████ 100%
┃  🌙 Preparing report...
╰━━━━━━━━━━━━━━╯
`, 800);
            
            // Generate the final info message
            const infoText = this.generateRepoInfoText(
                repo, 
                contributors, 
                releases, 
                languageStats,
                commits,
                repoPath,
                prefix
            );
            
            // Send final message
            await sock.sendMessage(chatId, {
                text: infoText
            }, { edit: loadingMessage.key });
            
        } catch (error) {
            console.error('GitInfo error:', error);
            
            // Format the error message based on input type
            let errorDisplay = args[0];
            if (errorDisplay.includes('github.com')) {
                const parsed = this.cleanGitHubUrl(errorDisplay);
                errorDisplay = parsed || args[0];
            }
            
            const errorText = `
╭━━❌ *REPO INFO ERROR* ❌━━╮
┃  
┃  🔍 ${errorDisplay}
┃  🚨 ${error.message}
┃  
┃  💡 *Try these formats:*
┃  • username/repository
┃  • Dark-Xploit/CypherX
┃  • https://github.com/user/repo
┃  
╰━━━━━━━━━━━━━━━━━╯
`;
            
            if (loadingMessage) {
                await sock.sendMessage(chatId, {
                    text: errorText
                }, { edit: loadingMessage.key });
            } else {
                await sock.sendMessage(chatId, {
                    text: errorText
                }, { quoted: m });
            }
        }
    },
    
    // Helper method to clean GitHub URLs
    cleanGitHubUrl(input) {
        if (!input) return input;
        
        // Remove .git extension
        input = input.replace(/\.git$/, '');
        
        // Extract from full GitHub URL
        if (input.includes('github.com')) {
            const match = input.match(/github\.com\/([^\/]+\/[^\/]+)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        // Extract from raw GitHub URL
        if (input.includes('raw.githubusercontent.com')) {
            const match = input.match(/raw\.githubusercontent\.com\/([^\/]+\/[^\/]+)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return input;
    },
    
    // Validate repository path format
    isValidRepoPath(path) {
        if (!path) return false;
        const parts = path.split('/');
        return parts.length === 2 && parts[0] && parts[1];
    },
    
    calculateLanguageStats(languages) {
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
        if (totalBytes === 0) return [];
        
        return Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang, bytes]) => ({
                language: lang,
                percentage: ((bytes / totalBytes) * 100).toFixed(1)
            }));
    },
    
    generateRepoInfoText(repo, contributors, releases, languageStats, commits, repoPath, prefix) {
        // Format dates
        const created = moment(repo.created_at).format('MMM DD, YYYY');
        const updated = moment(repo.updated_at).format('MMM DD, YYYY');
        const pushed = moment(repo.pushed_at).format('MMM DD, YYYY');
        
        // Generate progress bars
        const starsBar = this.generateBar(repo.stargazers_count, 50000, 15);
        const forksBar = this.generateBar(repo.forks_count, 10000, 15);
        const watchersBar = this.generateBar(repo.watchers_count, 5000, 15);
        
        // Activity indicator
        const daysSinceUpdate = Math.floor((new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24));
        const activityEmoji = daysSinceUpdate < 7 ? '🔥' : 
                             daysSinceUpdate < 30 ? '⚡' : 
                             daysSinceUpdate < 90 ? '🟡' : '💤';
        const activityText = daysSinceUpdate < 7 ? 'Very Active' : 
                            daysSinceUpdate < 30 ? 'Active' : 
                            daysSinceUpdate < 90 ? 'Moderate' : 'Inactive';
        
        // Repository size
        const sizeKB = repo.size;
        const sizeLabel = sizeKB < 1024 ? `${sizeKB} KB` : 
                         sizeKB < 1024 * 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : 
                         `${(sizeKB / (1024 * 1024)).toFixed(1)} GB`;
        
        // Last commit time
        const lastCommit = commits[0]?.commit?.author?.date ? 
                          moment(commits[0].commit.author.date).fromNow() : 'Unknown';
        
        // Flags
        const flags = [
            repo.archived ? '🔒' : '',
            repo.fork ? '🍴' : '',
            repo.has_issues ? '📝' : '',
            repo.has_wiki ? '📚' : '',
            repo.has_pages ? '🌐' : ''
        ].filter(Boolean).join(' ');
        
        return `
╭━━✨ *${repo.full_name.toUpperCase()}* ✨━━╮
┃
┃  📝 ${repo.description || 'No description'}
┃  👤 ${repo.owner.login}
┃  🔗 ${repo.html_url}
┃
╭━━📊 *STATISTICS* 📊━━╮
┃
┃  ⭐ ${repo.stargazers_count.toLocaleString()}
┃  ${starsBar}
┃
┃  🍴 ${repo.forks_count.toLocaleString()}
┃  ${forksBar}
┃
┃  👁️ ${repo.watchers_count.toLocaleString()}
┃  ${watchersBar}
┃
┃  📝 ${repo.open_issues_count.toLocaleString()} issues
┃  👥 ${contributors.length} contributors
┃  🚀 ${releases.length} releases
┃  📦 ${sizeLabel}
┃
╭━━💻 *TECH* 💻━━╮
┃
┃  ⌨️ ${repo.language || 'N/A'}
${languageStats.length > 0 ? languageStats.map(l => `┃  • ${l.language}: ${l.percentage}%\n`).join('') : ''}
┃  📄 ${repo.license?.name || 'No license'}
┃  🏷️ ${repo.default_branch}
┃  ${flags}
┃
╭━━📅 *TIMELINE* 📅━━╮
┃
┃  🎉 ${created}
┃  🔄 ${updated}
┃  🚀 ${pushed}
┃  📤 ${lastCommit}
┃  ${activityEmoji} ${activityText} (${daysSinceUpdate}d)
┃
╭━━🔗 *ACTIONS* 🔗━━╮
┃
┃  📥 ${prefix}gitclone ${repo.full_name}
┃  🔍 ${prefix}gitsearch ${repo.owner.login}
┃  📊 ${prefix}gituser ${repo.owner.login}
┃  ⭐ ${repo.html_url}/stargazers
┃
╰━━━━━━━━━━━━━━━━╯

🌙 *Repository info retrieved successfully*
`;
    },
    
    async updateMessage(sock, chatId, message, newText, delayMs = 0) {
        if (delayMs > 0) await this.delay(delayMs);
        
        try {
            await sock.sendMessage(chatId, {
                text: newText,
                edit: message.key
            });
        } catch (error) {
            console.error('Update message error:', error);
        }
    },
    
    generateBar(value, maxValue, length) {
        const percentage = Math.min(value / maxValue, 1);
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        const percent = (percentage * 100).toFixed(1);
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};