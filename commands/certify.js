const Discord = require('discord.js');
const db = require('quick.db');
const con = require("../Config.json")

exports.run = async (client, message, args) => {
  let mm = message.mentions.members.first() || message.guild.members.get(args[0]);
	if(!mm) return message.reply("> Please mention a bot or provide a id")
  
  if(!client.users.get(mm.id).bot) return message.channel.send('> That is not a bot ,xd!')
  
	if (db.has('botlar')) {
			if (Object.keys(db.fetch('botlar')).includes(mm.id) === false)  return message.reply("This bot doesn't exist")
	}
  
  if (db.has('botlar')) {
  if (db.has(`botlar.${mm.id}.sertifika`) === true) return message.reply("This bot is already certified")
  }
  
  message.channel.send(`Certificate has been given to \`${db.fetch(`botlar.${mm.id}.isim`)}\` `)
  client.users.get(mm.id).addRole('643127942033047580')
  let chh = client.channels.get(con.botlogs)
  let embed = new Discord.RichEmbed()
  .setTitle("Certificate")
  .setColor("fff000")
  .setTimestamp()
  .addField("Bot Name", `\`${db.fetch(`botlar.${mm.id}.isim`)}\``, true)
	.addField("Owner", `<@${db.fetch(`botlar.${mm.id}.sahipid`)}>`, true)
            .addField("Given By", `<@${message.author.id}>`, true)
  chh.send(embed)
  db.set(`botlar.${mm.id}.sertifika`, "Bulunuyor")
  
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['cf'],
	permLevel: 'special',
	kategori: 'yetkili'
}

exports.help = {
	name: 'certify',
	description: 'To certify a bot ',
	usage: 'certify [ID]'
}