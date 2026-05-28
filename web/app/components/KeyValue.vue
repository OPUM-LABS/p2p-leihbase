<template>
  <p>
    <span class="key">{{ title }}</span
    ><br />
    <slot>{{ value }}</slot>
  </p>
</template>

<script lang="ts" setup>
defineProps<{ title: string; value?: string }>();
</script>

<style scoped>
.key {
  font-weight: var(--font-weight-bold);
}
</style>
