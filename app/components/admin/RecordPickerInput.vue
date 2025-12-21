<template>
  <FormRow :for="id || undefined" :label="label" :required="required">
    <div class="row">
      <input
        type="text"
        :id="id || undefined"
        :name="name"
        :value="
          isLoading
            ? t('loading')
            : records && records.length > 0
            ? multiple
              ? records.map((r) => r[search[0]]).join(', ')
              : records[0][search[0]]
            : t('none')
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
import { type RecordModel } from "pocketbase";
import { useRecordPickerStore } from "~/stores/record-picker";
import { equalValues } from "~/lib/array";

const { t } = useI18n({
  useScope: "local",
});

const { pb } = usePocketbase();

const model = defineModel<string | string[]>();
const props = defineProps<{
  id: string;
  label: string;
  collection: string;
  search: string[];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  dataTestid?: string;
  multiple?: boolean;
}>();

const recordPickerStore = useRecordPickerStore();
const { id, selected } = storeToRefs(recordPickerStore);

const records = ref<RecordModel[] | null>(null);
const isLoading = ref(true);

watch(model, (newModelValue) => {
  const active = (records.value || []).map((record) => record.id);
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

watch(selected, (newSelected) => {
  if (id.value !== props.id) {
    return;
  }
  records.value = newSelected;
  model.value =
    newSelected && newSelected.length > 0
      ? props.multiple
        ? newSelected?.map((r) => r.id)
        : newSelected[0].id
      : props.multiple
      ? []
      : "";
});

async function refresh() {
  if (!model.value) {
    return;
  }
  isLoading.value = true;
  records.value = await pb.collection(props.collection).getFullList({
    filter: pb.filter(`{:ids} ~ id`, { ids: model.value }),
  });
  isLoading.value = false;
}

function handleClick() {
  recordPickerStore.show({
    id: props.id,
    title: props.label,
    collection: props.collection,
    selected: records.value,
    columns: props.search,
    multiple: props.multiple,
  });
}

refresh();
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
