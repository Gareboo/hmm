const request = require('request');
const db = require('quick.db');
const fs = require('fs');
const url = require("url");
const path = require("path");
const Discord = require("discord.js");
var express = require('express');
var app = express();
const moment = require("moment");
require("moment-duration-format");
const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");
const md = require("marked");
const co = require("./Config.json");

module.exports = (client) => {
  
const templateDir = path.resolve(`${process.cwd()}${path.sep}html`);
app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}css`)));

passport.serializeUser((user, done) => {
done(null, user);
});
passport.deserializeUser((obj, done) => {
done(null, obj);
});

passport.use(new Strategy({
clientID: client.user.id,
clientSecret: client.ayarlar.oauthSecret,
callbackURL: client.ayarlar.callbackURL,
scope: ["identify"]
},
(accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

app.use(session({
secret: '123',
resave: false,
saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.locals.domain = process.env.PROJECT_DOMAIN;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
extended: true
})); 

function checkAuth(req, res, next) {
if (req.isAuthenticated()) return next();
req.session.backURL = req.url;
res.redirect("/giris");
}

const renderTemplate = (res, req, template, data = {}) => {
const baseData = {
bot: client,
path: req.path,
user: req.isAuthenticated() ? req.user : null
};
res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/giris", (req, res, next) => {
if (req.session.backURL) {
req.session.backURL = req.session.backURL;
} else if (req.headers.referer) {
const parsed = url.parse(req.headers.referer);
if (parsed.hostname === app.locals.domain) {
req.session.backURL = parsed.path;
}
} else {
req.session.backURL = "/";
}
next();
},
passport.authenticate("discord"));

app.get("/baglanti-hatası", (req, res) => {
renderTemplate(res, req, "autherror.ejs");
});

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
if (req.session.backURL) {
const url = req.session.backURL;
req.session.backURL = null;
res.redirect(url);
} else {
res.redirect("/");
}
});

app.get("/cikis", function(req, res) {
req.session.destroy(() => {
req.logout();
res.redirect("/");
});
});

app.get("/", (req, res) => {
renderTemplate(res, req, "index.ejs");
});

app.get("/sertifika", (req, res) => {

renderTemplate (res, req, "sertifika.ejs");
});

app.get("/hakkimizda", (req, res) => {
  
renderTemplate(res, req, "hakkımızda.ejs");
});

app.get("/botlar", (req, res) => {
 
renderTemplate(res, req, "botlar.ejs")
});

app.get("/botyonetim/hata", (req, res) => {
  
renderTemplate(res, req, "hataa.ejs")
});

app.get("/botekle/hata", (req, res) => {
 
renderTemplate(res, req, "hataaa.ejs")
});

app.get("/botekle", checkAuth, (req, res) => {
 
renderTemplate(res, req, "ADDBOT.ejs")
});

app.post("/botekle", checkAuth, (req, res) => {

let ayar = req.body

if (ayar === {} || !ayar['botid'] || !ayar['botprefix'] || !ayar['kutuphane'] || !ayar['kisa-aciklama'] || !ayar['uzun-aciklama'] || !ayar['etikett']) return res.redirect('/botyonetim/hata')

let ID = ayar['botid']

if (db.has('botlar')) {
    if (Object.keys(db.fetch('botlar')).includes(ID) === true) return res.redirect('/botekle/hata')
}
  
  var tag = ''
  if (Array.isArray(ayar['etikett']) === true) {
    var tag = ayar['etikett']
  } else {
    var tag = new Array(ayar['etikett'])
  }

request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`botlar.${ID}.id`, sistem.id)
db.set(`botlar.${ID}.isim`, sistem.username+"#"+sistem.discriminator)

db.set(`botlar.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sahip = JSON.parse(body)

