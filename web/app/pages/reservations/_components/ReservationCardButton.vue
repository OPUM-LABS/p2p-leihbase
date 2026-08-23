<template>
  <Button
    variant="secondary"
    :class="['card', 'status-' + getReservationStatus(reservation)]"
  >
    <img
      :src="getProductImageUrl(reservation.product, product?.images?.[0], thumbs.sm) || ''"
    />
    <div class="details">
      <h2>{{ product?.name }}</h2>
      <p>
        {{ formatDate(reservation.start, DateTime.DATE_MED, locale) }}
        -
        {{ formatDate(reservation.end, DateTime.DATE_MED, locale) }}
      </p>

      <div v-if="timeslotSummary" class="timeslot-pill">
        {{ timeslotSummary }}
      </div>

      <span class="tag">
        {{ t(`reservations.card_button.${getReservationStatus(reservation)}`) }}
      </span>
    </div>
  </Button>
</template>

<script setup lang="ts">
import { formatDate } from "@@/lib/date";
import { getReservationStatus } from "@@/lib/reservation";
import type { Product } from "@@/models/product";
import { type Reservation } from "@@/models/reservation";
import Button from "@/components/core/Button.vue";
import { DateTime } from "luxon";

const config = useRuntimeConfig();

const {
  product: { thumbs },
} = useAppConfig();

const { t, locale } = useI18n();

const props = defineProps<{ reservation: Reservation; product: Product }>();

const formatTimeslotDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map((p) => parseInt(p, 10));
    const d = new Date(year, month - 1, day);
    if (locale.value === "de") {
      return `${day}.${month}.${year}`;
    }
    return d.toLocaleDateString(locale.value || "en-US");
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value === "de" ? "de-DE" : locale.value || "en-US");
};

const timeslotSummary = computed(() => {
  const ts = props.reservation.timeslots;
  if (!ts) return null;

  if (props.reservation.status === "started" && ts.return?.confirmedSlot) {
    const s = ts.return.confirmedSlot;
    const dateFormatted = formatTimeslotDate(s.date);
    const returnLabel = locale.value === "de" ? "Rückgabe" : "Return";
    const uhrLabel = locale.value === "de" ? " Uhr" : "";
    return `🔄 ${returnLabel}: ${dateFormatted}, ${s.startTime}${uhrLabel}`;
  }
  if (ts.pickup?.confirmedSlot) {
    const s = ts.pickup.confirmedSlot;
    const dateFormatted = formatTimeslotDate(s.date);
    const handoverLabel = locale.value === "de" ? "Übergabe" : "Handover";
    const uhrLabel = locale.value === "de" ? " Uhr" : "";
    return `📅 ${handoverLabel}: ${dateFormatted}, ${s.startTime}${uhrLabel}`;
  }
  const pickupCount = ts.pickup?.proposals?.length || 0;
  if (pickupCount > 0 && props.reservation.status !== "started" && props.reservation.status !== "ended") {
    if (locale.value === "de") {
      return `💬 ${pickupCount} Terminvorschlag${pickupCount > 1 ? "e" : ""}`;
    }
    return `💬 ${pickupCount} time proposal${pickupCount > 1 ? "s" : ""}`;
  }
  return null;
});
</script>

<style scoped lang="scss">
.card {
  display: flex;
  padding: 0.5rem !important;
  gap: var(--fluid-spacing-4);
  text-align: left;
  width: 100%;
  align-items: stretch;
  h2 {
    font-weight: var(--font-weight-bold);
    font-size: 1rem;
    margin: 0;
  }
  .timeslot-pill {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #2b8a3e;
    background-color: #ebfbee;
    border: 1px solid #b2f2bb;
    padding: 2px 6px;
    border-radius: 4px;
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
    display: inline-block;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    line-height: 1.2;
    border-radius: 9999px;
    margin-top: auto;
    background: #f1f3f5;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  &.status-requested .tag {
    background: #fff3bf;
    color: #f08c00;
    border-color: #ffe066;
  }

  &.status-accepted .tag {
    background: #d3f9d8;
    color: #2b8a3e;
    border-color: #b2f2bb;
  }

  &.status-started .tag {
    background: #e7f5ff;
    color: #1c7ed6;
    border-color: #a5d8ff;
  }

  &.status-declined .tag,
  &.status-cancelled .tag {
    background: #ffe3e3;
    color: #e03131;
    border-color: #ffc9c9;
  }

  &.status-ended .tag {
    background: #f8f9fa;
    color: #868e96;
    border-color: #e9ecef;
  }

  &.status-overdue .tag {
    background: #ffe3e3;
    color: #c92a2a;
    border-color: #ffa8a8;
    font-weight: bold;
  }
}
</style>
