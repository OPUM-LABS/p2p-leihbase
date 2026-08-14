/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  // update collection data
  unmarshal({
    "listRule": "active = true || (@request.auth.manager_locations ~ location.id || @request.auth.role = \"admin\")",
    "viewRule": "active = true || (@request.auth.manager_locations ~ location.id || @request.auth.role = \"admin\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.manager_locations ~ location.id",
    "viewRule": "@request.auth.manager_locations ~ location.id"
  }, collection)

  return app.save(collection)
})
