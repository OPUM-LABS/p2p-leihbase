/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p"); // leihbase

  if (!collection.fields.getByName("logo_url")) {
    collection.fields.add(new Field({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_leihbase_logo_url",
      "max": 0,
      "min": 0,
      "name": "logo_url",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    }));
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
  try {
    collection.fields.removeById("text_leihbase_logo_url");
    return app.save(collection);
  } catch (e) { }
});

