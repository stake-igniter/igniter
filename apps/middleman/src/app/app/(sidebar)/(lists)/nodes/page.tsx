import React from 'react'
import { getNodesByUser } from "@/lib/dal/nodes";
import NodesTable from '@/app/app/(sidebar)/(lists)/nodes/table'
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect('/');
  }

  const nodes = await getNodesByUser(session.user.identity);

  return (
    <>
      <h1>Nodes</h1>
      <div className="container mx-auto ">
        <NodesTable initialNodes={nodes} />
      </div>
    </>
  );
}
