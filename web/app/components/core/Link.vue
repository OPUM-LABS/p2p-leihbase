<template>
  <component :is="component" :to="to" :href="href" class="link">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

const props = defineProps<{
  to?: string;
  href?: string;
}>();

const component = computed(() => {
  if (props.to) return NuxtLink;
  if (props.href) return "a";
  return "button";
});
</script>

<style lang="scss" scoped>
.link {
  background: none;
  border: 0;
  color: var(--text-color);
  text-decoration: underline;
  cursor: pointer;
}
</style>
