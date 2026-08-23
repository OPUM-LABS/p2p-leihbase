/**
 * Unified, localized email template engine for Leihbase.
 * Single source of truth for both HTML structure and localized translations (de, en).
 */

module.exports = (function () {
  const getBrandName = () => $app.settings().meta.appName || $os.getenv("CONFIG_APP_NAME") || "Leihbase";
  const getAppLogo = () => $os.getenv("CONFIG_APP_LOGO") || "";
  const getLendingConditionsLink = () => $os.getenv("CONFIG_LENDING_CONDITIONS_LINK");

  const WEEKDAYS = {
    de: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  function formatDate(date, locale = "de", withWeekday = false) {
    if (!date) return "";
    const isDe = !locale || locale.toLowerCase().startsWith("de");
    const weekdayList = isDe ? WEEKDAYS.de : WEEKDAYS.en;

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
    const formatted = isDe ? `${dayStr}.${monthStr}.${y}` : `${dayStr}/${monthStr}/${y}`;
    if (withWeekday && dayOfWeek !== undefined && weekdayList[dayOfWeek]) {
      return `${weekdayList[dayOfWeek]}, ${formatted}`;
    }
    return formatted;
  }

  function formatCurrency(n) {
    return `€${Math.round(n)}`;
  }

  /**
   * Standard email HTML layout wrapper.
   */
  function emailLayout({ title, content, buttonText, buttonUrl, appUrl, locale = "de" }) {
    const isDe = !locale || locale.toLowerCase().startsWith("de");
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

    const fallbackLinkText = isDe
      ? `Falls der Button oben nicht funktioniert, kopiere diesen Link in deinen Browser:<br><a href="${buttonUrl}" style="color: #2b8a3e;">${buttonUrl}</a>`
      : `If the button above does not work, copy and paste this link into your browser:<br><a href="${buttonUrl}" style="color: #2b8a3e;">${buttonUrl}</a>`;

    const footerText = isDe
      ? `Nachbarschaftlich teilen mit <a href="${baseUrl}" style="color: #2b8a3e; text-decoration: none;">${brandName}</a>`
      : `Neighbourhood sharing with <a href="${baseUrl}" style="color: #2b8a3e; text-decoration: none;">${brandName}</a>`;

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
                ${fallbackLinkText}
              </p>
              ` : ""}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 16px 28px; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96; text-align: center;">
              ${footerText}
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

  /**
   * Creates a template collection bound to a specific language ('de' or 'en').
   */
  function getEmails(locale = "de") {
    const isDe = !locale || locale.toLowerCase().startsWith("de");
    const fmt = (d, withWd = false) => formatDate(d, locale, withWd);
    const lendingConditionsLink = getLendingConditionsLink();
    const brandName = getBrandName();

    return {
      formatDate: fmt,
      formatCurrency,

      reservationConfirmationEmail: ({
        userName,
        productUrl,
        productName,
        start,
        end,
        deposit,
      }) => {
        const appUrl = $app.settings().meta.appURL;
        if (isDe) {
          return {
            subject: `Reservierungsbestätigung für ${productName}`,
            html: `Hi ${userName},<br>
<br>
hiermit bestätigen wir die Reservierung des Gegenstandes
"<a href="${productUrl}">${productName}</a>"<br>
<br>
Deine Reservierung läuft vom ${fmt(start)} bis zum ${fmt(end)}.<br>
<br>
Der Gegenstand kann am ${fmt(start)} abgeholt werden. Wenn es das erste
Mal ist, dass du etwas ausleihst, werden wir dich vor Ort bitten
${lendingConditionsLink ? `<a href="${lendingConditionsLink}">die Leihbedingungen</a>` : "die Leihbedingungen"} zu unterschreiben und uns deinen Ausweis zum Abgleich zu zeigen.<br>
<br>
${deposit ? `Für die Ausleihe von '${productName}' wird ein Pfand von ${formatCurrency(deposit)} verlangt. Bitte bringe den Betrag, wenn möglich, passend mit.<br><br>` : ""}
Deine Reservierung stornieren oder die Leihfrist ändern kannst du in deiner
<a href="${appUrl}/reservations">Reservierungsübersicht</a>.<br>
<br>
Wir freuen uns, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Bis bald<br>
Deine ${brandName}`,
          };
        } else {
          return {
            subject: `Reservation confirmation of '${productName}'`,
            html: `Hi ${userName},<br>
<br>
We hereby confirm the reservation of the item
"<a href="${productUrl}">${productName}</a>"<br>
<br>
Your reservation runs from ${fmt(start)} to ${fmt(end)}.<br>
<br>
The item can be picked up at ${fmt(start)}. If it is the first time that
you are borrowing something, we will ask you to sign the ${lendingConditionsLink ? `<a href="${lendingConditionsLink}">terms and conditions</a>` : "terms and conditions"} of borrowing on site.<br>
<br>
${deposit ? `A deposit of ${formatCurrency(deposit)} is required to borrow ${productName}. Please bring the exact amount if possible.<br><br>` : ""}
You can cancel your reservation or change the borrowing period in your
<a href="${appUrl}/reservations">reservation overview</a>.<br>
<br>
We're happy that you have decided to borrow instead of buy!<br>
<br>
See you soon<br>
Your ${brandName}`,
          };
        }
      },

      reservationConfirmationLocationEmail: ({
        productUrl,
        productName,
        userName,
        userEmail,
        start,
        end,
        message,
      }) => {
        if (isDe) {
          return {
            subject: `Neue Reservierung: ${userName} - ${productName}`,
            html: `Hi,<br>
<br>
Eine neue Reservierung von ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>).<br>
<br>
<strong>Details</strong><br>
Gegenstand: <a href="${productUrl}">${productName}</a><br>
Beginn: ${fmt(start)}<br>
Ende: ${fmt(end)}<br>
${message ? `<br>${userName} schreibt:<br><blockquote>${message.replace(/\n/g, "<br>")}<br></blockquote>` : ""}`,
          };
        } else {
          return {
            subject: `New reservation: ${userName} - ${productName}`,
            html: `Hi,<br>
<br>
A new reservation by ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>).<br>
<br>
<strong>Details</strong><br>
Item: <a href="${productUrl}">${productName}</a><br>
Start: ${fmt(start)}<br>
End: ${fmt(end)}<br>
${message ? `<br>${userName} writes:<br><blockquote>${message.replace(/\n/g, "<br>")}<br></blockquote>` : ""}`,
          };
        }
      },

      reservationStartReminderEmail: ({
        userName,
        locationName,
        productName,
        start,
        startHour,
        endHour,
      }) => {
        const appUrl = $app.settings().meta.appURL;
        if (isDe) {
          return {
            subject: `Abholung von '${productName}'`,
            html: `Hi ${userName},<br>
<br>
du hast bei ${locationName} den Gegenstand '${productName}' reserviert. Der Gegenstand kann morgen
(${fmt(start)}) ${startHour && endHour ? `zwischen ${startHour} und ${endHour}` : ""} abgeholt werden.<br>
Falls du ihn nicht mehr benötigst, kannst du deine Reservierung in deiner
<a href="${appUrl}/reservations">Reservierungsübersicht</a> stornieren.<br>
<br>
Danke, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Bis bald<br>
Dein ${brandName}-Team<br>`,
          };
        } else {
          return {
            subject: `Pick-up of '${productName}'`,
            html: `Hi ${userName},<br>
<br>
you reserved a ${productName} at ${locationName}. The item can be picked up tomorrow
(${fmt(start)}) ${startHour && endHour ? `between ${startHour} and ${endHour}` : ""}.<br>
If you no longer need it, you can cancel your reservation in your
<a href="${appUrl}/reservations">reservation overview</a>.<br>
<br>
Thank you that you choose for borrowing instead of buying!<br>
<br>
See you soon<br>
Your ${brandName}<br>`,
          };
        }
      },

      reservationEndReminderEmail: ({
        userName,
        locationName,
        productName,
        end,
        startHour,
        endHour,
      }) => {
        const appUrl = $app.settings().meta.appURL;
        if (isDe) {
          return {
            subject: `Rückgabe von '${productName}'`,
            html: `Hi ${userName},<br>
<br>
wir hoffen, mit dem Gegenstand '${productName}' hat alles gut geklappt!
<br>
Die Leihfrist endet morgen (${fmt(end)}), daher möchten wir dich an die Rückgabe bei ${locationName} erinnern.<br>
<br>
${startHour && endHour ? `${locationName} ist morgen geöffnet von ${startHour} bis ${endHour}.<br><br>` : ""}
Falls du den Gegenstand länger behalten möchtest, kannst du die Reservierung in deiner
<a href="${appUrl}/reservations">Reservierungsübersicht</a> verlängern.<br>
<br>
Vielen Dank und bis morgen!<br>
Dein ${brandName}-Team`,
          };
        } else {
          return {
            subject: `Return of '${productName}'`,
            html: `Hi ${userName},<br>
<br>
we hope everything worked out well with the item '${productName}'!
<br>
The borrow-period ends tomorrow (${fmt(end)}), so we would like to
remind you of returning it to ${locationName}.<br>
<br>
${startHour && endHour ? `${locationName} is tomorrow open from ${startHour} to ${endHour}.<br><br>` : ""}
If you would like to keep the item for longer, you can extend the reservation in your
<a href="${appUrl}/reservations">reservation overview</a>.<br>
<br>
Thank you, and see you tomorrow!<br>
Your ${brandName} Team`,
          };
        }
      },

      cancellationConfirmationEmail: ({
        userName,
        productUrl,
        productName,
      }) => {
        if (isDe) {
          return {
            subject: `Stornierungsbestätigung für ${productName}`,
            html: `Hi ${userName},<br>
<br>
hiermit bestätigen wir die Stornierung deiner Reservierung für den Gegenstand "<a href="${productUrl}">${productName}</a>".<br>
<br>
Danke fürs Teilen, der Gegenstand ist nun wieder für Nachbar:innen verfügbar!<br>
<br>
Bis zum nächsten Mal!<br>
<br>
Deine ${brandName}`,
          };
        } else {
          return {
            subject: `Cancellation confirmation for ${productName}`,
            html: `Hi ${userName},<br>
<br>
We hereby confirm the cancellation of your reservation for the item "<a href="${productUrl}">${productName}</a>".<br>
<br>
Thanks for sharing, the item is now available again for other neighbours!<br>
<br>
See you next time!<br>
<br>
Your ${brandName}`,
          };
        }
      },

      reservationCancellationLocationEmail: ({
        productUrl,
        productName,
        userName,
        userEmail,
        start,
        end,
      }) => {
        if (isDe) {
          return {
            subject: `Stornierung: ${userName} - ${productName}`,
            html: `Die Reservierung von ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>) für den Gegenstand "${productName}" wurde storniert.<br>
<br>
<strong>Details</strong><br>
Gegenstand: <a href="${productUrl}">${productName}</a><br>
Beginn: ${fmt(start)}<br>
Ende: ${fmt(end)}`,
          };
        } else {
          return {
            subject: `Cancellation: ${userName} - ${productName}`,
            html: `The reservation of ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>) for the item "${productName}" has been cancelled.<br>
