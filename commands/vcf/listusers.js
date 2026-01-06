import fs from 'fs';
import path from 'path';

export default {
  name: 'listusers',
  aliases: ['users', 'registered'],
  description: 'View all registered users',
  category: 'utility',
  
  async execute(sock, m, args) {
    const send = async (text) => {
      return sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };
    
    const jsonPath = path.join(process.cwd(), 'registered_users.json');
    
    if (!fs.existsSync(jsonPath)) {
      return await send('📭 No users registered yet!');
    }
    
    try {
      const users = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      if (users.length === 0) {
        return await send('📭 No users registered yet!');
      }
      
      let message = `📋 *REGISTERED USERS* (${users.length} total)\n\n`;
      
      // Show all users or search by phone
      if (args[0]) {
        const searchPhone = args[0].replace(/\D/g, '');
        const filteredUsers = users.filter(user => 
          user.phone.includes(searchPhone) || 
          user.name.toLowerCase().includes(args[0].toLowerCase())
        );
        
        if (filteredUsers.length === 0) {
          return await send(`🔍 No users found for: ${args[0]}`);
        }
        
        message = `🔍 *SEARCH RESULTS* (${filteredUsers.length} found)\n\n`;
        users = filteredUsers;
      }
      
      // List users with numbering
      users.forEach((user, index) => {
        const date = new Date(user.registeredAt).toLocaleDateString();
        message += `${index + 1}. *${user.name}*\n`;
        message += `   📞: \`${user.phone}\`\n`;
        message += `   🆔: \`${user.jid}\`\n`;
        message += `   📅: ${date}\n\n`;
      });
      
      // Add summary
      message += `📊 *Summary:*\n`;
      message += `• Total Users: ${users.length}\n`;
      message += `• Last Registered: ${new Date(users[users.length - 1].registeredAt).toLocaleDateString()}`;
      
      await send(message);
      
    } catch (error) {
      console.error('List users error:', error);
      await send(`❌ Error reading user data: ${error.message}`);
    }
  }
};