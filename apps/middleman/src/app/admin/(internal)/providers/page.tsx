import type { Metadata } from 'next'
import React from 'react'
import ProvidersTable from "@/app/admin/(internal)/providers/table";
import { GetAppName } from '@/actions/ApplicationSettings'
import RefreshProviders from '@/app/admin/(internal)/providers/Refresh'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Providers - ${appName}`,
  }
}

export default function ProvidersPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Providers</h1>
          <RefreshProviders />
        </div>
        <div className="container mx-auto ">
          <ProvidersTable />
        </div>
      </div>
    </div>
  )
}
