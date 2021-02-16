const fetch = require('node-fetch')
const Discord = require('discord.js')
const { emojis, color, cooldown, prefix } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const pokedex = require('../database/pokedex')
const Inventory = require('../database/inventory')
const card = new Discord.MessageEmbed()
let awaitingChannel = new Set()

module.exports = {
  name: 'find',
  aliasses: ['find','f'],
  options: '',
  description: 'Find a pokemon',
  type: 'game',
  execute(message, args) {
    if (getEntries(message.channel.id, awaitingChannel)) {
      if (getCount(message.channel.id, awaitingChannel) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds between each \`${prefix}find\``)
        message.delete()
      }
    } else {
      awaitingChannel.add({ id: message.channel.id, count: 1 })
      fetch(`https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 898)}`)
        .then(res => {
          if (res.status == 200) return res.json()
          else throw 'An error has occured'
        })
        .then(async data => {
          const pokeName = data.name.charAt(0).toUpperCase() + data.name.slice(1)
          const userId = message.author.id
          const pokeImage = data.sprites.front_default
          const inv = await Inventory.whereNotNull(userId)
          const emojisIdArray = []
          const emojisArray = [emojis.pokeball, emojis.superball, emojis.hyperball,emojis.masterball, emojis.cancel]
          for (const i of inv) {
            emojisIdArray.push(i.item_id)
          }
          emojisIdArray.push(emojis.cancel.id)
          // Probability for the ball to catch
          const proba = Math.floor(Math.random() * 100)

          const createCard = (description, footer, color) => card.setDescription(description)
            .setImage(pokeImage)
            .setFooter(footer)
            .setColor(color)

          message.channel.send(createCard(`<@${userId}>, you found **${pokeName}**`, 'React with the pokeball you want to use', color.primary))
            .then(sentCard => {
              // Set the Pokeball reactions & Cancel
              emojisArray.forEach(e => {
                if (emojisIdArray.includes(e.id))
                  sentCard.react(e.balise)
              })

              // Waiting for user reaction during 15s
              sentCard.awaitReactions((reaction, user) => {
                return emojisIdArray.includes(reaction.emoji.id) && user.id === userId
              }, { max: 1, time: 15000 })
                .then(async collected => {
                  // Check which reaction has been clicked first by the user
                  const pokeball = Object.values(emojis).find(e => e.id === collected.first().emoji.id)
                  // If its the cancel one, the card is changed
                  if (collected.first().emoji.id === emojis.cancel.id) {
                    sentCard.edit(createCard(`<@${userId}>, you canceled the hunt`, 'Better luck with your hunt next time', color.secondary))
                    // Else if its one of the pokeballs it checks if the proba is <= of the pokeball proba
                  } else {
                    // Remove 1 of the ball used from the inventory
                    const invItem = await Inventory.getOne(userId, pokeball.id)
                    Inventory.updateCount(userId, pokeball.id, invItem[0].count - 1)

                    if (proba <= pokeball.proba) {
                      // Catch success
                      // Checks if we already caught the pokemon
                      if (await pokedex.exists(userId, pokeName)) {
                        // If yes we update the pokemon count
                        const pokemon = await pokedex.getOne(userId, pokeName)
                        pokedex.updateCount(userId, pokeName, pokemon[0].count + 1)
                      } else {
                        // If not we add it to the pokedex
                        pokedex.add(userId, pokeName)
                      }
                      // Then we send the success message
                      sentCard.edit(createCard(`<@${userId}>, ${pokeball.balise} you caught **${pokeName}** !`, 'GG !', color.success))
                    } else if (proba > pokeball.proba) {
                      // Catch failed
                      sentCard.edit(createCard(`<@${userId}>, ${emojis.sacha.balise} you missed ! **${pokeName}** is gone`, 'Oh no you missed your ball !', color.error))
                    }
                  }
                })
                // Change the EmbedMessage after the 15s
                .catch(() => {
                  sentCard.edit(createCard(`<@${userId}>, **${pokeName}** ran away..`, 'Be faster next time !', color.secondary))
                })
            })
        })
    }
    setTimeout(() => {
      awaitingChannel = deleteEntry(message.channel.id, awaitingChannel)
    }, cooldown)
  }
}
