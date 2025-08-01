import type { Metadata } from 'next'
import TransactionsTable from '@/app/app/(sidebar)/(lists)/transactions/table'
import {GetUserTransactions} from "@/actions/Transactions";
import { GetAppName } from '@/actions/ApplicationSettings'

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Transactions - ${appName}`,
  }
}

export default async function Page() {
  const transactions = await GetUserTransactions();
  return (
    <>
      <h1>Transactions</h1>
      <div className="container mx-auto ">
        <TransactionsTable initialTransactions={transactions} />
      </div>
    </>
  );
}
