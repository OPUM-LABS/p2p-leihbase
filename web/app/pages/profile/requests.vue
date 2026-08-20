<template>
  <Container width="lg" class="page-container">
    <div class="header-section">
      <Heading is="h1" size="xl">{{ t("incoming_requests_title") }}</Heading>
      <p class="subtitle">{{ t("incoming_requests_subtitle") }}</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else class="content-wrapper">
      <Alert v-if="actionError" variant="danger">{{ actionError }}</Alert>

      <!-- Empty State -->
      <Card v-if="requests.length === 0" class="empty-state">
        <Inbox class="empty-icon" />
        <Heading is="h2" size="md">{{ t("no_requests") }}</Heading>
        <p>{{ t("no_requests_desc") }}</p>
        <Button variant="primary" to="/items/new">{{ t("list_more_items") }}</Button>
      </Card>

      <!-- Requests List -->
      <div v-else class="requests-list lb-stack">
        <Card
          v-for="req in requests"
          :key="req.id"
          class="request-card"
          :class="`status-${req.status || 'requested'}`"
        >
          <div class="card-main">
            <!-- Product Thumbnail -->
            <div class="product-thumb">
              <ProductImage
                :src="
                  req.expand?.product?.images && req.expand.product.images.length > 0
                    ? `${config.public.pocketbase.clientBaseUrl}/api/files/products/${req.expand.product.id}/${req.expand.product.images[0]}${thumbs.sm}`
                    : null
                "
                fallback="/images/fallback-product-image-600x600.png"
                aspect-ratio="1:1"
              />
            </div>

            <!-- Details -->
            <div class="request-details">
              <div class="top-row">
                <Heading is="h3" size="sm" class="item-name">
                  <NuxtLink :to="`/items/${req.expand?.product?.id}`">
                    {{ req.expand?.product?.name || t("unnamed_item") }}
                  </NuxtLink>
                </Heading>
                <span class="status-badge" :class="`badge-${req.status || 'requested'}`">
                  {{ t(`status_${req.status || 'requested'}`) }}
                </span>
              </div>

              <!-- Borrower & Dates -->
              <div class="meta-row">
                <span class="borrower-info">
                  <User class="meta-icon" />
                  <strong>{{ req.expand?.user?.name || t("borrower") }}</strong>
                </span>
                <span class="dates-info">
                  <Calendar class="meta-icon" />
                  {{ formatDate(req.start) }} – {{ formatDate(req.end) }}
                </span>
              </div>

              <!-- Message from Borrower -->
              <div v-if="req.message" class="borrower-message">
                <ChatBubble class="msg-icon" />
                <p>“{{ req.message }}”</p>
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
                {{ t("accept_request") }}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'declined')"
              >
                <Xmark class="btn-icon" />
                {{ t("decline") }}
              </Button>
            </template>

            <!-- If Accepted / Handover pending -->
            <template v-else-if="req.status === 'accepted'">
              <span class="accepted-hint">
                <Check class="hint-icon" />
                {{ t("accepted_address_shared") }}
              </span>
              <Button
                variant="primary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'started')"
              >
                {{ t("confirm_handover") }}
              </Button>
            </template>

            <!-- If Active / Started -->
            <template v-else-if="req.status === 'started'">
              <span class="active-hint">
                <Clock class="hint-icon" />
                {{ t("currently_borrowed") }}
              </span>
              <Button
                variant="secondary"
                size="sm"
                :loading="processingId === req.id"
                @click="updateStatus(req, 'ended')"
              >
                {{ t("confirm_returned") }}
              </Button>
            </template>

            <!-- If Ended / Completed -->
            <template v-else-if="req.status === 'ended'">
              <span class="completed-hint">
                {{ t("completed_returned") }}
              </span>
            </template>
          </div>
        </Card>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Calendar, ChatBubble, Check, Clock, Inbox, User, Xmark } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ProductImage from "@/components/ProductImage.vue";
import type { Reservation } from "~~/models/reservation";

const { t } = useI18n({ useScope: "local" });
const { pb, isValid } = usePocketbase();
const config = useRuntimeConfig();
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

async function loadRequests() {
  try {
    isLoading.value = true;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    requests.value = await pb.collection("reservations").getFullList<Reservation>({
      filter: `owner = '${userId}'`,
      expand: "product,user",
      sort: "-created",
    });
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
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update reservation status.";
  } finally {
    processingId.value = null;
  }
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
  title: t("incoming_requests_title"),
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

  .meta-row {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: var(--color-gray-700);

    .borrower-info,
    .dates-info {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      .meta-icon {
        width: 1rem;
        height: 1rem;
        color: var(--color-gray-500);
      }
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
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "incoming_requests_title": "Incoming Lending Requests",
    "incoming_requests_subtitle": "Review and manage requests from neighbors wanting to borrow your items.",
    "no_requests": "No incoming requests right now",
    "no_requests_desc": "When other users request to borrow your listed items, they will appear here.",
    "list_more_items": "List More Items",
    "unnamed_item": "Item",
    "borrower": "Borrower",
    "accept_request": "Accept Request",
    "decline": "Decline",
    "accepted_address_shared": "Accepted — Handover address shared with borrower",
    "confirm_handover": "Mark Handed Over",
    "currently_borrowed": "Currently with borrower",
    "confirm_returned": "Confirm Item Returned",
    "completed_returned": "Rental completed & item returned",
    "status_requested": "Pending Approval",
    "status_accepted": "Accepted",
    "status_started": "Active / In Use",
    "status_ended": "Returned",
    "status_declined": "Declined",
    "status_cancelled": "Cancelled"
  },
  "de": {
    "incoming_requests_title": "Eingehende Verleihanfragen",
    "incoming_requests_subtitle": "Prüfe und verwalte Anfragen von Nachbarn, die deine Gegenstände ausleihen möchten.",
    "no_requests": "Aktuell keine Anfragen vorhanden",
    "no_requests_desc": "Sobald jemand einen deiner Gegenstände anfragt, erscheint die Anfrage hier.",
    "list_more_items": "Weitere Gegenstände einstellen",
    "unnamed_item": "Gegenstand",
    "borrower": "Ausleiher",
    "accept_request": "Anfrage annehmen",
    "decline": "Ablehnen",
    "accepted_address_shared": "Angenommen — Abholadresse für Ausleiher freigegeben",
    "confirm_handover": "Als übergeben markieren",
    "currently_borrowed": "Aktuell beim Ausleiher",
    "confirm_returned": "Rückgabe bestätigen",
    "completed_returned": "Ausleihe abgeschlossen & zurückgegeben",
    "status_requested": "Ausstehend",
    "status_accepted": "Angenommen",
    "status_started": "Laufend",
    "status_ended": "Zurückgegeben",
    "status_declined": "Abgelehnt",
    "status_cancelled": "Storniert"
  }
}
</i18n>
