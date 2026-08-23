<template>
  <Alert v-if="type === PageAlertType.AFTER_LOGIN">
    {{ t('alerts.success_login') }}
  </Alert>
  <Alert v-else-if="type === PageAlertType.AFTER_LOGIN_RESERVATION_INTENT">
    {{ t('alerts.success_login_with_intent') }}
  </Alert>
  <Alert v-else-if="type === PageAlertType.AFTER_SIGNUP">
    {{ t('alerts.success_signup') }}
  </Alert>
  <Alert v-else-if="type === PageAlertType.AFTER_SIGNUP_RESERVATION_INTENT">
    <span>
      <strong>{{ t('alerts.success_signup_with_intent_bold') }}</strong>
      <br />
      {{ t('alerts.success_signup_with_intent') }}
    </span>
  </Alert>
  <Alert v-else-if="type === PageAlertType.AFTER_LOGOUT" variant="info">
    {{ t('alerts.success_logout') }}
  </Alert>
</template>

<script setup lang="ts">
import Alert from "../core/Alert.vue";
import { PageAlertType } from "./PageAlert.model";

const { t } = useI18n({
  useScope: "local",
});

const userStore = useUserStore();

const show = ref(false);
const type = ref<string | null>(null);

// If a banner should be shown
if (userStore.banner) {
  // Show banner
  show.value = true;
  type.value = userStore.banner;
  // Reset to make banner not appear twice
  userStore.resetBanner();
}
</script>

<style scoped>
.alert {
  margin-bottom: var(--fluid-spacing-4);
}
</style>
