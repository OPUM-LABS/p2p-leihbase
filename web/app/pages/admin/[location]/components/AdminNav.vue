<template>
  <HorizontalScroll is="nav" class="nav">
    <Button variant="secondary" :to="`/admin/${location?.slug}`">
      {{ t('admin.nav.reservations') }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/products`">
      {{ t('admin.nav.products') }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/stats`">
      {{ t('admin.nav.statistics') }}
    </Button>
    <Button
      :disabled="!userStore.isAdmin"
      variant="secondary"
      :to="`/admin/${location?.slug}/settings`"
    >
      {{ t('admin.nav.settings') }}
    </Button>
  </HorizontalScroll>
</template>

<script setup lang="ts">
import Button from "@/components/core/Button.vue";
import HorizontalScroll from "@/components/core/HorizontalScroll.vue";
import type { RecordModel } from "pocketbase";

const userStore = useUserStore();

const { t } = useI18n({
  useScope: "local",
});

defineProps<{ location: RecordModel }>();
</script>

<style scoped>
.nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-8) !important;
}
</style>
