import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { UserRole, usersTable } from "./schema";
import "dotenv/config";

async function main() {
  const db = drizzle();

  const user: typeof usersTable.$inferInsert = {
    identity: "test",
    email: "john@example.com",
    role: UserRole.User,
  };

  await db.insert(usersTable).values(user);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);

  await db
    .update(usersTable)
    .set({
      email: "johnY@example.com",
    })
    .where(eq(usersTable.email, "john@example.com"));
  console.log("User info updated!");
}

main();
