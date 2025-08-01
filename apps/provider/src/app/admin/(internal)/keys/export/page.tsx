import type { Metadata } from 'next'
import { ListAddressGroups } from '@/actions/AddressGroups'
import ExportForm from '@/app/admin/(internal)/keys/export/ExportForm'
import { GetAppName } from '@/actions/ApplicationSettings'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Export Keys - ${appName}`,
    description: "Light up your earnings with Igniter",
  }
}

export default async function ExportPage() {
  const addressesGroup = await ListAddressGroups()

  return (
    <ExportForm addressesGroup={addressesGroup} />
  )
}
