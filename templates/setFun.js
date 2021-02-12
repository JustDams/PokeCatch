const getEntries = (entryId, set) => {
  let inSet = false
  set.forEach(e => {
    if (e.id === entryId)
      inSet = true
  })
  return inSet
}

const getCount = (entryId, set) => {
  let count
  set.forEach(e => {
    if (e.id === entryId) {
      count = e.count
      e.count++
    }
  })
  return count
}

const deleteEntry = (entryId, set) => {
  set.forEach(e => {
    if (e.id === entryId)
      set.delete(e)
  })
  return set
}

module.exports = {
  getEntries,
  getCount,
  deleteEntry
}