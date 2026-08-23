import { type Leihbase } from "../../models/leihbase";

export const useLeihbase = defineStore("leihbase", () => {
  const { pb } = usePocketbase();

  const { data: leihbases, refresh } = useAsyncData(
    "leihbase",
    async () => {
      try {
        const list = await pb.collection("leihbase").getFullList();
        if (list && list.length > 0) {
          return list;
        }
      } catch (err) {
        console.warn("Could not fetch leihbase collection:", err);
      }
      try {
        const config: any = await pb.send("/api/app-config", { method: "GET" });
        if (config) {
          return [config as Leihbase];
        }
      } catch (err) {
        console.warn("Could not fetch /api/app-config:", err);
      }
      return [];
    },
    { immediate: true }
  );

  const leihbase = computed(() => (leihbases.value?.[0] as Leihbase) || null);

  return { leihbase, fetch: refresh };
});
