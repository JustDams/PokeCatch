const mongoose = require('mongoose')

const marketSchema = mongoose.Schema({
  market_id: String,
  discord_id: String,
  pokemon_name: String,
  price: Number,
})

module.exports = mongoose.model('market', marketSchema)