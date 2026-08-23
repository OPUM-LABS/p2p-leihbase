<template>
  <div class="timeslot-coordinator" :class="{ 'is-highlighted': highlight }">
    <!-- Header / Tab Switcher -->
    <div class="coordinator-header">
      <div class="tab-buttons">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'pickup' }"
          @click="activeTab = 'pickup'"
        >
          <Calendar class="tab-icon" />
          <span>{{ t('timeslot.pickup_tab') }}</span>
          <span v-if="pickupConfirmed" class="confirmed-dot" :title="t('timeslot.agreed_tooltip')">✓</span>
          <span v-else-if="pickupProposalsCount > 0" class="count-badge">{{ pickupProposalsCount }}</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'return' }"
          @click="activeTab = 'return'"
        >
          <Clock class="tab-icon" />
          <span>{{ t('timeslot.return_tab') }}</span>
          <span v-if="returnConfirmed" class="confirmed-dot" :title="t('timeslot.agreed_tooltip')">✓</span>
          <span v-else-if="returnProposalsCount > 0" class="count-badge">{{ returnProposalsCount }}</span>
        </button>
      </div>
    </div>

    <!-- Active Tab Body -->
    <div class="coordinator-body">
      <!-- Role-based Info Guide Banner (when no slot is confirmed yet) -->
      <div v-if="!currentConfirmedSlot" class="info-guide-box">
        <InfoCircle class="guide-icon" />
        <div class="guide-text">
          <strong class="guide-title">{{ t('timeslot.guide_title') }}</strong>
          <p v-if="isOwner" class="guide-p">
            {{ t('timeslot.guide_owner_text') }}
          </p>
          <p v-else class="guide-p">
            {{ t('timeslot.guide_borrower_text') }}
          </p>
        </div>
      </div>

      <!-- Error Alert with friendly message -->
      <Alert v-if="errorMessage" variant="danger" class="mb-3">
        <div class="error-content">
          <WarningTriangle class="alert-icon" />
          <span>{{ errorMessage }}</span>
        </div>
      </Alert>

      <!-- 1. Case: Confirmed Slot -->
      <div v-if="currentConfirmedSlot" class="confirmed-box">
        <div class="confirmed-content">
          <div class="confirmed-icon-wrap">
            <CheckCircle class="confirmed-icon" />
          </div>
          <div class="confirmed-details">
            <span class="confirmed-title">
              {{ activeTab === 'pickup' ? t('timeslot.pickup_agreed') : t('timeslot.return_agreed') }}
            </span>
            <div class="confirmed-time">
              <strong>{{ formatSlotDate(currentConfirmedSlot.date) }}</strong>, {{ currentConfirmedSlot.startTime }} – {{ currentConfirmedSlot.endTime }} Uhr
              <span v-if="currentConfirmedSlot.label" class="slot-label">({{ currentConfirmedSlot.label }})</span>
            </div>
            <p class="confirmed-subtext">
              {{ t('timeslot.confirmed_notice') }}
            </p>

            <!-- 1-Click Calendar Add Buttons -->
            <div class="calendar-actions">
              <span class="cal-actions-title">📅 {{ t('timeslot.add_to_calendar') }}:</span>
              <div class="cal-btn-group">
                <a
                  :href="googleCalendarLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cal-link-btn btn-google"
                >
                  <Calendar class="cal-icon" />
                  <span>Google Kalender</span>
                </a>
                <a
                  :href="icalDownloadLink"
                  class="cal-link-btn btn-ical"
                  download="termin.ics"
                >
                  <Clock class="cal-icon" />
                  <span>Apple / Outlook (.ics)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <Button
          v-if="editable"
          variant="secondary"
          size="sm"
          class="change-btn"
          :loading="isSaving"
          @click="clearConfirmedSlot"
        >
          {{ t('timeslot.change_appointment') }}
        </Button>
      </div>

      <!-- 2. Case: Not Confirmed, Proposals List + Propose Form -->
      <div v-else class="proposals-container">
        <!-- List of existing proposals -->
        <div v-if="currentProposals.length > 0" class="proposals-list">
          <div class="proposals-header-row">
            <span class="proposals-intro">
              {{ t('timeslot.proposals_title') }}
            </span>
          </div>

          <div
            v-for="slot in currentProposals"
            :key="slot.id"
            class="slot-card"
            :class="{
              'mine': slot.proposedBy === currentUserId,
              'theirs': slot.proposedBy !== currentUserId
            }"
          >
            <div class="slot-info">
              <div class="slot-main">
                <span class="slot-date">{{ formatSlotDate(slot.date) }}</span>
                <span class="slot-time">{{ slot.startTime }} – {{ slot.endTime }} Uhr</span>
                <span v-if="slot.label" class="slot-chip">{{ slot.label }}</span>
              </div>
              <div class="slot-author">
                <span v-if="slot.proposedBy === currentUserId" class="author-tag is-you">
                  ⏳ {{ t('timeslot.proposed_by_you_waiting', { otherRole: isOwner ? t('timeslot.borrower') : t('timeslot.lender') }) }}
                </span>
                <span v-else class="author-tag is-other">
                  👉 {{ t('timeslot.proposed_by_other', { name: slot.proposedByName || (isOwner ? t('timeslot.borrower') : t('timeslot.lender')) }) }}
                </span>
              </div>
            </div>

            <div class="slot-actions">
              <!-- If proposed by other party -> Select button -->
              <Button
                v-if="slot.proposedBy !== currentUserId && editable"
                variant="primary"
                size="sm"
                class="select-slot-btn"
                :loading="isSaving && selectedSlotId === slot.id"
                @click="confirmSlot(slot)"
              >
                <Check class="btn-icon" />
                {{ t('timeslot.select_slot') }}
              </Button>

              <!-- If proposed by current user -> Delete/Withdraw button -->
              <Button
                v-else-if="slot.proposedBy === currentUserId && editable"
                variant="secondary"
                size="sm"
                class="delete-slot-btn"
                :loading="isSaving && selectedSlotId === slot.id"
                @click="deleteProposal(slot.id)"
                :title="t('timeslot.withdraw_proposal')"
              >
                <Xmark class="btn-icon" />
                <span class="btn-text">{{ t('timeslot.withdraw') }}</span>
              </Button>
            </div>
          </div>
        </div>

        <!-- Empty state when no proposals yet -->
        <div v-else class="no-proposals-box">
          <p class="empty-hint">
            {{ activeTab === 'pickup' ? t('timeslot.no_pickup_proposals_yet') : t('timeslot.no_return_proposals_yet') }}
          </p>
        </div>

        <!-- Propose Form Trigger Button (when proposals exist and form is collapsed) -->
        <div v-if="editable && !isFormOpen && currentProposals.length > 0" class="open-form-wrapper">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            @click="isFormOpen = true"
          >
            ➕ {{ t('timeslot.custom_slot_title') }}
          </Button>
        </div>

        <!-- Propose Custom Timeslot Card (matches screenshot) -->
        <form
          v-else-if="editable && isFormOpen"
          class="propose-card"
          @submit.prevent="submitCustomSlot"
        >
          <div class="propose-card-header">
            <span class="propose-card-title">{{ t('timeslot.custom_slot_title') }}</span>
            <button
              v-if="currentProposals.length > 0"
              type="button"
              class="close-form-btn"
              @click="handleCancel"
              title="Close"
            >
              ✕
            </button>
          </div>

          <span class="propose-subtitle">
            {{ isOwner ? t('timeslot.propose_subtitle_owner') : t('timeslot.propose_subtitle_borrower') }}
          </span>

          <!-- Max duration info for return tab -->
          <div v-if="activeTab === 'return' && maxAllowedReturnDateStr" class="duration-hint-badge">
            <Clock class="hint-icon" />
            <span>{{ t('timeslot.max_return_hint', { days: effectiveMaxDuration, maxDate: formatSlotDate(maxAllowedReturnDateStr) }) }}</span>
          </div>

          <!-- 4 Preset template chips -->
          <div class="preset-chips">
            <button
              type="button"
              class="preset-chip"
              :class="{ 'is-active': selectedPreset === 'morning' }"
              @click="applyPreset('morning', '08:00', '11:00')"
            >
              🌅 {{ t('timeslot.morning_chip') }}
            </button>
            <button
              type="button"
              class="preset-chip"
              :class="{ 'is-active': selectedPreset === 'noon' }"
              @click="applyPreset('noon', '11:00', '14:00')"
            >
              ☀️ {{ t('timeslot.noon_chip') }}
            </button>
            <button
              type="button"
              class="preset-chip"
              :class="{ 'is-active': selectedPreset === 'afternoon' }"
              @click="applyPreset('afternoon', '14:00', '18:00')"
            >
              🌇 {{ t('timeslot.afternoon_chip') }}
            </button>
            <button
              type="button"
              class="preset-chip"
              :class="{ 'is-active': selectedPreset === 'evening' }"
              @click="applyPreset('evening', '18:00', '21:00')"
            >
              🌙 {{ t('timeslot.evening_chip') }}
            </button>
          </div>

          <!-- 3-Column Inputs: Date, From, To -->
          <div class="form-grid">
            <div class="form-field date-form-field">
              <DateInput
                :label="t('timeslot.date')"
                v-model="customDateObj"
                :is-date-disallowed="isTimeslotDateDisallowed"
                :show-outside-days="false"
                :popout-key="`timeslot-date-${localReservation.id}-${activeTab}-${otherReservations.length}`"
                required
              />
              <span v-if="isCustomDateBlocked" class="date-conflict-warning">
                ⚠️ {{ t('timeslot.date_conflict_warning') }}
              </span>
            </div>
            <div class="form-field time-field">
              <label>{{ t('timeslot.from') }}</label>
              <input
                type="time"
                v-model="customStartTime"
                required
                class="input-control"
              />
            </div>
            <div class="form-field time-field">
              <label>{{ t('timeslot.to') }}</label>
              <input
                type="time"
                v-model="customEndTime"
                required
                class="input-control"
              />
            </div>
            <div class="form-field full-width">
              <label>{{ t('timeslot.note_optional') }}</label>
              <input
                type="text"
                v-model="customLabel"
                :placeholder="t('timeslot.note_placeholder')"
                class="input-control"
              />
            </div>
          </div>

          <!-- Bottom Action Buttons: Cancel, Save proposal -->
          <div class="form-actions">
            <button
              type="button"
              class="btn-cancel"
              @click="handleCancel"
            >
              {{ t('timeslot.cancel') }}
            </button>
            <button
              type="submit"
              class="btn-save"
              :disabled="isSaving || isCustomDateBlocked"
            >
              <span v-if="isSaving">...</span>
              <span>{{ t('timeslot.save_proposal') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  InfoCircle,
  WarningTriangle,
  Xmark,
} from "@iconoir/vue";
import type { Reservation, ReservationTimeslots, TimeslotItem } from "@@/models/reservation";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import DateInput from "@/components/core/DateInput.vue";
import { addDays, formatDateToYMD, getStartOfDay, startOfDate } from "~~/lib/date";

const props = withDefaults(
  defineProps<{
    reservation: Reservation;
    currentUserId?: string;
    isOwner?: boolean;
    editable?: boolean;
    defaultType?: "pickup" | "return";
    highlight?: boolean;
  }>(),
  {
    editable: true,
    defaultType: "pickup",
    highlight: false,
  }
);

const emit = defineEmits<{
  (e: "updated", reservation: Reservation): void;
}>();

const { pb } = usePocketbase();
const { t, locale } = useI18n();
const { leihbase } = storeToRefs(useLeihbase());
const runtimeConfig = useRuntimeConfig();

const activeTab = ref<"pickup" | "return">(props.defaultType);
const isSaving = ref(false);
const selectedSlotId = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isFormOpen = ref(true);

const localReservation = ref<Reservation>(props.reservation);
const otherReservations = ref<Array<{ id: string; start: string | Date; end: string | Date }>>([]);
const fetchedProduct = ref<any>(null);

async function ensureProductLoaded() {
  const prod = (localReservation.value?.expand as any)?.product || (props.reservation?.expand as any)?.product;
  if (prod && typeof prod.max_duration_days === "number") {
    fetchedProduct.value = prod;
    return;
  }
  const prodId = props.reservation?.product || prod?.id;
  if (prodId && typeof prodId === "string") {
    try {
      fetchedProduct.value = await pb.collection("products").getOne(prodId);
    } catch (e) {
      console.warn("Could not fetch product for timeslot coordinator", e);
    }
  }
}

async function fetchOtherReservations() {
  const prodId = props.reservation?.product || (props.reservation?.expand as any)?.product?.id;
  if (!prodId) {
    otherReservations.value = [];
    return;
  }
  try {
    const list = await pb.collection("public_reservations").getFullList({
      filter: pb.filter("product = {:product} && id != {:currentId} && end >= @todayStart", {
        product: prodId,
        currentId: props.reservation.id,
      }),
      sort: "start",
    });
    otherReservations.value = list as any;
  } catch (err) {
    otherReservations.value = [];
  }
}

onMounted(() => {
  fetchOtherReservations();
  ensureProductLoaded();
});

watch(
  () => [props.reservation, localReservation.value],
  () => {
    ensureProductLoaded();
  },
  { deep: true }
);

watch(
  () => props.reservation,
  (newVal) => {
    if (newVal) {
      localReservation.value = newVal;
      fetchOtherReservations();
    }
  },
  { deep: true }
);

function parseDateString(dateStr: string): Date {
  if (!dateStr) return getStartOfDay();
  const clean = dateStr.split("T")[0].split(" ")[0];
  const parts = clean.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
}

const effectiveMaxDuration = computed<number>(() => {
  const prod = (localReservation.value?.expand as any)?.product || (props.reservation?.expand as any)?.product || fetchedProduct.value;
  if (prod && typeof prod.max_duration_days === "number" && prod.max_duration_days > 0) {
    return prod.max_duration_days;
  }
  return 30;
});

const resStartStr = computed(() => formatDateToYMD(localReservation.value?.start || props.reservation?.start));
const resEndStr = computed(() => formatDateToYMD(localReservation.value?.end || props.reservation?.end));

// Timeslot getters
const timeslots = computed<ReservationTimeslots>(() => {
  return localReservation.value.timeslots || {};
});

const pickupGroup = computed(() => timeslots.value.pickup || { proposals: [], confirmedSlot: null });
const returnGroup = computed(() => timeslots.value.return || { proposals: [], confirmedSlot: null });

const effectivePickupDateStr = computed(() => {
  return pickupGroup.value.confirmedSlot?.date || resStartStr.value;
});

const maxAllowedReturnDateStr = computed(() => {
  const baseDateStr = effectivePickupDateStr.value || resStartStr.value;
  if (!baseDateStr) return "";
  const baseDate = parseDateString(baseDateStr);
  const maxDate = addDays(baseDate, effectiveMaxDuration.value);
  return formatDateToYMD(maxDate);
});

// Target dates based on reservation start/end
const getTargetDate = (type: "pickup" | "return") => {
  if (type === "pickup") {
    const d = localReservation.value?.start || props.reservation?.start;
    return d ? formatDateToYMD(d) : formatDateToYMD(new Date());
  } else {
    // Return tab: default to existing end or maxAllowedReturnDateStr
    const d = localReservation.value?.end || props.reservation?.end;
    const endStr = d ? formatDateToYMD(d) : "";
    if (endStr && maxAllowedReturnDateStr.value && endStr > maxAllowedReturnDateStr.value) {
      return maxAllowedReturnDateStr.value;
    }
    return endStr || maxAllowedReturnDateStr.value || formatDateToYMD(new Date());
  }
};

const customDate = ref(getTargetDate(activeTab.value));
const customDateObj = ref<Date>(parseDateString(customDate.value));

watch(
  () => [props.reservation, activeTab.value],
  () => {
    const target = getTargetDate(activeTab.value);
    customDate.value = target;
    customDateObj.value = parseDateString(target);
  }
);

watch(customDateObj, (newVal) => {
  if (newVal) {
    customDate.value = formatDateToYMD(newVal);
  }
});

const isTimeslotDateDisallowed = (date: Date): boolean => {
  const todayStart = getStartOfDay().getTime();
  const dateDay = startOfDate(date).getTime();
  if (dateDay < todayStart) return true;

  const dateStr = formatDateToYMD(date);
  if (!dateStr) return false;

  const isBlockedByOther = otherReservations.value.some((res) => {
    const sStr = formatDateToYMD(res.start);
    const eStr = formatDateToYMD(res.end);
    return dateStr >= sStr && dateStr <= eStr;
  });
  if (isBlockedByOther) return true;

  if (activeTab.value === "pickup") {
    if (returnGroup.value.confirmedSlot?.date && dateStr > returnGroup.value.confirmedSlot.date) {
      return true;
    }
    if (resEndStr.value && dateStr > resEndStr.value) {
      return true;
    }
  } else if (activeTab.value === "return") {
    const pickupDateStr = effectivePickupDateStr.value;
    if (pickupDateStr && dateStr < pickupDateStr) {
      return true;
    }
    if (maxAllowedReturnDateStr.value && dateStr > maxAllowedReturnDateStr.value) {
      return true;
    }
  }

  return false;
};

const isCustomDateBlocked = computed(() => {
  if (!customDate.value) return false;
  const targetDate = parseDateString(customDate.value);
  return isTimeslotDateDisallowed(targetDate);
});
const customStartTime = ref("18:00");
const customEndTime = ref("19:00");
const customLabel = ref("");
const selectedPreset = ref<string | null>(null);

const applyPreset = (preset: "morning" | "noon" | "afternoon" | "evening", start: string, end: string) => {
  selectedPreset.value = preset;
  customStartTime.value = start;
  customEndTime.value = end;
};

watch([customStartTime, customEndTime], ([start, end]) => {
  if (start === "08:00" && end === "11:00") {
    selectedPreset.value = "morning";
  } else if (start === "11:00" && end === "14:00") {
    selectedPreset.value = "noon";
  } else if (start === "14:00" && end === "18:00") {
    selectedPreset.value = "afternoon";
  } else if (start === "18:00" && end === "21:00") {
    selectedPreset.value = "evening";
  } else {
    selectedPreset.value = null;
  }
});

watch(activeTab, (newTab) => {
  const target = getTargetDate(newTab);
  customDate.value = target;
  customDateObj.value = parseDateString(target);
  isFormOpen.value = true;
});

const pickupConfirmed = computed(() => !!pickupGroup.value.confirmedSlot);
const returnConfirmed = computed(() => !!returnGroup.value.confirmedSlot);

const pickupProposalsCount = computed(() => pickupGroup.value.proposals?.length || 0);
const returnProposalsCount = computed(() => returnGroup.value.proposals?.length || 0);

const currentConfirmedSlot = computed<TimeslotItem | null>(() => {
  return activeTab.value === "pickup" ? pickupGroup.value.confirmedSlot || null : returnGroup.value.confirmedSlot || null;
});

const currentProposals = computed<TimeslotItem[]>(() => {
  const group = activeTab.value === "pickup" ? pickupGroup.value : returnGroup.value;
  return group.proposals || [];
});

const formatSlotDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map((p) => parseInt(p, 10));
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(locale.value === "de" ? "de-DE" : "en-US", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale.value === "de" ? "de-DE" : "en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const appName = computed(
  () => leihbase.value?.name || runtimeConfig.public.appName || "Leihbase"
);

const googleCalendarLink = computed(() => {
  if (!currentConfirmedSlot.value) return "#";
  const slot = currentConfirmedSlot.value;
  const isPickup = activeTab.value !== "return";
  const typeLabel = isPickup ? "Übergabe" : "Rückgabe";
  const productName = props.reservation?.expand?.product?.name || "Gegenstand";
  const summary = `${typeLabel}: ${productName} (${appName.value})`;
  const location =
    props.reservation?.handover_address ||
    props.reservation?.expand?.product?.pickup_address ||
    "";
  const description = `${typeLabel} für ${productName}. Details im Portal: /reservations`;

  const cleanDate = (slot.date || "").replace(/-/g, "");
  const cleanStart = (slot.startTime || "09:00").replace(/:/g, "").slice(0, 4) + "00";
  const cleanEnd = (slot.endTime || "10:00").replace(/:/g, "").slice(0, 4) + "00";
  const dates = `${cleanDate}T${cleanStart}/${cleanDate}T${cleanEnd}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: dates,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
});

const icalDownloadLink = computed(() => {
  if (!currentConfirmedSlot.value) return "#";
  const slot = currentConfirmedSlot.value;
  const isPickup = activeTab.value !== "return";
  const typeLabel = isPickup ? "Übergabe" : "Rückgabe";
  const productName = props.reservation?.expand?.product?.name || "Gegenstand";
  const summary = `${typeLabel}: ${productName} (${appName.value})`;
  const location =
    props.reservation?.handover_address ||
    props.reservation?.expand?.product?.pickup_address ||
    "";

  const params = new URLSearchParams({
    id: props.reservation?.id || "slot",
    type: activeTab.value,
    date: slot.date || "",
    start: slot.startTime || "09:00",
    end: slot.endTime || "10:00",
    title: summary,
    location: location,
  });

  return `/api/calendar-invite?${params.toString()}`;
});

function formatErrorMessage(err: any): string {
  const rawMsg = err?.data?.message || err?.message || err?.toString() || "";
  if (rawMsg.includes("Only_owner_can_accept_or_decline")) {
    return t("timeslot.error_only_owner_status");
  }
  if (rawMsg.includes("Overlapping_reservation")) {
    return t("timeslot.error_overlapping");
  }
  if (rawMsg.includes("Date_range_too_long") || rawMsg.includes("Timeslot_exceeds_max_duration")) {
    return t("timeslot.error_date_range_too_long");
  }
  if (rawMsg.includes("Return_before_start")) {
    return t("timeslot.error_return_before_pickup");
  }
  if (rawMsg.includes("autocancelled")) {
    return t("timeslot.error_network");
  }
  return err?.message || t("timeslot.error_generic");
}

const saveReservationData = async (payload: any) => {
  isSaving.value = true;
  errorMessage.value = null;
  try {
    const updated = await pb.collection("reservations").update<Reservation>(
      localReservation.value.id,
      payload,
      {
        expand: "user,owner,product",
        requestKey: null,
      }
    );
    localReservation.value = updated;
    emit("updated", updated);
  } catch (err: any) {
    console.error("Failed to update reservation:", err);
    errorMessage.value = formatErrorMessage(err);
  } finally {
    isSaving.value = false;
    selectedSlotId.value = null;
  }
};

const saveTimeslots = async (newTimeslots: ReservationTimeslots) => {
  await saveReservationData({ timeslots: newTimeslots });
};

const submitCustomSlot = async () => {
  if (!customDate.value || !customStartTime.value || !customEndTime.value) return;
  errorMessage.value = null;

  const type = activeTab.value;
  const todayYMD = formatDateToYMD(new Date());

  if (customDate.value < todayYMD) {
    errorMessage.value = t("timeslot.error_date_past");
    return;
  }

  if (type === "pickup") {
    if (returnGroup.value.confirmedSlot?.date && customDate.value > returnGroup.value.confirmedSlot.date) {
      errorMessage.value = t("timeslot.error_pickup_after_return");
      return;
    }
    if (resEndStr.value && customDate.value > resEndStr.value) {
      errorMessage.value = t("timeslot.error_pickup_after_end");
      return;
    }
  } else if (type === "return") {
    const pickupDate = effectivePickupDateStr.value;
    if (pickupDate && customDate.value < pickupDate) {
      errorMessage.value = t("timeslot.error_return_before_pickup");
      return;
    }
    if (maxAllowedReturnDateStr.value && customDate.value > maxAllowedReturnDateStr.value) {
      errorMessage.value = t("timeslot.error_max_duration_exceeded", {
        days: effectiveMaxDuration.value,
      });
      return;
    }
  }

  if (isCustomDateBlocked.value) {
    errorMessage.value = t("timeslot.date_conflict_warning");
    return;
  }

  const currentGroup = type === "pickup" ? pickupGroup.value : returnGroup.value;

  const newSlot: TimeslotItem = {
    id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: customDate.value,
    startTime: customStartTime.value,
    endTime: customEndTime.value,
    label: customLabel.value.trim() || undefined,
    proposedBy: props.currentUserId || pb.authStore?.record?.id || "",
    proposedByName: pb.authStore?.record?.name || pb.authStore?.record?.nickname || "",
    createdAt: new Date().toISOString(),
  };

  const updatedSlots: ReservationTimeslots = {
    ...timeslots.value,
    [type]: {
      ...currentGroup,
      proposals: [...currentGroup.proposals, newSlot],
    },
  };

  await saveTimeslots(updatedSlots);
  customLabel.value = "";
  if (currentProposals.value.length > 0) {
    isFormOpen.value = true;
  }
};

const handleCancel = () => {
  customLabel.value = "";
  customStartTime.value = "18:00";
  customEndTime.value = "19:00";
  selectedPreset.value = null;
  if (currentProposals.value.length > 0) {
    isFormOpen.value = false;
  }
};

const confirmSlot = async (slot: TimeslotItem) => {
  selectedSlotId.value = slot.id;
  const type = activeTab.value;
  const currentGroup = type === "pickup" ? pickupGroup.value : returnGroup.value;

  const updatedSlots: ReservationTimeslots = {
    ...timeslots.value,
    [type]: {
      ...currentGroup,
      confirmedSlot: slot,
    },
  };

  const payload: any = {
    timeslots: updatedSlots,
  };
  if (type === "pickup" && slot.date) {
    payload.start = `${slot.date} 00:00:00.000Z`;
  } else if (type === "return" && slot.date) {
    payload.end = `${slot.date} 00:00:00.000Z`;
  }

  await saveReservationData(payload);
};

const clearConfirmedSlot = async () => {
  const type = activeTab.value;
  const currentGroup = type === "pickup" ? pickupGroup.value : returnGroup.value;

  const updatedSlots: ReservationTimeslots = {
    ...timeslots.value,
    [type]: {
      ...currentGroup,
      confirmedSlot: null,
    },
  };

  await saveTimeslots(updatedSlots);
  isFormOpen.value = true;
};

const deleteProposal = async (slotId: string) => {
  selectedSlotId.value = slotId;
  const type = activeTab.value;
  const currentGroup = type === "pickup" ? pickupGroup.value : returnGroup.value;

  const updatedSlots: ReservationTimeslots = {
    ...timeslots.value,
    [type]: {
      ...currentGroup,
      proposals: currentGroup.proposals.filter((s) => s.id !== slotId),
      confirmedSlot: currentGroup.confirmedSlot?.id === slotId ? null : currentGroup.confirmedSlot,
    },
  };

  await saveTimeslots(updatedSlots);
};
</script>

<style scoped>
.timeslot-coordinator {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: visible;
  margin-top: 12px;
  position: relative;
}

.coordinator-header {
  background-color: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  overflow: hidden;
}

.tab-buttons {
  display: flex;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #212529;
  background-color: #e9ecef;
}

.tab-btn.active {
  color: #2b8a3e;
  background-color: #ffffff;
  border-bottom-color: #2b8a3e;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.confirmed-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: #2b8a3e;
  color: #ffffff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  background-color: #dee2e6;
  color: #495057;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.coordinator-body {
  padding: 14px;
  background-color: #ffffff;
  border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;
  overflow: visible;
}

/* Info Guide Box */
.info-guide-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.guide-icon {
  width: 18px;
  height: 18px;
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 1px;
}

.guide-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: #166534;
}

.guide-title {
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
}

.guide-p {
  margin: 0;
}

/* Error Alert */
.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Confirmed Box */
.confirmed-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: #ebfbee;
  border: 1px solid #b2f2bb;
  border-radius: 6px;
  padding: 14px 16px;
}

.confirmed-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirmed-icon-wrap {
  color: #2b8a3e;
  display: flex;
  align-items: center;
}

.confirmed-icon {
  width: 28px;
  height: 28px;
}

.confirmed-title {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #2b8a3e;
}

.confirmed-time {
  font-size: 14px;
  color: #212529;
  margin-top: 2px;
}

.slot-label {
  color: #6c757d;
  font-size: 13px;
  margin-left: 4px;
}

.confirmed-subtext {
  font-size: 11.5px;
  color: #2b8a3e;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.calendar-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cal-actions-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #2b8a3e;
}

.cal-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.cal-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  line-height: 1.2;

  .cal-icon {
    width: 14px;
    height: 14px;
  }

  &.btn-google {
    background-color: #2b8a3e;
    color: #ffffff;
    border: 1px solid #2b8a3e;

    &:hover {
      background-color: #237032;
      border-color: #237032;
      transform: translateY(-1px);
    }
  }

  &.btn-ical {
    background-color: #ffffff;
    color: #2b8a3e;
    border: 1px solid #b2f2bb;

    &:hover {
      background-color: #f0fdf4;
      border-color: #2b8a3e;
      transform: translateY(-1px);
    }
  }
}

/* Proposals List */
.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.proposals-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.proposals-intro {
  font-size: 13px;
  font-weight: 600;
  color: #343a40;
}

.slot-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.slot-card.mine {
  background-color: #f8f9fa;
  border-left: 4px solid #ced4da;
}

.slot-card.theirs {
  background-color: #f8faff;
  border-left: 4px solid #339af0;
}

.slot-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.slot-date {
  font-weight: 600;
  color: #212529;
}

.slot-time {
  color: #495057;
  font-weight: 500;
}

.slot-chip {
  background-color: #e9ecef;
  color: #495057;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.slot-author {
  margin-top: 4px;
}

.author-tag {
  font-size: 12px;
  display: inline-block;
}

.author-tag.is-you {
  color: #868e96;
}

.author-tag.is-other {
  color: #1971c2;
  font-weight: 600;
}

.slot-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.select-slot-btn {
  background-color: #2b8a3e !important;
  color: #ffffff !important;
  font-weight: 600;
}

.select-slot-btn:hover {
  background-color: #237032 !important;
}

.delete-slot-btn {
  padding: 4px 8px;
  color: #fa5252;
  font-size: 12px;
}

.btn-text {
  margin-left: 2px;
}

.no-proposals-box {
  padding: 14px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px dashed #dee2e6;
}

.empty-hint {
  font-size: 13px;
  color: #868e96;
  margin: 0;
  font-style: italic;
}

.open-form-wrapper {
  margin-top: 10px;
}

/* Propose Card Component (Matches Screenshot) */
.propose-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.propose-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.propose-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.close-form-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.close-form-btn:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

.propose-subtitle {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #166534;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.preset-chip:hover {
  background-color: #dcfce7;
  border-color: #22c55e;
}

.preset-chip.is-active {
  background-color: #dcfce7;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.date-form-field :deep(.label) {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.date-form-field :deep(.lb-input) {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13.5px;
  background-color: #ffffff;
  color: #111827;
  height: 38px;
  line-height: normal;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.date-form-field :deep(.lb-input:focus) {
  border-color: #16a34a;
  outline: none;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}

.input-control {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13.5px;
  background-color: #ffffff;
  color: #111827;
  height: 38px;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input-control:focus {
  border-color: #16a34a;
  outline: none;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel {
  padding: 6px 14px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.btn-save {
  padding: 6px 16px;
  background-color: #18181b;
  border: 1px solid #18181b;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.btn-save:hover:not(:disabled) {
  background-color: #27272a;
  border-color: #27272a;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.mb-3 {
  margin-bottom: 12px;
}

.input-control.has-conflict {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

.date-conflict-warning {
  display: block;
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
  margin-top: 4px;
}

.duration-hint-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #1e40af;
  font-weight: 500;
  margin-bottom: 10px;
}

.hint-icon {
  width: 14px;
  height: 14px;
  color: #2563eb;
  flex-shrink: 0;
}
</style>

<i18n lang="json">
{
  "de": {
    "timeslot": {
      "pickup_tab": "Übergabe (Abholung)",
      "return_tab": "Rückgabe",
      "pickup_agreed": "Vereinbarter Übergabetermin",
      "return_agreed": "Vereinbarter Rückgabetermin",
      "change_appointment": "Termin ändern",
      "add_to_calendar": "Im Kalender eintragen",
      "confirmed_notice": "Dieser Termin ist für beide Parteien fest hinterlegt.",
      "agreed_tooltip": "Termin vereinbart",
      "guide_title": "Terminabsprache",
      "guide_borrower_text": "Wähle einen der vom Verleiher vorgeschlagenen Termine aus, um die Übergabe verbindlich festzulegen. Falls kein Termin für dich passt, kannst du ein eigenes Zeitfenster vorschlagen – der Verleiher muss dieses dann bestätigen.",
      "guide_owner_text": "Schlage Zeitfenster vor, wann du für die Übergabe verfügbar bist, oder bestätige einen vom Ausleiher vorgeschlagenen Termin.",
      "proposals_title": "Terminvorschläge:",
      "proposed_by_you_waiting": "Dein Vorschlag (wartet auf Bestätigung durch {otherRole})",
      "proposed_by_other": "Vorgeschlagen von {name}",
      "borrower": "Ausleiher",
      "lender": "Verleiher",
      "select_slot": "Termin auswählen",
      "withdraw": "Zurückziehen",
      "withdraw_proposal": "Vorschlag zurückziehen",
      "no_pickup_proposals_yet": "Noch keine Terminvorschläge für die Übergabe hinterlegt.",
      "no_return_proposals_yet": "Noch keine Terminvorschläge für die Rückgabe hinterlegt.",
      "propose_subtitle_borrower": "EIGENEN TERMIN VORSCHLAGEN (FALLS OBIGE ZEITEN NICHT PASSEN):",
      "propose_subtitle_owner": "TERMINVORSCHLAG FÜR AUSLEIHER HINZUFÜGEN:",
      "morning_chip": "Morgens (08:00 – 11:00)",
      "noon_chip": "Mittags (11:00 – 14:00)",
      "afternoon_chip": "Nachmittags (14:00 – 18:00)",
      "evening_chip": "Abends (18:00 – 21:00)",
      "custom_slot_title": "Eigenes Zeitfenster vorschlagen",
      "date": "Datum",
      "from": "Von",
      "to": "Bis",
      "note_optional": "Hinweis (optional)",
      "note_placeholder": "z.B. Vor der Arbeit, flexibel...",
      "cancel": "Abbrechen",
      "save_proposal": "Vorschlag speichern",
      "max_return_hint": "Max. Ausleihdauer: {days} Tage (Rückgabe bis spätestens {maxDate})",
      "date_conflict_warning": "Dieser Tag ist bereits durch eine andere Buchung belegt.",
      "error_slot_exists": "Dieses Zeitfenster wurde bereits vorgeschlagen.",
      "error_date_past": "Das gewählte Datum kann nicht in der Vergangenheit liegen.",
      "error_pickup_after_return": "Das Abholdatum kann nicht nach dem Rückgabedatum liegen.",
      "error_pickup_after_end": "Das Abholdatum kann nicht nach dem Buchungszeitraum liegen.",
      "error_return_before_pickup": "Das Rückgabedatum kann nicht vor dem Abholdatum liegen.",
      "error_max_duration_exceeded": "Die maximale Ausleihdauer von {days} Tagen darf nicht überschritten werden.",
      "error_date_range_too_long": "Die gewählte Ausleihdauer überschreitet das erlaubte Maximum.",
      "error_only_owner_status": "Statusänderungen können nur vom Verleiher vorgenommen werden.",
      "error_overlapping": "Für diesen Zeitraum existiert bereits eine andere Buchung.",
      "error_network": "Netzwerkunterbrechung. Bitte versuche es erneut.",
      "error_generic": "Fehler beim Aktualisieren des Termins."
    }
  },
  "en": {
    "timeslot": {
      "pickup_tab": "Pickup (Handover)",
      "return_tab": "Return",
      "pickup_agreed": "Agreed Handover Time",
      "return_agreed": "Agreed Return Time",
      "change_appointment": "Change Time",
      "add_to_calendar": "Add to calendar",
      "confirmed_notice": "This appointment is firmly agreed upon by both parties.",
      "agreed_tooltip": "Appointment confirmed",
      "guide_title": "Appointment Coordination",
      "guide_borrower_text": "Choose one of the lender's proposed timeslots to confirm the handover. If none of the times work for you, you can propose a new timeslot – the lender will then need to approve it.",
      "guide_owner_text": "Suggest timeslots when you are available for the handover, or confirm a timeslot suggested by the borrower.",
      "proposals_title": "Timeslot proposals:",
      "proposed_by_you_waiting": "Your proposal (waiting for confirmation from {otherRole})",
      "proposed_by_other": "Suggested by {name}",
      "borrower": "Borrower",
      "lender": "Lender",
      "select_slot": "Select slot",
      "withdraw": "Withdraw",
      "withdraw_proposal": "Withdraw proposal",
      "no_pickup_proposals_yet": "No handover timeslots proposed yet.",
      "no_return_proposals_yet": "No return timeslots proposed yet.",
      "propose_subtitle_borrower": "PROPOSE ALTERNATIVE TIMESLOT (IF ABOVE SLOTS DON'T SUIT YOU):",
      "propose_subtitle_owner": "PROPOSE HANDOVER TIMESLOT:",
      "morning_chip": "Morning (08:00 – 11:00)",
      "noon_chip": "Noon (11:00 – 14:00)",
      "afternoon_chip": "Afternoon (14:00 – 18:00)",
      "evening_chip": "Evening (18:00 – 21:00)",
      "custom_slot_title": "Propose custom timeslot",
      "date": "Date",
      "from": "From",
      "to": "To",
      "note_optional": "Note (optional)",
      "note_placeholder": "e.g. Before work, flexible...",
      "cancel": "Cancel",
      "save_proposal": "Save proposal",
      "max_return_hint": "Max. rental duration: {days} days (Return by {maxDate} latest)",
      "date_conflict_warning": "This date is already booked by another reservation.",
      "error_slot_exists": "This timeslot has already been suggested.",
      "error_date_past": "The selected date cannot be in the past.",
      "error_pickup_after_return": "The pickup date cannot be after the return date.",
      "error_pickup_after_end": "The pickup date cannot be after the reservation window.",
      "error_return_before_pickup": "The return date cannot be before the pickup date.",
      "error_max_duration_exceeded": "The maximum rental duration of {days} days cannot be exceeded.",
      "error_date_range_too_long": "The selected rental duration exceeds the allowed maximum.",
      "error_only_owner_status": "Only the lender can change the reservation status.",
      "error_overlapping": "An overlapping booking exists for this timeframe.",
      "error_network": "Network interruption. Please try again.",
      "error_generic": "Error updating timeslot."
    }
  }
}
</i18n>
