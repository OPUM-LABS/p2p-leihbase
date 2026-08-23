<template>
  <Drawer :headerOffset="false" inset v-model:open="open">
    <header>
      <Heading is="h2" size="lg" cap>{{
        state === "new" ? t('admin.reservation_drawer.new') : t('admin.reservation_drawer.edit')
      }}</Heading>
      <div class="buttons">
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
    <Alert v-if="props.reservation?.cancelled" variant="warning">{{
      t('admin.reservation_drawer.reservation_is_cancelled')
    }}</Alert>
    <form @submit.prevent="handleSubmit">
      <RecordPickerInput
        id="reservation-drawer-product-input"
        :label="t('admin.reservation_drawer.product')"
        collection="products"
        :columns="['name']"
        v-model="productId"
        required
      />
      <RecordPickerInput
        id="reservation-drawer-user-input"
        :label="t('admin.reservation_drawer.user')"
        collection="users"
        :columns="['name', 'email']"
        v-model="userId"
      />
      <DateInput
        id="reservation-drawer-start-input"
        :label="t('admin.reservation_drawer.start')"
        v-model="start"
        required
      />
      <DateInput
        id="reservation-drawer-end-input"
        :label="t('admin.reservation_drawer.end')"
        v-model="end"
        required
      />
      <Switch
        id="reservation-drawer-started-input"
        :label="t('admin.reservation_drawer.collected')"
        v-model="started"
      />
      <Switch
        id="reservation-drawer-ended-input"
        :label="t('admin.reservation_drawer.returned')"
        v-model="ended"
      />
      <!-- Deposit -->
      <!-- Show as description the default deposit of this product (when known) -->
      <Input
        id="reservation-drawer-deposit-input"
        :label="t('admin.reservation_drawer.deposit')"
        v-model="deposit"
        type="number"
        :description="
          productId &&
          productId === reservation?.product &&
          reservation?.expand?.product?.deposit
            ? t('admin.reservation_drawer.deposit_description', [
                reservation?.expand?.product?.name,
                formatCurrency(reservation?.expand?.product?.deposit, locale),
              ])
            : ''
        "
      >
        <template #prefix>€</template>
      </Input>
      <RichTextarea
        id="reservation-drawer-note-input"
        :label="t('admin.reservation_drawer.note')"
        v-model="note"
      />
      <Switch
        id="reservation-drawer-cancelled-input"
        :label="t('admin.reservation_drawer.cancelled')"
        v-model="cancelled"
      />
      <div class="sent-emails">
        <strong>{{ t('admin.reservation_drawer.sent_emails') }}</strong>
        <ul
          v-if="
            props.reservation?.sent_emails &&
            props.reservation.sent_emails.length > 0
          "
        >
          <li v-for="email in props.reservation?.sent_emails">
            <Mail /> {{ t('admin.reservation_drawer.email_' + email) }}
          </li>
        </ul>
        <p v-else>
          {{ t('admin.reservation_drawer.sent_emails_none') }}
        </p>
      </div>
      <Alert v-if="error" variant="error">{{ error }}</Alert>
      <footer>
        <Button :loading="isSubmitting" type="submit">{{ t('admin.reservation_drawer.save') }}</Button>
        <Button variant="secondary" @click="handleCancelClick">{{
          t('admin.reservation_drawer.cancel')
        }}</Button>
      </footer>
    </form>
  </Drawer>
  <!-- Removal confirmation dialog -->
  <Dialog
    v-model:open="removeDialogOpen"
    inset
    :title="t('admin.reservation_drawer.remove_dialog.title')"
  >
    <p class="remove-dialog-text">{{ t('admin.reservation_drawer.remove_dialog.text') }}</p>
    <footer>
      <Button :loading="isRemoving" @click="handleRemoveDialogConfirmClick">
        {{ t('admin.reservation_drawer.remove_dialog.confirm') }}
      </Button>
      <Button variant="secondary" @click="handleRemoveDialogCancelClick">
        {{ t('admin.reservation_drawer.remove_dialog.cancel') }}
      </Button>
    </footer>
  </Dialog>
</template>

