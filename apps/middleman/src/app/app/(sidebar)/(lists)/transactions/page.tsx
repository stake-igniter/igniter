import { getTransactionsByUser } from '@/lib/dal/transaction'
import TransactionsTable from '@/app/app/(sidebar)/(lists)/transactions/table'
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect('/');
  }

  const transactions = await getTransactionsByUser(session.user.identity);

  return (
    <>
      <h1>Transactions</h1>
      <div className="container mx-auto ">
        <TransactionsTable initialTransactions={transactions} />
      </div>
    </>
  );
}
