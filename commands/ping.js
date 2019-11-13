const Discord = require('discord.js')

exports.run = async (client, message, args) => {
  
   try {
      const msg = await message.channel.send("> 💣 Ping!");
      msg.edit(`>>> 💣 Pong! \n**BOT LATENCY**: ${msg.createdTimestamp - message.createdTimestamp}ms. \n**API LATENCY**: ${Math.round(client.ping)}ms.`);
    } catch (e) {
      console.log(e);
    }
  
};

exports.conf = {
  enabled: true,
  guildOnly: false, 
  aliases: [],
  permLevel: 0 
};

exports.help = {
  name: 'ping',
  description: '',
  usage: ''
}