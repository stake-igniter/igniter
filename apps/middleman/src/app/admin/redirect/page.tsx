import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@igniter/db/middleman/enums";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getApplicationSettings();

  const session = await auth();

  if (!session || session.user.role !== UserRole.Owner) {
    return redirect("/");
  }

  if (settings.isBootstrapped) {
    return redirect("/admin/overview");
  } else {
    return redirect("/admin/setup");
  }
}
