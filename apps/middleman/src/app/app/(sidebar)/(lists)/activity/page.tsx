import { getActivitiesByUser } from "@/lib/dal/activity";
import DataTable from "@igniter/ui/components/DataTable/index";
import { columns, filters, sorts } from "./table/columns";

export const dynamic = "force-dynamic";

export default async function Page() {
  const activities = await getActivitiesByUser();

  return (
    <>
      <h1>Activity</h1>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={activities}
          filters={filters}
          sorts={sorts}
        />
      </div>
    </>
  );
}
