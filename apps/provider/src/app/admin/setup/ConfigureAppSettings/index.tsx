"use client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@igniter/ui/components/select";
import React, {useMemo, useRef, useState} from "react";
import { upsertSettings } from "@/actions/ApplicationSettings";
import {ApplicationSettings, ChainId} from "@/db/schema";

interface FormProps {
  defaultValues: Partial<ApplicationSettings>;
  goNext: () => void;
}

export const formSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email().optional(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  domain: z.string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)+.*)$/,
      "Invalid domain format. Ensure it's a valid domain name."
    ).min(1, "Domain is required"),
  fee: z.coerce
    .number()
    .min(1, "Provider fee must be greater than 0")
    .max(100),
  delegatorRewardsAddress: z.string().refine(
    (value) => value.toLowerCase().startsWith('pokt') && value.length === 43,
    (val) => ({ message: `${val} is not a valid address` })
  ),
  minimumStake: z.coerce.number().min(15000, "Minimum stake is required").default(15000),
});

const FormComponent: React.FC<FormProps> = ({ defaultValues, goNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chainId: defaultValues.chainId || ChainId.Pocket,
      rpcUrl: defaultValues.rpcUrl || "",
      name: defaultValues.name || "",
      supportEmail: defaultValues.supportEmail || "",
      fee: Number(defaultValues.fee) || 1,
      domain: defaultValues.domain || "",
      delegatorRewardsAddress: defaultValues.delegatorRewardsAddress || "",
      minimumStake: defaultValues.minimumStake,
    },
  });

  const isUpdate = useMemo(() => defaultValues.id !== 0, [defaultValues]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleGoNext = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="flex flex-col justify-between gap-4">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(async (values: any) => {
            setIsLoading(true);
            try {
              await upsertSettings(values, isUpdate);
              goNext();
            } catch (error) {
              console.error(error);
            } finally {
              setIsLoading(false);
            }
          })}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
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
              name="supportEmail"
              control={form.control}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="chainId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain ID</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Chain ID" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pocket">Mainnet</SelectItem>
                        <SelectItem value="pocket-beta">Beta</SelectItem>
                        <SelectItem value="pocket-alpha">Alpha</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="rpcUrl"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RPC Url</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="minimumStake"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your minimum supported stake:</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={String(field.value)}
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum stake" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key={15000} value={String(15000)}>
                          15000
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="fee"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Fee</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input {...field} type="number" className="flex-grow" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="domain"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input {...field} className="flex-grow" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <div className="flex justify-end gap-4">
        <Button disabled>Back</Button>
        <Button
          onClick={handleGoNext}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default FormComponent;
