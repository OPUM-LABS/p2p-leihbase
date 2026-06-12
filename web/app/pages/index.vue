<template>
  <Container width="lg" centered class="container">
    <PageAlert />
    <div class="grid">
      <div class="content lb-stack">
        <Heading is="h1" size="xl">{{ leihbase.name }}</Heading>
        <div
          v-if="leihbase.description"
          class="lb-richtext"
          v-html="leihbase.description"
        ></div>
      </div>

      <div v-if="locations && locations.length > 0" class="locations lb-stack">
        <Heading is="h2" size="lg" class="heading">{{
          t("locations")
        }}</Heading>
        <ul>
          <li v-for="location in locations">
            <Button
              variant="secondary"
              :to="`/l/${location.slug}`"
              class="location"
            >
              <strong>{{ location.name }}</strong>
              <template v-if="location.address">
                <br />
                <p>{{ location.address }}</p>
              </template>
            </Button>
          </li>
        </ul>
      </div>

      <img
        v-if="leihbase?.image"
        :src="`${config.public.pocketbase.clientBaseUrl}/api/files/leihbase/${leihbase.id}/${leihbase?.image}${thumbs.lg}`"
        class="image"
      />
    </div>
  </Container>
</template>

<script setup>
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { t } = useI18n({ useScope: "local" });
const { pb } = usePocketbase();
const { leihbase } = useLeihbase();

const locations = await pb.collection("public_locations").getFullList({
  filter: "active = true",
  sort: "name",
});

// If there is only a single location navigate there directly
if (locations.length === 1) {
  await navigateTo({
    path: `/l/${locations[0].slug}`,
  });
}

useHead({
  title: leihbase.name,
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.grid {
  display: grid;
  gap: var(--fluid-spacing-12);
  grid-template-areas:
    "a"
    "b"
    "c";
}
@media (min-width: breakpoints.$breakpoint-md) {
  .grid {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "a b"
      "c b";
  }
}
.content {
  grid-area: b;
}
.locations {
  grid-area: c;
}
.image {
  grid-area: a;
  border-radius: var(--border-radius);
}
@media (min-width: breakpoints.$breakpoint-md) {
  .grid {
    margin-top: var(--fluid-spacing-8);
  }
  .content {
    grid-area: a;
  }
  .locations {
    grid-area: c;
  }
  .image {
    grid-area: b;
  }
  .grid:not(:has(.image)) {
    .locations {
      grid-area: b;
    }
  }
}
.locations .heading {
  margin-top: 0.5rem;
}
.locations ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: var(--fluid-spacing-4);
  margin: 0;
  padding: 0;
}
.locations ul a {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "locations": "Locations"
  },
  "de": {
    "locations": "Standorte"
  }
}
</i18n>
