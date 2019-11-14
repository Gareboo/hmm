const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs');
const db = require('quick.db');
const useful = require('useful-tools');
client.ayar = db;

client.htmll = require('cheerio');
client.useful = useful;
client.tags = require('html-tags');
const co = require("./Config.json");


client.ayarlar = {
  "prefix": db.fetch("prefix"),
  "oauthSecret": co.oauth,
	"callbackURL":  co.callback,
	"kayıt": "",
  "rapor": "",
  "renk": "#D49818"
};



client.yetkililer = ["572327928646598667"]
client.webyetkililer = ["572327928646598667"]
client.sunucuyetkililer = ["572327928646598667"]
client.yetkililer = ["572327928646598667"]
client.webyetkililer = ["572327928646598667"]

client.on('ready', async () => {
  client.appInfo = await client.fetchApplication();
  setInterval( async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);
  require("./app.js")(client);
  client.user.setActivity("discord bots in bod", { type:"WATCHING" })
  console.log(`Ready ${client.user.tag} `)
});

setInterval(() => {
  if (db.has('botlar') && db.has('kbotlar')) {
    for (var i = 0; i < Object.keys(db.fetch('kbotlar')).length; i++) {
      for (var x = 0; x < Object.keys(db.fetch('botlar')).length; x++) {
        var bot = Object.keys(db.fetch('botlar'))[x]
        var user = Object.keys(db.fetch('kbotlar'))[i]
        if (db.has(`oylar.${bot}.${user}`)) {
          setTimeout(() => {
            db.delete(`oylar.${bot}.${user}`)
          }, require('ms')(`${client.useful.seg(db.fetch(`oylar.${bot}.${user}`), 6)}h`));
        }
      }
    }
  }
}, 10000);

client.on("guildMemberAdd", member => {
  if (!member.user.bot){
    member.addRole(member.guild.roles.find(r=> r.name==='members').id)
  };
  if (member.user.bot) {
    member.addRole(member.guild.roles.find(r => r.name==='BOTS LISTS').id)
  };
  let welcomer = client.channels.get('629965788488400909');
  let em = new Discord.RichEmbed()
  .setTitle("Welcomer")
  .setColor("#fff000")
  .setThumbnail(member.user.displayAvatarURL)
  .setDescription(`Hello <@${member.id}> ,welcome to the ${member.guild.name},have a great time here`)
  .setTimestamp()
  .setFooter(client.user.displayAvatarURL + "BOD")
  welcomer.send(em);
  member.send(em);
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  console.log(`Loading total of ${files.length} commands`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    
    console.log(`Loading : ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  })
});

client.on("message", async message => {
  
	if (message.author.id == client.user.id) return;
  
  
	if (!message.content.startsWith(client.ayarlar.prefix)) return
	var command = message.content.split(' ')[0].slice(client.ayarlar.prefix.length)
	var args = message.content.split(' ').slice(1)
	var cmd = ''

	if (client.commands.has(command)) {
		var cmd = client.commands.get(command)
	} else if (client.aliases.has(command)) {
		var cmd = client.commands.get(client.aliases.get(command))
	}

	if (cmd) {
    if (cmd.conf.permLevel === 'special') { //o komutu web yetkilileri kullanabsiln sadece diye yaptıgım bişe 
      if (client.yetkililer.includes(message.author.id) === false) {
        const embed = new Discord.RichEmbed()
					.setDescription(`Brother, you're not a WebSite official.!`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Insufficient Authorization.")
				return
      }
    }
    
		if (cmd.conf.permLevel === 1) {
			if (!message.member.hasPermission("MANAGE_MESSAGES")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You first learn to manage messages then use this command.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Insufficient authority.")
				return
			}
		}
		if (cmd.conf.permLevel === 2) {
			if (!message.member.hasPermission("KICK_MEMBERS")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You are not authorized to discard members.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("You are not authorized to discard members.")
				return
			}
		}
		if (cmd.conf.permLevel === 3) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Insufficient authority.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Insufficient authority.")
				return
			}
		}
		if (cmd.conf.permLevel === 4) {
			const x = await client.fetchApplication()
      var arr = [x.owner.id]
			if (!arr.includes(message.author.id)) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Competent inadequate.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("Insufficient authority.")
				return
			}
		}
		if (cmd.conf.enabled === false) {
			const embed = new Discord.RichEmbed()
				.setDescription(`This command is disabled.`)
				.setColor(client.ayarlar.renk)
				.setTimestamp()
			message.channel.send("This command is disabled.")
			return
		}
		if(message.channel.type === "dm") {
			if (cmd.conf.guildOnly === true) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You cannot use this command in private messages.`)
					.setColor(client.ayarlar.renk)
					.setTimestamp()
				message.channel.send("[You cannot use this command in private messages]")
				return
			}
		}
		cmd.run(client, message, args)
	}
});



client.login(co.token)
process.env = {}
process.env.TOKEN = co.token;
