<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <!-- Title -->
      <Heading is="h1" size="xl" cap>
        {{ t('profile.change_password.change_password') }}
      </Heading>
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="lb-stack">
        <!-- Current password -->
        <Input
          id="profile-edit-current-password-input"
          :label="t('profile.change_password.current_password')"
          name="oldPassword"
          type="password"
          :error="
            errors.fields['oldPassword']
              ? t(errors.fields['oldPassword'])
              : undefined
          "
          required
        />
        <Divider spacing="md" />
        <!-- New password -->
        <Input
          id="profile-edit-new-password-input"
          :label="t('profile.change_password.new_password')"
          name="password"
          type="password"
          :error="
            errors.fields['password'] ? t(errors.fields['password']) : undefined
          "
          required
        />
        <!-- Confirm new password -->
        <Input
          id="profile-edit-confirm-password-input"
          :label="t('profile.change_password.confirm_password')"
          name="passwordConfirm"
          type="password"
          :error="
            errors.fields['passwordConfirm']
              ? t(errors.fields['passwordConfirm'])
              : undefined
          "
          required
        />
        <!-- Buttons -->
        <div class="button-row">
          <Button to="/profile" variant="secondary">
            {{ t('profile.change_password.cancel') }}
          </Button>
          <Button type="submit" :loading="loading" class="save-button">
            {{ t('profile.change_password.save') }}
          </Button>
        </div>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Divider from "@/components/core/Divider.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { ClientResponseError, type RecordModel } from "pocketbase";

const userStore = useUserStore();
const { pb, isValid, user, logout } = usePocketbase();
const { loading, update, errors } = usePocketbaseUpdate(pb, "users");
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("profile.change_password.change_password"),
});

if (!isValid.value) {
  navigateTo("/login");
}

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  try {
    await update(user.value!.id, data);
    logout();
    userStore.logout();
    navigateTo("/login");
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
