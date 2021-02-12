const Market = require('../database/market')
const User = require('../database/user')
const Pokedex = require('../database/pokedex')
const { color, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

module.exports = {
  name: 'withdraw',
  aliasses: ['withdraw'],
  options: ' [id]',
  description: 'Withdraw your pokemon from the \`marketplace\`',
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
          .setDescription(`You need to enter the id of the pokemon that you want to withdraw ! \`!withdraw [id]\``))
      } else {
        const marketId = args[0]
        // Checking if the pokemon is in the market
        if (!await Market.exists(marketId)) {
          message.channel.send(buyCard.setColor(color.error)
            .setDescription(`The id that you entered is not valid, please check it and retry !`))
        } else {
          const userId = message.author.id
          const pokemon = await Market.getOne(marketId)
          const seller = await User.get(pokemon[0].discord_id)

          // Checking if the pokemon in the market belongs to the user who did the command
          if (seller[0].discord_id !== userId) {
            message.channel.send(buyCard.setColor(color.error)
              .setDescription(`You can't \`!withdraw\` a pokemon that isn't yours ! Do \`!mymarketplace\` to see yours !`))
          } else {
            const pokeName = pokemon[0].pokemon_name
            // Checking if the pokemon is already in his pokedex
            if (!await Pokedex.exists(userId, pokeName))
              // If its not we create the field
              Pokedex.add(userId, pokeName)
            else {
              // Else we update the count
              const pokedexUser = await Pokedex.getOne(userId, pokeName)
              Pokedex.updateCount(userId, pokeName, pokedexUser[0].count + 1)
            }
            // Then we delete the pokemon from the market
            await Market.deleteOne(marketId)
            message.channel.send(buyCard.setColor(color.primary)
              .setDescription(`You successfuly withdraw **${pokeName}** from the marketplace !`))
          }
        }
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}