'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import {AddOrUpdateRelayMinerDialog} from "@/components/AddOrUpdateRelayMinerDialog";
import RelayMinersTable from "./table";
import {useQueryClient} from "@tanstack/react-query";

export default function RelayMinersPage() {
    const queryClient = useQueryClient();

    const [isAddingMiner, setIsAddingMiner] = React.useState(false);
    return (
        <div className="flex flex-col gap-10">
            {isAddingMiner && (
                <AddOrUpdateRelayMinerDialog
                    onClose={(shouldRefreshRelayMiners) => {
                        setIsAddingMiner(false);
                        if (shouldRefreshRelayMiners) {
                            queryClient.invalidateQueries({queryKey: ['relay-miners']});
                        }
                    }}
                />
            )}
            <div className="mx-30 py-10">
                <div className={'flex flex-row items-center gap-4'}>
                    <h1>Relay Miners</h1>
                    <Button
                        variant={"outline"}
                        onClick={() => setIsAddingMiner(true) }
                    >
                        Add New
                    </Button>
                </div>
                <div className="container mx-auto ">
                    <RelayMinersTable />
                </div>
            </div>
        </div>
    )
}
