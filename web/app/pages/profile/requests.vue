<template>
  <Container width="lg" centered class="page-container">
    <div class="header-section">
      <Heading is="h1" size="xl">{{ t('profile.requests.incoming_requests_title') }}</Heading>
      <p class="subtitle">{{ t('profile.requests.incoming_requests_subtitle') }}</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else class="content-wrapper">
      <Alert v-if="actionError" variant="danger">{{ actionError }}</Alert>

      <!-- Empty State (No requests at all) -->
      <Card v-if="requests.length === 0" class="empty-state">
        <Package class="empty-icon" />
        <Heading is="h2" size="md">{{ t('profile.requests.no_requests') }}</Heading>
        <p>{{ t('profile.requests.no_requests_desc') }}</p>
        <Button variant="primary" to="/items/new">{{ t('profile.requests.list_more_items') }}</Button>
      </Card>

      <div v-else class="requests-container">
        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'active' }"
            @click="currentTab = 'active'"
          >
            <span>{{ t('profile.requests.tab_active') }}</span>
            <span v-if="activeRequests.length > 0" class="tab-badge">{{ activeRequests.length }}</span>
          </button>
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'cancelled' }"
            @click="currentTab = 'cancelled'"
          >
            <span>{{ t('profile.requests.tab_cancelled') }}</span>
            <span v-if="cancelledRequests.length > 0" class="tab-badge">{{ cancelledRequests.length }}</span>
          </button>
          <button
            type="button"
            class="tab-nav-btn"
            :class="{ active: currentTab === 'done' }"
            @click="currentTab = 'done'"
          >
            <span>{{ t('profile.requests.tab_done') }}</span>
            <span v-if="doneRequests.length > 0" class="tab-badge">{{ doneRequests.length }}</span>
          </button>
        </div>

        <!-- Requests List -->
        <div v-if="filteredRequests.length > 0" class="requests-list lb-stack">
          <Card
            v-for="req in filteredRequests"
            :key="req.id"
            class="request-card"
            :class="`status-${req.status || 'requested'}`"
          >
          <div class="card-main">
            <!-- Product Thumbnail -->
            <div class="product-thumb">
              <ProductImage
                :src="getProductImageUrl(req.expand?.product?.id, req.expand?.product?.images?.[0], thumbs.sm)"
                fallback="/images/fallback-product-image-600x600.png"
                aspect-ratio="1:1"
              />
            </div>

            <!-- Details -->
            <div class="request-details">
              <div class="top-row">
                <Heading is="h3" size="sm" class="item-name">
                  <NuxtLink :to="`/items/${req.expand?.product?.id}`">
                    {{ req.expand?.product?.name || t('profile.requests.unnamed_item') }}
                  </NuxtLink>
                </Heading>
                <span class="status-badge" :class="`badge-${req.status || 'requested'}`">
                  {{ t(`profile.requests.status_${req.status || 'requested'}`) }}
                </span>
              </div>

              <!-- Borrower Details & Dates -->
              <div class="borrower-section">
                <div class="borrower-identity">
                  <User class="meta-icon" />
                  <span class="borrower-name">
                    <strong>{{ req.expand?.user?.name || req.expand?.user?.nickname || t('profile.requests.borrower') }}</strong>
                    <span
                      v-if="req.expand?.user?.nickname && req.expand?.user?.name && req.expand?.user?.nickname !== req.expand?.user?.name"
                      class="borrower-sub"
                    >
                      ({{ req.expand?.user?.nickname }})
                    </span>
                  </span>
                </div>

                <a
                  v-if="formatUserAddress(req.expand?.user)"
                  :href="getGoogleMapsUrl(formatUserAddress(req.expand?.user))"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="borrower-address address-link"
                >
                  <MapPin class="meta-icon" />
                  <span>{{ formatUserAddress(req.expand?.user) }}</span>
                  <span class="maps-arrow">↗</span>
                </a>

                <div class="dates-info">
                  <Calendar class="meta-icon" />
                  <span>{{ formatDate(req.start) }} – {{ formatDate(req.end) }}</span>
                </div>
              </div>

              <!-- Message from Borrower -->
              <div v-if="req.message" class="borrower-message">
                <MessageText class="msg-icon" />
                <p>“{{ req.message }}”</p>
              </div>

              <!-- Timeslot Coordination (Doodle-Style) -->
              <div
                v-if="req.status === 'requested' || req.status === 'accepted' || req.status === 'started'"
                class="timeslot-wrapper"
              >
                <TimeslotCoordinator
                  :reservation="req"
                  :current-user-id="pb.authStore.record?.id"
                  :is-owner="true"
                  :default-type="req.status === 'started' ? 'return' : 'pickup'"
                  @updated="handleReservationUpdated"
                />
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="card-footer">
            <!-- If Pending -->
            <template v-if="req.status === 'requested'">
              <Button
                variant="primary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'accepted')"
              >
                <Check class="btn-icon" />
                {{ t('profile.requests.accept_request') }}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'declined')"
              >
                <Xmark class="btn-icon" />
                {{ t('profile.requests.decline') }}
              </Button>
              <span v-if="hasSuggestedTimeslots(req)" class="timeslot-auto-accept-hint">
                <InfoCircle class="hint-icon" />
                {{ t('profile.requests.timeslot_auto_accepted_hint') }}
              </span>
            </template>

            <!-- If Accepted / Handover pending -->
            <template v-else-if="req.status === 'accepted'">
              <span class="accepted-hint">
                <Check class="hint-icon" />
                {{ t('profile.requests.accepted_address_shared') }}
              </span>
              <Button
                variant="primary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'started')"
              >
                {{ t('profile.requests.confirm_handover') }}
              </Button>
            </template>

            <!-- If Active / Started -->
            <template v-else-if="req.status === 'started'">
              <span class="active-hint">
                <Clock class="hint-icon" />
                {{ t('profile.requests.currently_borrowed') }}
              </span>
              <Button
                variant="secondary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'ended')"
              >
                {{ t('profile.requests.confirm_returned') }}
              </Button>
            </template>

            <!-- If Ended / Completed -->
            <template v-else-if="req.status === 'ended'">
              <span class="completed-hint">
                {{ t('profile.requests.completed_returned') }}
              </span>
            </template>
          </div>
        </Card>
      </div>

      <!-- Tab Empty Message -->
      <Card v-else class="tab-empty-state">
        <p v-if="currentTab === 'active'">
          <i>{{ t('profile.requests.no_active_requests') }}</i>
        </p>
        <p v-else-if="currentTab === 'cancelled'">
          <i>{{ t('profile.requests.no_cancelled_requests') }}</i>
        </p>
        <p v-else>
          <i>{{ t('profile.requests.no_done_requests') }}</i>
        </p>
      </Card>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Calendar, Check, Clock, InfoCircle, MapPin, MessageText, Package, User, Xmark } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ProductImage from "@/components/ProductImage.vue";
