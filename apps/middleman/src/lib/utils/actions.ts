import 'server-only';
import {auth} from "@/auth";

export async function getCurrentUser() {
  const session = await auth();

  if (!session) {
    throw new Error("Not logged in");
  }

  return session.user;
}

export async function getCurrentUserIdentity() {
  const user = await getCurrentUser();
  return user.identity;
}
