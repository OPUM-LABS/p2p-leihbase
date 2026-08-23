<template>
  <Container width="sm" centered>
    <Card class="lb-stack">
      <Heading is="h1" size="lg" cap>{{ t('auth.confirm_verification.title') }}</Heading>
      <p v-if="!success">
        {{ t('auth.confirm_verification.text') }}
      </p>
      <Alert v-if="error" variant="error">{{ error }}</Alert>
      <Button v-if="!success" @click="handleConfirm" :loading="loading">
        {{ t('auth.confirm_verification.confirm') }}
      </Button>
      <Alert v-if="success" variant="success">
        {{ t('auth.confirm_verification.success') }}
      </Alert>
      <Button v-if="success" to="/profile" variant="secondary">
        {{ t('auth.confirm_verification.to_profile') }}
      </Button>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import { ClientResponseError } from "pocketbase";

const route = useRoute();
const { pb } = usePocketbase();
const { t } = useI18n();

const success = ref(false);
const error = ref("");
const loading = ref(false);

const token = route.query.token as string;
if (!token) {
  error.value = t("auth.confirm_verification.errors.no_token");
}

async function handleConfirm() {
  loading.value = true;
  try {
    await pb.collection("users").confirmVerification(token);
    success.value = true;
  } catch (e) {
    console.error(e);
    if (
      e instanceof ClientResponseError &&
      e.response.data.token.code === "validation_invalid_token"
    ) {
      error.value = t("auth.confirm_verification.errors.invalid_token");
    } else {
      error.value = t("auth.confirm_verification.errors.general");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
p {
  margin: 0;
}
</style>
