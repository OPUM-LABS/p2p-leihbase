
/**
 * Checks if a user has another overlapping reservation for the given product.
 * @param {core.Record} user 
 * @param {core.Record} product 
 * @param {core.Record} reservation
 * @returns {boolean}
 */
function hasActiveReservationForProduct(user, product, reservation) {
  const { startOfDate } = require(`${__hooks}/lib/date`);
  // A cancelled, declined, or ended reservation is allowed to have another reservation
  if (
    reservation.get("cancelled") ||
    reservation.get("status") === "cancelled" ||
    reservation.get("status") === "declined" ||
    reservation.get("ended") ||
    reservation.get("status") === "ended"
  ) {
    return false;
  }
  // A reservation without a user can't already have an open reservation
  if (!reservation.get("user")) {
    return false;
  }
  const records = $app.findRecordsByFilter(
    "reservations",
    reservation.get("id")
      ? `id != {:id} && user = {:user} && product = {:product} && end >= {:startOfToday} && cancelled != true && status != 'cancelled' && status != 'declined' && ended != true && status != 'ended'`
      : `user = {:user} && product = {:product} && end >= {:startOfToday} && cancelled != true && status != 'cancelled' && status != 'declined' && ended != true && status != 'ended'`,
    null,
    1,
    0,
    {
      id: reservation.get("id"),
      user,
      product,
      startOfToday: startOfDate(new Date()),
    }
  );
  return records.length > 0;
}

module.exports = {
  hasActiveReservationForProduct,
};