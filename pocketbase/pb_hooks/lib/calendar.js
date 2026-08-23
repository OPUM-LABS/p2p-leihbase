/**
 * Helpers for generating iCalendar (.ics) entries and calendar links.
 */

function escapeIcsText(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatDateIcs(dateStr, timeStr) {
  const cleanDate = (dateStr || "").replace(/-/g, "").trim();
  const cleanTime = (timeStr || "09:00").replace(/:/g, "").trim().slice(0, 4) + "00";
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Generate standard RFC 5545 iCalendar format.
 */
function generateIcsEvent({
  uid,
  summary,
  description,
  location,
  dateStr,
  startTimeStr,
  endTimeStr,
  url,
}) {
  const dtStart = formatDateIcs(dateStr, startTimeStr || "18:00");
  const dtEnd = formatDateIcs(dateStr, endTimeStr || "19:00");
  const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const eventUid = uid || `leihbase-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@leihbase`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Leihbase//P2P Community Calendar//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary || "Leihbase Übergabetermin")}`,
    `DESCRIPTION:${escapeIcsText(description || "")}`,
    `LOCATION:${escapeIcsText(location || "")}`,
  ];

  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push(
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Erinnerung: ${escapeIcsText(summary || "Leihbase Termin")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.join("\r\n");
}

/**
 * Generate 1-click Google Calendar web link.
 */
function generateGoogleCalendarUrl({
  summary,
  description,
  location,
  dateStr,
  startTimeStr,
  endTimeStr,
}) {
  const dtStart = formatDateIcs(dateStr, startTimeStr || "18:00");
  const dtEnd = formatDateIcs(dateStr, endTimeStr || "19:00");

  const dates = `${dtStart}/${dtEnd}`;
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = [
    `text=${encodeURIComponent(summary || "Leihbase Übergabetermin")}`,
    `dates=${dates}`,
    `details=${encodeURIComponent(description || "")}`,
    `location=${encodeURIComponent(location || "")}`,
  ];
  return `${base}&${params.join("&")}`;
}

/**
 * Create a File attachment suitable for PocketBase MailerMessage attachments map.
 */
function createIcsAttachment(icsString, filename = "termin.ics") {
  try {
    if (typeof $filesystem !== "undefined" && typeof $filesystem.fileFromBytes === "function") {
      return $filesystem.fileFromBytes(icsString, filename);
    }
  } catch (e) {
    console.warn("[Calendar] Could not create filesystem fileFromBytes for ics attachment:", e);
  }
  return null;
}

module.exports = {
  generateIcsEvent,
  generateGoogleCalendarUrl,
  createIcsAttachment,
};
