<template>
  <Button
    variant="secondary"
    :class="{ open: isOpen }"
    @click="handleToggle!(id!)"
  >
    <slot></slot>
    <NavArrowDown />
  </Button>
</template>

<script setup lang="ts">
import { handleToggleKey, idKey, isOpenKey } from "./Accordion.model";
import { NavArrowDown } from "@iconoir/vue";

const id = inject(idKey);
const isOpen = inject(isOpenKey);
const handleToggle = inject(handleToggleKey);
</script>

<style scoped>
button {
  width: 100%;
  justify-content: space-between;
}
button svg {
  transition: transform 200ms;
}
button.open svg {
  transform: scaleY(-1);
}
</style>
