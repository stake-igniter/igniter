import { BaseQuickInfoTooltip, BaseQuickInfoTooltipProps } from './BaseQuickInfoTooltip'
import { Button } from './button'
import { InfoIcon } from '../assets'
import React from 'react'

export type QuickInfoPopOverIconProps = Omit<BaseQuickInfoTooltipProps, 'children'>;

export function QuickInfoPopOverIcon(props: QuickInfoPopOverIconProps) {
  return (
    <BaseQuickInfoTooltip {...props}>
      <Button variant={'icon'} className={'h-[14px] w-[14px]'}>
        <InfoIcon />
      </Button>
    </BaseQuickInfoTooltip>
  );
}
