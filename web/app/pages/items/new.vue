<template>
  <Container width="md" class="page-container">
    <div class="header-section">
      <Heading is="h1" size="xl">{{ t("list_item_title") }}</Heading>
      <p class="subtitle">{{ t("list_item_subtitle") }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid lb-stack">
      <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>

      <!-- Basic Info -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t("basic_info") }}</Heading>
        
        <div class="field-stack">
          <Input
            v-model="form.name"
            id="item-name"
            :label="t('item_name')"
            :placeholder="t('item_name_placeholder')"
            required
          />

          <Textarea
            v-model="form.description"
            id="item-description"
            :label="t('description')"
            :placeholder="t('description_placeholder')"
            rows="4"
          />

          <ImageInput
            v-model:images="form.images"
            v-model:new-images="form.newImages"
            collection="products"
            id="item-images"
            :label="t('images')"
            :description="t('images_help')"
          />
        </div>
      </Card>

      <!-- Location & Privacy Section -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t("location_privacy") }}</Heading>
        <p class="section-desc">{{ t("location_privacy_desc") }}</p>

        <div class="two-cols">
          <Input
            v-model="form.city"
            id="item-city"
            :label="t('city')"
            :placeholder="t('city_placeholder')"
            required
          />

          <Input
            v-model="form.postal_code"
            id="item-postal-code"
            :label="t('postal_code')"
            :placeholder="t('postal_code_placeholder')"
            required
          />
        </div>

        <Input
          v-model="form.approx_location_note"
          id="item-approx"
          :label="t('approx_area')"
          :placeholder="t('approx_area_placeholder')"
          :description="t('approx_area_help')"
        />

        <div class="private-box">
          <div class="private-badge">
            <Lock class="icon-lock" />
            <span>{{ t("private_info") }}</span>
          </div>
          <Input
            v-model="form.pickup_address"
            id="item-pickup-address"
            :label="t('exact_pickup_address')"
            :placeholder="t('exact_pickup_placeholder')"
            :description="t('exact_pickup_help')"
            required
          />
        </div>
      </Card>

      <!-- Rental Conditions -->
      <Card class="form-card">
        <Heading is="h2" size="md" class="card-heading">{{ t("rental_terms") }}</Heading>

        <div class="two-cols">
          <Input
            v-model.number="form.deposit"
            id="item-deposit"
            type="number"
            min="0"
            step="1"
            :label="t('deposit')"
            :placeholder="'0'"
            :description="t('deposit_help')"
          />

          <Input
            v-model.number="form.max_duration_days"
            id="item-duration"
            type="number"
            min="1"
            max="365"
            :label="t('max_duration')"
            :placeholder="'14'"
            :description="t('max_duration_help')"
          />
        </div>

        <Textarea
          v-model="form.terms_condition"
          id="item-terms"
          :label="t('special_terms')"
          :placeholder="t('special_terms_placeholder')"
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
          {{ t("publish_item") }}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          to="/profile/my-items"
        >
          {{ t("cancel") }}
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
import Textarea from "@/components/core/Textarea.vue";
import ImageInput from "@/components/ImageInput.vue";

const { t } = useI18n({ useScope: "local" });
const { pb, isValid } = usePocketbase();
const router = useRouter();

// Auth protection
if (!isValid.value) {
  navigateTo("/login?redirect=/items/new");
}

