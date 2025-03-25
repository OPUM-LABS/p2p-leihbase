<template>
  <Dialog inset title="Reservierung" v-model:open="open">
    <div v-if="reservation && product && location" class="product">
      <img
        :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[0]}${thumbs.sm}`"
      />
      <div>
        <p>
          <strong>Gegenstand</strong><br />
          <a :href="`/link/product/${product.id}`" target="_blank">
            {{ product.name }}
          </a>
        </p>
        <p>
          <strong>Standort</strong><br />
          <a :href="`/l/${location.slug}`" target="_blank">
            {{ location.name }}
          </a>
        </p>
        <p>
          <strong>Leihfrist</strong><br />
          {{ formatDate(reservation.start, DateTime.DATE_MED, locale) }}
          -
          {{ formatDate(reservation.end, DateTime.DATE_MED, locale) }}
        </p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { formatDate } from "~/lib/date";
import type { Location } from "~/models/location";
import type { Product } from "~/models/product";
import type { Reservation } from "~/models/reservation";

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
  margin-bottom: var(--fluid-spacing-4);
  gap: var(--fluid-spacing-4);
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
