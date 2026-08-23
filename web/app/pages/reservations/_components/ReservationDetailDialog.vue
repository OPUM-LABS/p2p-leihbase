<template>
  <Dialog inset :title="t('reservations.detail_dialog.rental_details')" v-model:open="open">
    <div v-if="reservation && product" class="product lb-stack">
      <div class="product-header">
        <img
          v-if="product.images && product.images.length > 0"
          :src="getProductImageUrl(product.id, product.images[0], thumbs.sm) || ''"
        />
        <div>
          <Heading is="h3" size="sm">
            <NuxtLink :to="`/items/${product.id}`" target="_blank">
              {{ product.name }}
            </NuxtLink>
          </Heading>
          <span class="status-badge" :class="`badge-${reservation.status || 'requested'}`">
            {{ t(`reservations.detail_dialog.status_${reservation.status || 'requested'}`) }}
          </span>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <strong>{{ t('reservations.detail_dialog.borrow_period') }}</strong>
          <p>{{ formatDate(reservation.start) }} – {{ formatDate(reservation.end) }}</p>
        </div>

        <div v-if="product.deposit" class="detail-item">
          <strong>{{ t('reservations.detail_dialog.deposit') }}</strong>
          <p>{{ product.deposit }} €</p>
        </div>

        <!-- Combined Lender & Pickup Address Card -->
        <!-- 1. Accepted State: Linked to Google Maps -->
        <a
          v-if="reservation.handover_address"
          :href="googleMapsUrl || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="combined-address-card is-accepted"
          :title="t('reservations.detail_dialog.open_in_google_maps')"
        >
          <!-- Lender Section -->
          <div class="card-section">
            <div class="section-label">
              <User class="icon" />
              <span>{{ t('reservations.detail_dialog.lender') }}</span>
            </div>
            <p class="section-value lender-name">
              {{ lenderRealName || lenderNickname || t('reservations.detail_dialog.lender') }}
              <span
                v-if="lenderNickname && lenderRealName && lenderNickname !== lenderRealName"
                class="lender-sub"
              >
                ({{ lenderNickname }})
              </span>
            </p>
          </div>

          <div class="card-divider"></div>

          <!-- Address Section -->
          <div class="card-section">
            <div class="section-label">
              <MapPin class="icon" />
              <span>{{ t('reservations.detail_dialog.handover_address') }}</span>
            </div>
            <p class="section-value address-text">
              {{ fullHandoverAddress }}
            </p>
          </div>

          <!-- Maps Link Action Footer -->
          <div v-if="googleMapsUrl" class="maps-footer">
            <span class="maps-link-text">
              <MapPin class="mini-icon" />
              {{ t('reservations.detail_dialog.open_in_google_maps') }}
            </span>
            <span class="maps-arrow">↗</span>
          </div>
        </a>

        <!-- 2. Pending / Unaccepted State -->
        <div v-else class="combined-address-card is-pending">
          <div class="card-section">
            <div class="section-label">
              <User class="icon" />
              <span>{{ t('reservations.detail_dialog.lender') }}</span>
            </div>
            <p class="section-value">
              {{ lenderNickname || t('reservations.detail_dialog.lender') }}
              <small class="privacy-note">({{ t('reservations.detail_dialog.name_hidden_until_accepted') }})</small>
            </p>
          </div>

          <div class="card-divider"></div>

          <div class="card-section">
            <div class="section-label">
              <Lock class="icon" />
              <span>{{ t('reservations.detail_dialog.handover_address') }}</span>
            </div>
            <p class="section-value pending-address">
              {{ t('reservations.detail_dialog.address_hidden_until_accepted') }}
              <template v-if="product.postal_code || product.city">
                ({{ [product.postal_code, product.city].filter(Boolean).join(' ') }})
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Timeslot Coordination (Doodle-Style) -->
      <div
        v-if="reservation.status === 'requested' || reservation.status === 'accepted' || reservation.status === 'started'"
        class="timeslot-section"
        :class="{ 'pulse-highlight': highlightTime }"
      >
        <div v-if="highlightTime" class="highlight-callout">
          <span class="callout-icon">👇</span>
          <span class="callout-text">{{ t('reservations.detail_dialog.set_time_callout') }}</span>
        </div>
        <TimeslotCoordinator
          :reservation="reservation"
          :current-user-id="pb.authStore?.record?.id"
          :is-owner="false"
          :default-type="reservation.status === 'started' ? 'return' : 'pickup'"
          :highlight="highlightTime"
          @updated="onReservationUpdated"
        />
      </div>
    </div>

    <!-- Actions Footer -->
    <div v-if="reservation" class="dialog-actions-footer">
      <Alert v-if="cancelError" variant="danger" class="cancel-error-alert">{{ cancelError }}</Alert>
      <div class="actions-buttons-row">
        <Button
          v-if="canCancel"
          variant="secondary"
          size="md"
          :loading="isCancelling"
          @click="handleCancel"
          class="cancel-btn"
        >
          {{ t('reservations.detail_dialog.cancel_reservation') }}
        </Button>
        <div class="spacer"></div>
        <Button
          variant="primary"
          size="md"
          @click="open = false"
          class="ok-btn"
        >
          {{ t('common.ok') || 'OK' }}
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Lock, MapPin, User } from "@iconoir/vue";
import type { Location } from "@@/models/location";
import type { Product } from "@@/models/product";
import type { Reservation } from "@@/models/reservation";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Dialog from "@/components/core/Dialog.vue";
import Heading from "@/components/core/Heading.vue";
import TimeslotCoordinator from "@/components/modules/TimeslotCoordinator.vue";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { pb } = usePocketbase();

const { t } = useI18n();

