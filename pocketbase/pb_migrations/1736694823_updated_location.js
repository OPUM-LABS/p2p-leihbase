/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "skhisuge",
    "name": "email",
    "type": "email",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove
  collection.schema.removeField("skhisuge")

  return dao.saveCollection(collection)
})
