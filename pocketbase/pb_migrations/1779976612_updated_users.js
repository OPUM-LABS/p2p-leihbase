/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hallo,</p>\n<p>vielen Dank, dass du dich bei {APP_NAME} angemeldet hast.</p>\n<p>Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Bestätigen</a>\n</p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hallo,</p>\n<p>vielen Dank, dass du dich bei {APP_NAME} angemeldet hast.</p>\n<p>Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Bestätigen</a>\n</p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>"
    }
  }, collection)

  return app.save(collection)
})
