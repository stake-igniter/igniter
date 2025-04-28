import {Service} from "@/db/schema";
import {RPCType} from "@/lib/models/supplier";
import {DataTable} from "@/app/admin/setup/ConfigureServices/DataTable";
import {columns} from "@/app/admin/setup/ConfigureServices/Columns";
import {Button} from "@igniter/ui/components/button";
import {LoaderIcon} from "@igniter/ui/assets";

export interface ConfigureServicesProp {
  goNext: () => void;
  goBack: () => void;
}

export default function ConfigureServices({ goNext, goBack }: Readonly<ConfigureServicesProp>) {
  const isLoading = false;
  // const services: Service[] = [
  //   {
  //     id: 1,
  //     serviceId: "anvil",
  //     name: "Anvil",
  //     ownerAddress: "pokt1f0c9y7mahf2ya8tymy8g4rr75ezh3pkklu4c3e",
  //     computeUnits: 5,
  //     revSharePercentage: 10,
  //     endpoints: [
  //       {
  //         url: "https://anvil.pokt.network/v1",
  //         rpcType: RPCType.JSON_RPC,
  //       },
  //       {
  //         url: "https://anvil-websocket.pokt.network",
  //         rpcType: RPCType.WEBSOCKET,
  //       }
  //     ],
  //     createdAt: new Date("2023-07-15T10:30:00Z"),
  //     updatedAt: new Date("2023-11-20T14:45:00Z")
  //   },
  //   {
  //     id: 2,
  //     serviceId: "arb_one",
  //     name: "Arbitrum One",
  //     ownerAddress: "pokt100ea839pz5e9zuhtjxvtyyzuv4evhmq95682zw",
  //     computeUnits: 1,
  //     revSharePercentage: 5,
  //     endpoints: [
  //       {
  //         url: "https://arbitrum-one.pokt.network/rpc",
  //         rpcType: RPCType.JSON_RPC,
  //       }
  //     ],
  //     createdAt: new Date("2023-08-05T08:15:00Z"),
  //     updatedAt: new Date("2023-08-05T08:15:00Z")
  //   },
  //   {
  //     id: 3,
  //     serviceId: "arb_sep_test",
  //     name: "Arbitrum Sepolia Testnet",
  //     ownerAddress: "pokt100ea839pz5e9zuhtjxvtyyzuv4evhmq95682zw",
  //     computeUnits: 1,
  //     revSharePercentage: null,
  //     endpoints: [
  //       {
  //         url: "https://arb-sepolia.pokt.network/v1",
  //         rpcType: RPCType.JSON_RPC,
  //       },
  //       {
  //         url: "https://arb-sepolia-rest.pokt.network/api",
  //         rpcType: RPCType.REST,
  //       }
  //     ],
  //     createdAt: new Date("2023-09-12T11:20:00Z"),
  //     updatedAt: new Date("2023-12-01T16:30:00Z")
  //   },
  //   {
  //     id: 4,
  //     serviceId: "ethereum_mainnet",
  //     name: "Ethereum Mainnet",
  //     ownerAddress: "pokt1m574ek8lm7hy9kyeudx3tq3q0wxvdgkh9x5d8d",
  //     computeUnits: 3,
  //     revSharePercentage: 8,
  //     endpoints: [
  //       {
  //         url: "https://eth-mainnet.pokt.network/v1",
  //         rpcType: RPCType.JSON_RPC,
  //       },
  //       {
  //         url: "wss://eth-mainnet-ws.pokt.network",
  //         rpcType: RPCType.WEBSOCKET,
  //       }
  //     ],
  //     createdAt: new Date("2023-06-02T09:45:00Z"),
  //     updatedAt: new Date("2023-10-15T12:10:00Z")
  //   },
  //   {
  //     id: 5,
  //     serviceId: "polygon_pos",
  //     name: "Polygon PoS",
  //     ownerAddress: "pokt1jr0dvz5zd9n9pdxj2qvz6h5mk93a4qeglr2yn8",
  //     computeUnits: 2,
  //     revSharePercentage: 7,
  //     endpoints: [
  //       {
  //         url: "https://polygon-pos.pokt.network/v1",
  //         rpcType: RPCType.JSON_RPC,
  //       },
  //       {
  //         url: "https://polygon-archival.pokt.network/v1",
  //         rpcType: RPCType.JSON_RPC,
  //       },
  //       {
  //         url: "https://polygon-pos-grpc.pokt.network",
  //         rpcType: RPCType.GRPC,
  //       }
  //     ],
  //     createdAt: new Date("2023-05-18T14:25:00Z"),
  //     updatedAt: new Date("2023-09-30T10:05:00Z")
  //   }
  // ];

  const services: Service[] = [];

  const content = services.length > 0
    ? (
        <DataTable
          columns={columns}
          data={services}
        />
      )
    : (
        <div className="flex justify-center items-center w-full h-full">
          Configure your services
        </div>
      );

  return (
    <div className='flex flex-col gap-4 h-[500px]'>
      <div className="p-2">
        {content}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          disabled={isLoading}
          onClick={goBack}>
          Back
        </Button>
        <Button
          disabled={isLoading || (services.length === 0)}
          onClick={goNext}
          >
          {isLoading ? <LoaderIcon className="animate-spin" /> : "Next"}
        </Button>
      </div>
    </div>
  );
}
