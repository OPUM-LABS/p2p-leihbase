<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location" />

    <div class="filter-bar">
      {{ t("status") }}
      <select v-model="status" @input="handleSelect">
        <option value="">{{ t("all") }}</option>
        <option value="active">{{ t("active") }}</option>
        <option value="inactive">{{ t("inactive") }}</option>
      </select>
    </div>

    <div v-if="location && products && products.length > 0" class="products">
      <template v-for="product in products" :key="product.id">
        <ProductCard
          :product="product"
          :to="`/l/${location.slug}/p/${product.id}`"
          spacing="sm"
          class="product"
        >
          <p class="description">
            <strong>{{ product.name }}</strong>
            <br />
            {{ product.active ? t("active") : t("inactive") }}
          </p>
        </ProductCard>
      </template>
    </div>
  </Container>
</template>

<script setup lang="ts">
import AdminNav from "./components/AdminNav.vue";
import AdminHeader from "./components/AdminHeader.vue";
import type { RecordModel } from "pocketbase";

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

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}
function handleSelect() {
  nextTick(() => {
    console.log("select", status.value);
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
  return structuredClone(products);
});
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
    "inactive": "Inactive"
  },
  "de": {
    "title": "Gegenständen",
    "status": "Status",
    "all": "Alle",
    "active": "Aktiv",
    "inactive": "Inaktiv"
  }
}
</i18n>
