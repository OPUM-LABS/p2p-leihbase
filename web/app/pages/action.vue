<template>
  <Container width="sm" centered class="py-12">
    <!-- 1. LOADING STATE -->
    <Card v-if="loading" class="lb-stack items-center text-center py-10">
      <div class="animate-spin text-4xl mb-3">⏳</div>
      <Heading is="h2" size="md">
        {{ t('action.processing_title') }}
      </Heading>
      <p class="text-gray-500 text-sm">
        {{ t('action.processing_text') }}
      </p>
    </Card>

    <!-- 2. ERROR / INVALID STATE -->
    <Card v-else-if="error" class="lb-stack">
      <div class="flex items-center gap-3">
        <span class="text-3xl">⚠️</span>
        <div>
          <Heading is="h2" size="md" class="text-red-700">
            {{ t('action.error_title') }}
          </Heading>
          <p class="text-sm text-gray-600 mt-1">
            {{ error }}
          </p>
        </div>
      </div>

      <div class="pt-4 flex gap-3">
        <Button to="/login" variant="primary" class="w-full">
          {{ t('action.to_login') }}
        </Button>
        <Button to="/" variant="secondary" class="w-full">
          {{ t('action.to_home') }}
        </Button>
      </div>
    </Card>

    <!-- 3. SUCCESS / COMPLETED STATE -->
    <Card v-else-if="result" class="lb-stack">
      <!-- Header Banner based on action -->
      <div class="text-center py-2">
        <div class="text-5xl mb-3">
          <span v-if="result.action === 'confirm_slot'">🎉</span>
          <span v-else-if="result.action === 'accept'">✅</span>
          <span v-else-if="result.action === 'decline'">❌</span>
        </div>

        <Heading is="h1" size="lg" class="text-gray-900 font-bold">
          <template v-if="result.action === 'confirm_slot'">
            {{ result.alreadyDone ? t('action.slot_already_confirmed_title') : t('action.slot_confirmed_title') }}
          </template>
          <template v-else-if="result.action === 'accept'">
            {{ result.alreadyDone ? t('action.request_already_accepted_title') : t('action.request_accepted_title') }}
          </template>
          <template v-else-if="result.action === 'decline'">
            {{ result.alreadyDone ? t('action.request_already_declined_title') : t('action.request_declined_title') }}
          </template>
        </Heading>

        <p class="text-sm text-gray-600 mt-2">
          {{ result.message }}
        </p>
      </div>

      <!-- Details Box for Confirmed Timeslot -->
      <div
        v-if="result.action === 'confirm_slot' && result.slot"
        class="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-sm"
      >
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.item') }}:</span>
          <span class="font-bold text-gray-900">{{ result.productName }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.type') }}:</span>
          <span class="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
            {{ result.type === 'return' ? t('action.type_return') : t('action.type_pickup') }}
          </span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.date') }}:</span>
          <span class="font-bold text-gray-900">📅 {{ result.slot.date }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.time') }}:</span>
          <span class="font-bold text-gray-900">⏰ {{ result.slot.startTime }} – {{ result.slot.endTime }} Uhr</span>
        </div>

        <div v-if="result.handoverAddress" class="flex justify-between items-start pt-1">
          <span class="text-gray-500 font-medium">{{ t('action.location') }}:</span>
          <span class="font-medium text-right text-gray-800">{{ result.handoverAddress }}</span>
        </div>
      </div>

      <!-- Details Box for Request Approval / Decline -->
      <div
        v-else-if="result.productName"
        class="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-sm"
      >
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.item') }}:</span>
          <span class="font-bold text-gray-900">{{ result.productName }}</span>
        </div>

        <div v-if="result.borrowerName" class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-500 font-medium">{{ t('action.borrower') }}:</span>
          <span class="font-semibold text-gray-900">{{ result.borrowerName }}</span>
        </div>

        <div v-if="result.startDate && result.endDate" class="flex justify-between items-center">
          <span class="text-gray-500 font-medium">{{ t('action.period') }}:</span>
          <span class="font-semibold text-gray-900">{{ result.startDate }} – {{ result.endDate }}</span>
        </div>
      </div>

      <!-- Calendar Buttons (if confirmed timeslot) -->
      <div v-if="result.action === 'confirm_slot' && result.slot" class="space-y-2 pt-2">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          {{ t('action.calendar_export') }}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            :href="googleCalendarUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <span>📅 Google Kalender</span>
          </a>

          <a
            :href="icsDownloadUrl"
            class="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            <span>📥 Apple / Outlook (.ics)</span>
          </a>
        </div>
      </div>

      <!-- Navigation / Next Steps Buttons -->
      <div class="pt-4 space-y-2">
        <Button
          v-if="result.action === 'confirm_slot'"
          to="/reservations"
          variant="primary"
          class="w-full"
        >
          {{ t('action.to_reservations') }}
        </Button>

        <Button
          v-else-if="result.action === 'accept'"
          to="/profile/requests"
          variant="primary"
          class="w-full"
        >
          {{ t('action.to_requests') }}
        </Button>

        <Button
          v-else
          to="/"
          variant="secondary"
          class="w-full"
        >
          {{ t('action.to_home') }}
        </Button>
      </div>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";

const route = useRoute();
const { pb } = usePocketbase();
const { t } = useI18n();
const { leihbase } = storeToRefs(useLeihbase());

const loading = ref(true);
const result = ref<any>(null);

const token = (route.query.token as string) || "";

onMounted(async () => {
  if (!token) {
    loading.value = false;
    error.value = t("action.errors.missing_token");
    return;
  }

  try {
    const res = await pb.send("/api/leihbase/action", {
      method: "POST",
      body: { token },
    });
    result.value = res;
  } catch (err: any) {
    console.error("[Action Execution Error]", err);
    error.value =
      err?.response?.message ||
      err?.data?.message ||
      t("action.errors.invalid_token");
  } finally {
    loading.value = false;
  }
});

// Calendar link helpers
const googleCalendarUrl = computed(() => {
  if (!result.value?.slot) return "";
  const slot = result.value.slot;
  const isPickup = result.value.type !== "return";
  const typeLabel = isPickup ? "Übergabe" : "Rückgabe";
  const appName = leihbaseStore.appTitle || "Leihbase";
  const title = `${typeLabel}: ${result.value.productName || "Gegenstand"} (${appName})`;
  const desc = `${typeLabel} des Gegenstandes "${result.value.productName || "Gegenstand"}".`;
  const location = result.value.handoverAddress || "";

  const cleanDate = (slot.date || "").replace(/-/g, "").trim();
  const startClean = (slot.startTime || "09:00").replace(/:/g, "").trim().slice(0, 4) + "00";
  const endClean = (slot.endTime || "10:00").replace(/:/g, "").trim().slice(0, 4) + "00";

  const dates = `${cleanDate}T${startClean}/${cleanDate}T${endClean}`;
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  return `${base}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(location)}&dates=${dates}`;
});

const icsDownloadUrl = computed(() => {
  if (!result.value?.slot) return "";
  const slot = result.value.slot;
  const isPickup = result.value.type !== "return";
  const typeLabel = isPickup ? "Übergabetermin" : "Rückgabetermin";
  const title = `${typeLabel} (Leihbase)`;
  const location = result.value.handoverAddress || "";

  return `/api/calendar-invite?id=${result.value.reservationId || Date.now()}&type=${result.value.type || 'pickup'}&date=${encodeURIComponent(slot.date)}&start=${encodeURIComponent(slot.startTime || "09:00")}&end=${encodeURIComponent(slot.endTime || "10:00")}&title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`;
});
</script>

<i18n lang="yaml">
de:
  action:
    processing_title: "Aktion wird ausgeführt..."
    processing_text: "Einen kleinen Moment bitte, deine Anfrage wird verarbeitet."
    error_title: "Aktionslink ungültig oder abgelaufen"
    to_login: "Zum Login"
    to_home: "Zur Startseite"
    to_reservations: "Zu meinen Reservierungen"
    to_requests: "Zu meinen Verleihanfragen"
    slot_confirmed_title: "Termin verbindlich vereinbart!"
    slot_already_confirmed_title: "Termin ist bereits bestätigt"
    request_accepted_title: "Ausleihanfrage angenommen!"
    request_already_accepted_title: "Anfrage bereits angenommen"
    request_declined_title: "Ausleihanfrage abgelehnt"
    request_already_declined_title: "Anfrage bereits abgelehnt"
    item: "Gegenstand"
    type: "Art"
    type_pickup: "Übergabe (Abholung)"
    type_return: "Rückgabe"
    date: "Datum"
    time: "Uhrzeit"
    location: "Ort"
    borrower: "Ausleiher"
    period: "Zeitraum"
    calendar_export: "In Kalender speichern"
    errors:
      missing_token: "Kein Aktionslink oder Token angegeben."
      invalid_token: "Dieser Link ist leider ungültig oder abgelaufen (Gültigkeit: 7 Tage)."

en:
  action:
    processing_title: "Executing action..."
    processing_text: "Just a moment, processing your request."
    error_title: "Action link invalid or expired"
    to_login: "Go to Login"
    to_home: "Back to Home"
    to_reservations: "To My Reservations"
    to_requests: "To My Lending Requests"
    slot_confirmed_title: "Timeslot confirmed!"
    slot_already_confirmed_title: "Timeslot already confirmed"
    request_accepted_title: "Lending request accepted!"
    request_already_accepted_title: "Request already accepted"
    request_declined_title: "Lending request declined"
    request_already_declined_title: "Request already declined"
    item: "Item"
    type: "Type"
    type_pickup: "Handover / Pickup"
    type_return: "Return"
    date: "Date"
    time: "Time"
    location: "Location"
    borrower: "Borrower"
    period: "Period"
    calendar_export: "Save to Calendar"
    errors:
      missing_token: "No action token provided."
      invalid_token: "This link is invalid or expired (validity: 7 days)."
</i18n>

