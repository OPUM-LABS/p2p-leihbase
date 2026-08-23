<template>
  <Drawer :headerOffset="false" inset v-model:open="open">
    <!-- Header -->
    <header>
      <Heading is="h2" size="lg">{{
        state === "new" ? t('admin.product_drawer.new') : t('admin.product_drawer.edit')
      }}</Heading>
      <div class="buttons">
        <Button
          v-if="state === 'edit'"
          :href="`/link/product/${product?.id}`"
          target="_blank"
          variant="secondary"
          :title="t('admin.product_drawer.open_product_page')"
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
        <Button variant="secondary" circle @click="open = false">
          <Xmark />
        </Button>
      </div>
    </header>

    <!-- Inactive product warning -->
    <Alert v-if="state === 'edit' && !props.product?.active" variant="warning">
      {{ t('admin.product_drawer.product_is_inactive') }}
    </Alert>

    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <Switch
        id="product-drawer-active"
        :label="t('admin.product_drawer.active')"
        v-model="active"
      />
      <Input
        id="product-drawer-name-input"
        :label="t('admin.product_drawer.name')"
        v-model="name"
        required
      />
      <RecordPickerInput
        id="product-drawer-categories-input"
        :label="t('admin.product_drawer.categories')"
        collection="categories"
        :columns="['name_' + locale]"
        v-model="categories"
        multiple
      />
      <Input
        id="product-drawer-deposit-input"
        type="number"
        :label="t('admin.product_drawer.deposit')"
        v-model="deposit"
      >
        <template #prefix>€</template>
      </Input>
      <ImageInput
        :label="t('admin.product_drawer.images')"
        :recordId="product?.id"
        collection="products"
        v-model:images="images"
        v-model:new-images="newImages"
      />
      <RichTextarea
        id="product-drawer-description-input"
        :label="t('admin.product_drawer.description')"
        v-model="description"
      />
      <RichTextarea
        id="product-drawer-notes-input"
        :label="t('admin.product_drawer.notes')"
        v-model="notes"
      />
      <RecordPickerInput
        id="product-drawer-user-input"
        :label="t('admin.product_drawer.user')"
        collection="users"
        :columns="['name', 'email']"
        v-model="user"
        :description="t('admin.product_drawer.user_description')"
      />
      <Alert v-if="error" variant="error">{{ error }}</Alert>
      <footer>
        <Button :loading="isSubmitting" type="submit">{{ t('admin.product_drawer.save') }}</Button>
        <Button variant="secondary" @click="handleCancelClick">{{
          t('admin.product_drawer.cancel')
        }}</Button>
      </footer>
    </form>
  </Drawer>

  <!-- Removal confirmation dialog -->
  <Dialog
    v-model:open="removeDialogOpen"
    inset
    :title="t('admin.product_drawer.remove_dialog.title')"
  >
    <p class="remove-dialog-text">{{ t('admin.product_drawer.remove_dialog.text') }}</p>
    <footer>
      <Button :loading="isRemoving" @click="handleRemoveDialogConfirmClick">
        {{ t('admin.product_drawer.remove_dialog.confirm') }}
      </Button>
      <Button variant="secondary" @click="handleRemoveDialogCancelClick">
        {{ t('admin.product_drawer.remove_dialog.cancel') }}
      </Button>
    </footer>
  </Dialog>
</template>

<script lang="ts" setup>
import type { Product } from "@@/models/product";
import RecordPickerInput from "@/components/admin/RecordPickerInput.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Dialog from "@/components/core/Dialog.vue";
import Drawer from "@/components/core/Drawer.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import ImageInput from "@/components/ImageInput.vue";
import { Eye, Trash, Xmark } from "@iconoir/vue";
import type { RecordModel } from "pocketbase";

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
const deposit = ref<string>();
const images = ref<string[]>([]);
const newImages = ref<File[]>([]);
const description = ref<string>();
const notes = ref<string>();
const user = ref<string>();

const error = ref<string | null>(null);

watch(open, (isOpening) => {
  if (!isOpening) return;
  error.value = null;
  active.value = props.product?.active || false;
  name.value = props.product?.name || "";
  categories.value = props.product?.categories || [];
  deposit.value = props.product?.deposit || 0;
  images.value = props.product?.images || [];
  newImages.value = [];
  description.value = props.product?.description || "";
  notes.value = props.product?.notes || "";
  user.value = props.product?.user || undefined;
});

const isSubmitting = ref(false);
async function handleSubmit() {
  const formData = {
    location: props.location.id,
    active: active.value,
    name: name.value,
    categories: categories.value,
    images: images.value,
    "images+": newImages.value,
    deposit: deposit.value,
    description: description.value === "<p><br></p>" ? "" : description.value,
    notes: notes.value === "<p><br></p>" ? "" : notes.value,
    user: user.value,
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
    if (err instanceof Error) {
      switch (err?.message) {
        case "Overlapping_reservation.":
          error.value = t("admin.product_drawer.errors.overlapping_reservation");
          break;
        default:
          error.value = t("admin.product_drawer.errors.general");
      }
    } else {
      error.value = t("admin.product_drawer.errors.general");
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
  margin-bottom: var(--fluid-spacing-4);
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
