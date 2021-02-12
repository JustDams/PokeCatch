const Pokedex = require('./model/pokedexModel')

// Return the pokedex (list of pokemons)
const get = async (userId) => {
  const pokedex = await Pokedex.find({ discord_id: userId }, { _id: 0, __v: 0 }).sort('pokemon_name').exec()
  return pokedex
}

// Check if we already caught the pokemon
const exists = async (userId, pokemonName) => {
  const pokedex = await getOne(userId, pokemonName)
  if (pokedex.length >= 1)
    return true
  else
    return false
}

// Find a pokemon
const getOne = async (userId, pokemonName) => {
  const pokedex = await Pokedex.find({ discord_id: userId, pokemon_name: pokemonName }, { _id: 0, __v: 0 }).exec()
  return pokedex
}

// Update the amount of a pokemon
const updateCount = async (userId, pokemonName, newCount) => {
  Pokedex.updateOne({ discord_id: userId, pokemon_name: pokemonName }, { count: newCount }, { _id: 0, __v: 0 }).exec()
}

// Add a new pokemon to the pokedex
const add = (userId, pokemonName) => {
  const newPokemon = new Pokedex({
    discord_id: userId,
    pokemon_name: pokemonName,
    count: 1
  })

  newPokemon.save((err) => {
    if (err) console.error(err)
  })
}

module.exports = {
  get,
  exists,
  updateCount,
  getOne,
  add
}
