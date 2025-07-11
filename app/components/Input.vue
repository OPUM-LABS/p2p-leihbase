<template>
  <FormRow :for="id" :label="label" :required="required">
    <div class="row">
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
        v-model="model"
        :class="{ 'lb-input': true, 'has-prefix': !!$slots.prefix }"
      />
    </div>
    <p v-if="description">
      <small>{{ description }}</small>
    </p>
  </FormRow>
</template>

<script lang="ts" setup>
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
.row {
  display: flex;
  align-items: center;
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
