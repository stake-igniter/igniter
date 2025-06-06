"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@igniter/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@igniter/ui/components/select";
import React, { useMemo, useState } from "react";
import { upsertSettings } from "@/actions/ApplicationSettings";
import {ApplicationSettings, ChainId} from "@/db/schema";

interface FormProps {
  defaultValues: Partial<ApplicationSettings>;
  goNext: () => void;
}

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email(),
  fee: z.coerce
    .number()
    .min(1, "Service fee must be greater than 0")
    .max(100),
  delegatorRewardsAddress: z.string().refine(
    (value) => value.toLowerCase().startsWith('pokt') && value.length === 43,
    (val) => ({ message: `${val} is not a valid address` })
  ),
  privacyPolicy: z.string().optional(),
});

const FormComponent: React.FC<FormProps> = ({ defaultValues, goNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues.name || "",
      supportEmail: defaultValues.supportEmail || "",
      ownerEmail: defaultValues.ownerEmail || "",
      fee: Number(defaultValues.fee) || 1,
      privacyPolicy: defaultValues.privacyPolicy || "",
      delegatorRewardsAddress: defaultValues.delegatorRewardsAddress || "",
    },
  });

  const isUpdate = useMemo(() => defaultValues.id !== 0, [defaultValues]);

  return (
    <Form {...form}>
      <form
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
            name="fee"
            control={form.control}
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
        </div>

        <FormField
          name="privacyPolicy"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy Policy</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-[200px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button disabled>Back</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormComponent;
