/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "authAlert": {
      "emailTemplate": {
        "body": "<p>Hallo,</p>\n<p>wir haben eine Anmeldung bei deinem {APP_NAME}-Konto von einem neuen Standort aus festgestellt.</p>\n<p>Falls du das warst, kannst du diese E-Mail ignorieren.</p>\n<p><strong>Falls du das nicht warst, solltest du dein {APP_NAME}-Konto-Passwort sofort ändern, um den Zugriff von allen anderen Standorten zu widerrufen.</strong></p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>",
        "subject": "Anmeldung von einem neuen Standort"
      }
    },
    "resetPasswordTemplate": {
      "body": "<p>Hallo,</p>\n<p>klicke auf den Button unten, um dein Passwort zurückzusetzen.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Passwort zurücksetzen</a>\n</p>\n<p><i>Falls du keine Passwortrücksetzung angefordert hast, kannst du diese E-Mail ignorieren.</i></p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>",
      "subject": "Setze dein {APP_NAME}-Passwort zurück"
    },
    "verificationTemplate": {
      "body": "<p>Hallo,</p>\n<p>vielen Dank, dass du dich bei {APP_NAME} angemeldet hast.</p>\n<p>Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Bestätigen</a>\n</p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>",
      "subject": "Bestätige deine {APP_NAME}-E-Mail-Adresse"
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
    },
    "resetPasswordTemplate": {
      "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
      "subject": "Reset your {APP_NAME} password"
    },
    "verificationTemplate": {
      "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"https://pb.leihbar-koeln.org/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
      "subject": "Verify your {APP_NAME} email"
    }
  }, collection)

  return app.save(collection)
})
