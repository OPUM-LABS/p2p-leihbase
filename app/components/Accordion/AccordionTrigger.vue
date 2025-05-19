<template>
  <Button
    variant="secondary"
    :class="{ open: isOpen }"
    :disabled="disabled"
    @click="toggle!(id!)"
  >
    <slot></slot>
    <NavArrowDown />
  </Button>
</template>

<script setup lang="ts">
import { toggleKey, idKey, isOpenKey } from "./Accordion.model";
import { NavArrowDown } from "@iconoir/vue";

defineProps<{
  // If the accordion trigger is disabled, not interactable
  disabled: boolean;
}>();

const id = inject(idKey);
const isOpen = inject(isOpenKey);
const toggle = inject(toggleKey);
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
