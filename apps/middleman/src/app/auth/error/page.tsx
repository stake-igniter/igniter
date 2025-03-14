'use client';

import CurrentUser from "@/app/components/CurrentUser";
import { useSearchParams } from "next/navigation";

export function OwnersOnlyAllowed() {
  return (
    <div className="flex flex-col items-center justify-center w-[30%] text-center gap-2 p-2">
      <h1>Sign In not allowed</h1>
      <p>Seems like you're trying to access this application before it has been opened to the public. You can try again
        with a different account.</p>
      <CurrentUser/>
    </div>
  );
}

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error === "OwnerOnly") {
    return <OwnersOnlyAllowed/>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-[30%] text-center gap-2 p-2">
      <h1>Authentication Error</h1>
      <p>An unknown error occurred while trying to authenticate the account. You can try again.</p>
      <CurrentUser/>
    </div>
  );
}
