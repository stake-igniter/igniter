import { getNodesByUser } from "@/lib/dal/nodes";
import NodesTable from '@/app/app/(sidebar)/(lists)/nodes/table'
import React from 'react'

export const dynamic = "force-dynamic";

export default async function Page() {
  const nodes = await getNodesByUser();

  return (
    <>
      <h1>Nodes</h1>
      <div className="container mx-auto ">
        <NodesTable initialNodes={nodes} />
      </div>
    </>
  );
}
