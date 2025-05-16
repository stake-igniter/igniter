'use client';
import { Button } from './button'
import CopyIcon from '../assets/icons/dark/copy.svg'
import CheckIcon from '../assets/icons/dark/check_success.svg'
import React from 'react'

interface TransactionHashProps {
  hash: string;
  onClick?: () => void;
}

export default function TransactionHash({hash, onClick}: TransactionHashProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const truncateHash = hash.slice(0, 7) + '...' + hash.slice(-7);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  return (
    <div className={'flex items-center gap-3'}>
      <Button variant={'link'} className={'!p-0 text-[color:var(--ring)] border-none h-5'} onClick={onClick}>
        {truncateHash}
      </Button>
      <Button variant={'icon'} className={'h-5'} onClick={handleCopy}>
        {isCopied ? (
          <CheckIcon />
        ) : (
          <CopyIcon style={{marginTop: '4px'}} />
        )}
      </Button>
    </div>
  )
}
