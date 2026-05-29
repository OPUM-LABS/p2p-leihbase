<template>
  <Alert v-if="type === AFTER_LOGIN">
    {{ t("success_login") }}
  </Alert>
  <Alert v-else-if="type === AFTER_LOGIN_RESERVATION_INTENT">
    {{ t("success_login_with_intent") }}
  </Alert>
  <Alert v-else-if="type === AFTER_SIGNUP">
    {{ t("success_signup") }}
  </Alert>
  <Alert v-else-if="type === AFTER_SIGNUP_RESERVATION_INTENT">
    <span>
      <strong>{{ t("success_signup_with_intent_bold") }}</strong>
      <br />
      {{ t("success_signup_with_intent") }}
    </span>
  </Alert>
</template>

<script setup lang="ts">
import Alert from "../core/Alert.vue";
import {
  AFTER_LOGIN,
  AFTER_LOGIN_RESERVATION_INTENT,
  AFTER_SIGNUP,
  AFTER_SIGNUP_RESERVATION_INTENT,
} from "./PageAlert.model";

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

<i18n lang="json">
{
  "en": {
    "success_login": "Logged in successfully!",
    "success_login_with_intent": "Logged in successfully! You can now continue reserving the product.",
    "success_signup": "Signed up successfully! A confirmation e-mail has been sent to your e-mail address.",
    "success_signup_with_intent_bold": "Signed up successfully! A confirmation e-mail has been sent to your e-mail address.",
    "success_signup_with_intent": "Reserve the product after confirming your e-mail address."
  },
  "de": {
    "success_login": "Erfolgreich eingeloggt!",
    "success_login_with_intent": "Erfolgreich eingeloggt! Der Gegenstand kann nun reserviert werden.",
    "success_signup": "Erfolgreich registriert! Eine Bestätigungs-E-Mail wurde an deine E-Mail-Adresse gesendet.",
    "success_signup_with_intent_bold": "Erfolgreich registriert! Eine Bestätigungs-E-Mail wurde an deine E-Mail-Adresse gesendet.",
    "success_signup_with_intent": "Reserviere den Gegenstand, nachdem du deine E-Mail-Adresse bestätigt hast."
  }
}
</i18n>
