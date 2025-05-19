import { getTransactionsByUser } from '@/lib/dal/transaction'
import TransactionsTable from '@/app/app/(sidebar)/(lists)/transactions/table'

export const dynamic = "force-dynamic";

export default async function Page() {
  const transactions = await getTransactionsByUser();

  return (
    <>
      <h1>Transactions</h1>
      <div className="container mx-auto ">
        <TransactionsTable initialTransactions={transactions} />
      </div>
    </>
  );
}
