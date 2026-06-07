/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("h7plyphsy0mgjpf")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = @request.body.user || @request.auth.manager_locations ~ location.id",
    "deleteRule": "@request.auth.manager_locations ~ location.id",
    "listRule": "user = @request.auth.id || @request.auth.manager_locations ~ location.id",
    "updateRule": "user = @request.auth.id || @request.auth.manager_locations ~ location.id",
    "viewRule": "user = @request.auth.id || @request.auth.manager_locations ~ location.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("h7plyphsy0mgjpf")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.id = @request.body.user || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id))",
    "deleteRule": "@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id",
    "listRule": "user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id)",
    "updateRule": "(user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id))",
    "viewRule": "user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id)"
  }, collection)

  return app.save(collection)
})
