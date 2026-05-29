<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <div class="heading row">
        <Heading is="h1" size="xl" cap data-testid="profile-h1">
          {{ t("profile") }}
        </Heading>
        <Button to="/profile/edit" size="md">{{ t("edit_profile") }}</Button>
      </div>
      <KeyValue :title="t('name')" :value="user?.name" />
      <KeyValue :title="t('email')" :value="user?.email" />
      <Alert v-if="!user?.verified" variant="warning" size="sm">
        <span>
          {{ t("unverified") }}
          <Link to="/profile/verify-email">{{ t("more_info") }}</Link
          >.
        </span>
      </Alert>
      <Divider spacing="md" />
      <p>
        <!-- <Link href="/profile/change-email">{{ t("change_email") }}</Link> -->
        <!-- <br /> -->
        <Link to="/profile/change-password">{{ t("change_password") }}</Link>
      </p>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import type { RecordModel } from "pocketbase";
import KeyValue from "../../components/KeyValue.vue";
import Link from "../../components/Link.vue";

const { pb, isValid, logout } = usePocketbase();
const user = ref<RecordModel>();
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("profile"),
});

if (!isValid.value || !pb.authStore?.record?.id) {
  logout();
  navigateTo("/login");
} else {
  user.value = await pb.collection("users").getOne(pb.authStore.record.id);
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

p:last-child {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "profile": "Profile",
    "edit_profile": "Edit",
    "name": "Name",
    "email": "E-mail",
    "password": "Password",
    "unverified": "Your email address hasn't been confirmed yet.",
    "more_info": "More info",
    "change_email": "Update e-mail",
    "change_password": "Update password",
    "logout": "Logout"
  },
  "de": {
    "profile": "Profil",
    "edit_profile": "Bearbeiten",
    "name": "Name",
    "email": "E-Mail Address",
    "password": "Passwort",
    "unverified": "Deine E-Mail-Adresse wurde noch nicht bestätigt.",
    "more_info": "Mehr Infos",
    "change_email": "E-Mail Address ändern",
    "change_password": "Passwort ändern",
    "logout": "Ausloggen"
  }
}
</i18n>
