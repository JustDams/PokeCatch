const { cooldown, color, page_size } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Pokedex = require('../database/pokedex')
let awaitingUser = new Set()
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()

const paginate = (array, newCard, page_size, page) => {
  array.slice((page - 1) * page_size, page * page_size).forEach(e => {
    newCard.setDescription(`${card.description}\n<@${e._id}>: ${e.count}`)
  })
  newCard.setDescription(`${newCard.description}\n\u200B`)
  newCard.setFooter(`Click on the arrows to change pages (${page}/${getMaxPages(array)})`)

  return newCard
}

const reformatCard = (card, array, page_size, page) => {
  card.setDescription('The current ladder is:\n\`user\` - \`pokedex size\`\n')
  card = paginate(array, card, page_size, page)
  return card
}

const getMaxPages = (array) => {
  let max = Math.ceil(array.length / page_size)
  if (max === 0) max++
  return max
}

module.exports = {
  name: 'ladder',
  aliasses: ['ladder'],
  options: '',
  description: 'ladder command',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const ladder = await Pokedex.count()
      let page = 1

      let ladderCard = card.setFooter('Pokecatch Ladder')
        .setColor(color.primary)
      ladderCard = reformatCard(ladderCard, ladder, page_size, page)

      message.channel.send(ladderCard).then(sentCard => {
        const emojisIdArray = ['◀', '▶']

        emojisIdArray.forEach(e => {
          sentCard.react(e)
        })

        const collector = sentCard.createReactionCollector((reaction, user) => {
          return emojisIdArray.includes(reaction.emoji.name) && user.id === message.author.id
        }, { idle: 10000 })

        collector.on('collect', reaction => {
          if (reaction.emoji.name === '◀') {
            page--
            page <= 0 ? page = getMaxPages(ladder) : page = page
          } else if (reaction.emoji.name === '▶') {
            page++
            page > getMaxPages(ladder) ? page = 1 : page = page
          }
          sentCard.edit(reformatCard(ladderCard, ladder, page_size, page))
        })

        collector.on('end', () => {
          sentCard.edit(reformatCard(ladderCard, ladder, page_size, page)
            .setFooter(`This message is outdated, page (${page}/${getMaxPages(ladder)})`)
            .setColor(color.secondary)
          )
        })
      })
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}
