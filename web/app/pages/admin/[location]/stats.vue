<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('admin.stats.title')" :location="location" />

    <div class="dates">
      <DateInput
        id="date-start"
        :label="t('admin.stats.from')"
        v-model="dateStart"
        required
        @input="() => refresh()"
      />
      <DateInput
        id="date-end"
        :label="t('admin.stats.to')"
        v-model="dateEnd"
        required
        @input="() => refresh()"
      />
    </div>

    <div class="cols">
      <div class="lb-stack">
        <Heading is="h3" size="md">{{ t('admin.stats.reservations') }}</Heading>
        <p>
          {{ reservations?.length }} {{ t('admin.stats.created_reservations') }}<br />
          {{ borrowings?.length }} {{ t('admin.stats.borrowings') }}<br />
          {{ cancelled?.length || 0 }} {{ t('admin.stats.cancellations') }}
        </p>

        <Heading is="h3" size="md">{{ t('admin.stats.users_title') }}</Heading>
        <p>
          {{ borrowingsWithUser?.length }} {{ t('admin.stats.borrowings_with_user') }}<br />
          {{ accounts }} {{ t('admin.stats.users') }}
        </p>
      </div>

      <div class="lb-stack">
        <Heading is="h3" size="md">{{ t('admin.stats.most_borrowed_products') }}</Heading>
        <ol>
          <li v-for="(product, index) in products">
            <a target="_blank" :href="`/link/product/${product.product.id}`">
              {{ product.product.name }}
            </a>
            ({{ product.count }}x)<br />
          </li>
        </ol>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { endOfUTCDate, startOfUTCDate, subtractDays } from "@@/lib/date";
import Container from "@/components/core/Container.vue";
import DateInput from "@/components/core/DateInput.vue";
import Heading from "@/components/core/Heading.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import type { RecordModel } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";

const { t } = useI18n({
  useScope: "local",
});
const route = useRoute();
const { pb } = usePocketbase();

const slug = route.params.location;

const dateStart = ref<Date | undefined>(subtractDays(new Date(Date.now()), 30));
const dateEnd = ref<Date | undefined>(new Date(Date.now()));

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

const { data: reservations, refresh } = await useAsyncData(() => {
  if (!dateStart.value || !dateEnd.value) {
    throw new Error("No start or end date defined.");
  }
  return pb.collection("reservations").getFullList({
    filter: pb.filter("start >= {:dateStart} && end <= {:dateEnd}", {
      dateStart: startOfUTCDate(dateStart.value),
      dateEnd: endOfUTCDate(dateEnd.value),
    }),
    expand: "product",
  });
});

const borrowings = computed(() =>
  reservations.value?.filter((r) => !r.cancelled)
);

const cancelled = computed(() =>
  reservations.value?.filter((r) => r.cancelled)
);

const products = computed(() => {
  const count = reservations.value
    ?.filter((r) => !!r && !!r.expand?.product)
    .reduce<{ [s: string]: { product: RecordModel; count: number } }>(
      (map, reservation) => {
        if (reservation?.expand?.product) {
          map[reservation.expand.product.id] = map[
            reservation.expand.product.id
          ] || {
            product: reservation.expand.product,
            count: 0,
          };
          map[reservation.expand.product.id].count++;
        }
        return map;
      },
      {}
    );
  if (!count) return [];
  return Object.values(count)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

const borrowingsWithUser = computed(() =>
  reservations.value?.filter((r) => !r.cancelled && !!r.user)
);

const accounts = computed(
  () =>
    reservations.value
      ?.map((r) => r.user)
      .filter((id, index, arr) => !!id && arr.indexOf(id) === index).length
);
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.dates {
  display: flex;
  gap: 1rem;
  margin-bottom: var(--fluid-spacing-8);
}
.cols {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    grid-template-columns: 1fr 1fr;
  }
}
ol {
  padding-left: 2rem;
}
</style>
