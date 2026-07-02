<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location" />

    <form
      v-if="location"
      method="POST"
      class="lb-stack"
      @submit.prevent="handleSubmit"
    >
      <Input
        :label="t('name')"
        name="name"
        :value="location.name"
        :error="errors.fields['name'] ? t(errors.fields['name']) : undefined"
        required
        class="max-w"
      />
      <Input
        :label="t('address')"
        name="address"
        :value="location.address"
        :error="
          errors.fields['address'] ? t(errors.fields['address']) : undefined
        "
        required
        class="max-w"
      />
      <Input
        :label="t('email')"
        name="email"
        :value="location.email"
        :error="errors.fields['email'] ? t(errors.fields['email']) : undefined"
        required
        autocomplete="off"
        class="max-w"
      />

      <Heading is="h2" size="md">{{ t("reservation-system") }}</Heading>

      <div class="lb-cols">
        <RadioBox
          id="reservation-system-disabled"
          name="reservation_system"
          :title="t('disabled.title')"
          value="disabled"
          :checked="location.reservation_system === 'disabled'"
        >
          {{ t("disabled.text") }}
        </RadioBox>
        <RadioBox
          id="reservation-system-single"
          name="reservation_system"
          :title="t('single.title')"
          value="single"
          :checked="location.reservation_system === 'single'"
        >
          {{ t("single.text") }}
        </RadioBox>
        <RadioBox
          id="reservation-system-multiple"
          name="reservation_system"
          :title="t('multiple.title')"
          value="multiple"
          :checked="location.reservation_system === 'mulitple'"
        >
          {{ t("multiple.text") }}
        </RadioBox>
      </div>

      <Alert v-if="success" variant="success">
        {{ t("success") }}
      </Alert>

      <Button type="submit" :loading="loading" class="button">{{
        t("save")
      }}</Button>
    </form>
  </Container>
</template>

<script setup lang="ts">
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import RadioBox from "@/components/core/RadioBox.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { ClientResponseError } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";

const { t } = useI18n({ useScope: "local" });
const route = useRoute();
const { pb } = usePocketbase();
const { loading, update, errors } = usePocketbaseUpdate(pb, "location");

const slug = route.params.location;
const success = ref(false);

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  try {
    await update(location.value!.id, data);
    success.value = true;
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style scoped>
.max-w {
  max-width: 500px;
}
.button {
  align-self: flex-start;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Settings",
    "name": "Name",
    "address": "Address",
    "email": "E-mail",
    "reservation-system": "Reservation System",
    "disabled": {
      "title": "Disabled",
      "text": "The reservation system is disabled. Only admin users can create reservations."
    },
    "single": {
      "title": "Single",
      "text": "One reservation per product. A product is unavailable, and can't be reserved, as long as an unclosed reservation exists."
    },
    "multiple": {
      "title": "Multiple",
      "text": "Multiple reservations per product for different time periods. A product is unavailable during active reservations or when no new reservation can be placed before the next one."
    },
    "success": "Settings successfuly saved.",
    "save": "Save"
  },
  "de": {
    "title": "Einstellungen",
    "name": "Name",
    "address": "Adresse",
    "email": "E-Mail",
    "reservation-system": "Reservierungssystem",
    "disabled": {
      "title": "Deaktiviert",
      "text": "Das Reservierungssystem ist deaktiviert. Nur Administratoren können Reservierungen vornehmen."
    },
    "single": {
      "title": "Einzeln",
      "text": "Eine Reservierung pro Produkt. Ein Produkt ist nicht verfügbar, und kann nicht reserviert werden, solange eine offene Reservierung besteht."
    },
    "multiple": {
      "title": "Mehrfach",
      "text": "Mehrere Reservierungen pro Produkt für verschiedene Zeiträume. Das Produkt ist während aktiver Reservierungen oder wenn vor der nächsten Reservierung keine neue mehr möglich ist, nicht verfügbar."
    },
    "success": "Einstellungen erfolgreich gespeichert.",
    "save": "Speichern"
  }
}
</i18n>
