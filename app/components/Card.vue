<template>
  <div><slot></slot></div>
</template>

<style scoped>
div {
  padding: var(--fluid-spacing-12);
  background-color: var(--surface-foreground-color);
  border-radius: calc(var(--border-radius) * 2);
}
</style>
