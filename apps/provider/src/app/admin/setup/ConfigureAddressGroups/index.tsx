'use client';

import {useEffect, useState} from "react";
import {AddressGroup, Service} from "@/db/schema";
import {DeleteAddressGroup, ListAddressGroups} from "@/actions/AddressGroups";
import {Button} from "@igniter/ui/components/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {DataTable} from "@/components/DataTable";
import {columns} from "./Columns";
import {AddOrUpdateAddressGroupDialog} from "./AddOrUpdateAddressGroupDialog";
import {LoaderIcon} from "@igniter/ui/assets";
import {ListServices} from "@/actions/Services";

export interface ConfigureAddressGroupsProp {
  goNext: () => void;
  goBack: () => void;
}

export default function ConfigureAddressGroups({ goNext, goBack }: Readonly<ConfigureAddressGroupsProp>) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddressGroup, setIsAddingAddressGroup] = useState(false);
  const [updateAddressGroup, setUpdateAddressGroup] = useState<AddressGroup | null>(null);
  const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([]);
  const [addressGroupToDelete, setAddressGroupToDelete] = useState<AddressGroup | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const content = addressGroups.length > 0
    ? (
        <DataTable
          columns={columns}
          data={addressGroups}
          addItemAction={
            <Button
              onClick={() => setIsAddingAddressGroup(true) }
            >
              Add addressGroup
            </Button>
          }
          itemActions={(addressGroup) => (
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                variant="secondary"
                onClick={() => setUpdateAddressGroup(addressGroup)}
              >
                Update
              </Button>
              <Button
                disabled={isLoading}
                variant="destructive"
                onClick={() => setAddressGroupToDelete(addressGroup)}
              >
                Delete
              </Button>
            </div>
          )}
        />
      )
    : (
        <div className="flex justify-center items-center w-full h-full">
          {!isLoading && (
            <Button
              onClick={() => setIsAddingAddressGroup(true) }
            >
              Add your first Address Group
            </Button>
          )}
          {isLoading && (
            <LoaderIcon className="animate-spin" />
          )}
        </div>
      );

  const fetchAddressGroups = async () => {
    try {
      setIsLoading(true);
      const addressGroupsList = await ListAddressGroups();
      setAddressGroups(addressGroupsList);
    } catch (error) {
      console.error("Failed to fetch addressGroups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAddressGroup = async () => {
    if (!addressGroupToDelete) return;

    try {
      setIsLoading(true);
      await DeleteAddressGroup(addressGroupToDelete.id);
      await fetchAddressGroups();
    } catch (error) {
      console.error("Failed to delete addressGroup:", error);
    } finally {
      setIsLoading(false);
      setAddressGroupToDelete(null);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const servicesList = await ListServices();
      setServices(servicesList);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddressGroups();
    fetchServices();
  }, []);

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
      <div className="py-2 max-h-[500px] min-h-[300px] overflow-y-scroll">
        {content}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          disabled={isLoading}
          onClick={goBack}>
          Back
        </Button>
        <Button
          disabled={isLoading || (addressGroups.length === 0)}
          onClick={goNext}
          >
          Next
        </Button>
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
