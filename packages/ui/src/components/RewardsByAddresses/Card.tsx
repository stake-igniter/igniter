import React from 'react'
import { containerId, timeSelectedCookieKey } from './constants'
import GroupAllSwitch from './GroupAllSwitch'
import { TimeSelector } from './TimeSelector'

interface ProductivityCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disabled?: boolean
}

export default function RewardsByAddressCard({
  children,
  actions,
  disabled,
}: ProductivityCardProps) {
  return (
    <div id={containerId} className={"h-[600px] xl:h-[400px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between gap-2'}>
        <div className={'flex flex-wrap flex-row items-center gap-2 sm:gap-3 min-h-7'}>
          <p className={'!text-lg font-semibold leading-7'}>
            Rewards
          </p>
          <TimeSelector includeLabel={false} cookieKey={timeSelectedCookieKey} />
          <GroupAllSwitch disabled={disabled} />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
