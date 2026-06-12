<template>
  <footer>
    <template
      v-if="leihbase.footer_links"
      v-for="(link, index) in leihbase.footer_links"
    >
      <NuxtLink :to="link.link" target="_blank">
        {{ link.text }}
      </NuxtLink>
      <span>—</span>
    </template>
    <NuxtLink target="_blank" href="https://github.com/ArcoMul/leihbase">
      Open-Source
    </NuxtLink>
    <span v-if="leihbase?.contact_link">—</span>
    <NuxtLink v-if="leihbase?.contact_link" :to="leihbase?.contact_link">
      {{ t("contact") }}
    </NuxtLink>
  </footer>
</template>

<script setup>
const { t } = useI18n({
  useScope: "local",
});

const { leihbase } = storeToRefs(useLeihbase());
</script>

<style lang="scss" scoped>
footer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1rem 1rem;
  min-height: var(--footer-height);
  background-color: var(--background-color);
  color: var(--text-color);
  text-align: center;
  a {
    color: var(--text-color);
    padding: 0 1rem;
    line-height: 1;
    text-underline-offset: 0.25rem;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "imprint": "Imprint",
    "privacy_policy": "Privacy Policy",
    "contact": "Contact"
  },
  "de": {
    "imprint": "Impressum",
    "privacy_policy": "Datenschutz",
    "contact": "Kontakt"
  }
}
</i18n>
