<template>
  <div :class="{ alert: true, [variant]: true }">
    <ThumbsUp v-if="variant === 'success'" />
    <WarningTriangle v-else-if="variant === 'warning'" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ThumbsUp } from "@iconoir/vue";
import { WarningTriangle } from "@iconoir/vue";
withDefaults(defineProps<{ variant?: "success" | "error" | "warning" }>(), {
  variant: "success",
});
</script>

<style lang="scss" scoped>
.alert {
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius);
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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
