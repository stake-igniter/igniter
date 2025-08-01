import type { Metadata } from 'next'
import React from 'react'
import ServicesTable from "@/app/admin/(internal)/services/table";
import { GetAppName } from '@/actions/ApplicationSettings'
import AddNewService from '@/app/admin/(internal)/services/AddNew'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Services - ${appName}`,
    description: "Light up your earnings with Igniter",
  }
}

export default function ServicesPages() {
  return (
    <div className="flex flex-col gap-10">

      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Services</h1>
          <AddNewService />
        </div>
        <div className="container mx-auto ">
          <ServicesTable />
        </div>
      </div>
    </div>
  )
}
