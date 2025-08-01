import { ColumnDef } from "@igniter/ui/components/table";
import { KeyState } from '@/db/schema'
import { FilterGroup, SortOption } from '@igniter/ui/components/DataTable/index'
import Address from '@igniter/ui/components/Address'
import { ListBasicAddressGroups } from '@/actions/AddressGroups'
import {KeyStateLabels} from "@/app/admin/(internal)/keys/constants";

export interface Key {
  id: number
  address: string
  addressGroup: {
    id: number
    name: string
  }
  state: KeyState
  ownerAddress: string | null
  delegator: {
    name: string
  } | null
  createdAt: Date
}

export const columns: Array<ColumnDef<Key>> = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;

      return (
        <Address address={address} />
      );
    },
  },
  {
    accessorKey: "addressGroup",
    header: "Address Group",
    cell: ({ row }) => {
      const addressGroup = row.getValue("addressGroup") as Key['addressGroup'];
      return (
        <div className="flex items-center gap-2">
          <span className="text-slightly-muted-foreground flex justify-center items-center gap-2">
            {addressGroup.name}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      const addressGroup = row.getValue("addressGroup") as Key['addressGroup'];
      return typeof value === 'string' ? addressGroup.name.toLowerCase().includes(value.toLowerCase()) : addressGroup.id === value;
    },
  },
  {
    accessorKey: "ownerAddress",
    header: "Owner",
    cell: ({ row }) => {
      const ownerAddress = row.getValue("ownerAddress") as string;

      if (!ownerAddress) {
        return 'Owner Not Set';
      }

      return (
          <Address address={ownerAddress} />
      );
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => {
      const status = row.getValue("state") as KeyState;
      return (
        <span className="flex justify-center gap-2">
          {KeyStateLabels[status] || status}
        </span>
      );
    },
  },
  {
    accessorKey: "delegator",
    header: "Delivered To",
    cell: ({ row }) => {
      const delegator = row.getValue("delegator") as Key['delegator'];

      return (
        <span className="flex justify-center gap-2">
          {delegator?.name || '-'}
        </span>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      return (
        <span className="font-mono text-slightly-muted-foreground flex justify-center gap-2">
          {createdAt.toLocaleString()}
        </span>
      );
    },
  },
]

export function getFilters(addressesGroup: Awaited<ReturnType<typeof ListBasicAddressGroups>>): Array<FilterGroup<Key>> {
 return [
   {
     group: "state",
     items: [
       [{label: "All Keys", value: "", column: "state", isDefault: true}],

       (Object.values(KeyState).map((state) => ({
         label: KeyStateLabels[state],
         value: state,
         column: "state"
       })))
     ]
   },
   {
     group: 'addressGroup',
     items: [
       [{label: "All Address Groups", value: "", column: "addressGroup", isDefault: true}],
       (addressesGroup.map((addressGroup) => ({
         label: addressGroup.name,
         value: addressGroup.id,
         column: "addressGroup"
       })))
     ]
   }
 ]
}

export const sorts: Array<Array<SortOption<Key>>> = [
  [
    {
      label: "Most Recent",
      column: "createdAt",
      direction: "desc",
      isDefault: true,
    },
  ],
]
