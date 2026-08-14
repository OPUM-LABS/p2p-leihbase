module.exports = (function () {
  const Days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  /**
   * Returns the opening hours of a given date
   */
  function getOpeningHoursDay(openingHours, date) {
    return openingHours.days[Days[date.getDay()]];
  }

  /**
   * Returns the date of the next open day
   */
  function getNextOpenDate(openingHours, skip = 0, limit = 31) {
    const { days, except } = openingHours;
    const exceptDates = new Set(except?.dates || []);
    const openDays = new Set(Object.keys(days));

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Check up to 365 days ahead to find the next open day
    let skipped = 0;
    for (let i = 0; i < limit; i++) {
      const dayName = Days[date.getDay()];
      const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

      if (openDays.has(dayName) && !exceptDates.has(dateStr)) {
        if (skipped < skip) {
          skipped++;
        } else {
          return new Date(date);
        }
      }

      date.setDate(date.getDate() + 1);
    }

    return null; // No open day found within limit
  }

  return {
    getOpeningHoursDay,
    getNextOpenDate,
  };
})();
