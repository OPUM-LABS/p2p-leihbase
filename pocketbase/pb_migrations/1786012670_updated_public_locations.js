/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, created, updated FROM location"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_Qy5Z")

  // remove field
  collection.fields.removeById("_clone_oLUp")

  // remove field
  collection.fields.removeById("_clone_JgyG")

  // remove field
  collection.fields.removeById("_clone_Z4lx")

  // remove field
  collection.fields.removeById("_clone_IHVz")

  // remove field
  collection.fields.removeById("_clone_1gha")

  // remove field
  collection.fields.removeById("_clone_lXII")

  // remove field
  collection.fields.removeById("_clone_Qqfe")

  // remove field
  collection.fields.removeById("_clone_ps1G")

  // remove field
  collection.fields.removeById("_clone_1eNw")

  // remove field
  collection.fields.removeById("_clone_UzpH")

  // remove field
  collection.fields.removeById("_clone_oE5K")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_JLOv",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_AoGE",
    "max": 0,
    "min": 0,
    "name": "address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "_clone_F9O2",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "_clone_dWJx",
    "maxSize": 0,
    "name": "description",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_x1Te",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_DzPL",
    "name": "active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_1XhQ",
    "maxSize": 2000000,
    "name": "opening_hours",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_3Vf6",
    "maxSize": 2000000,
    "name": "links",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_2Fu9",
    "max": null,
    "min": null,
    "name": "max_reservation_days",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "single: allow one active or future reservation per product; multiple: allow multiple active or future reservations per product (in different time-spans)",
    "hidden": false,
    "id": "_clone_QfxJ",
    "maxSelect": 0,
    "name": "reservation_system",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "single",
      "multiple"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "Maximum number of days in the future of the start date of a reservation",
    "hidden": false,
    "id": "_clone_MGfk",
    "max": null,
    "min": 0,
    "name": "reservation_start_limit",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "_clone_g35E",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "_clone_icRQ",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, created, updated FROM location"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_Qy5Z",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_oLUp",
    "max": 0,
    "min": 0,
    "name": "address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "_clone_JgyG",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "_clone_Z4lx",
    "maxSize": 0,
    "name": "description",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_IHVz",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_1gha",
    "name": "active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_lXII",
    "maxSize": 2000000,
    "name": "opening_hours",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_Qqfe",
    "maxSize": 2000000,
    "name": "links",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_ps1G",
    "max": null,
    "min": null,
    "name": "max_reservation_days",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "single: allow one active or future reservation per product; multiple: allow multiple active or future reservations per product (in different time-spans)",
    "hidden": false,
    "id": "_clone_1eNw",
    "maxSelect": 0,
    "name": "reservation_system",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "single",
      "multiple"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "_clone_UzpH",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "_clone_oE5K",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("_clone_JLOv")

  // remove field
  collection.fields.removeById("_clone_AoGE")

  // remove field
  collection.fields.removeById("_clone_F9O2")

  // remove field
  collection.fields.removeById("_clone_dWJx")

  // remove field
  collection.fields.removeById("_clone_x1Te")

  // remove field
  collection.fields.removeById("_clone_DzPL")

  // remove field
  collection.fields.removeById("_clone_1XhQ")

  // remove field
  collection.fields.removeById("_clone_3Vf6")

  // remove field
  collection.fields.removeById("_clone_2Fu9")

  // remove field
  collection.fields.removeById("_clone_QfxJ")

  // remove field
  collection.fields.removeById("_clone_MGfk")

  // remove field
  collection.fields.removeById("_clone_g35E")

  // remove field
  collection.fields.removeById("_clone_icRQ")

  return app.save(collection)
})
