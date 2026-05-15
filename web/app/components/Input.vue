<template>
  <div class="root">
    <FormLabel v-if="label" :for="id" :required="required">
      {{ label }}
    </FormLabel>
    <div class="wrapper">
      <div v-if="!!$slots.prefix" class="prefix">
        <slot name="prefix"></slot>
      </div>
      <input
        :type="type"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :data-testid="dataTestid"
        :aria-describedby="`${id}-description`"
        v-model="model"
        :class="{ 'lb-input': true, 'has-prefix': !!$slots.prefix }"
      />
    </div>
    <p v-if="description" :id="`${id}-description`">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import FormLabel from "./FormLabel.vue";

const model = defineModel();
defineProps<{
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: string;
  description?: string;
  dataTestid?: string;
}>();
</script>

<style scoped>
.root {
  width: 100%;
}
.wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}
.prefix {
  display: block;
  line-height: 2;
  padding: 0 var(--spacing-2);
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius) 0 0 var(--input-border-radius);
  border-right: 0;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--input-disabled-background-color);
}
.lb-input.has-prefix {
  border-radius: 0 var(--input-border-radius) var(--input-border-radius) 0;
}
p {
  margin: 0;
}
</style>
