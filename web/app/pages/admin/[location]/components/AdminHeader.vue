<template>
  <header>
    <div>
      <h1>
        <span class="h2">{{ location?.name }}</span>
        <span class="h1">{{ title }}</span>
      </h1>
    </div>
    <slot></slot>
  </header>
</template>

<script setup lang="ts">
import type { RecordModel } from "pocketbase";

defineProps<{ title: string; location: RecordModel }>();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--fluid-spacing-4);
  margin-bottom: var(--fluid-spacing-8);
  h1 {
    margin: 0;
  }
  .h1,
  .h2 {
    display: block;
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
