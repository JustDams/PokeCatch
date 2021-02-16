const { discord_link, cooldown, bot_info, color } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

module.exports = {
  name: 'infos',
  aliasses: ['infos'],
  options: '',
  description: 'Shows infos about the bot',
  type: 'system',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const infosCard = card
      infosCard.fields = []
      infosCard
        .addField('Github link:', `${bot_info.github}`, true)
        .addField('Github\'s of bot creators:', '@JusDams\n@Weder77\n@Sheraw91\n@MENT3', true)
        .addField('Version:', `${bot_info.version}`, true)
        .attachFiles('./assets/logo.png')
        .setAuthor('PokeCatch', 'attachment://logo.png')
        .setColor(color.primary)
        .setDescription(`**You can join my discord with this link**: \n ${discord_link}`)
      message.channel.send(infosCard)
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}