<br>
<strong>Details</strong><br>
Item: <a href="${productUrl}">${productName}</a><br>
Start: ${fmt(start)}<br>
End: ${fmt(end)}`,
          };
        }
      },

      p2pNewRequestOwnerEmail: ({
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
        const title = isDe
          ? `Neue Verleihanfrage für "${productName}"`
          : `New lending request for "${productName}"`;
        const requestsUrl = `${appUrl}/profile/requests`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${ownerName},` : `Hi ${ownerName},`}</h2>
          <p>${isDe
            ? `<strong>${borrowerName}</strong> möchte deinen Gegenstand <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> ausleihen.`
            : `<strong>${borrowerName}</strong> wants to borrow your item <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong>.`}</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #495057; width: 110px;"><strong>${isDe ? "Gegenstand:" : "Item:"}</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Zeitraum:" : "Period:"}</strong></td><td style="padding: 4px 0;">${fmt(start)} – ${fmt(end)}</td></tr>
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Ausleiher:" : "Borrower:"}</strong></td><td style="padding: 4px 0;">${borrowerName}</td></tr>
              ${borrowerAddress ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Standort:" : "Location:"}</strong></td><td style="padding: 4px 0;">${borrowerAddress}</td></tr>` : ""}
              ${message ? `<tr><td style="padding: 4px 0; color: #495057; vertical-align: top;"><strong>${isDe ? "Nachricht:" : "Message:"}</strong></td><td style="padding: 4px 0; font-style: italic;">“${message}”</td></tr>` : ""}
            </table>
          </div>

          <p>${isDe ? "Antworte direkt mit 1 Klick aus dieser E-Mail:" : "Respond with 1-click directly from this email:"}</p>

          ${acceptUrl && declineUrl ? `
            <div style="margin: 18px 0 20px 0;">
              <a href="${acceptUrl}" style="display: inline-block; padding: 10px 18px; background-color: #2b8a3e; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; margin-right: 10px; margin-bottom: 8px;">
                ${isDe ? "✅ Anfrage annehmen" : "✅ Accept Request"}
              </a>
              <a href="${declineUrl}" style="display: inline-block; padding: 10px 16px; background-color: #f1f3f5; color: #e03131; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px; border: 1px solid #dee2e6; margin-bottom: 8px;">
                ${isDe ? "❌ Ablehnen" : "❌ Decline"}
              </a>
            </div>
          ` : ""}
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Anfrage im Portal ansehen" : "Review in Portal",
            buttonUrl: requestsUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pRequestSubmittedBorrowerEmail: ({
        borrowerName,
        ownerName,
        productName,
        productUrl,
        start,
        end,
        deposit,
        appUrl,
      }) => {
        const title = isDe
          ? `Verleihanfrage für "${productName}" versendet`
          : `Lending request for "${productName}" submitted`;
        const reservationsUrl = `${appUrl}/reservations`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${borrowerName},` : `Hi ${borrowerName},`}</h2>
          <p>${isDe
            ? `deine Anfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> wurde an <strong>${ownerName}</strong> übermittelt.`
            : `Your request for <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> has been sent to <strong>${ownerName}</strong>.`}</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #495057; width: 110px;"><strong>${isDe ? "Gegenstand:" : "Item:"}</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Zeitraum:" : "Period:"}</strong></td><td style="padding: 4px 0;">${fmt(start)} – ${fmt(end)}</td></tr>
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Verleiher:" : "Lender:"}</strong></td><td style="padding: 4px 0;">${ownerName}</td></tr>
              ${deposit ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Pfand:" : "Deposit:"}</strong></td><td style="padding: 4px 0;">${formatCurrency(deposit)}</td></tr>` : ""}
            </table>
          </div>

          <p>${isDe
            ? `Sobald ${ownerName} die Anfrage bestätigt, erhältst du eine E-Mail mit der genauen Abholadresse.`
            : `As soon as ${ownerName} approves your request, you will receive an email with the pickup address.`}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Meine Reservierungen ansehen" : "View My Rentals",
            buttonUrl: reservationsUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pRequestAcceptedBorrowerEmail: ({
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
        const title = isDe
          ? `Angenommen! Ausleihe für "${productName}" bestätigt`
          : `Approved! Rental for "${productName}" confirmed`;
        const reservationsUrl = `${appUrl}/reservations`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${borrowerName},` : `Hi ${borrowerName},`}</h2>
          <p>${isDe
            ? `Tolle Neuigkeiten! <strong>${ownerName}</strong> hat deine Verleihanfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> angenommen.`
            : `Great news! <strong>${ownerName}</strong> has accepted your request for <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong>.`}</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #495057; width: 120px;"><strong>${isDe ? "Gegenstand:" : "Item:"}</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Zeitraum:" : "Period:"}</strong></td><td style="padding: 4px 0;">${fmt(start)} – ${fmt(end)}</td></tr>
              ${handoverAddress ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Abholadresse:" : "Pickup address:"}</strong></td><td style="padding: 4px 0; font-weight: bold; color: #2b8a3e;">${handoverAddress}</td></tr>` : ""}
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Verleiher:" : "Lender:"}</strong></td><td style="padding: 4px 0;">${ownerName}</td></tr>
              ${deposit ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Pfand:" : "Deposit:"}</strong></td><td style="padding: 4px 0;">${formatCurrency(deposit)} ${isDe ? "(bitte passend mitbringen)" : "(please bring exact amount)"}</td></tr>` : ""}
            </table>
          </div>

          <p>${isDe
            ? "Du kannst den Gegenstand zum vereinbarten Termin abholen. Details findest du jederzeit im Portal:"
            : "You can pick up the item at the agreed date. You can view full details in your overview at any time:"}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Abholadresse & Details ansehen" : "View Pickup Address & Details",
            buttonUrl: reservationsUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pRequestDeclinedBorrowerEmail: ({
        borrowerName,
        ownerName,
        productName,
        productUrl,
        start,
        end,
        appUrl,
      }) => {
        const title = isDe
          ? `Verleihanfrage für "${productName}" abgelehnt`
          : `Lending request for "${productName}" declined`;
        const homeUrl = `${appUrl}/`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${borrowerName},` : `Hi ${borrowerName},`}</h2>
          <p>${isDe
            ? `leider konnte <strong>${ownerName}</strong> deine Anfrage für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${fmt(start)} – ${fmt(end)}) nicht annehmen.`
            : `Unfortunately, <strong>${ownerName}</strong> could not accept your lending request for <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${fmt(start)} – ${fmt(end)}).`}</p>
          <p>${isDe
            ? "Vielleicht findest du einen passenden Ersatzgegenstand in deiner Nachbarschaft:"
            : "You may find another matching item in your neighborhood:"}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Weitere Gegenstände entdecken" : "Browse More Items",
            buttonUrl: homeUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pReservationCancelledEmail: ({
        recipientName,
        cancellerName,
        cancelledByName,
        productName,
        productUrl,
        start,
        end,
        appUrl,
        isOwner,
      }) => {
        const title = isDe
          ? `Stornierung: Ausleihe für "${productName}"`
          : `Cancellation: Rental for "${productName}"`;
        const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;
        const actor = cancellerName || cancelledByName || (isDe ? "der Ausleiher / Verleiher" : "the user");

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${recipientName},` : `Hi ${recipientName},`}</h2>
          <p>${isDe
            ? `die Reservierung für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${fmt(start)} – ${fmt(end)}) wurde von <strong>${actor}</strong> storniert.`
            : `The reservation for <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> (${fmt(start)} – ${fmt(end)}) was cancelled by <strong>${actor}</strong>.`}</p>
          <p>${isDe ? "Der Gegenstand ist nun wieder verfügbar." : "The item is now available again."}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Übersicht öffnen" : "Open Overview",
            buttonUrl: targetUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pItemStartedBorrowerEmail: ({
        borrowerName,
        ownerName,
        productName,
        end,
        appUrl,
      }) => {
        const title = isDe
          ? `Übergabe bestätigt: "${productName}"`
          : `Handover confirmed: "${productName}"`;
        const reservationsUrl = `${appUrl}/reservations`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${borrowerName},` : `Hi ${borrowerName},`}</h2>
          <p>${isDe
            ? `<strong>${ownerName}</strong> hat die Übergabe von <strong>${productName}</strong> an dich bestätigt. Viel Freude damit!`
            : `<strong>${ownerName}</strong> has confirmed handing over <strong>${productName}</strong> to you. Enjoy using it!`}</p>
          <p>${isDe
            ? `Bitte denke daran, den Gegenstand bis zum <strong>${fmt(end)}</strong> an ${ownerName} zurückzugeben.`
            : `Please remember to return the item to ${ownerName} by <strong>${fmt(end)}</strong>.`}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Reservierungsübersicht" : "Rental Overview",
            buttonUrl: reservationsUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pItemEndedBorrowerEmail: ({
        borrowerName,
        ownerName,
        productName,
        appUrl,
      }) => {
        const title = isDe
          ? `Rückgabe bestätigt: "${productName}"`
          : `Return confirmed: "${productName}"`;
        const homeUrl = `${appUrl}/`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${borrowerName},` : `Hi ${borrowerName},`}</h2>
          <p>${isDe
            ? `<strong>${ownerName}</strong> hat die Rückgabe von <strong>${productName}</strong> bestätigt.`
            : `<strong>${ownerName}</strong> has confirmed the return of <strong>${productName}</strong>.`}</p>
          <p>${isDe
            ? "Vielen Dank für das nachbarschaftliche Teilen und Ausleihen!"
            : "Thank you for borrowing and sharing in your neighbourhood!"}</p>
        `;
        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? `Zur ${brandName}` : `Back to ${brandName}`,
            buttonUrl: homeUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pTimeslotProposedEmail: ({
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
        const typeLabel = isDe
          ? (isPickup ? "Übergabe" : "Rückgabe")
          : (isPickup ? "handover" : "return");
        const title = isDe
          ? `Neuer Terminvorschlag für die ${typeLabel}: "${productName}"`
          : `New timeslot suggested for ${typeLabel}: "${productName}"`;
        const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;

        const slotsHtml = (slots || [])
          .map(
            (s) =>
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px dashed #dee2e6;">
                  <div style="font-size: 14px; color: #212529; margin-bottom: 6px;">
                    📅 <strong>${fmt(s.date, true)}</strong>: ${s.startTime} – ${s.endTime} ${isDe ? "Uhr" : ""} ${s.label ? `<span style="color: #6c757d;">(${s.label})</span>` : ""}
                  </div>
                  ${s.confirmUrl ? `
                    <a href="${s.confirmUrl}" style="display: inline-block; padding: 6px 14px; background-color: #2b8a3e; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: bold; border-radius: 4px;">
                      ${isDe ? "✅ Diesen Termin annehmen" : "✅ Confirm this timeslot"}
                    </a>
                  ` : ""}
                </td>
              </tr>`
          )
          .join("");

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${recipientName},` : `Hi ${recipientName},`}</h2>
          <p>${isDe
            ? `<strong>${senderName}</strong> hat Zeitfenster für die <strong>${typeLabel}</strong> von <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> vorgeschlagen:`
            : `<strong>${senderName}</strong> has suggested available timeslots for the <strong>${typeLabel}</strong> of <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong>:`}</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              ${slotsHtml}
            </table>
          </div>

          <p>${isDe
            ? "Du kannst einen Termin direkt mit 1 Klick oben annehmen oder im Portal alternative Zeiten vorschlagen:"
            : "You can confirm your preferred timeslot with 1-click above or suggest another time in the portal:"}</p>
        `;

        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Terminabsprache im Portal öffnen" : "Open Timeslot Coordination",
            buttonUrl: targetUrl,
            appUrl,
            locale,
          }),
        };
      },

      p2pTimeslotConfirmedEmail: ({
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
        const typeLabel = isDe
          ? (isPickup ? "Übergabetermin" : "Rückgabetermin")
          : (isPickup ? "Handover appointment" : "Return appointment");
        const title = isDe
          ? `Termin vereinbart: ${typeLabel} für "${productName}"`
          : `Time confirmed: ${typeLabel} for "${productName}"`;
        const targetUrl = isOwner ? `${appUrl}/profile/requests` : `${appUrl}/reservations`;

        const content = `
          <h2 style="margin-top: 0; color: #212529; font-size: 18px;">${isDe ? `Hallo ${recipientName},` : `Hi ${recipientName},`}</h2>
          <p>${isDe
            ? `der <strong>${typeLabel}</strong> für <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> wurde verbindlich vereinbart!`
            : `the <strong>${typeLabel}</strong> for <strong><a href="${productUrl}" style="color: #2b8a3e; text-decoration: underline;">${productName}</a></strong> is confirmed!`}</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2b8a3e; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #495057; width: 130px;"><strong>${isDe ? "Gegenstand:" : "Item:"}</strong></td><td style="padding: 4px 0;">${productName}</td></tr>
              ${counterpartyName ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${counterpartyRole || (isDe ? "Partner" : "Partner")}:</strong></td><td style="padding: 4px 0;">${counterpartyName}</td></tr>` : ""}
              <tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Termin:" : "Appointment:"}</strong></td><td style="padding: 4px 0; font-weight: bold; color: #2b8a3e;">${fmt(slot.date, true)}, ${slot.startTime} – ${slot.endTime} ${isDe ? "Uhr" : ""} ${slot.label ? `(${slot.label})` : ""}</td></tr>
              ${location ? `<tr><td style="padding: 4px 0; color: #495057;"><strong>${isDe ? "Treffpunkt / Ort:" : "Location:"}</strong></td><td style="padding: 4px 0;">📍 ${location}</td></tr>` : ""}
            </table>
          </div>

          <div style="background-color: #e7f5ff; border: 1px solid #a5d8ff; border-radius: 6px; padding: 14px 16px; margin: 20px 0; text-align: center;">
            <div style="font-weight: bold; color: #1864ab; font-size: 14px; margin-bottom: 10px;">
              ${isDe ? "📅 Termin nicht vergessen – jetzt im Kalender speichern:" : "📅 Don't forget – add to your calendar:"}
            </div>
            <div style="margin-bottom: 6px;">
              ${googleCalUrl ? `<a href="${googleCalUrl}" target="_blank" style="display: inline-block; background-color: #1971c2; color: #ffffff; text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: 600; font-size: 13px; margin: 4px;">📅 Google ${isDe ? "Kalender" : "Calendar"}</a>` : ""}
              ${icalDownloadUrl ? `<a href="${icalDownloadUrl}" style="display: inline-block; background-color: #ffffff; color: #1971c2; border: 1px solid #1971c2; text-decoration: none; padding: 8px 14px; border-radius: 4px; font-weight: 600; font-size: 13px; margin: 4px;">🍎 Apple / Outlook (.ics)</a>` : ""}
            </div>
            <small style="color: #6c757d; display: block; margin-top: 6px; font-size: 11px;">
              ${isDe ? "(Der Kalendereintrag ist auch als .ics-Datei an diese E-Mail angehängt)" : "(An .ics calendar file is also attached to this email)"}
            </small>
          </div>

          <p>${isDe ? "Alle weiteren Details und Status-Updates findest du in deiner Übersicht im Portal:" : "You can review all details in your overview in the portal:"}</p>
        `;

        return {
          subject: title,
          html: emailLayout({
            title,
            content,
            buttonText: isDe ? "Reservierung im Portal ansehen" : "View Reservation in Portal",
            buttonUrl: targetUrl,
            appUrl,
            locale,
          }),
        };
      },
    };
  }

  return {
    formatDate,
    formatCurrency,
    emailLayout,
    getEmails,
  };
})();

