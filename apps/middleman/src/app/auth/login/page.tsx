import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import LoginWithPokt from "@/app/components/PoktIdentityProvider";

export default async function SignInPage() {
  return (
    <div className="flex flex-col gap-2">
      <LoginWithPokt />
    </div>
  );
}
