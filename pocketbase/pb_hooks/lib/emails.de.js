module.exports = (function () {
  const lendingConditionsLink = $os.getenv("CONFIG_LENDING_CONDITIONS_LINK");
  const getBrandName = () => $app.settings().meta.appName || $os.getenv("CONFIG_APP_NAME") || "Leihbase";
  const getAppLogo = () => $os.getenv("CONFIG_APP_LOGO") || "";
  /**
   * German email templates (proxies to the unified localized email engine).
   */
  module.exports = require(`${__hooks}/lib/emails`).getEmails("de");

  const WEEKDAYS_DE = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];

  function formatDate(date, withWeekday = false) {
    if (!date) return "";
    let y, m, d, dayOfWeek;
    if (typeof date === "string") {
      const clean = date.split("T")[0].split(" ")[0];
      const parts = clean.split("-");
      if (parts.length === 3) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
        const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
        dayOfWeek = dt.getUTCDay();
      }
    }
    if (y === undefined || isNaN(y)) {
      const dt = date instanceof Date ? date : new Date(date);
      if (isNaN(dt.getTime())) return String(date);
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
      dayOfWeek = dt.getDay();
    }
    const dayStr = String(d).padStart(2, "0");
    const monthStr = String(m).padStart(2, "0");
    const formatted = `${dayStr}.${monthStr}.${y}`;
    if (withWeekday && dayOfWeek !== undefined && WEEKDAYS_DE[dayOfWeek]) {
      return `${WEEKDAYS_DE[dayOfWeek]}, ${formatted}`;
    }
    return formatted;
  }

  function formatCurrency(n) {
    return `€${Math.round(n)}`;
  }

  const reservationConfirmationEmail = ({
    userName,
    productUrl,
    productName,
    start,
    end,
    deposit,
  }) => ({
    subject: `Reservierungsbestätigung für ${productName}`,
    html: `Hi ${userName},<br>
<br>
hiermit bestätigen wir die Reservierung des Gegenstandes
"<a href="${productUrl}">${productName}</a>"<br>
<br>
Deine Reservierung läuft vom ${formatDate(start)} bis zum ${formatDate(end)}.<br>
<br>
Der Gegenstand kann am ${formatDate(start)} abgeholt werden. Wenn es das erste
Mal ist, dass du etwas ausleihst, werden wir dich vor Ort bitten
${lendingConditionsLink
        ? `<a href="${lendingConditionsLink}">die Leihbedingungen</a>`
        : "die Leihbedingungen"
      } zu unterschreiben und uns deinen Ausweis zum Abgleich zu zeigen.<br>
<br>
${deposit
        ? `Für die Ausleihe von '${productName}' wird ein Pfand von ${formatCurrency(
          deposit
        )} verlangt. Bitte bringe den Betrag, wenn möglich, passend mit.<br>
  <br>`
        : ""
      }
Deine Reservierung stornieren oder die Leihfrist ändern kannst du in deiner
<a href="${$app.settings().meta.appURL}/reservations">Reservierungsübersicht</a>.<br>
<br>
Wir freuen uns, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Bis bald<br>
Deine ${getBrandName()}`,
  });

  const reservationConfirmationLocationEmail = ({
    productUrl,
    productName,
    userName,
    userEmail,
    start,
    end,
    message,
  }) => ({
    subject: `Neue Reservierung: ${userName} - ${productName}`,
    html: `Hi,<br>
<br>
Eine neue Reservierung von ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>).<br>
<br>
<strong>Details</strong><br>
Gegenstand: <a href="${productUrl}">${productName}</a><br>
Beginn: ${formatDate(start)}<br>
Ende: ${formatDate(end)}<br>
${message
        ? `<br>
      ${userName} schreibt:<br>
      <blockquote>
        ${message.replace(/\n/g, "<br>")}<br>
        </blockquote>`
        : ""
      }`,
  });

  const reservationStartReminderEmail = ({
    userName,
    locationName,
    productName,
    start,
    startHour,
    endHour,
  }) => ({
    subject: `Abholung von '${productName}'`,
    html: `Hi ${userName},<br>
<br>
du hast bei ${locationName} den Gegenstand '${productName}' reserviert. Der Gegenstand kann morgen
(${formatDate(start)}) ${startHour && endHour ? `zwischen ${startHour} und ${endHour}` : ""} abgeholt werden.<br>
Falls du ihn nicht mehr benötigst, kannst du deine Reservierung in deiner
<a href="${$app.settings().meta.appURL}/reservations">Reservierungsübersicht</a> stornieren.<br>
<br>
Danke, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Bis bald<br>
Dein ${getBrandName()}-Team<br>`,
  });

  const reservationEndReminderEmail = ({
    userName,
    locationName,
    productName,
    end,
    startHour,
    endHour,
  }) => ({
    subject: `Rückgabe von '${productName}'`,
    html: `Hi ${userName},<br>
<br>
wir hoffen, mit dem Gegenstand '${productName}' hat alles gut geklappt!
<br>
Die Leihfrist endet morgen (${formatDate(end)}), daher möchten wir dich an die Rückgabe bei ${locationName} erinnern.<br>
<br>
${startHour && endHour
        ? `${locationName} ist morgen geöffnet von ${startHour} bis ${endHour}.<br>
<br>`
        : ""
      }
Falls du den Gegenstand länger behalten möchtest, kannst du die Reservierung in deiner
<a href="${$app.settings().meta.appURL}/reservations">Reservierungsübersicht</a> verlängern.<br>
<br>
Vielen Dank und bis morgen!<br>
Dein ${getBrandName()}-Team`,
  });

  const cancellationConfirmationEmail = ({
    userName,
    productUrl,
    productName,
  }) => ({
    subject: `Stornierungsbestätigung für ${productName}`,
    html: `Hi ${userName},<br>
<br>
hiermit bestätigen wir die Stornierung deiner Reservierung für den Gegenstand "<a href="${productUrl}">${productName}</a>".<br>
<br>
Danke fürs Teilen, der Gegenstand ist nun wieder für Nachbar:innen verfügbar!<br>
<br>
Bis zum nächsten Mal!<br>
<br>
Deine ${getBrandName()}`,
  });

  const reservationCancellationLocationEmail = ({
    productUrl,
    productName,
    userName,
    userEmail,
    start,
    end,
  }) => ({
    subject: `Stornierung: ${userName} - ${productName}`,
    html: `Die Reservierung von ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>) für den Gegenstand "${productName}" wurde storniert.<br>
<br>
<strong>Details</strong><br>
Gegenstand: <a href="${productUrl}">${productName}</a><br>
Beginn: ${formatDate(start)}<br>
Ende: ${formatDate(end)}`,
  });

  function emailLayout({ title, content, buttonText, buttonUrl, appUrl }) {
    const brandName = getBrandName();
    const appLogo = getAppLogo();
    const baseUrl = appUrl || $app.settings().meta.appURL || "http://localhost:3000";

    let logoHtml = `<span style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; display: inline-block;">🌱 ${brandName}</span>`;
    if (appLogo) {
      const fullLogoUrl = appLogo.startsWith("http://") || appLogo.startsWith("https://") || appLogo.startsWith("data:")
        ? appLogo
        : `${baseUrl.replace(/\/+$/, "")}/${appLogo.replace(/^\/+/, "")}`;
      logoHtml = `<img src="${fullLogoUrl}" alt="${brandName}" style="max-height: 40px; max-width: 200px; display: block; border: 0;" />`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #212529;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef;">
          <tr>
            <td style="background-color: #2b8a3e; padding: 20px 28px; text-align: left;">
              <a href="${baseUrl}" style="text-decoration: none; display: inline-block;">
                ${logoHtml}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 20px 28px; line-height: 1.6; font-size: 15px;">
              ${content}
              ${buttonText && buttonUrl ? `
              <div style="margin: 26px 0 16px 0; text-align: center;">
                <a href="${buttonUrl}" style="background-color: #2b8a3e; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  ${buttonText}
                </a>
              </div>
              <p style="font-size: 12px; color: #868e96; margin-top: 15px; text-align: center; word-break: break-all;">
                Falls der Button oben nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
                <a href="${buttonUrl}" style="color: #2b8a3e;">${buttonUrl}</a>
              </p>
              ` : ""}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 16px 28px; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96; text-align: center;">
              Nachbarschaftlich teilen mit <a href="${baseUrl}" style="color: #2b8a3e; text-decoration: none;">${brandName}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  // --- P2P Notification Emails ---

  const p2pNewRequestOwnerEmail = ({
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
  }) => {
    const title = `Neue Verleihanfrage für "${productName}"`;
    const requestsUrl = `${appUrl}/profile/requests`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${ownerName},</h2>
      <p><strong>${borrowerName}</strong> möchte deinen Gegenstand <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> ausleihen.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #495057; width: 110px;"><strong>Gegenstand:</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Zeitraum:</strong></td><td style="padding: 4px 0;">${formatDate(start)} – ${formatDate(end)}</td></tr>
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Ausleiher:</strong></td><td style="padding: 4px 0;">${borrowerName}</td></tr>
          ${borrowerAddress ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>Standort:</strong></td><td style="padding: 4px 0;">${borrowerAddress}</td></tr>` : ''}
          ${message ? `<tr><td style="padding: 4px 0; color: #495057; vertical-align: top;"><strong>Nachricht:</strong></td><td style="padding: 4px 0; font-style: italic;">“${message}”</td></tr>` : ''}
        </table>
      </div>

      <p>Antworte direkt mit 1 Klick aus dieser E-Mail:</p>

      ${acceptUrl && declineUrl ? `
        <div style="margin: 18px 0 20px 0;">
          <a href="${acceptUrl}" style="display: inline-block; padding: 10px 18px; background-color: #2b8a3e; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; margin-right: 10px; margin-bottom: 8px;">
            ✅ Anfrage annehmen
          </a>
          <a href="${declineUrl}" style="display: inline-block; padding: 10px 16px; background-color: #f1f3f5; color: #e03131; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px; border: 1px solid #dee2e6; margin-bottom: 8px;">
            ❌ Ablehnen
          </a>
        </div>
      ` : ''}
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Anfrage im Portal ansehen", buttonUrl: requestsUrl, appUrl }),
    };
  };

  const p2pRequestSubmittedBorrowerEmail = ({
    borrowerName,
    ownerName,
    productName,
    productUrl,
    start,
    end,
    deposit,
    appUrl,
  }) => {
    const title = `Verleihanfrage für "${productName}" versendet`;
    const reservationsUrl = `${appUrl}/reservations`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${borrowerName},</h2>
      <p>deine Anfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> wurde an <strong>${ownerName}</strong> übermittelt.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #495057; width: 110px;"><strong>Gegenstand:</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Zeitraum:</strong></td><td style="padding: 4px 0;">${formatDate(start)} – ${formatDate(end)}</td></tr>
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Verleiher:</strong></td><td style="padding: 4px 0;">${ownerName}</td></tr>
          ${deposit ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>Pfand:</strong></td><td style="padding: 4px 0;">${formatCurrency(deposit)}</td></tr>` : ''}
        </table>
      </div>

      <p>Sobald ${ownerName} die Anfrage bestätigt, erhältst du eine E-Mail mit der genauen Abholadresse.</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Meine Reservierungen ansehen", buttonUrl: reservationsUrl, appUrl }),
    };
  };

  const p2pRequestAcceptedBorrowerEmail = ({
    borrowerName,
    ownerName,
    productName,
    productUrl,
    start,
    end,
    handoverAddress,
    deposit,
    appUrl,
  }) => {
    const title = `Angenommen! Ausleihe für "${productName}" bestätigt`;
    const reservationsUrl = `${appUrl}/reservations`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${borrowerName},</h2>
      <p>Tolle Neuigkeiten! <strong>${ownerName}</strong> hat deine Verleihanfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> angenommen.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #495057; width: 120px;"><strong>Gegenstand:</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Zeitraum:</strong></td><td style="padding: 4px 0;">${formatDate(start)} – ${formatDate(end)}</td></tr>
          ${handoverAddress ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>Abholadresse:</strong></td><td style="padding: 4px 0; font-weight: bold; color: #2b8a3e;">${handoverAddress}</td></tr>` : ''}
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Verleiher:</strong></td><td style="padding: 4px 0;">${ownerName}</td></tr>
          ${deposit ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>Pfand:</strong></td><td style="padding: 4px 0;">${formatCurrency(deposit)} (bitte passend mitbringen)</td></tr>` : ''}
        </table>
      </div>

      <p>Du kannst den Gegenstand zum vereinbarten Termin abholen. Details findest du jederzeit im Portal:</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Abholadresse & Details ansehen", buttonUrl: reservationsUrl, appUrl }),
    };
  };

  const p2pRequestDeclinedBorrowerEmail = ({
    borrowerName,
    ownerName,
    productName,
    productUrl,
    start,
    end,
    appUrl,
  }) => {
    const title = `Verleihanfrage für "${productName}" abgelehnt`;
    const homeUrl = `${appUrl}/`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${borrowerName},</h2>
      <p>leider konnte <strong>${ownerName}</strong> deine Anfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${formatDate(start)} – ${formatDate(end)}) nicht annehmen.</p>
      <p>Vielleicht findest du einen passenden Ersatzgegenstand in deiner Nachbarschaft:</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Weitere Gegenstände entdecken", buttonUrl: homeUrl, appUrl }),
    };
  };

  const p2pReservationCancelledEmail = ({
    recipientName,
    cancellerName,
    productName,
    productUrl,
    start,
    end,
    appUrl,
    isOwner,
  }) => {
    const title = `Stornierung: Ausleihe für "${productName}"`;
    const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${recipientName},</h2>
      <p>die Reservierung für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${formatDate(start)} – ${formatDate(end)}) wurde von <strong>${cancellerName}</strong> storniert.</p>
      <p>Der Gegenstand ist nun wieder verfügbar.</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Übersicht öffnen", buttonUrl: targetUrl, appUrl }),
    };
  };

  const p2pItemStartedBorrowerEmail = ({
    borrowerName,
    ownerName,
    productName,
    end,
    appUrl,
  }) => {
    const title = `Übergabe bestätigt: "${productName}"`;
    const reservationsUrl = `${appUrl}/reservations`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${borrowerName},</h2>
      <p><strong>${ownerName}</strong> hat die Übergabe von <strong>${productName}</strong> an dich bestätigt. Viel Freude damit!</p>
      <p>Bitte denke daran, den Gegenstand bis zum <strong>${formatDate(end)}</strong> an ${ownerName} zurückzugeben.</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Reservierungsübersicht", buttonUrl: reservationsUrl, appUrl }),
    };
  };

  const p2pItemEndedBorrowerEmail = ({
    borrowerName,
    ownerName,
    productName,
    appUrl,
  }) => {
    const title = `Rückgabe bestätigt: "${productName}"`;
    const homeUrl = `${appUrl}/`;
    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${borrowerName},</h2>
      <p><strong>${ownerName}</strong> hat die Rückgabe von <strong>${productName}</strong> bestätigt.</p>
      <p>Vielen Dank für das nachbarschaftliche Teilen und Ausleihen!</p>
    `;
    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: `Zur ${getBrandName()}`, buttonUrl: homeUrl, appUrl }),
    };
  };

  const p2pTimeslotProposedEmail = ({
    recipientName,
    senderName,
    productName,
    productUrl,
    type,
    slots,
    appUrl,
    isOwner,
  }) => {
    const isPickup = type !== "return";
    const typeLabel = isPickup ? "Übergabe" : "Rückgabe";
    const title = `Neuer Terminvorschlag für die ${typeLabel}: "${productName}"`;
    const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;

    const slotsHtml = (slots || [])
      .map(
        (s) =>
          `<tr>
            <td style="padding: 10px 0; border-bottom: 1px dashed #dee2e6;">
              <div style="font-size: 14px; color: #212529; margin-bottom: 6px;">
                📅 <strong>${formatDate(s.date, true)}</strong>: ${s.startTime} – ${s.endTime} Uhr ${s.label ? `<span style="color: #6c757d;">(${s.label})</span>` : ""}
              </div>
              ${s.confirmUrl ? `
                <a href="${s.confirmUrl}" style="display: inline-block; padding: 6px 14px; background-color: #2b8a3e; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: bold; border-radius: 4px;">
                  ✅ Diesen Termin annehmen
                </a>
              ` : ''}
            </td>
          </tr>`
      )
      .join("");

    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${recipientName},</h2>
      <p><strong>${senderName}</strong> hat Zeitfenster für die <strong>${typeLabel}</strong> von <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> vorgeschlagen:</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          ${slotsHtml}
        </table>
      </div>

      <p>Du kannst einen Termin direkt mit 1 Klick oben annehmen oder im Portal alternative Zeiten vorschlagen:</p>
    `;

    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Terminabsprache im Portal öffnen", buttonUrl: targetUrl, appUrl }),
    };
  };

  const p2pTimeslotConfirmedEmail = ({
    recipientName,
    confirmedByName,
    counterpartyName,
    counterpartyRole,
    productName,
    productUrl,
    type,
    slot,
    location,
    googleCalUrl,
    icalDownloadUrl,
    appUrl,
    isOwner,
  }) => {
    const isPickup = type !== "return";
    const typeLabel = isPickup ? "Übergabetermin" : "Rückgabetermin";
    const title = `Termin vereinbart: ${typeLabel} für "${productName}"`;
    const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;

    const content = `
      <h2 style="margin-top: 0; color: #212529; font-size: 18px;">Hallo ${recipientName},</h2>
      <p>der <strong>${typeLabel}</strong> für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> wurde verbindlich vereinbart!</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #495057; width: 130px;"><strong>Gegenstand:</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
          ${counterpartyName ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${counterpartyRole || "Partner"}:</strong></td><td style="padding: 4px 0;">${counterpartyName}</td></tr>` : ""}
          <tr><td style="padding: 4px 0; color: #495057;"><strong>Termin:</strong></td><td style="padding: 4px 0; font-weight: bold; color: #2b8a3e;">${formatDate(slot.date, true)}, ${slot.startTime} – ${slot.endTime} Uhr ${slot.label ? `(${slot.label})` : ""}</td></tr>
          ${location ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>Treffpunkt / Ort:</strong></td><td style="padding: 4px 0;">📍 ${location}</td></tr>` : ""}
        </table>
      </div>

      <div style="background-color: #e7f5ff; border: 1px solid #a5d8ff; border-radius: 6px; padding: 14px 16px; margin: 20px 0; text-align: center;">
          📅 Termin nicht vergessen – jetzt im Kalender speichern:
        </div>
        <div style="margin-bottom: 6px;">
          ${googleCalUrl ? `<a href="${googleCalUrl}" target="_blank" style="display: inline-block; background-color: #1971c2; color: #ffffff; text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: 600; font-size: 13px; margin: 4px;">📅 Google Kalender</a>` : ""}
          ${icalDownloadUrl ? `<a href="${icalDownloadUrl}" style="display: inline-block; background-color: #ffffff; color: #1971c2; border: 1px solid #1971c2; text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: 600; font-size: 13px; margin: 4px;">🍎 Apple / Outlook (.ics)</a>` : ""}
        </div>
        <small style="color: #6c757d; display: block; margin-top: 6px; font-size: 11px;">
          (Der Kalendereintrag ist auch als .ics-Datei an diese E-Mail angehängt)
        </small>
      </div>

      <p>Alle weiteren Details und Status-Updates findest du in deiner Übersicht im Portal:</p>
    `;

    return {
      subject: title,
      html: emailLayout({ title, content, buttonText: "Reservierung im Portal ansehen", buttonUrl: targetUrl, appUrl }),
    };
  };

  return {
    reservationConfirmationEmail,
    reservationConfirmationLocationEmail,
    reservationStartReminderEmail,
    reservationEndReminderEmail,
    cancellationConfirmationEmail,
    reservationCancellationLocationEmail,
    p2pNewRequestOwnerEmail,
    p2pRequestSubmittedBorrowerEmail,
    p2pRequestAcceptedBorrowerEmail,
    p2pRequestDeclinedBorrowerEmail,
    p2pReservationCancelledEmail,
    p2pItemStartedBorrowerEmail,
    p2pItemEndedBorrowerEmail,
    p2pTimeslotProposedEmail,
    p2pTimeslotConfirmedEmail,
  };
})();
