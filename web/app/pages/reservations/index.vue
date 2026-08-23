<template>
  <Container width="lg" centered class="page-container">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else class="content-wrapper">
      <Alert v-if="actionError" variant="danger">{{ actionError }}</Alert>

      <!-- Header -->
      <section class="header-section lb-stack">
        <Heading is="h1" size="xl">{{ t('reservations.index.reservations') }}</Heading>
        <p class="intro">
          {{ t('reservations.index.intro') }}
        </p>
      </section>

      <!-- Empty State (No reservations at all) -->
      <Card v-if="reservations.length === 0" class="empty-state">
        <Package class="empty-icon" />
        <Heading is="h2" size="md">{{ t('reservations.index.no_active_reservations') }}</Heading>
        <p>{{ t('reservations.index.intro') }}</p>
        <Button variant="primary" to="/">{{ t('home.browse_items_title') }}</Button>
      </Card>

      <div v-else class="reservations-container">
        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'active' }"
            @click="currentTab = 'active'"
          >
            <span>{{ t('reservations.index.tab_active') }}</span>
            <span v-if="activeReservations.length > 0" class="tab-badge">{{ activeReservations.length }}</span>
          </button>
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'cancelled' }"
            @click="currentTab = 'cancelled'"
          >
            <span>{{ t('reservations.index.tab_cancelled') }}</span>
            <span v-if="cancelledReservations.length > 0" class="tab-badge">{{ cancelledReservations.length }}</span>
          </button>
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'done' }"
            @click="currentTab = 'done'"
          >
            <span>{{ t('reservations.index.tab_done') }}</span>
            <span v-if="doneReservations.length > 0" class="tab-badge">{{ doneReservations.length }}</span>
          </button>
        </div>

        <!-- Reservations List -->
        <div v-if="filteredReservations.length > 0" class="reservations-list lb-stack">
          <Card
            v-for="res in filteredReservations"
            :id="`reservation-${res.id}`"
            :key="res.id"
            class="reservation-card"
            :class="`status-${res.status || 'requested'}`"
          >
            <div class="card-main">
              <!-- Product Thumbnail -->
              <div class="product-thumb">
                <ProductImage
                  :src="getProductImageUrl(res.expand?.product?.id, res.expand?.product?.images?.[0], thumbs.sm)"
                  fallback="/images/fallback-product-image-600x600.png"
                  aspect-ratio="1:1"
                />
              </div>

              <!-- Details -->
              <div class="reservation-details">
                <div class="top-row">
                  <Heading is="h3" size="sm" class="item-name">
                    <NuxtLink :to="`/items/${res.expand?.product?.id}`">
                      {{ res.expand?.product?.name || t('reservations.index.unnamed_item') }}
                    </NuxtLink>
                  </Heading>
                  <span class="status-badge" :class="`badge-${res.status || 'requested'}`">
                    {{ t(`reservations.detail_dialog.status_${res.status || 'requested'}`) }}
                  </span>
                </div>

                <!-- Lender Details & Dates -->
                <div class="lender-section">
                  <!-- Lender Identity -->
                  <div class="lender-identity">
                    <User class="meta-icon" />
                    <span class="lender-name">
                      <strong>
                        {{
                          res.status === 'requested'
                            ? (res.expand?.owner?.nickname || t('reservations.index.lender'))
                            : (res.expand?.owner?.name || res.expand?.owner?.nickname || t('reservations.index.lender'))
                        }}
                      </strong>
                      <span
                        v-if="res.status !== 'requested' && res.expand?.owner?.nickname && res.expand?.owner?.name && res.expand?.owner?.nickname !== res.expand?.owner?.name"
                        class="lender-sub"
                      >
                        ({{ res.expand?.owner?.nickname }})
                      </span>
                    </span>
                  </div>

                  <!-- Handover Address -->
                  <a
                    v-if="getReservationHandoverAddress(res)"
                    :href="getGoogleMapsUrl(getReservationHandoverAddress(res))"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="lender-address address-link"
                  >
                    <MapPin class="meta-icon" />
                    <span>{{ getReservationHandoverAddress(res) }}</span>
                    <span class="maps-arrow">↗</span>
                  </a>
                  <div v-else class="lender-address address-muted">
                    <MapPin class="meta-icon" />
                    <span><i>{{ t('reservations.index.address_hidden_until_accepted') }}</i></span>
                  </div>

                  <!-- Dates -->
                  <div class="dates-info">
                    <Calendar class="meta-icon" />
                    <span>{{ formatDate(res.start) }} – {{ formatDate(res.end) }}</span>
                  </div>

                  <!-- Deposit -->
                  <div v-if="res.expand?.product?.deposit" class="deposit-info">
                    <strong>{{ t('reservations.index.deposit') }}:</strong>
                    <span>{{ res.expand?.product?.deposit }} €</span>
                  </div>
                </div>

                <!-- Message sent with request -->
                <div v-if="res.message" class="borrower-message">
                  <MessageText class="msg-icon" />
                  <p>“{{ res.message }}”</p>
                </div>

                <!-- Timeslot Coordination (Doodle-Style) -->
                <div
                  v-if="res.status === 'requested' || res.status === 'accepted' || res.status === 'started'"
                  class="timeslot-wrapper"
                >
                  <TimeslotCoordinator
                    :reservation="res"
                    :current-user-id="pb.authStore.record?.id"
                    :is-owner="false"
                    :highlight="highlightTime && targetHighlightId === res.id"
                    :default-type="res.status === 'started' ? 'return' : 'pickup'"
                    @updated="handleReservationUpdated"
                  />
                </div>
              </div>
            </div>

            <!-- Actions Bar -->
            <div class="card-footer">
              <!-- If Pending -->
              <template v-if="res.status === 'requested'">
                <Button
                  v-if="hasBorrowerProposals(res)"
                  variant="primary"
                  size="sm"
                  :loading="sendingTimeslotsId === res.id"
                  @click="sendBorrowerProposals(res)"
                >
                  <Mail class="btn-icon" />
                  {{ t('reservations.index.send_proposals_to_lender') }}
                </Button>
                <span v-else class="pending-hint">
                  <Clock class="hint-icon" />
                  {{ t('reservations.index.waiting_for_approval') }}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  :loading="cancellingId === res.id"
                  @click="cancelReservation(res)"
                >
                  <Xmark class="btn-icon" />
                  {{ t('reservations.index.cancel_request') }}
                </Button>
              </template>

              <!-- If Accepted -->
              <template v-else-if="res.status === 'accepted'">
                <Button
                  v-if="hasBorrowerProposals(res) && !res.timeslots?.pickup?.confirmedSlot"
                  variant="primary"
                  size="sm"
                  :loading="sendingTimeslotsId === res.id"
                  @click="sendBorrowerProposals(res)"
                >
                  <Mail class="btn-icon" />
                  {{ t('reservations.index.send_proposals_to_lender') }}
                </Button>
                <span v-else class="accepted-hint">
                  <Check class="hint-icon" />
                  {{ t('reservations.index.accepted_ready') }}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  :loading="cancellingId === res.id"
                  @click="cancelReservation(res)"
                >
                  <Xmark class="btn-icon" />
                  {{ t('reservations.index.cancel_request') }}
                </Button>
              </template>

              <!-- If Active / Started -->
              <template v-else-if="res.status === 'started'">
                <span class="active-hint">
                  <Clock class="hint-icon" />
                  {{ t('reservations.index.currently_borrowed') }}
                </span>
              </template>

              <!-- If Ended / Completed -->
              <template v-else-if="res.status === 'ended'">
                <span class="completed-hint">
                  {{ t('reservations.index.completed') }}
                </span>
              </template>

              <!-- If Cancelled / Declined -->
              <template v-else-if="res.status === 'cancelled' || res.status === 'declined'">
                <span class="cancelled-hint">
                  {{ t('reservations.index.cancelled') }}
                </span>
              </template>
            </div>

            <Alert v-if="successMessage[res.id]" variant="success" class="mt-2">
              {{ successMessage[res.id] }}
            </Alert>
          </Card>
        </div>

        <!-- Tab Empty Message -->
        <Card v-else class="tab-empty-state">
          <p v-if="currentTab === 'active'">
            <i>{{ t('reservations.index.no_active_reservations') }}</i>
          </p>
          <p v-else-if="currentTab === 'cancelled'">
            <i>{{ t('reservations.index.no_cancelled_reservations') }}</i>
          </p>
          <p v-else>
            <i>{{ t('reservations.index.no_done_reservations') }}</i>
          </p>
        </Card>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { Calendar, Check, Clock, Mail, MapPin, MessageText, Package, User, Xmark } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ProductImage from "@/components/ProductImage.vue";
