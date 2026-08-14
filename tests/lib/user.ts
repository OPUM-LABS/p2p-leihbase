import { pocketbase } from "../services/pocketbase";

export const DEFAULT_PASSWORD = "123456789";

export async function createUser(email?: string, password?: string, role: 'user' | 'manager' | 'admin' = 'user', locations: string[] = []) {
  const pb = await pocketbase();
  const user = await pb.collection("users").create({
    name: "Test User",
    email:
      email || `test-user-${Math.round(Math.random() * 10000)}@example.com`,
    password: password || DEFAULT_PASSWORD,
    passwordConfirm: password || DEFAULT_PASSWORD,
    role,
    manager_locations: locations,
    terms: true,
  });
  await pb.collection("users").update(user.id, { verified: true });
  return user;
}
