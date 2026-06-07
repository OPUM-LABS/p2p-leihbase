/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": true,
    "id": "select1466534506",
    "maxSelect": 0,
    "name": "role",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "user",
      "manager",
      "admin"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "nkbfankqkyubdu9",
    "help": "",
    "hidden": true,
    "id": "relation1573750147",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "manager_locations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update collection data
  unmarshal({
    "listRule": "id = @request.auth.id || (@request.auth.role = \"manager\" || @request.auth.role = \"admin\")",
    "viewRule": "id = @request.auth.id || (@request.auth.role = \"manager\" || @request.auth.role = \"admin\")"
  }, collection)

  app.save(collection)

  // Set default user 'role' and 'manager_locations'
  const users = app.findAllRecords("users")
  const locations = app.findAllRecords("location")
  users.forEach(user => {
    const l = locations.filter(l => l.get('users').includes(user.id));
    user.set('role', l.length > 0 ? 'manager' : 'user');
    user.set('manager_locations', l.map(l => l.id))
    app.save(user);
  });

}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("relation1573750147")

  // update collection data
  unmarshal({
    "listRule": "id = @request.auth.id || (@collection.reservations.user ?= id && @collection.reservations.location.users ?~ @request.auth.id)",
    "viewRule": "id = @request.auth.id || (@collection.reservations.user ?= id && @collection.reservations.location.users ?~ @request.auth.id)"
  }, collection)

  return app.save(collection)
})
