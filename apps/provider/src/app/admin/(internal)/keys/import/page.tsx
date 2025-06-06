import { ListAddressGroups } from '@/actions/AddressGroups'
import ImportForm from '@/app/admin/(internal)/keys/import/ImportForm'

export default async function ImportPage() {
  const addressesGroup = await ListAddressGroups()

  return (
    <ImportForm addressesGroup={addressesGroup} />
  )
}
