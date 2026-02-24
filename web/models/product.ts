import type { RecordModel } from "pocketbase";

export type Product = RecordModel & {
  id: string;
  user: string;
  location: string;
  name: string;
  images: string[];
};
