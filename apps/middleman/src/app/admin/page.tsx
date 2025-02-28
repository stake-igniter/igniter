import { getBootstrapStatus } from "@/lib/dal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  //check if system has been bootstrapped, if not redirect to that route

  const { isBootstrapped } = await getBootstrapStatus();

  if (isBootstrapped) {
    return redirect("/admin/overview");
  } else {
    return redirect("/admin/setup");
  }
}
