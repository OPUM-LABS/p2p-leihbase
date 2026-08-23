<template>
  <NavBar></NavBar>
  <main>
    <Container width="sm" centered>
      <Card class="lb-stack">
        <Heading is="h1" size="xl">{{ t('errors.error_' + error?.status) }}</Heading>
        <p>{{ t('errors.error_' + error?.status + "_text") }}</p>
        <p>
          <Link href="/">
            {{ t('errors.to_home') }}
          </Link>
        </p>
      </Card>
    </Container>
  </main>
  <Footer></Footer>
</template>

<script setup lang="ts">
import "@/assets/styles/main.scss";
import type { NuxtError } from "#app";
import Card from "./components/core/Card.vue";
import Container from "./components/core/Container.vue";
import Heading from "./components/core/Heading.vue";
import Link from "./components/core/Link.vue";
import Footer from "./components/modules/Footer.vue";
import NavBar from "./components/modules/NavBar.vue";

const {
  public: { plausibleTrackingDomain },
} = useRuntimeConfig();
const { locale } = useI18n();

// Fetch Leihbase collection on a central location
// await for the result before processing the rest of the page
const { fetch, leihbase } = useLeihbase();
await fetch();

const { t } = useI18n();

const props = defineProps({
  error: Object as () => NuxtError,
});

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
</script>

<style lang="scss" scoped>
main {
  min-height: calc(100vh - 8rem);
}
p {
  margin: 0;
}
</style>
