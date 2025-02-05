import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { usersTable } from "./schema";
import "dotenv/config";

async function main() {
  const db = drizzle();

  const user: typeof usersTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };

  await db.insert(usersTable).values(user);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);

  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log("User info updated!");
}

main();
