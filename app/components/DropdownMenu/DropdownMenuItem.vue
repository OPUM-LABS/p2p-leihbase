<template>
  <component :is="as" @click="handleClick">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { closePopoverKey } from "./DropdownMenu.model";

defineProps<{ as: unknown }>();

const closePopover = inject(closePopoverKey);

function handleClick() {
  closePopover?.(false);
}
</script>
