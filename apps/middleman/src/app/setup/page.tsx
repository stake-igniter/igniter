import { getBootstrapStatus } from "@/lib/dal";
import { redirect } from "next/navigation";
import { Stepper } from "./stepper";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { isBootstrapped, step } = await getBootstrapStatus();
  const session = await auth();

  if (isBootstrapped) {
    return redirect("/admin/overview");
  }

  return (
    <>
      <Stepper />
    </>
  );
}
