/**
 * @param {models.Record} location
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

function sendUserEmail(user, emailProps) {
  const email = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName,
    },
    to: [{ address: user.get("email") }],
    ...emailProps,
  });
  $app.newMailClient().send(email);
}

module.exports = {
  sendLocationNotificationEmail,
  sendUserEmail,
};