const isSubmitting = ref(false);
const errorMessage = ref("");

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
  if (!form.name.trim()) {
    errorMessage.value = t("error_name_required");
    return;
  }
  if (!form.city.trim() || !form.postal_code.trim()) {
    errorMessage.value = t("error_location_required");
    return;
  }
  if (!form.pickup_address.trim()) {
    errorMessage.value = t("error_address_required");
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

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
    errorMessage.value = err?.message || t("error_create_failed");
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: t("list_item_title"),
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

<i18n lang="json">
{
  "en": {
    "list_item_title": "List an Item to Lend",
    "list_item_subtitle": "Share your tools, gear, or appliances with your neighborhood.",
    "basic_info": "1. Basic Details",
    "item_name": "Item Title",
    "item_name_placeholder": "e.g., Bosch Cordless Drill, Camping Tent, Lawn Mower",
    "description": "Description",
    "description_placeholder": "Describe condition, what's included, tips on how to use it...",
    "images": "Photos",
    "images_help": "Clear photos increase borrower trust.",
    "location_privacy": "2. Location & Privacy",
    "location_privacy_desc": "Your approximate area is shown publicly. Your exact street address is kept hidden until a rental is confirmed.",
    "city": "City",
    "city_placeholder": "e.g., Cologne",
    "postal_code": "Postal Code",
    "postal_code_placeholder": "e.g., 50823",
    "approx_area": "Neighborhood / District (Public)",
    "approx_area_placeholder": "e.g., Ehrenfeld near Venloer Str.",
    "approx_area_help": "Helps neighbors estimate walking/driving distance.",
    "private_info": "Protected Pickup Information",
    "exact_pickup_address": "Exact Handover Address & Notes",
    "exact_pickup_placeholder": "e.g., Musterstraße 12, 3rd floor (Ring Schmidt)",
    "exact_pickup_help": "Only revealed to borrowers whose request you accept.",
    "rental_terms": "3. Rental Terms & Deposit",
    "deposit": "Security Deposit (€)",
    "deposit_help": "Refunded when item is returned in good condition.",
    "max_duration": "Max Rental Duration (Days)",
    "max_duration_help": "Maximum consecutive days one person can borrow.",
    "special_terms": "Handover / Care Instructions",
    "special_terms_placeholder": "e.g., Please clean before returning, battery must be charged...",
    "publish_item": "Publish Item",
    "cancel": "Cancel",
    "error_name_required": "Please provide an item title.",
    "error_location_required": "Please provide city and postal code.",
    "error_address_required": "Please provide your exact pickup address for confirmed bookings.",
    "error_create_failed": "Failed to create listing. Please check your inputs and try again."
  },
  "de": {
    "list_item_title": "Gegenstand zum Verleihen einstellen",
    "list_item_subtitle": "Teile Werkzeuge, Geräte oder Ausrüstung mit deiner Nachbarschaft.",
    "basic_info": "1. Grundlegende Details",
    "item_name": "Titel des Gegenstands",
    "item_name_placeholder": "z.B. Bosch Akku-Bohrschrauber, Campingzelt, Rasenmäher",
    "description": "Beschreibung",
    "description_placeholder": "Zustand beschreiben, was enthalten ist, Bedienungshinweise...",
    "images": "Fotos",
    "images_help": "Gute Fotos schaffen Vertrauen bei Ausleihern.",
    "location_privacy": "2. Standort & Privatsphäre",
    "location_privacy_desc": "Dein ungefährer Bereich wird öffentlich angezeigt. Deine genaue Adresse bleibt geschützt bis zur Bestätigung.",
    "city": "Stadt",
    "city_placeholder": "z.B. Köln",
    "postal_code": "Postleitzahl",
    "postal_code_placeholder": "z.B. 50823",
    "approx_area": "Stadtteil / Viertel (Öffentlich)",
    "approx_area_placeholder": "z.B. Ehrenfeld Nähe Venloer Str.",
    "approx_area_help": "Hilft Nachbarn, die Entfernung abzuschätzen.",
    "private_info": "Geschützte Abholadresse",
    "exact_pickup_address": "Genaue Abholadresse & Hinweise",
    "exact_pickup_placeholder": "z.B. Musterstraße 12, 3. OG (Klingel bei Schmidt)",
    "exact_pickup_help": "Wird nur Personen angezeigt, deren Ausleihanfrage du akzeptierst.",
    "rental_terms": "3. Leihbedingungen & Kaution",
    "deposit": "Kaution (€)",
    "deposit_help": "Wird nach unversehrter Rückgabe erstattet.",
    "max_duration": "Maximale Leihdauer (Tage)",
    "max_duration_help": "Maximale Anzahl an aufeinanderfolgenden Tagen.",
    "special_terms": "Übergabe- & Pflegehinweise",
    "special_terms_placeholder": "z.B. Bitte gereinigt zurückgeben, Akku bitte laden...",
    "publish_item": "Gegenstand veröffentlichen",
    "cancel": "Abbrechen",
    "error_name_required": "Bitte gib einen Titel für den Gegenstand an.",
    "error_location_required": "Bitte gib Stadt und Postleitzahl an.",
    "error_address_required": "Bitte gib die genaue Abholadresse für bestätigte Buchungen an.",
    "error_create_failed": "Erstellen fehlgeschlagen. Bitte überprüfe deine Eingaben."
  }
}
</i18n>
