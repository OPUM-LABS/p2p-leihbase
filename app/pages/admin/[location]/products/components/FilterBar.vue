<template>
  <div class="filter-bar">
    <!-- Status filter -->
    <Select :label="t('status')" hide-label v-model="status" @input="$emit('input')">
      <option value="" :aria-label="t('all')">{{ t("status") }}</option>
      <option value="active">{{ t("active") }}</option>
      <option value="inactive">{{ t("inactive") }}</option>
    </Select>
    <!-- Text filter -->
    <InputField
      v-model="query"
      :placeholder="`${t('search')}...`"
      class="input lb-input"
      @input="$emit('input')"
    />
    <!-- Clear filter button -->
    <Button
      v-if="status || query"
      variant="secondary"
      class="clear-filters"
      @click="status = ''; query = ''; $emit('input')"
    >
      <Xmark />
      {{ t('clear_filters') }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { Xmark } from '@iconoir/vue';
const { t } = useI18n({
  useScope: "local",
});
const status = defineModel("status");
const query = defineModel("query");
defineEmits<{ input: [] }>()

</script>

<style lang="scss" scoped>
.filter-bar {
  margin-bottom: var(--fluid-spacing-8);
  display: flex;
  gap: 1rem;
  @media screen and (max-width: 512px) {
    overflow-x: scroll;
    margin-inline: calc(var(--fluid-spacing-8) * -1);
    padding-inline: var(--fluid-spacing-8);
    padding-block: 0.3rem;
  }
}
.input {
  width: auto;
}
.clear-filters {
  flex-shrink: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "status": "Status",
    "all": "All",
    "active": "Active",
    "inactive": "Inactive",
    "search": "Search",
    "clear_filters": "Clear filters"
  },
  "de": {
    "status": "Status",
    "all": "Alle",
    "active": "Aktiv",
    "inactive": "Inaktiv",
    "search": "Suche",
    "clear_filters": "Filter zurücksetzen"
  }
}
</i18n>
