export function usePocketbase() {
  const nuxtApp = useNuxtApp();
  const { $pocketbase: pb } = nuxtApp;

  const isValid = useState(() => pb?.authStore.isValid);
  const user = useState(() => pb?.authStore.record);

  pb.authStore.onChange(() => {
    isValid.value = pb.authStore.isValid;
    user.value = pb.authStore.record;
  });

  async function login(email: string, password: string) {
    await pb.collection("users").authWithPassword(email, password);
    isValid.value = pb.authStore.isValid;
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
