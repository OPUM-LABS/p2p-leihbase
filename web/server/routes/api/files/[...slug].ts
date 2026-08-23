export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const serverUrl =
    config.public.pocketbase?.serverBaseUrl ||
    process.env.NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL ||
    "http://pocketbase:8090";

  const rawUrl = event.node.req.url || "";
  const target = `${serverUrl}${rawUrl}`;

  return proxyRequest(event, target);
});
