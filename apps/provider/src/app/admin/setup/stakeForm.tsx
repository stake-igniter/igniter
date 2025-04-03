import { upsertStakeSettings } from "@/actions/StakeSettings";
import { DEFAULT_ADDRESS_GROUP_PATTERN } from "@/lib/constants";
import { ChainMap } from "@/lib/supportedChains";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@igniter/ui/components/button";
import { Checkbox } from "@igniter/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@igniter/ui/components/form";
import { Input } from "@igniter/ui/components/input";
import { MultiSelect } from "@igniter/ui/components/multi-select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface FormProps {
  goNext: () => void;
  chainMap: ChainMap;
}

export const formSchema = z.object({
  chains: z.array(z.string()).min(1, "Select at least one blockchain"),
  domain: z.string().min(1, "Domain is required"),
  defaultChains: z.array(z.string()).max(8, "Select up to 8 chains"),
  identity: z.string().min(1, "Identity is required"),
  pattern: z.string().min(1, "Pattern is required"),
});

const FormComponent: React.FC<FormProps> = ({ goNext, chainMap }) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chains: [],
      domain: "",
      defaultChains: [],
      identity: "default",
      pattern: DEFAULT_ADDRESS_GROUP_PATTERN,
    },
  });

  const supportedChains = Object.keys(chainMap).map((chain) => ({
    name: chainMap[chain]?.label!,
    value: chain,
  }));
  const selectedChains = form.watch("chains");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values: any) => {
          setIsLoading(true);
          try {
            await upsertStakeSettings(values);
            goNext();
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        })}
        className="grid gap-4"
      >
        <FormDescription>
          Configure your first address group, this will allow you to save
          multiple stake configurations.
        </FormDescription>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            name="identity"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Identifier</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="pattern"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service URL Pattern</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="chains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supported Chains</FormLabel>
                <FormControl>
                  <MultiSelect
                    data={supportedChains}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const updatedDefaultChains = form
                        .getValues("defaultChains")
                        .filter((chain) => value.includes(chain));
                      form.setValue("defaultChains", updatedDefaultChains);
                    }}
                    placeholder="Search chains eg. Ethereum, Polygon, Solana."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormLabel>Default Chains</FormLabel>
          <div className="grid grid-cols-1 gap-2">
            {selectedChains.map((chain, idx) => (
              <FormField
                key={chain}
                control={form.control}
                name="defaultChains"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={chain}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(chain)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, chain])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== chain
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {chain}
                      </FormLabel>
                      {idx === selectedChains.length - 1 && <FormMessage />}
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button>Back</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormComponent;
