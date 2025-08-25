import type { Metadata } from 'next'
import React from 'react'
import DelegatorsTable from "@/app/admin/(internal)/delegators/table";
import { GetAppName } from '@/actions/ApplicationSettings'
import RefreshDelegators from '@/app/admin/(internal)/delegators/Refresh'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Delegators - ${appName}`,
  }
}

export default function DelegatorsPage() {

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Delegators</h1>
          <RefreshDelegators />
        </div>
        <div className="container mx-auto ">
          <DelegatorsTable />
        </div>
      </div>
    </div>
  )
}
