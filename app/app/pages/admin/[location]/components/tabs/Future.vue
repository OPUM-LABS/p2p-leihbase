<template>
  <TabHeader :title="t('future_title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="futureReservations && futureReservations.length > 0"
    :reservations="futureReservations"
    highlight-date="start"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_future_reservations") }}
    </i>
  </p>
</template>

<script lang="ts" setup>
import type { EventHookOn } from "@vueuse/core";
import type { RecordModel } from "pocketbase";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import TabHeader from "../TabHeader.vue";
import type { Reservation } from "~/models/reservation";

const { pb } = usePocketbase();
const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  location: RecordModel;
  reservationUpdateHook: EventHookOn;
}>();

props.reservationUpdateHook(() => {
  refresh();
});

const emit = defineEmits<{ select: [reservation: Reservation] }>();

const {
  data: futureReservations,
  refresh,
  status,
} = await useAsyncData(
  "admin_future_reservations",
  async () => {
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("location = {:location} && start > @todayEnd", {
        location: props.location.id,
      }),
      sort: "start",
      expand: "product,user",
      requestKey: "admin_future_reservations",
    });
    return structuredClone(reservations) as Reservation[];
  },
  { lazy: true }
);
</script>

<i18n lang="json">
{
  "en": {
    "no_future_reservations": "There are no future reservations.",
    "future_title": "Future reservations"
  },
  "de": {
    "no_future_reservations": "Es gibt keine zukünftige Reservierungen.",
    "future_title": "Anstehende Reservierungen"
  }
}
</i18n>
