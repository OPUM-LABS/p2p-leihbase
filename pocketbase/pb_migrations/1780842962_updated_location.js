/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.manager_locations ~ id",
    "viewRule": "@request.auth.manager_locations ~ id"
  }, collection)

  // remove field
  collection.fields.removeById("sq4yk2iw")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "listRule": "users ~ @request.auth.id",
    "viewRule": "users ~ @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "help": "",
    "hidden": false,
    "id": "sq4yk2iw",
    "maxSelect": 2147483647,
    "minSelect": 0,
    "name": "users",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
