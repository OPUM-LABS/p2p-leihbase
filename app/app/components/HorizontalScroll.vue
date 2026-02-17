<!--
  Component which adds a horizontal scroll when the content overflows
  helpful to display content on mobile horizontally
-->

<template>
  <component :is="is" class="horizontal-scroll">
    <slot />
  </component>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ is?: string }>(), { is: "div" });
</script>

<style scoped>
.horizontal-scroll {
  overflow-x: auto;
  margin-inline: calc(var(--fluid-spacing-8) * -1);
  padding-inline: var(--fluid-spacing-8);
  padding-block: 0.3rem;
  margin-block: -0.3rem;
}
</style>
