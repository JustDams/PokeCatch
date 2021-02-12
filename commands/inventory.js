const Inventory = require('../database/inventory')
const Discord = require('discord.js')
const { emojis, color, cooldown } = require('../config.json')
const card = new Discord.MessageEmbed()
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()

const descriptionPush = async (inv) => {
  const description = []
  for (const i of inv) {
    item = Object.values(emojis).find(e => e.id === i.item_id)
    description.push(`**x${i.count}** ${item.balise}`)
  }
  return description
}

module.exports = {
  name: 'inventory',
  aliasses: ['inventory', 'inv'],
  options: '',
  description: 'Show your inventory',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown * 2 / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const userId = message.author.id
      const inv = await Inventory.get(userId)
      const invCard = card.setAuthor(`${message.author.username}'s inventory:`, message.author.avatarURL())
        .setColor(color.primary)

      const description = await descriptionPush(inv)
      invCard.setDescription(`${description.join('\n')}`)
      message.channel.send(invCard)
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown * 2)
  }
}