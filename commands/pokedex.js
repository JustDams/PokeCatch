const fetch = require('node-fetch')
const Discord = require('discord.js')
const pokedex = require('../database/pokedex')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const { color, page_size, cooldown } = require('../config.json')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

const getPokemonFromPokedex = async (pokemonArray, message) => {
  const pokedexCard = new Discord.MessageEmbed()
  if (pokemonArray.length != 0) {
    const pokemon = pokemonArray[0]
    await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokemon_name.toLowerCase()}`)
      .then(res => {
        if (res.status == 200) return res.json()
        else throw Error
      })
      .then(data => {
        pokedexCard.setColor(color.primary)
          .setDescription(`<@${message.author.id}>, you have ${pokemon.count} **${pokemon.pokemon_name}**`)
          .setImage(`${data.sprites.front_default}`)
      })
  } else {
    pokedexCard.setColor(color.primary)
      .setDescription('No pokemon found with this name')
  }
  message.channel.send(pokedexCard)
}

module.exports = {
  name: 'pokedex',
  aliasses: ['pokedex','pd'],
  options: ' {pokemon name}',
  description: 'List all your pokemons, or shows you the image of tthe {pokemon name}',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      if (!args.length) {
        // If no args send all the pokedex 
        const pokedexData = await pokedex.get(message.author.id)
        const emojisIdArray = ['◀', '▶']
        let page = 1
        let maxPages = Math.ceil(pokedexData.length / page_size)
        if (maxPages === 0) maxPages++
        let pokedexCard = card.setAuthor(`${message.author.username}'s pokedex:`, message.author.avatarURL())
          .setColor(color.primary)

        const paginate = (array, newCard) => {
          array.slice((page - 1) * page_size, page * page_size).forEach(json => {
            newCard.setDescription(`${newCard.description}\n **${json.pokemon_name}** x${json.count}`)
          })
          newCard.setFooter(`Click on the arrows to change pages (${page}/${maxPages})`)

          return newCard
        }

        const reformatCard = () => {
          pokedexCard.setDescription(`__You've caught ${pokedexData.length} unique pokemons:__\n\u200B`)
          pokedexCard = paginate(pokedexData, pokedexCard)
          return pokedexCard
        }

        // Generating the card with the 10 first pokemon in the pokedex
        pokedexCard = reformatCard()

        // Send the card
        message.channel.send(pokedexCard).then(sentCard => {
          // Set the reaction on the card
          sentCard.react('◀')
          sentCard.react('▶')

          // Create a event listener on the card sent
          // Filter => emojis reacted is one of the right one && the user who reacted is the right one
          // Idle => after 10s of inaction on the card it goes outdated
          const pokedexCollector = sentCard.createReactionCollector((reaction, user) => {
            return emojisIdArray.includes(reaction.emoji.name) && user.id === message.author.id
          }, { idle: 10000 })

          // if the user react with the right emojis we update the count depending which one he reacted with
          pokedexCollector.on('collect', reaction => {
            if (reaction.emoji.name === '◀') {
              page--
              page <= 0 ? page = maxPages : page = page
            } else if (reaction.emoji.name === '▶') {
              page++
              page > maxPages ? page = 1 : page = page
            }
            // then we update the card with the update
            sentCard.edit(reformatCard()
              .setColor(color.primary))
          })

          // If the user didn't reacted then we update the card to says that it is outdated
          pokedexCollector.on('end', () => {
            sentCard.edit(reformatCard()
              .setAuthor(`${message.author.username}'s pokedex:`, message.author.avatarURL())
              .setFooter(`This message is outdated, page (${page}/${maxPages})`)
              .setColor(color.secondary)
            )
          })
        })
      } else {
        // If the user entered a pokemon name we send a card with its picture
        // if he has it in his pokedex && that the name is valid
        getPokemonFromPokedex(await pokedex.getOne(message.author.id, args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase()), message)
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}