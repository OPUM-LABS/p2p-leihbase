import type { RecordModel } from "pocketbase";
import type { Product } from "./product";
import type { User } from "./user";

export enum ReservationStatus {
  Requested = "requested",
  Accepted = "accepted",
  Declined = "declined",
  Started = "started",
  Ended = "ended",
  Cancelled = "cancelled",
}

export interface TimeslotItem {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  label?: string; // e.g. "Abends (18:00 – 20:00)"
  proposedBy: string; // user id
  proposedByName?: string;
  createdAt: string;
}

export interface TimeslotGroup {
  proposals: TimeslotItem[];
  confirmedSlot?: TimeslotItem | null;
}

export interface ReservationTimeslots {
  pickup?: TimeslotGroup;
  return?: TimeslotGroup;
}

export type Reservation = RecordModel & {
  id: string;
  created: string;

  user: string;
  owner?: string;
  product: string;
  location?: string;

  start: Date | string;
  end: Date | string;

  status?: ReservationStatus | string;
  cancelled?: boolean;
  started?: boolean;
  ended?: boolean;

  message?: string;
  note?: string;
  owner_note?: string;
  handover_address?: string;
  timeslots?: ReservationTimeslots;

  expand?: {
    user?: User;
    owner?: User;
    product?: Product;
  };
};
