<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <Heading is="h1" size="xl" cap>{{ t('profile.verify_email.title') }}</Heading>

      <VerifyEmail>
        <template #verified>
          <Button to="/profile">{{ t('profile.verify_email.return') }}</Button>
        </template>
      </VerifyEmail>

      <!-- Back button -->
      <Link to="/profile">{{ t('profile.verify_email.return') }}</Link>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Link from "@/components/core/Link.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import VerifyEmail from "@/components/VerifyEmail.vue";

const { pb, isValid } = usePocketbase();
const userStore = useUserStore();
const { t } = useI18n();

useHead({
  title: t("profile.verify_email.title"),
});

if (!isValid.value) {
  navigateTo("/login");
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

p {
  margin: 0;
}
</style>
