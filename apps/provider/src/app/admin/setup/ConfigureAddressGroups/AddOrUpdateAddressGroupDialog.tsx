"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@igniter/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@igniter/ui/components/form";
import {Input} from "@igniter/ui/components/input";
import {Dialog, DialogContent, DialogFooter, DialogTitle,} from "@igniter/ui/components/dialog";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {LoaderIcon} from "@igniter/ui/assets";
import {CreateAddressGroup, UpdateAddressGroup} from "@/actions/AddressGroups";
import {AddressGroup, Service} from "@/db/schema";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@igniter/ui/components/select";
import {Combobox} from "@/app/admin/setup/ConfigureAddressGroups/Combobox";
import {getEndpointInterpolatedUrl} from "@/lib/models/supplier";
import {Checkbox} from "@igniter/ui/components/checkbox";

const CreateOrUpdateAddressGroupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Name must be a valid slug (lowercase letters, numbers, and hyphens only, cannot start or end with a hyphen)"),

  region: z.string()
    .min(1, "Region is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Region must be a valid slug (lowercase letters, numbers, and hyphens only, cannot start or end with a hyphen)"),

  clients: z.array(
    z.string()
      .regex(/^pokt[a-zA-Z0-9]{39,42}$/, "Must be a valid Cosmos address with 'pokt' prefix")
  ).default([]),

  private: z.boolean().default(false),

  domain: z.string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)+.*)$/,
      "Invalid domain format. Ensure it's a valid domain name."
    ).optional().default(''),

  services: z.array(
    z.string()
  ).min(1, "You need to assign at least one service").max(8, "You can only assign up to 8 services"),
});

export interface AddOrUpdateAddressGroupProps {
  onClose: (shouldRefreshAddressGroups: boolean) => void;
  addressGroup?: AddressGroup;
  services: Service[];
}

