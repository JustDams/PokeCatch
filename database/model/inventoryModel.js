const mongoose = require('mongoose')

const inventorySchema = mongoose.Schema({
  discord_id: String,
  item_id: String,
  count: Number
})

module.exports = mongoose.model('inventory', inventorySchema)