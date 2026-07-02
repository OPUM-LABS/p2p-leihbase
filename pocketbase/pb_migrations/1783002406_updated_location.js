/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("u1rvkp14")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "u1rvkp14",
    "maxSize": 2000000,
    "name": "config",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
