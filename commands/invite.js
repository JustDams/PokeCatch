const { cooldown, invite_link, color } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()

module.exports = {
  name: 'invite',
  aliasses: ['invite'],
  options: '',
  description: 'Invite command',
  type: 'system',
  execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      card.setDescription(`**You can invite me on your server with this link**: \n <${invite_link}>`)
        .attachFiles('./assets/logo.png')
        .setAuthor('PokeCatch','attachment://logo.png')
        .setFooter('Enjoy !')
        .setColor(color.primary)
      message.channel.send(card)
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}
