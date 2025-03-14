import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { isBootstrapped } = await getApplicationSettings();

  if (isBootstrapped) {
    return redirect("/admin/overview");
  } else {
    return redirect("/admin/setup");
  }
}
