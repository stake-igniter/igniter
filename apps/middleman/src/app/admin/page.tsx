import { getBootstrapStatus } from "@/lib/dal";
import { redirect } from "next/navigation";
import BootstrapButton from "./bootstrap/button";

export const dynamic = "force-dynamic";

export default async function Page() {
  //check if system has been bootstrapped, if not redirect to that route

  const { isBootstrapped } = await getBootstrapStatus();

  if (isBootstrapped) {
    return redirect("/admin/dashboard");
  }

  return (
    <>
      <h1>Welcome to Igniter!</h1>
      <h4>Please complete our system setup:</h4>
      <BootstrapButton />
    </>
  );
}
