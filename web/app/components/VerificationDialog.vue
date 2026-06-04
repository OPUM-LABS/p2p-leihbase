<template>
  <Dialog v-model:open="isOpen" inset :title="t('title')" size="sm">
    <div class="dialog">
      <VerifyEmail />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "./core/Dialog.vue";
import VerifyEmail from "./VerifyEmail.vue";

const { t } = useI18n({ useScope: "local" });
const { isOpen } = useVerificationDialog();
</script>

<i18n lang="json">
{
  "en": {
    "title": "Verify e-mail"
  },
  "de": {
    "title": "E-Mail bestätigen"
  }
}
</i18n>
