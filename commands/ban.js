const Discord = require("discord.js");

exports.run = function(client, message, args) {
  let bUser = message.guild.member(
    message.mentions.users.first() || message.guild.members.get(args[0])
  );
  if (!bUser) return message.channel.send("Please mention a user to ban");
  let bReason = args.join(" ").slice(22);
  if(bUser.hasPermission("KICK_MEMBERS")) return message.channel.send("I can not ban him/her")
  let banEmbed = new Discord.RichEmbed()
    .setTitle("Ban Command")
    .setColor("RANDOM")
    .addField("Banned User", `${bUser} with id of ${bUser.id}`)
    .addField(
      "Banned By",
      `<@${message.author.id}> with id of ${message.author.id}`
    )
    .addField("Banned in", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", bReason)
    

  let modlogschannel = message.guild.channels.find(`name`, "mod-logs");
  if (!modlogschannel)
    return message.channel.send("Cant find `modlogs` channel");

  message.guild.member(bUser).ban(bReason);
  modlogschannel.send(banEmbed);
};

exports.conf = {
  enabled: true,
  guildOnly: false, 
  aliases: [],
  permLevel: 3
};

exports.help = {
  name: "ban", //adını belirledik (kullanmak için gereken komut)
  description: "Bans you user you mention with the reason", //açıklaması
  usage: "+ban [username] [reason]"
};
