<template>
  <sl-tooltip :open="open" @click.prevent.stop>
    <div slot="content" v-html="html"></div>
    <div
      class="trigger"
      @click.prevent.stop="handleClick"
      @blur="handleBlur"
      tabindex="0"
    >
      <slot />
    </div>
  </sl-tooltip>
</template>

<script setup lang="ts">
if (import.meta.client) {
  await import("@shoelace-style/shoelace/dist/components/tooltip/tooltip.js");
}

defineProps<{ html: string }>();
const open = ref(false);
function handleClick() {
  open.value = true;
}
function handleBlur() {
  open.value = false;
}
</script>

<style scoped>
.trigger {
  display: inline-block;
}
</style>
