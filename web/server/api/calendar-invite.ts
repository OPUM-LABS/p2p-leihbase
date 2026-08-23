import { defineEventHandler, getQuery, setHeader, send } from "h3";

function escapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatDateIcs(dateStr?: string, timeStr?: string): string {
  const cleanDate = (dateStr || "").replace(/-/g, "").trim();
  const cleanTime = (timeStr || "09:00").replace(/:/g, "").trim().slice(0, 4) + "00";
  return `${cleanDate}T${cleanTime}`;
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const id = (query.id as string) || `event-${Date.now()}`;
  const type = (query.type as string) || "pickup";
  const dateStr = (query.date as string) || new Date().toISOString().split("T")[0];
  const startTime = (query.start as string) || "09:00";
  const endTime = (query.end as string) || "10:00";
  const title = (query.title as string) || (type === "return" ? "Rückgabetermin (Leihbase)" : "Übergabetermin (Leihbase)");
  const location = (query.location as string) || "";
  const description = (query.desc as string) || `${title}\nOrt: ${location}`;

  const dtStart = formatDateIcs(dateStr, startTime);
  const dtEnd = formatDateIcs(dateStr, endTime);
  const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `leihbase-${id}-${type}@leihbase`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Leihbase//P2P Calendar Event//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Erinnerung: ${escapeIcsText(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const icsContent = icsLines.join("\r\n");

  setHeader(event, "Content-Type", "text/calendar; charset=utf-8");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="termin_${type}.ics"`
  );

  return send(event, icsContent, "text/calendar; charset=utf-8");
});
