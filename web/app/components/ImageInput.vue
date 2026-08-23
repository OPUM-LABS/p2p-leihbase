<template>
  <div class="image-input-root">
    <div class="label-row">
      <FormLabel :for="id" :required="required">{{ label }}</FormLabel>
      <span class="count-badge" :class="{ 'is-max': isAtMax }">
        {{ totalCount }} / {{ maxImages }} {{ t('image_input.images_count') }}
      </span>
    </div>

    <!-- Image Grid (Existing + New Previews) -->
    <div class="image-grid">
      <!-- Existing saved images -->
      <div v-for="image in images" :key="image" class="image-card">
        <img :src="getProductImageUrl(recordId, image) || ''" alt="Item image" />
        <button
          type="button"
          class="remove-btn"
          @click.prevent="removeExistingImage(image)"
          :title="t('image_input.remove')"
        >
          <Trash class="btn-icon" />
        </button>
      </div>

      <!-- Newly selected/downloaded images -->
      <div v-for="(image, index) in newImages" :key="index" class="image-card">
        <img :src="createObjectURL(image)" alt="New preview" />
        <button
          type="button"
          class="remove-btn"
          @click.prevent="removeNewImage(index)"
          :title="t('image_input.remove')"
        >
          <Trash class="btn-icon" />
        </button>
      </div>

      <!-- Add triggers (only shown if below max limit) -->
      <div v-if="!isAtMax && !showUrlInput" class="add-options">
        <button
          type="button"
          class="add-btn device-upload"
          :disabled="isProcessing"
          @click.prevent="handleOpenFilePicker"
          :title="t('image_input.upload_device')"
        >
          <Plus class="add-icon" />
          <span>{{ t('image_input.upload_device') }}</span>
        </button>

        <button
          type="button"
          class="add-btn url-upload"
          :disabled="isProcessing"
          @click.prevent="showUrlInput = true"
          :title="t('image_input.add_url')"
        >
          <LinkIcon class="add-icon" />
          <span>{{ t('image_input.add_url') }}</span>
        </button>
      </div>
    </div>

    <!-- Processing / Loading State -->
    <div v-if="isProcessing" class="processing-state">
      <LoadingSpinner />
      <span>{{ processingMessage }}</span>
    </div>

    <!-- Inline URL input form -->
    <div v-if="showUrlInput && !isAtMax" class="url-input-box">
      <div class="url-header">
        <span class="url-title">{{ t('image_input.url_prompt') }}</span>
        <button type="button" class="close-url-btn" @click="showUrlInput = false">✕</button>
      </div>
      <div class="url-controls">
        <input
          type="url"
          v-model="imageUrlInput"
          :placeholder="t('image_input.url_placeholder')"
          class="url-field"
          :disabled="isProcessing"
          @keydown.enter.prevent="handleFetchImageUrl"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          :loading="isProcessing"
          :disabled="!imageUrlInput.trim()"
          @click="handleFetchImageUrl"
        >
          {{ t('image_input.fetch_btn') }}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="isProcessing"
          @click="showUrlInput = false"
        >
          {{ t('image_input.cancel') }}
        </Button>
      </div>
    </div>

    <!-- Error message -->
    <Alert v-if="errorMessage" variant="error" class="mt-2">
      {{ errorMessage }}
    </Alert>

    <!-- Hidden native file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
      multiple
      class="hidden-file-input"
      @change="handleFilesSelected"
    />

    <!-- Description & Optimization Hint -->
    <p v-if="description" class="help-text">
      <small>{{ description }}</small>
    </p>
    <p class="optimization-hint">
      <small>ℹ️ {{ t('image_input.auto_resize_hint', { max: maxImages }) }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { Link as LinkIcon, Plus, Trash } from "@iconoir/vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import FormLabel from "./core/FormLabel.vue";
import LoadingSpinner from "./core/LoadingSpinner.vue";
import { resizeAndCompressImage } from "@/utils/imageOptimizer";

const images = defineModel<string[]>("images", { default: [] });
const newImages = defineModel<File[]>("newImages", { default: [] });

const props = withDefaults(
  defineProps<{
    recordId?: string;
    collection?: string;
    id?: string;
    label?: string;
    required?: boolean;
    description?: string;
    maxImages?: number;
    dataTestid?: string;
  }>(),
  {
    maxImages: 3,
    collection: "products",
  }
);

const fileInputRef = ref<HTMLInputElement | null>(null);
const showUrlInput = ref(false);
const imageUrlInput = ref("");
const isProcessing = ref(false);
const processingMessage = ref("");
const errorMessage = ref("");

const totalCount = computed(() => (images.value?.length || 0) + (newImages.value?.length || 0));
const isAtMax = computed(() => totalCount.value >= props.maxImages);
const remainingSlots = computed(() => Math.max(0, props.maxImages - totalCount.value));

function handleOpenFilePicker() {
  errorMessage.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
    fileInputRef.value.click();
  }
}

