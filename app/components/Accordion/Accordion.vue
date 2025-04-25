<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { handleToggleKey, openKey } from "./Accordion.model";

const { single } = defineProps<{ single?: boolean }>();

const open = ref<string[]>([]);

function handleToggle(id: string) {
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
console.log("provide", handleToggle);
provide(handleToggleKey, handleToggle);
</script>

<style scoped>
div {
  display: grid;
  grid-auto-rows: auto;
  gap: var(--fluid-spacing-2);
}
</style>
