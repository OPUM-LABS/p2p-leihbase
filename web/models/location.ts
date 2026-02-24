import type { RecordModel } from "pocketbase";

export type Location = RecordModel & {
  id: string;
  name: string;
  address: string;
  email: string;
  description: string;
  slug: string;
  active: boolean;
  opening_hours: string;
  links: string;
  max_reservation_days: number;
};
