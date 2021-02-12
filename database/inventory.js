const Inventory = require('./model/inventoryModel')

const get = async (userId) => {
  const inv = await Inventory.find({ discord_id: userId }).exec()
  return inv
}

const getOne = async (userId, itemId) => {
  const inv = await Inventory.find({ discord_id: userId, item_id: itemId }).exec()
  return inv
}

const whereNotNull = async (userId) => {
  const inv = await Inventory.find({ discord_id: userId, count: { $gte: 1 } }).exec()
  return inv
}

const updateCount = (userId, itemId, count) => {
  Inventory.updateOne({ discord_id: userId, item_id: itemId }, { count: count }).exec()
}

const create = (userId, itemId, count) => {
  const new_inv = new Inventory({
    discord_id: userId,
    item_id: itemId,
    count: count
  })

  new_inv.save((err) => {
    if (err) console.error(err)
  })
}

const exists = async (userId, itemId) => {
  const inv = await getOne(userId, itemId)
  if (inv.length >= 1)
    return true
  else
    return false
}

module.exports = {
  get,
  getOne,
  updateCount,
  create,
  exists,
  whereNotNull
}