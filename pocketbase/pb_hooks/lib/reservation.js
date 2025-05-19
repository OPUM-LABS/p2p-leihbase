/**
 * Validates the start and end of a reservation
 * @param {Date} start
 * @param {Date} end
 * @param {Number} maxReservationDays
 * @param {Boolean} isLocationUser
 * @param {Boolean} isAdmin
 */
function validateStartEnd(
  start,
  end,
  maxReservationDays,
  isLocationUser,
  isAdmin
) {
  var startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  // Start and end shouldn't be the same
  if (start.getTime() === end.getTime()) {
    throw new BadRequestError("Start_and_end_equal.");
  }
  // End should be after start of reservation
  if (end.getTime() < start.getTime()) {
    throw new BadRequestError("End_before_start.");
  }

  // Don't allow reserving where start of end is before today
  // Except if the user is an admin or a location user
  if (start < startOfDay && !isAdmin && !isLocationUser) {
    throw new BadRequestError("Start_before_today.");
  }
  if (end < startOfDay && !isAdmin && !isLocationUser) {
    throw new BadRequestError("End_before_today.");
  }

  // Consider maximum reservation length configured in location
  const maxDays = 1000 * 60 * 60 * 24 * maxReservationDays;
  if (
    end.getTime() - start.getTime() > maxDays &&
    !isAdmin &&
    !isLocationUser
  ) {
    throw new BadRequestError("Date_range_too_long.");
  }
}

/**
 * Checks if a reservation has other overlapping reservations
 * @param {models.Record} reservation
 * @param {boolean} allowSameDay
 * @returns {boolean}
 */
function hasOverlappingReservations(reservation, allowSameDay) {
  // A cancelled reservation is allowed to have an overlap
  if (reservation.get("cancelled")) {
    return false;
  }
  // When allowing same day reservations the start of one reservation can be on
  // the same day as the end of another reservation
  const startEndComparison = allowSameDay
    ? "start < {:end} && end > {:start}"
    : "start <= {:end} && end >= {:start}";
  const records = $app
    .dao()
    .findRecordsByFilter(
      "reservations",
      reservation.get("id")
        ? `id != {:id} && product = {:product} && cancelled != true && ${startEndComparison}`
        : `product = {:product} && cancelled != true && ${startEndComparison}`,
      null,
      1,
      0,
      {
        id: reservation.get("id"),
        product: reservation.get("product"),
        start: reservation.get("start"),
        end: reservation.get("end"),
      }
    );
  return records.length > 0;
}

/**
 * Checks if a reservation has other overlapping reservations
 * @param {models.Record} reservation
 * @returns {boolean}
 */
function hasOpenReservations(reservation) {
  const { endOfDate } = require(`${__hooks}/lib/date`);
  // A cancelled reservation is allowed to have a second reservation for the same product
  if (reservation.get("cancelled")) {
    return false;
  }
  // A reservation without a user can't already have an open reservation
  if (!reservation.get("user")) {
    return false;
  }
  const records = $app
    .dao()
    .findRecordsByFilter(
      "reservations",
      reservation.get("id")
        ? `id != {:id} && user = {:user} && product = {:product} && end > {:endOfToday} && cancelled != true`
        : `user = {:user} && product = {:product} && end > {:endOfToday} && cancelled != true`,
      null,
      1,
      0,
      {
        id: reservation.get("id"),
        user: reservation.get("user"),
        product: reservation.get("product"),
        endOfToday: endOfDate(new Date()),
      }
    );
  return records.length > 0;
}

/**
 * @param {models.Record} reservation
 * @param {'confirmation'|'start_reminder'|'end_reminder'} type
 */
function saveSentEmail(reservation, type) {
  const sent_emails = reservation.getStringSlice("sent_emails");
  sent_emails.push(type);
  reservation.set("sent_emails", sent_emails);
  $app.dao().saveRecord(reservation);
}

/**
 * @param {models.Record} reservation
 * @param {'confirmation'|'start_reminder'|'end_reminder'} type
 */
function removeSentEmail(reservation, type) {
  const sent_emails = reservation.getStringSlice("sent_emails");
  sent_emails.push(type);
  reservation.set(
    "sent_emails",
    sent_emails.filter((t) => t !== type)
  );
  $app.dao().saveRecord(reservation);
  return reservation;
}

/**
 * Generates a start/end reservation reminder email
 * @param {models.Record} reservation
 * @param {'start'|'end'} type
 * @returns { { to: { address: string }[], subject: string, html: string } }
 */
function getReminderEmail(reservation, type) {
  const locale = $os.getenv("CONFIG_LOCALE") || "en";
  /** @type {typeof import('./emails.en')} */
  const {
    reservationStartReminderEmail,
    reservationEndReminderEmail,
  } = require(`${__hooks}/lib/emails.${locale}`);
  const { getOpeningHoursDay } = require(`${__hooks}/lib/openingHours`);

  $app.dao().expandRecord(reservation, ["location", "user", "product"], null);
  const location = reservation.expandedOne("location");
  const product = reservation.expandedOne("product");
  const user = reservation.expandedOne("user");
  const start = new Date(reservation.get("start").string().split(" ")[0]);
  const end = new Date(reservation.get("end").string().split(" ")[0]);

  const startOpenHours = getOpeningHoursDay(
    JSON.parse(location.get("opening_hours")),
    start
  );
  const endOpenHours = getOpeningHoursDay(
    JSON.parse(location.get("opening_hours")),
    end
  );

  if (type === "start") {
    return {
      to: [{ address: user.getString("email") }],
      ...reservationStartReminderEmail({
        userName: user.get("name"),
        locationName: location.get("name"),
        productName: product.get("name"),
        start,
        startHour:
          startOpenHours && startOpenHours.length > 0
            ? startOpenHours[0].from
            : null,
        endHour:
          startOpenHours && startOpenHours.length > 0
            ? startOpenHours[0].to
            : null,
      }),
    };
  } else if (type === "end") {
    return {
      to: [{ address: user.get("email") }],
      ...reservationEndReminderEmail({
        userName: user.get("name"),
        locationName: location.get("name"),
        productName: product.get("name"),
        end,
        startHour:
          endOpenHours && endOpenHours.length > 0 ? endOpenHours[0].from : null,
        endHour:
          endOpenHours && endOpenHours.length > 0 ? endOpenHours[0].to : null,
      }),
    };
  } else {
    throw new Error(`[reservation] unknown reminder email type: ${type}`);
  }
}

module.exports = {
  validateStartEnd,
  hasOverlappingReservations,
  hasOpenReservations,
  saveSentEmail,
  removeSentEmail,
  getReminderEmail,
};
