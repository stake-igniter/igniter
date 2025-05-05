"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@igniter/ui/components/button";
import {getShortAddress} from "@igniter/ui/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@igniter/ui/components/form";
import {Input} from "@igniter/ui/components/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@igniter/ui/components/select";
import {Dialog, DialogContent, DialogFooter, DialogTitle,} from "@igniter/ui/components/dialog";
import {
  getDefaultUrlWithSchemeByRpcType,
  getEndpointInterpolatedUrl, getUrlTokenFromRpcType,
  PROTOCOL_DEFAULT_TYPE,
  RPCType
} from "@/lib/models/supplier";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {InfoIcon, LoaderIcon} from "@igniter/ui/assets";
import urlJoin from "url-join";
import {CreateService, UpdateService} from "@/actions/Services";
import {ApplicationSettings, Service} from "@/db/schema";
import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {Region} from "@/lib/models/commons";

interface ServiceOnChain {
  serviceId: string;
  name: string;
  ownerAddress: string;
  computeUnits: number;
}

const endpointSchema = z.object({
  url: z.string(),
  rpcType: z.nativeEnum(RPCType).default(PROTOCOL_DEFAULT_TYPE),
}).transform(data => ({
  ...data,
  url: data.url || getDefaultUrlWithSchemeByRpcType(data.rpcType)
}));

const CreateServiceFormSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  revSharePercentage: z.coerce.number().min(0).max(100).nullable(),
  // TODO: refine to prevent duplicate rpc types
  endpoints: z.array(endpointSchema).min(1, "At least one endpoint is required"),
});

export interface AddServiceDialogProps {
  onClose: (shouldRefreshServices: boolean) => void;
  service?: Pick<Service, 'serviceId' | 'name' | 'endpoints' | 'revSharePercentage'>;
}

interface ServiceResponse {
  service: {
    id: string;
    name: string;
    compute_units_per_relay: string;
    owner_address: string;
  }
}

