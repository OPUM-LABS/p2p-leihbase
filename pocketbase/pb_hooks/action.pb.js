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

routerAdd("POST", "/api/leihbase/action", (e) => {
  const secret = getActionSecret();
  const body = e.requestInfo().body;
  const token = body?.token;

  if (!token) {
    throw new BadRequestError("Token is required.");
  }

  let claims;
  try {
    claims = $security.parseJWT(token, secret);
  } catch (err) {
    throw new BadRequestError("Invalid or expired action link.");
  }

  const { act, res: resId, uid, slotId, type } = claims;
  if (!resId) {
    throw new BadRequestError("Invalid reservation reference in token.");
  }

  const reservation = $app.findRecordById("reservations", resId);
  if (!reservation) {
    throw new NotFoundError("Reservation not found.");
  }

  $app.expandRecord(reservation, ["product", "user", "owner"], null);
  const product = reservation.expandedOne("product");
  const productName = product ? product.getString("name") : "Gegenstand";
  const handoverAddress = reservation.getString("handover_address") || (product ? product.getString("pickup_address") : "");

  if (act === "accept") {
    if (reservation.getString("status") === "accepted") {
      return e.json(200, {
        action: "accept",
        alreadyDone: true,
        productName,
        message: "This request has already been accepted.",
      });
    }
    reservation.set("status", "accepted");
    $app.save(reservation);
    return e.json(200, {
      action: "accept",
      alreadyDone: false,
      productName,
      message: "You have successfully accepted the lending request.",
    });
  }

  if (act === "decline") {
    if (reservation.getString("status") === "declined") {
      return e.json(200, {
        action: "decline",
        alreadyDone: true,
        productName,
        message: "This request has already been declined.",
      });
    }
    reservation.set("status", "declined");
    $app.save(reservation);
    return e.json(200, {
      action: "decline",
      alreadyDone: false,
      productName,
      message: "You have declined the lending request.",
    });
  }

  if (act === "confirm_slot") {
    let timeslots = {};
    const rawSlots = reservation.getString("timeslots");
    if (rawSlots) {
      try {
        timeslots = JSON.parse(rawSlots);
      } catch (err) { }
    }
    const group = timeslots[type] || { proposals: [], confirmedSlot: null };
    const slot = (group.proposals || []).find((s) => s.id === slotId);

    if (group.confirmedSlot && group.confirmedSlot.id === slotId) {
      return e.json(200, {
        action: "confirm_slot",
        alreadyDone: true,
        productName,
        type,
        slot: group.confirmedSlot,
        handoverAddress,
        message: "This timeslot has already been confirmed.",
      });
    }

    if (!slot) {
      if (group.confirmedSlot) {
        return e.json(200, {
          action: "confirm_slot",
          alreadyDone: true,
          productName,
          type,
          slot: group.confirmedSlot,
          handoverAddress,
          message: "A timeslot for this step has already been agreed upon.",
        });
      }
      throw new BadRequestError("The requested timeslot proposal was not found or was removed.");
    }

    group.confirmedSlot = slot;
    timeslots[type] = group;
    reservation.set("timeslots", JSON.stringify(timeslots));

    // Sync start / end date with confirmed slot date
    if (type === "pickup" && slot.date) {
      reservation.set("start", `${slot.date} 00:00:00.000Z`);
    } else if (type === "return" && slot.date) {
      reservation.set("end", `${slot.date} 00:00:00.000Z`);
    }

    $app.save(reservation);

    return e.json(200, {
      action: "confirm_slot",
      alreadyDone: false,
      productName,
      type,
      slot,
      handoverAddress,
      message: "Timeslot confirmed successfully.",
    });
  }

  throw new BadRequestError("Unsupported action.");
});

