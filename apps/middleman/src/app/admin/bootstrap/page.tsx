import { getBootstrapStatus } from "@/lib/dal";
import { redirect } from "next/navigation";
import { Stepper } from "./stepper";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { isBootstrapped, step } = await getBootstrapStatus();

  if (isBootstrapped) {
    return redirect("/admin/dashboard");
  }

  return (
    <>
      <Stepper />
    </>
  );
}
