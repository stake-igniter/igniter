"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@igniter/ui/components/checkbox";
import { Provider, submitProviders } from "@/actions/Providers";

interface ProvidersFormProps {
  providers: Provider[];
  goNext: () => void;
  goBack: () => void;
}

const formSchema = z.object({
  providers: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one provider.",
  }),
});

const ProvidersForm: React.FC<ProvidersFormProps> = ({
  providers,
  goNext,
  goBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providers: providers.map((provider) => provider.publicKey),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setIsLoading(true);
          await submitProviders(values, providers);
          setIsLoading(false);
          goNext();
        })}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="providers"
          render={() => (
            <FormItem>
              {providers.map((item) => (
                <FormField
                  key={item.publicKey}
                  control={form.control}
                  name="providers"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.publicKey}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.publicKey)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...field.value,
                                    item.publicKey,
                                  ])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.publicKey
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button onClick={goBack} disabled={isLoading}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProvidersForm;
