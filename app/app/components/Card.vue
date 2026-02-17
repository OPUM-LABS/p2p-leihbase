<template>
  <div :class="{ padding }"><slot></slot></div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ padding?: boolean }>(), { padding: true });
</script>

<style scoped>
div {
  background-color: color-mix(in srgb, var(--background-color) 85%, #fff);
  border-radius: calc(var(--border-radius) * 2);
  border-color: color-mix(in srgb, var(--background-color) 90%, #000);
  border-width: 1px;
  border-style: solid;
  &.padding {
    padding: var(--fluid-spacing-12);
  }
}
</style>
