const { color } = require('../config.json')
const Discord = require('discord.js')

module.exports = (title = 'An error has occurred', description) =>
  new Discord.MessageEmbed().setTitle(title)
    .setColor(color.error)
    .setDescription(description)
    .setFooter('PokeCatch Error',)
