import PocketBase from "pocketbase";

export async function init(
  email = "test@example.com",
  password = "1234567890",
  admin = true
) {
  const pb = new PocketBase("http://127.0.0.1:8081");

  // Auth
  if (admin) {
    await pb.admins.authWithPassword(email, password);
  } else {
    await pb.collection("users").authWithPassword(email, password);
  }

  return pb;
}
