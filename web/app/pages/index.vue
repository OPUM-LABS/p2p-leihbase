<template>
  <div class="homepage">
    <!-- Hero Section -->
    <section class="hero-section">
      <Container width="lg" centered>
        <PageAlert />
        <div class="hero-content">
          <Heading is="h1" size="2xl" class="hero-title">
            {{ t("hero_title") }}
          </Heading>
          <p class="hero-subtitle">
            {{ t("hero_subtitle") }}
          </p>

          <!-- Search & Filter Controls -->
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <Search class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('search_placeholder')"
                class="search-input"
              />
            </div>
            <div class="location-input-wrapper">
              <MapPin class="search-icon" />
              <input
                v-model="locationFilter"
                type="text"
                :placeholder="t('location_placeholder')"
                class="search-input"
              />
            </div>
            <Button
              variant="primary"
              to="/items/new"
              class="hero-cta-btn"
            >
              <Plus class="btn-icon" />
              {{ t("lend_item_btn") }}
            </Button>
          </div>
        </div>
      </Container>
    </section>

    <!-- Marketplace Items Grid -->
    <section class="marketplace-section">
      <Container width="lg" centered>
        <div class="section-header">
          <div>
            <Heading is="h2" size="xl">{{ t("browse_items_title") }}</Heading>
            <p class="section-subtitle">
              {{ t("items_count", { count: filteredProducts.length }) }}
            </p>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">
          <LoadingSpinner />
        </div>

        <!-- Empty State -->
        <Card v-else-if="filteredProducts.length === 0" class="empty-state">
          <Search class="empty-icon" />
          <Heading is="h3" size="md">{{ t("no_items_found") }}</Heading>
          <p>{{ t("no_items_found_desc") }}</p>
          <Button v-if="searchQuery || locationFilter" variant="secondary" @click="resetFilters">
            {{ t("clear_filters") }}
          </Button>
          <Button v-else variant="primary" to="/items/new">
            {{ t("be_the_first_to_list") }}
          </Button>
        </Card>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <NuxtLink
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/items/${product.id}`"
            class="product-link"
          >
            <Card class="p2p-product-card">
              <div class="image-wrapper">
                <ProductImage
                  :src="
                    product.images && product.images.length > 0
                      ? `${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[0]}${thumbs.sm}`
                      : null
                  "
                  fallback="/images/fallback-product-image-600x600.png"
                  aspect-ratio="1:1"
                />
                <span
                  class="availability-tag"
                  :class="{ available: product.computedIsAvailable !== false, busy: product.computedIsAvailable === false }"
                >
                  {{ product.computedIsAvailable !== false ? t("available") : t("borrowed") }}
                </span>
              </div>

              <div class="card-details">
                <Heading is="h3" size="sm" class="product-name">
                  {{ product.name }}
                </Heading>

                <div class="card-meta">
                  <span class="location-pill">
                    <MapPin class="meta-icon" />
                    {{ product.postal_code }} {{ product.city || t("nearby") }}
                  </span>
                  <span v-if="product.deposit" class="deposit-pill">
                    {{ t("deposit") }}: {{ product.deposit }}€
                  </span>
                </div>
              </div>
            </Card>
          </NuxtLink>
        </div>
      </Container>
    </section>

    <!-- Why P2P Sharing Section -->
    <section class="benefits-section">
      <Container width="lg" centered>
        <Heading is="h2" size="xl" class="benefits-title">{{ t("why_share_title") }}</Heading>
        <div class="benefits-grid">
          <Card class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Community class="benefit-icon" />
            </div>
            <Heading is="h3" size="md">{{ t("benefit_community_title") }}</Heading>
            <p>{{ t("benefit_community_desc") }}</p>
          </Card>
          <Card class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Leaf class="benefit-icon" />
            </div>
            <Heading is="h3" size="md">{{ t("benefit_eco_title") }}</Heading>
            <p>{{ t("benefit_eco_desc") }}</p>
          </Card>
          <Card class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Lock class="benefit-icon" />
            </div>
            <Heading is="h3" size="md">{{ t("benefit_privacy_title") }}</Heading>
            <p>{{ t("benefit_privacy_desc") }}</p>
          </Card>
        </div>
      </Container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Community, Leaf, Lock, MapPin, Plus, Search } from "@iconoir/vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import ProductImage from "@/components/ProductImage.vue";
import type { Product } from "~~/models/product";

const { t } = useI18n({ useScope: "local" });
const { pb } = usePocketbase();
const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { leihbase } = useLeihbase();

const isLoading = ref(true);
const products = ref<Product[]>([]);
const searchQuery = ref("");
const locationFilter = ref("");

async function loadProducts() {
  try {
    isLoading.value = true;
    products.value = await pb.collection("products").getFullList<Product>({
      filter: "active = true",
      sort: "-created",
      query: { computeAvailability: "true" },
    });
  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    isLoading.value = false;
  }
}

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchQuery =
      !searchQuery.value ||
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchLocation =
      !locationFilter.value ||
      p.city?.toLowerCase().includes(locationFilter.value.toLowerCase()) ||
      p.postal_code?.includes(locationFilter.value) ||
      p.approx_location_note?.toLowerCase().includes(locationFilter.value.toLowerCase());

    return matchQuery && matchLocation;
  });
});

function resetFilters() {
  searchQuery.value = "";
  locationFilter.value = "";
}

onMounted(() => {
  loadProducts();
});

useHead({
  title: `${leihbase.value?.name || "Leihbase"} - P2P Sharing Platform`,
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

.homepage {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-12);
  padding-bottom: var(--fluid-spacing-16);
}

.hero-section {
  background: linear-gradient(180deg, var(--secondary-color, #f0fdf4) 0%, rgba(255, 255, 255, 0) 100%);
  padding-block: var(--fluid-spacing-12);

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    max-width: 800px;
    margin-inline: auto;
  }

  .hero-title {
    margin: 0;
    line-height: 1.15;
    font-weight: var(--font-weight-black);
    color: var(--color-gray-900);
  }

  .hero-subtitle {
    font-size: 1.15rem;
    color: var(--color-gray-600);
    max-width: 600px;
    margin: 0;
  }
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem;
  border-radius: 999px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 750px;
  margin-top: 1.5rem;
  border: 1px solid var(--color-gray-200);

  @media (max-width: 700px) {
    flex-direction: column;
    border-radius: var(--border-radius);
    padding: 1rem;
    align-items: stretch;
  }

  .search-input-wrapper,
  .location-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    padding-inline: 0.75rem;

    .search-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--color-gray-400);
      flex-shrink: 0;
    }

    .search-input {
      border: 0;
      outline: 0;
      width: 100%;
      font-size: 0.95rem;
      background: transparent;
      &::placeholder {
        color: var(--color-gray-400);
      }
    }
  }

  .location-input-wrapper {
    border-left: 1px solid var(--color-gray-200);
    @media (max-width: 700px) {
      border-left: 0;
      border-top: 1px solid var(--color-gray-200);
      padding-top: 0.75rem;
    }
  }

  .hero-cta-btn {
    border-radius: 999px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    .btn-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
}

.marketplace-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--fluid-spacing-8);

    .section-subtitle {
      color: var(--color-gray-600);
      margin: 0.25rem 0 0 0;
    }
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--fluid-spacing-6);
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.p2p-product-card {
  padding: 0;
  overflow: hidden;
  border-radius: var(--border-radius);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  }

  .image-wrapper {
    position: relative;
    width: 100%;

    .availability-tag {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      font-size: 0.75rem;
      font-weight: var(--font-weight-bold);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      z-index: 2;

      &.available {
        background-color: #d3f9d8;
        color: #2b8a3e;
      }
      &.busy {
        background-color: #fff3bf;
        color: #d9480f;
      }
    }
  }

  .card-details {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;

    .product-name {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--color-gray-600);
      margin-top: auto;

      .location-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        .meta-icon {
          width: 1rem;
          height: 1rem;
          color: var(--color-gray-500);
        }
      }

      .deposit-pill {
        font-weight: var(--font-weight-medium);
        color: var(--color-gray-700);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    color: var(--color-gray-400);
  }
}

.benefits-section {
  margin-top: var(--fluid-spacing-8);
  .benefits-title {
    text-align: center;
    margin-bottom: var(--fluid-spacing-8);
  }
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--fluid-spacing-6);
  }
  .benefit-card {
    padding: 2rem 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    .benefit-icon-wrapper {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: var(--secondary-color, #e6fcf5);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;

      .benefit-icon {
        width: 28px;
        height: 28px;
      }
    }
    p {
      color: var(--color-gray-600);
      font-size: 0.95rem;
      margin: 0;
    }
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
    "hero_title": "Borrow & Lend in Your Neighborhood",
    "hero_subtitle": "Why buy when you can borrow? Discover tools, camping gear, and appliances shared by neighbors nearby.",
    "search_placeholder": "What are you looking to borrow?",
    "location_placeholder": "Postal code or City",
    "lend_item_btn": "List an Item",
    "browse_items_title": "Available in the Community",
    "items_count": "{count} items available to borrow",
    "available": "Available",
    "borrowed": "Reserved",
    "nearby": "Nearby",
    "deposit": "Deposit",
    "no_items_found": "No items found matching your search",
    "no_items_found_desc": "Try adjusting your search terms or postal code, or be the first in your area to list an item!",
    "clear_filters": "Clear Filters",
    "be_the_first_to_list": "List the First Item",
    "why_share_title": "Why Peer-to-Peer Sharing?",
    "benefit_community_title": "Stronger Neighborhoods",
    "benefit_community_desc": "Connect with people nearby and foster a cooperative sharing culture.",
    "benefit_eco_title": "Sustainable & Circular",
    "benefit_eco_desc": "Cut down unnecessary purchases and resource consumption by utilizing idle equipment.",
    "benefit_privacy_title": "Privacy by Default",
    "benefit_privacy_desc": "Exact pickup addresses are only revealed after the lender approves your request."
  },
  "de": {
    "hero_title": "Leihen & Verleihen in deiner Nachbarschaft",
    "hero_subtitle": "Warum kaufen, wenn man leihen kann? Entdecke Werkzeuge, Campingausrüstung und Haushaltsgeräte von Nachbarn in deiner Nähe.",
    "search_placeholder": "Was suchst du zum Ausleihen?",
    "location_placeholder": "PLZ oder Stadt",
    "lend_item_btn": "Gegenstand anbieten",
    "browse_items_title": "Gegenstände in deiner Community",
    "items_count": "{count} Gegenstände zum Ausleihen verfügbar",
    "available": "Verfügbar",
    "borrowed": "Reserviert",
    "nearby": "In der Nähe",
    "deposit": "Kaution",
    "no_items_found": "Keine Gegenstände für deine Suche gefunden",
    "no_items_found_desc": "Probiere andere Suchbegriffe oder Postleitzahlen, oder stelle als Erstes einen Gegenstand ein!",
    "clear_filters": "Filter zurücksetzen",
    "be_the_first_to_list": "Ersten Gegenstand einstellen",
    "why_share_title": "Warum gemeinsam teilen?",
    "benefit_community_title": "Starke Nachbarschaft",
    "benefit_community_desc": "Lerne Menschen in deiner Umgebung kennen und stärke das Miteinander.",
    "benefit_eco_title": "Nachhaltig & Ressourcenschonend",
    "benefit_eco_desc": "Vermeide unnötige Neukäufe und nutze vorhandene Dinge optimal aus.",
    "benefit_privacy_title": "Geschützte Privatsphäre",
    "benefit_privacy_desc": "Genaue Abholadressen werden erst nach Bestätigung durch den Verleiher sichtbar."
  }
}
</i18n>
