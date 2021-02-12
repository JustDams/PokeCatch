const User = require('../database/user')
const Inventory = require('../database/inventory')
const { emojis, daily, cooldown } = require('../config.json')
const { deleteEntry, getEntries, getCount } = require('../templates/setFun')
let awaitingUser = new Set()

const dailyGifts = (userId, user, pokeballInv, dailyDate, String) => {
  String.push(`You received **x${daily.pokeball}** ${emojis.pokeball.balise}`)
  String.push(`And **x${daily.money}** ${emojis.pokecoin.balise} !`)

  User.updateOne(userId, dailyDate, user.daily_month_count + 1, user.daily_count + 1, user.money + daily.money)
  Inventory.updateCount(userId, emojis.pokeball.id, pokeballInv.count + daily.pokeball)
}

const dailyGiftsReset = (userId, user, pokeballInv, dailyDate, String) => {
  String.push(`You received **x${daily.pokeball}** ${emojis.pokeball.balise}`)
  String.push(`And **x${daily.money}** ${emojis.pokecoin.balise} !`)

  User.updateOne(userId, dailyDate, 1, 1, user.money + daily.money)
  Inventory.updateCount(userId, emojis.pokeball.id, pokeballInv.count + daily.pokeball)
}

const dailyGiftsExtra = (userId, user, pokeballInv, extraBallInv, extraBallCount, extraBallConf, dailyDate, String) => {
  String.push(`You received **x${daily.pokeball}** ${emojis.pokeball.balise}`)
  String.push(`And **x${daily.money}** ${emojis.pokecoin.balise} !`)
  String.push(`Oh ! You found an extra item **x${extraBallCount}** ${extraBallConf.balise} !`)

  User.updateOne(userId, dailyDate, user.daily_month_count + 1, user.daily_count + 1, user.money + daily.money)
  Inventory.updateCount(userId, emojis.pokeball.id, pokeballInv.count + daily.pokeball)
  Inventory.updateCount(userId, extraBallConf.id, extraBallInv.count + extraBallCount)
}

module.exports = {
  name: 'daily',
  aliasses: ['daily'],
  options: '',
  description: 'Get the daily reward',
  type: 'game',
  async execute(message, args) {
    if (getEntries(message.author.id, awaitingUser)) {
      if (getCount(message.author.id, awaitingUser) <= 1) {
        message.reply(`You need to wait ${cooldown * 2 / 1000} seconds after your last \`${message}\``)
        message.delete()
      }
    } else {
      awaitingUser.add({ id: message.author.id, count: 1 })
      const userId = message.author.id
      const dailyDate = new Date(message.createdTimestamp)
      const userArray = await User.get(userId)
      const user = userArray[0]
      const pokeballInvArray = await Inventory.getOne(userId, emojis.pokeball.id)
      const pokeballInv = pokeballInvArray[0]
      const String = []

      // If user.daily_date isn't defined then he never did daily so we output a special message
      if (user.daily_date === undefined || user.daily_date === null) {
        String.push(`You just **started** your daily streak ! GL`)
        dailyGifts(userId, user, pokeballInv, dailyDate, String)
      } else {
        // Else if it defined then he did daily at least 1 time so we check if it was today
        const nextDay = new Date(user.daily_date.getFullYear(), user.daily_date.getMonth(), user.daily_date.getDate() + 1)
        if (user.daily_date.getFullYear() === dailyDate.getFullYear() && user.daily_date.getMonth() === dailyDate.getMonth() && user.daily_date.getDate() === dailyDate.getDate()) {
          String.push('**You already got your daily gifts today, come back tomorrow !**')
          // Then we check if he did !daily the day before for the Streak
        } else if (nextDay.getFullYear() === dailyDate.getFullYear() && nextDay.getMonth() === dailyDate.getMonth() && nextDay.getDate() === dailyDate.getDate()) {
          String.push(`You're on a **${user.daily_count + 1} daily streak**`)

          switch (user.daily_month_count + 1) {
            case 14:
              const superballInvArray = await Inventory.getOne(userId, emojis.superball.id)
              const superballInv = superballInvArray[0]
              dailyGiftsExtra(userId, user, pokeballInv, superballInv, 5, emojis.superball, dailyDate, String)
              break
            case 21:
              const hyperballInvArray = await Inventory.getOne(userId, emojis.hyperball.id)
              const hyperballInv = hyperballInvArray[0]
              dailyGiftsExtra(userId, user, pokeballInv, hyperballInv, 5, emojis.hyperball, dailyDate, String)
              break
            case 31:
              user.daily_month_count = -1
              const masterballInvArray = await Inventory.getOne(userId, emojis.masterball.id)
              const masterballInv = masterballInvArray[0]
              dailyGiftsExtra(userId, user, pokeballInv, masterballInv, 1, emojis.masterball, dailyDate, String)
              break
            default:
              dailyGifts(userId, user, pokeballInv, dailyDate, String)
              break
          }
        } else {
          String.push(`Oh no your daily streak got reset..`)
          dailyGiftsReset(userId, user, pokeballInv, dailyDate, String)
        }
      }
      message.channel.send(String.join('\n'))
    }
    setTimeout(() => {
      awaitingUser = deleteEntry(message.author.id, awaitingUser)
    }, cooldown * 2)
  }
}

