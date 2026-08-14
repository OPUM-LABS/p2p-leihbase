<template>
  <div>
    <label :for="`select-${id}`" :class="hideLabel ? 'sr-only' : ''">
      {{ label }}
    </label>
    <select :id="`select-${id}`" v-bind="$attrs" v-model="model">
      <slot />
    </select>
    <NavArrowDown />
  </div>
</template>

<script lang="ts" setup>
import { NavArrowDown } from "@iconoir/vue";

defineOptions({
  inheritAttrs: false,
});
defineProps<{
  label: string;
  hideLabel?: boolean;
}>();
const id = useId();
const model = defineModel();
</script>

<style scoped>
div {
  --arrow-height: 1.2rem;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.66rem;
}
label {
  font-weight: var(--font-weight-bold);
}
svg {
  position: absolute;
  height: var(--arrow-height);
  right: 0.33rem;
  top: calc(50% - (var(--arrow-height) / 2));
  pointer-events: none;
}
select {
  appearance: none;
  background: transparent;
  border: 0;
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
}
select:hover,
select:focus-visible {
  outline: 2px solid var(--text-color);
}
</style>
