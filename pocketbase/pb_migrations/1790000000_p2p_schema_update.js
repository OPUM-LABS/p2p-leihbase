/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Update Users Collection (_pb_users_auth_)
  const usersCollection = app.findCollectionByNameOrId("_pb_users_auth_");

  usersCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_city",
    "max": 100,
    "min": 0,
    "name": "city",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  usersCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_postal_code",
    "max": 20,
    "min": 0,
    "name": "postal_code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  usersCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_address",
    "max": 255,
    "min": 0,
    "name": "address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  usersCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_nickname",
    "max": 100,
    "min": 0,
    "name": "nickname",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  usersCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_bio",
    "max": 1000,
    "min": 0,
    "name": "bio",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  unmarshal({
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''"
  }, usersCollection);

  app.save(usersCollection);

  // 2. Update Products Collection (oxgh1la125efx04)
  const productsCollection = app.findCollectionByNameOrId("oxgh1la125efx04");

  // Make location optional if present
  try {
    const locField = productsCollection.fields.getById("2zarsrph");
    if (locField) {
      locField.required = false;
    }
  } catch (e) {}

  productsCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "prod_city",
    "max": 100,
    "min": 0,
    "name": "city",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  productsCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "prod_postal_code",
    "max": 20,
    "min": 0,
    "name": "postal_code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  productsCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "prod_approx_location",
    "max": 255,
    "min": 0,
    "name": "approx_location_note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  productsCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "prod_pickup_address",
    "max": 255,
    "min": 0,
    "name": "pickup_address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  productsCollection.fields.add(new Field({
    "hidden": false,
    "id": "prod_max_duration",
    "max": 365,
    "min": 1,
    "name": "max_duration_days",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  productsCollection.fields.add(new Field({
    "hidden": false,
    "id": "prod_price_per_day",
    "max": null,
    "min": 0,
    "name": "price_per_day",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  productsCollection.fields.add(new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "prod_terms",
    "maxSize": 0,
    "name": "terms_condition",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }));

  unmarshal({
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id = user.id || @request.auth.role = 'admin'",
    "deleteRule": "@request.auth.id = user.id || @request.auth.role = 'admin'",
    "listRule": "active = true || @request.auth.id = user.id || @request.auth.role = 'admin'",
    "viewRule": "active = true || @request.auth.id = user.id || @request.auth.role = 'admin'"
  }, productsCollection);

  app.save(productsCollection);

  // 3. Update Reservations Collection (h7plyphsy0mgjpf)
  const reservationsCollection = app.findCollectionByNameOrId("h7plyphsy0mgjpf");

  reservationsCollection.fields.add(new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "res_owner",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "owner",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }));

  reservationsCollection.fields.add(new Field({
    "hidden": false,
    "id": "res_status",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "requested",
      "accepted",
      "declined",
      "started",
      "ended",
      "cancelled"
    ]
  }));

  reservationsCollection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "res_handover_address",
    "max": 255,
    "min": 0,
    "name": "handover_address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  reservationsCollection.fields.add(new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "res_owner_note",
    "maxSize": 0,
    "name": "owner_note",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }));

  unmarshal({
    "createRule": "@request.auth.id != '' && @request.auth.id = @request.body.user",
    "updateRule": "@request.auth.id = user.id || @request.auth.id = owner.id || @request.auth.role = 'admin'",
    "deleteRule": "@request.auth.id = user.id || @request.auth.id = owner.id || @request.auth.role = 'admin'",
    "listRule": "@request.auth.id = user.id || @request.auth.id = owner.id || @request.auth.role = 'admin'",
    "viewRule": "@request.auth.id = user.id || @request.auth.id = owner.id || @request.auth.role = 'admin'"
  }, reservationsCollection);

  app.save(reservationsCollection);
}, (app) => {
  // Rollback logic
  const usersCollection = app.findCollectionByNameOrId("_pb_users_auth_");
  usersCollection.fields.removeById("user_city");
  usersCollection.fields.removeById("user_postal_code");
  usersCollection.fields.removeById("user_address");
  usersCollection.fields.removeById("user_nickname");
  usersCollection.fields.removeById("user_bio");
  app.save(usersCollection);

  const productsCollection = app.findCollectionByNameOrId("oxgh1la125efx04");
  productsCollection.fields.removeById("prod_city");
  productsCollection.fields.removeById("prod_postal_code");
  productsCollection.fields.removeById("prod_approx_location");
  productsCollection.fields.removeById("prod_pickup_address");
  productsCollection.fields.removeById("prod_max_duration");
  productsCollection.fields.removeById("prod_price_per_day");
  productsCollection.fields.removeById("prod_terms");
  app.save(productsCollection);

  const reservationsCollection = app.findCollectionByNameOrId("h7plyphsy0mgjpf");
  reservationsCollection.fields.removeById("res_owner");
  reservationsCollection.fields.removeById("res_status");
  reservationsCollection.fields.removeById("res_handover_address");
  reservationsCollection.fields.removeById("res_owner_note");
  app.save(reservationsCollection);
});
