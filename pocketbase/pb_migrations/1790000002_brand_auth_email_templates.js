/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");

  const verificationHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Mail-Adresse bestätigen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #212529;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef;">
          <tr>
            <td style="background-color: #2b8a3e; padding: 20px 28px; text-align: left;">
              <a href="{APP_URL}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; display: inline-block;">
                🌱 {APP_NAME}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 20px 28px; line-height: 1.6; font-size: 15px;">
              <p style="margin-top: 0;">Hallo,</p>
              <p>vielen Dank, dass du dich bei <strong>{APP_NAME}</strong> registriert hast.</p>
              <p>Bitte klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren:</p>
              <div style="margin: 26px 0 16px 0; text-align: center;">
                <a href="{APP_URL}/confirm-verification?token={TOKEN}" style="background-color: #2b8a3e; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  E-Mail-Adresse bestätigen
                </a>
              </div>
              <p style="font-size: 12px; color: #868e96; margin-top: 20px; text-align: center; word-break: break-all;">
                Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
                <a href="{APP_URL}/confirm-verification?token={TOKEN}" style="color: #2b8a3e;">{APP_URL}/confirm-verification?token={TOKEN}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 16px 28px; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96; text-align: center;">
              Nachbarschaftliches Teilen mit <a href="{APP_URL}" style="color: #2b8a3e; text-decoration: none;">{APP_NAME}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resetPasswordHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort zurücksetzen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #212529;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef;">
          <tr>
            <td style="background-color: #2b8a3e; padding: 20px 28px; text-align: left;">
              <a href="{APP_URL}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; display: inline-block;">
                🌱 {APP_NAME}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 20px 28px; line-height: 1.6; font-size: 15px;">
              <p style="margin-top: 0;">Hallo,</p>
              <p>du hast eine Anfrage zum Zurücksetzen deines Passworts für dein <strong>{APP_NAME}</strong>-Konto gestellt.</p>
              <p>Klicke auf den Button unten, um ein neues Passwort festzulegen:</p>
              <div style="margin: 26px 0 16px 0; text-align: center;">
                <a href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" style="background-color: #2b8a3e; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  Passwort zurücksetzen
                </a>
              </div>
              <p style="font-size: 13px; color: #6c757d; margin-top: 20px;">
                <i>Falls du keine Passwortrücksetzung angefordert hast, kannst du diese E-Mail einfach ignorieren.</i>
              </p>
              <p style="font-size: 12px; color: #868e96; margin-top: 15px; text-align: center; word-break: break-all;">
                Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
                <a href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" style="color: #2b8a3e;">{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 16px 28px; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96; text-align: center;">
              Nachbarschaftliches Teilen mit <a href="{APP_URL}" style="color: #2b8a3e; text-decoration: none;">{APP_NAME}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const confirmEmailChangeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Mail-Änderung bestätigen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #212529;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef;">
          <tr>
            <td style="background-color: #2b8a3e; padding: 20px 28px; text-align: left;">
              <a href="{APP_URL}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; display: inline-block;">
                🌱 {APP_NAME}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 20px 28px; line-height: 1.6; font-size: 15px;">
              <p style="margin-top: 0;">Hallo,</p>
              <p>klicke auf den Button unten, um deine neue E-Mail-Adresse für dein <strong>{APP_NAME}</strong>-Konto zu bestätigen:</p>
              <div style="margin: 26px 0 16px 0; text-align: center;">
                <a href="{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}" style="background-color: #2b8a3e; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  E-Mail-Änderung bestätigen
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 16px 28px; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96; text-align: center;">
              Nachbarschaftliches Teilen mit <a href="{APP_URL}" style="color: #2b8a3e; text-decoration: none;">{APP_NAME}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  unmarshal({
    "verificationTemplate": {
      "body": verificationHtml,
      "subject": "Bestätige deine E-Mail-Adresse für {APP_NAME}"
    },
    "resetPasswordTemplate": {
      "body": resetPasswordHtml,
      "subject": "Setze dein {APP_NAME}-Passwort zurück"
    },
    "confirmEmailChangeTemplate": {
      "body": confirmEmailChangeHtml,
      "subject": "Bestätige deine neue E-Mail-Adresse für {APP_NAME}"
    }
  }, collection);

  return app.save(collection);
}, (app) => {
  // Rollback logic
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hallo,</p>\n<p>vielen Dank, dass du dich bei {APP_NAME} angemeldet hast.</p>\n<p>Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/confirm-verification?token={TOKEN}\" target=\"_blank\" rel=\"noopener\">Bestätigen</a>\n</p>\n<p>\n  Liebe Grüße,<br/>\n  Das {APP_NAME}-Team\n</p>",
      "subject": "Bestätige deine {APP_NAME}-E-Mail-Adresse"
    }
  }, collection);
  return app.save(collection);
});
