import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  //check if system has been bootstrapped, if not redirect to that route

  const { isBootstrapped } = await getApplicationSettings();

  if (isBootstrapped) {
    return redirect("/admin/overview");
  } else {
    return redirect("/setup");
  }
}
