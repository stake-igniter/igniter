"use server";

import { db } from "@/db/index";
import { usersTable } from "@/db/schema";

export async function createUser(prevState: any, formData: any) {
  const name = formData.get("name");
  const age = Number(formData.get("age"));
  const email = formData.get("email");

  const user = {
    name,
    age,
    email,
  };

  if (!name || !age || !email) {
    return "failed";
  }

  await db.insert(usersTable).values(user);

  return "success";
}
