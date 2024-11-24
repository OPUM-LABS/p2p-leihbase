function hasOverlappingReservations(record, allowSameDay) {
  // A cancelled reservation is allowed to have an overlap
  if (record.get("cancelled")) {
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
      record.get("id")
        ? `id != {:id} && product = {:product} && cancelled != true && ${startEndComparison}`
        : `product = {:product} && cancelled != true && ${startEndComparison}`,
      null,
      1,
      0,
      {
        id: record.get("id"),
        product: record.get("product"),
        start: record.get("start"),
        end: record.get("end"),
      }
    );
  return records.length > 0;
}

function getReminderEmail(reservation, type) {
  const locale = $os.getenv("CONFIG_LOCALE") || "en";
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
      to: [{ address: user.get("email") }],
      ...reservationStartReminderEmail({
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
  hasOverlappingReservations,
  getReminderEmail,
};
