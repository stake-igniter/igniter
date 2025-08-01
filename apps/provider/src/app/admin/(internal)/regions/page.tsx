import type { Metadata } from 'next'
import React from 'react'
import RegionsTable from "./table";
import { GetAppName } from '@/actions/ApplicationSettings'
import AddNewRegion from '@/app/admin/(internal)/regions/AddNew'

export async function generateMetadata(): Promise<Metadata> {
    const appName = await GetAppName()

    return {
        title: `Regions - ${appName}`,
        description: "Light up your earnings with Igniter",
    }
}

export default function RegionsPage() {
    return (
        <div className="flex flex-col gap-10">

            <div className="mx-30 py-10">
                <div className={'flex flex-row items-center gap-4'}>
                    <h1>Regions</h1>
                    <AddNewRegion />
                </div>
                <div className="container mx-auto">
                    <RegionsTable />
                </div>
            </div>
        </div>
    )
}
