const Discord = require('discord.js');
const request = require('request');
const settings = require('./settings');
const help = require('./help');
const top = require('./top');
const define = require('./define');
const nwordRequest = require('./nword_count_request');
const utils = require('./utils')
const ES_NODE = settings.es.host;

const bot = new Discord.Client();



// filters message to keep only the content we're interested in
function messageToJson(message) {
  return {
    content: message.content,
    createdAt: message.createdAt,
    author: {
      username: message.author.username
    },
    channel: {
      name: message.channel.name
    },
    guild: {
      name: message.guild.name
    }
  }
}


bot.on('ready', () => {
  bot.user.setActivity("%help");
  console.log('I am ready!');
});

let thing = {
  top,
  help,
  define
}

// on command message
bot.on('message', message => {
  if (!message.content.startsWith(settings.bot.prefix)) return;
  let command = utils.getCommand(message)
  // run the function depending on the command with this message
  console.log(thing[command._[0]])
  thing[command._[0]](message)
});

// forwarding all messages to ES
bot.on('message', message => {
  // skip the message if it's from a bot
  if(message.author.bot || !message.guild) return;

  // send message to ES
  request.post(`${ES_NODE}/discord_write/_doc/`, {
    json: messageToJson(message),
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${settings.es.auth.username}:${settings.es.auth.password}`).toString('base64')
    },
    agentOptions: {
      rejectUnauthorized: false
    }
  }, (err, res, body) => {
    if (err) return console.error(err)
  })
});

bot.login(settings.discord.auth.token);
