'use client'

import { ListKeys } from '@/actions/Keys'
import { useQuery } from '@tanstack/react-query'
import { Key } from '@/app/admin/(internal)/keys/table/columns'
import DataTable from '@igniter/ui/components/DataTable/index'
import {columns, getFilters, sorts} from './columns'
import { ListBasicAddressGroups } from '@/actions/AddressGroups'

interface KeysTableProps {
  initialKeys: Awaited<ReturnType<typeof ListKeys>>
  initialAddressesGroup: Awaited<ReturnType<typeof ListBasicAddressGroups>>
}

export default function KeysTable({initialKeys, initialAddressesGroup}: KeysTableProps) {
  const {data} = useQuery({
    queryKey: ['keys'],
    queryFn: ListKeys,
    staleTime: Infinity,
    refetchInterval: 60000,
    initialData: initialKeys
  })

  const keys: Array<Key> = data.map((key) => ({
    id: key.id,
    address: key.address,
    addressGroup: key.addressGroup!,
    ownerAddress: key.ownerAddress,
    state: key.state,
    createdAt: new Date(key.createdAt!),
    delegator: key.delegator,
  }))

  return (
    <DataTable
      columns={columns}
      data={keys}
      filters={getFilters(initialAddressesGroup)}
      sorts={sorts}
    />
  )
}
