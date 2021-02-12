const { emojis, prefix, color, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
const errorCard = require('../templates/cardError')
const User = require('../database/user')
let awaitingUser = new Set()

const gg = async (user, bet) => {
  User.updateOne(user[0].discord_id, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money + bet)
}

const rip = async (user, bet) => {
  User.updateOne(user[0].discord_id, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money - bet)
}

module.exports = {
  name: 'coinflip',
  aliasses: ['coinflip', 'cf'],
  options: ' [bet] {head|tail}',
  description: 'Bet your money and become rich (or not).',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const coinflipCard = errorCard(
        title = `Coinflip:`,
        description = `Your command need to has this form: \`${prefix}coinflip [bet (number)] {head|tail}\``
      )
      if (!args.length) {
        message.channel.send(coinflipCard)
      } else {
        const bet = Math.floor(parseInt(args[0]))
        const user = await User.get(message.author.id)
        if (isNaN(bet) || bet > user[0].money || bet <= 0) {
          message.channel.send(coinflipCard.setDescription('Please enter a correct bet or verify that you have enough money for it !'))
        } else {
          const sidesArray = ['head', 'tail', 'h', 't']
          let side
          if (args[1] === undefined)
            side = 'h'
          else
            side = args[1].toLowerCase()

          if (sidesArray.includes(side)) {
            const sideR = Math.round(Math.random())
            switch (sideR) {
              case 0 && ['t', 'tail'].includes(side):
                gg(user, bet)
                coinflipCard.setDescription(`GG ! You won **${bet}** ${emojis.pokecoin.balise}`)
                  .setColor(color.success)
                break
              case 1 && ['h', 'head'].includes(side):
                gg(user, bet)
                coinflipCard.setDescription(`GG ! You won **${bet}** ${emojis.pokecoin.balise}`)
                  .setColor(color.success)
                break
              default:
                rip(user, bet)
                coinflipCard.setDescription(`Rip ! You lost **${bet}** ${emojis.pokecoin.balise}`)
                  .setColor(color.error)
                break
            }
            message.channel.send(coinflipCard.setFooter('PokeCatch Coinflip'))

          } else {
            message.channel.send(coinflipCard.setDescription('Please enter a correct option (head, tail, h or t)'))
          }
        }
      }
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}
