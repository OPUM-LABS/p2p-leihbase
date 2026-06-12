<template>
  <TabHeader :title="t('title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="reservations && reservations.length > 0"
    :reservations="reservations"
    highlight-date="overdue"
    :show-warning="() => true"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_reservations") }}
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

const { getOverdueReservations } = useReservations();

const {
  data: reservations,
  refresh,
  status,
} = await useAsyncData<Reservation[]>(
  "admin_overdue_reservations",
  () => getOverdueReservations(props.location.id),
  { lazy: true }
);
</script>

<i18n lang="json">
{
  "en": {
    "title": "Overdue reservations",
    "no_reservations": "No overdue reservations..."
  },
  "de": {
    "title": "Überfälligen Reservierungen",
    "no_reservations": "Keine überfälligen Reservierungen..."
  }
}
</i18n>
