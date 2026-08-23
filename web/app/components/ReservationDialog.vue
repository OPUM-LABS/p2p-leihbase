<template>
  <Dialog v-model:open="isOpen" inset :title="t('reservations.dialog.request_to_borrow')">
    <div class="dialog">
      <!-- Opening hours (only if tied to a physical location) -->
      <p
        v-if="location?.opening_hours"
        class="opening-hours"
        data-testid="opening-hours"
      >
        <span>{{ t('reservations.dialog.opening_hours_of') }} {{ location?.name }}:</span>
        <br />
        <span
          v-html="openingHoursToString(location?.opening_hours, locale)"
        ></span>
      </p>

      <form v-if="product" @submit.prevent="onSubmit">
        <Input
          type="text"
          :label="t('reservations.dialog.product')"
          :model-value="product.name"
          required
          disabled
          readonly
        />
        <DateInput
          :label="t('reservations.dialog.start')"
          :key="`start-date-${product?.id}-${existingReservations.length}`"
          v-model="start"
          :is-date-disallowed="isStartDateDisallowed"
          :show-outside-days="false"
          :description="startDateDescription"
          data-testid="start-input"
          required
        />
        <DateInput
          :label="t('reservations.dialog.end')"
          :key="`end-date-${product?.id}-${existingReservations.length}`"
          :popout-key="`end-date-popout-${start?.getTime()}`"
          v-model="end"
          :is-date-disallowed="isEndDateDisallowed"
          :show-outside-days="false"
          :description="endDateDescription"
          data-testid="end-input"
          required
        />
        <Textarea
          :label="t('reservations.dialog.message')"
          v-model="message"
          :placeholder="t('reservations.dialog.message_placeholder')"
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
          {{ t('reservations.dialog.send_request_button') }}
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
  formatDateToYMD,
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
const { t, locale } = useI18n();
const nuxtApp = useNuxtApp();
const userStore = useUserStore();
const router = useRouter();

const { isOpen, product, location } = useReservationDialog();

// Fields
const start = ref<Date>();
const end = ref<Date>();
const message = ref<string>("");

const existingReservations = ref<Array<{ start: string | Date; end: string | Date }>>([]);
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
  return `${location.value?.name} ${t("reservations.dialog.allows_reserving_days_in_future", { days: reservationStartLimit.value })}`;
});

const endDateDescription = computed(() => {
  if (maxReservationDays.value <= 0) {
    return undefined;
  }
  return t("reservations.dialog.allows_reservations_up_to_days", { days: maxReservationDays.value });
});

async function fetchExistingReservations() {
  if (!product.value?.id) {
    existingReservations.value = [];
    return;
  }
  try {
    const list = await pb.collection("public_reservations").getFullList({
      filter: pb.filter("product = {:product} && end >= @todayStart", {
        product: product.value.id,
      }),
      sort: "start",
    });
    existingReservations.value = list as any;
  } catch (err) {
    try {
      const list = await pb.collection("reservations").getFullList({
        filter: pb.filter(
          "product = {:product} && end >= @todayStart && cancelled != true && status != 'cancelled' && status != 'declined' && ended != true && status != 'ended'",
          { product: product.value.id }
        ),
        sort: "start",
      });
      existingReservations.value = list as any;
    } catch (e) {
      existingReservations.value = [];
    }
  }
}

watch([isOpen, product], ([open, prod]) => {
  if (open && prod?.id) {
    fetchExistingReservations();
  }
});

watch(isOpen, (newValue) => {
  if (!newValue) {
    start.value = undefined;
    end.value = undefined;
    message.value = "";
    reservationCreationError.value = undefined;
  }
});

watch(start, (newStart) => {
  if (newStart && end.value) {
    const isInvalid =
      getStartOfDate(end.value) <= getStartOfDate(newStart) ||
      hasReservationBetween(newStart, end.value, existingReservations.value);
    if (isInvalid) {
      end.value = undefined;
    }
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

function isReservedDate(
  date: Date,
  reservations: Array<{ start: string | Date; end: string | Date }>
): boolean {
  const targetStr = formatDateToYMD(date);
  if (!targetStr) return false;
  return reservations.some((res) => {
    const sStr = formatDateToYMD(res.start);
    const eStr = formatDateToYMD(res.end);
    return targetStr >= sStr && targetStr <= eStr;
  });
}

function hasReservationBetween(
  startDate: Date,
  endDate: Date,
  reservations: Array<{ start: string | Date; end: string | Date }>
): boolean {
  const sStr = formatDateToYMD(startDate);
  const eStr = formatDateToYMD(endDate);
  if (!sStr || !eStr) return false;
  return reservations.some((res) => {
    const resStartStr = formatDateToYMD(res.start);
    const resEndStr = formatDateToYMD(res.end);
    return sStr <= resEndStr && eStr >= resStartStr;
  });
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
  const isReserved = isReservedDate(date, existingReservations.value);
  return !isOpen || isPast || isClosed || isBeyondLimit || isReserved;
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
  const isReserved = isReservedDate(date, existingReservations.value);
  const hasOverlap = start.value
    ? hasReservationBetween(start.value, date, existingReservations.value)
    : false;
  return (
    !isOpen ||
    isPast ||
    isBeforeStart ||
    isClosed ||
    isBeyondMax ||
    isReserved ||
    hasOverlap
  );
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

  if (start.value && end.value && hasReservationBetween(start.value, end.value, existingReservations.value)) {
    reservationCreationError.value = t("reservations.dialog.errors.overlapping_reservation");
    return;
  }

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
          reservationCreationError.value = t("reservations.dialog.errors.user_not_verified");
          break;
        case "Cannot_rent_own_product.":
          reservationCreationError.value = t("reservations.dialog.errors.cannot_rent_own_product");
          break;
        case "Product_has_open_reservation.":
          reservationCreationError.value = t("reservations.dialog.errors.product_has_open_reservation");
          break;
        case "User_has_open_reservation.":
          reservationCreationError.value = t("reservations.dialog.errors.user_has_open_reservation");
          break;
        case "Date_range_too_long.":
          reservationCreationError.value = t("reservations.dialog.errors.date_range_too_long", {
            days: maxReservationDays.value,
          });
          break;
        case "Overlapping_reservation.":
          reservationCreationError.value = t("reservations.dialog.errors.overlapping_reservation");
          break;
        case "Start_before_today.":
          reservationCreationError.value = t("reservations.dialog.errors.start_before_today");
          break;
        case "End_before_today.":
          reservationCreationError.value = t("reservations.dialog.errors.end_before_today");
          break;
        case "Start_and_end_equal.":
          reservationCreationError.value = t("reservations.dialog.errors.start_and_end_equal");
          break;
        case "End_before_start.":
          reservationCreationError.value = t("reservations.dialog.errors.end_before_start");
          break;
        default:
          reservationCreationError.value = e.message || t("reservations.dialog.errors.general");
      }
    } else {
      reservationCreationError.value = t("reservations.dialog.errors.general");
    }
  }

  if (!reservation) {
    return;
  }

  await userStore.fetchUserReservations();
  nuxtApp.callHook("app:user:reservation:create", reservation);
  isSubmittingReservation.value = false;
  isOpen.value = false;
  router.push({
    path: "/reservations",
    query: {
      open: reservation.id,
      highlightTime: "true",
    },
  });
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
