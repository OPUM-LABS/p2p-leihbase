<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <!-- Title -->
      <Heading is="h1" size="xl" cap>{{ t('profile.edit.edit_profile') }}</Heading>
      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Nickname -->
        <Input
          id="profile-edit-nickname-input"
          :label="t('profile.edit.nickname')"
          :placeholder="t('profile.edit.nickname_placeholder')"
          :description="t('profile.edit.nickname_help')"
          name="nickname"
          :value="user?.nickname || ''"
          :error="errors.fields['nickname'] ? t(errors.fields['nickname']) : undefined"
        />

        <!-- Real Name -->
        <Input
          id="profile-edit-name-input"
          :label="t('profile.edit.name')"
          :placeholder="t('profile.edit.name_placeholder')"
          :description="t('profile.edit.name_help')"
          name="name"
          :value="user!.name"
          :error="errors.fields['name'] ? t(errors.fields['name']) : undefined"
          required
        />

        <Divider spacing="xs" />

        <!-- Language Preference -->
        <div class="language-section">
          <FormLabel for="profile-edit-locale-select">
            {{ t('profile.edit.language') }}
          </FormLabel>
          <p class="section-desc">{{ t('profile.edit.language_help') }}</p>
          <div class="select-wrapper">
            <select
              id="profile-edit-locale-select"
              name="locale"
              v-model="selectedLocale"
              class="custom-select"
            >
              <option value="de">{{ t('profile.edit.language_de') }}</option>
              <option value="en">{{ t('profile.edit.language_en') }}</option>
            </select>
            <NavArrowDown class="select-arrow" />
          </div>
        </div>

        <Divider spacing="xs" />

        <div class="master-data-header">
          <Heading is="h2" size="sm">{{ t('profile.edit.master_data_section') }}</Heading>
          <p class="section-desc">{{ t('profile.edit.master_data_help') }}</p>
        </div>

        <!-- Street & Number -->
        <Input
          id="profile-edit-address-input"
          :label="t('profile.edit.street_address')"
          :placeholder="t('profile.edit.street_address_placeholder')"
          name="address"
          :value="user?.address || ''"
          :error="errors.fields['address'] ? t(errors.fields['address']) : undefined"
        />

        <div class="two-cols">
          <!-- Postal Code -->
          <Input
            id="profile-edit-postal-code-input"
            :label="t('profile.edit.postal_code')"
            :placeholder="t('profile.edit.postal_code_placeholder')"
            name="postal_code"
            :value="user?.postal_code || ''"
            :error="errors.fields['postal_code'] ? t(errors.fields['postal_code']) : undefined"
          />

          <!-- City -->
          <Input
            id="profile-edit-city-input"
            :label="t('profile.edit.city')"
            :placeholder="t('profile.edit.city_placeholder')"
            name="city"
            :value="user?.city || ''"
            :error="errors.fields['city'] ? t(errors.fields['city']) : undefined"
          />
        </div>

        <!-- Buttons -->
        <div class="button-row">
          <Button to="/profile" variant="secondary">
            {{ t('profile.edit.cancel') }}
          </Button>
          <Button type="submit" :loading="loading" class="save-button">
            {{ t('profile.edit.save') }}
          </Button>
        </div>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Divider from "@/components/core/Divider.vue";
import FormLabel from "@/components/core/FormLabel.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { NavArrowDown } from "@iconoir/vue";
import { ClientResponseError } from "pocketbase";

const { pb, isValid, user } = usePocketbase();
const userStore = useUserStore();
const { loading, update, errors } = usePocketbaseUpdate(pb, "users");
const { t, setLocale, setLocaleCookie } = useI18n();

useHead({
  title: t("profile.edit.edit_profile"),
});

if (!isValid.value) {
  navigateTo("/login");
}

const selectedLocale = ref<string>(user.value?.locale || "de");

onMounted(async () => {
  if (isValid.value) {
    try {
      await pb.collection("users").authRefresh();
      if (user.value?.locale) {
        selectedLocale.value = user.value.locale;
      }
    } catch (_) {}
  }
});

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  try {
    await update(user.value!.id, data);
    await pb.collection("users").authRefresh();

    const newLocale = (data.get("locale") as string) || selectedLocale.value;
    if (newLocale) {
      const i18nCookie = useCookie("i18n_redirected", {
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
      i18nCookie.value = newLocale;
      await setLocale(newLocale);
      if (typeof setLocaleCookie === "function") {
        setLocaleCookie(newLocale);
      }
    }

    navigateTo("/profile");
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

form {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-6);
}

.language-section,
.master-data-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .section-desc {
    font-size: 0.875rem;
    color: var(--color-gray-600);
    margin: 0;
  }
}

.select-wrapper {
  position: relative;
  width: 100%;
  margin-top: 0.5rem;

  .custom-select {
    width: 100%;
    appearance: none;
    background-color: var(--color-gray-100, #f8f9fa);
    border: 1px solid var(--color-gray-300, #dee2e6);
    border-radius: var(--border-radius, 6px);
    padding: 0.65rem 2.5rem 0.65rem 0.85rem;
    font-size: 0.95rem;
    color: var(--text-color, #212529);
    cursor: pointer;
    outline: none;
    transition: border-color 150ms ease, box-shadow 150ms ease;

    &:focus {
      border-color: var(--primary-color, #2b8a3e);
      box-shadow: 0 0 0 3px rgba(43, 138, 62, 0.15);
    }
  }

  .select-arrow {
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-gray-600, #6c757d);
    width: 1.15rem;
    height: 1.15rem;
  }
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--fluid-spacing-4);
  margin-top: 0.5rem;
}
</style>
