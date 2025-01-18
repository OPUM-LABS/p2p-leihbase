import { init } from "../services/pocketbase";

const pb = await init();

export async function createUser(
  email = "test@example.com",
  password = "testtest"
) {
  try {
    const user = await pb.collection("users").create({
      name: "Test User",
      email,
      password,
      passwordConfirm: password,
    });
    return user;
  } catch (err) {
    console.log("Error creating test user", err.response.data);
  }
}
