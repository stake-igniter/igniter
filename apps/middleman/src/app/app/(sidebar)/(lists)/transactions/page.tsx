import { getTransactionsByUser } from '@/lib/dal/transaction'
import TransactionsTable from '@/app/app/(sidebar)/(lists)/transactions/table'
import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {GetUserTransactions} from "@/actions/Transactions";

export const dynamic = "force-dynamic";

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
