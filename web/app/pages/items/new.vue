<template>
  <Container width="md" centered class="page-container">
    <div class="header-section">
      <Heading is="h1" size="xl">{{ t('items.new.list_item_title') }}</Heading>
      <p class="subtitle">{{ t('items.new.list_item_subtitle') }}</p>
    </div>

    <!-- Prominent Verification Banner if user is not verified -->
    <div v-if="!isVerified" class="verification-banner">
      <div class="verification-header">
        <div class="icon-circle">
          <Mail class="icon-mail" />
        </div>
        <div class="verification-text">
          <Heading is="h2" size="sm" class="verification-title">
            {{ t('items.new.verification_required_title') }}
          </Heading>
          <p class="verification-desc">
            {{ t('items.new.verification_required_desc', { email: userEmail }) }}
          </p>
        </div>
      </div>

      <Alert v-if="resendSuccess" variant="success" size="sm">
        {{ resendSuccessMessage }}
      </Alert>
      <Alert v-if="resendError" variant="error" size="sm">
        {{ resendError }}
      </Alert>

      <div class="verification-actions">
        <Button
          type="button"
          variant="primary"
          size="sm"
          :loading="isResending"
          @click="handleResendVerification"
        >
          <Mail class="icon-btn" />
          {{ isResending ? t('items.new.resending') : t('items.new.resend_verification') }}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          to="/profile/verify-email"
        >
          {{ t('items.new.open_verification_page') }}
        </Button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid lb-stack">
      <!-- Error Alert -->
      <div v-if="errorMessage" class="error-wrapper">
        <Alert variant="error" class="error-alert">
          <div class="error-box">
            <span class="error-text">{{ errorMessage }}</span>
            <div v-if="isUnverifiedError || !isVerified" class="unverified-inline-actions">
              <Button
                type="button"
                variant="primary"
                size="sm"
                :loading="isResending"
                @click="handleResendVerification"
              >
                <Mail class="icon-btn" />
                {{ isResending ? t('items.new.resending') : t('items.new.resend_verification') }}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                to="/profile/verify-email"
              >
                {{ t('items.new.open_verification_page') }}
              </Button>
            </div>
          </div>
        </Alert>
        <Alert v-if="resendSuccess" variant="success" size="sm">
          {{ resendSuccessMessage }}
        </Alert>
      </div>

      <!-- Basic Info -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.new.basic_info') }}</Heading>
        
        <div class="field-stack">
          <Input
            v-model="form.name"
            id="item-name"
            :label="t('items.new.item_name')"
            :placeholder="t('items.new.item_name_placeholder')"
            required
          />

          <Textarea
            v-model="form.description"
            id="item-description"
            :label="t('items.new.description')"
            :placeholder="t('items.new.description_placeholder')"
            rows="4"
          />

          <ImageInput
            v-model:images="form.images"
            v-model:new-images="form.newImages"
            collection="products"
            id="item-images"
            :label="t('items.new.images')"
            :description="t('items.new.images_help')"
          />
        </div>
      </Card>

      <!-- Location & Privacy Section -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.new.location_privacy') }}</Heading>
        <p class="section-desc">{{ t('items.new.location_privacy_desc') }}</p>

        <div v-if="hasProfileAddress" class="profile-address-toggle-box">
          <Switch
            v-model="useProfileAddress"
            id="use-profile-address"
            :label="t('items.new.use_profile_address')"
            :description="t('items.new.use_profile_address_desc')"
            orientation="horizontal"
          />
        </div>

        <div class="two-cols">
          <Input
            v-model="form.city"
            id="item-city"
            :label="t('items.new.city')"
            :placeholder="t('items.new.city_placeholder')"
            :disabled="useProfileAddress && !!userCity"
            required
          />

          <Input
            v-model="form.postal_code"
            id="item-postal-code"
            :label="t('items.new.postal_code')"
            :placeholder="t('items.new.postal_code_placeholder')"
            :disabled="useProfileAddress && !!userPostalCode"
            required
          />
        </div>

        <Input
          v-model="form.approx_location_note"
          id="item-approx"
          :label="t('items.new.approx_area')"
          :placeholder="t('items.new.approx_area_placeholder')"
          :description="t('items.new.approx_area_help')"
        />

        <div class="private-box">
          <div class="private-badge">
            <Lock class="icon-lock" />
            <span>{{ t('items.new.private_info') }}</span>
          </div>
          <Input
            v-model="form.pickup_address"
            id="item-pickup-address"
            :label="t('items.new.exact_pickup_address')"
            :placeholder="t('items.new.exact_pickup_placeholder')"
            :description="t('items.new.exact_pickup_help')"
            :disabled="useProfileAddress && !!userAddress"
            required
          />
        </div>
      </Card>

      <!-- Rental Conditions -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.new.rental_terms') }}</Heading>

        <div class="two-cols">
          <Input
            v-model.number="form.deposit"
            id="item-deposit"
            type="number"
            min="0"
            step="1"
            :label="t('items.new.deposit')"
            :placeholder="'0'"
            :description="t('items.new.deposit_help')"
          />

          <Input
            v-model.number="form.max_duration_days"
            id="item-duration"
            type="number"
            min="1"
            max="365"
            :label="t('items.new.max_duration')"
            :placeholder="'14'"
            :description="t('items.new.max_duration_help')"
          />
        </div>

        <Textarea
          v-model="form.terms_condition"
          id="item-terms"
          :label="t('items.new.special_terms')"
          :placeholder="t('items.new.special_terms_placeholder')"
          rows="3"
        />
      </Card>

      <div class="form-actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          :loading="isSubmitting"
        >
          {{ t('items.new.publish_item') }}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          to="/profile/my-items"
        >
          {{ t('items.new.cancel') }}
        </Button>
      </div>
    </form>
  </Container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Lock, Mail } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import Switch from "@/components/core/Switch.vue";
