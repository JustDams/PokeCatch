const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  discord_id: String,
  daily_date: Date,
  daily_month_count: Number,
  daily_count: Number,
  money: Number
})

module.exports = mongoose.model('users', userSchema)
