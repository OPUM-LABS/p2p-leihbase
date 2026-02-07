<template>
  <input v-model="model" :placeholder="placeholder" />
</template>

<script setup>
const model = defineModel();

const props = defineProps({
  placeholder: {
    type: String,
    default: null,
  },
});
</script>

