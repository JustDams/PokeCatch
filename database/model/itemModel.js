const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
  item_id: String,
  item_name: String,
  price: Number
})

module.exports = mongoose.model('item', itemSchema)