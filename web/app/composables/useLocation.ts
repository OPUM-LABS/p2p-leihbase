export async function useLocation({ slug }: { slug: string }) {
  const { pb } = usePocketbase();
  const { data: location } = await useAsyncData("admin_location", async () => {
    const location = await pb
      .collection("location")
      .getFirstListItem(pb.filter("slug = {:slug}", { slug }));
    return structuredClone(location);
  });
  return location;
}
