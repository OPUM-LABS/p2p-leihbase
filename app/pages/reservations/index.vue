<template>
  <Container width="lg" centered>
    <section>
      <h1>{{ t("reservations") }}</h1>
      <p class="intro">
        {{ t("intro") }}
      </p>
    </section>
    <ul class="cards">
      <li v-for="reservation in data?.reservations" :key="reservation.id">
        <Button
          variant="secondary"
          :class="['card', 'status-' + getReservationStatus(reservation)]"
          @click="selectedReservation = reservation"
        >
          <img
            :src="`${
              config.public.pocketbase.clientBaseUrl
            }/api/files/products/${reservation.product}/${
              data?.products[reservation.product].images[0]
            }${thumbs.sm}`"
          />
          <div class="details">
            <h2>{{ data?.products[reservation.product].name }}</h2>
            <p>
              {{ formatDate(reservation.start, DateTime.DATE_MED, locale) }}
              -
              {{ formatDate(reservation.end, DateTime.DATE_MED, locale) }}
            </p>
            <span class="tag">
              {{ t(getReservationStatus(reservation)) }}
            </span>
          </div>
        </Button>
      </li>
    </ul>
  </Container>
  <ReservationDetailDialog
    :reservation="selectedReservation"
    :product="
      selectedReservation
        ? data?.products[selectedReservation?.product]
        : undefined
    "
    :location="
      selectedReservation
        ? data?.locations[selectedReservation?.location]
        : undefined
    "
    @update="refresh"
    @close="selectedReservation = undefined"
  />
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { formatDate } from "~/lib/date";
import type { Reservation } from "~/models/reservation";
import ReservationDetailDialog from "./_components/ReservationDetailDialog.vue";
import type { Product } from "~/models/product";
import { getReservationStatus } from "~/lib/reservation";
import type { Location } from "~/models/location";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { pb, isValid, logout } = usePocketbase();
const router = useRouter();

const selectedReservation = ref<Reservation>();

const { t, locale } = useI18n({
  useScope: "local",
});

const { data, refresh, status } = await useAsyncData<{
  reservations: Reservation[];
  products: { [key: string]: Product };
  locations: { [key: string]: Location };
}>(
  "user_reservations",
  async () => {
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("user = {:user}", {
        user: pb.authStore?.model?.["id"],
      }),
      sort: "-start",
      requestKey: "user_reservations",
    });
    const products = await pb.collection("public_products").getFullList({
      filter: reservations.map((r) => `id="${r.product}"`).join("||"),
      requestKey: "reservations_product",
    });
    const locations = await pb.collection("public_locations").getFullList({
      filter: reservations.map((r) => `id="${r.location}"`).join("||"),
      requestKey: "reservations_location",
    });
    return {
      reservations: structuredClone(reservations) as Reservation[],
      products: products.reduce((map, p) => {
        map[p.id] = p as Product;
        return map;
      }, {} as { [key: string]: Product }),
      locations: locations.reduce((map, p) => {
        map[p.id] = p as Location;
        return map;
      }, {} as { [key: string]: Location }),
    };
  },
  { lazy: true }
);

useHead({
  title: t("reservations"),
});

if (!isValid.value) {
  logout();
  router.push("/login");
}
</script>

<style lang="scss" scoped>
@use "~/assets/styles/_breakpoints.scss";

section {
  margin-bottom: var(--fluid-spacing-8);
}

.intro {
  max-width: var(--max-text-width);
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

.card {
  display: flex;
  padding: 0.5rem !important;
  gap: var(--fluid-spacing-4);
  text-align: left;
  width: 100%;
  align-items: stretch;
  h2 {
    font-size: 1rem;
    margin: 0;
  }
  img {
    width: 7rem;
    height: 7rem;
    object-fit: cover;
    border-radius: var(--border-radius);
    flex-shrink: 0;
  }
  .details {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  p {
    margin: 0;
  }
  .tag {
    border: 1px solid var(--text-color-light);
    color: var(--text-color);
    padding: 0.25rem 0.333rem;
    font-size: var(--font-size-sm);
    line-height: 1;
    border-radius: var(--border-radius);
    margin-top: auto;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "intro": "Here you can manage your reservations. Check your current and past loans, extend deadlines, or cancel reservations as needed.",
    "new": "New",
    "cancelled": "Cancelled",
    "started": "Picked-up",
    "ended": "Returned",
    "overdue": "Overdue"
  },
  "de": {
    "reservations": "Reservierungen",
    "intro": "Hier kannst du deine Reservierungen verwalten. Schau dir deine aktuellen und vergangenen Ausleihen an, verlängere Fristen oder storniere Reservierungen bei Bedarf.",
    "new": "Neu",
    "cancelled": "Annuliert",
    "started": "Abgehollt",
    "ended": "Zurückgebracht",
    "overdue": "Überfällig"
  }
}
</i18n>
