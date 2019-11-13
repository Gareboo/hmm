const Discord = require('discord.js');
const db = require('quick.db')
const request = require('request')

exports.run = async (client, msg, args) => {
  let mm = msg.mentions.members.first() || msg.guild.members.get(args[0])
let ll = mm.id;
    let prefix = await db.fetch(`${msg.guild.id}.prefix`) || client.ayarlar.prefix
    if(!args[0]) {
      return msg.channel.send(new Discord.RichEmbed().setDescription('Please mention a bot' ).setColor("RED"))
    }
  if (db.has('botlar')) {
  if (Object.keys(db.fetch('botlar')).includes(ll) === false) return msg.reply("This bot doesn't exist in api")
  };
    request(`https://b0d.glitch.me/bot/${ll}`, function (error, response, body) {
    if (error) return msg.channel.send('Hata:', error);
    else if (!error) {
      var a = db.fetch(`botlar.${ll}.isim`)
      var b = db.fetch(`botlar.${ll}.id`)
      var c = db.fetch(`botlar.${ll}.avatar`)
      var d = db.fetch(`botlar.${ll}.prefix`)
      var e = db.fetch(`botlar.${ll}.kutuphane`)
      var g = db.fetch(`botlar.${ll}.kisaaciklama`)
      var h = db.fetch(`botlar.${ll}.etiket`);
      var owner = db.fetch(`botlar.${ll}.sahipid`)
      var gh = db.fetch(`botlar.${ll}.durum`)
      var gg = db.fetch(`botlar.${ll}.sertifika`)
    }
      
      request(`https://b0d.glitch.me/bot`, function (error, response, body) {
    if (error) return msg.channel.send('Hata:', error);
    else if (!error) {
    if (body.includes(ll)=== true) return msg.reply("Bu ID'de bir bot sistemde bulunmamaktadır!")
    }
       })
      
    const embed = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setThumbnail(c)
    .setTitle(`BOD - Bot Info`)
    .setDescription(`${a} (${b}) `, c)
    .addField('Prefix', d)
    .addField('Owner', `<@${owner}>`)
    .addField('Library', e)
    .addField('Description', g)
    .addField('Tags', h)
    
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
  name: 'bot-info',
  description: 'info about a bot',
  usage: 'bot-info [bot id]'
};