"use client";

import { createUser } from "@/actions/createUser";
import { useActionState } from "react";

function UserForm() {
  const [state, action] = useActionState(createUser, null, "n/a");

  return (
    <form action={action}>
      <label>
        Name:
        <input type="text" name="name" />
      </label>
      <label>
        Age:
        <input type="number" name="age" />
      </label>
      <label>
        Email:
        <input type="email" name="email" />
      </label>
      <button type="submit">Create User</button>
      {state === "failed" && <p>Fix form</p>}
      {state === "success" && <p>User created!</p>}
    </form>
  );
}

export default UserForm;
