<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location">
      <Button @click="handleNewProductClick">
        {{ t("new_product") }}
      </Button>
    </AdminHeader>

    <div class="filter-bar">
      {{ t("status") }}
      <select v-model="status" @input="handleSelect">
        <option value="">{{ t("all") }}</option>
        <option value="active">{{ t("active") }}</option>
        <option value="inactive">{{ t("inactive") }}</option>
      </select>
    </div>

    <p v-if="location && products">
      {{ products.length }} {{ t("results", products.length) }}
    </p>

    <div v-if="location && products && products.length > 0" class="products">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        spacing="sm"
        class="product"
        @click="handleProductClick(product)"
      >
        <!-- :to="`/l/${location.slug}/p/${product.id}`" -->
        <template #image-overlay>
          <Badge v-if="!product.active" variant="error">
            {{ t("inactive") }}
          </Badge>
        </template>
        <p class="description">
          <strong>{{ product.name }}</strong>
        </p>
      </ProductCard>
    </div>
  </Container>

  <ProductDrawer
    v-if="location"
    v-model:open="productDrawerOpen"
    :state="selectedProduct ? 'edit' : 'new'"
    :location="location"
    :product="selectedProduct"
    @update="handleProductUpdate"
  />

  <RecordPicker id="products-record-picker" />
</template>

<script setup lang="ts">
import AdminNav from "../components/AdminNav.vue";
import AdminHeader from "../components/AdminHeader.vue";
import type { Product } from "~/models/product";
import ProductDrawer from "./components/ProductDrawer.vue";
import Badge from "~/components/Badge.vue";
import RecordPicker from "~/components/admin/RecordPicker.vue";

const { t } = useI18n({
  useScope: "local",
});
const route = useRoute();
const { pb } = usePocketbase();

const slug = route.params.location;

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
});

const status = ref("");
const productDrawerOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

function handleSelect() {
  nextTick(() => {
    refresh();
  });
}

const { data: products, refresh } = await useAsyncData(async () => {
  const products = await pb.collection("products").getFullList({
    filter: pb.filter(status.value ? "active = {:active}" : "", {
      active: status.value === "active" ? true : false,
    }),
    sort: "name",
  });
  const p = structuredClone(products) as Product[];
  return p;
});

function handleNewProductClick() {
  selectedProduct.value = null;
  productDrawerOpen.value = true;
}

function handleProductClick(product: Product) {
  selectedProduct.value = product;
  productDrawerOpen.value = true;
}

function handleProductUpdate() {
  refresh();
}
</script>

<style lang="scss" scoped>
@use "~/assets/styles/breakpoints.scss";

.filter-bar {
  margin-bottom: var(--fluid-spacing-8);
}

.products {
  --columns: 3;
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--fluid-spacing-4);
  margin-bottom: var(--fluid-spacing-4);

  .product {
    display: flex;
    color: var(--text-color);
    text-decoration: none;
    width: 100%;

    .description {
      line-height: 1.15;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
  }

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    --columns: 4;
  }

  @media screen and (min-width: breakpoints.$breakpoint-md) {
    --columns: 5;
  }

  @media screen and (min-width: breakpoints.$breakpoint-lg) {
    --columns: 6;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Products",
    "status": "Status",
    "all": "All",
    "active": "Active",
    "inactive": "Inactive",
    "results": "result | results",
    "new_product": "New product"
  },
  "de": {
    "title": "Gegenständen",
    "status": "Status",
    "all": "Alle",
    "active": "Aktiv",
    "inactive": "Inaktiv",
    "results": "Ergebnis | Ergebnisse",
    "new_product": "Neues Gegenstand"
  }
}
</i18n>
