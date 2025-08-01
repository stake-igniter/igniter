'use client'

import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { UpdateProvidersFromSource } from '@/actions/Providers'
import { Button } from '@igniter/ui/components/button'
import { LoaderIcon } from '@igniter/ui/assets'

export default function RefreshProviders() {
  const queryClient = useQueryClient();
  const [isUpdatingProviders, setIsUpdatingProviders] = React.useState(false);

  const reloadDelegators = async () => {
    // TODO: Error handling and display
    try {
      setIsUpdatingProviders(true);
      await UpdateProvidersFromSource();
      await queryClient.invalidateQueries({ queryKey: ['delegators'] });
    } catch (error) {
      console.error("Failed to update providers from source:", error);
    } finally {
      setIsUpdatingProviders(false);
    }
  }

  return (
    <Button
      variant={"outline"}
      onClick={reloadDelegators}
      disabled={isUpdatingProviders}
    >
      {isUpdatingProviders ? (
        <LoaderIcon className="animate-spin" />
      ) : (
        "Reload"
      )}
    </Button>
  )
}
