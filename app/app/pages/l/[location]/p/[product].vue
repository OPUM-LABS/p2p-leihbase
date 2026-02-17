<template>
  <Container width="lg" centered>
    <PageAlert />
    <section class="product">
      <div class="media-col">
        <ProductImage
          :src="
            product?.images && product?.images.length > 0
              ? `${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[imageIndex]}${thumbs.lg}`
              : null
          "
          fallback="/images/fallback-product-image-1200x1200.png"
          class="main-image"
          object-fit="contain"
          loading="lazy"
        />
        <div
          v-if="product?.images && product.images.length > 1"
          class="thumbnails"
        >
          <button
            v-for="(image, index) in product.images.slice(0, 4)"
            type="button"
            :class="index === imageIndex ? 'active' : ''"
            @click="imageIndex = index"
          >
            <img
              :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${image}${thumbs.sm}`"
            />
          </button>
        </div>
      </div>
      <div class="info-col">
        <header>
          <ul class="breadcrumb">
            <li>
              <NuxtLink :to="`/l/${location?.slug}`">
                {{ location?.name }}
              </NuxtLink>
            </li>
            <li>
              <span v-for="category in product?.expand?.categories">
                <NuxtLink :to="`/l/${location?.slug}?category=${category.id}`">
                  {{ category.name_de }}
                </NuxtLink>
              </span>
            </li>
          </ul>
          <h3></h3>
        </header>

        <div class="info-header">
          <h1 data-testid="product-page-h1">{{ product?.name }}</h1>
          <AvailabilityBadge :available="available" />
        </div>

        <div class="info-body">
          <!-- Description -->
          <div v-html="product?.description"></div>
          <!-- Deposit -->
          <p v-if="product?.deposit">
            <strong>{{ t("deposit") }}</strong>
            <br />
            {{ formatCurrency(product.deposit, locale) }}
          </p>
        </div>

        <div v-if="userStore.isAdmin" class="info-admin">
          <h2 class="h4">
            {{ t("admin_notes") }}
            <Tooltip :html="t('admin_notes_tooltip')">
              <Lock />
            </Tooltip>
          </h2>
          <span v-if="product?.notes" v-html="product?.notes" />
          <span v-else>
            <i>{{ t("admin_notes_none") }}</i>
          </span>
        </div>

        <ReservationsBox
          :title="t('reservations')"
          :reservations="reservations"
          class="upcoming-reservations"
        />

        <Button
          size="lg"
          data-testid="reserve-button"
          @click.prevent="onReserve"
        >
          {{ t("reserve_button") }}
        </Button>

        <Dialog v-model:open="showDialog" inset :title="t('reserve')">
          <div class="dialog">
            <!-- Opening hours -->
            <p
              v-if="location?.opening_hours"
              class="opening-hours"
              data-testid="opening-hours"
            >
              <span>{{ t("opening_hours_of") }} {{ location?.name }}:</span>
              <br />
              <span
                v-html="openingHoursToString(location?.opening_hours)"
              ></span>
            </p>
            <form ref="form" @submit.prevent="onSubmit">
              <Input
                type="text"
                :label="t('product')"
                v-model="product.name"
                disabled
                readonly
              />
              <DateInput
                :label="t('start')"
                v-model="start"
                :is-date-disallowed="isDateDisallowed"
                :show-outside-days="false"
                data-testid="start-input"
              />
              <DateInput
                :label="t('end')"
                v-model="end"
                :is-date-disallowed="isDateDisallowed"
                :show-outside-days="false"
                data-testid="end-input"
              />
              <Textarea :label="t('message')" v-model="message" />

              <Alert
                v-if="reservationCreationError"
                variant="error"
                data-testid="reservation-form-error"
                class="alert"
              >
                {{ reservationCreationError }}
              </Alert>

              <Button
                :loading="isSubmittingReservation"
                size="lg"
                type="submit"
                data-testid="reserve-submit"
              >
                {{ t("reserve_now_button") }}
              </Button>
            </form>
          </div>
        </Dialog>
      </div>
    </section>
  </Container>
</template>

<script setup>
import Button from "@/components/Button.vue";
import { isToday } from "~/lib/reservation";
import { formatCurrency } from "~/lib/currency";
import { isInOpeningHoursDay, openingHoursToString } from "~/lib/openingHours";
import {
  getStartOfDay,
  startOfDate as getStartOfDate,
  isSameDate,
} from "~/lib/date";
import { Lock } from "@iconoir/vue";

if (process.client) {
  await import("@shoelace-style/shoelace/dist/components/alert/alert.js");
}

const { t } = useI18n({
  useScope: "local",
});
const { pb } = usePocketbase();
const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { locale } = useI18n();

const showDialog = ref(false);
const form = ref(null);
const imageIndex = ref(0);

const reservationCreationError = ref(null);

// Fields
const start = ref(null);
const end = ref(null);
const message = ref(null);

userStore.clearAuthenticationIntent();

const { data: location } = await useAsyncData("location", async () => {
  const location = await pb
    .collection("public_locations")
    .getFirstListItem(
      pb.filter("slug = {:slug}", { slug: route.params.location })
    );
  return structuredClone(location);
});

const { data: product } = await useAsyncData("product", async () => {
  const product = await pb
    .collection(userStore.isAdmin ? "products" : "public_products")
    .getOne(route.params.product, {
      expand: "categories",
    });
  return structuredClone(product);
});

// Also get product description converted to plain-text,
// to be used in meta-tags
const { data: excerpt } = await useAsyncData("product-excerpt", async () => {
  const product = await pb
    .collection(userStore.isAdmin ? "products" : "public_products")
    .getOne(route.params.product, {
      fields: "description:excerpt(200,true)",
    });
  return structuredClone(product);
});

const { data: reservations, refresh: refreshReservations } = await useAsyncData(
  "reservations",
  async () => {
    const reservations = await pb
      .collection("public_reservations")
      .getFullList({
        filter: pb.filter("product = {:product} && end >= @todayStart", {
          product: product.value.id,
        }),
        sort: "start",
      });
    return structuredClone(reservations);
  }
);

const available = computed(() =>
  reservations.value && reservations.value.length > 0
    ? reservations.value?.filter((r) => isToday(r)).length === 0
    : true
);

useHead({
  title: `${product.value?.name} | ${location.value?.name}`,
  meta: [
    excerpt.value?.description
      ? {
          name: "description",
          content: excerpt.value?.description,
        }
      : null,
    {
      property: "og:title",
      content: product.value?.name,
    },
    excerpt.value?.description
      ? {
          property: "og:description",
          content: excerpt.value?.description,
        }
      : null,
    product.value?.images && product.value?.images.length > 0
      ? {
          property: "og:image",
          content: `${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.value.id}/${product.value.images[0]}${thumbs.lg}`,
        }
      : null,
  ].filter((m) => !!m),
});

const startOfToday = getStartOfDay();
const closedDates = (location.value?.opening_hours?.except?.dates || []).map(
  (d) => getStartOfDate(new Date(d))
);
function isDateDisallowed(date) {
  const startOfDate = getStartOfDate(date);
  // Is on an open day according to opening hours
  const isOpenDay = location.value?.opening_hours
    ? isInOpeningHoursDay(location.value.opening_hours, date)
    : true;
  // Is in the past
  const isInPast = startOfDate < startOfToday;
  // Is on a closed date (opening hours exception)
  const isClosedDate = !!closedDates.find((date) =>
    isSameDate(date, startOfDate)
  );
  return !isOpenDay || isInPast || isClosedDate;
}

function onReserve() {
  if (!pb.authStore.isValid) {
    userStore.setAuthenticationIntent(
      "reservation",
      `/l/${location.value.slug}/p/${product.value.id}`
    );
    router.push("/signup");
    return;
  }
  showDialog.value = true;
}

const isSubmittingReservation = ref(false);
async function onSubmit() {
  reservationCreationError.value = null;
  isSubmittingReservation.value = true;
  try {
    const reservation = await pb.collection("reservations").create({
      user: pb.authStore.record.id,
      product: product.value.id,
      start: start.value,
      end: end.value,
      message: message.value,
      send_confirmation: true,
    });
  } catch (e) {
    isSubmittingReservation.value = false;
    if (e.status === 400 && e.message) {
      switch (e.message) {
        case "Has_open_reservation.":
          reservationCreationError.value = t("errors.has_open_reservation", {
            email: location.value.email,
          });
          break;
        case "Date_range_too_long.":
          reservationCreationError.value = t("errors.date_range_too_long", {
            days: location.max_reservation_days || 14,
            email: location.value.email,
          });
          break;
        case "Overlapping_reservation.":
          reservationCreationError.value = t("errors.overlapping_reservation");
          break;
        case "Start_before_today.":
          reservationCreationError.value = t("errors.start_before_today");
          break;
        case "End_before_today.":
          reservationCreationError.value = t("errors.end_before_today");
          break;
        case "Start_and_end_equal.":
          reservationCreationError.value = t("errors.start_and_end_equal");
          break;
        case "End_before_start.":
          reservationCreationError.value = t("errors.end_before_start");
          break;
      }
      if (!reservationCreationError.value) {
        reservationCreationError.value = t("errors.general");
      }
      return;
    }
  }

  await userStore.fetchUserReservations();
  refreshReservations();

  showDialog.value = false;
  isSubmittingReservation.value = false;
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

section {
  margin-bottom: var(--fluid-spacing-8);
}
.header {
  max-width: var(--max-text-width);
  h1 {
    line-height: 1.15;
  }
}
.breadcrumb {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  margin-bottom: var(--fluid-spacing-4);
  & > li:not(:last-child)::after {
    content: ">";
    margin-left: 0.5rem;
    color: var(--text-color-light);
  }
  li > span:not(:last-child)::after {
    content: ", ";
  }
  a {
    color: var(--text-color);
  }
}
.product {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fluid-spacing-8);
  & > * {
    width: 100%;
  }
  .media-col {
    max-width: 500px;
    .main-image {
      margin-bottom: var(--fluid-spacing-4);
    }
    .thumbnails {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: var(--fluid-spacing-4);
      button {
        border-radius: var(--border-radius);
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.15);
        border: 0;
        cursor: pointer;
        padding: 0;
        aspect-ratio: 1/1;
        display: flex;
        img {
          object-fit: cover;
          object-position: center;
          width: 100%;
        }
        &.active {
          box-shadow: 0 0 0 2px white;
          opacity: 0.8;
        }
        &:focus,
        &:active,
        &:hover {
          box-shadow: 0 0 0 2px var(--primary-color);
          outline: 0;
          border: 0;
        }
      }
    }
  }
  .info-col {
    flex-grow: 1;
    .info-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--fluid-spacing-4);
      margin-bottom: var(--fluid-spacing-4);
      h1 {
        margin: 0;
        margin-bottom: -5px;
      }
      @media screen and (min-width: breakpoints.$breakpoint-md) {
        flex-direction: row;
        align-items: center;
        h1 {
          margin: 0;
        }
      }
    }
    h2,
    h3 {
      margin: 0;
    }
    .info-body {
      margin-bottom: var(--fluid-spacing-8);
    }
    .info-admin {
      background-color: var(--surface-info-color);
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: var(--fluid-spacing-8);
      h2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
        :deep(svg) {
          width: 1.2em;
          height: 1.2em;
        }
      }
      :deep(p) {
        margin-bottom: 0.5rem;
      }
      :deep(p:last-child) {
        margin: 0;
      }
    }
    .upcoming-reservations {
      margin-bottom: 2rem;
    }
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    .media-col {
      width: calc(40% - (var(--fluid-spacing-8) / 2) - 1px);
    }
    .info-col {
      width: calc(60% - (var(--fluid-spacing-8) / 2) - 1px);
    }
  }
  @media screen and (min-width: breakpoints.$breakpoint-md) {
    .media-col,
    .info-col {
      width: calc(50% - (var(--fluid-spacing-8) / 2) - 1px);
    }
  }
}
.dialog form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dialog .alert {
  margin: 0;
}
.opening-hours {
  padding: 1rem;
  background-color: #ecf4fe;
  border-radius: var(--border-radius);
}
</style>

<i18n lang="json">
{
  "en": {
    "deposit": "Deposit",
    "admin_notes": "Admin notes",
    "admin_notes_none": "None",
    "admin_notes_tooltip": "Only visible for admin users",
    "reservations": "Reservations",
    "reserve_button": "Reserve",
    "reserve": "Reserve",
    "opening_hours_of": "Opening hours of",
    "product": "Product",
    "start": "Start",
    "end": "End",
    "message": "Message",
    "reserve_now_button": "Reserve now",
    "errors": {
      "has_open_reservation": "You have an open reservation for this product. Reach out on {email} to extend or change your reservation.",
      "date_range_too_long": "Products can't be reserved for longer than {days} days. Reach out on {email} to discuss a longer period.",
      "overlapping_reservation": "The product is already reserved for this period.",
      "start_before_today": "The start of the reservation is before today.",
      "end_before_today": "The end of the reservation is before today.",
      "start_and_end_equal": "The start and end of the reservation can't be on the same day.",
      "end_before_start": "The end can't be befor the start of the reservation.",
      "general": "Something went wrong while creating the reservation, please try again."
    }
  },
  "de": {
    "deposit": "Pfand",
    "admin_notes": "Admin Notiz",
    "admin_notes_none": "Keine",
    "admin_notes_tooltip": "Nur sichtbar für Admin-Benutzer",
    "reservations": "Reservierungen",
    "reserve_button": "Reservieren",
    "reserve": "Reservieren",
    "opening_hours_of": "Öffnungszeiten von",
    "product": "Gegenstand",
    "start": "Start",
    "end": "Ende",
    "message": "Nachricht",
    "reserve_now_button": "Jetzt reservieren",
    "errors": {
      "has_open_reservation": "Du hast diesen Gegenstand bereits reserviert. Wenn du deine Reservierung verlängern oder ändern möchtest, schreibe eine Mail an {email}.",
      "date_range_too_long": "Produkte können nicht länger als {days} Tage reserviert werden. Kontaktiere uns unter {email}, um einen längeren Zeitraum zu besprechen.",
      "overlapping_reservation": "Das Produkt ist für diesen Termin bereits reserviert.",
      "start_before_today": "Der Beginn der Reservierung liegt vor dem heutigen Tag.",
      "end_before_today": "Das Enddatum der Reservierung liegt vor dem heutigen Tag.",
      "start_and_end_equal": "Beginn und Ende der Reservierung dürfen nicht am selben Tag liegen.",
      "end_before_start": "Ende kann nicht vor Beginn der Reservierung liegen.",
      "general": "Beim Erstellen deiner Reservierung ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
