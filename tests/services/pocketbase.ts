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
    pb = new PocketBase(
      process.env.POCKETBASE_BASE_URL || "http://127.0.0.1:8081"
    );
    try {
      if (admin) {
        await pb.collection("_superusers").authWithPassword(email, password);
      } else {
        await pb.collection("users").authWithPassword(email, password);
      }
    } catch (err) {
      console.error('Error initializing pocketbase', err);
      throw err;
    }
    return pb;
  }
}
