"use client";
import React, { useEffect, useState } from 'react'
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
import { loadProvidersFromCdn, Provider, submitProviders } from '@/actions/Providers'
import { LoaderIcon } from '@igniter/ui/assets'

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
  goNext,
  goBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<Array<Provider>>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providers: providers.map((provider) => provider.identity),
    },
  });

  async function updateProvidersList() {
    try {
      setIsLoading(true)
      const providersList = await loadProvidersFromCdn()
      setProviders(providersList)
      if (!providers.length) {
        form.setValue('providers', providersList.map((provider) => provider.identity))
      }
    } catch (error) {
      console.error("Failed to load providers list", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    updateProvidersList()
  }, [])

  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <div className="flex justify-center items-center w-full h-[300px]">
        <LoaderIcon className="animate-spin" />
      </div>
    )
  } else {
    content = (
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setIsLoading(true);
          try {
            await submitProviders(values, providers);
            goNext();
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
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
                  key={item.identity}
                  control={form.control}
                  name="providers"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.identity}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.identity)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                  ...field.value,
                                  item.identity,
                                ])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.identity
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
    )
  }

  return (
    <Form {...form}>
      {content}
    </Form>
  );
};

export default ProvidersForm;
