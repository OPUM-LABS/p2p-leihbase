<template>
  <Dialog v-model:open="isOpen" inset :title="t('request_to_borrow')">
    <div class="dialog">
      <!-- Opening hours (only if tied to a physical location) -->
      <p
        v-if="location?.opening_hours"
        class="opening-hours"
        data-testid="opening-hours"
      >
        <span>{{ t("opening_hours_of") }} {{ location?.name }}:</span>
        <br />
        <span
          v-html="openingHoursToString(location?.opening_hours, locale)"
        ></span>
      </p>

      <form v-if="product" @submit.prevent="onSubmit">
        <Input
          type="text"
          :label="t('product')"
          :model-value="product.name"
          required
          disabled
          readonly
        />
        <DateInput
          :label="t('start')"
          :key="`start-date-${product?.id}`"
          v-model="start"
          :is-date-disallowed="isStartDateDisallowed"
          :show-outside-days="false"
          :description="startDateDescription"
          data-testid="start-input"
          required
        />
        <DateInput
          :label="t('end')"
          :key="`end-date-${product?.id}`"
          :popout-key="`end-date-popout-${start?.getTime()}`"
          v-model="end"
          :is-date-disallowed="isEndDateDisallowed"
          :show-outside-days="false"
          :description="endDateDescription"
          data-testid="end-input"
          required
        />
        <Textarea
          :label="t('message')"
          v-model="message"
          :placeholder="t('message_placeholder')"
        />

        <Alert
          v-if="reservationCreationError"
          variant="danger"
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
          {{ t("send_request_button") }}
        </Button>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { isInOpeningHoursDay } from "@@/lib/openingHours";
import type { OpeningHours } from "@@/lib/openingHours";
import {
  addDays,
  startOfDate as getStartOfDate,
  getStartOfDay,
  isSameDate,
} from "~~/lib/date.js";
import { openingHoursToString } from "~~/lib/openingHours.js";
import type { Reservation } from "~~/models/reservation.js";
import { ClientResponseError } from "pocketbase";
import Alert from "./core/Alert.vue";
import Button from "./core/Button.vue";
import DateInput from "./core/DateInput.vue";
import Dialog from "./core/Dialog.vue";
import Input from "./core/Input.vue";
import Textarea from "./core/Textarea.vue";

const { pb, user } = usePocketbase();
const { t, locale } = useI18n({ useScope: "local" });
const nuxtApp = useNuxtApp();
const userStore = useUserStore();
const router = useRouter();

const { isOpen, product, location } = useReservationDialog();

// Fields
const start = ref<Date>();
const end = ref<Date>();
const message = ref<string>("");

const reservationCreationError = ref<string>();
const isSubmittingReservation = ref(false);

const startOfToday = getStartOfDay();
const closedDates = computed(() =>
  (location.value?.opening_hours?.except?.dates || []).map((d) =>
    getStartOfDate(new Date(d))
  )
);

const maxReservationDays = computed(() => {
  if (product.value?.max_duration_days) {
    return product.value.max_duration_days;
  }
  return location.value?.max_reservation_days || 30;
});

const reservationStartLimit = computed(
  () => location.value?.reservation_start_limit || 0
);

const startDateDescription = computed(() => {
  if (reservationStartLimit.value <= 0) {
    return undefined;
  }
  return `${location.value?.name} ${t("allows_reserving_days_in_future", { days: reservationStartLimit.value })}`;
});

const endDateDescription = computed(() => {
  if (maxReservationDays.value <= 0) {
    return undefined;
  }
  return t("allows_reservations_up_to_days", { days: maxReservationDays.value });
});

watch(isOpen, (newValue) => {
  if (!newValue) {
    start.value = undefined;
    end.value = undefined;
    message.value = "";
    reservationCreationError.value = undefined;
  }
});

function isPastDate(startOfDate: Date, today: Date) {
  return startOfDate < today;
}

function isClosedDate(startOfDate: Date, closedDatesList: Date[]) {
  return closedDatesList.some((date) => isSameDate(date, startOfDate));
}

function isBeyondStartLimit(startOfDate: Date, limit: number, today: Date) {
  if (limit <= 0) return false;
  const limitDate = addDays(today, limit);
  return startOfDate > limitDate;
}

function isBeyondMaxDuration(
  date: Date,
  startDate: Date | undefined,
  limit: number
) {
  if (limit <= 0 || !startDate) return false;
  const maxEndDate = addDays(getStartOfDate(startDate), limit);
  return date > maxEndDate;
}

function isOpenDay(date: Date, openingHours: OpeningHours | undefined) {
  return openingHours ? isInOpeningHoursDay(openingHours, date) : true;
}

function isStartDateDisallowed(date: Date): boolean {
  const startOfDate = getStartOfDate(date);
  const isOpen = isOpenDay(date, location.value?.opening_hours);
  const isPast = isPastDate(startOfDate, startOfToday);
  const isClosed = isClosedDate(startOfDate, closedDates.value);
  const isBeyondLimit = isBeyondStartLimit(
    startOfDate,
    reservationStartLimit.value,
    startOfToday
  );
  return !isOpen || isPast || isClosed || isBeyondLimit;
}

