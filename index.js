const { token, prefix } = require('./config.json')
const Discord = require('discord.js')
const fs = require('fs')
const bot = new Discord.Client()
const errorCard = require('./templates/cardError')
const initUser = require('./templates/initUser')
const Item = require('./database/item')
require('dotenv').config()

// Get commands files
bot.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

// ORM : https://mongoosejs.com/
const mongo = require('./database/mongo')

bot.on('ready', () => {
  console.log('🚀 Bot started!')
  mongo().then(() => {
    try {
      console.log('🧱 Connected to mongo')
    } catch (e) {
      console.error(e)
    }
  }).then(() => {
    Item.drop()
  })

  bot.user.setActivity(`${prefix}help`, { type: 'PLAYING' })
})

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  command.aliasses.forEach(e => {
    bot.commands.set(e, command)
  })
}

bot.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return
  else {
    await initUser(message.author.id)
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    if (!bot.commands.has(command))
      message.channel.send(errorCard(
        title = 'This command does not exist',
        description = `Use \`${prefix}help\` to get the command list`
      ))
    else {
      try {
        bot.commands.get(command).execute(message, args)
      } catch (error) {
        console.log(error)
        message.channel.send(errorCard())
      }
    }
  }
})

// Start the bot
bot.login(process.env.TOKEN)
