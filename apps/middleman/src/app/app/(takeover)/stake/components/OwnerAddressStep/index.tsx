import { ActivityHeader } from '@igniter/ui/components/ActivityHeader';
import { useWalletConnection } from '@igniter/ui/context/WalletConnection/index'
import { useEffect, useState } from 'react'
import { UserAvatar } from '@igniter/ui/components/UserAvatar'
import { getShortAddress } from '@igniter/ui/lib/utils'
import { Checkbox } from '@igniter/ui/components/checkbox'
import { Button } from '@igniter/ui/components/button'
import Amount from '@igniter/ui/components/Amount'

interface OwnerAddressStepProps {
  onClose: () => void;
  selectedOwnerAddress?: string;
  onOwnerAddressSelected: (address: string) => void;
}

export default function OwnerAddressStep({onClose, onOwnerAddressSelected, selectedOwnerAddress: selectedOwnerAddressFromProps}: OwnerAddressStepProps) {
  const {connectedIdentity, connectedIdentities, getBalance} = useWalletConnection();
  const [{data: balancesByAddress, error, loading}, setBalancesState] = useState<{
    data: Record<string, number> | null
    loading: boolean,
    error: boolean
  }>({
    data: null,
    loading: false,
    error: false
  })
  const [selectedOwnerAddress, setSelectedOwnerAddress] = useState(selectedOwnerAddressFromProps || '')

  const fetchBalances = async () => {
    setBalancesState(prevState => ({
      ...prevState,
      loading: true,
    }))

    Promise.all(
      connectedIdentities!.map((address) => {
        return getBalance(address).then((balance) => {
          return {address, balance: balance / 1e6}
        })
      })
    ).then((balances) => {
      setBalancesState({
        loading: false,
        error: false,
        data: balances.reduce((acc: Record<string, number>, {address, balance}) => {
          acc[address] = balance
          return acc
        }, {})
      })
    }).catch(() => {
      setBalancesState({
        loading: false,
        error: true,
        data: null
      })
    })
  }

  useEffect(() => {
    fetchBalances()
  }, [connectedIdentities])

  return (
    <div
      className="flex relative flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
      <ActivityHeader
        title="Stake"
        subtitle="Select the owner address of your nodes."
        onClose={onClose}
      />

      <div className={'flex flex-col gap-4 h-full overflow-y-auto'}>
        <div
          className="w-full h-11 cursor-pointer select-none flex flex-row items-center gap-2 py-3 pl-3 pr-4 bg-(--input-bg) border border-amber-100 rounded-lg"
          onClick={() => setSelectedOwnerAddress(connectedIdentity!)}
        >
          <UserAvatar address={connectedIdentity!} selectedAvatar={1} />
          <div className="flex flex-col w-full gap-0">
            <p className="font-mono text-sm">
              {getShortAddress(connectedIdentity!, 5)}
            </p>
          </div>
          {balancesByAddress && typeof balancesByAddress[connectedIdentity!] === 'number' ? (
            <p className={'whitespace-nowrap !text-xs mr-2 mb-1'}>
              <Amount value={balancesByAddress[connectedIdentity!] || 0} />
            </p>
          ) : loading ? (
            <p>
              Loading
            </p>
          ): (
            <p>
              Error
            </p>
          )}
          <Checkbox
            checked={selectedOwnerAddress === connectedIdentity}
          />
        </div>
        <p className={'!text-[10px] mb-2.5 mt-[-12px] ml-1'}>
          You're signed in with this account.
        </p>

        <div className="absolute left-[24px] top-[246px] w-[432px] h-[1px] bg-[var(--slate-dividers)]"/>

        {connectedIdentities!.filter(a => a !== connectedIdentity).map((address) => (
          <div
            key={address}
            className="w-full h-11 cursor-pointer select-none flex flex-row items-center gap-2 py-3 pl-3 pr-4 bg-(--input-bg) border rounded-lg"
            onClick={() => setSelectedOwnerAddress(address)}
          >
            <UserAvatar address={address} selectedAvatar={1} />
            <div className="flex flex-col w-full gap-0">
              <p className="font-mono text-sm">
                {getShortAddress(address, 5)}
              </p>
            </div>
            {balancesByAddress && typeof balancesByAddress[address] === 'number' ? (
              <p className={'whitespace-nowrap !text-xs mr-2 mb-1'}>
                <Amount value={balancesByAddress[address]} />
              </p>
            ) : loading ? (
              <p>
                Loading
              </p>
            ): (
              <p>
                Error
              </p>
            )}

            <Checkbox
              checked={selectedOwnerAddress === address}
            />
          </div>
        ))}
      </div>

      <Button
        disabled={!selectedOwnerAddress}
        className="w-full h-[40px]"
        onClick={() => onOwnerAddressSelected(selectedOwnerAddress)}
      >
        Continue
      </Button>
    </div>
  )
}
