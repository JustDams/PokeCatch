const Item = require('./model/itemModel')
const { emojis } = require('../config.json')

const create = (itemId, itemName, price) => {
  const newItem = new Item({
    item_id: itemId,
    item_name: itemName,
    price: price,
  })

  newItem.save((err) => {
    if (err) console.error(err)
  })
}

const createItems = () => {
  create(emojis.pokeball.id, emojis.pokeball.name, emojis.pokeball.price)
  create(emojis.superball.id, emojis.superball.name, emojis.superball.price)
  create(emojis.hyperball.id, emojis.hyperball.name, emojis.hyperball.price)
  create(emojis.masterball.id, emojis.masterball.name, emojis.masterball.price)
  console.log('📖 Items added !')
}

const drop = () => {
  Item.deleteMany({}, () => {
    console.log('🔥 Items collection dropped')
  }).then(() => {
    createItems()
  })
}

const getOne = (itemId) => {
  const item = Item.find({ item_id: itemId }).exec()
  return item
}

const get = () => {
  const items = Item.find({}).exec()
  return items
}

module.exports = {
  drop,
  getOne,
  get
}