<template>
  <div :class="{ alert: true, [variant]: true, [`size-${size}`]: true }">
    <ThumbsUp v-if="variant === 'success'" />
    <WarningTriangle v-else-if="variant === 'warning'" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ThumbsUp, WarningTriangle } from "@iconoir/vue";

withDefaults(
  defineProps<{
    variant?: "success" | "error" | "warning";
    size?: "sm" | "md";
  }>(),
  {
    variant: "success",
    size: "md",
  }
);
</script>

<style lang="scss" scoped>
.alert {
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius);
  display: flex;
  gap: 1rem;
  &.success {
    background-color: var(--surface-success-color);
  }
  &.warning {
    background-color: var(--surface-warning-color);
  }
  &.error {
    background-color: var(--surface-error-color);
  }
  &.size-sm {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    svg {
      width: 1.25em;
    }
  }
  svg {
    flex-shrink: 0;
  }
}
</style>
