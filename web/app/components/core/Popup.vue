<template>
  <div :id="id" class="popup-component">
    <slot></slot>
    <div v-show="open" class="popup">
      <slot name="popup"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open");
const id = useId();

function close(e: Event) {
  const target = e.target as HTMLInputElement;
  const popup = target.closest(`#${id}`);
  if (!popup) {
    open.value = false;
  }
}

watch(open, (isOpening) => {
  if (isOpening) {
    document.addEventListener("click", close);
  } else {
    document.removeEventListener("click", close);
  }
});
</script>

<style scoped>
.popup-component {
  position: relative;
}
.popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  z-index: 1000;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
</style>
