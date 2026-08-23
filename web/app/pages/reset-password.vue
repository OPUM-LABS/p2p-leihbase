<template>
  <Container width="sm" centered class="container">
    <Alert v-if="success" class="alert">{{ t('auth.reset_password.submit_success') }}</Alert>
    <Alert v-else-if="error" variant="error" class="alert">{{
      t('auth.reset_password.submit_general_error')
    }}</Alert>
    <Card class="lb-stack">
      <Heading is="h1" size="xl" cap>{{ t('auth.reset_password.title') }}</Heading>
      <p>{{ t('auth.reset_password.text') }}</p>
      <form @submit.prevent="handleSubmit" class="lb-stack">
        <Input
          label="E-mail"
          type="email"
          id="email"
          name="email"
          v-model="email"
          required
        />
        <Button size="lg" type="submit">{{ t('auth.reset_password.submit') }}</Button>
      </form>
    </Card>
    <footer>
      <a href="/login">{{ t('auth.reset_password.login') }}</a>
      •
      <a href="/signup">{{ t('auth.reset_password.signup') }}</a>
    </footer>
  </Container>
</template>

<script lang="ts" setup>
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";

const { t } = useI18n({
  useScope: "local",
});

const { pb } = usePocketbase();

useHead({
  title: t("auth.reset_password.page_title"),
});

const email = ref<string>();
const error = ref(false);
const success = ref(false);

async function handleSubmit() {
  if (!email.value) return;

  error.value = false;

  try {
    await pb.collection("users").requestPasswordReset(email.value);
  } catch (e) {
    error.value = true;
    email.value = "";
    return;
  }
  success.value = true;
  email.value = "";
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

p {
  margin: 0;
}

footer {
  width: 100%;
  margin-block: 1rem;
  text-align: center;
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
}

button {
  align-self: flex-start;
}
</style>
