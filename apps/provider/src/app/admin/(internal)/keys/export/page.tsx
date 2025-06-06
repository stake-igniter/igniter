import { ListAddressGroups } from '@/actions/AddressGroups'
import ExportForm from '@/app/admin/(internal)/keys/export/ExportForm'

export default async function ExportPage() {
  const addressesGroup = await ListAddressGroups()

  return (
    <ExportForm addressesGroup={addressesGroup} />
  )
}
