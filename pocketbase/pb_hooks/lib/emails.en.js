module.exports = (function () {
  const lendingConditionsLink = $os.getenv("CONFIG_LENDING_CONDITIONS_LINK");

  function formatDate(date) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
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
    subject: `Reservation confirmation of '${productName}'`,
    html: `Hi ${userName},<br>
<br>
We hereby confirm the reservation of the item
"<a href="${productUrl}">${productName}</a>"<br>
<br>
Your reservation runs from ${formatDate(start)} to ${formatDate(end)}.<br>
<br>
The item can be picked up at ${formatDate(start)}. If it is the first time that
you are borrowing something, we will ask you to sign the ${
      lendingConditionsLink
        ? `<a href="${lendingConditionsLink}">terms and conditions</a>`
        : "terms and conditions"
    }
of borrowing on site.<br>
<br>
${
  deposit
    ? `A deposit of ${formatCurrency(
        deposit
      )} is required to borrow ${productName}. Please bring the exact amount if possible.<br>
  <br>`
    : ""
}
You can cancel your reservation or change the borrowing period in your
<a href="${
      $app.settings().meta.appURL
    }/reservations">reservation overview</a>.<br>
<br>
We're happy that you have decided to borrow instead of buy!<br>
<br>
See you soon<br>
Your Leihbar`,
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
    subject: `New reservation: ${userName} - ${productName}`,
    html: `Hi,<br>
<br>
A new reservation by ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>).<br>
<br>
<strong>Details</strong><br>
Item: <a href="${productUrl}">${productName}</a><br>
Start: ${formatDate(start)}<br>
End: ${formatDate(end)}<br>
${
  message
    ? `<br>
      ${userName} writes:<br>
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
    subject: `Pick-up of '${productName}'`,
    html: `Hi ${userName},<br>
<br>
you reserved a ${productName} at ${locationName}. The item can be picked up tomorrow
(${formatDate(start)}) ${
      startHour && endHour ? `between ${startHour} and ${endHour}` : ""
    }.<br>
If you no longer need it, you can cancel your reservation in your
<a href="${$app.settings().meta.appURL}/reservations">reservation overview</a>.
<br>
Thank you that you choose for borrowing instead of buying!<br>
<br>
See you soon<br>
Your LeihBar<br>`,
  });

  const reservationEndReminderEmail = ({
    userName,
    locationName,
    productName,
    end,
    startHour,
    endHour,
  }) => ({
    subject: `Return of '${productName}'`,
    html: `Hi ${userName},<br>
<br>
we hope everything worked out well with the item '${productName}'!
<br>
The borrow-period ends tomorrow (${formatDate(end)}), so we would like to
remind you of returning it to ${locationName}.<br>
<br>
${
  startHour && endHour
    ? `${locationName} is tomorrow open from ${startHour} to ${endHour}.<br>
<br>`
    : ""
}
If you would like to keep the item for longer, you can extend the reservation in
your
<a href="${
      $app.settings().meta.appURL
    }/reservations">reservation overview</a>.<br>
<br>
Thank you, and see you tomorrow!<br>
Your LeihBar-Team`,
  });

  const cancellationConfirmationEmail = ({
    userName,
    productUrl,
    productName,
  }) => ({
    subject: `Cancellation confirmation for ${productName}`,
    html: `Hi ${userName},<br>
<br>
We hereby confirm the cancellation of your reservation for the item "<a href="${productUrl}">${productName}</a>".<br>
<br>
Thanks for sharing, the item is now available again for other neighbours!<br>
<br>
See you next time!<br>
<br>
Your Leihbar`,
  });

  const reservationCancellationLocationEmail = ({
    productUrl,
    productName,
    userName,
    userEmail,
    start,
    end,
  }) => ({
    subject: `Cancellation: ${userName} - ${productName}`,
    html: `The reservation of ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>) for the item "${productName}" has been cancelled.<br>
<br>
<strong>Details</strong><br>
Item: <a href="${productUrl}">${productName}</a><br>
Start: ${formatDate(start)}<br>
End: ${formatDate(end)}`,
  });

  return {
    reservationConfirmationEmail,
    reservationConfirmationLocationEmail,
    reservationStartReminderEmail,
    reservationEndReminderEmail,
    cancellationConfirmationEmail,
    reservationCancellationLocationEmail,
  };
})();
