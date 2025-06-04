import { redirect } from "next/navigation";
import { Stepper } from "./stepper";
import { auth } from "@/auth";
import {UserRole} from "@/db/schema";
import { GetApplicationSettings } from "@/actions/ApplicationSettings";
import React from "react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await GetApplicationSettings();

  const session = await auth();

  if (!session || session.user.role !== UserRole.Owner) {
    return redirect("/");
  }

  if (settings.isBootstrapped) {
    return redirect("/admin");
  }

  return (
    <div className="p-6">
      <Stepper />
    </div>
  );
}
