import type { Metadata } from 'next'
import React from 'react'
import NodesTable from '@/app/app/(sidebar)/(lists)/nodes/table'
import { GetAppName } from '@/actions/ApplicationSettings'

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Nodes - ${appName}`,
  }
}

export default async function Page() {
  return (
    <>
      <h1>Nodes</h1>
      <div className="container mx-auto ">
        <NodesTable />
      </div>
    </>
  );
}
