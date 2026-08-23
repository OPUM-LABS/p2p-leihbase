<template>
  <HorizontalScroll class="filter-bar">
    <!-- Status filter -->
    <Select
      :label="t('admin.filter_bar.status')"
      hide-label
      v-model="status"
      @input="$emit('input')"
    >
      <option value="" :aria-label="t('admin.filter_bar.all')">{{ t('admin.filter_bar.status') }}</option>
      <option value="active">{{ t('admin.filter_bar.active') }}</option>
      <option value="inactive">{{ t('admin.filter_bar.inactive') }}</option>
    </Select>
    <!-- Completeness filter -->
    <Select
      :label="t('admin.filter_bar.missing_info')"
      hide-label
      v-model="missing"
      @input="$emit('input')"
    >
      <option value="" :aria-label="t('admin.filter_bar.all')">{{ t('admin.filter_bar.missing_info') }}</option>
      <option value="photo">{{ t('admin.filter_bar.no_photo') }}</option>
      <option value="description">{{ t('admin.filter_bar.no_description') }}</option>
    </Select>
    <!-- Text filter -->
    <Input
      id="admin-product-input"
      :placeholder="`${t('admin.filter_bar.search')}...`"
      v-model="query"
      class="text-search"
      @input="$emit('input')"
    />
    <!-- Clear filter button -->
    <Button
      v-if="status || missing || query"
      variant="secondary"
      class="clear-filters"
      @click="
        status = '';
        missing = '';
        query = '';
        $emit('input');
      "
    >
      <Xmark />
      {{ t('admin.filter_bar.clear_filters') }}
    </Button>
  </HorizontalScroll>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import HorizontalScroll from "@/components/core/HorizontalScroll.vue";
import Input from "@/components/core/Input.vue";
import Select from "@/components/core/Select.vue";
import { Xmark } from "@iconoir/vue";

const { t } = useI18n({
  useScope: "local",
});
const status = defineModel("status");
const missing = defineModel("missing");
const query = defineModel("query");
defineEmits<{ input: [] }>();
</script>

<style lang="scss" scoped>
.filter-bar {
  margin-bottom: var(--fluid-spacing-8) !important;
  display: flex;
  gap: var(--fluid-spacing-4);
}
.text-search {
  width: auto !important;
  min-width: 200px;
}
.no-photos {
  width: auto;
}
.clear-filters {
  flex-shrink: 0;
}
</style>
