const User = require('../database/user')
const Inventory = require('../database/inventory')
const { color, emojis, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const Discord = require('discord.js')
const card = new Discord.MessageEmbed()
let awaitingUser = new Set()

module.exports = {
  name: 'shop',
  aliasses: ['shop'],
  options: ' {pokeball name} {amount}',
  description: 'Buy pokeballs from the shop',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const ballArray = [emojis.pokeball, emojis.superball, emojis.hyperball, emojis.masterball]
      if (!args.length) {
        const ballshop = card.setTitle('Ballshop:')
          .setDescription('\n')
          .setColor(color.primary)
          .setFooter('Pokecatch Ballshop')

        Object.values(ballArray).forEach(p => {
          ballshop.setDescription(`${ballshop.description}\n x1 ${p.balise}: **${p.price}** ${emojis.pokecoin.balise}`)
        })

        message.channel.send(ballshop)
      } else {
        if (args.length >= 2) {
          const userId = message.author.id
          const user = await User.get(userId)
          const ballname = args[0].toLowerCase()
          const amount = parseInt(args[1])
          const ball = Object.values(ballArray).find(p => p.name === ballname)

          // Checking if the ball name entered is valid && if the amount is a number that is > to 0
          if (ballArray.includes(ball) && !isNaN(amount) && amount > 0) {
            const price = ball.price * amount
            // Checking if the user has enough money
            if (user[0].money >= price) {
              const userInv = await Inventory.getOne(userId, ball.id)
              User.updateOne(userId, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money - price)
              Inventory.updateCount(userId, ball.id, userInv[0].count + amount)

              message.channel.send(`You bought **x${amount}** ${ball.balise} for **${price}** ${emojis.pokecoin.balise} !`)
            } else {
              message.channel.send(`You don't have enough money to buy this ! Price: **${price}** ${emojis.pokecoin.balise}`)
            }
          } else {
            message.channel.send(`The name of the ball or the amount you entered is not valid !`)
          }
        } else {
          message.channel.send(`You need to specify the name of the ball you want and it amounts ! \`!ballshop [ball name] [amount]\``)
        }
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}