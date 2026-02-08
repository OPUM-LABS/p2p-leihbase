<template>
  <HorizontalScroll is="nav" class="nav">
    <Button variant="secondary" :to="`/admin/${location?.slug}`">
      {{ t("reservations") }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/products`">
      {{ t("products") }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/stats`">
      {{ t("statistics") }}
    </Button>
  </HorizontalScroll>
</template>

<script setup lang="ts">
import type { RecordModel } from "pocketbase";
import HorizontalScroll from "~/components/HorizontalScroll.vue";

const { t } = useI18n({
  useScope: "local",
});

defineProps<{ location: RecordModel }>();
</script>

<style scoped>
.nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-8) !important;
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "products": "Products",
    "statistics": "Statistics"
  },
  "de": {
    "reservations": "Reservierungen",
    "products": "Gegenständen",
    "statistics": "Statistieken"
  }
}
</i18n>
