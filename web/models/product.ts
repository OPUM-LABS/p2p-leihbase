import type { RecordModel } from "pocketbase";
import type { User } from "./user";

export type Product = RecordModel & {
  id: string;
  user: string;
  name: string;
  images: string[];
  description?: string;
  notes?: string;
  deposit?: number;
  price_per_day?: number;
  city?: string;
  postal_code?: string;
  approx_location_note?: string;
  pickup_address?: string;
  max_duration_days?: number;
  terms_condition?: string;
  active?: boolean;
  computedIsAvailable?: boolean;
  expand?: {
    user?: User;
    categories?: any[];
  };
};
