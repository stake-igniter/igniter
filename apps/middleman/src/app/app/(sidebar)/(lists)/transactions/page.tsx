import DataTable from "@igniter/ui/components/DataTable/index";
import { columns, filters, sorts } from "./table/columns";
import { getTransactionsByUser } from '@/lib/dal/transaction'
import { Operation } from '@/app/detail/Detail'
import { MessageType } from '@/lib/constants'
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
        <DataTable
          columns={columns}
          data={
            transactions.map((tx) => {
              const operations = JSON.parse(tx.unsignedPayload).body.messages as Array<Operation>

              return {
                id: tx.id,
                type: tx.type,
                status: tx.status,
                createdAt: tx.createdAt!,
                totalValue: operations.reduce((acc, op) => {
                  if (op.typeUrl === MessageType.Send) {
                    return acc + Number(op.value.amount.at(0)?.amount || 0)
                  }

                  if (op.typeUrl === MessageType.Stake) {
                    return acc + Number(op.value.stake.amount)
                  }

                  return acc
                }, 0),
                operations,
                hash: tx.hash || '',
                estimatedFee: tx.estimatedFee,
                consumedFee: tx.consumedFee,
                provider: tx.provider?.name || '',
                providerFee: tx.providerFee,
                typeProviderFee: tx.typeProviderFee,
              }
            })
          }
          filters={filters}
          sorts={sorts}
        />
      </div>
    </>
  );
}
