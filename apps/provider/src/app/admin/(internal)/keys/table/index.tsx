'use client'

import { ListKeys } from '@/actions/Keys'
import { useQuery } from '@tanstack/react-query'
import DataTable from '@igniter/ui/components/DataTable/index'
import {columns, getFilters, sorts} from './columns'
import { ListBasicAddressGroups } from '@/actions/AddressGroups'
import {KeyWithRelations} from "@igniter/db/provider/schema";

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

  const keys: KeyWithRelations[] = data?.keys ?? []

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