<script lang="ts" setup>
import { formatCurrency } from "@@/lib/currency";
import type { Reservation } from "@@/models/reservation";
import RecordPickerInput from "@/components/admin/RecordPickerInput.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import DateInput from "@/components/core/DateInput.vue";
import Dialog from "@/components/core/Dialog.vue";
import Drawer from "@/components/core/Drawer.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import { Mail, Trash, Xmark } from "@iconoir/vue";
import type { RecordModel } from "pocketbase";

const { pb } = usePocketbase();
const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  state: "new" | "edit";
  location: RecordModel;
  reservation: Reservation | null;
}>();
const open = defineModel("open");
const emit = defineEmits(["update"]);

const productId = ref<string>();
const userId = ref<string>();
const start = ref<Date>();
const end = ref<Date>();
const started = ref<boolean>(false);
const ended = ref<boolean>(false);
const cancelled = ref<boolean>(false);
const deposit = ref<number>(0);
const note = ref<string>();
const error = ref<string | null>(null);

watch(open, (isOpening) => {
  if (!isOpening) return;
  error.value = null;
  productId.value = props.reservation?.product || undefined;
  userId.value = props.reservation?.user || undefined;
  start.value = props.reservation?.start
    ? new Date(props.reservation.start)
    : undefined;
  end.value = props.reservation?.end
    ? new Date(props.reservation.end)
    : undefined;
  started.value = props.reservation?.started || false;
  ended.value = props.reservation?.ended || false;
  cancelled.value = props.reservation?.cancelled || false;
  deposit.value = props.reservation?.deposit || 0;
  if (props.reservation) {
    note.value = props.reservation?.note || "";
  } else if (props.location.note_default) {
    // NOTE: this weird HTML formatting is required because the Quill richt-text
    // editor for some reason wants the HTML formatted this way, otherwise it
    // inserts extra paragraphs...
    note.value = props.location.note_default.replace(
      /<\/p>[\n\r]+<p>/g,
      "\n</p><p>"
    );
  } else {
    note.value = "";
  }
});

const isSubmitting = ref(false);
async function handleSubmit() {
  const formData = {
    user: userId.value,
    product: productId.value,
    location: props.location.id,
    start: start.value,
    end: end.value,
    started: started.value,
    ended: ended.value,
    cancelled: cancelled.value,
    deposit: deposit.value,
    note: note.value === "<p><br></p>" ? "" : note.value,
  };
  error.value = "";
  isSubmitting.value = true;
  try {
    if (props.state === "new") {
      // Create new reservation
      await pb.collection("reservations").create(formData);
    } else if (props.state === "edit") {
      if (!props.reservation?.id) {
        throw new Error("reservation_undefined");
      }
      // Update existing reservation
      await pb
        .collection("reservations")
        .update(props.reservation.id, formData);
    }
    open.value = false;
    isSubmitting.value = false;
    emit("update");
  } catch (err) {
    isSubmitting.value = false;
    if (err instanceof Error) {
      switch (err?.message) {
        case "Overlapping_reservation.":
          error.value = t("admin.reservation_drawer.errors.overlapping_reservation");
          break;
        case "Start_before_today.":
          error.value = t("admin.reservation_drawer.errors.start_before_today");
          break;
        case "End_before_today.":
          error.value = t("admin.reservation_drawer.errors.end_before_today");
          break;
        case "Start_and_end_equal.":
          error.value = t("admin.reservation_drawer.errors.start_and_end_equal");
          break;
        case "End_before_start.":
          error.value = t("admin.reservation_drawer.errors.end_before_start");
          break;
        default:
          error.value = t("admin.reservation_drawer.errors.general");
      }
    } else {
      error.value = t("admin.reservation_drawer.errors.general");
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
  if (!props.reservation?.id) {
    console.error("No reservation id given to delete");
    return;
  }
  isRemoving.value = true;
  try {
    await pb.collection("reservations").delete(props.reservation.id);
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
  align-items: center;
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
.sent-emails {
  width: 100%;
  background-color: var(--surface-neutral-color);
  padding: 1rem;
  border-radius: var(--border-radius);
}
.sent-emails ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sent-emails p {
  margin: 0;
}
.sent-emails li {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.sent-emails li svg {
  height: 1.2em;
  width: 1.2em;
}
</style>
