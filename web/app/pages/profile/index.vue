<template>
  <Container width="sm" centered class="container">
    <PageAlert class="alert" />
    <Card class="card">
      <div class="heading row">
        <h1>{{ t("profile") }}</h1>
        <Button to="/profile/edit">{{ t("edit_profile") }}</Button>
      </div>
      <KeyValue :title="t('name')" :value="user.name" />
      <KeyValue :title="t('email')" :value="user.email" />
      <p>
        <Link href="/profile/change-email">{{ t("change_email") }}</Link>
        <br />
        <Link href="/profile/change-password">{{ t("change_password") }}</Link>
      </p>
    </Card>
  </Container>
</template>

<script setup>
import { KeyValue } from "#components";
import Link from "../../components/Link.vue";
const { pb, isValid, logout } = usePocketbase();
const router = useRouter();

const user = ref(null);

const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("profile"),
});

if (!isValid.value) {
  logout();
  router.push("/login");
} else {
  user.value = await pb.collection("users").getOne(pb.authStore.record.id);
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
}

@media (min-width: breakpoints.$breakpoint-md) {
  .container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 3rem;
  }

  .heading {
    margin-top: -1em;
  }
  .alert {
    margin: 0;
  }
  p:last-child {
    margin: 0;
  }
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
    "change_email": "E-Mail Address ändern",
    "change_password": "Passwort ändern",
    "logout": "Ausloggen"
  }
}
</i18n>
