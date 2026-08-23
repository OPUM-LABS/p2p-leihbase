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

onRecordEnrich((e) => {
  const record = e.record;
  if (!record) {
    return e.next();
  }

  const reqInfo = typeof e.requestInfo === "function" ? e.requestInfo() : e.requestInfo;
  const authUser = reqInfo?.auth || e.auth;

  const isOwner = Boolean(authUser && authUser.id === record.get("user"));
  const isAdmin = Boolean(authUser && authUser.get("role") === "admin");
  const isSuperuser = Boolean(
    (typeof e.hasSuperuserAuth === "function" && e.hasSuperuserAuth()) ||
    (typeof reqInfo?.hasSuperuserAuth === "function" && reqInfo.hasSuperuserAuth())
  );

  // Hide internal notes and exact pickup address from public by default
  record.hide("notes");
  record.hide("pickup_address");

  // Reveal exact pickup address and internal notes only to owner, admin or superuser
  if (isOwner || isAdmin || isSuperuser) {
    record.unhide("notes");
    record.unhide("pickup_address");
  }

  // When passing the 'computeAvailability' query parameter:
  if (Boolean(reqInfo?.query?.computeAvailability)) {
    /** @type {typeof import('./lib/product')} */
    const { hasActiveReservation } = require(`${__hooks}/lib/product`);
    record.withCustomData(true);
    record.set("computedIsAvailable", !hasActiveReservation(record.id, null, true));
  }

  e.next();
}, "products");
