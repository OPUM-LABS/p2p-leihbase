<template>
  <Dialog v-model:open="isOpen" inset :title="t('auth.verify_email.title')" size="sm">
    <div class="dialog">
      <VerifyEmail />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "./core/Dialog.vue";
import VerifyEmail from "./VerifyEmail.vue";

const { t } = useI18n();
const { isOpen } = useVerificationDialog();
</script>