import TimeslotCoordinator from "@/components/modules/TimeslotCoordinator.vue";
import type { Reservation } from "~~/models/reservation";

const { t, locale } = useI18n();
const { pb, isValid } = usePocketbase();
const {
  product: { thumbs },
} = useAppConfig();

const route = useRoute();
const router = useRouter();

if (!isValid.value) {
  navigateTo("/login?redirect=/reservations");
}

const isLoading = ref(true);
const cancellingId = ref<string | null>(null);
const actionError = ref("");
const reservations = ref<Reservation[]>([]);
const currentTab = ref<"active" | "cancelled" | "done">("active");

const targetHighlightId = ref<string | null>(null);
const highlightTime = ref(false);

function getReservationTab(r: Reservation): "active" | "cancelled" | "done" {
  if (r.status === "ended") return "done";
  if (r.status === "cancelled" || r.status === "declined") return "cancelled";
  if (r.status === "requested" || r.status === "accepted" || r.status === "started") return "active";
  if (r.ended) return "done";
  if (r.cancelled) return "cancelled";
  return "active";
}

const activeReservations = computed(() =>
  reservations.value.filter((r) => getReservationTab(r) === "active")
);

const cancelledReservations = computed(() =>
  reservations.value.filter((r) => getReservationTab(r) === "cancelled")
);

