const Market = require('../database/market')
const User = require('../database/user')
const Pokedex = require('../database/pokedex')
const { color, emojis, cooldown } = require('../config.json')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()

module.exports = {
  name: 'buy',
  aliasses: ['buy'],
  options: ' [id]',
  description: 'Buy pokemons from \`marketplace\`',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const buyCard = card.setAuthor(`Marketplace:`)
        .setFooter('Pokecatch Marketplace')
        .setColor(color.primary)

      if (!args.length) {
        message.channel.send(buyCard.setColor(color.error)
          .setDescription(`You need to enter the id of the pokemon that you want to buy ! \`buy [id]\``))
      } else {
        const marketId = args[0]
        if (!await Market.exists(marketId)) {
          message.channel.send(buyCard.setColor(color.error)
            .setDescription(`The id that you entered is not valid, please check it and retry !`))
        } else {
          const userId = message.author.id
          const pokemon = await Market.getOne(marketId)
          const seller = await User.get(pokemon[0].discord_id)
          const user = await User.get(userId)
          const price = pokemon[0].price

          if (seller[0].discord_id !== userId)
            if (user[0].money < price) {
              message.channel.send(buyCard.setColor(color.error)
                .setDescription(`You don't have enought money to buy that pokemon !`))
            } else {
              const pokeName = pokemon[0].pokemon_name.charAt(0).toUpperCase() + pokemon[0].pokemon_name.slice(1)
              if (!await Pokedex.exists(userId, pokeName))
                Pokedex.add(userId, pokeName)
              else {
                const pokedexUser = await Pokedex.getOne(userId, pokeName)
                Pokedex.updateCount(userId, pokeName, pokedexUser[0].count + 1)
              }
              await Market.deleteOne(marketId)
              User.updateOne(userId, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money - price)
              User.updateOne(seller[0].discord_id, seller[0].daily_date, seller[0].daily_month_count, seller[0].daily_count, seller[0].money + price)

              message.channel.send(buyCard.setColor(color.primary)
                .setDescription(`You successfuly bought **${pokeName}** for **${price}** ${emojis.pokecoin.balise} from the marketplace !`))
            }
          else {
            message.channel.send(buyCard.setColor(color.error)
              .setDescription(`You can't buy your own pokemons from the market, use \`withdraw [id]\` to get them back!`))
          }
        }
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}