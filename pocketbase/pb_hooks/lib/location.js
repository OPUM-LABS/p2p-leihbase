/**
 * @param {models.Record} locationRecord
 * @returns
 */
function getNotificationEmailAddresses(locationRecord) {
  if (!locationRecord.getString("notifications")) {
    return [];
  }
  /** @type {string[]} */
  const notifications = JSON.parse(locationRecord.getString("notifications"));
  if (
    !notifications ||
    !Array.isArray(notifications) ||
    notifications.length < 1
  ) {
    return [];
  }
  return notifications;
}

/**
 *
 * @param {models.Record} location
 * @param {'start'|'end'} type
 */
function sendReminders(location, type) {
  /** @type {typeof import('./date')} */
  const { addDays, startOfDate, endOfDate } = require(`${__hooks}/lib/date`);
  /** @type {typeof import('./reservation')} */
  const { getReminderEmail } = require(`${__hooks}/lib/reservation`);

  // Get reservations starting or ending tomorrow
  const startOfTomorrow = startOfDate(addDays(new Date(), 1));
  const endOfTomorrow = endOfDate(addDays(new Date(), 1));
  const reservations = $app
    .dao()
    .findRecordsByFilter(
      "reservations",
      type === "start"
        ? `location = {:location} && cancelled != true && user != "" && sent_reminders !~ "start" && start >= {:startOfTomorrow} && start <= {:endOfTomorrow}`
        : `location = {:location} && cancelled != true && user != "" && started = true && ended = false && sent_reminders !~ "end" && end >= {:startOfTomorrow} && end <= {:endOfTomorrow}`,
      null,
      100,
      0,
      {
        type,
        location: location.get("id"),
        startOfTomorrow,
        endOfTomorrow,
      }
    );

  console.log(
    `[location/reservation-reminders] found ${
      reservations.length
    } reservations to ${type} tomorrow for location '${location.get("name")}'`
  );

  // Send start/end reminder for each found reservation
  reservations.forEach((reservation) => {
    console.log(
      `[location/reservation-reminders] Send ${type} reminder for reservation`,
      reservation.get("id")
    );
    // Generate email
    const email = getReminderEmail(reservation, type);

    // Send email
    $app.newMailClient().send(
      new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: $app.settings().meta.senderName,
        },
        ...email,
      })
    );

    // Save that reminder has been send
    const sent_reminders = reservation.getStringSlice("sent_reminders");
    sent_reminders.push(type);
    reservation.set("sent_reminders", sent_reminders);
    $app.dao().saveRecord(reservation);
  });
}

module.exports = {
  getNotificationEmailAddresses,
  sendReminders,
};
