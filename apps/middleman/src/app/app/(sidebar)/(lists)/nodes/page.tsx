import React from 'react'
import NodesTable from '@/app/app/(sidebar)/(lists)/nodes/table'
import {GetUserNodes} from "@/actions/Nodes";

export const dynamic = "force-dynamic";

export default async function Page() {
  const nodes = await GetUserNodes();

  return (
    <>
      <h1>Nodes</h1>
      <div className="container mx-auto ">
        <NodesTable initialNodes={nodes} />
      </div>
    </>
  );
}
