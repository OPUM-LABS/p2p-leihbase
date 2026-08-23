<template>
  <div class="container">
    <template v-if="src">
      <img
        :src="src"
        loading="lazy"
        :class="{
          [objectFit]: true,
          ['aspect-' + aspectRatio?.replace(':', '-')]: !!aspectRatio,
          ['border-radius-' + borderRadius]: true,
        }"
      />
    </template>
    <template v-else>
      <p class="message">
        {{ t('common.no_image_message') }}
      </p>
      <img :src="fallback" loading="lazy" />
    </template>
    <div class="overlay"><slot /></div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n({
  useScope: "local",
});

withDefaults(
  defineProps<{
    src?: string | null;
    fallback?: string;
    loading?: "lazy" | "eager";
    objectFit?: "cover" | "contain";
    aspectRatio?: string | null;
    borderRadius?: "all" | "top";
  }>(),
  {
    objectFit: "cover",
    borderRadius: "all",
    loading: "lazy",
    fallback: "/images/fallback-product-image-600x600.png",
  }
);
</script>

<style scoped>
.container {
  position: relative;
  container: image;
  container-type: inline-size;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  container: image;
  container-type: inline-size;
}
img {
  border-radius: var(--border-radius);
  overflow: hidden;
  max-width: 100%;
  object-fit: contain;
  &.cover {
    object-fit: cover;
  }
  &.contain {
    object-fit: contain;
  }
  &.aspect-1-1 {
    aspect-ratio: 1/1;
  }
  &.border-radius-top {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }
}
.message {
  --margin: clamp(1rem, 5cqi, 1.5rem);
  position: absolute;
  left: var(--margin);
  top: var(--margin);
  font-size: clamp(0.7rem, 7cqi, 1.6rem);
  font-weight: bold;
  color: white;
  line-height: 1.15;
  max-width: min(70cqi, 17rem);
}
.overlay {
  position: absolute;
  bottom: 0.333rem;
  right: 0.333rem;
}
</style>
