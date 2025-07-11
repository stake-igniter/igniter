'use client'

import { ChartTypeSelect } from '../BaseLineBarChart/ChartType'
import React from 'react'
import { chartTypeCookieKey } from './constants'

export default function CardActions() {
  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ChartTypeSelect chartTypeCookieKey={chartTypeCookieKey} />
    </div>
  )
}
