'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import DelegatorsTable from "@/app/admin/(internal)/providers/table";
import {UpdateProvidersFromSource} from "@/actions/Providers";
import {useQueryClient} from "@tanstack/react-query";
import {LoaderIcon} from "@igniter/ui/assets";

export default function ProvidersPage() {
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
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Providers</h1>
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
        </div>
        <div className="container mx-auto ">
          <DelegatorsTable />
        </div>
      </div>
    </div>
  )
}
