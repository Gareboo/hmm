const Discord = require('discord.js');
const db = require('quick.db')
const request = require('request')

exports.run = async (client, msg, args) => {
    let prefix = await db.fetch(`${msg.guild.id}.prefix`) || client.ayarlar.prefix
    if(!args[0]) {
      return msg.channel.send(new Discord.RichEmbed().setDescription('Please mention a bot' ).setColor("RED"))
    }
    request(`https://b0d.glitch.me/bot/${args[0]}`, function (error, response, body) {
    if (error) return msg.channel.send('Hata:', error);
    else if (!error) {
      var a = db.fetch(`botlar.${args[0]}.isim`)
      var b = db.fetch(`botlar.${args[0]}.id`)
      var c = db.fetch(`botlar.${args[0]}.avatar`)
      var d = db.fetch(`botlar.${args[0]}.prefix`)
      var e = db.fetch(`botlar.${args[0]}.kütüphane`)
      var g = db.fetch(`botlar.${args[0]}.kisa_aciklama`)
      var h = db.fetch(`botlar.${args[0]}.etiketler`);
      
    }
      
      request(`https://b0d.glitch.me/bot`, function (error, response, body) {
    if (error) return msg.channel.send('Hata:', error);
    else if (!error) {
    if (body.includes(args[0])=== false) return msg.reply("Bu ID'de bir bot sistemde bulunmamaktadır!")
    }
       })
      
    const embed = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setThumbnail(c)
    .setTitle(`XiR - Bot Arama`)
    .setDescription(`${a} (${b}) `, c)
    .addField('Prefix', d)
    .addField('Sahip', "hh")
    .addField('Kısa Açıklama', g)
    .addField('Etiketler', h)
    .addField('Sertifika', "gh")
    .addField('Onay Durumu', "m")
    .addField("Web Sitesi","--")
    .addField('Github', "h")
    .addField('Destek Sunucusu',"77")
    msg.channel.send({embed})
  })
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['search-bot', 'find-bot', 'info'],
  permLevel: 0,
  kategori: 'genel'
};

exports.help = {
  name: 'bot-ara',
  description: 'DiscordBotsTR sistemindeki botları aramanızı sağlar.',
  usage: 'bot-ara [bot id]'
};