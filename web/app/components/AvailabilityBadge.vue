<template>
  <span class="availability-badge">
    <AvailabilityCircle :available="available" />
    <span v-if="props.available">{{ t('common.available') }}</span>
    <span v-else>{{ t('common.unavailable') }}</span>
  </span>
</template>

<script setup>
import AvailabilityCircle from "./AvailabilityCircle.vue";

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
  background-color: var(--secondary-color);
  border-radius: 999px;
  padding: 0.333rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.666rem;
  font-size: var(--font-size-sm);
}
</style>
