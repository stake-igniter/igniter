import type { Metadata } from 'next'
import { ListAddressGroups } from '@/actions/AddressGroups'
import ImportForm from '@/app/admin/(internal)/keys/import/ImportForm'
import { GetAppName } from '@/actions/ApplicationSettings'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Import Keys - ${appName}`,
    description: "Light up your earnings with Igniter",
  }
}

export default async function ImportPage() {
  const addressesGroup = await ListAddressGroups()

  return (
    <ImportForm addressesGroup={addressesGroup} />
  )
}
