<template>
  <div class="root">
    <input
      :id="id"
      type="radio"
      :name="name"
      :value="value"
      :checked="checked"
    />
    <label :for="id">
      <strong>{{ title }}</strong
      ><br />
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  name: string;
  value: string;
  title: string;
  checked: boolean;
}>();
</script>

<style scoped>
.root {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  align-items: flex-start;
  justify-content: center;
}
input {
  position: relative;
  z-index: 1;
  margin-top: 1rem;
}
label {
  margin-inline: -2.5rem;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-block: 0.666rem;
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  border: 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  width: calc(100% + 2.5rem);
  height: 100%;
}
label:hover {
  outline: 2px solid var(--primary-color);
}
</style>
