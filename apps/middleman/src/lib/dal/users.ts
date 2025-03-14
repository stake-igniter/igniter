import {getApplicationSettings} from "@/lib/dal/applicationSettings";
import {UserRole, usersTable} from "@/db/schema";
import {db} from "@/db";
import {eq} from "drizzle-orm";

export async function createUser(identity: string) {
  try {
    const applicationSettings = await getApplicationSettings();

    const newUser = {
      email:  applicationSettings.ownerIdentity === identity ? applicationSettings.ownerEmail : "",
      identity,
      role: applicationSettings.ownerIdentity === identity ? UserRole.Owner : UserRole.User,
    };

    // TODO: Once we support user-invitations, we should create the user with the invited role.

    return await db.insert(usersTable).values(newUser).returning().then((res) => res[0]);
  } catch (error) {
    console.error(`An error occurred while creating a user with Identity: ${identity}`, error);
    throw error;
  }
}

export async function getUser(identity: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.identity, identity))
    .limit(1);

  return users[0];
}
