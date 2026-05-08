<template>
  <div class="root">
    <FormLabel :for="id" :required="required">{{ label }}</FormLabel>
    <div class="row">
      <input
        type="text"
        :id="id"
        :name="name"
        :value="
          isLoading
            ? t('loading')
            : records && records.length > 0
              ? multiple
                ? records.map((r) => r[columns[0]]).join(', ')
                : records[0][columns[0]]
              : t('none')
        "
        disabled
        readonly
        :data-testid="dataTestid"
        :class="{ 'lb-input': true }"
      />
      <button @click.prevent="showRecordPicker = true">
        {{ t("select") }}
      </button>
    </div>
    <p v-if="description">
      <small>{{ description }}</small>
    </p>
  </div>

  <Teleport to="body">
    <RecordPicker
      v-model:open="showRecordPicker"
      :collection="collection"
      :columns="columns"
      :multiple="multiple"
      :selected="records"
      :title="label"
      @select="handleSelect"
    />
  </Teleport>
</template>

<script lang="ts" setup>
import type { RecordModel } from "pocketbase";
import { equalValues } from "@@/lib/array";
import RecordPicker from "./RecordPicker.vue";

const { t } = useI18n({
  useScope: "local",
});

const { pb } = usePocketbase();

const model = defineModel<string | string[]>();
const props = defineProps<{
  id: string;
  label: string;
  collection: string;
  columns: string[];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  dataTestid?: string;
  multiple?: boolean;
  description?: string;
}>();

const showRecordPicker = ref(false);
const records = ref<RecordModel[] | null>(null);
const isLoading = ref(false);

/**
 * On input value change, decide if displayed value should be refetched
 */
watch(model, (newModelValue) => {
  const active = (records.value || []).map((record) => record.id);
  if (!newModelValue) {
    records.value = [];
    return;
  }
  if (typeof newModelValue === "string" && active.includes(newModelValue)) {
    return;
  }
  if (
    Array.isArray(newModelValue) &&
    equalValues(active, newModelValue || [])
  ) {
    return;
  }
  refresh();
});

/**
 * Refetches active entries, to render readable values in the input
 */
async function refresh() {
  if (!model.value) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  records.value = await pb.collection(props.collection).getFullList({
    filter: pb.filter(`{:ids} ~ id`, { ids: model.value }),
  });
  isLoading.value = false;
}

/**
 * Update model based on selected records in the RecordPicker
 */
function handleSelect(selectedRecords: RecordModel[]) {
  records.value = selectedRecords;
  model.value =
    selectedRecords && selectedRecords.length > 0
      ? props.multiple
        ? selectedRecords.map((r) => r.id)
        : selectedRecords[0].id
      : props.multiple
        ? []
        : "";
}
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
}
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
