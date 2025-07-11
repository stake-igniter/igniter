'use client'

import { Switch } from '../switch'
import { Label } from '../label'
import React, { createContext, useContext, useState } from 'react'

interface GroupAllContextProps {
  groupAll: boolean
  setGroupAll: (value: boolean) => void
}

const GroupAllContext = createContext<GroupAllContextProps>({
  groupAll: false,
  setGroupAll: () => {}
})

export function GroupAllProvider({children}: React.PropsWithChildren<{}>) {
  const [groupAll, setGroupAll] = useState(false)

  return (
    <GroupAllContext.Provider value={{groupAll, setGroupAll}}>
      {children}
    </GroupAllContext.Provider>
  )
}

export function useGroupAll() {
  const context = useContext(GroupAllContext)

  if (!context) {
    throw new Error('useGroupAll must be used within a GroupAllProvider')
  }

  return context
}

interface GroupAllSwitchProps {
  disabled?: boolean
}

export default function GroupAllSwitch({disabled}: GroupAllSwitchProps) {
  const {groupAll, setGroupAll} = useGroupAll()

  return (
    <div className={'flex items-center gap-2 text-xs'}>
      <Switch
        id={'group-all-addresses'}
        disabled={disabled}
        checked={groupAll}
        onCheckedChange={setGroupAll}
      />
      <Label htmlFor={'group-all-addresses'} className={'text-xs sm:text-sm font-medium'}>
        Group All
      </Label>
    </div>
  )
}
