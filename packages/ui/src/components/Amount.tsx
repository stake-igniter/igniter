import { toCurrencyFormat } from '../lib/utils'

interface AmountProps {
  value: number;
}

// TODO: Consume unit price context to display the correct currency between USD and POKT

export default function Amount({value}: AmountProps) {
  return (
    <span className={'text-[inherit]'}>
      {toCurrencyFormat(value, 2, 2)}{' '}
      <span className={'text-[color:var(--muted-foreground)]'}>
        $POKT
      </span>
    </span>
  )
}
