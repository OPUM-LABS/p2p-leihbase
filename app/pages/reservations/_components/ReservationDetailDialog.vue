<template>
  <Dialog inset title="Reservierung" v-model:open="open">
    <div v-if="reservation && product && location" class="product">
      <img
        :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[0]}${thumbs.sm}`"
      />
      <div>
        <p>
          <strong>{{ t("product") }}</strong
          ><br />
          <a :href="`/link/product/${product.id}`" target="_blank">
            {{ product.name }}
          </a>
        </p>
        <p>
          <strong>{{ t("location") }}</strong
          ><br />
          <a :href="`/l/${location.slug}`" target="_blank">
            {{ location.name }}
          </a>
        </p>
        <p>
          <strong>{{ t("borrow_period") }}</strong
          ><br />
          {{ formatDate(reservation.start, DateTime.DATE_MED, locale) }}
          -
          {{ formatDate(reservation.end, DateTime.DATE_MED, locale) }}
        </p>
      </div>
    </div>
    <Accordion v-if="reservation" :single="true">
      <AccordionItem
        id="cancel"
        :disabled="
          getReservationStatus(reservation) === ReservationStatus.Ended ||
          getReservationStatus(reservation) === ReservationStatus.Cancelled
        "
      >
        <AccordionTrigger>{{ t("cancel_trigger") }}</AccordionTrigger>
        <AccordionContent>
          <div
            v-if="getReservationStatus(reservation) === ReservationStatus.New"
          >
            <Button>{{ t("cancel_button") }}</Button>
          </div>
          <div
            v-else-if="
              getReservationStatus(reservation) === ReservationStatus.Started
            "
          >
            <p>
              {{ t("cancel_not_possible_text", [location?.email]) }}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="change-period">
        <AccordionTrigger>{{ t("change_period_trigger") }}</AccordionTrigger>
        <AccordionContent>
          <p>{{ t("change_period_text", [location?.email]) }}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Dialog>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import Accordion from "~/components/Accordion/Accordion.vue";
import AccordionContent from "~/components/Accordion/AccordionContent.vue";
import AccordionItem from "~/components/Accordion/AccordionItem.vue";
import AccordionTrigger from "~/components/Accordion/AccordionTrigger.vue";
import { formatDate } from "~/lib/date";
import { getReservationStatus } from "~/lib/reservation";
import type { Location } from "~/models/location";
import type { Product } from "~/models/product";
import { ReservationStatus, type Reservation } from "~/models/reservation";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();

const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  reservation?: Reservation;
  product?: Product;
  location?: Location;
}>();
const open = ref(false);
watch(
  () => props.reservation,
  (newValue) => {
    open.value = !!newValue;
  }
);
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  padding: var(--fluid-spacing-4);
  gap: var(--fluid-spacing-4);
  border-radius: var(--border-radius);
  margin-bottom: var(--fluid-spacing-4);
  img {
    width: 33.33%;
    aspect-ratio: 1/1;
    border-radius: var(--border-radius);
    object-fit: cover;
  }
  p:last-child {
    margin: 0;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "product": "Product",
    "location": "Location",
    "borrow_period": "Borrow period",
    "cancel_trigger": "Cancel reservation",
    "cancel_button": "Cancel",
    "cancel_not_possible_text": "This reservation can't be cancelled as it already started, please send an e-mail to {0} for any questions or remarks.",
    "change_period_trigger": "Update reservation period",
    "change_period_text": "To update the reservation period, please send an e-mail to {0}."
  },
  "de": {
    "product": "Gegenstand",
    "location": "Standort",
    "borrow_period": "Leihfrist",
    "cancel_trigger": "Reservierung stornieren",
    "cancel_button": "Stornieren",
    "cancel_not_possible_text": "Diese Reservierung kann nicht storniert worden, da der schon angefangen hat. Schicke bei weitere Fragen oder Problemen bitte ein E-Mail an {0}.",
    "change_period_trigger": "Leihfrist änderen",
    "change_period_text": "Um deine Leihfrist zu änderen, schicke bitte eine E-Mail an {0}."
  }
}
</i18n>
