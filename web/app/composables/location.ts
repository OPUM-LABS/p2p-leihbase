import type { Location } from "~~/models/location";

export async function getLocationBySlug(slug: string) {
  const { pb } = usePocketbase();
  const { data, error, refresh } = await useAsyncData<Location>(() =>
    pb
      .collection("public_locations")
      .getFirstListItem(pb.filter("slug = {:slug}", { slug }))
  );
  return { location: data, error, refresh };
}

export async function getActiveLocationBySlug(slug: string) {
  const { pb } = usePocketbase();
  const { data, error, refresh } = await useAsyncData<Location>(() =>
    pb
      .collection("public_locations")
      .getFirstListItem(pb.filter("active = true && slug = {:slug}", { slug }))
  );
  return { location: data, error, refresh };
}
