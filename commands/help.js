const Discord = require('discord.js')
const { color, prefix } = require('../config.json')
const fs = require('fs')
const card = new Discord.MessageEmbed()

const getCommandsHelp = (type, card) => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
  const commands = []
  for (const cf of commandFiles)
    commands.push(require(`./${cf}`))

  commands.forEach(c => {
    if (c.type === type)
      card.addFields({ name: `\`${prefix}${c.name}${c.options}\``, value: `${c.description}` },)
  })
  return card
}

module.exports = {
  name: 'help',
  aliasses: ['help', 'h'],
  options: '',
  description: 'Display the command list.',
  type: 'system',
  execute(message, args) {
    const helpCard = card.setColor(color.secondary)
      .setFooter('PokeCatch Help')
    helpCard.fields = []

    if (!args.length) message.channel.send(helpCard.setTitle('Command categories:')
      .addFields(
        { name: `\`${prefix}help\``, value: 'Show this list' },
        { name: `\`${prefix}help system\``, value: 'Show the system command list' },
        { name: `\`${prefix}help game\``, value: 'Show the game command list' }
      ))
    else {
      helpCard.setDescription('Mandatory parameters: **[]**\nOptionnal parameters: **{}**')
      switch (args[0]) {
        case 'system':
          helpCard.setTitle('System commands:')
          message.channel.send(getCommandsHelp('system', helpCard))
          break
        case 'game':
          helpCard.setTitle('How to play:')
          message.channel.send(getCommandsHelp('game', helpCard))
          break
        default:
          break
      }
    }
  }
}
