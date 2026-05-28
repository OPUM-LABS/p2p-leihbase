<template>
  <NuxtLink :to="to" class="link">
    <slot></slot>
  </NuxtLink>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

const props = defineProps<{
  to?: string;
}>();
</script>

<style lang="scss" scoped>
.link {
  color: var(--text-color);
}
</style>