import TimeslotCoordinator from "@/components/modules/TimeslotCoordinator.vue";
import type { Reservation } from "~~/models/reservation";

const { t } = useI18n();
const { pb, isValid } = usePocketbase();
const { fetchPendingCount } = usePendingRequests();
const {
  product: { thumbs },
} = useAppConfig();

if (!isValid.value) {
  navigateTo("/login?redirect=/profile/requests");
}

const isLoading = ref(true);
const processingId = ref<string | null>(null);
const actionError = ref("");
const requests = ref<Reservation[]>([]);
const currentTab = ref<"active" | "cancelled" | "done">("active");

function getReservationTab(r: Reservation): "active" | "cancelled" | "done" {
  if (r.status === "ended") return "done";
  if (r.status === "cancelled" || r.status === "declined") return "cancelled";
  if (r.status === "requested" || r.status === "accepted" || r.status === "started") return "active";
  if (r.ended) return "done";
  if (r.cancelled) return "cancelled";
  return "active";
}

const activeRequests = computed(() =>
  requests.value.filter((r) => getReservationTab(r) === "active")
);

const cancelledRequests = computed(() =>
  requests.value.filter((r) => getReservationTab(r) === "cancelled")
);

const doneRequests = computed(() =>
  requests.value.filter((r) => getReservationTab(r) === "done")
);

const filteredRequests = computed(() => {
  if (currentTab.value === "cancelled") return cancelledRequests.value;
  if (currentTab.value === "done") return doneRequests.value;
  return activeRequests.value;
});

function hasSuggestedTimeslots(req: Reservation): boolean {
  if (!req?.timeslots || typeof req.timeslots !== "object") return false;
  const pickup = req.timeslots.pickup;
  const returnSlot = req.timeslots.return;

  const hasPickup = Array.isArray(pickup?.proposals) && pickup.proposals.length > 0 && !pickup.confirmedSlot?.id;
  const hasReturn = Array.isArray(returnSlot?.proposals) && returnSlot.proposals.length > 0 && !returnSlot.confirmedSlot?.id;

  return hasPickup || hasReturn;
}

