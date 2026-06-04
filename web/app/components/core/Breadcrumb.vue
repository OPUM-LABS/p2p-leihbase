<template>
  <ul>
    <li v-for="item in items">
      <NuxtLink v-if="isItem(item)" :to="item.href">
        {{ item.label }}
      </NuxtLink>
      <span v-else v-for="child in item">
        <NuxtLink :to="child.href">
          {{ child.label }}
        </NuxtLink>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { BreadcrumbItem, BreadcrumbList } from "./Breadcrumb.model";

defineProps<{ items: BreadcrumbList[] }>();

function isItem(item: BreadcrumbList): item is BreadcrumbItem {
  if (Array.isArray(item)) return false;
  return true;
}
</script>

<style scoped>
ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  margin-bottom: var(--fluid-spacing-8);
  & > li:not(:last-child)::after {
    content: ">";
    margin-left: 0.5rem;
    color: var(--text-color-light);
  }
  li > span:not(:last-child)::after {
    content: ", ";
  }
  a {
    color: var(--text-color);
  }
}
</style>
