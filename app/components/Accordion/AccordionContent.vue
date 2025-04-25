<template>
  <div :class="{ content: true, open: isOpen }">
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isOpenKey } from "./Accordion.model";

const isOpen = inject(isOpenKey);
</script>

<style scoped>
div.content {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 200ms;
}
div.content.open {
  grid-template-rows: 1fr;
}
div.content > div {
  padding: var(--fluid-spacing-4) 0;
  overflow: hidden;
}
</style>
