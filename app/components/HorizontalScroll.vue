<!--
  Component which adds a horizontal scroll when the content overflows
  helpful to display content on mobile horizontally
-->

<template>
  <div>
    <slot />
  </div>
</template>

<style scoped>
div {
  overflow-x: auto;
  margin-inline: calc(var(--fluid-spacing-8) * -1);
  padding-inline: var(--fluid-spacing-8);
  padding-block: 0.3rem;
  margin-block: -0.3rem;
}
</style>
