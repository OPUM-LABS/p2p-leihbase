<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { unrefElement } from "@vueuse/core";
import {
  closePopoverKey,
  handleTriggerKey,
  isPopoverOpenKey,
  setTriggerElementKey,
} from "./DropdownMenu.model";

const isPopoverOpen = ref(false);
provide(isPopoverOpenKey, isPopoverOpen);

function handleTrigger() {
  isPopoverOpen.value = !isPopoverOpen.value;
}

function handleClosePopover(focusTrigger: boolean) {
  isPopoverOpen.value = false;
  if (focusTrigger) {
    nextTick(() => {
      unrefElement(triggerElementRef)?.focus();
    });
  }
}

let triggerElementRef = ref<HTMLElement | SVGElement | null>();
function setTriggerElement(
  element: HTMLElement | SVGElement | null | undefined
) {
  triggerElementRef.value = element;
}

provide(handleTriggerKey, handleTrigger);
provide(closePopoverKey, handleClosePopover);
provide(setTriggerElementKey, setTriggerElement);
</script>