import Textarea from "@/components/core/Textarea.vue";
import ImageInput from "@/components/ImageInput.vue";

const { t } = useI18n();
const { pb, isValid, user } = usePocketbase();
const router = useRouter();

// Auth protection
if (!isValid.value) {
  navigateTo("/login?redirect=/items/new");
}

const isVerified = computed(() => Boolean(user.value?.verified || pb.authStore.record?.verified));
const userEmail = computed(() => user.value?.email || pb.authStore.record?.email || "");

const userCity = computed(() => (pb.authStore.record?.city || user.value?.city || ""));
const userPostalCode = computed(() => (pb.authStore.record?.postal_code || user.value?.postal_code || ""));
const userAddress = computed(() => (pb.authStore.record?.address || user.value?.address || ""));
const hasProfileAddress = computed(() => Boolean(userCity.value || userPostalCode.value || userAddress.value));
const useProfileAddress = ref(false);

function applyProfileAddress() {
  if (userCity.value) form.city = userCity.value;
  if (userPostalCode.value) form.postal_code = userPostalCode.value;
  if (userAddress.value) form.pickup_address = userAddress.value;
}

watch(useProfileAddress, (newVal) => {
  if (newVal) {
    applyProfileAddress();
  }
});

onMounted(async () => {
  if (isValid.value) {
    try {
      await pb.collection("users").authRefresh();
    } catch (e) {
      // Background refresh failure can be safely ignored
    }
  }
  if (hasProfileAddress.value) {
    useProfileAddress.value = true;
    applyProfileAddress();
  }
});

const isSubmitting = ref(false);
const errorMessage = ref("");
const isUnverifiedError = ref(false);

const isResending = ref(false);
const resendSuccess = ref(false);
const resendSuccessMessage = ref("");
const resendError = ref("");

async function handleResendVerification() {
  const email = userEmail.value;
  if (!email) {
    resendError.value = t("auth.verify_email.general_error");
    return;
  }
  isResending.value = true;
  resendError.value = "";
  resendSuccess.value = false;
  try {
    await pb.collection("users").requestVerification(email);
    resendSuccess.value = true;
    resendSuccessMessage.value = t("items.new.verification_sent", {
      email,
    });
  } catch (err: any) {
    console.error("Failed to resend verification email:", err);
    resendError.value = t("auth.verify_email.general_error");
  } finally {
    isResending.value = false;
  }
}

