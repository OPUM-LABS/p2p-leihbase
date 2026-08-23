<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav :location="location" />
    <AdminHeader :title="t('admin.location.title')" :location="location">
      <Button @click="handleNewReservationClick">
        {{ t('admin.location.new_reservation') }}
      </Button>
    </AdminHeader>

    <TabList v-if="location" active="today" class="tablist">
      <Tab
        v-if="overdueReservations.length > 0"
        id="overdue"
        :title="t('admin.location.tab_overdue')"
        :warning="true"
      >
        <section>
          <OverdueTab
            :location="location"
            :reservation-update-hook="reservationUpdate.on"
            @select="handleReservationSelect"
          />
        </section>
      </Tab>
      <Tab id="today" :title="t('admin.location.tab_shift')">
        <section>
          <TodayTab
            :location="location"
            :reservation-update-hook="reservationUpdate.on"
            @select="handleReservationSelect"
          />
        </section>
      </Tab>
      <Tab id="ongoing" :title="t('admin.location.tab_ongoing')">
        <section>
          <OngoingTab
            :location="location"
            :reservation-update-hook="reservationUpdate.on"
            @select="handleReservationSelect"
          />
        </section>
      </Tab>
      <Tab id="future" :title="t('admin.location.tab_future')">
        <section>
          <FutureTab
            :location="location"
            :reservation-update-hook="reservationUpdate.on"
            @select="handleReservationSelect"
          />
        </section>
      </Tab>
      <Tab id="past" :title="t('admin.location.tab_past')">
        <section>
          <PastTab
            :location="location"
            :reservation-update-hook="reservationUpdate.on"
            @select="handleReservationSelect"
          />
        </section>
      </Tab>
    </TabList>
  </Container>

  <ReservationDrawer
    v-if="location"
    v-model:open="reservationDrawerOpen"
    :state="selectedReservation ? 'edit' : 'new'"
    :location="location"
    :reservation="selectedReservation"
    @update="handleReservationUpdate"
  />
</template>

<script lang="ts" setup>
import type { Reservation } from "@@/models/reservation";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Tab from "@/components/core/tab-list/Tab.vue";
import TabList from "@/components/core/tab-list/TabList.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { createEventHook } from "@vueuse/core";
import type { RecordModel } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";
import ReservationDrawer from "./components/ReservationDrawer.vue";
import FutureTab from "./components/tabs/Future.vue";
import OngoingTab from "./components/tabs/Ongoing.vue";
import OverdueTab from "./components/tabs/Overdue.vue";
import PastTab from "./components/tabs/Past.vue";
import TodayTab from "./components/tabs/Today.vue";

const route = useRoute();
const { t } = useI18n({
  useScope: "local",
});

const slug = route.params.location;

const reservationDrawerOpen = ref(false);
const selectedReservation = ref<Reservation | null>(null);

const reservationUpdate = createEventHook();

const { getOverdueReservations } = useReservations();

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

const overdueReservations = ref<RecordModel[]>([]);
overdueReservations.value = await getOverdueReservations(location.value?.id);

function handleReservationUpdate() {
  reservationUpdate.trigger();
}

function handleReservationSelect(reservation: Reservation) {
  selectedReservation.value = reservation;
  reservationDrawerOpen.value = true;
}

function handleNewReservationClick() {
  selectedReservation.value = null;
  reservationDrawerOpen.value = true;
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.overdue {
  margin-bottom: var(--fluid-spacing-8);
}
section {
  padding-top: 2rem;
}
@media screen and (max-width: breakpoints.$breakpoint-sm) {
  .tablist :deep(ul.tablist) {
    --spacing-start: var(--fluid-spacing-8);
    --spacing-end: var(--fluid-spacing-8);
    margin-inline: calc(var(--fluid-spacing-8) * -1);
  }
}
</style>