export function AddOrUpdateServiceDialog({
                                             onClose,
                                             service,
                                           }: Readonly<AddServiceDialogProps>) {
  const [endpoints, setEndpoints] = useState<{ url: string; rpcType: RPCType }[]>(
    service?.endpoints ?? [{ url: "", rpcType: PROTOCOL_DEFAULT_TYPE }]
  );

  const [serviceOnChain, setServiceOnChain] = useState<ServiceOnChain | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(false);
  const serviceIdInputRef = useRef<HTMLInputElement>(null);
  const [hasLoadServiceError, setHasLoadServiceError] = useState(false);
  const [isCancelling, setIsCanceling] = useState(false);
  const [patternHelp, setPatternHelp] = useState<{ input: string; result: string, ag: string, region: Region } | undefined>();
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [settings, setSettings] = useState<ApplicationSettings>();

  useEffect(() => {
    (async () => {
      const settings = await getApplicationSettings();
      setSettings(settings);
    })();
  }, []);

  const SERVICE_BY_ID_URL = useMemo(() => {
    if (settings?.rpcUrl) {
      return urlJoin(settings?.rpcUrl, '/pokt-network/poktroll/service/service/{service-id}');
    }

    return '';
  }, [settings?.rpcUrl]);

  const handleCancel = useCallback(() => {
    if (serviceOnChain) {
      setIsCanceling(true);
    } else {
      onClose(false);
    }
  }, [serviceOnChain, setIsCanceling, onClose]);

  const form = useForm<z.infer<typeof CreateServiceFormSchema>>({
    resolver: zodResolver(CreateServiceFormSchema),
    defaultValues: {
      serviceId: service?.serviceId || "",
      revSharePercentage: service?.revSharePercentage || null,
      endpoints: service?.endpoints ?? [{ url: "", rpcType: PROTOCOL_DEFAULT_TYPE }],
    },
  });

  const serviceId = form.watch('serviceId');

  useEffect(() => {
    // TODO: change to use react-query
    const fetchServiceData = async () => {
      if (SERVICE_BY_ID_URL && serviceId && serviceId.length > 0) {
        setIsLoadingService(true);
        try {
          const url = SERVICE_BY_ID_URL.replace('{service-id}', serviceId.toLowerCase().trim());
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json() as ServiceResponse;

            setServiceOnChain({
              serviceId: data.service.id,
              name: data.service.name,
              ownerAddress: data.service.owner_address,
              computeUnits: parseInt(data.service.compute_units_per_relay, 10)
            });
            setHasLoadServiceError(false);
          } else {
            setServiceOnChain(null);
            setHasLoadServiceError(false);
          }
        } catch (error) {
          console.error('Error fetching service:', error);
          setServiceOnChain(null);
          setHasLoadServiceError(true);
        } finally {
          setIsLoadingService(false);
          focusServiceIdInput();
        }
      } else {
        setServiceOnChain(null);
      }
    };

    const focusServiceIdInput = () => {
      requestAnimationFrame(() => {
        serviceIdInputRef.current?.focus();
      });
    };


    const debounceTimer = setTimeout(() => {
      fetchServiceData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [serviceId, SERVICE_BY_ID_URL]);

  const endpointsOnForm = form.watch('endpoints');

  useEffect(() => {
    setEndpoints([...endpointsOnForm]);
  }, [JSON.stringify(endpointsOnForm)]);

  const addEndpoint = () => {
    form.setValue("endpoints", [...endpoints, { url: "", rpcType: PROTOCOL_DEFAULT_TYPE }]);
  };

  const removeEndpoint = (index: number) => {
    if (endpoints.length > 1) {
      const newEndpoints = [...endpoints];
      newEndpoints.splice(index, 1);
      form.setValue("endpoints", newEndpoints);
    }
  };

  async function onSubmit(values: z.infer<typeof CreateServiceFormSchema>) {
    if (service) {
      setIsUpdatingService(true);
      try {
        await UpdateService(service.serviceId, {
          revSharePercentage: values.revSharePercentage,
          endpoints: values.endpoints.slice(),
        });
        onClose(true);
      } catch (e) {
        console.error("Failed to update service", e);
      } finally {
        setIsUpdatingService(false);
      }
    } else {
      setIsCreatingService(true);
      try {
        await CreateService({
          serviceId: values.serviceId,
          name: serviceOnChain?.name ?? 'Unknown Service',
          ownerAddress: serviceOnChain?.ownerAddress ?? '',
          computeUnits: serviceOnChain?.computeUnits ?? 1,
          revSharePercentage: values.revSharePercentage,
          endpoints: values.endpoints.slice(),
        });
        onClose(true);
      } catch (e) {
        console.error("Failed to create service", e);
      } finally {
        setIsCreatingService(false);
      }
    }
  }

  return (
    <Dialog
      open={true}
    >
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className={`gap-0 p-0 rounded-lg bg-[var(--color-slate-2)] ${serviceOnChain ? '!w-[900px]' : '!w-[350px]'} !min-w-none !max-w-none h-[550px]`}
        hideClose
      >
        <DialogTitle asChild>
          <div className="flex flex-row justify-between items-center py-4 px-4">
            <span className="text-[14px]">
              {service ? `Update Service: ${service.name}` : "Add New Service"}
            </span>
          </div>
        </DialogTitle>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>

        <div className="px-4 py-3 min-h-[384px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

              <div className="grid grid-cols-24 gap-1">
                <div className={`${serviceOnChain ? 'col-span-10' : 'col-span-24'} flex flex-col gap-4 px-2`}>
                  <FormField
                    name="serviceId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Service ID</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoadingService || !!service}
                            {...field}
                            ref={(e) => {
                              field.ref(e);
                              serviceIdInputRef.current = e;
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!serviceOnChain && !hasLoadServiceError && (
                    <div className="flex justify-center items-center bg-[var(--color-slate-3)] p-3 rounded-md">
                      Specify the service on-chain ID before you can continue
                    </div>
                  )}

                  {!serviceOnChain && hasLoadServiceError && (
                    <div className="flex justify-center items-center bg-[var(--color-slate-3)] p-3 rounded-md">
                      There was an error loading the service. Does it exist?
                    </div>
                  )}

                  {serviceOnChain && (
                    <>
                      <div className="bg-[var(--color-slate-3)] p-3 rounded-md">
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="text-[var(--color-slate-9)]">Name:</span>{" "}
                            <span>{serviceOnChain.name}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-slate-9)]">Owner:</span>{" "}
                            <span>{getShortAddress(serviceOnChain.ownerAddress)}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-slate-9)]">Compute Units:</span>{" "}
                            <span>{serviceOnChain.computeUnits}</span>
                          </div>
                        </div>
                      </div>
                      <FormField
                        name="revSharePercentage"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2">
                            <FormLabel>Revenue Share Percentage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={settings?.fee ?? ''}
                                min={0}
                                max={100}
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                              The RevShare exclusively charged for this service. Defaults to the service fee.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {serviceOnChain && (
                  <div className="col-span-14 flex flex-col gap-4 px-2 max-h-[384px] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-end items-center px-1">
                        <FormLabel
                          className="text-[var(--color-slate-9)] cursor-pointer hover:underline"
                          onClick={addEndpoint}
                        >
                          Add Protocol
                        </FormLabel>
                      </div>

                      {endpoints.map((_, index) => (
                        <div key={index} className="grid gap-2 p-3 border border-[var(--slate-dividers)] rounded-md">
                          <div className="flex justify-end px-1">
                            <FormLabel
                              className={`text-[var(--color-slate-9)] ${endpoints.length > 1 && 'hover:underline cursor-pointer'} ${endpoints.length === 1 && 'opacity-50'}`}
                              onClick={() => removeEndpoint(index)}
                            >
                              Remove
                            </FormLabel>
                          </div>

                          <FormField
                            name={`endpoints.${index}.rpcType`}
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select RPC Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.values(RPCType).map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2 items-center">
                            <FormField
                              name={`endpoints.${index}.url`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem
                                  className="flex-grow"
                                  >
                                  <FormControl>
                                    <Input
                                      placeholder={getDefaultUrlWithSchemeByRpcType(form.getValues(`endpoints.${index}.rpcType`))}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <InfoIcon
                              className="cursor-pointer"
                              onClick={() => {
                                if (endpoints[index]) {
                                  setPatternHelp({
                                    input: endpoints[index].url || getDefaultUrlWithSchemeByRpcType(endpoints[index].rpcType),
                                    ag: 'rm-01', // Hard coded address group for help
                                    region: Region.AFRICA_SOUTH, // Hard coded region for help
                                    result: getEndpointInterpolatedUrl(endpoints[index], {
                                      ag: 'rm-01', // Hard coded address group for help
                                      region: Region.AFRICA_SOUTH, // Hard coded region for help
                                      sid: serviceId,
                                      domain: settings?.domain ?? 'example.com',
                                    })
                                  })
                                }
                              }}
                              />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            disabled={isCreatingService || isUpdatingService || !serviceOnChain}
          >
            {service ? "Update Service" : "Add Service"}
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
              Your changes for this service will be discarded.
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
        {patternHelp && (
          <div
            className="absolute inset-0 bg-background flex flex-col gap-6 p-6 animate-in fade-in"
          >
            <h3 className="text-lg font-medium">URL Pattern Variables</h3>

            <p className="text-sm text-muted-foreground">
              When new staking nodes are requested, we automatically build the URLs you’ll use to configure each service. The placeholders you can include in those URLs are:
            </p>

            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="font-medium">{`{ag}`}</div>
              <div className="text-sm">The name of the address group for which nodes are being requested</div>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="font-medium">{`{region}`}</div>
              <div className="text-sm">The region assigned to the address group</div>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="font-medium">{`{sid}`}</div>
              <div className="text-sm">The on-chain ID of this service instance</div>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="font-medium">{`{type}`}</div>
              <div className="text-sm">A URL-friendly label for the chosen RPC protocol</div>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
              <div className="font-medium">{`{domain}`}</div>
              <div className="text-sm">The domain configured at the application level or the address group level</div>
            </div>

            <div className="flex flex-col gap-2 text-sm bg-muted/50 p-2 rounded">
              <div className="flex items-center gap-2">
                <InfoIcon />
                <span>Assuming an Address Group named "{patternHelp.ag}" configured on the "{patternHelp.region}" region</span>
              </div>
              <span className="px-5.5">For Url: {patternHelp.input}</span>
              <span className="px-5.5">We'll produce: {patternHelp.result}</span>
            </div>

            <div className="flex flex-row-reverse w-full gap-4">
              <Button variant="secondary" onClick={() => setPatternHelp(undefined)}>
                Close
              </Button>
            </div>
          </div>
        )}
        {isCreatingService && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background animate-fade-in z-10">
            <LoaderIcon className="animate-spin" />
            <p className="mt-4">Adding &#34;{serviceOnChain?.name}&#34;</p>
          </div>
        )}
        {isUpdatingService && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background animate-fade-in z-10">
            <LoaderIcon className="animate-spin" />
            <p className="mt-4">Updating &#34;{serviceOnChain?.name}&#34;</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
