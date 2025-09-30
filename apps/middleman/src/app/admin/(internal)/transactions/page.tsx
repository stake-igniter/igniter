import type { Metadata } from 'next'
import TransactionsTable from '@/app/admin/(internal)/transactions/table'
import { GetAppName } from '@/actions/ApplicationSettings'

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Transactions - ${appName}`,
  }
}

export default async function Page() {
  return (
    <div className={'mx-30 py-10'}>
      <h1>Transactions</h1>
      <div className="container mx-auto ">
        <TransactionsTable />
      </div>
    </div>
  );
}
