import type { Metadata } from 'next'
import { redirect } from "next/navigation";
import { Stepper } from "./stepper";
import { auth } from "@/auth";
import { UserRole } from "@igniter/db/middleman/enums";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { GetAppName } from '@/actions/ApplicationSettings'

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Setup - ${appName}`,
  }
}

export default async function Page() {
  const settings = await getApplicationSettings();

  const session = await auth();

  if (!session || session.user.role !== UserRole.Owner) {
    return redirect("/");
  }

  if (settings.isBootstrapped) {
    return redirect("/admin");
  }

  return (
    <>
      <div className="p-6">
        <Stepper settings={settings} providers={[]} />
      </div>
    </>
  );
}
