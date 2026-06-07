import type { Product } from "~~/models/product";

type Options = {
  expand: string;
};

export async function getProduct(id: string, options: Options) {
  const { pb } = usePocketbase();
  const userStore = useUserStore();
  const { isManager } = storeToRefs(userStore);

  const { data, error, refresh } = await useAsyncData<Product>(async () =>
    pb.collection(isManager.value ? "products" : "public_products").getOne(id, {
      expand: options.expand,
    })
  );
  return { product: data, error, refresh };
}

export async function getProductExcerpt(id: string) {
  const { pb } = usePocketbase();
  const userStore = useUserStore();

  const { data, error, refresh } = await useAsyncData<{ description: string }>(
    "product-excerpt",
    async () =>
      await pb
        .collection(userStore.isManager ? "products" : "public_products")
        .getOne(id, {
          fields: "description:excerpt(200,true)",
        })
  );

  const excerpt = computed(() => data.value?.description);

  return { excerpt, error, refresh };
}
