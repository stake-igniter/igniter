'use client'

import * as React from 'react'

import { Button } from '@igniter/ui/components/button'
import { NodeStatus, ProviderFee, TransactionStatus, TransactionType } from '@/db/schema'
import { useAddItemToDetail } from '@/app/detail/Detail'
import { MessageType } from '@/lib/constants'

export function DrawerDemo() {
  const addItem = useAddItemToDetail();
  return (
    <Button
      variant="outline"
      onClick={() => {
        addItem({
          type: 'node',
          body: {
            status: NodeStatus.Staked,
            address: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
            operationalFundsAmount: 1,
            stakeAmount: 45_000,
            transactions: [
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.Upstake,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.UpTo,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Stake,
                    value: {
                      signer: '',
                      ownerAddress: '',
                      operatorAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      stake: {
                        denom: 'upokt',
                        amount: 45_000
                      },
                      services: []
                    }
                  },
                ]
              },
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.Stake,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.UpTo,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Stake,
                    value: {
                      signer: '',
                      ownerAddress: '',
                      operatorAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      stake: {
                        denom: 'upokt',
                        amount: 15_000
                      },
                      services: []
                    }
                  },
                  {
                    typeUrl: MessageType.Send,
                    value: {
                      fromAddress: '',
                      toAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      amount: [{
                        denom: 'upokt',
                        amount: 3e6
                      }],
                    }
                  },
                ]
              },
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.Unstake,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.UpTo,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Unstake,
                    value: {
                      signer: '',
                      operatorAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                    }
                  },
                ]
              },
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.OperationalFunds,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.UpTo,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Send,
                    value: {
                      fromAddress: '',
                      toAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      amount: [{
                        denom: 'upokt',
                        amount: 3e6
                      }],
                    }
                  },
                ]
              },
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.Stake,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.Fixed,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Stake,
                    value: {
                      signer: '',
                      ownerAddress: '',
                      operatorAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      stake: {
                        denom: 'upokt',
                        amount: 15_000
                      },
                      services: []
                    }
                  },
                  {
                    typeUrl: MessageType.Send,
                    value: {
                      fromAddress: '',
                      toAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      amount: [{
                        denom: 'upokt',
                        amount: 3e6
                      }],
                    }
                  },
                ]
              },
              {
                hash: '910C85A493BBF815862EBA00ADBF0897F37C4304756A664AF2340CC8A93352F3',
                status: TransactionStatus.Success,
                createdAt: new Date(),
                type: TransactionType.Stake,
                provider: 'POKTscan',
                providerFee: 25,
                typeProviderFee: ProviderFee.Fixed,
                estimatedFee: 2e6,
                operations: [
                  {
                    typeUrl: MessageType.Stake,
                    value: {
                      signer: '',
                      ownerAddress: '',
                      operatorAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      stake: {
                        denom: 'upokt',
                        amount: 15_000
                      },
                      services: []
                    }
                  },
                  {
                    typeUrl: MessageType.Send,
                    value: {
                      fromAddress: '',
                      toAddress: 'pokt1jelx4ja2q28w626q9a0yl4wrs5asngwqch76vp',
                      amount: [{
                        denom: 'upokt',
                        amount: 3e6
                      }],
                    }
                  },
                ]
              },
            ]
          }
        })
      }}
    >
      Open Drawer
    </Button>
  )
}
