'use client';

import {useEffect, useMemo, useState} from "react";
import {RelayMiner} from "@/db/schema";
import {DeleteRelayMiner, ListRelayMiners} from "@/actions/RelayMiners";
import {Button} from "@igniter/ui/components/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {DataTable} from "@/components/DataTable";
import {columns} from "./Columns";
import {AddOrUpdateRelayMinerDialog} from "@/components/AddOrUpdateRelayMinerDialog";
import {LoaderIcon} from "@igniter/ui/assets";

export interface ConfigureRelayMinersProp {
  goNext: () => void;
  goBack: () => void;
}

export default function ConfigureRelayMiners({ goNext, goBack }: Readonly<ConfigureRelayMinersProp>) {
  const [isLoadingRelayMiners, setIsLoadingRelayMiners] = useState(false);
  const [isAddingRelayMiner, setIsAddingRelayMiner] = useState(false);
  const [isDeletingRelayMiner, setIsDeletingRelayMiner] = useState(false);
  const [updateRelayMiner, setUpdateRelayMiner] = useState<RelayMiner | null>(null);
  const [relayMiners, setRelayMiners] = useState<RelayMiner[]>([]);
  const [relayMinerToDelete, setRelayMinerToDelete] = useState<RelayMiner | null>(null);

  const isLoading = useMemo(() => {
    return isLoadingRelayMiners ||
      isDeletingRelayMiner;
    }, [isLoadingRelayMiners, isDeletingRelayMiner]);

  const content = relayMiners.length > 0
    ? (
        <DataTable
          columns={columns}
          data={relayMiners}
          searchableFields={["name", "region", "domain"]}
          actions={
            <Button
              onClick={() => setIsAddingRelayMiner(true) }
            >
              Add address Group
            </Button>
          }
          itemActions={(relayMiner) => (
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                variant="secondary"
                onClick={() => setUpdateRelayMiner(relayMiner)}
              >
                Update
              </Button>
              <Button
                disabled={isLoading}
                variant="destructive"
                onClick={() => setRelayMinerToDelete(relayMiner)}
              >
                Delete
              </Button>
            </div>
          )}
        />
      )
    : (
        <div className="flex justify-center items-center w-full h-[300px]">
          {!isLoading && (
            <Button
              onClick={() => setIsAddingRelayMiner(true) }
            >
              Add your first Relay Miner
            </Button>
          )}
          {isLoading && (
            <LoaderIcon className="animate-spin" />
          )}
        </div>
      );

  const fetchRelayMiners = async () => {
    try {
      setIsLoadingRelayMiners(true);
      const relayMinersList = await ListRelayMiners();
      setRelayMiners(relayMinersList);
    } catch (error) {
      console.error("Failed to fetch relayMiners:", error);
    } finally {
      setIsLoadingRelayMiners(false);
    }
  };

  const confirmDeleteRelayMiner = async () => {
    if (!relayMinerToDelete) return;

    try {
      setIsDeletingRelayMiner(true);
      await DeleteRelayMiner(relayMinerToDelete.id);
      await fetchRelayMiners();
    } catch (error) {
      console.error("Failed to delete relayMiner:", error);
    } finally {
      setIsDeletingRelayMiner(false);
      setRelayMinerToDelete(null);
    }
  };

  useEffect(() => {
    fetchRelayMiners();
  }, []);

  return (
    <div className='flex flex-col gap-4'>
      {isAddingRelayMiner && (
        <AddOrUpdateRelayMinerDialog
          onClose={(shouldRefreshRelayMiners) => {
            setIsAddingRelayMiner(false);

            if (shouldRefreshRelayMiners) {
              fetchRelayMiners();
            }
          }}
        />
      )}

      {updateRelayMiner && (
        <AddOrUpdateRelayMinerDialog
          onClose={(shouldRefreshRelayMiners) => {
            setUpdateRelayMiner(null);

            if (shouldRefreshRelayMiners) {
              fetchRelayMiners();
            }
          }}
          relayMiner={updateRelayMiner}
        />
      )}
      <div className="py-2 max-h-[500px] min-h-[300px] overflow-y-scroll scrollbar-hidden">
        {content}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          disabled={isLoading}
          onClick={goBack}>
          Back
        </Button>
        <Button
          disabled={isLoading || (relayMiners.length === 0)}
          onClick={goNext}
          >
          Next
        </Button>
      </div>
      {relayMinerToDelete && (
        <ConfirmationDialog
          title="Delete RelayMiner"
          open={!!relayMinerToDelete}
          onClose={() => setRelayMinerToDelete(null)}
          footerActions={
            <>
              <Button
                variant="outline"
                onClick={() => setRelayMinerToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDeleteRelayMiner()}
                disabled={isLoading}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>
            Are you sure you want to delete the Relay Miner &quot;{relayMinerToDelete.name}&quot;?
            This action cannot be undone.
          </p>
        </ConfirmationDialog>
      )}
    </div>
  );
}
