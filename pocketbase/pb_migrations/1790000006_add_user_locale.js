/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");

  collection.fields.add(new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "user_locale",
    "max": 10,
    "min": 0,
    "name": "locale",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  app.save(collection);

  // Set default 'de' for any existing users without a locale set
  const users = app.findAllRecords("users");
  users.forEach((user) => {
    if (!user.getString("locale")) {
      user.set("locale", "de");
      app.save(user);
    }
  });
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");
  collection.fields.removeById("user_locale");
  return app.save(collection);
});