routerAdd("POST", "/api/leihbase/send-timeslot-proposals", (e) => {
  try {
    let authRecord = null;
    try {
      if (typeof e.requestInfo === "function") {
        authRecord = e.requestInfo()?.auth;
      } else if (e.requestInfo) {
        authRecord = e.requestInfo.auth;
      }
    } catch (_) { }

    if (!authRecord) {
      // Resolve token from Authorization header if not set on requestInfo
      const reqInfo = typeof e.requestInfo === "function" ? e.requestInfo() : e.requestInfo;
      const headers = reqInfo?.headers || {};
      const authHeader = headers["authorization"] || headers["Authorization"] || "";
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (token) {
          try {
            authRecord = $app.findAuthRecordByToken(token);
          } catch (tokErr) {
            console.error("[send-timeslot-proposals] Token lookup error:", tokErr);
          }
        }
      }
    }

    if (!authRecord) {
      console.warn("[send-timeslot-proposals] Unauthorized - No authRecord found");
      throw new UnauthorizedError("Authentication required.");
    }

    const reqInfo = typeof e.requestInfo === "function" ? e.requestInfo() : e.requestInfo;
    const body = reqInfo?.body || {};
    const reservationId = body.reservationId;
    const type = body.type || "pickup"; // "pickup" | "return"

    console.log(`[send-timeslot-proposals] Auth user: ${authRecord.id}, Res: ${reservationId}, Type: ${type}`);

    if (!reservationId) {
      throw new BadRequestError("Reservation ID is required.");
    }

    const reservation = $app.findRecordById("reservations", reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found.");
    }

    try {
      $app.expandRecord(reservation, ["product", "user"], null);
    } catch (_) {}

    const product = reservation.expandedOne("product") || (reservation.get("product") ? $app.findRecordById("products", reservation.get("product")) : null);
    const borrower = reservation.expandedOne("user") || (reservation.get("user") ? $app.findRecordById("users", reservation.get("user")) : null);
    let owner = null;
    if (reservation.get("owner")) {
      try {
        owner = $app.findRecordById("users", reservation.get("owner"));
      } catch (_) {}
    }
    if (!owner && product && product.get("user")) {
      try {
        owner = $app.findRecordById("users", product.get("user"));
      } catch (_) {}
    }

    const borrowerId = borrower ? borrower.id : reservation.getString("user");
    const ownerId = owner ? owner.id : (reservation.getString("owner") || (product ? product.getString("user") : null));

    const isBorrower = authRecord.id === borrowerId;
    const isOwner = authRecord.id === ownerId || (product && authRecord.id === product.getString("user"));
    const isAdmin = authRecord.get && authRecord.get("role") === "admin";

    console.log(`[send-timeslot-proposals] isBorrower: ${isBorrower}, isOwner: ${isOwner}, isAdmin: ${isAdmin}`);

    if (!isBorrower && !isOwner && !isAdmin) {
      throw new ForbiddenError("You are not authorized to send timeslots for this reservation.");
    }

    let timeslots = {};
    const rawSlots = reservation.getString("timeslots");
    if (rawSlots) {
      try {
        timeslots = JSON.parse(rawSlots);
      } catch (err) { }
    }

    const group = timeslots[type] || { proposals: [], confirmedSlot: null };
    const proposals = group.proposals || [];

    if (proposals.length === 0) {
      console.warn(`[send-timeslot-proposals] No proposals for type ${type}`);
      throw new BadRequestError("No proposals to send.");
    }

    const targetUser = isBorrower ? owner : borrower;
    const senderUser = isBorrower ? borrower : owner;

    if (!targetUser || !targetUser.getString("email")) {
      throw new BadRequestError("Recipient user has no email address configured.");
    }

    const { sendUserEmail, createActionToken, getEmailsModule } = require(`${__hooks}/lib/email`);
    const appUrl = $os.getenv("CONFIG_APP_URL") || $app.settings().meta.appURL || "http://localhost:3000";
    const productName = product ? product.getString("name") : "Gegenstand";
    const productUrl = `${appUrl}/items/${product?.id}`;
    const senderName = senderUser ? (senderUser.getString("name") || senderUser.getString("nickname") || (isBorrower ? "Ausleiher" : "Verleiher")) : (isBorrower ? "Ausleiher" : "Verleiher");
    const recipientName = targetUser.getString("name") || targetUser.getString("nickname") || (isBorrower ? "Verleiher" : "Ausleiher");

    const slotsWithTokens = proposals.map((s) => {
      const token = createActionToken({
        act: "confirm_slot",
        res: reservation.id,
        type: type,
        slotId: s.id,
        uid: targetUser.id,
      });
      return {
        ...s,
        confirmUrl: `${appUrl}/action?token=${token}`,
      };
    });

    const targetEmailsModule = getEmailsModule(targetUser);
    const emailData = targetEmailsModule.p2pTimeslotProposedEmail({
      recipientName,
      senderName,
      productName,
      productUrl,
      type,
      slots: slotsWithTokens,
      appUrl,
      isOwner: isBorrower, // If sender is borrower, target is owner, so isOwner=true
    });

    sendUserEmail(targetUser, emailData);

    // Update lastNotified info
    group.lastNotifiedAt = new Date().toISOString();
    group.lastNotifiedBy = authRecord.id;
    group.lastNotifiedCount = proposals.length;
    timeslots[type] = group;
    reservation.set("timeslots", JSON.stringify(timeslots));
    $app.save(reservation);

    console.log(`[send-timeslot-proposals] Success: Sent ${proposals.length} slots to ${targetUser.getString("email")}`);

    return e.json(200, {
      success: true,
      count: proposals.length,
      lastNotifiedAt: group.lastNotifiedAt,
    });
  } catch (err) {
    console.error("[send-timeslot-proposals] Error occurred:", err);
    throw err;
  }
});
