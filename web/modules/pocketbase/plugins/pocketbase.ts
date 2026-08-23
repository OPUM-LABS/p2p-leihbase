import { useUserStore } from "@@/app/stores/user";
import PocketBase from "pocketbase";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  let url = process.client
    ? config.public.pocketbase.clientBaseUrl
    : config.public.pocketbase.serverBaseUrl;

  if (process.client && typeof window !== "undefined") {
    if (!url) {
      url = `${window.location.protocol}//${window.location.hostname}:8090`;
    } else {
      try {
        const parsed = new URL(url, window.location.href);
        if (
          (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          parsed.hostname = window.location.hostname;
          url = parsed.origin;
        }
      } catch (_) {}
    }
  }

  const pb = new PocketBase(url || "/");
  pb.autoCancellation(false);

  const isHttps = process.server
    ? useRequestHeaders(["x-forwarded-proto"])["x-forwarded-proto"] === "https"
    : typeof window !== "undefined" && window.location.protocol === "https:";

  const cookie = useCookie<{ token?: string; model?: any; record?: any }>("pb_auth", {
    path: "/",
    secure: isHttps,
    sameSite: "lax",
    httpOnly: false,
    maxAge: 604800,
  });

  // load the store data from the cookie value
  if (cookie.value) {
    if (typeof cookie.value === "string") {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed?.token) {
          pb.authStore.save(parsed.token, parsed.model || parsed.record);
        }
      } catch (_) {
        pb.authStore.loadFromCookie(cookie.value);
      }
    } else if (cookie.value?.token) {
      pb.authStore.save(cookie.value.token, cookie.value.model || cookie.value.record);
    }
  }

  // send back the default 'pb_auth' cookie to the client with the latest store state
  pb.authStore.onChange(() => {
    if (pb.authStore.isValid) {
      cookie.value = {
        token: pb.authStore.token,
        model: pb.authStore.record,
      };
    } else {
      cookie.value = null;
    }
  });

  if (pb.authStore.isValid) {
    try {
      // get an up-to-date auth store state by verifying and refreshing the loaded auth model
      await pb.collection("users").authRefresh();
    } catch (err: any) {
      // Only clear if the token was explicitly rejected by the auth server
      if (err?.status === 401 || err?.status === 403) {
        pb.authStore.clear();
      }
    }
  }

  return {
    provide: { pocketbase: pb },
  };
});
