<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <div class="heading row">
        <Heading is="h1" size="xl" cap data-testid="profile-h1">
          {{ t('profile.index.profile') }}
        </Heading>
        <Button to="/profile/edit" size="md">{{ t('profile.index.edit_profile') }}</Button>
      </div>
      <KeyValue :title="t('profile.index.nickname')" :value="user?.nickname || t('profile.index.not_set')" />
      <KeyValue :title="t('profile.index.name')" :value="user?.name" />
      <KeyValue :title="t('profile.index.email')" :value="user?.email" />
      <KeyValue
        :title="t('profile.index.language')"
        :value="(user?.locale || 'de') === 'en' ? t('common.language_en') : t('common.language_de')"
      />

      <Divider spacing="sm" />
      <Heading is="h2" size="sm" class="section-title">{{ t('profile.index.master_data') }}</Heading>
      <KeyValue :title="t('profile.index.street_address')" :value="user?.address || t('profile.index.not_set')" />
      <KeyValue :title="t('profile.index.postal_code')" :value="user?.postal_code || t('profile.index.not_set')" />
      <KeyValue :title="t('profile.index.city')" :value="user?.city || t('profile.index.not_set')" />

      <Alert v-if="!user?.verified" variant="warning" size="sm">
        <span>
          {{ t('profile.index.unverified') }}
          <Link to="/profile/verify-email">{{ t('profile.index.more_info') }}</Link
          >.
        </span>
      </Alert>
      <Divider spacing="md" />
      <p>
        <Link to="/profile/change-password">{{ t('profile.index.change_password') }}</Link>
      </p>
    </Card>
  </Container>
</template>

<script setup lang="ts">
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Divider from "@/components/core/Divider.vue";
import Heading from "@/components/core/Heading.vue";
import KeyValue from "@/components/core/KeyValue.vue";
import Link from "@/components/core/Link.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";

import { onMounted } from "vue";

const { pb, isValid, user } = usePocketbase();
const userStore = useUserStore();
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("profile.index.profile"),
});

if (!isValid.value) {
  navigateTo("/login");
}

onMounted(async () => {
  if (isValid.value) {
    try {
      await pb.collection("users").authRefresh();
    } catch (_) {}
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

p:last-child {
  margin: 0;
}
</style>
