<template>
  <div
    :class="{
      background: true,
      'header-offset': headerOffset,
      open,
      'was-open': wasOpen,
    }"
    @click="close"
  ></div>
  <div
    data-base-theme
    :class="{
      dialog: true,
      'header-offset': headerOffset,
      open,
      'was-open': wasOpen,
      inset,
    }"
  >
    <header>
      <div class="title">
        <h2>{{ title }}</h2>
        <button @click="close">
          <Xmark />
        </button>
      </div>
      <slot name="header"></slot>
    </header>
    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Xmark } from "@iconoir/vue";

const wasOpen = ref(false);

defineProps<{
  inset: boolean;
  title: string;
  headerOffset?: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const open = defineModel<boolean>("open");

watch(open, (newValue) => {
  wasOpen.value = newValue || wasOpen.value;
});

function close() {
  open.value = false;
  emit("close");
}
</script>

<style lang="scss" scoped>
@use "~/assets/styles/breakpoints.scss";

.background {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
  background-color: black;
  animation-name: background-out;
  animation-duration: 0;
  animation-fill-mode: both;
  visibility: hidden;
  opacity: 0;
  &.header-offset {
    top: var(--navbar-height);
    height: calc(100% - var(--navbar-height));
  }
  &.was-open {
    animation-duration: 0.2s;
  }
  &.open {
    animation-name: background-in;
  }
}

@keyframes background-in {
  from {
    visibility: hidden;
    opacity: 0;
  }
  to {
    visibility: visible;
    opacity: 0.2;
  }
}

@keyframes background-out {
  from {
    visibility: visible;
    opacity: 0.2;
  }
  to {
    visibility: hidden;
    opacity: 0;
  }
}

.dialog {
  position: fixed;
  left: 50%;
  top: -100%;
  transform: translate(-50%, -50%);
  width: min(600px, 100%);
  background-color: white;
  z-index: 40;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  animation-name: dialog-out;
  animation-duration: 0s;
  animation-fill-mode: both;
  visibility: hidden;
  &.header-offset {
    top: calc(-100% + var(--navbar-height));
    max-height: calc(90vh - var(--navbar-height));
  }
  &.was-open {
    animation-duration: 0.2s;
  }
  &.open {
    animation-name: dialog-in;
  }
  &.inset {
    header {
      padding-top: 1.5rem;
    }
    header,
    .body {
      padding-left: 2rem;
      padding-right: 2rem;
    }
    .body {
      padding-bottom: 2rem;
    }
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    height: auto;
    max-height: 95vh;
    max-width: 95vw;
  }
}

@keyframes dialog-in {
  from {
    visibility: hidden;
    top: -100%;
  }
  to {
    visibility: visible;
    top: 50%;
  }
}

@keyframes dialog-out {
  from {
    visibility: visible;
    top: 50%;
  }
  to {
    visibility: hidden;
    top: -100%;
  }
}

header {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
    margin-bottom: 1rem;
  }
  h2 {
    margin: 0;
  }
  button {
    background: transparent;
    border: 0;
    padding: 0.5rem;
    cursor: pointer;
  }
}
.body {
  overflow-y: scroll;
}
</style>
