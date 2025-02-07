<template>
  <div><slot></slot></div>
</template>

<style scoped>
div {
  padding: var(--fluid-spacing-12);
  background-color: color-mix(in srgb, var(--background-color) 85%, #fff);
  border-radius: calc(var(--border-radius) * 2);
  border-color: color-mix(in srgb, var(--background-color) 90%, #000);
  border-width: 1px;
  border-style: solid;
}
</style>
