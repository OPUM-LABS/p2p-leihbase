<template>
  <Container width="sm" centered class="container">
    <PageAlert class="alert" />
    <Card class="card">
      <!-- Title -->
      <h1>{{ t("edit_profile") }}</h1>
      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name -->
        <Input
          id="profile-edit-name-input"
          :label="t('name')"
          name="name"
          :value="user!.name"
          :error="errors.fields['name'] ? t(errors.fields['name']) : undefined"
          required
        />
        <!-- Buttons -->
        <div class="button-row">
          <Button to="/profile" variant="secondary">
            {{ t("cancel") }}
          </Button>
          <Button type="submit" :loading="loading" class="save-button">
            {{ t("save") }}
          </Button>
        </div>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import { ClientResponseError, type RecordModel } from "pocketbase";

const { pb, isValid, logout } = usePocketbase();
const user = ref<RecordModel | null>(null);
const { loading, update, errors } = usePocketbaseUpdate(pb, "users");
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("edit_profile"),
});

if (!isValid.value || !pb.authStore.record) {
  logout();
  navigateTo("/login");
} else {
  user.value = await pb.collection("users").getOne(pb.authStore.record.id);
}

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  console.log(data);
  try {
    await update(user.value!.id, data);
    navigateTo("/profile");
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (min-width: breakpoints.$breakpoint-md) {
  .container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 3rem;
  }
  .alert {
    margin: 0;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "edit_profile": "Edit profile",
    "name": "Name",
    "cancel": "Cancel",
    "save": "Save"
  },
  "de": {
    "edit_profile": "Profil bearbeiten",
    "name": "Name",
    "cancel": "Annulieren",
    "save": "Speichern"
  }
}
</i18n>
