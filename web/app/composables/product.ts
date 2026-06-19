import type { Product } from "~~/models/product";

type Options = {
  expand?: string;
  query?: Record<string, any>;
};

export async function getProduct(id: string, options: Options) {
  const { pb } = usePocketbase();

  const { data, error, refresh } = await useAsyncData<Product>(() =>
    pb.collection("products").getOne(id, {
      expand: options.expand,
      query: options.query,
    })
  );
  return { product: data, error, refresh };
}

export async function getProductExcerpt(id: string) {
  const { pb } = usePocketbase();

  const { data, error, refresh } = await useAsyncData<{ description: string }>(
    "product-excerpt",
    () =>
      pb.collection("products").getOne(id, {
        fields: "description:excerpt(200,true)",
      })
  );

  const excerpt = computed(() => data.value?.description);

  return { excerpt, error, refresh };
}
