'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import {AddOrUpdateServiceDialog} from "@/components/AddOrUpdateServiceDialog";
import ServicesTable from "@/app/admin/(internal)/services/table";
import {useQueryClient} from "@tanstack/react-query";

export default function ServicesPages() {
  const queryClient = useQueryClient();
  const [isAddingService, setIsAddingService] = React.useState(false);
  return (
    <div className="flex flex-col gap-10">
      {isAddingService && (
        <AddOrUpdateServiceDialog
          onClose={(shouldRefreshServices) => {
            setIsAddingService(false);
            if (shouldRefreshServices) {
              queryClient.invalidateQueries({queryKey: ['services']});
            }
          }}
          />
      )}
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Services</h1>
          <Button
            variant={"outline"}
            onClick={() => setIsAddingService(true) }
            >
            Add New
          </Button>
        </div>
        <div className="container mx-auto ">
          <ServicesTable />
        </div>
      </div>
    </div>
  )
}
