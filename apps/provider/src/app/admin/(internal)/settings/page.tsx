'use client';

import React from 'react'
import {Button} from "@igniter/ui/components/button";
import {AddOrUpdateServiceDialog} from "@/components/AddOrUpdateServiceDialog";
import ServicesTable from "@/app/admin/(internal)/services/table";
import {useQueryClient} from "@tanstack/react-query";

export default function SettingsPage() {

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Settings</h1>
          <Button
            variant={"outline"}
          >
            Reload Parameters
          </Button>
        </div>
        <div className="container mx-auto ">
         Coming Soon
        </div>
      </div>
    </div>
  )
}
