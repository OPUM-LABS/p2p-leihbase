<template>
  <Button
    variant="secondary"
    :id="id + '-trigger'"
    :class="{ open: isOpen }"
    :disabled="disabled"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-controls="id + '-content'"
    @click="toggle!(id!)"
  >
    <slot></slot>
    <NavArrowDown />
  </Button>
</template>

<script setup lang="ts">
import { NavArrowDown } from "@iconoir/vue";
import Button from "../Button.vue";
import { idKey, isOpenKey, toggleKey } from "./Accordion.model";

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
