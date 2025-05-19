import 'server-only';
import {auth} from "@/auth";

export async function getCurrentUserIdentity() {
  const session = await auth();

  if (!session) {
    throw new Error("Not logged in");
  }

  return session.user.identity;
}
