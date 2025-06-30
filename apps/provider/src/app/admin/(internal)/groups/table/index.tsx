'use client';

import {useEffect, useMemo, useState} from "react";
import {AddressGroup, AddressGroupWithDetails} from "@/db/schema";
import {DeleteAddressGroup, ListAddressGroups} from "@/actions/AddressGroups";
import {Button} from "@igniter/ui/components/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import DataTable from "@igniter/ui/components/DataTable/index";
import {columns, filters, sorts} from "./columns";
import {AddOrUpdateAddressGroupDialog} from "@/components/AddOrUpdateAddressGroupDialog";
import {useQuery} from "@tanstack/react-query";

export default function AddressGroupsTable() {
  const {data: addressGroups, refetch: fetchAddressGroups, isLoading: isLoadingAddressGroups} = useQuery({
    queryKey: ['groups'],
    queryFn: ListAddressGroups,
    staleTime: Infinity,
    refetchInterval: 60000,
    initialData: []
  });

  const [isAddingAddressGroup, setIsAddingAddressGroup] = useState(false);
  const [isDeletingAddressGroup, setIsDeletingAddressGroup] = useState(false);
  const [updateAddressGroup, setUpdateAddressGroup] = useState<AddressGroupWithDetails | null>(null);
  const [addressGroupToDelete, setAddressGroupToDelete] = useState<AddressGroup | null>(null);

  const isLoading = useMemo(() => {
    return isLoadingAddressGroups ||
      isDeletingAddressGroup;
  }, [isLoadingAddressGroups, isDeletingAddressGroup]);

  useEffect(() => {
    fetchAddressGroups();
  }, []);

  const content = (
    <DataTable
      columns={[
        ...columns,
        {
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <div className="flex gap-2 justify-end">
              <Button
                disabled={isLoading}
                className="bg-slate-2 border-0"
                variant={"outline"}
                onClick={() => setUpdateAddressGroup(row.original)}
              >
                Update
              </Button>
              <Button
                disabled={isLoading}
                className="bg-slate-2 border-0"
                variant={"outline"}
                onClick={() => setAddressGroupToDelete(row.original)}
              >
                Delete
              </Button>
            </div>
          )
        }
      ]}
      data={addressGroups}
      filters={filters}
      sorts={sorts}
    />
  );

  const confirmDeleteAddressGroup = async () => {
    if (!addressGroupToDelete) return;

    try {
      setIsDeletingAddressGroup(true);
      await DeleteAddressGroup(addressGroupToDelete.id);
      await fetchAddressGroups();
    } catch (error) {
      console.error("Failed to delete addressGroup:", error);
    } finally {
      setIsDeletingAddressGroup(false);
      setAddressGroupToDelete(null);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      {isAddingAddressGroup && (
        <AddOrUpdateAddressGroupDialog
          onClose={(shouldRefreshAddressGroups) => {
            setIsAddingAddressGroup(false);

            if (shouldRefreshAddressGroups) {
              fetchAddressGroups();
            }
          }}
        />
      )}

      {updateAddressGroup && (
        <AddOrUpdateAddressGroupDialog
          onClose={(shouldRefreshAddressGroups) => {
            setUpdateAddressGroup(null);

            if (shouldRefreshAddressGroups) {
              fetchAddressGroups();
            }
          }}
          addressGroup={updateAddressGroup}
        />
      )}
      <div className="py-2 max-h-[500px] min-h-[300px] overflow-y-scroll scrollbar-hidden">
        {content}
      </div>
      {addressGroupToDelete && (
        <ConfirmationDialog
          title="Delete AddressGroup"
          open={!!addressGroupToDelete}
          onClose={() => setAddressGroupToDelete(null)}
          footerActions={
            <>
              <Button
                variant="outline"
                onClick={() => setAddressGroupToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDeleteAddressGroup()}
                disabled={isLoading}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>
            Are you sure you want to delete the Address Group &quot;{addressGroupToDelete.name}&quot;?
            This action cannot be undone.
          </p>
        </ConfirmationDialog>
      )}
    </div>
  );
}
