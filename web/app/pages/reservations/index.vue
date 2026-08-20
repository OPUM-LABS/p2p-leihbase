<template>
  <Container width="lg" centered class="page-container">
    <!-- Header -->
    <section class="lb-stack">
      <Heading is="h1" size="xl">{{ t("reservations") }}</Heading>
      <p class="intro">
        {{ t("intro") }}
      </p>
    </section>

    <!-- Active & Pending Requests -->
    <section class="lb-stack">
      <Heading is="h2" size="lg">{{ t("active") }}</Heading>
      <ul v-if="current && current.length > 0" class="cards">
        <template v-for="reservation in current" :key="reservation.id">
          <li v-if="data?.products[reservation.product]">
            <ReservationCardButton
              :reservation="reservation"
              :product="data.products[reservation.product]"
              @click="selectedReservation = reservation"
            />
          </li>
        </template>
      </ul>
      <p v-else>
        <i>{{ t("no_active_reservations") }}</i>
      </p>
    </section>

    <!-- Past -->
    <section v-if="past && past.length > 0" class="lb-stack">
      <Heading is="h2" size="lg">{{ t("past") }}</Heading>
      <ul class="cards">
        <template v-for="reservation in past" :key="reservation.id">
          <li v-if="data?.products[reservation.product]">
            <ReservationCardButton
              :reservation="reservation"
              :product="data.products[reservation.product]"
              @click="selectedReservation = reservation"
            />
          </li>
        </template>
      </ul>
    </section>
  </Container>

  <ReservationDetailDialog
    :reservation="selectedReservation"
    :product="
      selectedReservation
        ? data?.products[selectedReservation?.product]
        : undefined
    "
    :location="
      selectedReservation?.location
        ? data?.locations[selectedReservation?.location]
        : undefined
    "
    @update="refresh"
    @close="selectedReservation = undefined"
  />
</template>

<script setup lang="ts">
import type { Location } from "@@/models/location";
import type { Product } from "@@/models/product";
import { type Reservation } from "@@/models/reservation";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import ReservationCardButton from "./_components/ReservationCardButton.vue";
import ReservationDetailDialog from "./_components/ReservationDetailDialog.vue";

const { pb, isValid, logout } = usePocketbase();
const userStore = useUserStore();

const selectedReservation = ref<Reservation>();

const { t } = useI18n({
  useScope: "local",
});

const { data, refresh } = await useAsyncData<{
  reservations: Reservation[];
  products: { [key: string]: Product };
  locations: { [key: string]: Location };
}>(
  "user_reservations",
  async () => {
    const userId = pb.authStore?.record?.id;
    if (!userId) return { reservations: [], products: {}, locations: {} };

    const reservations = await pb.collection("reservations").getFullList<Reservation>({
      filter: `user = '${userId}'`,
      sort: "-start",
      expand: "product,owner",
    });

    const productIds = Array.from(new Set(reservations.map((r) => r.product).filter(Boolean)));
    const locationIds = Array.from(new Set(reservations.map((r) => r.location).filter(Boolean)));

    let productsList: Product[] = [];
    if (productIds.length > 0) {
      productsList = await pb.collection("products").getFullList<Product>({
        filter: productIds.map((id) => `id='${id}'`).join("||"),
      });
    }

    let locationsList: Location[] = [];
    if (locationIds.length > 0) {
      locationsList = await pb.collection("public_locations").getFullList<Location>({
        filter: locationIds.map((id) => `id='${id}'`).join("||"),
      });
    }

    return {
      reservations: structuredClone(reservations),
      products: productsList.reduce(
        (map, p) => {
          map[p.id] = p;
          return map;
        },
        {} as { [key: string]: Product }
      ),
      locations: locationsList.reduce(
        (map, p) => {
          map[p.id] = p;
          return map;
        },
        {} as { [key: string]: Location }
      ),
    };
  },
  { lazy: true }
);

const current = computed(() =>
  (data.value?.reservations || []).filter((r) => {
    const isEnded = r.ended || r.status === "ended";
    const isCancelled = r.cancelled || r.status === "cancelled" || r.status === "declined";
    return !isEnded && !isCancelled;
  })
);

const past = computed(() =>
  (data.value?.reservations || []).filter((r) => {
    const isEnded = r.ended || r.status === "ended";
    const isCancelled = r.cancelled || r.status === "cancelled" || r.status === "declined";
    return isEnded || isCancelled;
  })
);

useHead({
  title: t("reservations"),
});

if (!isValid.value) {
  logout();
  userStore.logout();
  navigateTo("/login");
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.page-container {
  padding-block: var(--fluid-spacing-8);
}

section {
  margin-bottom: var(--fluid-spacing-8);
}

.intro {
  max-width: var(--max-text-width);
  color: var(--color-gray-600);
}

.cards {
  display: flex;
  list-style: none;
  gap: var(--fluid-spacing-4);
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  li {
    width: 100%;
  }
  @media (min-width: breakpoints.$breakpoint-md) {
    li {
      width: calc((100% - (var(--fluid-spacing-4) * 1)) * 1 / 2);
    }
  }
  @media (min-width: breakpoints.$breakpoint-lg) {
    li {
      width: calc((100% - (var(--fluid-spacing-4) * 2)) * 1 / 3);
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "My Borrowed Items",
    "intro": "Track your borrow requests, accepted pickups, and active rental deadlines.",
    "active": "Active & Requested",
    "no_active_reservations": "You currently have no active borrowing requests.",
    "past": "Past Rentals"
  },
  "de": {
    "reservations": "Meine Ausleihen",
    "intro": "Verfolge deine Ausleihanfragen, bestätigte Abholorte und Rückgabefristen.",
    "active": "Aktive & Angefragte Ausleihen",
    "no_active_reservations": "Du hast derzeit keine aktiven Ausleihen.",
    "past": "Vergangene Ausleihen"
  }
}
</i18n>
