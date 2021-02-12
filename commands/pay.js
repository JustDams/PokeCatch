const User = require('../database/user')
const initUser = require('../templates/initUser')
const { emojis } = require('../config.json')

module.exports = {
  name: 'pay',
  aliasses: ['pay'],
  options: ' [user] [amount]',
  description: 'Give some of your money to another user',
  type: 'game',
  async execute(message, args) {
    if (args.length < 2) {
      message.channel.send(`You need to specify a user and the amount of ${emojis.pokecoin.balise} that you want to give !`)
    } else if (!message.mentions.users.first() || message.mentions.users.first().id === message.author.id) {
      message.channel.send(`You need to specify a user valid !`)
    } else {
      const user = await User.get(message.author.id)
      const amount = parseInt(args[1])
      // Checking that the user can pay the amount entered and that its a valid number
      if (isNaN(amount) || amount <= 0 || user[0].money < amount)
        message.channel.send(`Please enter a valid amount, verify that you have enough money !`)
      else {
        await initUser(message.mentions.users.first().id)
        const target = await User.get(message.mentions.users.first().id)
        // Update the users money
        User.updateOne(user[0].discord_id, user[0].daily_date, user[0].daily_month_count, user[0].daily_count, user[0].money - Math.floor(amount))
        User.updateOne(target[0].discord_id, target[0].daily_date, target[0].daily_month_count, target[0].daily_count, target[0].money + Math.floor(amount))
        message.channel.send(`You sent **${amount}** ${emojis.pokecoin.balise} to **${message.mentions.users.first().username}**`)
      }
    }
  }
}