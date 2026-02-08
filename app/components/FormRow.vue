<template>
  <fieldset>
    <label :for="for">{{ label }}{{ required ? " *" : "" }}</label>
    <slot></slot>
  </fieldset>
</template>

<script lang="ts" setup>
const props = defineProps<{
  for: string;
  label: string;
  required?: boolean;
}>();
</script>

<style scoped>
fieldset {
  border: 0;
  padding: 0;
  width: 100%;
}
label {
  display: block;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}
</style>
