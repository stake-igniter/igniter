'use client';

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useQuery } from "@tanstack/react-query";
import {
  getApplicationSettings,
  RetrieveBlockchainSettings,
  upsertSettings,
  ValidateBlockchainRPC
} from "@/actions/ApplicationSettings";
import { LoaderIcon } from "@igniter/ui/assets";
import {ChainId} from "@/db/schema";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email("Invalid email format").optional(),
  ownerEmail: z.string().email("Invalid email format").optional(),
  rpcUrl: z.string().optional().superRefine(async (url, ctx) => {
    if (!url) {
      return; // Skip validation if empty
    }

    try {
      const response = await ValidateBlockchainRPC(url);

      if (!response.success && response.errors && response.errors.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: response.errors[0],
        });
        return false;
      }
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Failed to validate RPC URL",
      });
      return false;
    }
  }),
  chainId: z.string().optional(),
  minimumStake: z.number().optional(),
  appIdentity: z.string().optional(),
  updatedAtHeight: z.string().optional(),
  fee: z.coerce
    .number()
    .min(1, "Service fee must be greater than 0")
    .max(100),
  delegatorRewardsAddress: z.string().refine(
    (value) => value.toLowerCase().startsWith('pokt') && value.length === 43,
    (val) => ({ message: `${val} is not a valid address` })
  ),
});

type FormValues = z.infer<typeof FormSchema>;

export default function SettingsPage() {
  const [isReloadingBlockchainSettings, setIsReloadingBlockchainSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: settings,
    refetch: refetchSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getApplicationSettings,
    refetchInterval: 60000,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: settings?.name || "",
      supportEmail: settings?.supportEmail || "",
      ownerEmail: settings?.ownerEmail || "",
      rpcUrl: settings?.rpcUrl || "",
      chainId: settings?.chainId || "",
      minimumStake: settings?.minimumStake,
      appIdentity: settings?.appIdentity || "",
      updatedAtHeight: settings?.updatedAtHeight || "",
    },
    values: settings ? {
      name: settings.name || "",
      supportEmail: settings.supportEmail || "",
      ownerEmail: settings.ownerEmail || "",
      rpcUrl: settings.rpcUrl || "",
      chainId: settings.chainId || "",
      minimumStake: settings.minimumStake,
      appIdentity: settings.appIdentity || "",
      updatedAtHeight: settings.updatedAtHeight || "",
      delegatorRewardsAddress: settings.delegatorRewardsAddress || "",
      fee: Number(settings.fee || '1'),
    } : undefined,
  });

  const isDirty = form.formState.isDirty;

  const reloadBlockchainSettings = async () => {
    try {
      setIsReloadingBlockchainSettings(true);
      const url = form.getValues().rpcUrl;
      const updatedAtHeight = form.getValues().updatedAtHeight;
      if (!url || !updatedAtHeight) {
        throw new Error("Invalid RPC URL or Updated At Height");
      }

      const response = await RetrieveBlockchainSettings(url, updatedAtHeight);

      if (!response.success) {
        throw new Error("Failed to retrieve blockchain settings");
      }

      form.setValue('minimumStake', response.minStake);
      form.setValue('updatedAtHeight', response.height);
      await form.handleSubmit(onSubmit)();
    } catch (error) {
      // TODO: show a transient error
      console.error("Failed to reload blockchain settings:", error);
    } finally {
      setIsReloadingBlockchainSettings(false);
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { chainId, ...settings} = values;
      await upsertSettings({
        ...settings,
        chainId: chainId as ChainId,
      }, true);
      await refetchSettings();
      form.reset(values);
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">
        <div className={'flex flex-row items-center gap-4'}>
          <h1>Settings</h1>
        </div>

        <div className="container mx-auto">
          {isLoadingSettings || !settings ? (
            <div className="flex justify-center items-center h-fit">
              <LoaderIcon className="animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Fee</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input {...field} type="number" className="flex-grow" />
                            <span className="ml-2">%</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="delegatorRewardsAddress"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delegator rewards address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 rounded-md bg-[var(--color-slate-2)]">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="rpcUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--color-white-2)]">RPC URL</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-[var(--color-slate-3)]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-4 space-y-3 flex justify-between">
                      <span className="font-medium text-[var(--color-white-3)]">Blockchain Derived Settings</span>
                      {!isReloadingBlockchainSettings && (
                        <Button
                          className={'bg-slate-2'}
                          variant="outline"
                          type={'button'}
                          disabled={isSubmitting || form.formState.dirtyFields.rpcUrl}
                          onClick={reloadBlockchainSettings}
                        >
                          Reload
                        </Button>
                      )}
                      {isReloadingBlockchainSettings && (
                        <LoaderIcon className="animate-spin" />
                      )}
                    </div>
                    <div className="mt-2 space-y-3">
                      <FormField
                        control={form.control}
                        name="chainId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--color-white-2)]">Chain ID</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-[var(--color-slate-3)] pointer-events-none" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minimumStake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--color-white-2)]">Minimum Stake</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-[var(--color-slate-3)] pointer-events-none" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="appIdentity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--color-white-2)]">App Identity</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-[var(--color-slate-3)] pointer-events-none" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="updatedAtHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[var(--color-white-2)]">Updated At Height</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-[var(--color-slate-3)] pointer-events-none" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? <LoaderIcon className="animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
