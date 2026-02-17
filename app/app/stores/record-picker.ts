import type { RecordModel } from "pocketbase";

interface State {
  id: string | null;
  open: boolean;
  title: string | null;
  collection: string | null;
  columns: string[] | null;
  selected: RecordModel[] | null;
  multiple: boolean;
}

export const useRecordPickerStore = defineStore<"record-picker", State>(
  "record-picker",
  {
    state: () => ({
      id: null,
      open: false,
      title: null,
      collection: null,
      columns: null,
      selected: null,
      multiple: false,
    }),
    getters: {},
    actions: {
      show({
        id,
        title,
        collection,
        columns,
        selected,
        multiple,
      }: Omit<State, "open">) {
        this.id = id;
        this.open = true;
        this.title = title;
        this.collection = collection;
        this.columns = columns;
        this.selected = selected;
        this.multiple = multiple;
      },
    },
  }
);
