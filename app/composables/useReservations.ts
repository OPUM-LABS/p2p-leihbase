export function useReservations() {
  const { pb } = usePocketbase();

  function getOverdueReservations(location: string) {
    return pb.collection("reservations").getFullList({
      filter: pb.filter(
        "location = {:location} && cancelled != true && ((start < @todayStart && started = false) || (end < @todayStart && ended = false))",
        {
          location: location,
        }
      ),
      sort: "end",
      expand: "product,user",
      requestKey: "admin_overdue_reservations",
    });
  }

  return {
    getOverdueReservations,
  };
}
