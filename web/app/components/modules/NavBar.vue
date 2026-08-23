<template>
  <header ref="header" :class="{ 'is-sticky': isSticky }">
    <div class="nav-container">
      <!-- Logo & Brand -->
      <NuxtLink to="/" class="logo">
        <img
          v-if="appLogo"
          :src="appLogo"
          :alt="appName"
          class="logo-image"
        />
        <span v-else v-html="appName.replace('\n', '<br />')" />
      </NuxtLink>

      <!-- Desktop Nav Items -->
      <div class="desktop-nav">
        <LanguageSwitcher variant="navbar" />
      </div>

      <!-- User / Menu Dropdown -->
      <DropdownMenu class="dropdown">
        <DropdownMenuTrigger
          :as="Button"
          variant="primary"
          outline
          data-testid="menu-button"
          class="menu-trigger"
        >
          <span class="sr-only">{{ t('nav.menu') }}</span>
          <User class="icon" />
          <Menu class="icon" />
          <span v-if="isValid && pendingCount > 0" class="menu-indicator-badge">
            {{ pendingCount > 99 ? '99+' : pendingCount }}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuPopover ref="popover" class="popover">
          <ul>
            <li v-if="!isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="signup-link"
                to="/signup"
              >
                {{ t('nav.sign_up') }}
              </DropdownMenuItem>
            </li>
            <li v-if="!isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="login-link"
                to="/login"
              >
                {{ t('nav.login') }}
              </DropdownMenuItem>
            </li>

            <li v-if="isValid">
              <DropdownMenuItem :as="NuxtLink" to="/items/new">
                {{ t('nav.lend_item') }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem :as="NuxtLink" to="/profile/my-items">
                {{ t('nav.my_items') }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem :as="NuxtLink" to="/profile/requests" class="menu-item-with-badge">
                <span>{{ t('nav.incoming_requests') }}</span>
                <span v-if="pendingCount > 0" class="sub-badge">{{ pendingCount }}</span>
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem :as="NuxtLink" to="/reservations">
                {{ t('nav.my_rentals') }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="account-link"
                to="/profile"
              >
                {{ t('nav.profile') }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid && userStore.isManager">
              <DropdownMenuItem :as="NuxtLink" to="/admin">
                {{ t('nav.admin') }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem as="button" @click.prevent="handleLogout">
                {{ t('nav.logout') }}
              </DropdownMenuItem>
            </li>
          </ul>
        </DropdownMenuPopover>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup>
import { Menu, User } from "@iconoir/vue";
import { NuxtLink } from "#components";
import Button from "../core/Button.vue";
import DropdownMenu from "../core/dropdown-menu/DropdownMenu.vue";
import DropdownMenuItem from "../core/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuPopover from "../core/dropdown-menu/DropdownMenuPopover.vue";
import DropdownMenuTrigger from "../core/dropdown-menu/DropdownMenuTrigger.vue";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { PageAlertType } from "../page-alert/PageAlert.model.js";

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const { isValid, logout, pb } = usePocketbase();
const userStore = useUserStore();
const { leihbase } = storeToRefs(useLeihbase());
const { pendingCount, fetchPendingCount } = usePendingRequests();

const appName = computed(
  () => leihbase.value?.name || runtimeConfig.public.appName || "Leihbase"
);
const appLogo = computed(() => {
  if (leihbase.value?.logo_url) {
    return leihbase.value.logo_url;
  }
  if (leihbase.value?.logo) {
    return pb.files.getURL(leihbase.value, leihbase.value.logo);
  }
  if (leihbase.value?.image) {
    return pb.files.getURL(leihbase.value, leihbase.value.image);
  }
  return runtimeConfig.public.appLogo || "";
});

const header = ref();
const route = useRoute();

const { isSticky } = useIsSticky(header);

onMounted(() => {
  if (isValid.value) {
    fetchPendingCount();
  }
});

watch(isValid, (valid) => {
  if (valid) {
    fetchPendingCount();
  } else {
    pendingCount.value = 0;
  }
});

watch(
  () => route.path,
  () => {
    if (isValid.value) {
      fetchPendingCount();
    }
  }
);

function handleLogout() {
  logout();
  userStore.logout();
  userStore.showBanner(PageAlertType.AFTER_LOGOUT);
  navigateTo("/");
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

header {
  --header-text-color: color-mix(in srgb, var(--background-color) 50%, #fff);
  display: flex;
  justify-content: center;
  position: sticky;
  top: -1px;
  margin-top: var(--navbar-offset);
  z-index: 10;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    height: var(--navbar-height);
    background-color: var(--primary-color);
    margin-left: var(--navbar-offset);
    margin-right: var(--navbar-offset);
    border-radius: 5px;
    max-width: 1400px;
    width: 100%;
    transition: border-radius 200ms;
    box-shadow: var(--shadow-sm);
  }
  &.is-sticky {
    & > div {
      border-radius: 0 0 5px 5px;
    }
  }

  .logo {
    color: var(--header-text-color);
    font-size: 1.4rem;
    font-weight: var(--font-weight-black);
    line-height: 1;
    text-decoration: none;
    display: flex;
    align-items: center;

    .logo-image {
      max-height: calc(var(--navbar-height) - 1.25rem);
      max-width: 180px;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
    margin-right: 1rem;
    color: var(--header-text-color);
  }

  .icon {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
  }
}

.dropdown {
  position: relative;
  .popover {
    position: absolute;
    top: 100%;
    background-color: white;
    border-radius: var(--border-radius);
    padding: 0.25rem 0;
    width: 13rem;
    right: 0.25rem;
    box-shadow: var(--shadow-sm);
    ul {
      display: flex;
      list-style: none;
      flex-direction: column;
      margin: 0;
      padding: 0;
      li {
        a,
        button {
          display: block;
          background: none;
          border: 0;
          text-align: left;
          color: var(--text-color);
          padding: 0.5rem 1rem;
          text-decoration: none;
          width: 100%;
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          &:hover,
          &:active {
            background-color: var(--secondary-color);
          }
          &.menu-item-with-badge {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .sub-badge {
              background-color: #e03131;
              color: #ffffff;
              font-size: 0.7rem;
              font-weight: 700;
              line-height: 1;
              padding: 0.2rem 0.45rem;
              border-radius: 9999px;
              margin-left: 0.5rem;
            }
          }
        }
        &.menu-divider {
          border-top: 1px solid var(--border-color, #eee);
          margin-top: 0.25rem;
          padding-top: 0.25rem;
        }
      }
    }
  }
}

.menu-trigger {
  position: relative;
  overflow: visible !important;

  .menu-indicator-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #e03131;
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1;
    min-width: 1.15rem;
    height: 1.15rem;
    padding: 0 0.25rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px var(--primary-color, #2b8a3e);
    animation: pulse-badge 2s infinite ease-in-out;
    z-index: 2;
  }
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}
</style>
