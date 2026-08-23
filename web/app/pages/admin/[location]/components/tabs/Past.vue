<template>
  <TabHeader :title="t('admin.tabs.past.past_title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="pastReservations?.items && pastReservations.items.length > 0"
    :reservations="pastReservations.items"
    highlight-date="both"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t('admin.tabs.past.no_past_reservations') }}
    </i>
  </p>
</template>

<script lang="ts" setup>
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import type { EventHookOn } from "@vueuse/core";
import type { ListResult, RecordModel } from "pocketbase";
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
  data: pastReservations,
  refresh,
  status,
} = await useAsyncData<ListResult<Reservation>>(
  "admin_past_reservations",
  () =>
    pb.collection("reservations").getList(0, 50, {
      filter: pb.filter("location = {:location} && end < @todayStart", {
        location: props.location.id,
      }),
      sort: "-end",
      expand: "product,user",
      requestKey: "admin_past_reservations",
    }),
  { lazy: true }
);
</script>
