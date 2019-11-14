const Discord = require('discord.js')
const db = require("quick.db");

exports.run = async (client, message, args) => {
  [prop, ...value] = args;
  if (prop == "prefix") {
    db.set("prefix", value.join(" "))
    message.channel.send(`> Prefix changed to ${value}`);
  }

  
   
  
};

exports.conf = {
  enabled: true,
  guildOnly: false, 
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: 'set',
  description: '',
  usage: ''
}