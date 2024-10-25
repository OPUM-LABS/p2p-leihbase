<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
};
</script>

<style scoped>
.loading-spinner {
  --size: 2rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  border: calc(2px + var(--size) * 0.0625) solid rgba(0, 0, 0, 0.1);
  border-top: calc(2px + var(--size) * 0.0625) solid rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
