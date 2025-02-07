import "server-only";
import { db } from "@/db";
import {
  usersTable,
  systemEventsTable,
  providersTable,
  SystemEvent,
  UserRole,
} from "@/db/schema";
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

export async function getSystemEvents(name?: SystemEvent) {
  // only if the user is an admin, or system is not bootstrapped
  return await db
    .select()
    .from(systemEventsTable)
    .where(name ? eq(systemEventsTable.name, name) : undefined);
}

export async function getOwnerUser() {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, UserRole.Owner));
}

export async function createUser(identity: string, role: UserRole) {
  return await db.insert(usersTable).values({
    identity,
    role,
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
  //maybe add some sort of security check here (?)

  //bootstrapping steps:
  //1. check if owner user exists
  // 1.1 if not, sign user using siwp and create user
  // 1.2 if yes, prompt to sign in
  //2. register providers
  // 2.1 if user provides uri, fetch providers list, show validation and ask user to create in db.
  // 2.2 if user does not provide uri, prompt user to create manually.
  //3. create system bootstrap event.

  const bootstrappedEvent = await getSystemEvents(
    SystemEvent.SystemBootstrapped
  );

  if (bootstrappedEvent.length > 0) {
    return { isBootstrapped: true, step: BootstrapStep.Bootstrapped };
  }

  const ownerUser = await getOwnerUser();

  if (ownerUser.length === 0) {
    return { isBootstrapped: false, step: BootstrapStep.OwnerUser };
  }

  const providers = await getProviders();

  if (providers.length === 0) {
    return { isBootstrapped: false, step: BootstrapStep.Providers };
  }

  return { isBootstrapped: false, step: null };
}
