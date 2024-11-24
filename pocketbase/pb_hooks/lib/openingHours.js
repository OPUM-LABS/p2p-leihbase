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

  function getOpeningHoursDay(openingHours, date) {
    return openingHours.days[Days[date.getDay()]];
  }

  return {
    getOpeningHoursDay,
  };
})();
