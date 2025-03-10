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
import { Textarea } from "@igniter/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@igniter/ui/components/select";
import React, { useMemo } from "react";
import { upsertSettings } from "@/actions/ApplicationSettings";
import { ApplicationSettings } from "@/db/schema";

interface FormProps {
  defaultValues: Partial<ApplicationSettings>;
  goToNextStep: () => void;
}

export const formSchema = z.object({
  chainId: z.enum(["mainnet", "testnet"]),
  blockchainProtocol: z.enum(["morse", "shannon"]),
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email(),
  middlemanFee: z.coerce
    .number()
    .min(1, "Middleman fee must be greater than 0")
    .max(100),
  minimumStakeIncrement: z.enum(["15000", "30000", "45000", "60000"]),
  privacyPolicy: z.string().optional(),
});

const FormComponent: React.FC<FormProps> = ({
  defaultValues,
  goToNextStep,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chainId: defaultValues.chainId || "mainnet",
      blockchainProtocol: defaultValues.blockchainProtocol || "morse",
      name: defaultValues.name || "",
      supportEmail: defaultValues.supportEmail || "",
      ownerEmail: defaultValues.ownerEmail || "",
      middlemanFee: Number(defaultValues.middlemanFee) || 1,
      minimumStakeIncrement: defaultValues.minimumStakeIncrement || "15000",
      privacyPolicy: defaultValues.privacyPolicy || "",
    },
  });

  const isUpdate = useMemo(
    () => defaultValues.id !== undefined,
    [defaultValues]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values: any) => {
          await upsertSettings(values, isUpdate);
          goToNextStep();
        })}
        className="grid gap-4"
      >
        <div className="grid grid-cols-3 gap-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middleman Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="ownerEmail"
            control={form.control}
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
                      <SelectItem value="mainnet">Mainnet</SelectItem>
                      <SelectItem value="testnet">Testnet</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="blockchainProtocol"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blockchain Protocol</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Blockchain Protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morse">Morse</SelectItem>
                      <SelectItem value="shannon">Shannon</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="middlemanFee"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middleman Fee</FormLabel>
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
            name="minimumStakeIncrement"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stake Increment</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Minimum Stake Increment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15000">15000</SelectItem>
                      <SelectItem value="30000">30000</SelectItem>
                      <SelectItem value="45000">45000</SelectItem>
                      <SelectItem value="60000">60000</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="privacyPolicy"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy Policy</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default">
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default FormComponent;
