/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const { requestInfo, record } = e;
  if (!record) {
    throw new BadRequestError();
  }

  const requestUser = e.auth;
  if (!e.hasSuperuserAuth() && requestUser) {
    if (!requestUser.verified()) {
      throw new BadRequestError("User_not_verified.");
    }
    // Set owning user to current authenticated user
    record.set("user", requestUser.id);
  }

  if (record.get("active") === undefined || record.get("active") === null) {
    record.set("active", true);
  }

  e.next();
}, "products");

onRecordEnrich(({ record, requestInfo, next }) => {
  if (!record) {
    return next();
  }

  const isOwner = requestInfo?.auth && requestInfo.auth.id === record.get("user");
  const isAdmin = requestInfo?.auth?.get("role") === "admin";
  const isSuperuser = requestInfo?.hasSuperuserAuth();

  // Hide internal notes and exact pickup address from public by default
  record.hide("notes");
  record.hide("pickup_address");

  // Reveal exact pickup address and internal notes only to owner, admin or superuser
  if (isOwner || isAdmin || isSuperuser) {
    record.unhide("notes");
    record.unhide("pickup_address");
  }

  // When passing the 'computeAvailability' query parameter:
  if (Boolean(requestInfo?.query.computeAvailability)) {
    /** @type {typeof import('./lib/product')} */
    const { hasActiveReservation } = require(`${__hooks}/lib/product`);
    record.withCustomData(true);
    record.set("computedIsAvailable", !hasActiveReservation(record.id, null, true));
  }

  next();
}, "products");
