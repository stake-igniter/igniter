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
import { Trash2Icon, PencilIcon } from "lucide-react";
import {useNotifications} from "@igniter/ui/context/Notifications/index";

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
  const { addNotification } = useNotifications();

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
                <div className="flex gap-2 justify-end">
                    <Button
                        disabled={isLoading}
                        variant="ghost"
                        size="icon"
                        onClick={() => setUpdateAddressGroup(row.original)}
                        title="Edit AddressGroup"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        disabled={isLoading}
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (row.original.keysCount > 0) {
                                addNotification({
                                    id: `ag-has-keys-error`,
                                    type: 'warning',
                                    showTypeIcon: true,
                                    content: 'Address groups with associated keys are protected from deletion. Support for removing these groups will be added in a future version.'
                                });

                                return;
                            }

                            setAddressGroupToDelete(row.original);
                        }}
                        title={'Delete Address Group'}
                    >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
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
        addNotification({
            id: `delete-ag-error`,
            type: 'error',
            showTypeIcon: true,
            content: 'Failed to delete the address group. This could be due to a network issue or server problem. Please try again or contact support if the problem persists.'
        });
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
