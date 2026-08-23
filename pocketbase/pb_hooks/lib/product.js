/**
 * Checks if a product has another active reservation.
 * @param {string} productId
 * @param {core.Record} [excludeReservation]
 * @param {boolean} [includeUnreturned=false] - Also include reservations that were not marked as ended
 * @returns {boolean}
 */
function hasActiveReservation(productId, excludeReservation, includeUnreturned = false) {
  /** @type {typeof import('./date')} */
  const { startOfDate, endOfDate } = require(`${__hooks}/lib/date`);
  const now = new Date();
  const startOfToday = startOfDate(now);
  const endOfToday = endOfDate(now);

  const activePeriodFilter = includeUnreturned
    ? "((start <= {:endOfToday} && end >= {:startOfToday}) || (started = true || status = 'started'))"
    : "(start <= {:endOfToday} && end >= {:startOfToday})";

  const records = $app.findRecordsByFilter(
    "reservations",
    [
      excludeReservation && excludeReservation.get("id") ? "id != {:id}" : "",
      "product = {:product}",
      "cancelled != true",
      "status != 'cancelled'",
      "status != 'declined'",
      "ended != true",
      "status != 'ended'",
      activePeriodFilter,
    ]
      .filter((v) => !!v)
      .join(" && "),
    null,
    1,
    0,
    {
      id: excludeReservation && excludeReservation.get("id"),
      product: productId,
      startOfToday,
      endOfToday,
    }
  );
  return records.length > 0;
}

/**
 * Returns active reservations of a product in the given date range.
 * @param {string} product
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Array<(core.Record | undefined)>}
 */
function getActiveReservationsForDateRange(product, startDate, endDate) {
  /** @type {typeof import('./date')} */
  const { startOfDate, endOfDate } = require(`${__hooks}/lib/date`);
  return $app.findRecordsByFilter(
    "reservations",
    "cancelled != true && status != 'cancelled' && status != 'declined' && ended != true && status != 'ended' && product = {:product} && start < {:endOfEndDate} && end >= {:startOfStartDate}",
    null,
    1,
    0,
    {
      product,
      startOfStartDate: startOfDate(startDate),
      endOfEndDate: endOfDate(endDate),
    }
  );
}

module.exports = {
  hasActiveReservation,
  getActiveReservationsForDateRange,
};
