module.exports = (function () {
  const lendingConditionsLink = $os.getenv("CONFIG_LENDING_CONDITIONS_LINK");
  const lendingContactEmail = $os.getenv("CONFIG_LENDING_CONTACT_EMAIL");

  function formatDate(date) {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  function formatCurrency(n) {
    return `${Math.round(n)}€`;
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
Deine Reservierung läuft vom ${formatDate(start)} bis
zum ${formatDate(end)}.<br>
<br>
Der Gegenstand kann am ${formatDate(start)} abgeholt werden. Wenn es das erste
Mal ist, dass du etwas ausleihst, werden wir dich vor Ort bitten
${
  lendingConditionsLink
    ? `<a href="${lendingConditionsLink}">die Leihbedingungen</a>`
    : "die Leihbedingungen"
} zu unterschreiben und ${
      deposit ? `${formatCurrency(deposit)} ` : ""
    }Pfand zu hinterlegen.<br>
<br>
Solltest Du Deine Reservierung stornieren müssen, freuen wir 
uns über eine kurze Email${
      lendingContactEmail
        ? ` an
<a href="${lendingContactEmail}">${lendingContactEmail}</a>.`
        : "."
    }<br>
<br>
Wir freuen uns, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Bis bald<br>
Deine Leihbar`,
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
    subject: `Neue Reservierung von ${userName}: ${productName}`,
    html: `Hi,<br>
<br>
Eine neue Reservierung von ${userName}
(<a href="mailto:${userEmail}">${userEmail}</a>).<br>
<br>
<strong>Details</strong><br>
Gegenstand: <a href="${productUrl}">${productName}</a><br>
Beginn: ${formatDate(start)}<br>
Ende: ${formatDate(end)}<br>
${
  message
    ? `<br>
      ${userName} schreibt:<br>
      <blockquote>
        ${message.replace(/\n/g, "<br>")}<br>
        </blockquote>`
    : ""
}`,
  });

  const reservationStartReminderEmail = ({
    locationName,
    productName,
    start,
    startHour,
    endHour,
  }) => ({
    subject: `Abholen von den Gegenstand '${productName}'`,
    html: `Hi,<br>
<br>
du hast bei ${locationName} den Gegenstand '${productName}' reserviert. Der Gegenstand liegt
morgen (${formatDate(start)}) ${
      startHour && endHour ? `zwischen ${startHour} und ${endHour}` : ""
    }
bereit. Bitte denke daran, deinen Gegenstand abzuholen. Falls du ihn nicht mehr benötigst,
antworte auf diese Mail, um deine Reservierung zu stornieren.<br>
<br>
Danke, dass du dich für Leihen statt Kaufen entscheidest!<br>
<br>
Liebe Grüße<br>
Dein LeihBar-Team<br>`,
  });

  const reservationEndReminderEmail = ({
    locationName,
    productName,
    end,
    startHour,
    endHour,
  }) => ({
    subject: `Zurückbringen von den Gegenstand '${productName}'`,
    html: `Hi,<br>
<br>
wir hoffen, mit dem Gegenstand ${productName} hat alles gut funktioniert!
<br>
Deine Leihfrist endet morgen (${formatDate(end)}), also bring uns den
Gegenstand bitte zurück zur ${locationName}.<br>
<br>
${
  startHour && endHour
    ? `${locationName} ist geöffnet von ${startHour} bis ${endHour}.<br>
<br>`
    : ""
}
Danke, und bis morgen!<br>
<br>
Liebe Grüße<br>
dein LeihBar-Team`,
  });

  return {
    reservationConfirmationEmail,
    reservationConfirmationLocationEmail,
    reservationStartReminderEmail,
    reservationEndReminderEmail,
  };
})();