const doneReservations = computed(() =>
  reservations.value.filter((r) => getReservationTab(r) === "done")
);

const filteredReservations = computed(() => {
  if (currentTab.value === "cancelled") return cancelledReservations.value;
  if (currentTab.value === "done") return doneReservations.value;
  return activeReservations.value;
});

function handleReservationUpdated(updated: Reservation) {
  const idx = reservations.value.findIndex((r) => r.id === updated.id);
  if (idx !== -1) {
    reservations.value[idx] = {
      ...reservations.value[idx],
      ...updated,
      expand: reservations.value[idx].expand || updated.expand,
    };
  }
}

async function loadReservations() {
  try {
    isLoading.value = true;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    reservations.value = await pb.collection("reservations").getFullList<Reservation>({
      filter: `user = '${userId}'`,
      expand: "product,owner",
      sort: "-start",
      requestKey: null,
    });
  } catch (err) {
    console.error("Failed to load user reservations:", err);
  } finally {
    isLoading.value = false;
  }
}

async function cancelReservation(res: Reservation) {
  if (!confirm(t("reservations.index.confirm_cancel"))) {
    return;
  }
  try {
    cancellingId.value = res.id;
    actionError.value = "";
    const updated = await pb.collection("reservations").update<Reservation>(
      res.id,
      {
        status: "cancelled",
        cancelled: true,
      },
      { expand: "product,owner" }
    );
    handleReservationUpdated(updated);
  } catch (err: any) {
    console.error("Failed to cancel reservation:", err);
    actionError.value = err?.message || "Fehler beim Stornieren der Anfrage";
  } finally {
    cancellingId.value = null;
  }
}

const sendingTimeslotsId = ref<string | null>(null);
const successMessage = ref<{ [key: string]: string }>({});

function getBorrowerProposals(res: Reservation) {
  const ts = res.timeslots || {};
  const currentUid = pb.authStore.record?.id;
  const pickup = (ts.pickup?.proposals || []).filter((s) => s.proposedBy === currentUid || s.proposedBy === res.user);
  const ret = (ts.return?.proposals || []).filter((s) => s.proposedBy === currentUid || s.proposedBy === res.user);
  return { pickup, return: ret, total: pickup.length + ret.length };
}

