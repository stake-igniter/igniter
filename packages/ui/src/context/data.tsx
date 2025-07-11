'use client'

import React, { createContext, useContext, useState } from 'react'

interface DataContextProps<T extends object> {
  data: Array<T>
  setData: (data: Array<T>) => void
}

const Data = createContext<DataContextProps<any>>({
  data: [],
  setData: () => {},
})

interface DataProviderProps<T extends object> {
  children: React.ReactNode
  initialData: Array<T>
}

export default function DataProvider<T extends object>({
  children,
  initialData,
}: DataProviderProps<T>) {
  const [data, setData] = useState<Array<T>>(initialData || [])

  return (
    <Data.Provider
      value={{
        data,
        setData,
      }}
    >
      {children}
    </Data.Provider>
  )
}

export function useDataContext<T extends object>() {
  const context = useContext(Data)

  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }

  return context as {
    setData: (data: Array<T>) => void
    data: Array<T>
  }
}
