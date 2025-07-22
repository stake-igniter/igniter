"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { z } from "zod";
import { Button } from "@igniter/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@igniter/ui/components/form";
import { Input } from "@igniter/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@igniter/ui/components/dialog";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderIcon } from "@igniter/ui/assets";
import {
  CreateAddressGroup,
  UpdateAddressGroup,
} from "@/actions/AddressGroups";
import {
  AddressGroupWithDetails,
  Service,
} from "@/db/schema";
import { Combobox } from "./Combobox";
import { getEndpointInterpolatedUrl } from "@/lib/models/supplier";
import {Switch} from "@igniter/ui/components/switch";
import {Label} from "@igniter/ui/components/label";
import {useQuery} from "@tanstack/react-query";
import {ListServices} from "@/actions/Services";
import {ListRelayMiners} from "@/actions/RelayMiners";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@igniter/ui/components/select";

const poktAddressRegex = /^pokt[a-zA-Z0-9]{39,42}$/;

const RevShareItemSchema = z.object({
  address: z.union([
    z.string().regex(poktAddressRegex, "Must be a valid Cosmos address with 'pokt' prefix"),
    z.literal("{of}"),
  ]),
  share: z
    .number()
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
});

const RevShareArraySchema = z
  .array(RevShareItemSchema)
  .default([])
  .refine((arr) => {
    // a. Ensure all `address` values are unique
    const seen = new Set<string>();
    for (const item of arr) {
      if (seen.has(item.address)) {
        return false;
      }
      seen.add(item.address);
    }
    return true;
  }, {
    message: "Each address in revShare must be unique",
  });

const ServiceSchema = z.object({
  serviceId: z.string(),
  addSupplierShare: z.boolean().default(false),
  supplierShare: z.number().min(0).max(100).nullable(),
  revShare: RevShareArraySchema,
}).refine((ser) => {
  const totalRevShare = ser.revShare.reduce((sum, item) => sum + item.share, 0);
  return (totalRevShare + (ser.supplierShare ?? 0)) <= 100;
}, {
  message: "Total of revShare percentages must not exceed 100",
}).refine((ser) => {
  if (ser.addSupplierShare) {
    return ser.supplierShare !== null && ser.supplierShare > 0;
  }
  return true;
}, {
  message: 'If "Add Supplier Share" is enabled, share must be > 0',
});

export const CreateOrUpdateAddressGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required"),

  relayMinerId: z
      .coerce
      .number(),

  linkedAddresses: z
      .array(
          z
              .string()
              .regex(/^pokt[a-zA-Z0-9]{39,42}$/, "Must be a valid Cosmos address with 'pokt' prefix")
      )
      .default([])
      .refine((addresses) => {
        return new Set(addresses).size === addresses.length;
      }, {
        message: "Each linked address must be unique",
      }),


  private: z.boolean().default(false),

  services: z
    .array(ServiceSchema)
    .min(1, "You need to assign at least one service")
});

export interface AddOrUpdateAddressGroupProps {
  onClose?: (shouldRefreshAddressGroups: boolean) => void;
  addressGroup?: AddressGroupWithDetails;
}

export interface ServiceItemProps {
  service: Service;
  revShare: { address: string; share: number }[];
  addSupplierShare: boolean;
  supplierShare: number | null;
  rm: string;
  region: string;
  domain: string;
  onRemove: () => void;
  onRevShareChange: (newRevShare: { address: string; share: number }[]) => void;
  onAddSupplierShareChange: (newAddSupplierShare: boolean) => void;
  onSupplierShareChange: (newSupplierShare: number) => void;
}

type AddressGroupService = z.infer<typeof ServiceSchema>;

