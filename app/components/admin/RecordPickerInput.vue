<template>
  <FormRow :for="id" :label="label" :required="required">
    <div class="row">
      <input
        type="text"
        :id="id"
        :name="name"
        :value="
          isLoading ? t('loading') : record ? record[search[0]] : t('none')
        "
        disabled
        readonly
        :data-testid="dataTestid"
        :class="{ 'lb-input': true }"
      />
      <button @click.prevent="handleClick">
        {{ t("select") }}
      </button>
    </div>
  </FormRow>
</template>

<script lang="ts" setup>
import type RecordPicker from "./RecordPicker.vue";

const { t } = useI18n({
  useScope: "local",
});

const model = defineModel<string>();
const props = defineProps<{
  id: string;
  label: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  dataTestid?: string;
  collection: string;
  search: string[];
}>();

const recordPicker =
  inject<Ref<InstanceType<typeof RecordPicker>>>("recordPicker");

const { record, show, isLoading } = await useRecordPicker(model, recordPicker, {
  title: props.label,
  collection: props.collection,
  search: props.search,
  value: model.value,
});

watch(record, (newRecord) => {
  model.value = newRecord?.id;
});

function handleClick() {
  show();
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius);
}
input {
  border: 0;
}
button {
  border-radius: 0 var(--input-border-radius) var(--input-border-radius) 0;
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    border: 2px solid var(--primary-color);
    margin: -1px -1px -1px 0;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "loading": "Loading...",
    "select": "Select",
    "none": "None"
  },
  "de": {
    "loading": "Laden...",
    "select": "Auswählen",
    "none": "Keine"
  }
}
</i18n>
