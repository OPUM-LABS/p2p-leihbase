import { ClientResponseError, type RecordModel } from "pocketbase";
import type Client from "pocketbase";

type ErrorCode = {
  code: string;
};

export function usePocketbaseUpdate(pb: Client, collection: string) {
  const loading = ref(false);
  const errors = reactive<{
    general: string;
    fields: Record<string, string>;
  }>({
    general: "",
    fields: {},
  });

  function resetErrors() {
    errors.general = "";
    errors.fields = {};
  }

  function isErrorCode(value: any): value is ErrorCode {
    return typeof value === "object" && value.code;
  }

  async function update(id: string, data: Record<string, any>) {
    loading.value = true;
    let result;
    try {
      result = await pb.collection(collection).update(id, data);
      resetErrors();
    } catch (e) {
      // Parse errors
      if (e instanceof ClientResponseError) {
        Object.entries(e.response.data).map(([key, value]) => {
          if (isErrorCode(value)) {
            errors.fields[key] = value.code;
          }
        });
      } else {
        errors.general = "general";
      }
      if (e instanceof Error) {
        throw e;
      }
      throw new Error("Error updating record");
    } finally {
      loading.value = false;
    }
    return result;
  }

  return {
    loading,
    update,
    errors
  };
}
