/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const {
    validateStartEnd,
    hasOpenReservations,
    hasOverlappingReservations,
  } = require(`${__hooks}/lib/reservation`);

  const { record } = e;
  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);
  const isAdmin = e.hasSuperuserAuth();
  const requestUser = e.auth;
  const requireUser = $os.getenv("CONFIG_RESERVATION_REQUIRE_USER") !== "false";

  // Store location of product in reservation
  $app.expandRecord(record, ["product"], null);
  const product = record.expandedOne("product");
  $app.expandRecord(product, ["location"], null);
  const location = product.expandedOne("location");
  const isLocationUser =
    requestUser &&
    requestUser.get("manager_locations") &&
    requestUser.get("manager_locations").includes(location.id);
  record.set("location", product.get("location"));

  // Require e-mail verification
  if (!requestUser?.verified()) {
    throw new BadRequestError("User_not_verified.");
  }

  // Make sure there is not already an open reservation with the same user
  // and product
  if (hasOpenReservations(record) && !isAdmin && !isLocationUser) {
    throw new BadRequestError("Has_open_reservation.");
  }

  // Validate reservation start/end
  validateStartEnd(
    start,
    end,
    location.getInt("max_reservation_days") || 14,
    isLocationUser,
    isAdmin
  );

  // Make sure the reservation is linked to a user
  if (requireUser && !record.get("user") && !isAdmin && !isLocationUser) {
    throw new BadRequestError("User_not_defined.");
  }

  // If send_confirmation isn't set yet, make sure to set it to false for admin
  // or location users, so that no confirmations are send when creating
  // reservations from the admin section or pocketbase interface
  if (!record.get("send_confirmation") && (isAdmin || isLocationUser)) {
    record.set("send_confirmation", false);
  }

  // Set default note content
  if (!record.get("note") && location.get("note_default")) {
    record.set("note", location.get("note_default"));
  }

  // Make sure there is no overlapping reservation for the same product in the
  // same timespan
  const locationConfig = location.getString("config")
    ? JSON.parse(location.getString("config")) || {}
    : {};
  const allowSameDayReservations =
    isLocationUser || !!locationConfig["allow_same_day_reservations"];
  if (hasOverlappingReservations(record, allowSameDayReservations)) {
    throw new BadRequestError("Overlapping_reservation.");
  }

  // Strip html out of message field
  // https://stackoverflow.com/a/51208595
  record.set(
    "message",
    record.get("message").replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "")
  );

  e.next();
}, "reservations");

onRecordUpdateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const {
    validateStartEnd,
    hasOverlappingReservations,
    hasOpenReservations,
  } = require(`${__hooks}/lib/reservation`);

  const { record } = e;
  const requestUser = e.auth;
  const isAdmin = e.hasSuperuserAuth();
  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);
  $app.expandRecord(record, ["location"], null);
  const location = record.expandedOne("location");
  const isLocationUser =
    requestUser &&
    requestUser.get("manager_locations") &&
    requestUser.get("manager_locations").includes(location.id);

  // Make sure there is not already an open reservation with the same user
  // and product
  if (hasOpenReservations(record) && !isAdmin && !isLocationUser) {
    throw new BadRequestError("Has_open_reservation.");
  }

  // Validate reservation start/end
  validateStartEnd(
    start,
    end,
    location.getInt("max_reservation_days") || 14,
    isLocationUser,
    isAdmin
  );

  // Make sure there is no overlapping reservation for the same product in the
  // same timespan
  const locationConfig = location.getString("config")
    ? JSON.parse(location.getString("config")) || {}
    : {};
  const allowSameDayReservations =
    isAdmin || isLocationUser || !!locationConfig.allow_same_day_reservations;
  if (hasOverlappingReservations(record, allowSameDayReservations)) {
    throw new BadRequestError("Overlapping_reservation.");
  }

  e.next();
}, "reservations");

