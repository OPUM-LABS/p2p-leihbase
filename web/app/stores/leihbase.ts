import { type Leihbase } from "../../models/leihbase";

export const useLeihbase = defineStore("leihbase", () => {
  const { pb } = usePocketbase();

  const { data: leihbases, refresh } = useAsyncData(
    "leihbase",
    () => {
      return pb.collection("leihbase").getFullList();
    },
    { immediate: false }
  );
  const leihbase = computed(() => leihbases.value?.[0] as Leihbase);

  return { leihbase, fetch: refresh };
});
