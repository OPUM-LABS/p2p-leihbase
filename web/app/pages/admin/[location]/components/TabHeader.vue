<template>
  <header>
    <slot name="prefix" />
    <slot>
      <Heading is="h3" size="md" cap>{{ title }}</Heading>
    </slot>
    <slot name="suffix" />
  </header>
</template>

<script setup lang="ts">
import Heading from "@/components/core/Heading.vue";

defineProps<{ title?: string }>();
</script>

<style scoped>
header {
  display: flex;
  margin-bottom: 1rem;
  gap: var(--fluid-spacing-8);
}

header > button {
  background-color: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

header > button .icon {
  width: 1em;
  height: 1em;
}
</style>
