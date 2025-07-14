import ApolloWrapper from '@igniter/ui/graphql/client'
import { GetApplicationSettings } from '@/actions/ApplicationSettings'
import InitializeHeightContext from '@igniter/ui/context/Height/InitializeContext'
import React, { Suspense } from 'react'
import SummaryLoader from '@igniter/ui/components/RewardsSummary/Loader'
import ServerSummary from '@igniter/ui/components/RewardsSummary/ServerSummary'
import RewardsByAddressesLoader from '@igniter/ui/components/RewardsByAddresses/Loader'
import ServerRewardsByAddresses from '@igniter/ui/components/RewardsByAddresses/ServerRewardsByAddresses'
import { getDistinctRevAddresses } from '@/lib/dal/services'
import { CircleAlert } from 'lucide-react'
import Link from 'next/link'

export const dynamic = "force-dynamic";

export default async function Page() {
  const [applicationSettings, addresses] = await Promise.all([
    GetApplicationSettings(),
    getDistinctRevAddresses()
  ]);

  const graphqlUrl = applicationSettings.indexerApiUrl

  let rewardsContent: React.ReactNode

  if (addresses.length === 0) {
    rewardsContent = (
      <div className={'flex flex-col p-4 w-full gap-4 md:gap-6 sm:px-3 md:px-6 lg:px-6 xl:px-10'}>
        <div className={'flex flex-row p-6 gap-2 items-center border rounded-lg'}>
          <CircleAlert className={'h-16 w-16'} />
          <div className={'flex flex-col gap-0'}>
            <p className={'!text-lg font-bold'}>
              You do not have addresses configured.
            </p>
            <p>
              To see your rewards, please configure your addresses in{' '}
              <Link
                className={'!text-[color:var(--color-blue-1)] hover:!underline'}
                href={'/admin/groups'}
              >
                Addresses Group
              </Link>
            </p>
          </div>

        </div>
      </div>
    )
  } else {
    rewardsContent = (
      <div className={'flex flex-col p-4 w-full gap-4 md:gap-6 sm:px-3 md:px-6 lg:px-6 xl:px-10'}>
        <div className={'min-w-[260px]'}>
          <Suspense
            key={addresses.join(',')}
            fallback={
              <SummaryLoader />
            }
          >
            <ServerSummary
              addresses={addresses}
              isOwners={false}
              graphQlUrl={graphqlUrl}
            />
          </Suspense>
        </div>

        <Suspense
          key={addresses.join(',')}
          fallback={
            <RewardsByAddressesLoader chartType={'line'} />
          }
        >
          <ServerRewardsByAddresses
            addresses={addresses}
            graphQlUrl={graphqlUrl}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <ApolloWrapper url={graphqlUrl}>
      <InitializeHeightContext graphQlUrl={graphqlUrl}>
        <div className="border-b-1">
          <div className="px-5 sm:px-3 md:px-6 lg:px-6 xl:px-10 py-10">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <h1>Admin Overview</h1>
              </div>
            </div>
          </div>
        </div>
        {rewardsContent}
      </InitializeHeightContext>
    </ApolloWrapper>
  )
}
