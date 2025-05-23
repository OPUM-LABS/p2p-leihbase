import PocketBase from "pocketbase";

let pb;

export async function pocketbase(
  email = "test@example.com",
  password = "1234567890",
  admin = true
) {
  if (pb) {
    return pb;
  } else {
    pb = new PocketBase("http://127.0.0.1:8081");
    if (admin) {
      await pb.admins.authWithPassword(email, password);
    } else {
      await pb.collection("users").authWithPassword(email, password);
    }
    return pb;
  }
}
