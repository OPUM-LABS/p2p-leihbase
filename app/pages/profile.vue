<template>
  <Container width="sm" centered no-padding class="container">
    <PageAlert class="alert" />
    <Card class="card">
      <h1>Profile</h1>
      <p>
        Name: {{ user?.name }}<br />
        E-mail: {{ user?.email }} {{ user?.verified ? "" : "(unbestätigt)" }}
      </p>
      <Button size="lg" :loading="loggingOut" @click="onLogout">Logout</Button>
    </Card>
  </Container>
</template>

<script setup>
const { pb, isValid, logout } = usePocketbase();
const router = useRouter();

const user = ref(null);
const loggingOut = ref(false);

useHead({
  title: "Profile",
});

if (!isValid.value) {
  logout();
  router.push("/login");
} else {
  user.value = await pb.collection("users").getOne(pb.authStore.model.id);
}

function onLogout() {
  loggingOut.value = true;
  logout();
  window.location.href = "/";
}
</script>

<style lang="scss" scoped>
@use "~/assets/styles/_breakpoints.scss";

@media (min-width: breakpoints.$breakpoint-md) {
  .container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 3rem;
  }
  .alert {
    margin: 0;
  }
  h1 {
    margin-top: -1rem;
  }
}
</style>
