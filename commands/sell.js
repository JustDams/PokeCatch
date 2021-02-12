const Market = require('../database/market')
const User = require('../database/user')
const Pokedex = require('../database/pokedex')
const { color, emojis, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

const marketIdGenerator = () => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  return (S4() + S4())
}

module.exports = {
  name: 'sell',
  aliasses: ['sell'],
  options: ' [pokemon name] [price]',
  description: 'Place the [pokemon name] in the maketplace for [price] (10% commission)',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const userId = message.author.id
      const sellCard = card.setTitle('Selling message')
        .setColor(color.error)

      if (args.length < 2) {
        sellCard.setDescription('You need to define the pokemon name and the price !\n `!sell [pokemon name] [price]`')
          .setFooter('Pokecatch Error')
      } else {
        const pokeName = args[0].charAt(0).toUpperCase() + args[0].slice(1)
        const price = Math.floor(parseInt(args[1]))
        let marketId = marketIdGenerator()

        // Checking if the price is a valid number
        if (price <= 0 || isNaN(price))
          sellCard.setDescription(`Please enter a price over **0** ${emojis.pokecoin.balise}`)
            .setFooter('Pokecatch Error')
        else {
          const user = await User.get(userId)
          const commission = Math.ceil(price * 0.1)

          // Checking if the user can pay the commission (10% of the price)
          if (commission <= user[0].money) {
            // Checking if the user has the pokemon in his pokedex
            if (await Pokedex.exists(userId, pokeName)) {
              const pokemon = await Pokedex.getOne(userId, pokeName)
              if (pokemon[0].count - 1 >= 0) {
                // Checking if the id generate already exists, if it's the case we regenerate it
                while (Market.exists(marketId) === true) {
                  marketId = marketIdGenerator()
                }

                // then we create the field
                Market.create(marketId, userId, pokeName, price)
                // then we update the pokemon count in the pokedex of the user
                Pokedex.updateCount(userId, pokeName, pokemon[0].count - 1)
                // and finally we update the money of the user (money - commission)
                User.updateOne(userId, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money - commission)

                sellCard.setDescription(`You placed **${pokeName}** in the marketplace for the price of **${price}** ${emojis.pokecoin.balise}`)
                  .setColor(color.primary)
                  .setFooter('Pokecatch Market')
              }
            } else {
              sellCard.setDescription('You can\'t sell a pokemon that you don\'t have in stock\nCheck your `$pokedex` to see which ones you have !')
                .setFooter('Pokecatch Error')
            }
          } else {
            sellCard.setDescription(`You can't sell this pokemon at this price, you don't have enough money for the commission **(${commission} ${emojis.pokecoin.balise})**`)
              .setFooter('Pokecatch Error')
          }
        }
      }
      message.channel.send(sellCard)
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}