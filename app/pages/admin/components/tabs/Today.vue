<template>
  <TabHeader fixed-width>
    <template #prefix>
      <button class="change-date-button" @click="handleDayBackward">
        <ArrowLeft class="icon" />
      </button>
    </template>
    <div class="title-wrapper">
      <h3>
        <LoadingSpinner v-if="status === 'pending'" style="--size: 1em" />
        <span v-else>
          {{
            isToday(date) ? t("Today") : formatDate(date, "ddd, DD.MM", locale)
          }}
        </span>
      </h3>
    </div>
    <template #suffix>
      <button class="change-date-button" @click="handleDayForward">
        <ArrowRight class="icon" />
      </button>
    </template>
  </TabHeader>
  <AdminReservationTable
    v-if="
      status !== 'pending' &&
      todaysReservations &&
      todaysReservations.length > 0
    "
    :reservations="todaysReservations"
    :date="date"
    highlight-date="date"
    :show-warning="(r) => new Date(r.end) < startOfUTCDate(date)"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else-if="status !== 'pending'">
    <i>
      {{
        t("no_reservations_on_date", {
          date: isToday(date)
            ? t("today")
            : t("on") + " " + formatDate(date, "DD.MM", locale),
        })
      }}.
    </i>
  </p>
</template>

<script lang="ts" setup>
import AdminReservationTable from "~/components/admin/AdminReservationsTable.vue";
import { isToday, startOfUTCDate, endOfUTCDate, formatDate } from "~/lib/date";
import { ArrowRight, ArrowLeft } from "@iconoir/vue";
import TabHeader from "../TabHeader.vue";
import type { Reservation } from "~/models/reservation";
import type { RecordModel } from "pocketbase";
import type { EventHookOn } from "@vueuse/core";

const { pb } = usePocketbase();
const { locale } = useI18n();
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

const date = ref(new Date(Date.now()));

const {
  data: todaysReservations,
  refresh,
  status,
} = await useAsyncData(
  "admin_todays_reservations",
  async () => {
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter(
        "location = {:location} && ((start >= {:dateStart} && start <= {:dateEnd}) || (end >= {:dateStart} && end <= {:dateEnd}))",
        {
          location: props.location.id,
          dateStart: startOfUTCDate(date.value),
          dateEnd: endOfUTCDate(date.value),
        }
      ),
      sort: "start",
      expand: "product,user",
      requestKey: "admin_todays_reservations",
    });
    return structuredClone(reservations) as Reservation[];
  },
  { lazy: true }
);

function handleDayBackward() {
  date.value.setDate(date.value.getDate() - 1);
  refresh();
}

function handleDayForward() {
  date.value.setDate(date.value.getDate() + 1);
  refresh();
}
</script>

<style scoped>
.title-wrapper {
  min-width: 10rem;
  display: flex;
  justify-content: center;
}
h3 {
  text-align: center;
  margin: 0;
}
.change-date-button {
  background-color: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  .icon {
    width: 1em;
    height: 1em;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "today": "today",
    "Today": "Today",
    "no_reservations_on_date": "No reservations starting or ending {date}",
    "on": "at"
  },
  "de": {
    "today": "heute",
    "Today": "Heute",
    "no_reservations_on_date": "Es gibt keine Reservierungen, die {date} starten oder enden",
    "on": "am"
  }
}
</i18n>
