import type { Metadata } from 'next'
import React from 'react'
import RelayMinersTable from "./table";
import { GetAppName } from '@/actions/ApplicationSettings'
import AddNewRelayMiner from '@/app/admin/(internal)/miners/AddNew'

export async function generateMetadata(): Promise<Metadata> {
    const appName = await GetAppName()

    return {
        title: `Relay Miners - ${appName}`,
        description: "Light up your earnings with Igniter",
    }
}

export default function RelayMinersPage() {
    return (
        <div className="flex flex-col gap-10">

            <div className="mx-30 py-10">
                <div className={'flex flex-row items-center gap-4'}>
                    <h1>Relay Miners</h1>
                    <AddNewRelayMiner />
                </div>
                <div className="container mx-auto ">
                    <RelayMinersTable />
                </div>
            </div>
        </div>
    )
}
