import type { RecordModel } from "pocketbase";

export type User = RecordModel & {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  nickname?: string;
  role: "user" | "manager" | "admin";
  manager_locations?: string[];
};