function handleReservationUpdated(updated: Reservation) {
  const idx = requests.value.findIndex((r) => r.id === updated.id);
  if (idx !== -1) {
    requests.value[idx] = {
      ...requests.value[idx],
      ...updated,
      expand: requests.value[idx].expand || updated.expand,
    };
  }
}

async function loadRequests() {
  try {
    isLoading.value = true;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    requests.value = await pb.collection("reservations").getFullList<Reservation>({
      filter: `owner = '${userId}'`,
      expand: "product,user",
      sort: "-created",
      requestKey: null,
    });
    fetchPendingCount();
  } catch (err) {
    console.error("Failed to load incoming requests:", err);
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(req: Reservation, newStatus: string) {
  try {
    processingId.value = req.id;
    actionError.value = "";

    const payload: any = { status: newStatus };
    if (newStatus === "started") payload.started = true;
    if (newStatus === "ended") payload.ended = true;
    if (newStatus === "declined" || newStatus === "cancelled") payload.cancelled = true;

    if (newStatus === "accepted") {
      if (req.timeslots && typeof req.timeslots === "object") {
        const updatedSlots: any = JSON.parse(JSON.stringify(req.timeslots));
        let hasChanges = false;
        for (const type of ["pickup", "return"] as const) {
          const group = updatedSlots[type];
          if (
            group &&
            (!group.confirmedSlot || !group.confirmedSlot.id) &&
            Array.isArray(group.proposals) &&
            group.proposals.length > 0
          ) {
            const slotToConfirm = group.proposals[group.proposals.length - 1];
            group.confirmedSlot = slotToConfirm;
            hasChanges = true;
            if (type === "pickup" && slotToConfirm.date) {
              payload.start = `${slotToConfirm.date} 00:00:00.000Z`;
            } else if (type === "return" && slotToConfirm.date) {
              payload.end = `${slotToConfirm.date} 23:59:59.999Z`;
            }
          }
        }
        if (hasChanges) {
          payload.timeslots = updatedSlots;
        }
      }
    }

    const updated = await pb.collection("reservations").update<Reservation>(
      req.id,
      payload,
      { expand: "product,user" }
    );

    // Update in-memory record
    const idx = requests.value.findIndex((r) => r.id === req.id);
    if (idx !== -1) {
      requests.value[idx] = updated;
    }
    fetchPendingCount();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update reservation status.";
  } finally {
    processingId.value = null;
  }
}

function formatUserAddress(user?: any) {
  if (!user) return "";
  const street = user.address?.trim() || "";
  const cityPart = [user.postal_code?.trim(), user.city?.trim()].filter(Boolean).join(" ");
  return [street, cityPart].filter(Boolean).join(", ");
}

function getGoogleMapsUrl(address?: string) {
  if (!address) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function formatDate(dateInput: string | Date) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(() => {
  loadRequests();
});

useHead({
  title: t("profile.requests.incoming_requests_title"),
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

.page-container {
  padding-block: var(--fluid-spacing-8);
}

.header-section {
  margin-bottom: var(--fluid-spacing-8);
  .subtitle {
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

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
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

.request-details {
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

  .borrower-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--color-gray-800);
    background: var(--color-gray-50, #f8f9fa);
    padding: 0.65rem 0.85rem;
    border-radius: var(--border-radius);
    margin-top: 0.35rem;

    .borrower-identity,
    .borrower-address,
    .dates-info {
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

    .borrower-nickname {
      color: var(--color-gray-600);
      font-weight: normal;
      margin-left: 0.25rem;
    }

    .borrower-address {
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
    }

    .dates-info {
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

  .timeslot-auto-accept-hint {
    font-size: 0.8125rem;
    color: var(--color-gray-600, #495057);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--color-gray-100, #f1f3f5);
    border: 1px solid var(--color-gray-200, #e9ecef);
    padding: 0.35rem 0.65rem;
    border-radius: var(--border-radius, 6px);
    margin-left: 0.25rem;

    .hint-icon {
      width: 0.95rem;
      height: 0.95rem;
      color: var(--primary-color, #2b8a3e);
      flex-shrink: 0;
    }
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
</style>
