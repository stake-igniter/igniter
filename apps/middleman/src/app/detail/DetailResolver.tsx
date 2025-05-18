'use client'

import { DetailItem } from '@/app/detail/Detail'
import { Drawer, DrawerClose, DrawerContent } from '@igniter/ui/components/drawer'
import { Button } from '@igniter/ui/components/button'
import * as React from 'react'
import { useRef } from 'react'
import { ArrowBackIcon, LoaderIcon, XIcon } from '@igniter/ui/assets'
import { clsx } from 'clsx'
import NodeDetail from '@/app/detail/NodeDetail'
import DetailHeader from '@/app/detail/Header'
import TransactionDetail from '@/app/detail/TransactionDetail'

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return !!value && typeof (value as any).then === 'function';
}

function PromiseItem({item}: {item: Promise<DetailItem>}) {
  const [{isLoading, error, data}, setState] = React.useState<{
    isLoading: boolean
    error: Error | null
    data: DetailItem | null
  }>({
    isLoading: true,
    error: null,
    data: null,
  })

  React.useEffect(() => {
    setState({
      isLoading: true,
      error: null,
      data: null,
    })
    item.then((item) => setState({
      isLoading: false,
      error: null,
      data: item,
    })).catch((error) => setState({
      isLoading: false,
      error,
      data: null,
    }))
  }, [item])

  if (isLoading) {
    return (
      <div className={'w-full h-[calc(100%-72px)] flex items-center justify-center'}>
        <div className={'hidden'}>
          <DetailHeader title={'Loading'} description={'loading...'} />
        </div>
        <div className={'scale-200'}>
          <LoaderIcon className="animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={'w-full h-full flex items-center justify-center'}>
        <p>Error</p>
      </div>
    )
  }

  return <ResolvedItem item={data!} />
}

function ResolvedItem({item}: {item: DetailItem}) {
  if (!item) return null

  console.log('ResolvedItem', item.type, item.body);

  switch (item.type) {
    case 'node': {
      return (
        <NodeDetail
          {...item.body}
        />
      )
    }
    case 'transaction': {
      return (
        <TransactionDetail
          {...item.body}
        />
      )
    }
  }
}

interface DetailResolverProps {
  items: Array<DetailItem | Promise<DetailItem>>
  clearItems: () => void
  back: () => void
}

export default function DetailResolver({
  items,
  clearItems,
  back,
}: DetailResolverProps) {
  const lastItemRef = useRef<DetailItem | Promise<DetailItem>>(null)
  const lastItemFromArray = items.at(-1)
  const lastItem = lastItemFromArray || lastItemRef.current

  return (
    <Drawer
      open={!!lastItemFromArray}
      direction={'right'}
      onClose={() => {
        // this is needed to keep showing the item while the drawer is closing
        lastItemRef.current = lastItemFromArray!
        clearItems()
      }}
    >
      <DrawerContent className={'!w-[478px] !max-w-[478px]'}>
        <div className="h-full max-h-sm w-[478px] px-[32px] overflow-auto pb-8">
          <div
            className={
              clsx(
                'mt-6 flex items-center mb-3',
                items.length <= 1 && 'justify-end',
                items.length > 1 && 'justify-between'
              )
            }
          >
            {items.length > 1 && (
              <Button
                variant={'icon'}
                className={'h-[30px]'}
                onClick={back}
              >
                <ArrowBackIcon className={'text-[color:var(--foreground)]'} />
              </Button>
            )}

            <DrawerClose asChild>
              <Button variant={'icon'} className={'h-[30px]'}>
                <XIcon className={'text-[color:var(--foreground)]'} />
              </Button>
            </DrawerClose>
          </div>

          {isPromise(lastItem) ? <PromiseItem item={lastItem} /> : <ResolvedItem item={lastItem!} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
