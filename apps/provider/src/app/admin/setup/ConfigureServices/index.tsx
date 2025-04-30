'use client';

import {Service} from "@/db/schema";
import {DataTable} from "@/app/admin/setup/ConfigureServices/DataTable";
import {columns} from "@/app/admin/setup/ConfigureServices/Columns";
import {Button} from "@igniter/ui/components/button";
import {AddServiceDialog} from "@/app/admin/setup/ConfigureServices/AddServiceDialog";
import {useEffect, useState} from "react";
import {DeleteService, ListServices} from "@/actions/Services";

export interface ConfigureServicesProp {
  goNext: () => void;
  goBack: () => void;
}

export default function ConfigureServices({ goNext, goBack }: Readonly<ConfigureServicesProp>) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const content = services.length > 0
    ? (
        <DataTable
          columns={columns}
          data={services}
          addServiceAction={
            <Button
              onClick={() => setIsAddingService(true) }
            >
              Add service
            </Button>
          }
          deleteServiceAction={(service) => (
            <Button
              disabled={isLoading}
              variant="destructive"
              onClick={() => deleteService(service) }
            >
              Delete
            </Button>

          )}
        />
      )
    : (
        <div className="flex justify-center items-center w-full h-full">
          <Button
            onClick={() => setIsAddingService(true) }
            >
            Add your first service
          </Button>
        </div>
      );

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

  const deleteService = async (service: Service) => {
    try {
      setIsLoading(true);
      await DeleteService(service.serviceId);
      await fetchServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className='flex flex-col gap-4'>
      {isAddingService && (
        <AddServiceDialog
          onClose={(shouldRefreshServices) => {
            setIsAddingService(false);

            if (shouldRefreshServices) {
              fetchServices();
            }
          }}
        />
      )}
      <div className="py-2 max-h-[500px] overflow-y-scroll">
        {content}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          disabled={isLoading}
          onClick={goBack}>
          Back
        </Button>
        <Button
          disabled={isLoading || (services.length === 0)}
          onClick={goNext}
          >
          Next
        </Button>
      </div>
    </div>
  );
}
