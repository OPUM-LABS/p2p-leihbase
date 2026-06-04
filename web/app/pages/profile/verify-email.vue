<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <Heading is="h1" size="xl" cap>{{ t("title") }}</Heading>

      <VerifyEmail />

      <!-- Back button -->
      <Link to="/profile">{{ t("return") }}</Link>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Link from "@/components/core/Link.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import VerifyEmail from "@/components/VerifyEmail.vue";

const { pb, isValid, logout } = usePocketbase();
const { t } = useI18n({ useScope: "local" });

useHead({
  title: t("title"),
});

if (!isValid.value || !pb.authStore?.record?.id) {
  logout();
  navigateTo("/login");
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
    "return": "Return to profile"
  },
  "de": {
    "title": "E-Mail bestätigen",
    "return": "Zurück zum Profil"
  }
}
</i18n>
