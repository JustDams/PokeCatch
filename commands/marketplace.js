const Market = require('../database/market')
const { color, emojis, page_size, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

const getMaxPages = (pokemonsArray) => {
  let max = Math.ceil(pokemonsArray.length / page_size)
  if (max === 0) max++
  return max
}

module.exports = {
  name: 'marketplace',
  aliasses: ['marketplace', 'market', 'mp'],
  options: ' {pokemon name}',
  description: 'Shows the list of the pokemons actually on sale',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      let page = 1
      const emojisIdArray = ['◀', '▶']
      const basicCardMarket = card.setAuthor(`Marketplace:`)
        .setDescription('Pokemons actually in the market:\n')
        .setFooter('Pokecatch Marketplace')
        .setColor(color.primary)

      const paginate = (array, newCard, type, maxPages, page) => {
        array.slice((page - 1) * page_size, page * page_size).forEach(json => {
          if (type === 'Price')
            newCard.setDescription(`${newCard.description}\n\`${json.market_id}\` - ${json.pokemon_name} - **${json.price}** ${emojis.pokecoin.balise}`)
          else if (type === 'Market')
            newCard.setDescription(`${newCard.description}\n\ **${json}**`)
        })
        newCard.setDescription(`${newCard.description}\n\u200B`)
          .setFooter(`Click on the arrows to change pages (${page}/${maxPages})`)
        return newCard
      }

      const reformatCard = (array, type, maxPages, page = 1) => {
        let marketCard = card
        marketCard.setDescription('Pokemons actually in your market:\n')
        if (type === 'Price') {
          marketCard.setDescription(`${marketCard.description} \`id\` - \`pokemon name\` - \`price\`\n`)
        }
        marketCard = paginate(array, marketCard, type, maxPages, page)
        return marketCard
      }


      if (!args.length) {
        let pokemonsArray = await Market.distinct()
        let marketCard = basicCardMarket

        if (!pokemonsArray.length) {
          marketCard.setDescription('There isn\'t any pokemon in the market for the moment')
            .setDescription(`${marketCard.description}\n`)
          message.channel.send(marketCard)
        } else {
          marketCard = reformatCard(pokemonsArray, 'Market', getMaxPages(pokemonsArray), page)
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
                page <= 0 ? page = getMaxPages(pokemonsArray) : page = page
              } else if (reaction.emoji.name === '▶') {
                page++
                page > getMaxPages(pokemonsArray) ? page = 1 : page = page
              }
              sentCard.edit(reformatCard(pokemonsArray, 'Market', getMaxPages(pokemonsArray), page))
            })

            marketCollector.on('end', () => {
              sentCard.edit(reformatCard(pokemonsArray, 'Market', getMaxPages(pokemonsArray), page)
                .setFooter(`This message is outdated, page (${page}/${getMaxPages(pokemonsArray)})`)
                .setColor(color.secondary)
              )
            })
          })
        }
      } else {
        const pokeName = args[0].charAt(0).toUpperCase() + args[0].slice(1)
        let pokemonsArray = await Market.getPokemons(pokeName)
        let marketCard = basicCardMarket

        if (pokemonsArray.length >= 1) {
          marketCard = reformatCard(pokemonsArray, 'Price', getMaxPages(pokemonsArray))
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
                page <= 0 ? page = getMaxPages(pokemonsArray) : page = page
              } else if (reaction.emoji.name === '▶') {
                page++
                page > getMaxPages(pokemonsArray) ? page = 1 : page = page
              }
              sentCard.edit(reformatCard(pokemonsArray, 'Price', getMaxPages(pokemonsArray), page))
            })

            marketCollector.on('end', () => {
              sentCard.edit(reformatCard(pokemonsArray, 'Price', getMaxPages(pokemonsArray), page)
                .setFooter(`This message is outdated, page (${page}/${getMaxPages(pokemonsArray)})`)
                .setColor(color.secondary)
              )
            })
          })
        } else {
          marketCard.setDescription('No pokemon found with this name')
            .setDescription(`${marketCard.description}\n`)
          message.channel.send(marketCard)
        }
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}