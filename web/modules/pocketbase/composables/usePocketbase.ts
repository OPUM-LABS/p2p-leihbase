export function usePocketbase() {
  const nuxtApp = useNuxtApp();
  const { $pocketbase: pb } = nuxtApp;

  const isValid = useState<boolean>("pb_auth_isValid", () => Boolean(pb?.authStore?.isValid));
  const user = useState<any>("pb_auth_user", () => pb?.authStore?.record ?? null);

  if (pb?.authStore) {
    pb.authStore.onChange(() => {
      isValid.value = Boolean(pb.authStore.isValid);
      user.value = pb.authStore.record;
    });
  }

  async function login(email: string, password: string) {
    const authData = await pb.collection("users").authWithPassword(email, password);
    isValid.value = Boolean(pb.authStore.isValid);
    user.value = pb.authStore.record;
    return authData;
  }

  function logout() {
    pb.authStore.clear();
    isValid.value = false;
    user.value = null;
  }

  return {
    pb,
    isValid,
    user,
    login,
    logout,
  };
}
