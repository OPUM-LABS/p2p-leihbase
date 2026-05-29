<template>
  <slot v-if="show"></slot>
</template>

<script setup lang="ts">
import { type TabProps } from "./Tab.model";

const props = defineProps<TabProps>();

const activeTabId = inject<Ref<string>>("activeTabId");

const show = computed(() => activeTabId?.value === props.id);
</script>
