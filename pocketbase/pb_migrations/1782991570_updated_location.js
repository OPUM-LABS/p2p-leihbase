/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\"",
    "updateRule": "@request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "createRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
