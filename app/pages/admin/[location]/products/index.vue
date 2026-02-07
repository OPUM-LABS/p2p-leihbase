<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location">
      <Button @click="handleNewProductClick">
        {{ t("new_product") }}
      </Button>
    </AdminHeader>

    <FilterBar
      v-model:status="status"
      v-model:query="query"
      @input="handleFilterInput"
    />

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
import FilterBar from "./components/FilterBar.vue";

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
const query = ref("");
const productDrawerOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

function handleFilterInput() {
  nextTick(() => {
    refresh();
  });
}

const { data: products, refresh } = await useAsyncData(async () => {
  const filters = [];
  const params: Record<string, any> = {};
  if (status.value) {
    filters.push("active = {:active}");
    params['active'] = status.value === "active" ? true : false;
  }
  if (query.value) {
    filters.push("(name ~ {:query} || description ~ {:query})");
    params.query = query.value;
  }
  const products = await pb.collection("products").getFullList({
    filter: pb.filter(filters.join(" && "), params),
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

.products {
  --columns: ;
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
    "results": "result | results",
    "new_product": "New product"
  },
  "de": {
    "title": "Gegenständen",
    "results": "Ergebnis | Ergebnisse",
    "new_product": "Neues Gegenstand"
  }
}
</i18n>
