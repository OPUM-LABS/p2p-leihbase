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
  const productId = record.get("product") || record.getString("product");
  const product = productId ? $app.findRecordById("products", productId) : null;
  if (!product) {
    throw new BadRequestError("Product_not_found.");
  }

  const ownerId = product.getString("user") || product.get("user");
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
  if (hasOverlappingReservations(record, false)) {
  }

  // Strip html from message field
  if (record.get("message")) {
    record.set(
      "message",
      record.get("message").replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "")
    );
  }

  e.next();

  // Send email notifications after successful creation
  try {
    const { sendUserEmail, createActionToken, getEmailsModule } = require(`${__hooks}/lib/email`);
    const appUrl =
      $os.getenv("CONFIG_APP_URL") ||
      $app.settings().meta.appURL ||
      "http://localhost:3000";

    const borrowerId = record.get("user");
    const borrower =
      requestUser || (borrowerId ? $app.findRecordById("users", borrowerId) : null);
    const owner = ownerId ? $app.findRecordById("users", ownerId) : null;

    const borrowerName =
      borrower?.get("name") || borrower?.get("nickname") || "Ausleiher";
    const borrowerEmail = borrower?.get("email") || "";
    const borrowerAddress = [
      borrower?.get("address"),
      [borrower?.get("postal_code"), borrower?.get("city")].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    const ownerName =
      owner?.get("name") || owner?.get("nickname") || "Verleiher";
    const productName = product.get("name") || "Gegenstand";
    const productUrl = `${appUrl}/items/${product.id}`;
    const deposit = product.get("deposit") || 0;
    const message = record.get("message") || "";

    // 1. Notify Owner about new request
    if (owner && owner.get("email")) {
      const acceptToken = createActionToken({ act: "accept", res: record.id, uid: ownerId });
      const declineToken = createActionToken({ act: "decline", res: record.id, uid: ownerId });
      const acceptUrl = `${appUrl}/action?token=${acceptToken}`;
      const declineUrl = `${appUrl}/action?token=${declineToken}`;

      const ownerEmailsModule = getEmailsModule(owner);
      const emailData = ownerEmailsModule.p2pNewRequestOwnerEmail({
        ownerName,
        borrowerName,
        borrowerAddress,
        productName,
        productUrl,
        start,
        end,
        message,
        acceptUrl,
        declineUrl,
        appUrl,
      });
      sendUserEmail(owner, emailData);
    }

    // 2. Notify Borrower that request was submitted
    if (borrower && borrower.get("email")) {
      const borrowerEmailsModule = getEmailsModule(borrower);
      const emailData = borrowerEmailsModule.p2pRequestSubmittedBorrowerEmail({
        borrowerName,
        ownerName,
        productName,
        productUrl,
        start,
        end,
        deposit,
        appUrl,
      });
      sendUserEmail(borrower, emailData);
    }
  } catch (err) {
    console.error("[Email Notification Create Error]", err);
    console.error("[Email Notification Create Error]", err?.message || err, err?.stack || "");
  }
}, "reservations");

