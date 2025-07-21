import React from 'react'
import CurrentUser from '@/components/CurrentUser'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-[400px] gap-3 py-10 px-4 sm:!bg-background sm:border border-[color:var(--divider)] rounded-lg">
      <h1 className={'font-bold'}>Provider Sign In</h1>
      <p className={'mb-3'}>
        If you are an admin, please sign in to continue.
      </p>
      <CurrentUser />
    </div>
  )
}
