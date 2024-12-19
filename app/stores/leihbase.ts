export const useLeihbase = defineStore('leihbase', () => {
  const { pb } = usePocketbase();

  const { data: leihbases, refresh } = useAsyncData(
    'leihbase',
    () => {
      return pb
        .collection("leihbase")
        .getFullList();
    }, { immediate: false }
  );
  const leihbase = computed(() => leihbases.value?.[0])

  return { leihbase, fetch: refresh }
})