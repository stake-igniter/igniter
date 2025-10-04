'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@igniter/ui/components/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@igniter/ui/components/form'
import { Input } from '@igniter/ui/components/input'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  RetrieveBlockchainSettings,
  RetrieveIndexerNetwork,
  UpsertApplicationSettings,
} from '@/actions/ApplicationSettings'
import type { ApplicationSettings } from '@igniter/db/provider/schema'
import { ChainId } from '@igniter/db/provider/enums'

interface FormProps {
  defaultValues: Partial<ApplicationSettings>;
  goNext: () => void;
}

const RpcUrlSchema = z.string().url('Please enter a valid URL').min(1, 'URL is required')

export const FormSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  rpcUrl: RpcUrlSchema,
  indexerApiUrl: RpcUrlSchema,
  appIdentity: z.string().min(1, 'App Identity is Required'),
  updatedAtHeight: z.string().nullable(),
  minimumStake: z.coerce.number(),
}).superRefine(async (values, ctx) => {
  if (!values.indexerApiUrl) {
    return // Skip validation if empty
  }

  try {
    const indexerNetwork = await RetrieveIndexerNetwork(values.indexerApiUrl)

    if (indexerNetwork !== values.chainId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Indexer network (${indexerNetwork}) does not match chain ID (${values.chainId})`,
        path: ['indexerApiUrl'],
      })
      return false
    }

  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Failed to validate Indexer API URL',
      path: ['indexerApiUrl'],
    })
    return false
  }
})

type FormValues = z.infer<typeof FormSchema>;

const FormComponent: React.FC<FormProps> = ({ defaultValues, goNext }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBlockchainParams, setIsLoadingBlockchainParams] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rpcUrl: defaultValues?.rpcUrl || '',
      indexerApiUrl: defaultValues?.indexerApiUrl || '',
      minimumStake: defaultValues?.minimumStake,
      chainId: defaultValues?.chainId,
      updatedAtHeight: defaultValues?.updatedAtHeight ?? null,
      appIdentity: defaultValues?.appIdentity || '',
    },
  })

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { isValidating, isSubmitting } = form.formState
  const [rpcUrl, chainId] = form.watch([
    'rpcUrl',
    'chainId',
  ])

  const debouncedRetrieveParams = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (rpcUrl && rpcUrl.trim() !== '') {
        retrieveBlockchainParams()
      }
    }, 1000)
  }, [rpcUrl])

  useEffect(() => {
    debouncedRetrieveParams()

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [rpcUrl, debouncedRetrieveParams])

  const isUpdate = useMemo(() => defaultValues?.id !== 0, [defaultValues])
  const formRef = useRef<HTMLFormElement>(null)

  const handleGoNext = () => {
    formRef.current?.requestSubmit()
  }

  const retrieveBlockchainParams = async () => {
    const url = form.getValues().rpcUrl
    const validatedUrl = RpcUrlSchema.safeParse(url)

    if (!validatedUrl.success) {
      form.setError('rpcUrl', {
        type: 'manual',
        message: 'Please enter a valid URL',
      })
      return
    }

    try {
      setIsLoadingBlockchainParams(true)

      const updatedAtHeight = form.getValues().updatedAtHeight

      const response = await RetrieveBlockchainSettings(validatedUrl.data, updatedAtHeight)

      if (!response.success && response.errors) {
        const [error] = response.errors
        form.setError('rpcUrl', {
          type: 'manual',
          message: error,
        })
        return
      } else if (response.network && response.height && response.minStake) {
        form.setValue('chainId', response.network as ChainId)
        form.setValue('minimumStake', response.minStake)
        form.setValue('updatedAtHeight', response.height)
      }
    } catch (err) {
      const { message } = err as Error
      console.error('Failed to fetch blockchain params', err)
      form.setError('rpcUrl', {
        type: 'manual',
        message,
      })
    } finally {
      setIsLoadingBlockchainParams(false)
    }
  }

  const submit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await UpsertApplicationSettings(values, isUpdate)
      goNext()
    } catch (error) {
      console.error('Something failed while updating the application settings', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-between gap-4">
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(submit)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="appIdentity"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Identity</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={true}/>
                  </FormControl>
                  <FormMessage/>
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
                    <Input {...field} disabled={isLoadingBlockchainParams}/>
                  </FormControl>
                  <FormDescription>
                    The RPC will determine the chainID and minimum stake. The chainID can not be changed later.
                  </FormDescription>
                  <FormMessage/>
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
                    <Input {...field} disabled={true}/>
                  </FormControl>
                  <FormMessage/>
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
                    <Input {...field} disabled={true}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="indexerApiUrl"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indexer API Url</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!chainId || !rpcUrl || isLoadingBlockchainParams}/>
                  </FormControl>
                  <FormDescription>
                    This URL will be used to retrieve rewards from the indexer.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <div className="flex justify-end">
        <Button type="button" onClick={handleGoNext} disabled={isLoading || isValidating || isSubmitting}>
          {isLoading ? 'Loading...' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default FormComponent