function hasBorrowerProposals(res: Reservation): boolean {
  return getBorrowerProposals(res).total > 0;
}

async function sendBorrowerProposals(res: Reservation) {
  try {
    sendingTimeslotsId.value = res.id;
    actionError.value = "";

    const ts = res.timeslots || {};
    const currentUid = pb.authStore.record?.id;
    const pickupProposals = (ts.pickup?.proposals || []).filter((s) => s.proposedBy === currentUid || s.proposedBy === res.user);
    const returnProposals = (ts.return?.proposals || []).filter((s) => s.proposedBy === currentUid || s.proposedBy === res.user);

    let sent = false;

    if (pickupProposals.length > 0 && !ts.pickup?.confirmedSlot) {
      await pb.send("/api/leihbase/send-timeslot-proposals", {
        method: "POST",
        body: { reservationId: res.id, type: "pickup" },
      });
      sent = true;
    }

    if (returnProposals.length > 0 && !ts.return?.confirmedSlot) {
      await pb.send("/api/leihbase/send-timeslot-proposals", {
        method: "POST",
        body: { reservationId: res.id, type: "return" },
      });
      sent = true;
    }

    if (!sent && (pickupProposals.length > 0 || returnProposals.length > 0)) {
      await pb.send("/api/leihbase/send-timeslot-proposals", {
        method: "POST",
        body: { reservationId: res.id, type: pickupProposals.length > 0 ? "pickup" : "return" },
      });
    }

    const updated = await pb.collection("reservations").getOne<Reservation>(res.id, {
      expand: "user,owner,product",
    });
    handleReservationUpdated(updated);

    successMessage.value[res.id] = t("reservations.index.proposals_sent_success");
    setTimeout(() => {
      delete successMessage.value[res.id];
    }, 5000);
  } catch (err: any) {
    console.error("Failed to send borrower timeslots:", err);
    actionError.value = err?.message || "Fehler beim Senden der Terminvorschläge.";
  } finally {
    sendingTimeslotsId.value = null;
  }
}

