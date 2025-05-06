import { getNodesByUser } from "@/lib/dal/nodes";
import DataTable from "@igniter/ui/components/DataTable/index";
import { columns, filters, sorts } from "./table/columns";
import { DrawerDemo } from './detail/Detail'

export const dynamic = "force-dynamic";

export default async function Page() {
  const nodes = await getNodesByUser();

  const data = nodes.map((node) => ({
    ...node,
    provider: node.provider ?? undefined,
    transactions: node.transactionsToNodes.map((transaction) => transaction.transaction),
  }));

  return (
    <>
      <h1>Nodes</h1>
      <DrawerDemo/>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={data}
          filters={filters}
          sorts={sorts}
        />
      </div>
    </>
  );
}
