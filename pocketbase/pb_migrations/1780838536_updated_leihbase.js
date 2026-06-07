/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p")

  // add field
  collection.fields.addAt(2, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "editor1843675174",
    "maxSize": 0,
    "name": "description",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p")

  // remove field
  collection.fields.removeById("editor1843675174")

  return app.save(collection)
})
