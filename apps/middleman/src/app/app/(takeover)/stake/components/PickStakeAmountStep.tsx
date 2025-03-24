'use client';

import {useEffect, useMemo, useState} from "react";
import {InfoIcon} from "@igniter/ui/assets";
import {AmountPickerSlider} from "@/app/app/(takeover)/stake/components/AmountPickerSlider";
import {AmountDisplay} from "@/app/app/(takeover)/stake/components/AmountDisplay";
import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/app/(takeover)/stake/components/ActivityHeader";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {ActivityContentLoading} from "@/app/app/(takeover)/stake/components/ActivityContentLoading";
import {QuickInfoPopOverIcon} from "@igniter/ui/components/QuickInfoPopOverIcon";


export interface PickStakeAmountStepProps {
    defaultAmount: number;
    onAmountSelected: (amount: number) => void;
}


export function PickStakeAmountStep({onAmountSelected, defaultAmount}: Readonly<PickStakeAmountStepProps>) {
    const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
    const [balance, setBalance] = useState<number>(-1);
    const { getBalance, connectedIdentity } = useWalletConnection();
    const [minimumStake, setMinimumStake] = useState<number>(0);
    const applicationSettings = useApplicationSettings();
    const isViewReady = useMemo(() => {
      return balance >= 0 && minimumStake > 0;
    }, [balance, minimumStake])


    useEffect(() => {
      if (connectedIdentity) {
        (async () => {
          try {
            const balance = await getBalance(connectedIdentity);
            setBalance(balance / 1e6);
          } catch {
            console.log('An error occurred while getting the balance from your connected wallet.');
          }
        })();
      }
    }, [connectedIdentity]);

    useEffect(() => {
      if (applicationSettings) {
        setMinimumStake(Number(applicationSettings.minimumStake));
      }
    }, [applicationSettings]);

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                title="Stake"
                subtitle="Use the slider below to pick an amount to stake."
            />

            {!isViewReady && (
              <ActivityContentLoading />
            )}

            {isViewReady && (
              <>
                <AmountPickerSlider
                  balance={balance}
                  amount={selectedAmount}
                  minimumStake={minimumStake}
                  onValueChange={setSelectedAmount}
                />
                <AmountDisplay
                  balance={balance}
                  amount={selectedAmount}
                  onMaxSelected={() => setSelectedAmount(Math.floor(balance / minimumStake) * minimumStake)}
                />
                <div
                  className="flex flex-row items-center justify-between border border-[--black-dividers] rounded-[8px] p-4">
                <span className="flex flex-row items-center gap-2">
                    <span>
                        Service Fee
                    </span>
                    <QuickInfoPopOverIcon
                      title="Service Fee"
                      description="The % of the rewards that this website retain for handling the service."
                      url={''}
                    />
                </span>
                  {applicationSettings?.fee && (
                    <span className="text-[14px] text-[var(--color-white-1)]">{Number(applicationSettings?.fee).toFixed(0)}%</span>
                  )}
                </div>
              </>
            )}

          <Button
            disabled={selectedAmount === 0}
                className="w-full h-[40px]"
                onClick={() => onAmountSelected(selectedAmount)}
            >
                Continue
            </Button>
        </div>
    );
}
