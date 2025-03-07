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
        <Button variant="secondary" class="card">
          <img
            :src="`${
              config.public.pocketbase.clientBaseUrl
            }/api/files/products/${reservation.product}/${
              data?.products[reservation.product].images[0]
            }${thumbs.sm}`"
          />
          <div>
            <h2>{{ data?.products[reservation.product].name }}</h2>
            <p>
              {{ formatDate(reservation.start, DateTime.DATE_MED, locale) }}
              -
              {{ formatDate(reservation.end, DateTime.DATE_MED, locale) }}
            </p>
          </div>
        </Button>
      </li>
    </ul>
  </Container>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { RecordModel } from "pocketbase";
import { formatDate } from "~/lib/date";
import type { Reservation } from "~/models/reservation";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { pb, isValid, logout } = usePocketbase();
const router = useRouter();

const { t, locale } = useI18n({
  useScope: "local",
});

const { data, refresh, status } = await useAsyncData(
  "user_reservations",
  async () => {
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("user = {:user}", {
        user: pb.authStore?.model?.["id"],
      }),
      sort: "start",
      requestKey: "user_reservations",
    });
    const products = await pb.collection("public_products").getFullList({
      filter: reservations.map((r) => `id="${r.product}"`).join("||"),
      requestKey: "reservations_product",
    });
    return {
      reservations: structuredClone(reservations) as Reservation[],
      products: products.reduce((map, p) => {
        map[p.id] = p;
        return map;
      }, {} as { [key: string]: RecordModel }),
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
  margin-bottom: var(--fluid-spacing-12);
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
  & > div {
    width: 100%;
  }
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
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "intro": "Here you can manage your reservations. Check your current and past loans, extend deadlines, or cancel reservations as needed."
  },
  "de": {
    "reservations": "Reservierungen",
    "intro": "Hier kannst du deine Reservierungen verwalten. Schau dir deine aktuellen und vergangenen Ausleihen an, verlängere Fristen oder storniere Reservierungen bei Bedarf."
  }
}
</i18n>
