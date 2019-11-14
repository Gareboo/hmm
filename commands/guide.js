const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  var embed = new Discord.RichEmbed()
  .setColor('Blue')
  .setAuthor("Web Guide", client.user.avatarURL)  // "" 2 li tırnak yerine Bot ismi yada sunucu ismi
	.addField("How I add the bot?", `[click here](https://b0d.glitch.me/botekle) to see`)
  .addField("Where can I see all the bots in the system?", `[Click here](https://b0d.glitch.me/botlar) to see.`)
  .addField("What is a certificate? How to get?", `[Click here](https://b0d.glitch.me/sertifika) to see.`)
.addField("What can be done in the user panel? ", ` The user panel you can edit the profile / application of your bots in the system and delete your bots from the system.`);
  message.channel.send({embed: embed})
  
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [],
	permLevel: 0,
	kategori: 'genel'
}

exports.help = {
	name: 'guide',
	description: 'Shows the guide about BOD.',
	usage: 'guide'
}