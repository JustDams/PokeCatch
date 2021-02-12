const { cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()

module.exports = {
  name: 'ping',
  aliasses: ['ping'],
  options: '',
  description: 'Ping command',
  type: 'system',
  execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      message.channel.send('*pinging...*').then(resultMessage => {
        const ping = resultMessage.createdTimestamp - message.createdTimestamp
        resultMessage.edit(`🏓 Pong (respond in ${ping}ms)`)
      })
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown)
  }
}
