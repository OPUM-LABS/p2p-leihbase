<template>
  <TabHeader :title="t('admin.tabs.future.future_title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="futureReservations && futureReservations.length > 0"
    :reservations="futureReservations"
    highlight-date="start"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t('admin.tabs.future.no_future_reservations') }}
    </i>
  </p>
</template>

<script lang="ts" setup>
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import type { EventHookOn } from "@vueuse/core";
import type { RecordModel } from "pocketbase";
import TabHeader from "../TabHeader.vue";

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
} = await useAsyncData<Reservation[]>(
  "admin_future_reservations",
  () =>
    pb.collection("reservations").getFullList({
      filter: pb.filter("location = {:location} && start > @todayEnd", {
        location: props.location.id,
      }),
      sort: "start",
      expand: "product,user",
      requestKey: "admin_future_reservations",
    }),
  { lazy: true }
);
</script>
