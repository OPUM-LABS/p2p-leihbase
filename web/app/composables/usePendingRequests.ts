export const usePendingRequests = () => {
  const { pb, isValid } = usePocketbase();
  const pendingCount = useState<number>("p2p_pending_requests_count", () => 0);
  const isFetching = ref(false);

  async function fetchPendingCount() {
    if (!isValid.value || !pb?.authStore?.record?.id) {
      pendingCount.value = 0;
      return;
    }

    const userId = pb.authStore.record.id;
    try {
      isFetching.value = true;
      // Get all products owned by current user
      const products = await pb.collection("products").getFullList({
        filter: `user = "${userId}"`,
        fields: "id",
        requestKey: null,
      });

      if (!products || products.length === 0) {
        pendingCount.value = 0;
        return;
      }

      const productFilter = products.map((p: any) => `product = "${p.id}"`).join(" || ");
      const res = await pb.collection("reservations").getList(1, 1, {
        filter: `(${productFilter}) && (status = "requested" || status = "") && cancelled != true && ended != true`,
        requestKey: null,
      });
      pendingCount.value = res.totalItems;
    } catch (err) {
      // Silent error for background indicator
    } finally {
      isFetching.value = false;
    }
  }

  return {
    pendingCount,
    fetchPendingCount,
  };
};
