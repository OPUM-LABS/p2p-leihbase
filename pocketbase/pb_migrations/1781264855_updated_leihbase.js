/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p")

  // remove field
  collection.fields.removeById("5pg1pkpi")

  // remove field
  collection.fields.removeById("ltimpo7r")

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "url416074236",
    "name": "privacy_policy_link",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "json4222690215",
    "maxSize": 0,
    "name": "footer_links",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("gu30h2m0sajzw6p")

  // add field
  collection.fields.addAt(1, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "5pg1pkpi",
    "maxSize": 0,
    "name": "imprint",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "ltimpo7r",
    "maxSize": 0,
    "name": "privacy_policy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // remove field
  collection.fields.removeById("url416074236")

  // remove field
  collection.fields.removeById("json4222690215")

  return app.save(collection)
})
