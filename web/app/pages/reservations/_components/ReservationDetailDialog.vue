<template>
  <Dialog inset :title="t('rental_details')" v-model:open="open">
    <div v-if="reservation && product" class="product lb-stack">
      <div class="product-header">
        <img
          v-if="product.images && product.images.length > 0"
          :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[0]}${thumbs.sm}`"
        />
        <div>
          <Heading is="h3" size="sm">
            <NuxtLink :to="`/items/${product.id}`" target="_blank">
              {{ product.name }}
            </NuxtLink>
          </Heading>
          <span class="status-badge" :class="`badge-${reservation.status || 'requested'}`">
            {{ t(`status_${reservation.status || 'requested'}`) }}
          </span>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <strong>{{ t("borrow_period") }}</strong>
          <p>{{ formatDate(reservation.start) }} – {{ formatDate(reservation.end) }}</p>
        </div>

        <div v-if="product.deposit" class="detail-item">
          <strong>{{ t("deposit") }}</strong>
          <p>{{ product.deposit }} €</p>
        </div>

        <!-- Handover Address (Revealed when Accepted/Active) -->
        <div v-if="reservation.handover_address" class="detail-item address-box">
          <div class="address-title">
            <MapPin class="icon" />
            <strong>{{ t("handover_address") }}</strong>
          </div>
          <p class="address-text">{{ reservation.handover_address }}</p>
        </div>
        <div v-else class="detail-item address-pending">
          <div class="address-title">
            <Lock class="icon" />
            <strong>{{ t("handover_address") }}</strong>
          </div>
          <p class="address-text">
            {{ t("address_hidden_until_accepted") }} ({{ product.postal_code }} {{ product.city }})
          </p>
        </div>
      </div>
    </div>

    <!-- Actions (Cancel request if pending/accepted) -->
    <div v-if="reservation && canCancel" class="cancel-section">
      <Alert v-if="cancelError" variant="danger">{{ cancelError }}</Alert>
      <Button
        variant="secondary"
        size="sm"
        :loading="isCancelling"
        @click="handleCancel"
      >
        {{ t("cancel_reservation") }}
      </Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Lock, MapPin } from "@iconoir/vue";
import type { Location } from "@@/models/location";
import type { Product } from "@@/models/product";
import type { Reservation } from "@@/models/reservation";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Dialog from "@/components/core/Dialog.vue";
import Heading from "@/components/core/Heading.vue";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { pb } = usePocketbase();

const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  reservation?: Reservation;
  product?: Product;
  location?: Location;
}>();

const emit = defineEmits<{ update: []; close: [] }>();

const open = ref<boolean>(false);
const isCancelling = ref(false);
const cancelError = ref("");

watch(
  () => props.reservation,
  (newValue) => {
    open.value = !!newValue;
  }
);

watch(open, (isOpen) => {
  if (!isOpen) {
    emit("close");
  }
});

const canCancel = computed(() => {
  if (!props.reservation) return false;
  const s = props.reservation.status;
  return s === "requested" || s === "accepted" || !s;
});

function formatDate(dateInput: string | Date) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function handleCancel() {
  if (!props.reservation) return;
  try {
    isCancelling.value = true;
    cancelError.value = "";
    await pb.collection("reservations").update(props.reservation.id, {
      status: "cancelled",
      cancelled: true,
    });
    emit("update");
    open.value = false;
  } catch (err: any) {
    cancelError.value = err?.message || "Failed to cancel.";
  } finally {
    isCancelling.value = false;
  }
}
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-header {
  display: flex;
  gap: 1rem;
  align-items: center;

  img {
    width: 64px;
    height: 64px;
    border-radius: var(--border-radius);
    object-fit: cover;
  }
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: var(--primary-color);
    }
  }
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-gray-50, #f8f9fa);
  padding: 1rem;
  border-radius: var(--border-radius);

  .detail-item {
    p {
      margin: 0.2rem 0 0 0;
    }
  }

  .address-box {
    background: #e7f5ff;
    padding: 0.75rem;
    border-radius: 4px;
    .address-title {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #1971c2;
      .icon {
        width: 1.1rem;
        height: 1.1rem;
      }
    }
    .address-text {
      font-weight: var(--font-weight-medium);
      color: #1864ab;
    }
  }

  .address-pending {
    background: #f8f9fa;
    border: 1px dashed var(--color-gray-300);
    padding: 0.75rem;
    border-radius: 4px;
    .address-title {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--color-gray-600);
      .icon {
        width: 1.1rem;
        height: 1.1rem;
      }
    }
    .address-text {
      font-size: 0.85rem;
      color: var(--color-gray-600);
    }
  }
}

.status-badge {
  display: inline-block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;

  &.badge-requested {
    background: #fff3bf;
    color: #d9480f;
  }
  &.badge-accepted {
    background: #d3f9d8;
    color: #2b8a3e;
  }
  &.badge-started {
    background: #d0ebff;
    color: #1971c2;
  }
  &.badge-ended {
    background: #f1f3f5;
    color: #495057;
  }
  &.badge-cancelled,
  &.badge-declined {
    background: #ffe3e3;
    color: #c92a2a;
  }
}

.cancel-section {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "rental_details": "Borrow Details",
    "borrow_period": "Rental Period",
    "deposit": "Security Deposit",
    "handover_address": "Pickup & Handover Address",
    "address_hidden_until_accepted": "Exact address is revealed once the lender accepts your request.",
    "cancel_reservation": "Cancel Request",
    "status_requested": "Pending Lender Approval",
    "status_accepted": "Accepted (Ready for Pickup)",
    "status_started": "Active / In Use",
    "status_ended": "Returned",
    "status_declined": "Declined",
    "status_cancelled": "Cancelled"
  },
  "de": {
    "rental_details": "Ausleih-Details",
    "borrow_period": "Leihfrist",
    "deposit": "Kaution",
    "handover_address": "Abhol- & Übergabeadresse",
    "address_hidden_until_accepted": "Genaue Adresse wird freigeschaltet, sobald der Verleiher deine Anfrage annimmt.",
    "cancel_reservation": "Anfrage stornieren",
    "status_requested": "Warten auf Bestätigung",
    "status_accepted": "Angenommen (Bereit zur Abholung)",
    "status_started": "Laufend",
    "status_ended": "Zurückgegeben",
    "status_declined": "Abgelehnt",
    "status_cancelled": "Storniert"
  }
}
</i18n>
