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

  expand?: {
    user?: User;
    owner?: User;
    product?: Product;
  };
};
