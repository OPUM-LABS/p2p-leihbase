/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "prfhjqt1",
    "name": "max_reservation_days",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove
  collection.schema.removeField("prfhjqt1")

  return dao.saveCollection(collection)
})
