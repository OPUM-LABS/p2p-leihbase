<template>
  <div ref="div" :class="{ open: isOpen }" data-base-theme>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { closePopoverKey, isPopoverOpenKey } from "./DropdownMenu.model";

const isOpen = inject(isPopoverOpenKey);
const closePopover = inject(closePopoverKey);

const div = ref();

/**
 * On focusout, close popover
 */
function handleFocusout() {
  setTimeout(() => {
    if (div.value.contains(document.activeElement)) {
      return;
    }
    closePopover?.(false);
  });
}

/**
 * On escape key, close popover
 */
function handleDocumentKeyUp(e: KeyboardEvent) {
  if (e.key === "Escape") {
    closePopover?.(true);
  }
}

watch(
  () => isOpen?.value,
  (isOpen) => {
    if (isOpen) {
      // When opening, focus first popover entry
      nextTick(() => {
        div.value?.querySelector("a, button, [tabindex]")?.focus();
      });
      div.value.addEventListener("focusout", handleFocusout);
      document.addEventListener("keyup", handleDocumentKeyUp);
    } else {
      div.value.removeEventListener("focusout", handleFocusout);
      document.removeEventListener("keyup", handleDocumentKeyUp);
    }
  }
);
</script>

<style scoped>
div {
  display: none;
}
div.open {
  display: block;
}
</style>
