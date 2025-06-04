"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm, useWatch} from "react-hook-form";
import { z } from "zod";
import { Button } from "@igniter/ui/components/button";
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@igniter/ui/components/form";
import { Input } from "@igniter/ui/components/input";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { UpsertApplicationSettings } from "@/actions/ApplicationSettings";
import {ApplicationSettings, ChainId} from "@/db/schema";
import urlJoin from "url-join";

interface FormProps {
  defaultValues: Partial<ApplicationSettings>;
  goNext: () => void;
}

const RpcUrlSchema = z.string().url("Please enter a valid URL").min(1, "URL is required");

export const FormSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  rpcUrl: RpcUrlSchema,
  appIdentity: z.string().min(1, "App Identity is Required"),
  minimumStake: z.coerce.number(),
});

type FormValues = z.infer<typeof FormSchema>;

const FormComponent: React.FC<FormProps> = ({ defaultValues, goNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBlockchainParams, setIsLoadingBlockchainParams] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rpcUrl: defaultValues?.rpcUrl || "",
      minimumStake: defaultValues?.minimumStake,
      chainId: defaultValues?.chainId,
      appIdentity: defaultValues?.appIdentity || "",
    },
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rpcUrl = useWatch({
    control: form.control,
    name: "rpcUrl",
  });

  const debouncedRetrieveParams = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (rpcUrl && rpcUrl.trim() !== '') {
        retrieveBlockchainParams();
      }
    }, 1000);
  }, [rpcUrl]);

  useEffect(() => {
    debouncedRetrieveParams();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [rpcUrl, debouncedRetrieveParams]);

  const isUpdate = useMemo(() => defaultValues?.id !== 0, [defaultValues]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleGoNext = () => {
    formRef.current?.requestSubmit();
  };

  const retrieveBlockchainParams = async () => {
    const url = form.getValues().rpcUrl;

    const validatedUrl = RpcUrlSchema.safeParse(url);

    if (!validatedUrl.success) {
      form.setError('rpcUrl', {
        type: 'manual',
        message: 'Please enter a valid URL',
      });
      return;
    }

    try {
      setIsLoadingBlockchainParams(true);

      const supplierParamsUrl = urlJoin(validatedUrl.data, "pokt-network/poktroll/supplier/params");
      const supplierParamsResponse = await fetch(supplierParamsUrl);

      if (!supplierParamsResponse.ok) {
        throw new Error("Failed to fetch supplier params");
      }

      const supplierParams = await supplierParamsResponse.json();
      const minStake = parseFloat(supplierParams.params.min_stake.amount) / 1e6;

      const nodeInfoUrl = urlJoin(validatedUrl.data, "cosmos/base/tendermint/v1beta1/node_info");
      const nodeInfoResponse = await fetch(nodeInfoUrl);

      if (!nodeInfoResponse.ok) {
        throw new Error("Failed to fetch node info");
      }

      const nodeInfo = await nodeInfoResponse.json();
      const network = nodeInfo.default_node_info.network;

      form.setValue('chainId', network);
      form.setValue('minimumStake', minStake);
    } catch (err) {
      const {message} = err as Error;
      console.error("Failed to fetch blockchain params", err);
      form.setError('rpcUrl', {
        type: 'manual',
        message,
      });
    } finally {
      setIsLoadingBlockchainParams(false);
    }
  }

  const submit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await UpsertApplicationSettings(values, isUpdate);
      goNext();
    } catch (error) {
      console.error("Something failed while updating the application settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between gap-4">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="appIdentity"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Identity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Your App Identity is the unique public identifier derived from your private key.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              name="rpcUrl"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shannon API Url</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoadingBlockchainParams}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="chainId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="minimumStake"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network Minimum Stake</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleGoNext}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default FormComponent;
