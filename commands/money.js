const User = require('../database/user')
const { emojis, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()

module.exports = {
  name: 'money',
  aliasses: ['money', 'balance', 'bal'],
  options: '',
  description: 'Get the daily reward',
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
      const userArray = await User.get(userId)
      const user = userArray[0]
      message.channel.send(`You have **${user.money}** ${emojis.pokecoin.balise} !`)
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}