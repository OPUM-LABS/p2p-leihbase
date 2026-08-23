<template>
  <Container width="sm" centered>
    <Card class="card lb-stack">
      <Heading is="h1" size="xl" cap data-testid="login-h1">
        {{ t('auth.login.title') }}
      </Heading>
      <i18n-t keypath="auth.login.text" tag="p" for="signup_text">
        <NuxtLink to="/signup" data-testid="signup-link">
          {{ t('auth.login.signup_text') }}
        </NuxtLink>
      </i18n-t>
      <form @submit.prevent="onLogin">
        <Input
          label="E-mail"
          type="email"
          id="email"
          name="email"
          data-testid="email-input"
          required
          v-model="email"
        />
        <Input
          :label="t('auth.login.password')"
          type="password"
          id="password"
          name="password"
          data-testid="password-input"
          required
          password-toggle
          v-model="password"
        />
        <Alert
          v-if="!!authenticationError"
          variant="error"
          class="error"
          data-testid="login-error"
        >
          <i18n-t keypath="auth.login.error" tag="span" for="error_signup">
            <NuxtLink to="/signup">{{ t('auth.login.error_signup') }}</NuxtLink>
          </i18n-t>
        </Alert>
        <Button
          :loading="loading"
          size="lg"
          type="submit"
          data-testid="submit-button"
        >
          {{ t('auth.login.submit') }}
        </Button>
      </form>
    </Card>
    <footer>
      <a href="/signup">{{ t('auth.login.signup') }}</a>
      •
      <a href="/reset-password">{{ t('auth.login.forgot_password') }}</a>
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
import { PageAlertType } from "@/components/page-alert/PageAlert.model";
import type { User } from "~~/models/User";

useHead({
  title: `Login`,
});

const { t } = useI18n();

const route = useRoute();
const userStore = useUserStore();
const { pb, isValid, login } = usePocketbase();

const email = ref(null);
const password = ref(null);

const loading = ref(false);
const authenticationError = ref(false);

// If the 'return' query parameter is set in the url,
// set the authentication intent
if (route.query.return) {
  userStore.setAuthenticationIntent(null, route.query.return as string);
}

async function onLogin() {
  authenticationError.value = false;
  loading.value = true;

  if (!email.value || !password.value) return;

  try {
    await login(email.value, password.value);
  } catch (e) {
    loading.value = false;
    authenticationError.value = true;
    return;
  }

  if (isValid.value) {
    userStore.login({ user: pb.authStore.record as User });
    // Show after-login banner on next page
    const { path, intent } = userStore.$state.authenticationIntent;
    if (path) {
      if (intent && intent === "reservation") {
        userStore.showBanner(PageAlertType.AFTER_LOGIN_RESERVATION_INTENT);
      } else {
        userStore.showBanner(PageAlertType.AFTER_LOGIN);
      }
      navigateTo(path);
    } else {
      userStore.showBanner(PageAlertType.AFTER_LOGIN);
      navigateTo("/profile");
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
form sl-input {
  width: 100%;
}
.error {
  margin: 0;
}
footer {
  width: 100%;
  margin-block: 1rem;
  text-align: center;
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
}
</style>
