<template>
  <span :class="{ badge: true, [variant]: true }">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ variant: "neutral" | "success" | "error" | "warning" }>(),
  {
    variant: "success",
  }
);
</script>

<style lang="scss" scoped>
.badge {
  font-size: var(--font-size-sm);
  padding: 0.2rem 0.4rem;
  border-radius: var(--border-radius);
  &.neutral {
    background-color: var(--surface-neutral-color);
  }
  &.success {
    background-color: var(--surface-success-color);
  }
  &.warning {
    background-color: var(--surface-warning-color);
  }
  &.error {
    background-color: var(--surface-error-color);
  }
}
</style>