onRecordUpdateRequest((e) => {
  console.log("[PB Hook] onRecordUpdateRequest triggered for record:", e.record?.id);
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

  const productId = record.get("product") || record.getString("product");
  const product = productId ? $app.findRecordById("products", productId) : null;

  const isOwner =
    requestUser &&
    (requestUser.id === record.get("owner") ||
      (product && requestUser.id === product.get("user")));
  const isBorrower = requestUser && requestUser.id === record.get("user");
  const isAdmin = requestUser && requestUser.get("role") === "admin";

  const newStatus = record.get("status");
  const originalStatus = originalRecord ? originalRecord.get("status") : null;
  const originalCancelled = originalRecord
    ? originalRecord.getBool("cancelled")
    : false;

  // If status changed to 'accepted':
  // 1. Copy exact pickup address from product to reservation handover_address
  // 2. Automatically approve suggested timeslots if any are proposed and not yet confirmed
  if (newStatus === "accepted" && originalStatus !== "accepted") {
    if (product) {
      const pickupAddr = product.get("pickup_address");
      if (pickupAddr) {
        record.set("handover_address", pickupAddr);
      }
    }

    let timeslots = null;
    try {
      const tsStr = record.getString("timeslots");
      if (tsStr) timeslots = JSON.parse(tsStr);
    } catch (e) {
      console.error("[PB Hook] Error parsing timeslots on accept:", e);
    }

    if (timeslots && typeof timeslots === "object") {
      let changed = false;
      for (const type of ["pickup", "return"]) {
        const group = timeslots[type];
        if (
          group &&
          (!group.confirmedSlot || !group.confirmedSlot.id) &&
          Array.isArray(group.proposals) &&
          group.proposals.length > 0
        ) {
          const slotToConfirm = group.proposals[group.proposals.length - 1];
          group.confirmedSlot = slotToConfirm;
          changed = true;

          if (type === "pickup" && slotToConfirm.date) {
            record.set("start", `${slotToConfirm.date} 00:00:00.000Z`);
          } else if (type === "return" && slotToConfirm.date) {
            record.set("end", `${slotToConfirm.date} 23:59:59.999Z`);
          }
        }
      }

      if (changed) {
        record.set("timeslots", JSON.stringify(timeslots));
      }
    }
  }

  // Ensure only owner or admin can accept / decline requests (when status changes)
  if (
    originalStatus !== newStatus &&
    (newStatus === "accepted" || newStatus === "declined") &&
    !isOwner &&
    !isAdmin &&
    !isSuperuser
  ) {
    throw new BadRequestError("Only_owner_can_accept_or_decline.");
  }

  // Check overlapping reservations and max duration if not cancelled / declined
  if (
    newStatus !== "declined" &&
    newStatus !== "cancelled" &&
    !record.getBool("cancelled")
  ) {
    const startRaw = record.get("start");
    const endRaw = record.get("end");
    if (startRaw && endRaw) {
      const startStr = (typeof startRaw === "string" ? startRaw : startRaw.string()).split(" ")[0].split("T")[0];
      const endStr = (typeof endRaw === "string" ? endRaw : endRaw.string()).split(" ")[0].split("T")[0];
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      if (endDate < startDate) {
        throw new BadRequestError("End_before_start.");
      }
      const maxDuration = product ? (product.getInt("max_duration_days") || 30) : 30;
      const maxMs = 1000 * 60 * 60 * 24 * maxDuration;
      if (endDate.getTime() - startDate.getTime() > maxMs && !isSuperuser) {
        throw new BadRequestError("Date_range_too_long.");
      }
    }

    if (hasOverlappingReservations(record, false)) {
      throw new BadRequestError("Overlapping_reservation.");
    }

    // Validate timeslot proposals and confirmedSlot dates against max duration
    const tsRaw = record.getString("timeslots");
    if (tsRaw) {
      try {
        const parsedTs = JSON.parse(tsRaw);
        if (parsedTs && typeof parsedTs === "object") {
          const startRaw = record.get("start");
          const startStr = startRaw ? (typeof startRaw === "string" ? startRaw : startRaw.string()).split(" ")[0].split("T")[0] : null;
          const startDate = startStr ? new Date(startStr) : null;
          const endRaw = record.get("end");
          const endStr = endRaw ? (typeof endRaw === "string" ? endRaw : endRaw.string()).split(" ")[0].split("T")[0] : null;
          const endDate = endStr ? new Date(endStr) : null;
          const maxDuration = product ? (product.getInt("max_duration_days") || 30) : 30;
          const maxMs = 1000 * 60 * 60 * 24 * maxDuration;

          if (parsedTs.pickup && startDate) {
            const pickupSlots = [...(parsedTs.pickup.proposals || [])];
            if (parsedTs.pickup.confirmedSlot) pickupSlots.push(parsedTs.pickup.confirmedSlot);
            for (const s of pickupSlots) {
              if (s && s.date) {
                const pDate = new Date(s.date);
                if (pDate < startDate) {
                  throw new BadRequestError("Pickup_before_start.");
                }
                if (endDate) {
                  if (pDate > endDate) {
                    throw new BadRequestError("Pickup_after_end.");
                  }
                  if (endDate.getTime() - pDate.getTime() > maxMs && !isSuperuser) {
                    throw new BadRequestError("Date_range_too_long.");
                  }
                }
              }
            }
          }

          if (parsedTs.return && startDate) {
            const returnSlots = [...(parsedTs.return.proposals || [])];
            if (parsedTs.return.confirmedSlot) returnSlots.push(parsedTs.return.confirmedSlot);
            for (const s of returnSlots) {
              if (s && s.date) {
                const rDate = new Date(s.date);
                if (rDate < startDate) {
                  throw new BadRequestError("Return_before_start.");
                }
                if (rDate.getTime() - startDate.getTime() > maxMs && !isSuperuser) {
                  throw new BadRequestError("Date_range_too_long.");
                }
              }
            }
          }
        }
      } catch (err) {
        if (
          err?.message?.includes("Date_range_too_long") ||
          err?.message?.includes("Return_before_start") ||
          err?.message?.includes("Pickup_before_start") ||
          err?.message?.includes("Pickup_after_end") ||
          err instanceof BadRequestError
        ) {
          throw err;
        }
        console.warn("[PB Hook] Timeslot validation parsing warning:", err);
      }
    }
  }

  e.next();
  console.log("[PB Hook] onRecordUpdateRequest e.next() finished. Processing email notifications...");

  try {
    const { sendUserEmail, createActionToken, getEmailsModule } = require(`${__hooks}/lib/email`);
    const {
      generateIcsEvent,
      generateGoogleCalendarUrl,
      createIcsAttachment,
    } = require(`${__hooks}/lib/calendar`);
    const appUrl =
      $os.getenv("CONFIG_APP_URL") ||
      $app.settings().meta.appURL ||
      "http://localhost:3000";

    const borrowerId = record.get("user");
    const borrower = borrowerId ? $app.findRecordById("users", borrowerId) : null;
    const ownerId =
      record.get("owner") || (product ? product.get("user") : null);
    const owner = ownerId ? $app.findRecordById("users", ownerId) : null;

    const borrowerName =
      borrower?.get("name") || borrower?.get("nickname") || "Ausleiher";
    const ownerName =
      owner?.get("name") || owner?.get("nickname") || "Verleiher";
    const ownerEmail = owner?.get("email") || "";
    const productName = product?.get("name") || "Gegenstand";
    const productUrl = `${appUrl}/items/${product?.id}`;
    const deposit = product?.get("deposit") || 0;

    const streetAddr = (record.get("handover_address") || product?.get("pickup_address") || "").trim();
    const postalCode = (product?.get("postal_code") || "").trim();
    const city = (product?.get("city") || "").trim();
    const zipCity = [postalCode, city].filter(Boolean).join(" ");
    let fullHandoverAddress = streetAddr;
    if (zipCity && !streetAddr.toLowerCase().includes(zipCity.toLowerCase())) {
      fullHandoverAddress = streetAddr ? `${streetAddr}, ${zipCity}` : zipCity;
    }

    if (newStatus === "accepted" && originalStatus !== "accepted") {
      if (borrower && borrower.get("email")) {
        const borrowerEmailsModule = getEmailsModule(borrower);
        const emailData = borrowerEmailsModule.p2pRequestAcceptedBorrowerEmail({
          borrowerName,
          ownerName,
          productName,
          productUrl,
          start,
          end,
          handoverAddress: fullHandoverAddress,
          deposit,
          appUrl,
        });
        sendUserEmail(borrower, emailData);
      }
    } else if (newStatus === "declined" && originalStatus !== "declined") {
      if (borrower && borrower.get("email")) {
        const borrowerEmailsModule = getEmailsModule(borrower);
        const emailData = borrowerEmailsModule.p2pRequestDeclinedBorrowerEmail({
          borrowerName,
          ownerName,
          productName,
          productUrl,
          start,
          end,
          appUrl,
        });
        sendUserEmail(borrower, emailData);
      }
    } else if (
      (newStatus === "cancelled" || record.getBool("cancelled")) &&
      originalStatus !== "cancelled" &&
      !originalCancelled
    ) {
      const isCancelledByOwner =
        requestUser && owner && requestUser.id === owner.id;
      if (isCancelledByOwner && borrower && borrower.get("email")) {
        const borrowerEmailsModule = getEmailsModule(borrower);
        const emailData = borrowerEmailsModule.p2pReservationCancelledEmail({
          recipientName: borrowerName,
          cancellerName: ownerName,
          productName,
          productUrl,
          start,
          end,
          appUrl,
          isOwner: false,
        });
        sendUserEmail(borrower, emailData);
      } else if (!isCancelledByOwner && owner && owner.get("email")) {
        const ownerEmailsModule = getEmailsModule(owner);
        const emailData = ownerEmailsModule.p2pReservationCancelledEmail({
          recipientName: ownerName,
          cancellerName: borrowerName,
          productName,
          productUrl,
          start,
          end,
          appUrl,
          isOwner: true,
        });
        sendUserEmail(owner, emailData);
      }
    } else if (newStatus === "started" && originalStatus !== "started") {
      if (borrower && borrower.get("email")) {
        const borrowerEmailsModule = getEmailsModule(borrower);
        const emailData = borrowerEmailsModule.p2pItemStartedBorrowerEmail({
          borrowerName,
          ownerName,
          productName,
          end,
          appUrl,
        });
        sendUserEmail(borrower, emailData);
      }
    } else if (newStatus === "ended" && originalStatus !== "ended") {
      if (borrower && borrower.get("email")) {
        const borrowerEmailsModule = getEmailsModule(borrower);
        const emailData = borrowerEmailsModule.p2pItemEndedBorrowerEmail({
          borrowerName,
          ownerName,
          productName,
          appUrl,
        });
        sendUserEmail(borrower, emailData);
      }
    }

    // Check for timeslot changes (proposals or confirmed appointment)
    let originalTimeslots = null;
    let newTimeslots = null;

    try {
      const origStr = originalRecord ? originalRecord.getString("timeslots") : "";
      if (origStr) originalTimeslots = JSON.parse(origStr);
    } catch (e) {
      console.error("[PB Hook] Error parsing originalTimeslots:", e);
    }

    try {
      const newStr = record ? record.getString("timeslots") : "";
      if (newStr) newTimeslots = JSON.parse(newStr);
    } catch (e) {
      console.error("[PB Hook] Error parsing newTimeslots:", e);
    }

    console.log("[PB Hook] Parsed originalTimeslots:", JSON.stringify(originalTimeslots));
    console.log("[PB Hook] Parsed newTimeslots:", JSON.stringify(newTimeslots));

    if (newTimeslots && typeof newTimeslots === "object") {
      const isActorBorrower =
        requestUser && borrower && requestUser.id === borrower.id;
      const targetUser = isActorBorrower ? owner : borrower;
      const senderName = isActorBorrower ? borrowerName : ownerName;
      const recipientName = isActorBorrower ? ownerName : borrowerName;
      const isTargetOwner = !isActorBorrower;

      for (const type of ["pickup", "return"]) {
        const origGroup = (originalTimeslots && originalTimeslots[type]) ? originalTimeslots[type] : null;
        const newGroup = (newTimeslots && newTimeslots[type]) ? newTimeslots[type] : null;
        if (!newGroup) continue;

        const origConfirmed = (origGroup && origGroup.confirmedSlot) ? origGroup.confirmedSlot.id : null;
        const newConfirmed = (newGroup && newGroup.confirmedSlot) ? newGroup.confirmedSlot.id : null;

        console.log(`[PB Hook] Checking ${type}: origConfirmed=${origConfirmed}, newConfirmed=${newConfirmed}`);

        // 1. Slot confirmed -> Send confirmation with calendar entry to BOTH parties
        if (newConfirmed && newConfirmed !== origConfirmed) {
          const slot = newGroup.confirmedSlot;
          const isPickup = type !== "return";
          const appName = $app.settings().meta.appName || "Leihbase";

          console.log(`[Timeslot] Appointment confirmed for ${productName} (${type}): ${slot.date} ${slot.startTime}-${slot.endTime}. Sending emails to borrower & owner.`);

          // Send to Borrower
          if (borrower && borrower.get("email")) {
            const borrowerEmailsModule = getEmailsModule(borrower);
            const isBorrowerDe = (borrower.getString("locale") || "de").toLowerCase().startsWith("de");
            const borrowerTypeLabel = isPickup ? (isBorrowerDe ? "Übergabe" : "Pickup / Handover") : (isBorrowerDe ? "Rückgabe" : "Return");
            const borrowerCalSummary = `${borrowerTypeLabel}: ${productName} (${appName})`;
            const borrowerCalDesc = isBorrowerDe
              ? `${borrowerTypeLabel} des Gegenstandes "${productName}".\nVerleiher: ${ownerName}\nAusleiher: ${borrowerName}\nReservierungsdetails: ${appUrl}/reservations`
              : `${borrowerTypeLabel} of item "${productName}".\nLender: ${ownerName}\nBorrower: ${borrowerName}\nReservation details: ${appUrl}/reservations`;

            const borrowerGoogleCalUrl = generateGoogleCalendarUrl({
              summary: borrowerCalSummary,
              description: borrowerCalDesc,
              location: fullHandoverAddress,
              dateStr: slot.date,
              startTimeStr: slot.startTime,
              endTimeStr: slot.endTime,
            });

            const borrowerIcalDownloadUrl = `${appUrl}/api/calendar-invite?id=${record.id}&type=${type}&date=${encodeURIComponent(slot.date)}&start=${encodeURIComponent(slot.startTime || "09:00")}&end=${encodeURIComponent(slot.endTime || "10:00")}&title=${encodeURIComponent(borrowerCalSummary)}&location=${encodeURIComponent(fullHandoverAddress)}`;

            const borrowerIcs = generateIcsEvent({
              uid: `res-${record.id}-${type}-${slot.id || Date.now()}@leihbase`,
              summary: borrowerCalSummary,
              description: borrowerCalDesc,
              location: fullHandoverAddress,
              dateStr: slot.date,
              startTimeStr: slot.startTime,
              endTimeStr: slot.endTime,
              url: `${appUrl}/reservations`,
            });

            const borrowerEmailData = borrowerEmailsModule.p2pTimeslotConfirmedEmail({
              recipientName: borrowerName,
              confirmedByName: senderName,
              counterpartyName: ownerName,
              counterpartyRole: isBorrowerDe ? "Verleiher" : "Lender",
              productName,
              productUrl,
              type,
              slot,
              location: fullHandoverAddress,
              googleCalUrl: borrowerGoogleCalUrl,
              icalDownloadUrl: borrowerIcalDownloadUrl,
              appUrl,
              isOwner: false,
            });
            sendUserEmail(borrower, borrowerEmailData, borrowerIcs, `termin_${type}.ics`);
          }

          // Send to Owner
          if (owner && owner.get("email")) {
            const ownerEmailsModule = getEmailsModule(owner);
            const isOwnerDe = (owner.getString("locale") || "de").toLowerCase().startsWith("de");
            const ownerTypeLabel = isPickup ? (isOwnerDe ? "Übergabe" : "Pickup / Handover") : (isOwnerDe ? "Rückgabe" : "Return");
            const ownerCalSummary = `${ownerTypeLabel}: ${productName} (${appName})`;
            const ownerCalDesc = isOwnerDe
              ? `${ownerTypeLabel} des Gegenstandes "${productName}".\nVerleiher: ${ownerName}\nAusleiher: ${borrowerName}\nReservierungsdetails: ${appUrl}/reservations`
              : `${ownerTypeLabel} of item "${productName}".\nLender: ${ownerName}\nBorrower: ${borrowerName}\nReservation details: ${appUrl}/reservations`;

            const ownerGoogleCalUrl = generateGoogleCalendarUrl({
              summary: ownerCalSummary,
              description: ownerCalDesc,
              location: fullHandoverAddress,
              dateStr: slot.date,
              startTimeStr: slot.startTime,
              endTimeStr: slot.endTime,
            });

            const ownerIcalDownloadUrl = `${appUrl}/api/calendar-invite?id=${record.id}&type=${type}&date=${encodeURIComponent(slot.date)}&start=${encodeURIComponent(slot.startTime || "09:00")}&end=${encodeURIComponent(slot.endTime || "10:00")}&title=${encodeURIComponent(ownerCalSummary)}&location=${encodeURIComponent(fullHandoverAddress)}`;

            const ownerIcs = generateIcsEvent({
              uid: `res-${record.id}-${type}-${slot.id || Date.now()}@leihbase`,
              summary: ownerCalSummary,
              description: ownerCalDesc,
              location: fullHandoverAddress,
              dateStr: slot.date,
              startTimeStr: slot.startTime,
              endTimeStr: slot.endTime,
              url: `${appUrl}/reservations`,
            });

            const ownerEmailData = ownerEmailsModule.p2pTimeslotConfirmedEmail({
              recipientName: ownerName,
              confirmedByName: senderName,
              counterpartyName: borrowerName,
              counterpartyRole: isOwnerDe ? "Ausleiher" : "Borrower",
              productName,
              productUrl,
              type,
              slot,
              location: fullHandoverAddress,
              googleCalUrl: ownerGoogleCalUrl,
              icalDownloadUrl: ownerIcalDownloadUrl,
              appUrl,
              isOwner: true,
            });
            sendUserEmail(owner, ownerEmailData, ownerIcs, `termin_${type}.ics`);
          }
        }
      }
    }
  } catch (err) {
    console.error("[Email Notification Update Error]", err);
    console.error("[Email Notification Update Error]", err?.message || err, err?.stack || "");
  }
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
