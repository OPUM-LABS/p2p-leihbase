/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const { validateStartEnd, hasOverlappingReservations } = require(
    `${__hooks}/lib/reservation`
  );
  /** @type {typeof import('./lib/user')} */
  const { hasActiveReservationForProduct } = require(`${__hooks}/lib/user`);

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);
  const isSuperuser = e.hasSuperuserAuth();
  const requestUser = e.auth;

  // Require e-mail verification
  if (!requestUser?.verified() && !isSuperuser) {
    throw new BadRequestError("User_not_verified.");
  }

  // Populate product and owner
  $app.expandRecord(record, ["product"], null);
  const product = record.expandedOne("product");
  if (!product) {
    throw new BadRequestError("Product_not_found.");
  }

  const ownerId = product.get("user");
  if (ownerId) {
    record.set("owner", ownerId);
  }

  // Prevent user from renting their own product
  if (requestUser && ownerId && requestUser.id === ownerId && !isSuperuser) {
    throw new BadRequestError("Cannot_rent_own_product.");
  }

  // Default status to 'requested' if not set
  if (!record.get("status")) {
    record.set("status", "requested");
  }

  // Check max duration limit (default 30 days for P2P)
  const maxDuration = product.getInt("max_duration_days") || 30;
  validateStartEnd(start, end, maxDuration, isSuperuser);

  // Check overlapping active reservations
  if (hasOverlappingReservations(record, true)) {
    throw new BadRequestError("Overlapping_reservation.");
  }

  // Strip html from message field
  if (record.get("message")) {
    record.set(
      "message",
      record.get("message").replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "")
    );
  }

  e.next();
}, "reservations");

onRecordUpdateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const { validateStartEnd, hasOverlappingReservations } = require(
    `${__hooks}/lib/reservation`
  );

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const requestUser = e.auth;
  const isSuperuser = e.hasSuperuserAuth();
  const originalRecord = record.original();
  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);

  $app.expandRecord(record, ["product"], null);
  const product = record.expandedOne("product");

  const isOwner = requestUser && (requestUser.id === record.get("owner") || (product && requestUser.id === product.get("user")));
  const isBorrower = requestUser && requestUser.id === record.get("user");
  const isAdmin = requestUser && requestUser.get("role") === "admin";

  const newStatus = record.get("status");
  const originalStatus = originalRecord ? originalRecord.get("status") : null;

  // If status changed to 'accepted', copy exact pickup address from product to reservation handover_address
  if (newStatus === "accepted" && originalStatus !== "accepted" && product) {
    const pickupAddr = product.get("pickup_address");
    if (pickupAddr) {
      record.set("handover_address", pickupAddr);
    }
  }

  // Ensure only owner or admin can accept / decline requests
  if ((newStatus === "accepted" || newStatus === "declined") && !isOwner && !isAdmin && !isSuperuser) {
    throw new BadRequestError("Only_owner_can_accept_or_decline.");
  }

  // Check overlapping reservations if accepted or started
  if (newStatus !== "declined" && newStatus !== "cancelled" && !record.getBool("cancelled")) {
    if (hasOverlappingReservations(record, true)) {
      throw new BadRequestError("Overlapping_reservation.");
    }
  }

  e.next();
}, "reservations");

onRecordEnrich(({ record, requestInfo, next }) => {
  if (!record) {
    return next();
  }

  const requestUser = requestInfo?.auth;
  const isSuperuser = requestInfo?.hasSuperuserAuth();
  const isOwner = requestUser && requestUser.id === record.get("owner");
  const isBorrower = requestUser && requestUser.id === record.get("user");
  const isAdmin = requestUser && requestUser.get("role") === "admin";

  const status = record.get("status");
  const isAcceptedOrActive = status === "accepted" || status === "started" || status === "ended";

  // Hide exact handover address unless user is owner, or borrower on an accepted booking
  if (!isSuperuser && !isAdmin && !isOwner && !(isBorrower && isAcceptedOrActive)) {
    record.hide("handover_address");
  }

  next();
}, "reservations");
