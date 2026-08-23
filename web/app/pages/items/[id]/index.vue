<template>
  <Container width="lg" centered class="page-container">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <Alert v-else-if="error" variant="danger">{{ error }}</Alert>

    <div v-else-if="product" class="product-layout">
      <!-- Left Column: Gallery & Details -->
      <div class="main-content">
        <!-- Gallery -->
        <Card class="gallery-card">
          <div class="main-image">
            <ProductImage
              :src="activeImageUrl"
              fallback="/images/fallback-product-image-600x600.png"
              aspect-ratio="4:3"
            />
          </div>
          <div v-if="product.images && product.images.length > 1" class="thumbnails">
            <button
              v-for="(img, idx) in product.images"
              :key="img"
              class="thumbnail-btn"
              :class="{ active: selectedImageIndex === idx }"
              @click="selectedImageIndex = idx"
            >
              <img
                :src="getProductImageUrl(product.id, img, thumbs.sm) || ''"
              />
            </button>
          </div>
        </Card>

        <!-- Description & Information -->
        <Card class="details-card lb-stack">
          <div>
            <span class="category-tag">{{ t('items.detail.p2p_item') }}</span>
            <Heading is="h1" size="xl" class="product-title">{{ product.name }}</Heading>
          </div>

          <div v-if="product.description" class="section">
            <Heading is="h2" size="md">{{ t('items.detail.description') }}</Heading>
            <div class="lb-richtext" v-html="product.description"></div>
          </div>

          <div v-if="product.terms_condition" class="section">
            <Heading is="h2" size="md">{{ t('items.detail.terms') }}</Heading>
            <div class="lb-richtext" v-html="product.terms_condition"></div>
          </div>
        </Card>
      </div>

      <!-- Right Column: Booking Box, Location & Owner Profile -->
      <div class="sidebar-content lb-stack">
        <!-- Action & Borrow Box -->
        <Card class="booking-card lb-stack">
          <div class="availability-row">
            <AvailabilityBadge :available="product.computedIsAvailable !== false" />
            <span v-if="product.deposit" class="deposit-label">
              {{ t('items.detail.deposit') }}: <strong>{{ product.deposit }}€</strong>
            </span>
          </div>

          <div class="duration-hint">
            <Calendar class="hint-icon" />
            <span>{{ t('items.detail.max_rental_days', { days: product.max_duration_days || 14 }) }}</span>
          </div>

          <!-- If Owner -->
          <div v-if="isOwner" class="owner-actions">
            <Button variant="primary" :to="`/items/${product.id}/edit`" class="full-btn">
              <Edit class="btn-icon" />
              {{ t('items.detail.edit_listing') }}
            </Button>
          </div>

          <!-- If Borrower -->
          <div v-else class="borrow-actions">
            <Button
              v-if="isValid"
              variant="primary"
              size="lg"
              class="full-btn"
              @click="openBorrowDialog"
            >
              {{ t('items.detail.request_to_borrow') }}
            </Button>
            <Button
              v-else
              variant="primary"
              size="lg"
              class="full-btn"
              :to="`/login?redirect=/items/${product.id}`"
            >
              {{ t('items.detail.login_to_borrow') }}
            </Button>
          </div>

          <!-- Upcoming Reservations (if any) -->
          <ReservationsBox
            v-if="reservations && reservations.length > 0"
            :title="t('reservations.box.title')"
            :reservations="reservations"
            class="upcoming-reservations"
          />
        </Card>

        <!-- Approximate Location & Privacy Card -->
        <Card class="location-card">
          <Heading is="h2" size="sm" class="sidebar-heading">
            <MapPin class="heading-icon" />
            {{ t('items.detail.pickup_location') }}
          </Heading>

          <div class="location-details">
            <p class="city-line">
              <strong>{{ product.postal_code }} {{ product.city || t('items.detail.location_not_set') }}</strong>
            </p>
            <p v-if="product.approx_location_note" class="approx-note">
              {{ product.approx_location_note }}
            </p>
          </div>

          <div class="privacy-note">
            <Lock class="lock-icon" />
            <small>{{ t('items.detail.privacy_explanation') }}</small>
          </div>
        </Card>

        <!-- Lender Profile Card -->
        <Card v-if="product.expand?.user" class="owner-card">
          <Heading is="h2" size="sm" class="sidebar-heading">
            <UserIcon class="heading-icon" />
            {{ t('items.detail.offered_by') }}
          </Heading>

          <div class="owner-profile">
            <div class="avatar-placeholder">
              <UserIcon class="default-avatar" />
            </div>
            <div class="owner-meta">
              <p class="owner-name">{{ product.expand.user.nickname || product.expand.user.name }}</p>
              <p v-if="product.expand.user.bio" class="owner-bio">
                {{ product.expand.user.bio }}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Calendar, Edit, Lock, MapPin, User as UserIcon } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import AvailabilityBadge from "@/components/AvailabilityBadge.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ProductImage from "@/components/ProductImage.vue";
