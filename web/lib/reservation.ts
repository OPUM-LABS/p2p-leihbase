import { DateTime } from "luxon";
import { ReservationStatus, type Reservation } from "../models/reservation";

const startOfToday = DateTime.now().startOf("day");
const endOfToday = DateTime.now().startOf("day");

export function isToday(reservation: {
  start: string | Date;
  end: string | Date;
}): boolean {
  return (
    DateTime.fromJSDate(new Date(reservation.start)).startOf("day") <=
      startOfToday &&
    DateTime.fromJSDate(new Date(reservation.end)).startOf("day") >= endOfToday
  );
}

export function getReservationStatus(reservation: Reservation) {
  if (reservation.cancelled || reservation.status === ReservationStatus.Cancelled) {
    return ReservationStatus.Cancelled;
  }
  if (reservation.status === ReservationStatus.Declined) {
    return ReservationStatus.Declined;
  }
  if (reservation.ended || reservation.status === ReservationStatus.Ended) {
    return ReservationStatus.Ended;
  }
  if (reservation.started || reservation.status === ReservationStatus.Started) {
    if (new Date(reservation.end) < startOfToday) {
      return "overdue";
    }
    return ReservationStatus.Started;
  }
  if (reservation.status === ReservationStatus.Accepted) {
    return ReservationStatus.Accepted;
  }
  if (reservation.status === ReservationStatus.Requested) {
    return ReservationStatus.Requested;
  }
  return reservation.status || ReservationStatus.Requested;
}