const props = defineProps<{
  reservation?: Reservation;
  product?: Product;
  location?: Location;
  highlightTime?: boolean;
}>();

const emit = defineEmits<{ update: []; close: [] }>();

const open = ref<boolean>(false);
const isCancelling = ref(false);
const cancelError = ref("");

function onReservationUpdated(updated: Reservation) {
  emit("update");
}

const lender = computed(() => {
  return (
    props.reservation?.expand?.owner ||
    props.reservation?.expand?.product?.expand?.user ||
    props.product?.expand?.user
  );
});

const lenderRealName = computed(() => lender.value?.name || "");
const lenderNickname = computed(() => lender.value?.nickname || "");

const fullHandoverAddress = computed(() => {
  const street = (props.reservation?.handover_address || props.product?.pickup_address || "").trim();
  const postalCode = (props.product?.postal_code || "").trim();
  const city = (props.product?.city || "").trim();
  const zipCity = [postalCode, city].filter(Boolean).join(" ");

  if (!street) return zipCity;
  if (!zipCity) return street;

  // Prevent repeating zip/city if already contained in street
  if (street.toLowerCase().includes(zipCity.toLowerCase())) {
    return street;
  }
  if (
    postalCode &&
    street.toLowerCase().includes(postalCode.toLowerCase()) &&
    city &&
    street.toLowerCase().includes(city.toLowerCase())
  ) {
    return street;
  }
  return `${street}, ${zipCity}`;
});

const googleMapsUrl = computed(() => {
  if (!fullHandoverAddress.value) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullHandoverAddress.value)}`;
});

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
}

/* Combined Lender & Handover Address Card */
.combined-address-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease-in-out;
  overflow: hidden;

  &.is-accepted {
    background: #e7f5ff;
    border: 1px solid #a5d8ff;
    cursor: pointer;

    &:hover {
      background: #d0ebff;
      border-color: #74c0fc;
      box-shadow: 0 2px 8px rgba(25, 113, 194, 0.15);
      transform: translateY(-1px);

      .maps-footer {
        background: rgba(25, 113, 194, 0.12);
        color: #1864ab;
      }
    }
  }

  &.is-pending {
    background: #f8f9fa;
    border: 1px dashed var(--color-gray-300, #ced4da);
    cursor: default;
  }

  .card-section {
    padding: 0.75rem 0.9rem;
  }

  .card-divider {
    height: 1px;
    background: #d0ebff;
    margin: 0;

    .is-pending & {
      background: #e9ecef;
    }
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: #1971c2;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 0.2rem;

    .is-pending & {
      color: var(--color-gray-600, #6c757d);
    }

    .icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
  }

  .section-value {
    margin: 0;
    font-size: 0.95rem;
    color: #1864ab;
    font-weight: 500;

    .is-pending & {
      color: var(--color-gray-700, #495057);
      font-size: 0.88rem;
      font-weight: normal;
    }

    &.lender-name {
      font-weight: 600;
    }

    &.address-text {
      font-weight: 500;
      color: #1864ab;
    }

    .lender-sub {
      color: #4dabf7;
      font-weight: normal;
      margin-left: 0.25rem;
    }

    .privacy-note {
      color: #868e96;
      font-size: 0.8rem;
      margin-left: 0.25rem;
    }
  }

  .maps-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 0.9rem;
    background: rgba(25, 113, 194, 0.06);
    border-top: 1px solid rgba(25, 113, 194, 0.12);
    font-size: 0.78rem;
    font-weight: 600;
    color: #1971c2;
    transition: background 0.15s ease;

    .maps-link-text {
      display: flex;
      align-items: center;
      gap: 0.35rem;

      .mini-icon {
        width: 0.9rem;
        height: 0.9rem;
      }
    }

    .maps-arrow {
      font-size: 0.95rem;
      font-weight: bold;
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

.dialog-actions-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200, #e9ecef);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .cancel-error-alert {
    margin: 0;
  }

  .actions-buttons-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;

    .spacer {
      flex: 1;
    }

    .cancel-btn {
      color: #c92a2a;
      border-color: #ffc9c9;
      background: #fff5f5;

      &:hover {
        background: #ffe3e3;
        border-color: #ffa8a8;
      }
    }

    .ok-btn {
      min-width: 110px;
      justify-content: center;
    }
  }
}

.timeslot-section {
  position: relative;
  transition: all 0.3s ease;

  &.pulse-highlight {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: #f4fbf6;
    border: 2px solid #2b8a3e;
    border-radius: 12px;
    animation: timeslot-pulse 1.8s infinite ease-in-out;
  }
}

.highlight-callout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2b8a3e, #237032);
  color: #ffffff;
  padding: 0.65rem 0.95rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.65rem;
  box-shadow: 0 2px 8px rgba(43, 138, 62, 0.25);

  .callout-icon {
    font-size: 1.15rem;
    display: inline-block;
    animation: point-down 0.8s infinite alternate ease-in-out;
  }
  .callout-text {
    line-height: 1.3;
  }
}

@keyframes timeslot-pulse {
  0% {
    border-color: #2b8a3e;
    box-shadow: 0 0 0 0 rgba(43, 138, 62, 0.7), 0 2px 8px rgba(43, 138, 62, 0.15);
  }
  50% {
    border-color: #40c057;
    box-shadow: 0 0 0 10px rgba(43, 138, 62, 0), 0 4px 16px rgba(43, 138, 62, 0.25);
  }
  100% {
    border-color: #2b8a3e;
    box-shadow: 0 0 0 0 rgba(43, 138, 62, 0), 0 2px 8px rgba(43, 138, 62, 0.15);
  }
}

@keyframes point-down {
  0% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(3px);
  }
}
</style>
