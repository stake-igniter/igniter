import React from 'react'
import { ListKeys } from '@/actions/Keys'
import KeysTable from '@/app/admin/(internal)/addresses/table'
import { ListBasicAddressGroups } from '@/actions/AddressGroups'
import { Button } from '@igniter/ui/components/button'
import Link from 'next/link'

export default async function AddressesPage() {
  const [keys, addressesGroup] = await Promise.all([
    ListKeys(),
    ListBasicAddressGroups(),
  ])

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Addresses</h1>
          <Link href={'/admin/addresses/import'}>
            <Button className={'h-8 w-20'} variant={'outline'}>
              Import
            </Button>
          </Link>
        </div>
        <div className="container mx-auto ">
          <KeysTable initialKeys={keys} initialAddressesGroup={addressesGroup} />
        </div>
      </div>
    </div>
  )
}
