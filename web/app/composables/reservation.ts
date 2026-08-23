import { type Reservation } from "~~/models/reservation";

export async function getFutureReservationsByProduct(productId: string) {
  const { pb } = usePocketbase();
  const { data, refresh, error } = await useAsyncData<Reservation[]>(
    `reservations-${productId}`,
    () =>
      pb.collection("public_reservations").getFullList({
        filter: pb.filter("product = {:product} && end >= @todayStart", {
          product: productId,
        }),
        sort: "start",
      })
  );
  return { reservations: data, refresh, error };
}
