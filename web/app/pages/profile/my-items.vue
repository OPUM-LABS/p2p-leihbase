<template>
  <Container width="lg" centered class="page-container">
    <div class="header-row">
      <div>
        <Heading is="h1" size="xl">{{ t('profile.my_items.my_items_title') }}</Heading>
        <p class="subtitle">{{ t('profile.my_items.my_items_subtitle') }}</p>
      </div>
      <Button variant="primary" to="/items/new" class="add-btn">
        <Plus class="icon" />
        {{ t('profile.my_items.add_new_item') }}
      </Button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <!-- Empty State -->
    <Card v-else-if="items.length === 0" class="empty-state">
      <Package class="empty-icon" />
      <Heading is="h2" size="md">{{ t('profile.my_items.no_items_yet') }}</Heading>
      <p>{{ t('profile.my_items.no_items_desc') }}</p>
      <Button variant="primary" to="/items/new">{{ t('profile.my_items.add_first_item') }}</Button>
    </Card>

    <!-- Items Grid -->
    <div v-else class="items-grid">
      <Card v-for="item in items" :key="item.id" class="item-card">
        <div class="image-wrapper">
          <ProductImage
            :src="getProductImageUrl(item.id, item.images?.[0], thumbs.sm)"
            fallback="/images/fallback-product-image-600x600.png"
            aspect-ratio="1:1"
          />
          <span
            class="status-pill"
            :class="{ active: item.active !== false, paused: item.active === false }"
          >
            {{ item.active !== false ? t('profile.my_items.status_active') : t('profile.my_items.status_paused') }}
          </span>
        </div>

        <div class="item-info">
          <Heading is="h3" size="sm" class="item-title">{{ item.name }}</Heading>
          <div class="meta-row">
            <span class="location-tag">
              <MapPin class="meta-icon" />
              {{ item.city || t('profile.my_items.unknown_location') }}
              <template v-if="item.approx_location_note">({{ item.approx_location_note }})</template>
            </span>
            <span v-if="item.deposit" class="deposit-tag">
              {{ t('profile.my_items.deposit') }}: {{ item.deposit }}€
            </span>
          </div>

          <div class="card-actions">
            <Button
              variant="secondary"
              size="sm"
              :to="`/items/${item.id}`"
            >
              {{ t('profile.my_items.view') }}
            </Button>
            <Button
              variant="primary"
              size="sm"
              :to="`/items/${item.id}/edit`"
            >
              {{ t('profile.my_items.edit') }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { MapPin, Package, Plus } from "@iconoir/vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ProductImage from "@/components/ProductImage.vue";
import type { Product } from "~~/models/product";

const { t } = useI18n();
const { pb, isValid } = usePocketbase();
const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();

if (!isValid.value) {
  navigateTo("/login?redirect=/profile/my-items");
}

const isLoading = ref(true);
const items = ref<Product[]>([]);

async function loadItems() {
  try {
    isLoading.value = true;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    items.value = await pb.collection("products").getFullList<Product>({
      filter: `user = '${userId}'`,
      sort: "-created",
    });
  } catch (err) {
    console.error("Failed to load user items:", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadItems();
});

useHead({
  title: t("profile.my_items.my_items_title"),
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

.page-container {
  padding-block: var(--fluid-spacing-8);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: var(--fluid-spacing-8);

  .subtitle {
    color: var(--color-gray-600);
    margin-top: 0.25rem;
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--fluid-spacing-6);
}

.item-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }
}

.image-wrapper {
  position: relative;
  width: 100%;

  .status-pill {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    z-index: 2;

    &.active {
      background-color: #d3f9d8;
      color: #2b8a3e;
    }
    &.paused {
      background-color: #ffe3e3;
      color: #c92a2a;
    }
  }
}

.item-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;

  .item-title {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: var(--color-gray-600);

    .location-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      .meta-icon {
        width: 1rem;
        height: 1rem;
      }
    }
    .deposit-tag {
      font-weight: var(--font-weight-medium);
    }
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.75rem;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}
</style>
