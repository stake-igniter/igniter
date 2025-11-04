'use client';

import Amount from '@igniter/ui/components/Amount'
import React from 'react'
import { clsx } from 'clsx'
import { DrawerDescription, DrawerHeader, DrawerTitle } from '@igniter/ui/components/drawer'
import { Button, ButtonProps } from '@igniter/ui/components/button'
import Summary, { SummaryRow } from '@igniter/ui/components/Summary'
import { amountToPokt } from '@igniter/ui/lib/utils'
import Address from '@igniter/ui/components/Address'
import {KeyWithRelations, RemediationHistoryEntry} from "@igniter/db/provider/schema"
import {KeyState, RemediationHistoryEntryReason, TransactionResult} from "@igniter/db/provider/enums"
import { QuickInfoPopOverIcon } from '@igniter/ui/components/QuickInfoPopOverIcon'
import { useRouter } from 'next/navigation'
import UpdateKeyRewardsSettings from '@/components/UpdateKeyRewardsSettings'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { UpdateKeysState } from '@/actions/Keys'

export interface KeyDetail {
  type: 'key'
  body: KeyWithRelations
}

function ActionButton({children, ...props}: React.PropsWithChildren & Omit<ButtonProps, 'children'>) {
  return (
    <Button
      {...props}
      className={
        clsx(
          'w-full h-[30px] bg-[color:var(--secondary)] border border-[color:var(--button-2-border)] hover:bg-transparent',
          props.className,
        )
      }
    >
      {children}
    </Button>
  )
}

