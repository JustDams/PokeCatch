const User = require('../database/user')
const Inventory = require('../database/inventory')
const Item = require('../database/item')
const { emojis } = require('../config.json')

module.exports = async (userId) => {
  const items = await Item.get()
  if (!await User.exists(userId))
    User.create(userId)
  for (const i of items)
    if (!await Inventory.exists(userId, i.item_id))
      if (![emojis.masterball.id, emojis.hyperball.id].includes(i.item_id))
        Inventory.create(userId, i.item_id, 10)
      else
        Inventory.create(userId, i.item_id, 0)
}
