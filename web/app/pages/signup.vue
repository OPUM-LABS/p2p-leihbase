<template>
  <Container width="sm" centered>
    <Card class="card lb-stack">
      <Heading is="h1" size="xl" cap data-testid="signup-h1">
        {{ t("title") }}
      </Heading>
      <i18n-t keypath="text" tag="p" for="login_text">
        <NuxtLink to="/login">{{ t("login_text") }}</NuxtLink>
      </i18n-t>
      <form @submit.prevent="onSignup">
        <Input
          name="name"
          :label="t('name')"
          id="name"
          type="text"
          required
          v-model="name"
          data-testid="name-input"
        />
        <Input
          id="email"
          type="email"
          :label="t('email')"
          name="email"
          required
          v-model="email"
          data-testid="email-input"
        />
        <Input
          id="password"
          type="password"
          :label="t('password')"
          name="password"
          required
          password-toggle
          v-model="password"
          data-testid="password-input"
        />
        <fieldset class="checkbox">
          <input
            id="terms-and-conditions"
            type="checkbox"
            name="terms_and_conditions"
            data-testid="tac-checkbox"
            v-model="terms"
            required
          />
          <label for="terms-and-conditions">
            <i18n-t
              keypath="terms_and_conditions"
              tag="span"
              for="terms_and_conditions_link"
            >
              <NuxtLink target="_blank" to="/privacy-policy">{{
                t("terms_and_conditions_link")
              }}</NuxtLink>
            </i18n-t>
          </label>
        </fieldset>

        <sl-alert
          v-if="!!signupError"
          variant="danger"
          :open="!!signupError"
          data-testid="signup-error"
        >
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          {{ signupError }}
        </sl-alert>
        <Button
          :loading="loading"
          size="lg"
          type="submit"
          data-testid="submit-button"
        >
          {{ t("submit") }}
        </Button>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/Input.vue";
import {
  AFTER_SIGNUP,
  AFTER_SIGNUP_RESERVATION_INTENT,
} from "@/components/page-alert/PageAlert.model";
import { ClientResponseError } from "pocketbase";

if (process.client) {
  await import("@shoelace-style/shoelace/dist/components/alert/alert.js");
  await import("@shoelace-style/shoelace/dist/components/icon/icon.js");
}

const { t } = useI18n({
  useScope: "local",
});
const userStore = useUserStore();
const { pb, login } = usePocketbase();

const signupError = ref<string>();
const loading = ref(false);

useHead({
  title: t("page_title"),
});

const name = ref(null);
const email = ref(null);
const password = ref(null);
const terms = ref(false);

async function onSignup() {
  const data = {
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirm: password.value,
    terms: terms.value,
  };
  signupError.value = null;
  loading.value = true;

  try {
    // Create account
    await pb.collection("users").create(data);

    // Send an email verification request
    await pb.collection("users").requestVerification(data.email);

    // Authenticate
    await login(data.email, data.password);

    // Login
    userStore.login();

    // Routing
    const { path, intent } = userStore.$state.authenticationIntent;
    if (path) {
      if (intent && intent === "reservation") {
        userStore.showBanner(AFTER_SIGNUP_RESERVATION_INTENT);
      } else {
        userStore.showBanner(AFTER_SIGNUP);
      }
      navigateTo(path);
    } else {
      userStore.showBanner(AFTER_SIGNUP);
      navigateTo("/profile");
    }
  } catch (e) {
    console.log(e);
    loading.value = false;
    if (
      e instanceof ClientResponseError &&
      e.data?.data?.password?.code === "validation_length_out_of_range"
    ) {
      signupError.value = t("errors.password_length");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.email?.code === "validation_invalid_email"
    ) {
      signupError.value = t("errors.invalid_email");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.email?.code === "validation_not_unique"
    ) {
      signupError.value = t("errors.email_in_use");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.terms?.code === "validation_required"
    ) {
      signupError.value = t("errors.terms_required");
    } else {
      signupError.value = t("errors.general");
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

form {
  max-width: var(--max-text-width);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
form sl-input {
  width: 100%;
}
sl-alert::part(base) {
  width: 100%;
}

fieldset.checkbox {
  border: 0;
  padding: 0.5rem 0;
  width: 100%;
  input {
    margin-right: 0.5rem;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "page_title": "Sign up",
    "title": "Sign up",
    "text": "Already have an account? {0}.",
    "login_text": "Sign in",
    "name": "Name",
    "email": "E-Mail",
    "password": "Password",
    "submit": "Sign up",
    "terms_and_conditions": "I have read and agree to the {0}, for the use of my personal data.",
    "terms_and_conditions_link": "data protection information",

    "errors": {
      "password_ength": "Password should be at least 8 characters long.",
      "invalid_email": "E-mail address is invalid or already in use.",
      "email_in_use": "There is already an account with this e-mail address.",
      "terms_required": "To proceed, you must agree to the data protection terms.",
      "general": "An error occured during sign up, please try again."
    }
  },
  "de": {
    "page_title": "Registrieren",
    "title": "Registrieren",
    "text": "Du hast bereits ein Konto? {0}.",
    "login_text": "Einloggen",
    "name": "Name",
    "email": "E-Mail",
    "password": "Passwort",
    "terms_and_conditions": "Ich habe die {0}, zur Nutzung meiner personenbezogenen Daten gelesen und bin damit einverstanden.",
    "terms_and_conditions_link": "Datenschutzhinweisen",
    "submit": "Registrieren",
    "errors": {
      "password_length": "Dein Passwort sollte mindestens 8 Zeichen lang sein.",
      "invalid_email": "Die E-Mail ist ungültig oder wird bereits verwendet.",
      "email_in_use": "Es gibt bereits ein Konto mit dieser E-Mail-Adresse.",
      "terms_required": "Um fortzufahren, musst du den Datenschutzbestimmungen zustimmen.",
      "general": "Beim Erstellen deiner Account ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
