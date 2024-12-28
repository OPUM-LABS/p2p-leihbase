<template>
  <nav>
    <Button variant="secondary" :to="`/admin/${location?.slug}`">
      {{ t("reservations") }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/stats`">
      {{ t("statistics") }}
    </Button>
  </nav>
</template>

<script setup lang="ts">
import type { RecordModel } from "pocketbase";

const { t, locale } = useI18n({
  useScope: "local",
});
const route = useRoute();

defineProps<{ location: RecordModel }>();
</script>

<style scoped>
nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-8);
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "statistics": "Statistics"
  },
  "de": {
    "reservations": "Reservierungen",
    "statistics": "Statistieken"
  }
}
</i18n>
