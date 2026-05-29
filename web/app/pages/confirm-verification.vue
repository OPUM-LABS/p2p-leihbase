<template>
  <Container width="sm" centered>
    <Card class="lb-stack">
      <Heading is="h1" size="lg" cap>{{ t("title") }}</Heading>
      <p v-if="!success">
        {{ t("text") }}
      </p>
      <Alert v-if="error" variant="error">{{ error }}</Alert>
      <Button v-if="!success" @click="handleConfirm" :loading="loading">
        {{ t("confirm") }}
      </Button>
      <Alert v-if="success" variant="success">
        {{ t("success") }}
      </Alert>
      <Button v-if="success" to="/profile" variant="secondary">
        {{ t("to_profile") }}
      </Button>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import { ClientResponseError } from "pocketbase";

const route = useRoute();
const { pb } = usePocketbase();
const { t } = useI18n({ useScope: "local" });

const success = ref(false);
const error = ref("");
const loading = ref(false);

const token = route.query.token as string;
if (!token) {
  error.value = t("errors.no_token");
}

async function handleConfirm() {
  loading.value = true;
  try {
    await pb.collection("users").confirmVerification(token);
    success.value = true;
  } catch (e) {
    console.error(e);
    if (
      e instanceof ClientResponseError &&
      e.response.data.token.code === "validation_invalid_token"
    ) {
      error.value = t("errors.invalid_token");
    } else {
      error.value = t("errors.general");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
p {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Confirm e-mail address",
    "text": "Confirm your e-mail address using the button below.",
    "confirm": "Confirm e-mail",
    "success": "Your e-mail address is verified!",
    "to_profile": "Open profile",
    "errors": {
      "no_token": "We can't verify your e-mail address, no verification token got provided. Try again or contact us to resolve the issue.",
      "invalid_token": "The verification token is invalid. Try again or contact us to resolve the issue.",
      "general": "Something went wrong while validation your e-mail adddress. Please try again later, or contact us to resolve the issue."
    }
  },
  "de": {
    "title": "E-Mail Address bestätigen",
    "text": "Bestätige deine E-Mail-Adresse mit dem untenstehenden Button.",
    "confirm": "E-Mail bestätigen",
    "success": "Deine E-Mail-Adresse ist bestätigt!",
    "to_profile": "Profil öffnen",
    "errors": {
      "no_token": "Wir können deine E-Mail-Adresse nicht bestätigen, da kein Verifizierungs-Token bereitgestellt wurde. Versuche es erneut oder kontaktiere uns, um das Problem zu lösen.",
      "invalid_token": "Das Verifizierungstoken ist ungültig. Versuch es noch einmal oder kontaktiere uns, um das Problem zu lösen.",
      "general": "Beim Validieren deiner E-Mail-Adresse ist etwas schiefgelaufen. Bitte versuche es später erneut oder kontaktiere uns, um das Problem zu lösen."
    }
  }
}
</i18n>
