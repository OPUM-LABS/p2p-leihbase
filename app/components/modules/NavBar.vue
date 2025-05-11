<template>
  <header ref="header" :class="{ 'is-sticky': isSticky }">
    <div>
      <NuxtLink to="/" class="logo">{{ leihbase?.name || "" }}</NuxtLink>
      <nav>
        <ul v-if="isValid">
          <li v-if="userStore.isAdmin">
            <NuxtLink to="/admin">{{ t("admin") }}</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/profile">{{ t("profile") }}</NuxtLink>
          </li>
        </ul>
        <ul v-else>
          <li class="hidden sm:block">
            <NuxtLink data-testid="signup-link" to="/signup">
              {{ t("sign_up") }}
            </NuxtLink>
          </li>
          <li class="hidden sm:block">
            <NuxtLink data-testid="login-link" to="/login">
              {{ t("login") }}
            </NuxtLink>
          </li>
          <li class="account sm:hidden">
            <NuxtLink data-testid="account-link" to="/login"
              ><User class="user-icon"
            /></NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
  <div class="shade"></div>
</template>

<script setup>
import { User } from "@iconoir/vue";

const { t } = useI18n({
  useScope: "local",
});
const { isValid } = usePocketbase();
const userStore = useUserStore();
const { leihbase } = storeToRefs(useLeihbase());

const header = ref();

const { isSticky } = useIsSticky(header);
</script>

<style lang="scss" scoped>
@use "~/assets/styles/breakpoints";

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
    padding: 0rem 1rem;
    height: var(--navbar-height);
    background-color: var(--primary-color);
    margin-left: var(--navbar-offset);
    margin-right: var(--navbar-offset);
    border-radius: 5px;
    max-width: 1400px;
    width: 100%;
    transition: border-radius 200ms;
    @media screen and (min-width: breakpoints.$breakpoint-sm) {
      padding: 0 2rem 0 1rem;
    }
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
    white-space: pre;
  }

  nav {
    ul {
      display: flex;
      list-style: none;
      gap: 1rem;
      margin: 0;
      padding: 0;
    }
    a {
      text-decoration: none;
      text-transform: uppercase;
      font-weight: bold;
      color: var(--header-text-color);
      &:hover {
        text-decoration: underline;
        text-underline-offset: 5px;
        text-decoration-thickness: 2px;
      }
    }
  }

  .account {
    font-size: 2rem;
    a {
      line-height: 0;
      display: flex;
    }
    .user-icon {
      display: inline-block;
      width: 1em;
      height: 1em;
    }
  }
}

.shade {
  content: "";
  display: block;
  position: fixed;
  z-index: 1;
  width: 100%;
  top: 0;
  left: 0;
  height: 3rem;
  background: linear-gradient(
    to bottom,
    var(--background-color) -50%,
    transparent 100%
  );
}
</style>

<i18n lang="json">
{
  "en": {
    "sign_up": "Sign up",
    "login": "Login",
    "profile": "Profile",
    "admin": "Admin"
  },
  "de": {
    "sign_up": "Registrieren",
    "login": "Einloggen",
    "profile": "Profil",
    "admin": "Admin"
  }
}
</i18n>
