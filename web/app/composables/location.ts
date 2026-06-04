import type { Location } from "~~/models/location";

export async function getLocationBySlug(slug: string) {
  const { pb } = usePocketbase();
  const { data, error, refresh } = await useAsyncData<Location>(
    "location",
    async () =>
      pb
        .collection("public_locations")
        .getFirstListItem(pb.filter("slug = {:slug}", { slug }))
  );
  return { location: data, error, refresh };
}