db.set(`botlar.${ID}.prefix`, ayar['botprefix'])
db.set(`botlar.${ID}.kutuphane`, ayar['kutuphane'])
db.set(`botlar.${ID}.sahip`, sahip.username+"#"+sahip.discriminator)
db.set(`botlar.${ID}.sahipid`, sahip.id)
db.set(`botlar.${ID}.kisaaciklama`, ayar['kisa-aciklama'])
db.set(`botlar.${ID}.uzunaciklama`, ayar['uzun-aciklama'])
db.set(`botlar.${ID}.etiket`, tag)
if (ayar['botsite']) {
db.set(`botlar.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`botlar.${ID}.github`, ayar['github'])
}
if (ayar['botdestek']) {
db.set(`botlar.${ID}.destek`, ayar['botdestek'])
}

db.set(`kbotlar.${req.user.id}.${ID}`, db.fetch(`botlar.${ID}`))

res.redirect("/kullanici/"+req.params.userID);

client.channels.get(co.botlogs).send(`<@${req.user.id}> \`${sistem.username}#${sistem.discriminator}\` has been added`)

if (client.users.has(req.user.id) === true) {
  client.users.get(req.user.id).send(`\`${sistem.username}#${sistem.discriminator}\` has been added successfully please wait for the approval test.`)
}

}})
}})

});

app.get("/kullanici/:userID", (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "profil.ejs", {kisi})
    };
  });

});

app.get("/kullanici/:userID/profil", (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "profil.ejs", {kisi})
    };
  });

});

app.get("/kullanici/:userID/duzenle/:botID", checkAuth, (req, res) => {

var id = req.params.botID


renderTemplate(res, req, "duzenle.ejs", {id})

});


app.post("/kullanici/:userID/duzenle/:botID", checkAuth, (req, res) => {

let ayar = req.body
let ID = req.params.botID
let s = req.user.id

var tag = ''
  if (Array.isArray(ayar['etikett']) === true) {
    var tag = ayar['etikett']
  } else {
    var tag = new Array(ayar['etikett'])
  }

request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`botlar.${ID}.isim`, sistem.username+"#"+sistem.discriminator)

db.set(`botlar.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sahip = JSON.parse(body)
db.set(`botlar.${ID}.prefix`, ayar['botprefix'])
db.set(`botlar.${ID}.kutuphane`, ayar['kutuphane'])
db.set(`botlar.${ID}.sahip`, sahip.username+"#"+sahip.discriminator)
db.set(`botlar.${ID}.sahipid`, sahip.id)
db.set(`botlar.${ID}.kisaaciklama`, ayar['kisa-aciklama'])
db.set(`botlar.${ID}.uzunaciklama`, ayar['uzun-aciklama'])
db.set(`botlar.${ID}.etiket`, tag)
if (ayar['botsite']) {
db.set(`botlar.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`botlar.${ID}.github`, ayar['github'])
}
if (ayar['botdestek']) {
db.set(`botlar.${ID}.destek`, ayar['botdestek'])
}

res.redirect("/kullanici/"+req.params.userID);
let id = req.params.botID
client.channels.get(co.botlogs).send(`<@${req.user.id}> edited \` ${sistem.username}#${sistem.discriminator}\` successfully. \nhttps://b0d.glitch.me/bot/${db.fetch(`botlar.${id}.id`)}`)


if (client.users.has(req.user.id) === true) {
client.users.get(req.user.id).send(`> \`${sistem.username}#${sistem.discriminator}\` edited successfully. \nhttps.b0d.glitch.me/bot/${db.fetch(`botlar.${id}.id`)}`)
}

}})
}})

});

app.get("/bot/:botID/rapor", checkAuth, (req, res) => {

renderTemplate (res, req, "rapor.ejs");
});

