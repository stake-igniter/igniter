'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import DelegatorsTable from "@/app/admin/(internal)/delegators/table";
import {UpdateDelegatorsFromSource} from "@/actions/Delegators";
import {useQueryClient} from "@tanstack/react-query";
import {LoaderIcon} from "@igniter/ui/assets";

export default function DelegatorsPage() {
  const queryClient = useQueryClient();
  const [isUpdatingDelegators, setIsUpdatingDelegators] = React.useState(false);

  const reloadDelegators = async () => {
      // TODO: Error handling and display
      try {
        setIsUpdatingDelegators(true);
        await UpdateDelegatorsFromSource();
        await queryClient.invalidateQueries({ queryKey: ['delegators'] });
      } catch (error) {
        console.error("Failed to update delegators from source:", error);
      } finally {
        setIsUpdatingDelegators(false);
      }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Delegators</h1>
          <Button
            variant={"outline"}
            onClick={reloadDelegators}
            disabled={isUpdatingDelegators}
          >
            {isUpdatingDelegators ? (
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
