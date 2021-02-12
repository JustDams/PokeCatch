const mongoose = require('mongoose')

const pokedexSchema = mongoose.Schema({
  discord_id: String,
  pokemon_name: String,
  count: Number
})

module.exports = mongoose.model('pokedex', pokedexSchema)
