'use client';

import {useEffect} from "react";
import DataTable from "@igniter/ui/components/DataTable/index";
import {columns, filters, sorts} from "./columns";
import {
  ListDelegators,
} from "@/actions/Delegators";
import {useQuery} from "@tanstack/react-query";

export default function DelegatorsTable() {
  const {data: delegators, refetch: fetchDelegators} = useQuery({
    queryKey: ['delegators'],
    queryFn: ListDelegators,
    staleTime: Infinity,
    refetchInterval: 60000,
    initialData: []
  });

  useEffect(() => {
    // TODO: Error handle
    fetchDelegators();
  }, []);

  const content = (
    <DataTable
      columns={columns}
      data={delegators}
      filters={filters}
      sorts={sorts}
    />
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className="py-2 max-h-[500px] min-h-[300px] overflow-y-scroll scrollbar-hidden">
        {content}
      </div>
    </div>
  );
}
