'use client'

import { ListKeys } from '@/actions/Keys'
import { useQuery } from '@tanstack/react-query'
import { Key } from '@/app/admin/(internal)/keys/table/columns'
import DataTable from '@igniter/ui/components/DataTable/index'
import {columns, getFilters, sorts} from './columns'
import { ListBasicAddressGroups } from '@/actions/AddressGroups'

export default function KeysTable() {
  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ['keys'],
    queryFn: async () => {
      const [keys, addressesGroup] = await Promise.all([
        ListKeys(),
        ListBasicAddressGroups(),
      ]);

      return {
        keys,
        addressesGroup
      }
    },
    refetchInterval: 60000,
  })

  const keys: Array<Key> = data?.keys?.map((key) => ({
    id: key.id,
    address: key.address,
    addressGroup: key.addressGroup!,
    ownerAddress: key.ownerAddress,
    state: key.state,
    createdAt: new Date(key.createdAt!),
    delegator: key.delegator,
  })) || []

  return (
    <DataTable
      columns={columns}
      data={keys}
      filters={getFilters(data?.addressesGroup || [])}
      sorts={sorts}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
    />
  )
}