import ReservationsBox from "@/components/ReservationsBox.vue";
import { getFutureReservationsByProduct } from "@/composables/reservation";
import type { Product } from "~~/models/product";

const { t } = useI18n();
const { pb, isValid } = usePocketbase();
const route = useRoute();
const nuxtApp = useNuxtApp();
const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const reservationDialog = useReservationDialog();

const { reservations, refresh: refreshReservations } =
  await getFutureReservationsByProduct(route.params.id as string);

nuxtApp.hook("app:user:reservation:create", () => {
  refreshReservations();
});

const isLoading = ref(true);
const error = ref("");
const product = ref<Product | null>(null);
const selectedImageIndex = ref(0);

const isOwner = computed(() => {
  return isValid.value && product.value?.user === pb.authStore.record?.id;
});

const activeImageUrl = computed(() => {
  if (
    product.value &&
    product.value.images &&
    product.value.images.length > 0 &&
    product.value.images[selectedImageIndex.value]
  ) {
    return getProductImageUrl(
      product.value.id,
      product.value.images[selectedImageIndex.value],
      thumbs.lg
    );
  }
  return null;
});

onMounted(async () => {
  try {
    isLoading.value = true;
    product.value = await pb.collection("products").getOne<Product>(
      route.params.id as string,
      {
        expand: "user",
        query: { computeAvailability: "true" },
      }
    );
  } catch (err: any) {
    error.value = err?.message || "Product not found";
  } finally {
    isLoading.value = false;
  }
});

function openBorrowDialog() {
  if (product.value) {
    reservationDialog.open(product.value);
  }
}

useHead({
  title: computed(() => product.value?.name || "Item Details"),
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

.page-container {
  padding-block: var(--fluid-spacing-8);
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fluid-spacing-8);

  @media (min-width: breakpoints.$breakpoint-md) {
    grid-template-columns: 1.5fr 1fr;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-6);
}

.gallery-card {
  padding: 0;
  overflow: hidden;
  border-radius: var(--border-radius);

  .main-image {
    width: 100%;
  }

  .thumbnails {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--color-gray-50, #f8f9fa);
    overflow-x: auto;

    .thumbnail-btn {
      border: 2px solid transparent;
      border-radius: 4px;
      padding: 0;
      background: none;
      cursor: pointer;
      width: 60px;
      height: 60px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.active {
        border-color: var(--primary-color);
      }
    }
  }
}

.details-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .category-tag {
    font-size: 0.8rem;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    color: var(--color-gray-500);
    letter-spacing: 0.05em;
  }

  .product-title {
    margin-top: 0.25rem;
    margin-bottom: 0;
  }

  .section {
    border-top: 1px solid var(--color-gray-200);
    padding-top: 1rem;
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-6);
}

.booking-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .availability-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .deposit-label {
    font-size: 0.95rem;
    color: var(--color-gray-700);
  }

  .duration-hint {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--color-gray-600);
    .hint-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
  }

  .full-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    .btn-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
}

.location-card,
.owner-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .sidebar-heading {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-gray-700);
    .heading-icon {
      width: 1.1rem;
      height: 1.1rem;
      color: var(--primary-color);
    }
  }
}

.location-details {
  .city-line {
    margin: 0;
    font-size: 1rem;
  }
  .approx-note {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--color-gray-600);
  }
}

.privacy-note {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  background: var(--color-gray-50, #f8f9fa);
  padding: 0.6rem 0.75rem;
  border-radius: var(--border-radius);
  color: var(--color-gray-600);

  .lock-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #e03131;
  }
}

.owner-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .avatar-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--color-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-gray-600);
    .default-avatar {
      width: 24px;
      height: 24px;
    }
  }

  .owner-meta {
    display: flex;
    flex-direction: column;
    .owner-name {
      font-weight: var(--font-weight-semibold);
      margin: 0;
    }
    .owner-bio {
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-gray-600);
    }
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
</style>
