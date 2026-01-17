/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "authAlert": {
      "emailTemplate": {
        "body": "<p>Hallo,</p>\n<p>wir haben eine Anmeldung bei deinem {APP_NAME}-Konto von einem neuen Standort aus festgestellt.</p>\n<p>Falls du das warst, kannst du diese E-Mail ignorieren.</p>\n<p><strong>Falls du das nicht warst, solltest du dein {APP_NAME}-Konto-Passwort sofort ändern, um den Zugriff von allen anderen Standorten zu widerrufen.</strong></p>\n<p>\n  Viele Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>",
        "subject": "Anmeldung von einem neuen Standort"
      }
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "authAlert": {
      "emailTemplate": {
        "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Login from a new location"
      }
    }
  }, collection)

  return app.save(collection)
})
