/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const snapshot = [
    {
      "createRule": "location.users ~ @request.auth.id",
      "deleteRule": "location.users ~ @request.auth.id",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "aumrbvfp",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "jvh1us5t",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "iht7wddv",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "user",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "nkbfankqkyubdu9",
          "hidden": false,
          "id": "2zarsrph",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "location",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "eq4iy7753ga1h1m",
          "hidden": false,
          "id": "u3csmld8",
          "maxSelect": 2147483647,
          "minSelect": 0,
          "name": "categories",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "nqyuzri6",
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
          "hidden": false,
          "id": "iilop8q4",
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
          "hidden": false,
          "id": "3mnrztyl",
          "maxSize": 0,
          "name": "description",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "lvcivpi8",
          "maxSize": 0,
          "name": "notes",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "oxgh1la125efx04",
      "indexes": [],
      "listRule": "location.users ~ @request.auth.id",
      "name": "products",
      "system": false,
      "type": "base",
      "updateRule": "location.users ~ @request.auth.id",
      "viewRule": "location.users ~ @request.auth.id"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "c3slxav7",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "0tkcrxxu",
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
          "autogeneratePattern": "",
          "hidden": false,
          "id": "owkywjes",
          "max": 0,
          "min": 0,
          "name": "address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "jmtu17co",
          "maxSize": 0,
          "name": "description",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "sq4yk2iw",
          "maxSelect": 2147483647,
          "minSelect": 0,
          "name": "users",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "jfnytcre",
          "max": 0,
          "min": 0,
          "name": "slug",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "y6julwpt",
          "maxSize": 2000000,
          "name": "opening_hours",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "jt5rqoxb",
          "maxSize": 2000000,
          "name": "links",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "ntku6af8",
          "maxSize": 2000000,
          "name": "notifications",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "aj9f4n4m",
          "maxSize": 0,
          "name": "note_default",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "hidden": false,
          "id": "u1rvkp14",
          "maxSize": 2000000,
          "name": "config",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "skhisuge",
          "name": "email",
          "onlyDomains": null,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "email"
        },
        {
          "hidden": false,
          "id": "prfhjqt1",
          "max": null,
          "min": null,
          "name": "max_reservation_days",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "nkbfankqkyubdu9",
      "indexes": [],
      "listRule": "users ~ @request.auth.id",
      "name": "location",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": "users ~ @request.auth.id"
    },
    {
      "createRule": "(@request.auth.id = @request.body.user || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id))",
      "deleteRule": "@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "vrveuxdv",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "user",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "oxgh1la125efx04",
          "hidden": false,
          "id": "glvplwbk",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "product",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "nkbfankqkyubdu9",
          "hidden": false,
          "id": "gvytuhlf",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "location",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "p3lnaxtn",
          "max": "",
          "min": "",
          "name": "start",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "gyc56szl",
          "max": "",
          "min": "",
          "name": "end",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "y8aecis8",
          "max": 0,
          "min": 0,
          "name": "message",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "kv779sxd",
          "maxSize": 0,
          "name": "note",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "hidden": false,
          "id": "knq3clyw",
          "name": "send_confirmation",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "wdukhdwl",
          "name": "started",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "rhcvyxrc",
          "name": "ended",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "yrxfsdwf",
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
          "hidden": false,
          "id": "aycdkkic",
          "name": "cancelled",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "42btief7",
          "maxSelect": 3,
          "name": "sent_emails",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "confirmation",
            "start_reminder",
            "end_reminder"
          ]
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "h7plyphsy0mgjpf",
      "indexes": [],
      "listRule": "user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id)",
      "name": "reservations",
      "system": false,
      "type": "base",
      "updateRule": "(user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id))",
      "viewRule": "user = @request.auth.id || (@collection.location.id ?= location && @collection.location.users ?~ @request.auth.id)"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "",
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
          "cascadeDelete": false,
          "collectionId": "oxgh1la125efx04",
          "hidden": false,
          "id": "_clone_b3SN",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "product",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "_clone_RbRV",
          "max": "",
          "min": "",
          "name": "start",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "_clone_fMf7",
          "max": "",
          "min": "",
          "name": "end",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        }
      ],
      "id": "qqus3eo9ya7bars",
      "indexes": [],
      "listRule": "",
      "name": "public_reservations",
      "system": false,
      "type": "view",
      "updateRule": null,
      "viewQuery": "SELECT id, product, start, end FROM reservations WHERE cancelled IS FALSE",
      "viewRule": ""
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
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
          "hidden": false,
          "id": "2jkk89vg",
          "max": 0,
          "min": 0,
          "name": "name_de",
          "pattern": "",
          "presentable": true,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "m1c5dm4h",
          "max": 0,
          "min": 0,
          "name": "name_en",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "eq4iy7753ga1h1m",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_7uhrwww` ON `categories` (`name_de`)",
        "CREATE UNIQUE INDEX `idx_D3rTwd7` ON `categories` (`name_en`)"
      ],
      "listRule": "",
      "name": "categories",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": ""
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "",
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
          "hidden": false,
          "id": "_clone_xr8Q",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "nkbfankqkyubdu9",
          "hidden": false,
          "id": "_clone_GpGb",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "location",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "eq4iy7753ga1h1m",
          "hidden": false,
          "id": "_clone_uwAq",
          "maxSelect": 2147483647,
          "minSelect": 0,
          "name": "categories",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "_clone_Ulqn",
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
          "hidden": false,
          "id": "_clone_y7Kh",
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
          "hidden": false,
          "id": "_clone_0fMY",
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
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": true
      },
      "authRule": "",
      "authToken": {
        "duration": 1209600
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": "",
      "deleteRule": "id = @request.auth.id",
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 10,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9_]{50}",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": null,
          "presentable": false,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "autogeneratePattern": "users[0-9]{6}",
          "hidden": false,
          "id": "text4166911607",
          "max": 150,
          "min": 3,
          "name": "username",
          "pattern": "^[\\w][\\w\\.\\-]*$",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "users_name",
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
          "hidden": false,
          "id": "users_avatar",
          "maxSelect": 1,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          "name": "avatar",
          "presentable": false,
          "protected": false,
          "required": false,
          "system": false,
          "thumbs": null,
          "type": "file"
        },
        {
          "hidden": false,
          "id": "e94fy4f7",
          "name": "terms",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "fileToken": {
        "duration": 120
      },
      "id": "_pb_users_auth_",
      "indexes": [
        "CREATE UNIQUE INDEX `__pb_users_auth__username_idx` ON `users` (username COLLATE NOCASE)",
        "CREATE UNIQUE INDEX `__pb_users_auth__email_idx` ON `users` (`email`) WHERE `email` != ''",
        "CREATE UNIQUE INDEX `__pb_users_auth__tokenKey_idx` ON `users` (`tokenKey`)"
      ],
      "listRule": "id = @request.auth.id || (@collection.reservations.user ?= id && @collection.reservations.location.users ?~ @request.auth.id)",
      "manageRule": null,
      "mfa": {
        "duration": 1800,
        "enabled": false,
        "rule": ""
      },
      "name": "users",
      "oauth2": {
        "enabled": false,
        "mappedFields": {
          "avatarURL": "",
          "id": "",
          "name": "",
          "username": "username"
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email",
          "username"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": false,
      "type": "auth",
      "updateRule": "id = @request.auth.id",
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 604800
      },
      "viewRule": "id = @request.auth.id || (@collection.reservations.user ?= id && @collection.reservations.location.users ?~ @request.auth.id)"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "5pg1pkpi",
          "maxSize": 0,
          "name": "imprint",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "ohbrtpwk",
          "max": 0,
          "min": 0,
          "name": "contact_link",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "ltimpo7r",
          "maxSize": 0,
          "name": "privacy_policy",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "sgcdw1fx",
          "max": 0,
          "min": 0,
          "name": "style",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "sqku4b6q",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "gu30h2m0sajzw6p",
      "indexes": [],
      "listRule": "",
      "name": "leihbase",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": ""
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "",
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
          "hidden": false,
          "id": "_clone_YfWv",
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
          "autogeneratePattern": "",
          "hidden": false,
          "id": "_clone_J9G2",
          "max": 0,
          "min": 0,
          "name": "address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "_clone_EwMA",
          "name": "email",
          "onlyDomains": null,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "email"
        },
        {
          "convertURLs": false,
          "hidden": false,
          "id": "_clone_eEa1",
          "maxSize": 0,
          "name": "description",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "editor"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "_clone_N3i9",
          "max": 0,
          "min": 0,
          "name": "slug",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "_clone_1Xpk",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "_clone_ykWB",
          "maxSize": 2000000,
          "name": "opening_hours",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "_clone_Ck8A",
          "maxSize": 2000000,
          "name": "links",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "_clone_0dkJ",
          "max": null,
          "min": null,
          "name": "max_reservation_days",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "_clone_fue9",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "_clone_TXBR",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "forvpmnark8rtoz",
      "indexes": [],
      "listRule": "",
      "name": "public_locations",
      "system": false,
      "type": "view",
      "updateRule": null,
      "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, created, updated FROM location",
      "viewRule": ""
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": true
      },
      "authRule": "",
      "authToken": {
        "duration": 1209600
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": null,
      "deleteRule": null,
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 0,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9]{50}",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": null,
          "presentable": false,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "fileToken": {
        "duration": 120
      },
      "id": "pbc_3142635823",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey_pbc_3142635823` ON `_superusers` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email_pbc_3142635823` ON `_superusers` (`email`) WHERE `email` != ''"
      ],
      "listRule": null,
      "manageRule": null,
      "mfa": {
        "duration": 1800,
        "enabled": false,
        "rule": ""
      },
      "name": "_superusers",
      "oauth2": {
        "enabled": false,
        "mappedFields": {
          "avatarURL": "",
          "id": "",
          "name": "",
          "username": ""
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": true,
      "type": "auth",
      "updateRule": null,
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 259200
      },
      "viewRule": null
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
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
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text2462348188",
          "max": 0,
          "min": 0,
          "name": "provider",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1044722854",
          "max": 0,
          "min": 0,
          "name": "providerId",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2281828961",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_externalAuths_record_provider` ON `_externalAuths` (collectionRef, recordRef, provider)",
        "CREATE UNIQUE INDEX `idx_externalAuths_collection_provider` ON `_externalAuths` (collectionRef, provider, providerId)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_externalAuths",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
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
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1582905952",
          "max": 0,
          "min": 0,
          "name": "method",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2279338944",
      "indexes": [
        "CREATE INDEX `idx_mfas_collectionRef_recordRef` ON `_mfas` (collectionRef,recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_mfas",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
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
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 8,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 0,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "",
          "hidden": true,
          "id": "text3866985172",
          "max": 0,
          "min": 0,
          "name": "sentTo",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_1638494021",
      "indexes": [
        "CREATE INDEX `idx_otps_collectionRef_recordRef` ON `_otps` (collectionRef, recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_otps",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
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
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text4228609354",
          "max": 0,
          "min": 0,
          "name": "fingerprint",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_4275539003",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_authOrigins_unique_pairs` ON `_authOrigins` (collectionRef, recordRef, fingerprint)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_authOrigins",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    }
  ];

  return app.importCollections(snapshot, false);
}, (app) => {
  return null;
})