const ServiceItem = ({ service, onRemove, ag, region, domain }: { service: Service, onRemove: () => void, ag: string, region: string, domain: string }) => {
  return (
    <div key={service.serviceId} className="grid gap-2 p-3 border border-[var(--slate-dividers)] rounded-md">
      <div className="flex justify-between px-1">
        <span className="text-sm font-medium">{service.name} ({service.serviceId})</span>
        <FormLabel
          className={`text-[var(--color-slate-9)] hover:underline cursor-pointer`}
          onClick={onRemove}
        >
          Remove
        </FormLabel>
      </div>
      {service.endpoints && service.endpoints.length > 0 && (
        <div className="space-y-2 mt-2">
          {service.endpoints.map((endpoint, index) => (
            <div key={index} className="text-sm pl-2">
              {getEndpointInterpolatedUrl(endpoint, { sid: service.serviceId, ag, region, domain })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export function AddOrUpdateAddressGroupDialog({
                                             onClose,
                                             addressGroup,
                                             services,
                                           }: Readonly<AddOrUpdateAddressGroupProps>) {
  const [isCancelling, setIsCanceling] = useState(false);
  const [isCreatingAddressGroup, setIsCreatingAddressGroup] = useState(false);
  const [isUpdatingAddressGroup, setIsUpdatingAddressGroup] = useState(false);
  const [assignedServices, setAssignedServices] = useState<string[]>([]);

  const form = useForm<z.infer<typeof CreateOrUpdateAddressGroupSchema>>({
    resolver: zodResolver(CreateOrUpdateAddressGroupSchema),
    defaultValues: {
      name: addressGroup?.name ?? '',
      region: addressGroup?.region ?? '',
      domain: addressGroup?.domain ?? '',
      clients: addressGroup?.clients ?? [],
      services: addressGroup?.services ?? [],
      private: addressGroup?.private ?? false,
    },
  });

  const handleCancel = useCallback(() => {
    // TODO: Identify why react-hook-form isDirty is not being updated properly
    const formValues = form.getValues();
    const defaultValues = form.formState.defaultValues;
    const isDirty = JSON.stringify(formValues) !== JSON.stringify(defaultValues);

    if (isDirty) {
      setIsCanceling(true);
    } else {
      onClose(false);
    }
  }, [setIsCanceling, onClose, form]);

  const handleAddService = useCallback((serviceId: string) => {
    const currentServices = form.getValues('services');
    if (!currentServices.includes(serviceId)) {
      form.setValue('services', [...currentServices, serviceId]);
    }
  }, [form]);

  const handleRemoveService = useCallback((serviceId: string) => {
    const currentServices = form.getValues('services');
    if (currentServices.includes(serviceId)) {
      form.setValue('services', currentServices.filter((sid) => sid !== serviceId));
    }
  }, [form]);

  const servicesOnForm = form.watch('services');

  useEffect(() => {
    setAssignedServices(servicesOnForm);
  }, [JSON.stringify(servicesOnForm)]);

  const selectableServices = useMemo(() => {
    return services
        .filter(service => !servicesOnForm.includes(service.serviceId))
        .map((s) => ({ value: s.serviceId, label: s.name }))
  }, [assignedServices]);

  const name = form.watch('name');
  const region = form.watch('region');
  const domain = form.watch('domain');

  async function onSubmit(values: z.infer<typeof CreateOrUpdateAddressGroupSchema>) {
    if (addressGroup) {
      setIsUpdatingAddressGroup(true);
      try {
        await UpdateAddressGroup(addressGroup.id, values);
        onClose(true);
      } catch (e) {
        console.error("Failed to update addressGroup", e);
      } finally {
        setIsUpdatingAddressGroup(false);
      }
    } else {
      setIsCreatingAddressGroup(true);
      try {
        await CreateAddressGroup(values);
        onClose(true);
      } catch (e) {
        console.error("Failed to create addressGroup", e);
      } finally {
        setIsCreatingAddressGroup(false);
      }
    }
  }

  return (
    <Dialog
      open={true}
    >
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className={`gap-0 p-0 rounded-lg bg-[var(--color-slate-2)] !w-[800px] !min-w-none !max-w-none h-[550px]`}
        hideClose
      >
        <DialogTitle asChild>
          <div className="flex flex-row justify-between items-center py-4 px-4">
            <span className="text-[14px]">
              {addressGroup ? `Update AddressGroup: ${addressGroup.name}` : "Add New AddressGroup"}
            </span>
          </div>
        </DialogTitle>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>

        <div className="px-4 py-3 min-h-[384px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-24 gap-1">
                <div className={`col-span-10 flex flex-col gap-4 px-2`}>
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="region"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us-east">US East</SelectItem>
                              <SelectItem value="us-west">US West</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="latam">Latin America</SelectItem>
                              <SelectItem value="europe-west">Europe West</SelectItem>
                              <SelectItem value="europe-north">Europe North</SelectItem>
                              <SelectItem value="middle-east">Middle East</SelectItem>
                              <SelectItem value="africa-south">Africa South</SelectItem>
                              <SelectItem value="asia-east">Asia East</SelectItem>
                              <SelectItem value="asia-southeast">Asia Southeast</SelectItem>
                              <SelectItem value="asia-south">Asia South</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="domain"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Domain</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="services"
                    control={form.control}
                    render={() => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Assign services</FormLabel>
                        <FormControl>
                          <Combobox
                            items={selectableServices}
                            placeholder="Select service"
                            searchPlaceholder="Search services"
                            emptyMessage="No services found"
                            onSelect={handleAddService}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="private"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                        <FormLabel>Mark for internal use</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-[var(--slate-dividers)]"

                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-14 flex flex-col gap-4 px-2 !max-h-[350px] overflow-y-auto">
                  {servicesOnForm.length > 0 ? (
                    <div className="space-y-4">
                      {servicesOnForm.map((serviceId) => {
                        const service = services.find(s => s.serviceId === serviceId);
                        if (!service) return null;
                        return (
                          <ServiceItem
                            key={serviceId}
                            service={service}
                            ag={name}
                            region={region}
                            domain={domain}
                            onRemove={() => handleRemoveService(serviceId)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm text-center">No services assigned</div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <DialogFooter className="p-2 flex flex-row ">
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isCreatingAddressGroup || isUpdatingAddressGroup}
          >
            {addressGroup ? "Update Address Group" : "Add Address Group"}
          </Button>
        </DialogFooter>
        {isCancelling && (
          <div
            className="absolute inset-0 bg-background flex flex-col items-center justify-center p-6 animate-in fade-in"
          >
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to cancel?
            </h3>
            <p className="mb-6 text-muted-foreground text-center">
              Your changes for this Address Group will be discarded.
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => onClose(false)}>
                Discard
              </Button>
              <Button variant="outline" onClick={() => setIsCanceling(false)}>
                Continue Editing
              </Button>
            </div>
          </div>
        )}
        {isCreatingAddressGroup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background animate-fade-in z-10">
            <LoaderIcon className="animate-spin" />
            <p className="mt-4">Adding &#34;{name}&#34;</p>
          </div>
        )}
        {isUpdatingAddressGroup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background animate-fade-in z-10">
            <LoaderIcon className="animate-spin" />
            <p className="mt-4">Updating &#34;{name}&#34;</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
