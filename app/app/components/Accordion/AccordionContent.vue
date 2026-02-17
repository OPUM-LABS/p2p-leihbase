<template>
  <div
    :id="id + '-content'"
    :aria-labelledby="id + '-trigger'"
    :class="{ content: true, open: isOpen }"
  >
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { idKey, isOpenKey } from "./Accordion.model";

const id = inject(idKey);
const isOpen = inject(isOpenKey);
</script>

<style scoped>
div.content {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition:
    grid-template-rows 200ms,
    visibility 200ms;
  visibility: hidden;
}
div.content.open {
  grid-template-rows: 1fr;
  visibility: visible;
}
div.content > div {
  padding: var(--fluid-spacing-4) 0 var(--fluid-spacing-8) 0;
  overflow: hidden;
}
</style>
