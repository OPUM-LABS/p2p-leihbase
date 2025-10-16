/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  collection.createRule = "location.users ~ @request.auth.id"
  collection.updateRule = "location.users ~ @request.auth.id"
  collection.deleteRule = "location.users ~ @request.auth.id"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
