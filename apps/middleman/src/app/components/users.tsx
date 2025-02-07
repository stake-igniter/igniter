import { db } from "@/db/index";
import { usersTable } from "@/db/schema";

export default async function Page() {
  const allUsers = await db.select().from(usersTable);
  return (
    <ol>
      {allUsers.map((user) => (
        <li key={user.id}>
          {user.name} ({user.age}) - {user.email}
        </li>
      ))}
    </ol>
  );
}
