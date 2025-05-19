import { getNodesByUser } from "@/lib/dal/nodes";
import DataTable from "@igniter/ui/components/DataTable/index";
import { columns, filters, sorts } from "./table/columns";
import { DrawerDemo } from './detail/Detail'
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect('/');
  }

  const nodes = await getNodesByUser(session.user.identity);

  const data = nodes.map((node) => ({
    ...node,
    transactions: node.transactionsToNodes.map((t) => t.transaction),
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