async function handleFilesSelected() {
  const files = Array.from(fileInputRef.value?.files || []);
  if (!files.length) return;

  errorMessage.value = "";
  if (files.length > remainingSlots.value) {
    errorMessage.value = `Maximal ${props.maxImages} Bilder erlaubt. Es werden nur die ersten ${remainingSlots.value} übernommen.`;
  }

  const filesToProcess = files.slice(0, remainingSlots.value);
  if (!filesToProcess.length) return;

  isProcessing.value = true;
  processingMessage.value = "Bilder werden optimiert...";

  try {
    const optimizedFiles: File[] = [];
    for (const file of filesToProcess) {
      const optimized = await resizeAndCompressImage(file, {
        maxDimension: 1400,
        quality: 0.85,
      });
      optimizedFiles.push(optimized);
    }
    newImages.value = [...newImages.value, ...optimizedFiles];
  } catch (err: any) {
    console.error("Image processing error:", err);
    errorMessage.value = err?.message || "Fehler bei der Bildverarbeitung.";
  } finally {
    isProcessing.value = false;
    processingMessage.value = "";
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

async function handleFetchImageUrl() {
  const url = imageUrlInput.value.trim();
  if (!url) return;

  errorMessage.value = "";
  if (remainingSlots.value <= 0) {
    errorMessage.value = `Maximale Bildanzahl (${props.maxImages}) bereits erreicht.`;
    return;
  }

  isProcessing.value = true;
  processingMessage.value = "Bild wird geladen & optimiert...";

  try {
    const blob = await $fetch<Blob>("/api/fetch-image", {
      method: "POST",
      body: { url },
      responseType: "blob",
    });

    // Extract filename from URL or generate one
    let filename = "downloaded_image.jpg";
    try {
      const pathname = new URL(url).pathname;
      const cleanName = pathname.substring(pathname.lastIndexOf("/") + 1);
      if (cleanName && cleanName.length < 50) {
        filename = cleanName;
      }
    } catch {
      // Keep default filename
    }

    const optimizedFile = await resizeAndCompressImage(blob, {
      maxDimension: 1400,
      quality: 0.85,
      filename,
    });

    newImages.value = [...newImages.value, optimizedFile];
    imageUrlInput.value = "";
    showUrlInput.value = false;
  } catch (err: any) {
    console.error("Failed to fetch image from URL:", err);
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || "Konnte das Bild von der URL nicht laden.";
    errorMessage.value = `Fehler beim Laden der Bild-URL: ${msg}`;
  } finally {
    isProcessing.value = false;
    processingMessage.value = "";
  }
}

function removeExistingImage(imgName: string) {
  images.value = images.value.filter((i) => i !== imgName);
}

function removeNewImage(index: number) {
  newImages.value = newImages.value.filter((_, i) => i !== index);
}

function createObjectURL(file: File) {
  return URL.createObjectURL(file);
}

const { t } = useI18n({
  useScope: "local",
});
</script>

<style scoped>
.image-input-root {
  width: 100%;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  background-color: #f1f3f5;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.count-badge.is-max {
  color: #2b8a3e;
  background-color: #ebfbee;
  border-color: #b2f2bb;
}

.image-grid {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.image-card {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: var(--border-radius, 8px);
  overflow: hidden;
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.remove-btn:hover {
  background: rgba(224, 49, 49, 0.9);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.add-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 110px;
  height: 110px;
  border-radius: var(--border-radius, 8px);
  border: 2px dashed #ced4da;
  background-color: #f8f9fa;
  color: #495057;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s;
  padding: 8px;
  text-align: center;
}

.add-btn:hover:not(:disabled) {
  border-color: #2b8a3e;
  background-color: #ebfbee;
  color: #2b8a3e;
}

.add-btn.url-upload:hover:not(:disabled) {
  border-color: #1971c2;
  background-color: #e7f5ff;
  color: #1971c2;
}

.add-icon {
  width: 22px;
  height: 22px;
}

.processing-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #495057;
}

.url-input-box {
  margin-top: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 8px;
}

.url-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.url-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #343a40;
}

.close-url-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #868e96;
  cursor: pointer;
}

.url-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.url-field {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.85rem;
  background-color: #ffffff;
}

.hidden-file-input {
  display: none;
}

.help-text {
  margin-top: 6px;
  margin-bottom: 0;
  color: #6c757d;
}

.optimization-hint {
  margin-top: 4px;
  margin-bottom: 0;
  color: #868e96;
}

.mt-2 {
  margin-top: 8px;
}
</style>

<i18n lang="json">
{
  "de": {
    "image_input": {
      "images_count": "Bilder",
      "remove": "Bild entfernen",
      "upload_device": "Vom Gerät wählen",
      "add_url": "Per URL einfügen",
      "url_prompt": "Bild-URL (Web-Link) eingeben:",
      "url_placeholder": "https://example.com/bild.jpg",
      "fetch_btn": "Bild laden",
      "cancel": "Abbrechen",
      "auto_resize_hint": "Maximal {max} Bilder. Große Fotos (z.B. 4K) werden beim Hinzufügen automatisch herunterskaliert und komprimiert."
    }
  },
  "en": {
    "image_input": {
      "images_count": "images",
      "remove": "Remove image",
      "upload_device": "From device",
      "add_url": "Via Image URL",
      "url_prompt": "Enter image URL (web link):",
      "url_placeholder": "https://example.com/image.jpg",
      "fetch_btn": "Load image",
      "cancel": "Cancel",
      "auto_resize_hint": "Maximum {max} images. Large photos (e.g. 4K) are automatically downscaled and optimized on upload."
    }
  }
}
</i18n>
