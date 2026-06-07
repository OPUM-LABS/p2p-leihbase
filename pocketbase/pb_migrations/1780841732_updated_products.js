/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.manager_locations ~ location.id",
    "deleteRule": "@request.auth.manager_locations ~ location.id",
    "listRule": "@request.auth.manager_locations ~ location.id",
    "updateRule": "@request.auth.manager_locations ~ location.id",
    "viewRule": "@request.auth.manager_locations ~ location.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  // update collection data
  unmarshal({
    "createRule": "location.users ~ @request.auth.id",
    "deleteRule": "location.users ~ @request.auth.id",
    "listRule": "location.users ~ @request.auth.id",
    "updateRule": "location.users ~ @request.auth.id",
    "viewRule": "location.users ~ @request.auth.id"
  }, collection)

  return app.save(collection)
})
