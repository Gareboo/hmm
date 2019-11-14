const Discord = require('discord.js')

exports.run = async (client, message, args) => {
  try {
    await message.channel.send("> System is restarting..")
    process.exit(1);
  } catch (e) {
    message.channel.send(e.message);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false, 
  aliases: ["restart"],
  permLevel: 4
};

exports.help = {
  name: 'update',
  description: '',
  usage: ''
}