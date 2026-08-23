/**
 * @param {core.Record} location
 * @param {Object} emailProps
 * @returns
 */
function sendLocationNotificationEmail(location, emailProps) {
  /** @type {typeof import('./location')} */
  const { getNotificationEmailAddresses } = require(`${__hooks}/lib/location`);

  const notificationEmailAddresses = getNotificationEmailAddresses(location);
  if (notificationEmailAddresses.length > 0) {
    notificationEmailAddresses.forEach((to) => {
      const email = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: $app.settings().meta.senderName,
        },
        to: [{ address: to }],
        ...emailProps,
      });
      $app.newMailClient().send(email);
    });
  }
}

/**
 * Sends an email to a user with optional file attachment.
 * If attachmentContent is a string, a fresh File instance is constructed to prevent stream exhaustion.
 */
function sendUserEmail(user, emailProps, attachmentContent, attachmentName = "termin.ics") {
  try {
    let userRecord = user;
    if (typeof user === "string") {
      userRecord = $app.findRecordById("users", user);
    }
    if (!userRecord) {
      console.warn("[Email] User record not found for email notification");
      return;
    }
    const emailAddress = userRecord.get("email");
    if (!emailAddress) {
      console.warn("[Email] User has no email address configured");
      return;
    }

    const emailPayload = {
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{ address: emailAddress }],
      ...emailProps,
    };

    if (attachmentContent) {
      let fileAttachment = null;
      if (typeof attachmentContent === "string") {
        if (typeof $filesystem !== "undefined" && typeof $filesystem.fileFromBytes === "function") {
          fileAttachment = $filesystem.fileFromBytes(attachmentContent, attachmentName);
        }
      } else if (typeof attachmentContent === "function") {
        fileAttachment = attachmentContent();
      } else {
        fileAttachment = attachmentContent;
      }

      if (fileAttachment) {
        emailPayload.attachments = {
          [attachmentName]: fileAttachment,
        };
      }
    }

    const email = new MailerMessage(emailPayload);
    $app.newMailClient().send(email);
    console.log(`[Email] Sent email "${emailProps.subject}" to ${emailAddress}`);
  } catch (err) {
    console.error(`[Email Error] Failed to send email to user:`, err);
  }
}

function getActionSecret() {
  try {
    const s = $app.settings();
    if (s) {
      if (s.recordAuthToken && s.recordAuthToken.secret) return s.recordAuthToken.secret;
      if (s.recordTokens && s.recordTokens.user && s.recordTokens.user.secret) return s.recordTokens.user.secret;
      if (s.recordTokens && s.recordTokens.secret) return s.recordTokens.secret;
      if (s.tokenSecret) return s.tokenSecret;
    }
  } catch (e) { }
  return "leihbase_action_secret_key_fixed";
}

/**
 * Creates a signed JWT action token (for 1-click email links like accept, decline, confirm_slot).
 * @param {object} payload
 * @param {number} [durationSec=604800] Default 7 days
 * @returns {string}
 */
function createActionToken(payload, durationSec = 604800) {
  const secret = getActionSecret();
  return $security.createJWT(payload, secret, durationSec);
}

/**
 * Returns the appropriate emails module ('de' or 'en') based on the user's preferred locale.
 * Falls back to CONFIG_LOCALE env or 'de'.
 * @param {core.Record|string|null} user
 * @returns {typeof import('./emails.de')}
 */
function getEmailsModule(user) {
  let userLocale = "de";
  if (user && typeof user.getString === "function") {
    userLocale = user.getString("locale") || $os.getenv("CONFIG_LOCALE") || "de";
  } else if (typeof user === "string") {
    userLocale = user;
  } else {
    userLocale = $os.getenv("CONFIG_LOCALE") || "de";
  }
  const cleanLocale = userLocale.toLowerCase().startsWith("de") ? "de" : "en";
  const { getEmails } = require(`${__hooks}/lib/emails`);
  return getEmails(cleanLocale);
}

module.exports = {
  sendLocationNotificationEmail,
  sendUserEmail,
  createActionToken,
  getEmailsModule,
};
