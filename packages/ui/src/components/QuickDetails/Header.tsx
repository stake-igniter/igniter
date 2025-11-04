import { DrawerDescription, DrawerHeader, DrawerTitle } from '@igniter/ui/components/drawer'
import React from 'react'

interface DetailHeaderProps {
  title: string
  description: string
}

export default function DetailHeader({title, description}: DetailHeaderProps) {
  return (
    <DrawerHeader className={'p-0 gap-2'}>
      <DrawerTitle
        style={{
          fontSize: '1.875rem',
          fontWeight: 400,
        }}
      >
        {title}
      </DrawerTitle>
      <DrawerDescription className={'text-sm'}>
        {description}
      </DrawerDescription>
    </DrawerHeader>
  )
}
