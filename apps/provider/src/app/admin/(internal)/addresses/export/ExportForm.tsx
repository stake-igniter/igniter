'use client'
import { ListAddressGroups } from '@/actions/AddressGroups'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@igniter/ui/components/select'
import OverrideSidebar from '@igniter/ui/components/OverrideSidebar'
import { ActivityHeader } from '@igniter/ui/components/ActivityHeader'
import { AbortConfirmationDialog } from '@igniter/ui/components/AbortConfirmationDialog'
import { Button } from '@igniter/ui/components/button'
import { LoaderIcon } from '@igniter/ui/assets'
import { toCurrencyFormat } from '@igniter/ui/lib/utils'
import { ExportKeys } from '@/actions/Keys'

const exportToJson = (jsonData: object, name: string) => {
  // Convert the data to a JSON string with proper formatting
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = url;

  // Set the file name
  link.download = name;

  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  window.URL.revokeObjectURL(url);
};


interface ExportFormProps {
  addressesGroup: Awaited<ReturnType<typeof ListAddressGroups>>
}

export default function ExportForm({addressesGroup}: ExportFormProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [isAbortDialogOpen, setAbortDialogOpen] = useState(false)
  const [status, setStatus] = useState<'form' | 'success' | 'loading' | 'error'>('form')
  const [addressGroup, setAddressGroup] = useState<string>('')
  const [keysExported, setKeysExported] = useState(0)

  const exportKeys = async () => {
    if (!addressGroup || status === 'loading') return;

    setStatus('loading')
    try {
      const privateKeys = await ExportKeys(Number(addressGroup))
      const filename = `${addressesGroup.find((a) => a.id === parseInt(addressGroup))?.name}-keys-at-${new Date().toISOString().replace(/[:.]/g, '_')}.json`;
      exportToJson(
        privateKeys.map(({privateKey}) => ({
          hex: privateKey
        })),
        filename,
      )
      setKeysExported(privateKeys.length)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  let content: React.ReactNode;

  if (status === 'form' || status === 'loading') {
    content = (
      <>
        <Select value={addressGroup} onValueChange={setAddressGroup}>
          <SelectTrigger className={'w-full'}>
            <SelectValue placeholder={'Select an address group'} />
          </SelectTrigger>
          <SelectContent>
            {addressesGroup.map((addressGroup) => (
              <SelectItem value={addressGroup.id.toString()} key={addressGroup.id.toString()}>
                {addressGroup.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p>
          The keys of this address group will be exported as a json file like this:
          <br/>
          {'[{ hex: "<pk1>" },{ hex: "<pk2>" },...,{ hex: "<pkN>" }]'}.
        </p>
        <Button
          className="w-full h-[40px]"
          onClick={exportKeys}
          disabled={status === 'loading' || !addressGroup}
        >
          {status === 'loading' && (
            <LoaderIcon className="animate-spin"/>
          )}
          {status === 'form' && 'Export Keys'}
        </Button>
      </>
    )
  } else if (status === 'success') {
    content = (
      <>
        <div
          className={'relative flex h-[64px] mt-[-5px] gradient-border-green'}
        >
          <div className={`absolute inset-0 flex flex-row items-center bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
          <span className="text-[20px] text-[var(--color-white-3)]">
            Keys Exported
          </span>
            <div className="flex flex-row items-center gap-2">
              <p className="font-mono !text-[20px]">
                {toCurrencyFormat(keysExported, 0, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
          <span className="text-[14px] text-[var(--color-white-1)] p-[11px_16px]">
            You have successfully exported {keysExported} keys from the address group "{
            addressesGroup.find((a) => a.id === parseInt(addressGroup))?.name
          }".
          </span>
        </div>

        <Button
          className="w-full h-[40px]"
          onClick={() => {
            setIsRedirecting(true)
            router.push('/admin/addresses')
          }}
        >
          {isRedirecting && (
            <LoaderIcon className="animate-spin"/>
          )}
          {!isRedirecting && 'Close'}
        </Button>
      </>
    )
  } else if (status === 'error') {
    content = (
      <>
        <div
          className={'relative flex h-[64px] mt-[-5px] gradient-border-red'}
        >
          <div className={`absolute inset-0 flex flex-row items-center bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
          <span className="text-[20px] text-[var(--color-white-3)]">
            Oops! Something went wrong.
          </span>
          </div>
        </div>

        <Button
          className="w-full h-[40px]"
          onClick={exportKeys}
        >
          Try Again
        </Button>
      </>
    )
  }

  return (
    <>
      <OverrideSidebar>
        <div className="flex flex-row justify-center w-full">
          <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8"
          >
            <ActivityHeader
              title="Export Addresses"
              subtitle={status === 'success' ? '' : 'Select the address group and export your keys json file.'}
              onClose={() => setAbortDialogOpen(true)}
              isDisabled={status === 'success'}
            />
            {content}
          </div>
        </div>
      </OverrideSidebar>
      <AbortConfirmationDialog
        type={'export'}
        isOpen={isAbortDialogOpen}
        onResponse={(abort) => {
          setAbortDialogOpen(false);
          if (abort) {
            setIsRedirecting(true)
            router.push('/admin/addresses')
          }
        }}
      />
    </>
  )
}
