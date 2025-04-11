import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/db/schema";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getApplicationSettings();

  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  if (settings.isBootstrapped) {
    return redirect("/app/overview");
  } else {

    if (session.user.role !== UserRole.Owner) {
      return redirect("/");
    }

    return redirect("/admin/setup");
  }
}
