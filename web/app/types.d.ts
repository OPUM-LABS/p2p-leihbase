import type { HookResult } from "@nuxt/schema";
import type { Reservation } from "~~/models/reservation";

declare module "#app" {
  interface RuntimeNuxtHooks {
    "app:user:reservation:create": (reservation: Reservation) => HookResult;
  }
}
