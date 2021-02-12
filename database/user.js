const User = require('./model/userModel')

const create = async (userId) => {
  const new_user = new User({
    discord_id: userId,
    daily_date: undefined,
    daily_month_count: 0,
    daily_count: 0,
    money: 500
  })

  new_user.save((err) => {
    if (err) console.error(err)
  })
}

const updateOne = async (userId, dailyDate, dailyMonthCount, dailyCount, money) => {
  User.updateOne({ discord_id: userId }, { daily_date: dailyDate, daily_month_count: dailyMonthCount, daily_count: dailyCount, money: money }).exec()
}

const get = async (userId) => {
  const user = await User.find({ discord_id: userId }).exec()
  return user
}

const exists = async (userId) => {
  const user = await User.find({ discord_id: userId }).exec()
  if (user.length >= 1)
    return true
  else
    return false
}

module.exports = {
  create,
  updateOne,
  get,
  exists
}