import { ActivityHeader } from '@/app/app/(takeover)/stake/components/ActivityHeader'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@igniter/ui/components/button'
import { ActivityContentLoading } from '@/app/app/(takeover)/stake/components/ActivityContentLoading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@igniter/ui/components/table'
import { getShortAddress, toCurrencyFormat } from '@igniter/ui/lib/utils'
import { Checkbox } from '@igniter/ui/components/checkbox'

type DataItem = {
  address: string;
  serviceDomain: string;
  stakeAmount: number;
  balance: number;
}

interface SelectNodesTableProps {
  data: Array<DataItem>;
  selectedNodes: Array<string>;
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>
}

function SelectNodesTable({data, selectedNodes, setSelectedNodes}: SelectNodesTableProps) {
  return (
    <Table className={'mt-[-16px]'}>
      <TableHeader>
        <TableRow className={'bg-[color:transparent] hover:bg-[color:transparent]'}>
          <TableHead className={'w-[60px]'}>
            <div className={'flex items-center justify-center gap-2'}>
              <Checkbox
                className={'border-3 aria-checked:border-1'}
                checked={selectedNodes.length === data.length}
                onClick={() => {
                  if (selectedNodes.length === data.length) {
                    setSelectedNodes([])
                  } else {
                    setSelectedNodes(data.map(item => item.address))
                  }
                }}
              />
              <p>All</p>
            </div>

          </TableHead>
          <TableHead className={'pl-4'}>Address</TableHead>
          <TableHead className={'pl-4'}>Domain</TableHead>
          <TableHead className={'pl-4'}>Stake {' '}
            <span className={'text-[color:var(--muted-foreground)]'}>
                  $POKT
                </span>
          </TableHead>
          <TableHead className={'pl-4'}>Balance{' '}
            <span className={'text-[color:var(--muted-foreground)]'}>
                  $POKT
                </span>
          </TableHead>
        </TableRow>

      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.address}
            className={'cursor-pointer'}
            onClick={() => setSelectedNodes(prev => {
              if (prev.includes(item.address)) {
                return prev.filter(node => node !== item.address)
              }

              return [...prev, item.address]
            })}
          >
            <TableCell className={'text-center'}>
              <div className={'h-[18px]'}>
                <Checkbox
                  className={'border-3 aria-checked:border-1'}
                  checked={selectedNodes.includes(item.address)}
                />
              </div>

            </TableCell>
            <TableCell>{getShortAddress(item.address, 4)}</TableCell>
            <TableCell>{item.serviceDomain}</TableCell>
            <TableCell>
              {toCurrencyFormat(item.stakeAmount, 2, 2)}
            </TableCell>
            <TableCell>
              {toCurrencyFormat(item.balance, 2, 2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface SelectNodesStepProps {
  morseOutputAddress: string;
  setNodes: (nodes: Array<string>) => void;
  onClose: () => void;
  onBack: () => void;
  selectedNodes: Array<string>;
}

export default function SelectNodesStep({
  morseOutputAddress,
  onClose,
  setNodes,
  onBack,
  selectedNodes: selectedNodesFromProps
}: SelectNodesStepProps) {
  const [{
    data,
    loading,
    error,
  }, setState] = useState<{
    data: Array<DataItem> | null;
    loading: boolean;
    error: boolean | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNodes = () => {
    abortControllerRef.current = new AbortController();

    setState(prev => ({...prev, loading: true}));

    fetch('/api/morse-nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: morseOutputAddress
      }),
      signal: abortControllerRef.current.signal,
    }).then(res => res.json()).then(data => {
      setSelectedNodes(
        selectedNodesFromProps.length ? selectedNodesFromProps.slice() : data.map(item => item.address)
      )
      setState(prev => ({...prev, data, loading: false}));
    }).catch(error => {
      setState(prev => ({...prev, error, loading: false}));
    });
  }

  useEffect(() => {
    fetchNodes();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [morseOutputAddress]);

  const [selectedNodes, setSelectedNodes] = useState<Array<string>>([]);

  return (
    <div
      className="flex flex-col w-[600px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8"
    >
      <ActivityHeader
        title="Migration"
        onBack={onBack}
        subtitle="Select the nodes you want to migrate."
        onClose={onClose}
      />

      {loading && (
        <ActivityContentLoading />
      )}

      {error && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <p className="text-center text-red-500">
            There was an error while loading the nodes.
          </p>
          <Button
            className="w-full h-[40px]"
            onClick={fetchNodes}
          >
            Try again
          </Button>
        </div>
      )}

      {data?.length && data.length > 0 && (
        <SelectNodesTable data={data} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} />
      )}

      <Button
        disabled={!selectedNodes.length}
        className="w-full h-[40px]"
        onClick={() => setNodes(selectedNodes!)}
      >
        Continue
      </Button>
    </div>
  )
}
