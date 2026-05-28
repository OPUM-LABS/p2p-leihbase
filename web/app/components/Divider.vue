<template>
  <hr :class="`spacing-${spacing}`" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    spacing?: "none" | "md";
  }>(),
  {
    spacing: "none",
  }
);
</script>

<style scoped>
hr {
  border: 0;
  border-top: 1px solid var(--input-border-color);
}
hr.spacing-md {
  margin-block: 0.5rem;
}
</style>