function RemediationHistoryList({ entries, keyId, keyState }: { entries: RemediationHistoryEntry[]; keyId: number, keyState: KeyState }) {

  if (entries.length === 0) return null;

  const reasonLabel = (r: RemediationHistoryEntryReason) => {
    switch (r) {
      case RemediationHistoryEntryReason.ServiceMismatch:
        return 'Service mismatch'
      case RemediationHistoryEntryReason.DelegatorAddressMissing:
        return 'Delegator address missing'
      case RemediationHistoryEntryReason.OwnerInitialStake:
        return 'Owner initial stake'
      case RemediationHistoryEntryReason.SupplierStakeTooLow:
        return "Supplier's stake too low"
      case RemediationHistoryEntryReason.SupplierFundsTooLow:
        return "Supplier's funds too low"
      default:
        return String(r)
    }
  }

  const toMs = React.useCallback((t: number) => (t < 1e12 ? t * 1000 : t), [])

  const formatWhen = React.useCallback((t: number) => {
    const now = Date.now()
    const diff = now - t
    const oneMinute = 60 * 1000
    const oneHour = 60 * oneMinute
    const oneDay = 24 * oneHour
    if (diff < oneDay) {
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
      if (diff < oneMinute) return rtf.format(Math.round((t - now) / 1000), 'second')
      if (diff < oneHour) return rtf.format(Math.round((t - now) / oneMinute), 'minute')
      return rtf.format(Math.round((t - now) / oneHour), 'hour')
    }
    return new Date(t).toLocaleString()
  }, [])

  const sorted = React.useMemo(() => [...entries].sort((a, b) => b.timestamp - a.timestamp), [entries])

  const CollapsibleText = ({ text, limit = 220, className }: { text: string; limit?: number; className?: string }) => {
    const [expanded, setExpanded] = React.useState(false)
    if (!text) return null
    if (text.length <= limit) return <div className={className}>{text}</div>
    const shown = expanded ? text : text.slice(0, limit) + '…'
    return (
      <div className={className}>
        <span>{shown}</span>
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="ml-1 underline opacity-80 hover:opacity-100"
          aria-label={expanded ? 'Show less' : 'Show more'}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
    )
  }

  const formatClipboardText = React.useCallback((e: RemediationHistoryEntry) => {
    const ms = toMs(e.timestamp)
    const code = String(e.reason)
    const title = reasonLabel(e.reason)
    const time = new Date(ms).toLocaleString()
    const line1 = `[${code}] ${title}  ${time}`
    const line2 = (e.message ?? '').trim()
    const line3 = (e.details ?? e.txResultDetails ?? '').trim()
    return [line1, line2, line3].filter(Boolean).join('\n')
  }, [toMs])

  const CopyEntryButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false)

    const copy = async () => {
      try {
        if (navigator && 'clipboard' in navigator) {
          await navigator.clipboard.writeText(text)
        } else {
          throw new Error('clipboard api not available')
        }
      } catch {
        // Fallback for older browsers
        try {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.setAttribute('readonly', '')
          textarea.style.position = 'absolute'
          textarea.style.left = '-9999px'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        } catch {
          // ignore
        }
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }

    return (
      <Button
        type="button"
        onClick={copy}
        className="h-[22px] px-2 text-[11px] bg-transparent border border-[color:var(--button-2-border)] hover:bg-[color:var(--secondary)]"
        aria-label="Copy entry"
        title={copied ? 'Copied' : 'Copy'}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    )
  }

  const router = useRouter()
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onRequestRemediation = () => setShowConfirm(true)

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await UpdateKeysState([keyId], KeyState.Staked)
      setShowConfirm(false)
      router.refresh()
    } catch (e) {
      console.error('Failed to mark for remediation', e)
      setError(e instanceof Error ? e.message : 'Failed to update key state. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {[KeyState.AttentionNeeded, KeyState.RemediationFailed].includes(keyState) && (
        <ActionButton onClick={onRequestRemediation} disabled={isSubmitting}>
          Mark for remediation
        </ActionButton>
      )}

      <ConfirmationDialog
        title="Mark for remediation"
        open={showConfirm}
        onClose={() => { if (!isSubmitting) setShowConfirm(false) }}
        footerActions={(
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting} type="button">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Confirming…' : 'Confirm'}
            </Button>
          </>
        )}
      >
        {error && (
          <div className="px-4 py-2 text-[12px] text-red-400 bg-[color:var(--color-black-1)]">
            {error}
          </div>
        )}
        <div className="py-3 text-[14px] text-[var(--color-white-3)]">
          This will set the key state back to <span className="font-semibold">Staked</span>. Prompting the system to re-evaluate it.
        </div>
      </ConfirmationDialog>

      <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
        <div className="text-[12px] text-[var(--color-white-3)] p-[8px_12px]">Remediation history</div>
        <div className="flex flex-col">
          {sorted.map((e, idx) => {
            const ms = toMs(e.timestamp)
            const when = formatWhen(ms)
            return (
              <div key={`${e.timestamp}-${e.reason}-${idx}`} className="p-[8px_12px] text-[12px] text-[var(--color-white-3)] border-t border-[color:var(--button-2-border)] first:border-t-0">
                <div className="flex flex-row items-start justify-between gap-2 opacity-80">
                  <div className="flex flex-row items-center gap-2">
                    <span className="font-semibold">[{String(e.reason)}]</span>
                    <span>{reasonLabel(e.reason)}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <span className="font-mono" title={new Date(ms).toLocaleString()}>{when}</span>
                    <CopyEntryButton text={formatClipboardText(e)} />
                  </div>
                </div>
                <div className="mt-1">{e.message}</div>
                {e.details && (
                  <div className="opacity-80 break-words whitespace-pre-wrap">{e.details}</div>
                )}
                {typeof e.txResult !== 'undefined' && (
                  <div className="opacity-80">tx: {TransactionResult[e.txResult]}</div>
                )}
                {e.txResultDetails && (
                  <div className="mt-1">
                    <CollapsibleText
                      text={e.txResultDetails}
                      className="opacity-80 font-mono whitespace-pre-wrap break-words"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function KeyDetail(key: KeyWithRelations) {
  const {
    id,
    address,
    ownerAddress,
    state,
    balanceUpokt,
    stakeAmountUpokt,
    stakeOwner,
    lastUpdatedHeight,
    deliveredAt,
    delegator,
    delegatorRevSharePercentage,
    delegatorRewardsAddress,
    remediationHistory,
  } = key;

  const router = useRouter()
  const [showUpdateRewards, setShowUpdateRewards] = React.useState(false)

  const isStakedKey = [KeyState.Staked, KeyState.RemediationFailed, KeyState.AttentionNeeded, KeyState.Unstaked].includes(state);

  const generalKeyDetails: Array<SummaryRow> = [
    {
      label: 'Address',
      value: <Address address={address} />,
    },
    {
      label: 'Balance',
      value: <Amount value={amountToPokt(balanceUpokt?.toString() ?? 0)} />,
    },
    (isStakedKey && stakeOwner && stakeOwner !== ownerAddress) && {
      label: 'Stake Owner',
      value: stakeOwner ? <Address address={stakeOwner ?? ''} /> : 'N/A',
    },
    isStakedKey && {
      label: 'Owner',
      value: ownerAddress ? <Address address={ownerAddress ?? ''} /> : 'N/A',
    },
    delegator && {
      label: 'Delivered To',
      value: <span>{delegator.name}</span>,
    },
    delegator && {
      label: 'Delivered At',
      value: <span>{deliveredAt?.toISOString() ?? ''}</span>,
    },
    {
      label: 'Last Updated Height',
      value: <span>{lastUpdatedHeight}</span>,
    },
  ].filter(Boolean) as Array<SummaryRow>

  const delegatorRewardsDetails: Array<SummaryRow> = [
    {
      label: 'Delegator Rewards Address',
      value: (
        <div className={'gap-2 flex flex-row items-center'}>
          {delegatorRewardsAddress ? <Address address={delegatorRewardsAddress ?? ''} /> : 'N/A'}
          <QuickInfoPopOverIcon
            title={'Delegator Rewards Address'}
            description={'This is the address the stake intermediary expects to receive their rewards share. This information is gathered automatically. But keys created before igniter 0.3 might need to be manually updated.'}
          />
        </div>
      ),
    },
    {
      label: 'Delegator Rev Share',
      value: (
        <div className={'gap-2 flex flex-row items-center'}>
          <span>{delegatorRevSharePercentage ?? 'N/A'}</span>
          <QuickInfoPopOverIcon
            title={'Delegator Rev Share'}
            description={'The revShare percentage the stake intermediary expects to receive from each service.'}
          />
        </div>
      ),
    },
    {
      label: '',
      value: (
        <Button onClick={() => setShowUpdateRewards(true)}>
          Update
        </Button>
      )
    }
  ];

  return (
    <div className={'gap-8 flex flex-col'}>
      <DrawerHeader className={'p-0 gap-2'}>
        <DrawerTitle
          style={{
            fontSize: '1.875rem',
            fontWeight: 400,
          }}
        >
          Key
        </DrawerTitle>
        <DrawerDescription className={'text-sm'}>
          Details of a managed supplier address
        </DrawerDescription>
      </DrawerHeader>

      {isStakedKey && (
        <div
          className={
            clsx(
              'relative flex h-[64px] mt-[-5px]',
              (state === KeyState.Staked) && 'gradient-border-green',
              ([KeyState.Unstaked].includes(state)) && 'gradient-border-slate',
              ([KeyState.AttentionNeeded, KeyState.RemediationFailed].includes(state)) && 'gradient-border-red',
            )
          }
        >
          <div className={`absolute inset-0 flex flex-row items-center bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
          <span className="text-[20px] text-[var(--color-white-3)]">
            {state.slice(0, 1).toUpperCase() + state.slice(1)}
          </span>
            <div className="flex flex-row items-center gap-2">
              <p className="font-mono !text-[20px]">
                <Amount value={amountToPokt(stakeAmountUpokt?.toString() ?? 0)} />
              </p>
            </div>
          </div>
        </div>
      )}

      {!isStakedKey && (state === KeyState.Available) && (
        <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
          <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
             This key is readily <strong>available</strong> to be staked. When a request for suppliers is received this key is prioritized. It's a recommended practice to pre-configure these keys in their corresponding relay miner.
          </span>
        </div>
      )}

      {!isStakedKey && (state === KeyState.Imported) && (
        <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
          <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
             This key has recently been <strong>imported</strong>. The system will eventually evaluate it in the network and set it to its corresponding state, either <strong>available</strong>, <strong>staked</strong> or <strong>unstaked</strong>.
          </span>
        </div>
      )}

      {state === KeyState.Staked && (
        <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
          <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
             This key is <strong>{state}</strong>. The system has not detected any issues.
          </span>
        </div>
      )}

      {[KeyState.RemediationFailed, KeyState.AttentionNeeded].includes(state) && (
        <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
          <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
             This key is <strong>{state}</strong>. The system has detected issues with the key. This doesn't mean the supplier is not operational. Please review the details below.
          </span>
        </div>
      )}

      <Summary
        rows={generalKeyDetails}
      />

      {isStakedKey && (
        <Summary
          rows={delegatorRewardsDetails}
        />
      )}

      {(remediationHistory?.length ?? 0) > 0 && (
        <RemediationHistoryList
          entries={remediationHistory ?? []}
          keyState={state}
          keyId={id}
        />
      )}

      {showUpdateRewards && (
        <UpdateKeyRewardsSettings
          keyId={id}
          defaults={{
            delegatorRewardsAddress,
            delegatorRevSharePercentage,
          }}
          onClose={(updated) => {
            setShowUpdateRewards(false)
            if (updated) router.refresh()
          }}
        />
      )}
    </div>
  )
}
