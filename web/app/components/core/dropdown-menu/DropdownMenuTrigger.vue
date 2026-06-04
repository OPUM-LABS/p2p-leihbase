<template>
  <component
    ref="button"
    :is="as"
    :aria-expanded="isPopoverOpen ? 'true' : 'false'"
    @click="handleTrigger"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { unrefElement } from "@vueuse/core";
import {
  handleTriggerKey,
  isPopoverOpenKey,
  setTriggerElementKey,
} from "./DropdownMenu.model";

defineProps<{ as: unknown }>();

const button = ref();

const handleTrigger = inject(handleTriggerKey);
const setTriggerRef = inject(setTriggerElementKey);
const isPopoverOpen = inject(isPopoverOpenKey);

watch(button, () => {
  setTriggerRef?.(unrefElement(button));
});
</script>
