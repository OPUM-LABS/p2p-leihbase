<template>
  <span class="availability-badge">
    <AvailabilityCircle :available="available" />
    <span v-if="props.available">{{ t("available") }}</span>
    <span v-else>{{ t("unavailable") }}</span>
  </span>
</template>

<script setup>
const { t } = useI18n({
  useScope: "local",
});
const props = defineProps({
  available: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.availability-badge {
  background-color: var(--button-secondary-bg-color);
  border-radius: 999px;
  padding: 0.333rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.666rem;
  font-size: var(--font-size-sm);
}
</style>

<i18n lang="json">
{
  "en": {
    "available": "Available",
    "unavailable": "Not available"
  },
  "de": {
    "available": "Gerade verfügbar",
    "unavailable": "Gerade nicht verfügbar"
  }
}
</i18n>
