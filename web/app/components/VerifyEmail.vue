<template>
  <div class="lb-stack">
    <!-- Already verified -->
    <p v-if="user?.verified">{{ t('auth.verify_email.already_verified') }}</p>
    <slot v-if="user?.verified" name="verified"></slot>

    <!-- Not yet verified -->
    <p v-if="!user?.verified">
      {{ t('auth.verify_email.not_verified') }}
    </p>

    <!-- Success -->
    <Alert v-if="success" variant="success">{{ t('auth.verify_email.success') }}</Alert>

    <!-- Error -->
    <Alert v-if="error" variant="error">{{ error }}</Alert>

    <!-- Send email button -->
    <Button
      v-if="!user?.verified && !success"
      :loading="loading"
      @click="handleRequest"
    >
      {{ t('auth.verify_email.resend') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";

const { pb, user } = usePocketbase();
const { t } = useI18n();

const success = ref(false);
const error = ref<string>();
const loading = ref(false);

useHead({
  title: t("auth.verify_email.title"),
});

async function handleRequest() {
  loading.value = true;
  try {
    await pb
      .collection("users")
      .requestVerification(pb.authStore?.record?.email);
    success.value = true;
  } catch (e) {
    error.value = t("auth.verify_email.general_error");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

p {
  margin: 0;
}
</style>
