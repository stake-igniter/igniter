import type { Metadata } from 'next'
import React from 'react'
import AddressGroupsTable from "./table";
import { GetAppName } from '@/actions/ApplicationSettings'
import AddNewAddressGroup from '@/app/admin/(internal)/groups/AddNew'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Addresses Group - ${appName}`,
  }
}

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 pt-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Address Groups</h1>
          <AddNewAddressGroup />
        </div>
        <AddressGroupsTable />
      </div>
    </div>
  )
}
