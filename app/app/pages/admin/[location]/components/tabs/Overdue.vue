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
import type { EventHookOn } from "@vueuse/core";
import type { RecordModel } from "pocketbase";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import TabHeader from "../TabHeader.vue";
import type { Reservation } from "~/models/reservation";

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
} = await useAsyncData(
  "admin_overdue_reservations",
  async () => {
    const reservations = await getOverdueReservations(props.location.id);
    return structuredClone(reservations) as Reservation[];
  },
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
