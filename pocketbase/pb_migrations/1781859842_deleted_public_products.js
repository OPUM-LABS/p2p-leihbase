/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("23lng9rcyhwckvp");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "_clone_sKdz",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "nkbfankqkyubdu9",
        "help": "",
        "hidden": false,
        "id": "_clone_mIZY",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "location",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "eq4iy7753ga1h1m",
        "help": "",
        "hidden": false,
        "id": "_clone_pn2s",
        "maxSelect": 2147483647,
        "minSelect": 0,
        "name": "categories",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_Wm6V",
        "maxSelect": 99,
        "maxSize": 5242880,
        "mimeTypes": null,
        "name": "images",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [
          "600x0",
          "1200x0"
        ],
        "type": "file"
      },
      {
        "help": "",
        "hidden": false,
        "id": "_clone_BOBQ",
        "max": null,
        "min": null,
        "name": "deposit",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "convertURLs": false,
        "help": "",
        "hidden": false,
        "id": "_clone_6IPw",
        "maxSize": 0,
        "name": "description",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "editor"
      },
      {
        "cascadeDelete": false,
        "collectionId": "h7plyphsy0mgjpf",
        "help": "",
        "hidden": false,
        "id": "relation3018304271",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "ongoingReservation",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      }
    ],
    "id": "23lng9rcyhwckvp",
    "indexes": [],
    "listRule": "",
    "name": "public_products",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT products.id, products.name, products.location, products.categories, products.images, products.deposit, products.description, reservations.id AS ongoingReservation FROM products LEFT JOIN reservations ON products.id = reservations.product AND reservations.cancelled = FALSE AND DATE(reservations.start) <= DATE('now') AND DATE(reservations.end) >= DATE('now') WHERE products.active = TRUE",
    "viewRule": ""
  });

  return app.save(collection);
})
