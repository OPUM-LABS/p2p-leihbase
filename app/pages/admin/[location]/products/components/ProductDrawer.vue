<template>
  <Drawer :headerOffset="false" inset v-model:open="open">
    <header>
      <h2>{{ state === "new" ? t("new") : t("edit") }}</h2>
      <div class="buttons">
        <Button
          v-if="state === 'edit'"
          :href="`/link/product/${product?.id}`"
          target="_blank"
          variant="secondary"
          :title="t('open_product_page')"
          circle
        >
          <Eye />
        </Button>
      <Button
        v-if="state === 'edit'"
        variant="secondary"
        circle
        @click="handleRemoveClick"
      >
        <Trash />
      </Button>
      </div>
    </header>
    <Alert v-if="props.reservation?.cancelled" variant="warning">{{
      t("reservation_is_cancelled")
    }}</Alert>
    <form @submit.prevent="handleSubmit">
      <Switch
        id="product-drawer-active"
        :label="t('active')"
        v-model="active"
      />
      <Input id="product-drawer-name-input" :label="t('name')" v-model="name" />
      <RecordPickerInput
        id="product-drawer-categories-input"
        :label="t('categories')"
        collection="categories"
        :search="['name_' + locale]"
        v-model="categories"
        multiple
      />
      <Alert v-if="error" variant="error">{{ error }}</Alert>
      <footer>
        <Button :loading="isSubmitting" type="submit">{{ t("save") }}</Button>
        <Button variant="secondary" @click="handleCancelClick">{{
          t("cancel")
        }}</Button>
      </footer>
    </form>
  </Drawer>
  <Dialog
    v-model:open="removeDialogOpen"
    inset
    :title="t('remove_dialog.title')"
  >
    <p class="remove-dialog-text">{{ t("remove_dialog.text") }}</p>
    <footer>
      <Button :loading="isRemoving" @click="handleRemoveDialogConfirmClick">
        {{ t("remove_dialog.confirm") }}
      </Button>
      <Button variant="secondary" @click="handleRemoveDialogCancelClick">
        {{ t("remove_dialog.cancel") }}
      </Button>
    </footer>
  </Dialog>
</template>

<script lang="ts" setup>
import { Trash, Eye } from "@iconoir/vue";
import type { RecordModel } from "pocketbase";
import RecordPickerInput from "~/components/admin/RecordPickerInput.vue";
import Switch from "~/components/Switch.vue";
import type { Product } from "~/models/product";
import type { Reservation } from "~/models/reservation";

const { pb } = usePocketbase();
const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  state: "new" | "edit";
  location: RecordModel;
  product: Product | null;
}>();
const open = defineModel("open");
const emit = defineEmits(["update"]);

const name = ref<string>();
const active = ref<boolean>();
const categories = ref<string>();
const error = ref<string | null>(null);

watch(open, (isOpening) => {
  if (!isOpening) return;
  error.value = null;
  active.value = props.product?.active || false;
  name.value = props.product?.name || "";
  categories.value = props.product?.categories || [];
});

const isSubmitting = ref(false);
async function handleSubmit() {
  const formData = {
    active: active.value,
    name: name.value,
    categories: categories.value,
  };
  error.value = "";
  isSubmitting.value = true;
  try {
    if (props.state === "new") {
      // Create new reservation
      await pb.collection("products").create(formData);
    } else if (props.state === "edit") {
      if (!props.product?.id) {
        throw new Error("product_undefined");
      }
      // Update existing product
      await pb.collection("products").update(props.product.id, formData);
    }
    open.value = false;
    isSubmitting.value = false;
    emit("update");
  } catch (err) {
    isSubmitting.value = false;
    switch (err?.message) {
      case "Overlapping_reservation.":
        error.value = t("errors.overlapping_reservation");
        break;
      default:
        error.value = t("errors.general");
    }
  }
}

function handleCancelClick() {
  open.value = false;
}

const removeDialogOpen = ref(false);

function handleRemoveClick() {
  removeDialogOpen.value = true;
}

const isRemoving = ref(false);
async function handleRemoveDialogConfirmClick() {
  if (!props.product?.id) {
    console.error("No product id given to delete");
    return;
  }
  isRemoving.value = true;
  try {
    await pb.collection("products").delete(props.product.id);
    removeDialogOpen.value = false;
    open.value = false;
    isRemoving.value = false;
    emit("update");
  } catch (e) {
    isRemoving.value = false;
    console.error("Error removing reservation", e);
  }
}

function handleRemoveDialogCancelClick() {
  removeDialogOpen.value = false;
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
header .buttons {
  display: flex;
  gap: 1rem;
}
footer {
  display: flex;
  gap: 1rem;
}
.remove-dialog-text {
  margin-bottom: 1.666rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "new": "New Product",
    "edit": "Edit Product",
    "open_product_page": "Open product page",
    "active": "Active",
    "name": "Name",
    "save": "Save",
    "cancel": "Cancel",
    "remove_dialog": {
      "title": "Remove product",
      "text": "Are you sure you want to remove this product? There is no way to undo this.",
      "confirm": "Remove product",
      "cancel": "Cancel"
    },
    "errors": {
      "overlapping_reservation": "There is already a reservation for this product during the given period.",
      "general": "Something went wrong while saving the product, please try again."
    }
  },
  "de": {
    "new": "Neue Gegenstand",
    "edit": "Gegenstand bearbeiten",
    "open_product_page": "Gegenstandseite anzeigen",
    "active": "Aktiv",
    "name": "Name",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "remove_dialog": {
      "title": "Gegenstand entfernen",
      "text": "Bist du sicher, dass du diese Gegenstand endgültig entfernen möchtest?",
      "confirm": "Gegenstand entfernen",
      "cancel": "Annulieren"
    },
    "errors": {
      "end_before_start": "Ende kann nicht vor Beginn der Reservierung liegen.",
      "general": "Beim speichern deiner Gegenstand ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