function getReservationHandoverAddress(res: Reservation): string {
  if (res.handover_address) {
    return res.handover_address;
  }
  const prod = res.expand?.product;
  if (prod) {
    if (res.status !== "requested") {
      const parts = [];
      if (prod.pickup_address) parts.push(prod.pickup_address);
      const cityZip = [prod.pickup_postal_code, prod.pickup_city].filter(Boolean).join(" ");
      if (cityZip) parts.push(cityZip);
      if (parts.length > 0) return parts.join(", ");
    } else {
      const cityZip = [prod.pickup_postal_code, prod.pickup_city].filter(Boolean).join(" ");
      if (cityZip) return cityZip;
    }
  }
  const owner = res.expand?.owner;
  if (owner && res.status !== "requested") {
    const parts = [
      owner.address,
      [owner.postal_code, owner.city].filter(Boolean).join(" "),
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return "";
}

function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function formatDate(dateInput: string | Date) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleDateString(locale.value === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function checkAutoOpen() {
  const targetId = route.query.open as string;
  if (!targetId) return;

  targetHighlightId.value = targetId;
  if (route.query.highlightTime === "true" || route.query.highlightTime === "1") {
    highlightTime.value = true;
  }

  const found = reservations.value.find((r) => r.id === targetId);
  if (found) {
    currentTab.value = getReservationTab(found);

    nextTick(() => {
      const el = document.getElementById(`reservation-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}

onMounted(async () => {
  await loadReservations();
  if (route.query.open) {
    checkAutoOpen();
  }
});

watch(
  () => route.query.open,
  (newOpen) => {
    if (newOpen) {
      checkAutoOpen();
    }
  }
);

useHead({
  title: t("reservations.index.reservations"),
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

.page-container {
  padding-block: var(--fluid-spacing-8);
}

.header-section {
  margin-bottom: var(--fluid-spacing-8);
  .intro {
    color: var(--color-gray-600);
    margin-top: 0.25rem;
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    color: var(--color-gray-400);
  }
  p {
    color: var(--color-gray-600);
    max-width: 400px;
  }
}

.tabs-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-6, 1.5rem);
  border-bottom: 2px solid var(--color-gray-200, #e9ecef);
  padding-bottom: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.15rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-gray-600, #6c757d);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: var(--text-color, #212529);
      background-color: var(--color-gray-100, #f8f9fa);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    &.active {
      color: var(--color-primary-600, #2b8a3e);
      font-weight: 600;
      border-bottom-color: var(--color-primary-600, #2b8a3e);
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      background: var(--color-gray-200, #e9ecef);
      color: var(--color-gray-700, #495057);
      min-width: 1.3rem;
      line-height: 1;
      transition: all 0.2s ease;
    }

    &.active .tab-badge {
      background: #d3f9d8;
      color: #2b8a3e;
    }
  }
}

.tab-empty-state {
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: var(--color-gray-600);
  font-size: 0.95rem;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reservation-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 4px solid var(--color-gray-300);

  &.status-requested {
    border-left-color: #f59f00;
  }
  &.status-accepted {
    border-left-color: #2b8a3e;
  }
  &.status-started {
    border-left-color: #1c7ed6;
  }
}

.card-main {
  display: flex;
  gap: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.product-thumb {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.4rem;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    .item-name {
      margin: 0;
      a {
        color: inherit;
        text-decoration: none;
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }

  .lender-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--color-gray-800);
    background: var(--color-gray-50, #f8f9fa);
    padding: 0.65rem 0.85rem;
    border-radius: var(--border-radius);
    margin-top: 0.35rem;

    .lender-identity,
    .lender-address,
    .dates-info,
    .deposit-info {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      line-height: 1.4;

      .meta-icon {
        width: 1.05rem;
        height: 1.05rem;
        color: var(--primary-color, #2b8a3e);
        flex-shrink: 0;
      }
    }

    .lender-sub {
      color: var(--color-gray-600);
      font-weight: normal;
      margin-left: 0.25rem;
    }

    .lender-address {
      color: var(--color-gray-700);
      font-size: 0.875rem;

      &.address-link {
        text-decoration: none;
        color: #1971c2;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        transition: color 0.15s ease;

        .meta-icon {
          color: #1971c2;
        }

        .maps-arrow {
          font-size: 0.85rem;
          font-weight: bold;
          opacity: 0.7;
        }

        &:hover {
          color: #1864ab;
          text-decoration: underline;

          .maps-arrow {
            opacity: 1;
          }
        }
      }

      &.address-muted {
        color: var(--color-gray-500);
        .meta-icon {
          color: var(--color-gray-400);
        }
      }
    }

    .dates-info {
      color: var(--color-gray-700);
      font-size: 0.875rem;
    }

    .deposit-info {
      color: var(--color-gray-700);
      font-size: 0.875rem;
    }
  }

  .borrower-message {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    background: var(--color-gray-50, #f8f9fa);
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    color: var(--color-gray-700);

    .msg-icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      margin-top: 0.15rem;
      color: var(--color-gray-400);
    }
    p {
      margin: 0;
      font-style: italic;
    }
  }

  .timeslot-wrapper {
    margin-top: 0.75rem;
    width: 100%;
  }
}

.status-badge {
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
  &.badge-declined,
  &.badge-cancelled {
    background: #ffe3e3;
    color: #c92a2a;
  }
}

.card-footer {
  border-top: 1px solid var(--color-gray-200);
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  .btn-icon {
    width: 1rem;
    height: 1rem;
  }

  .pending-hint {
    font-size: 0.85rem;
    color: #d9480f;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-right: auto;
    .hint-icon {
      width: 1rem;
      height: 1rem;
    }
  }

  .accepted-hint {
    font-size: 0.85rem;
    color: #2b8a3e;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-right: auto;
    .hint-icon {
      width: 1rem;
      height: 1rem;
    }
  }

  .active-hint {
    font-size: 0.85rem;
    color: #1971c2;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-right: auto;
    .hint-icon {
      width: 1rem;
      height: 1rem;
    }
  }

  .completed-hint {
    font-size: 0.85rem;
    color: var(--color-gray-600);
  }

  .cancelled-hint {
    font-size: 0.85rem;
    color: #c92a2a;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
</style>