const ServiceItem = ({
                       service,
                       revShare,
                       rm,
                       region,
                       domain,
                       addSupplierShare,
                       supplierShare,
                       onRemove,
                       onRevShareChange,
                       onAddSupplierShareChange,
                       onSupplierShareChange,
                     }: Readonly<ServiceItemProps>) => {
  const handleChangeAddress = (idx: number, newAddress: string) => {
    const updated = revShare.map((item, i) =>
      i === idx ? { ...item, address: newAddress } : item
    );
    onRevShareChange?.(updated);
  };

  const handleChangePercent = (idx: number, newPct: number) => {
    const updated = revShare.map((item, i) =>
      i === idx ? { ...item, share: newPct } : item
    );
    onRevShareChange?.(updated);
  };

  const handleAddRevShare = () => {
    onRevShareChange?.([...revShare, { address: "", share: 1 }]);
  };

  const handleRemoveRevShare = (idx: number) => {
    const updated = revShare.filter((_, i) => i !== idx);
    onRevShareChange?.(updated);
  };

  return (
    <div
      key={service.serviceId}
      className="grid gap-2 p-3 border border-[var(--slate-dividers)] rounded-md"
    >
      <div className="flex justify-between px-1">
        <span className="text-sm font-medium">
          {service.name} ({service.serviceId})
        </span>
        <FormLabel
          className="text-[var(--color-slate-9)] hover:underline cursor-pointer"
          onClick={onRemove}
        >
          Remove
        </FormLabel>
      </div>

      {service.endpoints && service.endpoints.length > 0 && (
        <div className="space-y-2 mt-2">
          {service.endpoints.map((endpoint, index) => (
            <div key={index} className="text-sm pl-2">
              {getEndpointInterpolatedUrl(endpoint, {
                sid: service.serviceId,
                rm,
                region,
                domain,
              })}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t pt-2">
        <div className="flex justify-between px-1">
          <span className="text-sm font-medium">
            Revenue Shares
          </span>
          <FormLabel
            className="text-[var(--color-slate-9)] hover:underline cursor-pointer"
            onClick={handleAddRevShare}
          >
            Add Share
          </FormLabel>
        </div>
        <div className="grid grid-cols-24 items-center gap-2 mt-2">
          <div className="col-span-18">
            <span className="flex items-center gap-2">
              <Switch
                checked={addSupplierShare}
                onCheckedChange={onAddSupplierShareChange}
                className="border-[var(--slate-dividers)]"
              />
              <Label>Add Supplier Share</Label>
            </span>
          </div>
          <span className="col-span-4">
            <Input
              type="number"
              min={1}
              max={100}
              value={supplierShare ?? ''}
              disabled={!addSupplierShare}
              onChange={(e) =>
                onSupplierShareChange(Number(e.target.value))
              }
              placeholder="%"
            />
          </span>
          <span className="col-span-2">

          </span>
        </div>
        <div className="grid grid-cols-24 items-center gap-2 mt-2"></div>
        {revShare.map((item, idx) => (
          <div key={idx} className="grid grid-cols-24 items-center gap-2 mt-2">
            <Input
              className="col-span-18"
              value={item.address}
              onChange={(e) => handleChangeAddress(idx, e.target.value)}
              placeholder="pokt…"
            />
            <Input
              className="col-span-4"
              type="number"
              min={1}
              max={100}
              value={item.share ?? ''}
              onChange={(e) =>
                handleChangePercent(idx, Number(e.target.value))
              }
              placeholder="%"
            />

            <Button
              className="col-span-2"
              onClick={() => handleRemoveRevShare(idx)}
              size="sm"
            >
              x
            </Button>
          </div>

        ))}
      </div>
    </div>
  );
};

export function AddOrUpdateAddressGroupDialog({
                                                onClose,
                                                addressGroup,
                                              }: Readonly<AddOrUpdateAddressGroupProps>) {
  const {data: services, isLoading: isLoadingServices} = useQuery({
    queryKey: ['services'],
    queryFn: ListServices,
    refetchInterval: 60000,
    initialData: []
  });

  const {data: relayMiners, isLoading: isLoadingRelayMiners} = useQuery({
    queryKey: ['relay-miners'],
    queryFn: ListRelayMiners,
    refetchInterval: 60000,
    initialData: []
  });

  const [isCancelling, setIsCanceling] = useState(false);
  const [isCreatingAddressGroup, setIsCreatingAddressGroup] = useState(false);
  const [isUpdatingAddressGroup, setIsUpdatingAddressGroup] = useState(false);

  const isLoading = useMemo(() => isLoadingServices || isLoadingRelayMiners, [isLoadingServices, isLoadingRelayMiners]);

  const [assignedServices, setAssignedServices] = useState<string[]>([]);

  const form = useForm<z.infer<typeof CreateOrUpdateAddressGroupSchema>>({
    resolver: zodResolver(CreateOrUpdateAddressGroupSchema),
    defaultValues: {
      name: addressGroup?.name ?? "",
      linkedAddresses: addressGroup?.linkedAddresses ?? [],
      private: addressGroup?.private ?? false,
      relayMinerId: addressGroup?.relayMinerId,
      services:
        addressGroup?.addressGroupServices.map((as) => ({
          serviceId: as.serviceId,
          addSupplierShare: as.addSupplierShare ?? false,
          supplierShare: as.supplierShare ?? null,
          revShare: as.revShare ?? [],
        })) ?? [],
    },
  });

  const handleCancel = useCallback(() => {
    const formValues = form.getValues();
    const defaultValues = form.formState.defaultValues;
    const isDirty = JSON.stringify(formValues) !== JSON.stringify(defaultValues);

    if (isDirty) {
      setIsCanceling(true);
    } else {
      onClose?.(false);
    }
  }, [onClose, form]);

  const handleAddService = useCallback(
    (serviceId: string) => {
      const currentServices = form.getValues("services");
      if (!currentServices.some((s) => s.serviceId === serviceId)) {
        form.setValue("services", [
          ...currentServices,
          { serviceId, revShare: [], supplierShare: null, addSupplierShare: false },
        ]);
      }
    },
    [form]
  );

  const handleRemoveService = useCallback(
    (serviceId: string) => {
      const currentServices = form.getValues("services");
      form.setValue(
        "services",
        currentServices.filter((s) => s.serviceId !== serviceId)
      );
    },
    [form]
  );

  const servicesOnForm = form.watch(
    "services"
  ) as AddressGroupService[];

  useEffect(() => {
    setAssignedServices(servicesOnForm.map((entry) => entry.serviceId));
  }, [JSON.stringify(servicesOnForm)]);

  const selectableServices = useMemo(() => {
    return services
      .filter((service) => !assignedServices.includes(service.serviceId))
      .map((s) => ({ value: s.serviceId, label: s.name }));
  }, [assignedServices, services]);

  const name = form.watch("name");
  const relayMinerId = form.watch("relayMinerId");
  const linkedAddresses = form.watch("linkedAddresses");

  const selectedRelayMiner = useMemo(() => {
    return relayMiners.find((rm) => rm.id === Number(relayMinerId));
  }, [relayMinerId]);

  async function onSubmit({services, ...values}: z.infer<typeof CreateOrUpdateAddressGroupSchema>) {
    if (addressGroup) {
      setIsUpdatingAddressGroup(true);
      try {
        await UpdateAddressGroup(addressGroup.id, values, services);
        onClose?.(true);
      } catch (e) {
        console.error("Failed to update addressGroup", e);
      } finally {
        setIsUpdatingAddressGroup(false);
      }
    } else {
      setIsCreatingAddressGroup(true);
      try {
        await CreateAddressGroup(values, services);
        onClose?.(true);
      } catch (e) {
        console.error("Failed to create addressGroup", e);
      } finally {
        setIsCreatingAddressGroup(false);
      }
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="gap-0 p-0 rounded-lg bg-[var(--color-slate-2)] !w-[800px] !min-w-none !max-w-none h-[670px]"
        hideClose
      >
        <DialogTitle asChild>
          <div className="flex flex-row justify-between items-center py-4 px-4">
            <span className="text-[14px]">
              {addressGroup
                ? `Update AddressGroup: ${addressGroup.name}`
                : "Add New AddressGroup"}
            </span>
          </div>
        </DialogTitle>
        <div className="h-[1px] bg-[var(--slate-dividers)]" />

        {!isLoading && (
          <div className="px-4 py-3 min-h-[570px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-24 gap-1">
                  <div className="col-span-10 flex flex-col gap-4 px-2">
                    {/* Name */}
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                        name="relayMinerId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-2">
                              <FormLabel>Relay Miner</FormLabel>
                              <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={String(field.value ?? "")}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {relayMiners.map((rm) => (
                                        <SelectItem key={`${rm.identity}-${rm.regionId}`} value={rm.id.toString()}>{`${rm.name} (${rm.identity})`}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                              placeholder="Select"
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
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-[var(--slate-dividers)]"
                            />
                          </FormControl>
                          <FormLabel>Internal use only</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                        name="linkedAddresses"
                        control={form.control}
                        render={() => (
                            <FormItem className="flex flex-col gap-2">
                              <div className="flex justify-between">
                                <FormLabel>Linked Addresses</FormLabel>
                                <FormLabel
                                    className="text-[var(--color-slate-9)] hover:underline cursor-pointer"
                                    onClick={() => {
                                      const currentAddresses = form.getValues("linkedAddresses");
                                      form.setValue("linkedAddresses", [...currentAddresses, ""]);
                                    }}
                                >
                                  Add Address
                                </FormLabel>
                              </div>
                              <FormControl>
                                <div className="space-y-2">
                                  {linkedAddresses && linkedAddresses.map((address, index) => (
                                      <div key={index} className="grid grid-cols-24 items-center gap-2">
                                        <Input
                                            className="col-span-22"
                                            value={address}
                                            onChange={(e) => {
                                              const currentAddresses = [...form.getValues("linkedAddresses")];
                                              currentAddresses[index] = e.target.value;
                                              form.setValue("linkedAddresses", currentAddresses);
                                            }}
                                            placeholder="pokt..."
                                        />
                                        <Button
                                            className="col-span-2"
                                            onClick={() => {
                                              const currentAddresses = [...form.getValues("linkedAddresses")];
                                              currentAddresses.splice(index, 1);
                                              form.setValue("linkedAddresses", currentAddresses);
                                            }}
                                            size="sm"
                                        >
                                          x
                                        </Button>
                                      </div>
                                  ))}
                                  {linkedAddresses && linkedAddresses.length === 0 && (
                                      <div className="text-muted-foreground text-sm">
                                        No linked addresses added
                                      </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>

                  <div className="col-span-14 flex flex-col gap-4 px-2 !max-h-[550px] overflow-y-auto">
                    {servicesOnForm.length > 0 ? (
                      <div className="space-y-4">
                        {servicesOnForm.map(({ serviceId, addSupplierShare, supplierShare, revShare }) => {
                          const service = services.find(
                            (s) => s.serviceId === serviceId
                          );
                          if (!service) return null;
                          return (
                            <ServiceItem
                              key={serviceId}
                              service={service}
                              rm={selectedRelayMiner?.identity ?? ""}
                              region={selectedRelayMiner?.region?.urlValue ?? ""}
                              domain={selectedRelayMiner?.domain ?? ""}
                              revShare={revShare}
                              addSupplierShare={addSupplierShare}
                              supplierShare={supplierShare}
                              onRemove={() => handleRemoveService(serviceId)}
                              onAddSupplierShareChange={(
                                newAddSupplierShare: boolean
                              ) => {
                                const current = form.getValues(
                                  "services"
                                ) as AddressGroupService[];
                                form.setValue(
                                  "services",
                                  current.map((entry) =>
                                    entry.serviceId === serviceId
                                      ? {
                                        ...entry,
                                        supplierShare: newAddSupplierShare ? (entry.supplierShare ?? 1) : null,
                                        addSupplierShare: newAddSupplierShare,
                                      }
                                      : entry
                                  )
                                );
                              }}
                              onSupplierShareChange={(
                                newSupplierShare: number
                              ) => {
                                const current = form.getValues(
                                  "services"
                                ) as AddressGroupService[];
                                form.setValue(
                                  "services",
                                  current.map((entry) =>
                                    entry.serviceId === serviceId
                                      ? {
                                        ...entry,
                                        supplierShare: newSupplierShare,
                                      }
                                      : entry
                                  )
                                );
                              }}
                              onRevShareChange={(
                                newRevShareArray: { address: string; share: number }[]
                              ) => {
                                const current = form.getValues(
                                  "services"
                                ) as AddressGroupService[];
                                form.setValue(
                                  "services",
                                  current.map((entry) =>
                                    entry.serviceId === serviceId
                                      ? {
                                        ...entry,
                                        revShare: newRevShareArray,
                                      }
                                      : entry
                                  )
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm text-center">
                        No services assigned
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center">
            <LoaderIcon clasName="animate-spin" />
          </div>
        )}

        <div className="h-[1px] bg-[var(--slate-dividers)]" />
        <DialogFooter className="p-2 flex flex-row ">
          <Button variant="secondary" onClick={handleCancel}>
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
          <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-6 animate-in fade-in">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to cancel?
            </h3>
            <p className="mb-6 text-muted-foreground text-center">
              Your changes for this Address Group will be discarded.
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => onClose?.(false)}>
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
            <p className="mt-4">Adding "{name}"</p>
          </div>
        )}

        {isUpdatingAddressGroup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background animate-fade-in z-10">
            <LoaderIcon className="animate-spin" />
            <p className="mt-4">Updating "{name}"</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
