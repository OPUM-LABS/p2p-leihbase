<template>
  <div class="root">
    <FormLabel :for="id" :required="required">{{ label }}</FormLabel>
    <textarea
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :data-testid="dataTestid"
      v-model="model"
      rows="3"
      class="lb-input"
    ></textarea>
    <p v-if="description" :id="`${id}-description`">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import FormLabel from "./FormLabel.vue";

const model = defineModel();
const props = defineProps<{
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  description?: string;
  dataTestid?: string;
}>();
</script>

<style scoped>
.root {
  width: 100%;
}
.lb-input {
  line-height: 1.15;
  padding: var(--spacing-3) var(--spacing-3);
}
</style>