const form = reactive({
  name: "",
  description: "",
  images: [] as string[],
  newImages: [] as File[],
  city: "",
  postal_code: "",
  approx_location_note: "",
  pickup_address: "",
  deposit: 0,
  max_duration_days: 14,
  terms_condition: "",
});

async function handleSubmit() {
  errorMessage.value = "";
  isUnverifiedError.value = false;

  if (!form.name.trim()) {
    errorMessage.value = t("items.new.error_name_required");
    return;
  }
  if (!form.city.trim() || !form.postal_code.trim()) {
    errorMessage.value = t("items.new.error_location_required");
    return;
  }
  if (!form.pickup_address.trim()) {
    errorMessage.value = t("items.new.error_address_required");
    return;
  }

  if (!isVerified.value) {
    isUnverifiedError.value = true;
    errorMessage.value = t("items.new.error_user_not_verified");
    return;
  }

  try {
    isSubmitting.value = true;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("city", form.city);
    formData.append("postal_code", form.postal_code);
    formData.append("approx_location_note", form.approx_location_note);
    formData.append("pickup_address", form.pickup_address);
    formData.append("deposit", String(form.deposit || 0));
    formData.append("max_duration_days", String(form.max_duration_days || 14));
    formData.append("terms_condition", form.terms_condition);
    formData.append("active", "true");
    formData.append("user", pb.authStore.record?.id || "");

    for (const file of form.newImages) {
      formData.append("images", file);
    }

    const created = await pb.collection("products").create(formData);
    await router.push(`/items/${created.id}`);
  } catch (err: any) {
    console.error("Failed to create item:", err);
    const msg = err?.data?.message || err?.message || "";
    if (msg.includes("User_not_verified") || err?.response?.data?.message?.includes("User_not_verified")) {
      isUnverifiedError.value = true;
      errorMessage.value = t("items.new.error_user_not_verified");
    } else {
      errorMessage.value = err?.message || t("items.new.error_create_failed");
    }
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: t("items.new.list_item_title"),
});
</script>

<style lang="scss" scoped>
.page-container {
  padding-block: var(--fluid-spacing-8);
}

.header-section {
  margin-bottom: var(--fluid-spacing-6);
  .subtitle {
    color: var(--color-gray-600);
    margin-top: 0.25rem;
  }
}

.verification-banner {
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  border-radius: var(--border-radius, 8px);
  padding: 1.25rem 1.5rem;
  margin-bottom: var(--fluid-spacing-6);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1);

  .verification-header {
    display: flex;
    gap: 1rem;
    align-items: flex-start;

    .icon-circle {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .icon-mail {
        width: 1.4rem;
        height: 1.4rem;
        color: #b45309;
      }
    }

    .verification-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .verification-title {
        color: #92400e;
        font-weight: var(--font-weight-bold, 700);
        margin: 0;
      }

      .verification-desc {
        color: #78350f;
        font-size: 0.95rem;
        margin: 0;
        line-height: 1.4;
      }
    }
  }

  .verification-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }
}

.error-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .error-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;

    .unverified-inline-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }
  }
}

.icon-btn {
  width: 1.1em;
  height: 1.1em;
  margin-right: 0.35rem;
  display: inline-block;
  vertical-align: middle;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-6);
}

.form-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-heading {
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: 0.5rem;
}

.section-desc {
  font-size: 0.9rem;
  color: var(--color-gray-600);
  margin-top: -0.5rem;
}

.profile-address-toggle-box {
  background: var(--color-gray-50, #f8f9fa);
  border: 1px solid var(--color-gray-300, #e9ecef);
  border-radius: var(--border-radius, 8px);
  padding: 0.85rem 1rem;
}

.field-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.private-box {
  background: var(--color-gray-50, #f8f9fa);
  border: 1px solid var(--color-gray-300, #e9ecef);
  border-radius: var(--border-radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .private-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: var(--font-weight-semibold);
    color: #495057;

    .icon-lock {
      width: 1rem;
      height: 1rem;
      color: #e03131;
    }
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
