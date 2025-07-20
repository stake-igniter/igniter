'use client';

import React from 'react'
import { Button } from "@igniter/ui/components/button";
import { AddOrUpdateRegionDialog } from "@/components/AddOrUpdateRegionDialog";
import RegionsTable from "./table";
import { useQueryClient } from "@tanstack/react-query";

export default function RegionsPage() {
    const queryClient = useQueryClient();
    const [isAddingRegion, setIsAddingRegion] = React.useState(false);

    return (
        <div className="flex flex-col gap-10">
            {isAddingRegion && (
                <AddOrUpdateRegionDialog
                    onClose={(shouldRefreshRegions) => {
                        setIsAddingRegion(false);
                        if (shouldRefreshRegions) {
                            queryClient.invalidateQueries({queryKey: ['regions']});
                        }
                    }}
                />
            )}
            <div className="mx-30 py-10">
                <div className={'flex flex-row items-center gap-4'}>
                    <h1>Regions</h1>
                    <Button
                        variant={"outline"}
                        onClick={() => setIsAddingRegion(true)}
                    >
                        Add New
                    </Button>
                </div>
                <div className="container mx-auto">
                    <RegionsTable />
                </div>
            </div>
        </div>
    )
}
