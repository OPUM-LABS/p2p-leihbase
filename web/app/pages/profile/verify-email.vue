<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <Heading is="h1" size="xl" cap>{{ t("title") }}</Heading>

      <!-- Already verified -->
      <p v-if="user?.verified">{{ t("already_verified") }}</p>
      <Button v-if="user?.verified" to="/profile">{{ t("return") }}</Button>

      <!-- Not yet verified -->
      <p v-if="!user?.verified">
        {{ t("not_verified") }}
      </p>

      <!-- Success -->
      <Alert v-if="success" variant="success">{{ t("success") }}</Alert>

      <!-- Error -->
      <Alert v-if="error" variant="error">{{ error }}</Alert>

      <!-- Send email button -->
      <Button
        v-if="!user?.verified && !success"
        :loading="loading"
        @click="handleRequest"
      >
        {{ t("resend") }}
      </Button>

      <!-- Back button -->
      <Link to="/profile">{{ t("return") }}</Link>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import type { RecordModel } from "pocketbase";
import Link from "../../components/Link.vue";

const { pb, isValid, logout } = usePocketbase();
const { t } = useI18n({
  useScope: "local",
});

const user = ref<RecordModel>();
const success = ref(false);
const error = ref<string>();
const loading = ref(false);

useHead({
  title: t("title"),
});

if (!isValid.value || !pb.authStore?.record?.id) {
  logout();
  navigateTo("/login");
} else {
  user.value = await pb.collection("users").getOne(pb.authStore.record.id);
}

async function handleRequest() {
  loading.value = true;
  try {
    await pb.collection("users").requestVerification(user?.value?.email);
    success.value = true;
  } catch (e) {
    error.value = t("general_error");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

p {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Verify e-mail",
    "already_verified": "Your e-mail address is already verified!",
    "not_verified": "Your e-mail address is not yet verified. You find a verification e-mail in your inbox, or request a new verification e-mail using the button below.",
    "resend": "Resend verification e-mail",
    "return": "Return to profile",
    "general_error": "Something went wrong while sending a new verification e-mail. Try again later, or contact us to resolve the issue.",
    "success": "A new verification e-mail has been sent!"
  },
  "de": {
    "title": "E-Mail bestätigen",
    "already_verified": "Deine E-Mail-Adresse ist bereits bestätigt!",
    "not_verified": "Deine E-Mail-Adresse ist noch nicht bestätigt. Du findest eine Bestätigungs-E-Mail in deinem Posteingang, oder fordere eine neue Bestätigungs-E-Mail über den untenstehenden Button an.",
    "resend": "Bestätigungs-E-Mail erneut senden",
    "return": "Zurück zum Profil",
    "general_error": "Beim Verschicken der Bestätigungs-Mail gab es ein Problem. Versuch es später erneut, oder kontaktiere uns um das Problem zu beheben.",
    "success": "Eine neue Bestätigungs-Mail wurde gesendet!"
  }
}
</i18n>
