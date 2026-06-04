<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { openKey, toggleKey } from "./Accordion.model";

const { single } = defineProps<{
  // If only one accordion item can be open at the same time
  single?: boolean;
}>();

const open = ref<string[]>([]);

function toggle(id: string) {
  const index = open.value.indexOf(id);
  if (index === -1) {
    if (single) {
      open.value = [id];
    } else {
      open.value.push(id);
    }
    return;
  }
  open.value.splice(index, 1);
}

provide(openKey, open);
provide(toggleKey, toggle);
</script>

<style scoped>
div {
  display: grid;
  grid-auto-rows: auto;
  gap: var(--fluid-spacing-2);
}
</style>
