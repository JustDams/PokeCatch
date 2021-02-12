const Market = require('./model/marketModel')

const create = (marketId, userId, pokemonName, price) => {
  const new_market = new Market({
    market_id: marketId,
    discord_id: userId,
    pokemon_name: pokemonName,
    price: price
  })

  new_market.save((err) => {
    if (err) console.error(err)
  })
}

const getPokemons = async (pokemonName) => {
  const pokemons = await Market.find({ pokemon_name: pokemonName }).exec()
  return pokemons
}

const getOne = async (marketId) => {
  const pokemon = await Market.find({ market_id: marketId }).exec()
  return pokemon
}

const getMyPokemons = async (userId) => {
  const pokemons = await Market.find({ discord_id: userId }).exec()
  return pokemons
}

const exists = async (marketId) => {
  const pokemon = await Market.find({ market_id: marketId }).exec()
  if (pokemon.length >= 1)
    return true
  else
    return false
}

const deleteOne = async (marketId) => {
  await Market.deleteOne({ market_id: marketId })
}

const distinct = async () => {
  const pokemons = await Market.distinct('pokemon_name').exec()
  return pokemons
}

module.exports = {
  create,
  getPokemons,
  deleteOne,
  distinct,
  exists,
  getMyPokemons,
  getOne
}