function isEndDateDisallowed(date: Date): boolean {
  const startOfDate = getStartOfDate(date);
  const isBeforeStart =
    start.value && startOfDate <= getStartOfDate(start.value);
  const isOpen = isOpenDay(date, location.value?.opening_hours);
  const isPast = isPastDate(startOfDate, startOfToday);
  const isClosed = isClosedDate(startOfDate, closedDates.value);
  const isBeyondMax = isBeyondMaxDuration(
    startOfDate,
    start.value,
    maxReservationDays.value
  );
  return !isOpen || isPast || isBeforeStart || isClosed || isBeyondMax;
}

async function onSubmit() {
  if (!product.value) {
    console.error("Can't create reservation, no product defined");
    return;
  }
  if (!user.value?.id) {
    console.error("Can't create reservation, no user id defined");
    return;
  }

  reservationCreationError.value = undefined;
  isSubmittingReservation.value = true;
  let reservation;
  try {
    const payload: any = {
      user: user.value.id,
      product: product.value.id,
      start: start.value,
      end: end.value,
      message: message.value,
      status: "requested",
      send_confirmation: true,
    };
    if (location.value?.id) {
      payload.location = location.value.id;
    }

    reservation = (await pb.collection("reservations").create(payload)) as Reservation;
  } catch (e) {
    isSubmittingReservation.value = false;
    if (e instanceof ClientResponseError && e.status === 400 && e.message) {
      switch (e.message) {
        case "User_not_verified.":
          reservationCreationError.value = t("errors.user_not_verified");
          break;
        case "Cannot_rent_own_product.":
          reservationCreationError.value = t("errors.cannot_rent_own_product");
          break;
        case "Product_has_open_reservation.":
          reservationCreationError.value = t("errors.product_has_open_reservation");
          break;
        case "User_has_open_reservation.":
          reservationCreationError.value = t("errors.user_has_open_reservation");
          break;
        case "Date_range_too_long.":
          reservationCreationError.value = t("errors.date_range_too_long", {
            days: maxReservationDays.value,
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
        default:
          reservationCreationError.value = e.message || t("errors.general");
      }
    } else {
      reservationCreationError.value = t("errors.general");
    }
  }

  if (!reservation) {
    return;
  }

  await userStore.fetchUserReservations();
  nuxtApp.callHook("app:user:reservation:create", reservation);
  isSubmittingReservation.value = false;
  isOpen.value = false;
  router.push("/reservations");
}
</script>

<style scoped>
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
  margin-bottom: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "request_to_borrow": "Request to Borrow",
    "opening_hours_of": "Opening hours of",
    "product": "Product",
    "start": "Pickup Date",
    "end": "Return Date",
    "message": "Note to Lender (Optional)",
    "message_placeholder": "Introduce yourself or coordinate flexible pickup times...",
    "send_request_button": "Send Borrow Request",
    "allows_reserving_days_in_future": "allows reserving {days} days in the future.",
    "allows_reservations_up_to_days": "Max rental duration: {days} days.",
    "errors": {
      "user_not_verified": "Please verify your email address before requesting.",
      "cannot_rent_own_product": "You cannot borrow your own listed item.",
      "product_has_open_reservation": "This item is currently not available for these dates.",
      "user_has_open_reservation": "You already have an active request for this item.",
      "date_range_too_long": "This item cannot be borrowed for longer than {days} days.",
      "overlapping_reservation": "The item is already booked for this timeframe.",
      "start_before_today": "The pickup date cannot be in the past.",
      "end_before_today": "The return date cannot be in the past.",
      "start_and_end_equal": "Pickup and return date cannot be the same.",
      "end_before_start": "Return date must be after pickup date.",
      "general": "Something went wrong sending your request. Please try again."
    }
  },
  "de": {
    "request_to_borrow": "Ausleihe anfragen",
    "opening_hours_of": "Öffnungszeiten von",
    "product": "Gegenstand",
    "start": "Abholdatum",
    "end": "Rückgabedatum",
    "message": "Nachricht an den Verleiher (Optional)",
    "message_placeholder": "Stelle dich kurz vor oder vereinbare Abholzeiten...",
    "send_request_button": "Ausleihanfrage absenden",
    "allows_reserving_days_in_future": "erlaubt Reservierungen bis zu {days} Tage im Voraus.",
    "allows_reservations_up_to_days": "Maximale Leihdauer: {days} Tage.",
    "errors": {
      "user_not_verified": "Bitte bestätige deine E-Mail-Adresse, bevor du anfragst.",
      "cannot_rent_own_product": "Du kannst deinen eigenen Gegenstand nicht ausleihen.",
      "product_has_open_reservation": "Dieser Gegenstand ist für diesen Zeitraum nicht verfügbar.",
      "user_has_open_reservation": "Du hast bereits eine Anfrage für diesen Gegenstand offen.",
      "date_range_too_long": "Dieser Gegenstand kann maximal {days} Tage geliehen werden.",
      "overlapping_reservation": "Der Gegenstand ist in diesem Zeitraum bereits belegt.",
      "start_before_today": "Das Abholdatum darf nicht in der Vergangenheit liegen.",
      "end_before_today": "Das Rückgabedatum darf nicht in der Vergangenheit liegen.",
      "start_and_end_equal": "Abholung und Rückgabe dürfen nicht am selben Tag sein.",
      "end_before_start": "Das Rückgabedatum muss nach dem Abholdatum liegen.",
      "general": "Beim Absenden deiner Anfrage ist ein Fehler aufgetreten."
    }
  }
}
</i18n>
