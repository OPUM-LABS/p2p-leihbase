<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('admin.settings.title')" :location="location" />

    <form
      v-if="location"
      method="POST"
      class="lb-stack"
      @submit.prevent="handleSubmit"
    >
      <Input
        :label="t('admin.settings.name')"
        name="name"
        :value="location.name"
        :error="errors.fields['name'] ? t(errors.fields['name']) : undefined"
        required
        class="max-w"
      />
      <Input
        :label="t('admin.settings.address')"
        name="address"
        :value="location.address"
        :error="
          errors.fields['address'] ? t(errors.fields['address']) : undefined
        "
        required
        class="max-w"
      />
      <Input
        :label="t('admin.settings.email')"
        name="email"
        :value="location.email"
        :error="errors.fields['email'] ? t(errors.fields['email']) : undefined"
        required
        autocomplete="off"
        class="max-w"
      />

      <RichTextarea
        :label="t('admin.settings.description')"
        name="description"
        :value="location.description"
        :error="
          errors.fields['description']
            ? t(errors.fields['description'])
            : undefined
        "
        class="max-w"
      />

      <Heading is="h2" size="md">{{ t('admin.settings.reservation-system') }}</Heading>

      <div class="lb-cols">
        <RadioBox
          id="reservation-system-disabled"
          name="reservation_system"
          :title="t('admin.settings.disabled.title')"
          value="disabled"
          :checked="location.reservation_system === 'disabled'"
        >
          {{ t('admin.settings.disabled.text') }}
        </RadioBox>
        <RadioBox
          id="reservation-system-single"
          name="reservation_system"
          :title="t('admin.settings.single.title')"
          value="single"
          :checked="location.reservation_system === 'single'"
        >
          {{ t('admin.settings.single.text') }}
        </RadioBox>
        <RadioBox
          id="reservation-system-multiple"
          name="reservation_system"
          :title="t('admin.settings.multiple.title')"
          value="multiple"
          :checked="location.reservation_system === 'multiple'"
        >
          {{ t('admin.settings.multiple.text') }}
        </RadioBox>
      </div>

      <Input
        name="max_reservation_days"
        type="number"
        :label="t('admin.settings.max-reservation-days.label')"
        :description="t('admin.settings.max-reservation-days.description')"
        :value="location.max_reservation_days"
        :error="
          errors.fields['max_reservation_days']
            ? t(errors.fields['max_reservation_days'])
            : undefined
        "
        class="max-w"
      />

      <Input
        name="reservation_start_limit"
        type="number"
        :label="t('admin.settings.reservation-start-limit.label')"
        :description="t('admin.settings.reservation-start-limit.description')"
        :value="location.reservation_start_limit"
        :error="
          errors.fields['reservation_start_limit']
            ? t(errors.fields['reservation_start_limit'])
            : undefined
        "
        class="max-w"
      />

      <Switch
        id="allow-same-day-reservations"
        name="allow_same_day_reservations"
        :label="t('admin.settings.allow-same-day-reservations.label')"
        :description="t('admin.settings.allow-same-day-reservations.description')"
        :value="location.allow_same_day_reservations"
      />

      <Alert v-if="success" variant="success">
        {{ t('admin.settings.success') }}
      </Alert>

      <Button type="submit" :loading="loading" class="button">{{
        t('admin.settings.save')
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
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import Textarea from "@/components/core/Textarea.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { ClientResponseError } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";

const { t } = useI18n();
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
  data.set(
    "allow_same_day_reservations",
    data.get("allow_same_day_reservations") ? "true" : "false"
  );
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
