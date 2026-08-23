<template>
  <div
    ref="containerRef"
    class="language-switcher"
    :class="[variant, { open: isOpen }]"
  >
    <!-- Dropdown Trigger Button -->
    <button
      type="button"
      class="lang-trigger-btn"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="true"
      :aria-label="t('common.language', 'Language')"
      @click="toggleDropdown"
    >
      <Internet class="icon-globe" />
      <span class="current-lang-text">{{ currentLocaleLabel }}</span>
      <NavArrowDown class="icon-chevron" :class="{ rotate: isOpen }" />
    </button>

    <!-- Dropdown Popover Menu -->
    <transition name="fade-slide">
      <div v-if="isOpen" class="lang-popover" role="menu">
        <div class="lang-popover-header">
          {{ t('common.language', 'Language') }}
        </div>
        <ul class="lang-list">
          <li
            v-for="l in formattedLocales"
            :key="l.code"
            class="lang-item"
            role="none"
          >
            <button
              type="button"
              role="menuitem"
              class="lang-option-btn"
              :class="{ active: currentLocale === l.code }"
              @click="selectLocale(l.code)"
            >
              <div class="lang-option-info">
                <span class="lang-name">{{ l.name }}</span>
                <span class="lang-code-badge">{{ l.code.toUpperCase() }}</span>
              </div>
              <Check v-if="currentLocale === l.code" class="icon-check" />
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { Check, Internet, NavArrowDown } from "@iconoir/vue";
import { onClickOutside } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    variant?: "navbar" | "footer" | "menu";
  }>(),
  {
    variant: "navbar",
  }
);

const { locale, locales, setLocale, setLocaleCookie, t } = useI18n();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

// Close on outside click
onClickOutside(containerRef, () => {
  isOpen.value = false;
});

// Close on escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

interface LocaleItem {
  code: string;
  name: string;
}

const fallbackNames: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
  uk: "Українська",
  ru: "Русский",
};

const currentLocale = computed(() => locale.value);

const formattedLocales = computed<LocaleItem[]>(() => {
  const raw = locales.value || ["en", "de"];
  return raw.map((l: any) => {
    if (typeof l === "string") {
      return {
        code: l,
        name: fallbackNames[l] || l.toUpperCase(),
      };
    }
    return {
      code: l.code,
      name: l.name || fallbackNames[l.code] || l.code.toUpperCase(),
    };
  });
});

const currentLocaleLabel = computed(() => {
  const match = formattedLocales.value.find((l) => l.code === currentLocale.value);
  if (props.variant === "menu") {
    return match ? match.name : currentLocale.value.toUpperCase();
  }
  return match ? match.code.toUpperCase() : currentLocale.value.toUpperCase();
});

// Explicit cookie persistence
const i18nCookie = useCookie("i18n_redirected", {
  maxAge: 365 * 24 * 60 * 60,
  path: "/",
  sameSite: "lax",
});

const { pb, isValid } = usePocketbase();

async function selectLocale(newLocale: string) {
  isOpen.value = false;
  if (currentLocale.value === newLocale) return;

  try {
    i18nCookie.value = newLocale;
    await setLocale(newLocale);
    if (typeof setLocaleCookie === "function") {
      setLocaleCookie(newLocale);
    }

    // Persist to user profile if logged in
    if (isValid.value && pb.authStore.record?.id && pb.authStore.record.locale !== newLocale) {
      try {
        await pb.collection("users").update(pb.authStore.record.id, { locale: newLocale });
        await pb.collection("users").authRefresh();
      } catch (e) {
        console.warn("Failed to persist user locale from switcher:", e);
      }
    }
  } catch (err) {
    console.error("Error setting locale:", err);
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  position: relative;
  display: inline-block;

  .lang-trigger-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: inherit;
    font-size: 0.85rem;
    font-weight: var(--font-weight-semibold, 600);
    padding: 0.3rem 0.6rem;
    border-radius: var(--border-radius, 6px);
    cursor: pointer;
    line-height: 1;
    transition: all 150ms ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .icon-globe {
      width: 1.1em;
      height: 1.1em;
      opacity: 0.9;
    }

    .icon-chevron {
      width: 0.9em;
      height: 0.9em;
      opacity: 0.75;
      transition: transform 200ms ease;

      &.rotate {
        transform: rotate(180deg);
      }
    }
  }

  .lang-popover {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 100;
    min-width: 11rem;
    background: white;
    color: var(--text-color, #1f2937);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: var(--border-radius, 8px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    padding: 0.35rem 0;
    overflow: hidden;

    .lang-popover-header {
      font-size: 0.72rem;
      font-weight: var(--font-weight-bold, 700);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-color-light, #6b7280);
      padding: 0.4rem 0.85rem 0.25rem;
      border-bottom: 1px solid var(--border-color, #f3f4f6);
      margin-bottom: 0.2rem;
    }

    .lang-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .lang-item {
      margin: 0;
    }

    .lang-option-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.85rem;
      background: transparent;
      border: none;
      color: var(--text-color, #1f2937);
      font-size: 0.875rem;
      text-align: left;
      cursor: pointer;
      transition: background-color 150ms ease;

      &:hover {
        background-color: var(--secondary-color, #f3f4f6);
      }

      &.active {
        font-weight: var(--font-weight-bold, 700);
        color: var(--primary-color, #0f766e);
        background-color: rgba(15, 118, 110, 0.08);
      }

      .lang-option-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .lang-name {
        font-size: 0.875rem;
      }

      .lang-code-badge {
        font-size: 0.7rem;
        background: #f0f2f5;
        color: #555;
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
        font-weight: var(--font-weight-medium, 500);
      }

      .icon-check {
        width: 1.1em;
        height: 1.1em;
        color: var(--primary-color, #0f766e);
        flex-shrink: 0;
      }
    }
  }

  /* Navbar (top-bar) variant */
  &.navbar {
    .lang-trigger-btn {
      color: var(--header-text-color, #ffffff);
      background-color: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.35);
      font-weight: var(--font-weight-bold, 700);

      .icon-globe {
        color: var(--header-text-color, #ffffff);
        opacity: 0.95;
      }

      .current-lang-text {
        color: var(--header-text-color, #ffffff);
      }

      .icon-chevron {
        color: var(--header-text-color, #ffffff);
        opacity: 0.85;
      }

      &:hover,
      &:focus-visible {
        background-color: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.7);
        color: #ffffff;
      }
    }
  }

  /* Footer variant */
  &.footer {
    .lang-trigger-btn {
      color: var(--text-color, #333);
      border-color: var(--border-color, #ddd);
      background-color: var(--background-color, #fff);

      &:hover {
        background-color: var(--secondary-color, #f0f0f0);
        border-color: #bbb;
      }
    }

    .lang-popover {
      top: auto;
      bottom: calc(100% + 6px);
      right: 0;
    }
  }

  /* Menu (mobile drawer) variant */
  &.menu {
    width: 100%;
    padding: 0.5rem 0.75rem;

    .lang-trigger-btn {
      width: 100%;
      justify-content: space-between;
      color: var(--text-color, #333);
      border-color: var(--border-color, #ddd);
      background-color: var(--background-color, #fff);
      padding: 0.5rem 0.75rem;

      &:hover {
        background-color: var(--secondary-color, #f0f0f0);
      }
    }

    .lang-popover {
      position: static;
      margin-top: 0.35rem;
      width: 100%;
      box-shadow: none;
      border: 1px solid var(--border-color, #e5e7eb);
    }
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
