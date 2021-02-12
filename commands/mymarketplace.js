const Market = require('../database/market')
const Discord = require('discord.js')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const { color, emojis, page_size, cooldown } = require('../config.json')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

module.exports = {
  name: 'mymarketplace',
  aliasses: ['mymarketplace', 'mymarket', 'mmp'],
  options: '',
  description: 'Shows the list of your pokemons actually on sale',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown * 3 / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const userId = message.author.id
      const pokemons = await Market.getMyPokemons(userId)
      const emojisIdArray = ['◀', '▶']
      let page = 1
      let maxPages = Math.ceil(pokemons.length / page_size)
      if (maxPages === 0) maxPages++
      let marketCard = card.setAuthor(`${message.author.username}'s Marketplace:`, message.author.avatarURL())
        .setDescription('Pokemons actually in your market:\n')
        .setFooter(`Click on the arrows to change pages (${page}/${maxPages})`)
        .setColor(color.primary)

      const paginate = (array, newCard) => {
        array.slice((page - 1) * page_size, page * page_size).forEach(json => {
          newCard.setDescription(`${newCard.description}\n\`${json.market_id}\` - ${json.pokemon_name} - **${json.price}** ${emojis.pokecoin.balise}`)
        })
        newCard.setDescription(`${newCard.description}\n\u200B`)
          .setFooter(`Click on the arrows to change pages (${page}/${maxPages})`)

        return newCard
      }

      const reformatCard = () => {
        marketCard.setDescription('Pokemons actually in your market:\n')
          .setDescription(`${marketCard.description} \`id\` - \`pokemon name\` - \`price\`\n`)
        marketCard = paginate(pokemons, marketCard)
        return marketCard
      }

      if (!pokemons.length) {
        marketCard.setDescription(`${marketCard.description}\n **You don't have any pokemon in the market**`)
          .setDescription(`${marketCard.description}\n\u200B`)
        message.channel.send(marketCard)
      } else {
        marketCard = reformatCard()

        message.channel.send(marketCard).then(sentCard => {
          emojisIdArray.forEach(e => {
            sentCard.react(e)
          })

          const marketCollector = sentCard.createReactionCollector((reaction, user) => {
            return emojisIdArray.includes(reaction.emoji.name) && user.id === message.author.id
          }, { idle: 10000 })

          marketCollector.on('collect', reaction => {
            if (reaction.emoji.name === '◀') {
              page--
              page <= 0 ? page = maxPages : page = page
            } else if (reaction.emoji.name === '▶') {
              page++
              page > maxPages ? page = 1 : page = page
            }
            sentCard.edit(reformatCard(page))
          })

          marketCollector.on('end', () => {
            sentCard.edit(reformatCard(page)
              .setAuthor(`${message.author.username}'s Marketplace:`, message.author.avatarURL())
              .setFooter(`This message is outdated, page (${page}/${maxPages})`)
              .setColor(color.secondary)
            )
          })
        })
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown * 3)
  }
}
