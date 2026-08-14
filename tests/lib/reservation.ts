import Client from "pocketbase";
import { pocketbase } from "../services/pocketbase";

/**
 * Creates a new reservation
 */
export async function createReservation(
  pb: Client,
  {
    user,
    product,
    location,
    start,
    end,
  }: {
    user: string;
    product: string;
    location: string;
    start: Date;
    end: Date;
  }
) {
  const reservation = await pb.collection("reservations").create({
    user,
    product,
    location,
    start,
    end,
  });
  return reservation;
}
