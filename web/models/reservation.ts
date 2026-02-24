import type { RecordModel } from "pocketbase";

export enum ReservationStatus {
  New = "new",
  Cancelled = "cancelled",
  Started = "started",
  Ended = "ended",
  Overdue = "overdue",
}

export type Reservation = RecordModel & {
  id: string;
  created: string;

  user: string;
  product: string;
  location: string;

  start: Date;
  end: Date;

  cancelled: boolean;
  started: boolean;
  ended: boolean;

  message: string;
  note: string;

  expand: any;
};
