<template>
  <div class="grid">
    <NavBar></NavBar>
    <main>
      <NuxtLoadingIndicator color="#fff" />
      <NuxtPage />
    </main>
    <Footer></Footer>
  </div>
</template>

<script setup>
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import { useUserStore } from "./stores/user";
import NavBar from "./components/modules/NavBar.vue";
import Footer from "./components/modules/Footer.vue";
import { useLeihbase } from "./stores/leihbase";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/"
);

const { isValid } = usePocketbase();
const userStore = useUserStore();
const {
  public: { plausibleTrackingDomain },
} = useRuntimeConfig();
const { locale } = useI18n();

// Fetch Leihbase collection on a central location
// await for the result before processing the rest of the page
const { fetch } = useLeihbase();
const { leihbase } = storeToRefs(useLeihbase());
await fetch();

const style = [
  `@layer base, theme, utilities;
   @layer theme {
    :root {
      ${leihbase?.value?.style || ""}
    }
   }`,
];

useHead({
  script: [
    plausibleTrackingDomain && {
      defer: true,
      "data-domain": plausibleTrackingDomain,
      src: "https://plausible.io/js/script.js",
    },
  ],
  style,
  htmlAttrs: {
    lang: locale,
  },
});

if (isValid.value) {
  await userStore.login();
} else {
  userStore.logout();
}
</script>

<style lang="scss">
@use "~/assets/styles/main.scss";
</style>

<style lang="scss" scoped>
.grid {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
</style>
