<template>
  <Container width="sm" centered>
    <Card class="card lb-stack">
      <Heading is="h1" size="xl" cap data-testid="signup-h1">
        {{ t('auth.signup.title') }}
      </Heading>
      <i18n-t keypath="auth.signup.text" tag="p" for="login_text">
        <NuxtLink to="/login">{{ t('auth.signup.login_text') }}</NuxtLink>
      </i18n-t>
      <form @submit.prevent="handleSubmit" method="post">
        <Input
          id="name"
          name="name"
          :label="t('auth.signup.name')"
          type="text"
          data-testid="name-input"
          v-model="name"
          required
        />
        <Input
          id="email"
          name="email"
          :label="t('auth.signup.email')"
          type="email"
          data-testid="email-input"
          v-model="email"
          required
        />
        <Input
          id="password"
          name="password"
          :label="t('auth.signup.password')"
          type="password"
          data-testid="password-input"
          v-model="password"
          required
        />
        <fieldset v-if="leihbase?.privacy_policy_link" class="checkbox">
          <input
            id="terms-and-conditions"
            name="terms"
            type="checkbox"
            data-testid="tac-checkbox"
            v-model="terms"
            value="true"
            required
          />
          <label for="terms-and-conditions">
            <i18n-t keypath="auth.signup.terms_and_conditions"
              tag="span"
              for="terms_and_conditions_link"
            >
              <NuxtLink target="_blank" :to="leihbase.privacy_policy_link">{{
                t('auth.signup.terms_and_conditions_link')
              }}</NuxtLink>
            </i18n-t>
          </label>
        </fieldset>

        <cap-widget
          v-if="cap.instanceHost && cap.siteKey"
          id="floating"
          :data-cap-api-endpoint="`https://${cap.instanceHost}/${cap.siteKey}/`"
        ></cap-widget>

        <Alert
          v-if="!!signupError"
          variant="error"
          class="signup-alert"
          data-testid="signup-error"
        >
          {{ signupError }}
        </Alert>

        <Button
          :loading="loading"
          size="lg"
          type="submit"
          data-testid="submit-button"
          data-cap-floating="#floating"
          data-cap-floating-position="bottom"
        >
          {{ t('auth.signup.submit') }}
        </Button>
      </form>
    </Card>
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

const { t, locale } = useI18n();
const { pb, login } = usePocketbase();
const userStore = useUserStore();
const { leihbase } = storeToRefs(useLeihbase());

const {
  public: { cap },
} = useRuntimeConfig();

const name = ref("");
const email = ref("");
const password = ref("");
const terms = ref(false);

const signupError = ref<string>();
const loading = ref(false);

if (import.meta.client) {
  if (cap.instanceHost && cap.siteKey) {
    await import("https://cdn.jsdelivr.net/npm/cap-widget@0.1.52");
    await import("https://cdn.jsdelivr.net/npm/cap-widget@0.1.52/cap-floating.min.js");
  }
}

useHead({
  title: t("auth.signup.page_title"),
});

async function handleSubmit(e: SubmitEvent) {
  signupError.value = undefined;

  const trimmedEmail = email.value.trim();
  const trimmedName = name.value.trim();
  const rawPassword = password.value;

  if (!trimmedEmail || !rawPassword) {
    return;
  }

  if (rawPassword.length < 8) {
    signupError.value = t("auth.signup.errors.password_length");
    return;
  }

  loading.value = true;

  try {
    let detectedLocale = "en";
    const rawLang =
      (typeof navigator !== "undefined" ? navigator.language : locale.value) || "";
    if (rawLang.toLowerCase().startsWith("de")) {
      detectedLocale = "de";
    } else {
      detectedLocale = "en"; // English fallback for all other languages
    }

    const payload: Record<string, any> = {
      name: trimmedName,
      email: trimmedEmail,
      password: rawPassword,
      passwordConfirm: rawPassword,
      locale: detectedLocale,
    };

    if (leihbase.value?.privacy_policy_link) {
      payload.terms = terms.value;
    }

    // Include captcha token if form has one
    const formElement = e.target as HTMLFormElement;
    if (formElement) {
      const formData = new FormData(formElement);
      const capToken = formData.get("cap-token");
      if (capToken) {
        payload["cap-token"] = capToken;
      }
    }

    // 1. Create user account
    await pb.collection("users").create(payload);

    // 2. Request verification email in the background (non-blocking if email service is delayed)
    try {
      await pb.collection("users").requestVerification(trimmedEmail);
    } catch (verifError) {
      console.warn("Email verification request skipped or failed:", verifError);
    }

    // 3. Authenticate / Login
    try {
      await login(trimmedEmail, rawPassword);
      if (pb.authStore.record) {
        await userStore.login({ user: pb.authStore.record as User });
      }
    } catch (authErr) {
      console.warn("Auto-login after signup failed:", authErr);
      await navigateTo("/login");
      return;
    }

    // 4. Navigate to destination or profile
    const { path, intent } = userStore.$state.authenticationIntent;
    if (path) {
      if (intent && intent === "reservation") {
        userStore.showBanner(PageAlertType.AFTER_SIGNUP_RESERVATION_INTENT);
      } else {
        userStore.showBanner(PageAlertType.AFTER_SIGNUP);
      }
      await navigateTo(path);
    } else {
      userStore.showBanner(PageAlertType.AFTER_SIGNUP);
      await navigateTo("/profile");
    }
  } catch (err: any) {
    console.error("Signup error:", err);
    loading.value = false;

    const errorData = err?.response?.data || err?.data?.data || err?.data || {};
    const message = err?.response?.message || err?.data?.message || err?.message || "";

    const emailErrCode = errorData?.email?.code;
    const passwordErrCode = errorData?.password?.code || errorData?.passwordConfirm?.code;

    if (
      passwordErrCode === "validation_min_text_constraint" ||
      passwordErrCode === "validation_length_out_of_range"
    ) {
      signupError.value = t("auth.signup.errors.password_length");
    } else if (
      emailErrCode === "validation_not_unique" ||
      emailErrCode === "validation_values_not_unique" ||
      message?.toLowerCase().includes("unique")
    ) {
      signupError.value = t("auth.signup.errors.email_in_use");
    } else if (
      emailErrCode === "validation_is_email" ||
      emailErrCode === "validation_invalid_email"
    ) {
      signupError.value = t("auth.signup.errors.invalid_email");
    } else if (message === "Terms_required." || errorData?.terms?.code === "validation_required") {
      signupError.value = t("auth.signup.errors.terms_required");
    } else if (message === "Captcha_invalid." || errorData?.message === "Captcha_invalid.") {
      signupError.value = t("auth.signup.errors.captcha_invalid");
    } else if (errorData?.password?.message) {
      signupError.value = errorData.password.message;
    } else if (errorData?.email?.message) {
      signupError.value = errorData.email.message;
    } else if (errorData?.name?.message) {
      signupError.value = errorData.name.message;
    } else if (err?.status === 0 || message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("networkerror")) {
      signupError.value = `${t("auth.signup.errors.general")} (${err?.message || "Server unreachable"})`;
    } else if (message && message !== "Failed to create record.") {
      signupError.value = `${t("auth.signup.errors.general")} (${message})`;
    } else {
      signupError.value = t("auth.signup.errors.general");
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

.signup-alert {
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