onRecordCreateRequest((e) => {
  e.next();

  const locale = $os.getenv("CONFIG_LOCALE") || "en";

  /** @type {typeof import('./lib/reservation')} */
  const { saveSentEmail } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./lib/email')} */
  const { sendLocationNotificationEmail, sendUserEmail } = require(
    `${__hooks}/lib/email`
  );
  /** @type {typeof import('./lib/emails.en')} */
  const {
    reservationConfirmationEmail,
    reservationConfirmationLocationEmail,
  } = require(`${__hooks}/lib/emails.${locale}`);

  const { record } = e;

  const requestUser = e.auth;
  $app.expandRecord(record, ["location"], null);
  const location = record.expandedOne("location");

  if (!record.get("send_confirmation")) {
    // Prevent sending notifications if the reservation has been marked to not
    // send those
    return;
  }

  // TODO: only send notification when the user creating the reservation, is
  // also the user involved in the reservation
  // https://pocketbase.io/docs/js-routing/#retrieving-the-current-auth-state

  $app.expandRecord(record, ["product", "user"], null);

  const product = record.expandedOne("product");
  const productName = product.get("name");

  const user = record.expandedOne("user");

  if (!user) {
    // Don't send a confirmation if no user is defined
    return;
  }

  const userName = user.get("name");

  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);

  // Notify location
  sendLocationNotificationEmail(
    location,
    reservationConfirmationLocationEmail({
      productUrl: `${$app.settings().meta.appURL}/link/product/${product.get(
        "id"
      )}`,
      productName,
      userName,
      userEmail: user.get("email"),
      start,
      end,
      message: record.get("message"),
    })
  );

  // Notify user, if the user is the one making the reservation
  if (user && requestUser && requestUser.get("id") === user.get("id")) {
    sendUserEmail(
      user,
      reservationConfirmationEmail({
        productUrl: `${$app.settings().meta.appURL}/link/product/${product.get(
          "id"
        )}`,
        productName,
        userName,
        start,
        end,
        deposit: product.get("deposit"),
      })
    );
    // Store that email has been sent
    saveSentEmail(record, "confirmation");
  }
}, "reservations");

onRecordUpdateRequest((e) => {
  e.next();

  const locale = $os.getenv("CONFIG_LOCALE") || "en";

  /** @type {typeof import('./lib/reservation')} */
  const { removeSentEmail } = require(`${__hooks}/lib/reservation`);

  /** @type {typeof import('./lib/email')} */
  const { sendLocationNotificationEmail, sendUserEmail } = require(
    `${__hooks}/lib/email`
  );

  /** @type {typeof import('./lib/emails.en')} */
  const {
    cancellationConfirmationEmail,
    reservationCancellationLocationEmail,
  } = require(`${__hooks}/lib/emails.${locale}`);

  let { record } = e;
  const requestUser = e.auth;
  const originalRecord = record.original();

  // Reset end_reminder notification if the end date has been moved back
  const end = new Date(record.get("end").string().split(" ")[0]);
  const originalEnd = new Date(
    originalRecord.get("end").string().split(" ")[0]
  );
  if (end > originalEnd) {
    record = removeSentEmail(record, "end_reminder");
  }

  // Reservation got cancelled, send confirmations
  if (!originalRecord.getBool("cancelled") && record.getBool("cancelled")) {
    $app.expandRecord(record, ["product", "location", "user"], null);
    const product = record.expandedOne("product");
    const location = record.expandedOne("location");
    const productName = product.get("name");
    const user = record.expandedOne("user");
    const start = new Date(record.get("start").string().split(" ")[0]);
    const end = new Date(record.get("end").string().split(" ")[0]);

    // Notify the user if they do the cancellation themselves
    if (user && requestUser && requestUser.get("id") === user.get("id")) {
      sendUserEmail(
        user,
        cancellationConfirmationEmail({
          productUrl: `${
            $app.settings().meta.appURL
          }/link/product/${product.get("id")}`,
          productName,
          userName: user.get("name"),
        })
      );
    }

    // Notify the location of the cancellation
    sendLocationNotificationEmail(
      location,
      reservationCancellationLocationEmail({
        productUrl: `${$app.settings().meta.appURL}/link/product/${product.get(
          "id"
        )}`,
        productName,
        userName: user.get("name"),
        userEmail: user.get("email"),
        start,
        end,
      })
    );
  }
}, "reservations");
