<template>
  <Container width="md" centered class="page-container">
    <div class="header-section">
      <Heading is="h1" size="xl">{{ t('items.edit.edit_item_title') }}</Heading>
    </div>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="form-grid lb-stack">
      <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
      <Alert v-if="successMessage" variant="success">{{ successMessage }}</Alert>

      <!-- Basic Info -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.edit.basic_info') }}</Heading>
        
        <div class="field-stack">
          <Input
            v-model="form.name"
            id="item-name"
            :label="t('items.edit.item_name')"
            required
          />

          <Textarea
            v-model="form.description"
            id="item-description"
            :label="t('items.edit.description')"
            rows="4"
          />

          <ImageInput
            v-model:images="form.images"
            v-model:new-images="form.newImages"
            collection="products"
            :record-id="route.params.id as string"
            id="item-images"
            :label="t('items.edit.images')"
          />

          <Switch
            v-model="form.active"
            id="item-active"
            :label="t('items.edit.active_status')"
            :description="t('items.edit.active_status_desc')"
          />
        </div>
      </Card>

      <!-- Location & Privacy Section -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.edit.location_privacy') }}</Heading>

        <div class="two-cols">
          <Input
            v-model="form.city"
            id="item-city"
            :label="t('items.edit.city')"
            required
          />

          <Input
            v-model="form.postal_code"
            id="item-postal-code"
            :label="t('items.edit.postal_code')"
            required
          />
        </div>

        <Input
          v-model="form.approx_location_note"
          id="item-approx"
          :label="t('items.edit.approx_area')"
        />

        <div class="private-box">
          <div class="private-badge">
            <Lock class="icon-lock" />
            <span>{{ t('items.edit.private_info') }}</span>
          </div>
          <Input
            v-model="form.pickup_address"
            id="item-pickup-address"
            :label="t('items.edit.exact_pickup_address')"
            required
          />
        </div>
      </Card>

      <!-- Rental Conditions -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t('items.edit.rental_terms') }}</Heading>

        <div class="two-cols">
          <Input
            v-model.number="form.deposit"
            id="item-deposit"
            type="number"
            min="0"
            :label="t('items.edit.deposit')"
          />

          <Input
            v-model.number="form.max_duration_days"
            id="item-duration"
            type="number"
            min="1"
            max="365"
            :label="t('items.edit.max_duration')"
          />
        </div>

        <Textarea
          v-model="form.terms_condition"
          id="item-terms"
          :label="t('items.edit.special_terms')"
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
          {{ t('items.edit.save_changes') }}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          :to="`/items/${route.params.id}`"
        >
          {{ t('items.edit.cancel') }}
        </Button>
        <Button
          variant="danger"
          size="lg"
          class="delete-btn"
          @click.prevent="handleDelete"
        >
          {{ t('items.edit.delete_item') }}
        </Button>
      </div>
    </form>
  </Container>
</template>

<script setup lang="ts">
import { Lock } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import Switch from "@/components/core/Switch.vue";
import Textarea from "@/components/core/Textarea.vue";
import ImageInput from "@/components/ImageInput.vue";
import type { Product } from "~~/models/product";

const { t } = useI18n();
const { pb, isValid } = usePocketbase();
const route = useRoute();
const router = useRouter();

if (!isValid.value) {
  navigateTo(`/login?redirect=/items/${route.params.id}/edit`);
}

const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const initialImages = ref<string[]>([]);

const form = reactive({
  name: "",
  description: "",
  images: [] as string[],
  newImages: [] as File[],
  active: true,
  city: "",
  postal_code: "",
  approx_location_note: "",
  pickup_address: "",
  deposit: 0,
  max_duration_days: 14,
  terms_condition: "",
});

onMounted(async () => {
  try {
    const item = await pb.collection("products").getOne<Product>(route.params.id as string);
    
    // Ensure only the owner or admin can edit
    if (item.user !== pb.authStore.record?.id && pb.authStore.record?.role !== "admin") {
      navigateTo("/profile/my-items");
      return;
    }

    form.name = item.name || "";
    form.description = item.description || "";
    form.images = [...(item.images || [])];
    initialImages.value = [...(item.images || [])];
    form.active = item.active !== false;
    form.city = item.city || "";
    form.postal_code = item.postal_code || "";
    form.approx_location_note = item.approx_location_note || "";
    form.pickup_address = item.pickup_address || "";
    form.deposit = item.deposit || 0;
    form.max_duration_days = item.max_duration_days || 14;
    form.terms_condition = item.terms_condition || "";
  } catch (err: any) {
    errorMessage.value = err?.message || "Failed to load item.";
  } finally {
    isLoading.value = false;
  }
});

async function handleSubmit() {
  try {
    isSubmitting.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("active", String(form.active));
    formData.append("city", form.city);
    formData.append("postal_code", form.postal_code);
    formData.append("approx_location_note", form.approx_location_note);
    formData.append("pickup_address", form.pickup_address);
    formData.append("deposit", String(form.deposit || 0));
    formData.append("max_duration_days", String(form.max_duration_days || 14));
    formData.append("terms_condition", form.terms_condition);

    // Remove deleted images using PocketBase "images-" modifier
    const removedImages = initialImages.value.filter(
      (img) => !form.images.includes(img)
    );
    for (const img of removedImages) {
      formData.append("images-", img);
    }

    // Append new uploaded images using PocketBase "images+" modifier
    for (const file of form.newImages) {
      formData.append("images+", file);
    }

    await pb.collection("products").update(route.params.id as string, formData);
    successMessage.value = t("items.edit.save_success");
    setTimeout(() => {
      router.push(`/items/${route.params.id}`);
    }, 800);
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || "";
    if (msg.includes("User_not_verified") || err?.response?.data?.message?.includes("User_not_verified")) {
      errorMessage.value = t("items.new.error_user_not_verified");
    } else {
      errorMessage.value = err?.message || "Failed to update item.";
    }
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!confirm(t("items.edit.confirm_delete"))) return;
  try {
    await pb.collection("products").delete(route.params.id as string);
    router.push("/profile/my-items");
  } catch (err: any) {
    errorMessage.value = err?.message || "Failed to delete item.";
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  padding-block: var(--fluid-spacing-8);
}
.header-section {
  margin-bottom: var(--fluid-spacing-6);
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
  flex-wrap: wrap;
  .delete-btn {
    margin-left: auto;
  }
}
.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}
</style>