app.post("/bot/:botID/rapor", checkAuth, (req, res) => {

let ayar = req.body

if(ayar['mesaj-1']) {
db.push(`botlar.${req.params.botID}.raporlar`, JSON.parse(`{ "rapor":"${ayar['mesaj-1']}" }`))
let rchh = client.channels.get(co.reportCh)
let emb5 = new Discord.RichEmbed()

.setTitle("Report")
.setColor("ff0000")
.setTimestamp()
.addField("Reported Bot", `${db.fetch(`botlar.${req.params.botID}.isim`)}`, true)
.addField("Reported By", `<@${req.user.id}> (${req.user.username}#${req.user.discriminator})`, true)
.addField("Reason", `\` ${ayar['mesaj-1']}\` `, true)
rchh.send(emb5)

}
if(ayar['mesaj-2']) {
db.push(`botlar.${req.params.botID}.raporlar`, JSON.parse(`{ "rapor":"${ayar['mesaj-2']}" }`))
let rh = client.channels.get(co.reportCh
}

res.redirect('/bot/'+req.params.botID);
});

app.get("/kullanici/:userID/sil/:botID", checkAuth, (req, res) => {
  var id = req.params.botID
  renderTemplate(res, req, "sil.ejs", {id}) 
});

app.post("/kullanici/:userID/sil/:botID", checkAuth, (req, res) => {

let ID = req.params.botID

db.delete(`botlar.${ID}`) 
db.delete(`kbotlar.${req.user.id}.${ID}`)

res.redirect("/kullanici/"+req.params.userID);
});

app.get("/bot/:botID", (req, res) => {
var id = req.params.botID

request({
url: `https://discordapp.com/api/v7/users/${id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

if (db.fetch(`${id}.avatar`) !== `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`) {
db.set(`${id}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)
}

}
})

renderTemplate(res, req, 'bot.ejs', {id})

});

app.get("/bot/:botID/hata", (req, res) => {
renderTemplate(res, req, "hata.ejs")
});

app.get("/bot/:botID/oyver", checkAuth, (req, res) => {

var id = req.params.botID
let user = req.user.id

var saat = `${new Date().getHours() + 3}:${new Date().getMinutes()}:${new Date().getSeconds()}`

if (db.has(`oylar.${id}.${user}`) === true) {
  if (db.fetch(`oylar.${id}.${user}`) < saat) {
    res.redirect('/bot/'+req.params.botID+'/hata')
    return
  } else if (db.fetch(`oylar.${id}.${user}`) >= saat) {
  db.add(`botlar.${id}.oy`, 1)
  db.set(`oylar.${id}.${user}`, saat)
  }
} else {
  db.add(`botlar.${id}.oy`, 1)
  db.set(`oylar.${id}.${user}`, saat)
}

res.redirect('/bot/'+req.params.botID)

});
  
  app.get("/yetkili/hata", (req, res) => {
    renderTemplate(res, req, "hate.ejs")
  })

app.get("/yetkili", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
renderTemplate(res, req, "y-panel.ejs") 
});

app.get("/botyonetici/onayla/:botID", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
let id = req.params.botID

db.set(`botlar.${id}.durum`, 'Onaylı')

res.redirect("/yetkili")

let ch = client.channels.get(co.botlogs);
  let emb = new Discord.RichEmbed()
  .setTitle('Bot Approved')
  .setColor("fff000")
  .setTimestamp()
  .addField("Bot Name", `${db.fetch(`botlar.${id}.isim`)}`, true)
  .addField("Bot Id", `${db.fetch(`botlar.${id}.id`)}`, true)
  .addField("Bot owner", `<@${db.fetch(`botlar.${id}.sahipid`)}>`, true)
  .addField("Approved By", `<@${req.user.id}> (${req.user.tag})`, true)
  .addField("link", `https://b0d.glitch.me/bot/${db.fetch(`botlar.${id}.id`)}`)
  ch.send(emb);

if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
client.users.get(db.fetch(`botlar.${id}.sahipid`)).send(emb);
}

});

app.get("/botyonetici/bekleme/:botID", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
let id = req.params.botID

db.set(`botlar.${id}.durum`, 'Beklemede')

res.redirect("/yetkili")

client.channels.get(client.ayarlar.kayıt).send(`<@${req.user.id}> adlı yetkili tarafından \`${db.fetch(`botlar.${id}.sahip`)}\` adlı kullanıcının \`${db.fetch(`botlar.${id}.id`)}\` ID'ine sahip \`${db.fetch(`botlar.${id}.isim`)}\` adlı botu beklemeye alındı.`)

if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
client.users.get(db.fetch(`botlar.${id}.sahipid`)).send(`\`${db.fetch(`botlar.${id}.isim`)}\` adlı botunuz beklemeye alındı!`)
}

});

