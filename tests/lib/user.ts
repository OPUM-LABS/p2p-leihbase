import { pocketbase } from "../services/pocketbase";

export async function createUser(
  email = "test@example.com",
  password = "testtest"
) {
  const pb = await pocketbase();
  try {
    const user = await pb.collection("users").create({
      name: "Test User",
      email,
      password,
      passwordConfirm: password,
      terms: true,
    });
    return user;
  } catch (err) {
    console.log("Error creating test user", err.response.data);
  }
}
