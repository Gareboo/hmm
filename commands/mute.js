const Discord = require('discord.js');
const ms = require('ms')

exports.run = async (client, message, args) => {
let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if(!tomute) return message.channel.send('Can not find user');
  let muterole = message.guild.roles.find(`name`, "Muted");
  if(!muterole) {
    try{
      muterole = await message.guild.createRole({
        name: "Muted",
        color: "RANDOM",
        permissions:[]
      }) 
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      message.channel.send(e.stack)
    }
  }
  let mutetime = args[1];
  if(!mutetime) return message.channel.send("Please put a time");
  
  await(tomute.addRole(muterole.id));
  message.channel.send(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);
  tomute.send(`You have been muted in ${message.guild.name} for ${ms(ms(mutetime))} for ${args[2]} reason`)
  let emm = new Discord.RichEmbed()
  .setTitle("Muted")
  .setColor("ff0000")
  .setTimestamp()
  .addField("Moderator", `<@${message.author.id}>`)
  .addField("Muted user", `<@${tomute.id}>`)
  .addField("Time", `${ms(ms(mutetime))}`)
  .addField("Reason", args[2] || "No reason given")
   message.guild.channels.find(c => c.name === "mod-logs").send(emm);
  
  
  setTimeout(function(){
    tomute.removeRole(muterole.id);
    message.channel.send(`<@${tomute.id}> has been unmuted`)
  }, ms(mutetime))
};

exports.conf = {
  enabled: true, //we enabled the code
  guildOnly: false, //sadece servere özel yapmadık
  aliases: ['tm','m'], //farklı çağrılar ekledik
  permLevel: 3 // 3 = ADMINISTRATOR, 4 = Owner (bot.js dosyasında perm leveller yazıyor)
};

exports.help = {
  name: 'mute', //adını belirledik (kullanmak için gereken komut)
  description: 'Mutes a user', //açıklaması
  usage: '+mute [username] [time]' 
};