app.get("/botyonetici/reddet/:botID", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "reddet.ejs")
});

app.post("/botyonetici/reddet/:botID", checkAuth, (req, res) => {
  if(!client.yetkililer.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  let id = req.params.botID
  
  db.set(`botlar.${id}.durum`, 'Reddedilmiş')
  
  res.redirect("/yetkili")
  
  let hch = client.channels.get(co.botlogs);
  let emb2 = new Discord.RichEmbed()
  .setTitle("Bot declined")
  .setColor("ff0000")
  .setTimestamp()
  .addField("Bot Name", `${db.fetch(`botlar.${id}.isim`)}`, true)
  .addField("Owner", `<@${db.fetch(`botlar.${id}.sahipid`)}> (${db.fetch(`botlar.${id}.sahip`)})`, true)
  .addField("Reason", `${req.body['red-sebep']}`, true)
  .addField("Rejected By", `<@${req.user.id}> (${req.user.username}#${req.user.discriminator})`, true)
  hch.send(emb2);
  if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
  client.users.get(db.fetch(`botlar.${id}.sahipid`)).send(emb2);
  }

  });

//API
  
app.get("/api", (req, res) => {
  renderTemplate(res, req, "api.ejs")
});

app.get("/api/botlar", (req, res) => {
  res.json({
    hata: 'Bir bot ID yazınız.'
  });
});

app.get("/api/botlar/:botID/oylar", (req, res) => {
  res.json({
    hata: 'Bir kullanıcı ID yazınız.'
  });
});

app.get("/api/botlar/:botID", (req, res) => {
   var id = req.params.botID

   if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       hata: 'Yazdığınız ID\'e sahip bir bot sistemde bulunmuyor.'
     });
   }
  }

    res.json({
       isim: db.fetch(`botlar.${id}.isim`),
       id: id,
avatar: db.fetch(`botlar.${id}.avatar`),
prefix: db.fetch(`botlar.${id}.prefix`),
kütüphane: db.fetch(`botlar.${id}.kutuphane`),
sahip: db.fetch(`botlar.${id}.sahip`),
sahipid: db.fetch(`botlar.${id}.sahipid`),
kisa_aciklama: db.fetch(`botlar.${id}.kisaaciklama`),
uzun_aciklama: db.fetch(`botlar.${id}.uzunaciklama`),
etiketler: db.fetch(`botlar.${id}.etiket`),
destek_sunucusu: db.fetch(`botlar.${id}.destek`) || 'Belirtilmemiş',
web_sitesi: db.fetch(`botlar.${id}.site`) || 'Belirtilmemiş',
github: db.fetch(`botlar.${id}.github`) || 'Belirtilmemiş',
durum: db.has(`botlar.${id}.durum`) ? db.fetch(`botlar.${id}.durum`) : 'Beklemede',
oy_sayisi: db.fetch(`botlar.${id}.oy`) || 0,
sertifika: db.fetch(`botlar.${id}.sertifika`) || 'Bulunmuyor'
    });
});

  app.get("/api/tumbotlar", (req, res) => {
    res.json(Object.keys(db.fetch('botlar')));
  });
  
app.get("/api/botlar/:botID/oylar/:kullaniciID", (req, res) => {
  var id = req.params.botID
  var userr = req.params.kullaniciID

  if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       hata: 'Yazdığınız ID\'e sahip bir bot sistemde bulunmuyor.'
     });
   }
  }
   res.json({
     oy_durum: db.has(`oylar.${id}.${userr}`) ? `Bugün oy vermiş.` : `Bugün oy vermemiş.`,
     oy_sayisi: db.fetch(`botlar.${id}.oy`) || 0
   });

});

app.listen(3000);

//Blog

app.get("/blog", (req, res) => {
  res.redirect('/');
});
  
};
