<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { idKey, isOpenKey, openKey } from "./Accordion.model";

const { id } = defineProps<{ id: string }>();

const open = inject(openKey);
provide(idKey, id);
provide(
  isOpenKey,
  computed(() => !!open?.value.includes(id))
);
</script>
