'use client';

import {useEffect, useMemo, useState} from "react";
import {RelayMiner} from "@/db/schema";
import {DeleteRelayMiner, ListRelayMiners} from "@/actions/RelayMiners";
import {Button} from "@igniter/ui/components/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import DataTable from "@igniter/ui/components/DataTable/index";
import {columns, getFilters} from "./columns";
import {AddOrUpdateRelayMinerDialog} from "@/components/AddOrUpdateRelayMinerDialog";
import {useQuery} from "@tanstack/react-query";

export default function RelayMinersTable() {
    const {data: relayMiners, refetch: fetchRelayMiners, isLoading: isLoadingRelayMiners} = useQuery({
        queryKey: ['relay-miners'],
        queryFn: ListRelayMiners,
        staleTime: Infinity,
        refetchInterval: 60000,
        initialData: []
    });

    const [isAddingRelayMiner, setIsAddingRelayMiner] = useState(false);
    const [isDeletingRelayMiner, setIsDeletingRelayMiner] = useState(false);
    const [updateRelayMiner, setUpdateRelayMiner] = useState<RelayMiner | null>(null);
    const [relayMinerToDelete, setRelayMinerToDelete] = useState<RelayMiner | null>(null);

    const isLoading = useMemo(() => {
        return isLoadingRelayMiners ||
            isDeletingRelayMiner;
    }, [isLoadingRelayMiners, isDeletingRelayMiner]);

    useEffect(() => {
        fetchRelayMiners();
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
                                onClick={() => setUpdateRelayMiner(row.original)}
                            >
                                Update
                            </Button>
                            <Button
                                disabled={isLoading}
                                className="bg-slate-2 border-0"
                                variant={"outline"}
                                onClick={() => setRelayMinerToDelete(row.original)}
                            >
                                Delete
                            </Button>
                        </div>
                    )
                }
            ]}
            data={relayMiners}
            filters={getFilters(relayMiners)}
            sorts={[]}
        />
    );

    const confirmDeleteRelayMiner = async () => {
        if (!relayMinerToDelete) return;

        try {
            setIsDeletingRelayMiner(true);
            await DeleteRelayMiner(relayMinerToDelete.id);
            await fetchRelayMiners();
        } catch (error) {
            console.error("Failed to delete relay miner:", error);
        } finally {
            setIsDeletingRelayMiner(false);
            setRelayMinerToDelete(null);
        }
    };

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
            {relayMinerToDelete && (
                <ConfirmationDialog
                    title="Delete Relay Miner"
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
