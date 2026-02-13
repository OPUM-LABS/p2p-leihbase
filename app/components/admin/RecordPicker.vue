<template>
  <Dialog v-model:open="open" inset :title="title || ''">
    <template #header>
      <Input
        placeholder="Enter search query..."
        class="input"
        v-model="query"
        @input="handleQueryInput"
      />
    </template>
    <table cellspacing="0">
      <tr v-for="d in documents" :key="d.id">
        <td width="36">
          <Check v-if="selectedIds?.includes(d.id)" />
        </td>
        <td v-for="s in columns" @click="handleRecordClick(d)">
          {{ d[s] }}
        </td>
      </tr>
    </table>
  </Dialog>
</template>

<script lang="ts" setup>
import type { RecordModel } from "pocketbase";
import { useRecordPickerStore } from "~/stores/record-picker";
import { Check } from "@iconoir/vue";

const props = defineProps<{ id: string }>();

const { pb } = usePocketbase();

const { open, title, collection, columns, selected, multiple } = storeToRefs(
  useRecordPickerStore()
);

// Search query
const query = ref("");
watch(open, () => {
  query.value = "";
});

const selectedIds = computed(() => {
  if (!selected.value) {
    return [];
  }
  return selected.value.map((s) => s.id);
});

/**
 * Fetches all documents for the current active collection
 */
const { data: documents, refresh } = await useAsyncData(
  props.id,
  async () => {
    if (!collection.value || !columns.value) {
      throw new Error(
        "[RecordPicker] no `collection` or `columns` parameter set"
      );
    }
    const records = await pb.collection(collection.value).getFullList(
      query.value
        ? {
            filter: pb.filter(
              columns.value.map((s) => `${s} ~ {:query}`).join(" || "),
              {
                query: query.value,
              }
            ),
          }
        : {}
    );
    return structuredClone(records);
  },
  { watch: [open, query] }
);

function handleQueryInput() {
  refresh();
}

function handleRecordClick(_record: RecordModel) {
  // Multiple
  if (multiple.value) {
    if (selectedIds.value.includes(_record.id)) {
      // If already active, remove
      selected.value = (selected.value || []).filter(
        (s) => s.id !== _record.id
      );
    } else {
      // If not already active, add
      selected.value = [...(selected.value || []), _record];
    }
  } else {
    // Singular
    if (
      selected.value &&
      selected.value.length > 0 &&
      selected.value[0].id === _record.id
    ) {
      selected.value = [];
    } else {
      selected.value = [_record];
    }
    open.value = false;
  }
}
</script>

<style scoped>
.input {
  margin-bottom: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table tr:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}
table td {
  border: 1px solid #f3f3f3;
  padding: 0.25rem 0.5rem;
}
</style>
