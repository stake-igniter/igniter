import "server-only";
import { db } from "@/db";
import { usersTable, providersTable, UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function verifySession() {
  return true;
}

//authorization check
export async function verifyRole(identity: string, role: UserRole) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.identity, identity))
    .limit(1);

  const user = users[0];

  if (!user) {
    return false;
  }

  return user.role === role;
}

export async function getProviders() {
  return await db.select().from(providersTable);
}

export async function getOwnerUser() {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, UserRole.Owner));
}

export async function createUser(identity: string, role?: UserRole) {
  const userRole = role || UserRole.User;
  return await db.insert(usersTable).values({
    identity,
    role: userRole,
  });
}

export async function getUser(identity: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.identity, identity))
    .limit(1);

  return users[0];
}

export enum BootstrapStep {
  OwnerUser = "OwnerUser",
  Providers = "Providers",
  Bootstrapped = "Bootstrapped",
}

export async function getBootstrapStatus() {
  return false;
}
