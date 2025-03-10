import { redirect } from "next/navigation";
import { Stepper } from "./stepper";
import { auth } from "@/auth";
import { UserRole } from "@/db/schema";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { loadProvidersFromCdn } from "@/actions/Providers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getApplicationSettings();
  const providers = await loadProvidersFromCdn();
  const session = await auth();

  if (!session || session.user.role !== UserRole.Owner) {
    return redirect("/");
  }

  if (settings.isBootstrapped) {
    return redirect("/admin");
  }

  return (
    <>
      <Stepper settings={settings} providers={providers} />
    </>
  );
}
