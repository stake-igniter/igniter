'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import {AddOrUpdateAddressGroupDialog} from "@/components/AddOrUpdateAddressGroupDialog";
import AddressGroupsTable from "@/app/admin/(internal)/groups/table";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {ListServices} from "@/actions/Services";

export default function GroupsPage() {
  const queryClient = useQueryClient();

  const [isAddingGroup, setIsAddingGroup] = React.useState(false);
  return (
    <div className="flex flex-col gap-10">
      {isAddingGroup && (
        <AddOrUpdateAddressGroupDialog
          onClose={(shouldRefreshAddressGroups) => {
            setIsAddingGroup(false);
            if (shouldRefreshAddressGroups) {
              queryClient.invalidateQueries({queryKey: ['groups']});
            }
          }}
        />
      )}
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Address Groups</h1>
          <Button
            variant={"outline"}
            onClick={() => setIsAddingGroup(true) }
          >
            Add New
          </Button>
        </div>
        <div className="container mx-auto ">
          <AddressGroupsTable />
        </div>
      </div>
    </div>
  )
}
