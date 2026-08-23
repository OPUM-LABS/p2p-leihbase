<template>
  <TabHeader :title="t('admin.tabs.ongoing.ongoing_title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="ongoingReservations && ongoingReservations.length > 0"
    :reservations="ongoingReservations"
    highlight-date="end"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t('admin.tabs.ongoing.no_ongoing_reservations') }}
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

const emit = defineEmits<{ select: [reservation: Reservation] }>();

props.reservationUpdateHook(() => {
  refresh();
});

const {
  data: ongoingReservations,
  refresh,
  status,
} = await useAsyncData<Reservation[]>(
  "admin_ongoing_reservations",
  async () =>
    pb.collection("reservations").getFullList({
      filter: pb.filter(
        "location = {:location} && start < @todayStart && end > @todayEnd",
        {
          location: props.location.id,
        }
      ),
      sort: "end",
      expand: "product,user",
      requestKey: "admin_ongoing_reservations",
    }),
  { lazy: true }
);
</script>
