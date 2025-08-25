import 'server-only';
import {auth} from "@/auth";
import {UserRole} from "@/db/schema";
import {User} from "lucide-react";

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

export async function isUserAdmin() {
    const user = await getCurrentUser();
    // TODO: Either add UserRole.Admin or establish RBAC mechanism with permissions when adding support for multi admins.
    return [UserRole.Owner].includes(user.role);
}
