/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(13, new Field({
    "help": "single: allow one active or future reservation per product; multiple: allow multiple active or future reservations per product (in different time-spans)",
    "hidden": false,
    "id": "select2176604176",
    "maxSelect": 0,
    "name": "reservation_system",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "single",
      "multiple"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("select2176604176")

  return app.save(collection)
})
