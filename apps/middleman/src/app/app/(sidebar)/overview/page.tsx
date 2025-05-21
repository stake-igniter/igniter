import Link from 'next/link';
import { Button } from "@igniter/ui/components/button";
import BinCardList from "./components/BinCardList";
import {amountToPokt} from "@igniter/ui/lib/utils";
import {GetUserNodes} from "@/actions/Nodes";

export const dynamic = "force-dynamic";

export default async function Page() {
  const nodes = await GetUserNodes();

  let nodesWith15k = 0, nodesWith30k = 0, nodesWith45k = 0, nodesWith60k = 0, totalStaked = 0;

  for (const node of nodes) {
    const stakedAmount = amountToPokt(node.stakeAmount);
    totalStaked += stakedAmount;

    if (stakedAmount < 30000) {
      nodesWith15k++;
    } else if (stakedAmount < 45000) {
      nodesWith30k++;
    } else if (stakedAmount < 60000) {
      nodesWith45k++;
    } else {
      nodesWith60k++;
    }
  }

  const binCards = [
    { value: "Node", label: "", count: nodesWith15k },
  ];

  return (
    <>
      <div className="border-b-1">
        <div className="mx-30 py-10">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <h1>Overview</h1>
              <p className="text-muted-foreground">
                Welcome to your $POKT staking dashboard.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-3">
                <Link href="/app/stake">
                  <Button>Stake</Button>
                </Link>
                {/*<Link href="/app/migrate">*/}
                {/*  <Button>Migrate</Button>*/}
                {/*</Link>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-30 py-8 border-b-1">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-3">
            <h3 className="text-(--slightly-muted-foreground)">Stake</h3>
            <h1 className="font-mono">
              {totalStaked.toLocaleString()} <span className="text-muted-foreground">$POKT</span>
            </h1>
            {/*<p className="flex flex-row gap-2">*/}
            {/*  <ChangeIndicator change={120000} isPercentage={false} />*/}
            {/*  <span className="text-muted-foreground">vs. Previous Month</span>*/}
            {/*</p>*/}
          </div>
          <div className="flex flex-col gap-3">
            <BinCardList bins={binCards} />
          </div>
        </div>
      </div>
    </>
  );
}
