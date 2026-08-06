/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(14, new Field({
    "help": "Furthest in advance a reservation can begin, in days (0=endless).",
    "hidden": false,
    "id": "number3333369805",
    "max": null,
    "min": 0,
    "name": "reservation_start_limit",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("number3333369805")

  return app.save(collection)
})
