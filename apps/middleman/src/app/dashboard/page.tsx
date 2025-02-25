import { Button } from "@igniter/ui/components/button";
import ChangeIndicator from "../components/ChangeIndicator";
import BinCardList from "./BinCardList";

export const dynamic = "force-dynamic";

const binCards = [
  { value: "15K", label: "Nodes", count: 8 },
  { value: "30K", label: "Nodes", count: 2 },
  { value: "45K", label: "Nodes", count: 6 },
  { value: "60K", label: "Nodes", count: 9 },
  { value: "VAL", label: "Nodes", count: 3 },
];

export default async function Page() {
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
                <Button> Stake $POKT</Button>
                <Button> Buy $POKT</Button>
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
              990,000 <span className="text-muted-foreground">$POKT</span>
            </h1>
            <p className="flex flex-row gap-2">
              <ChangeIndicator change={120000} isPercentage={false} />
              <span className="text-muted-foreground">vs. Previous Month</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <BinCardList bins={binCards} />
          </div>
        </div>
      </div>
      <div className="mx-30 py-8 border-b-1">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-3">
            <h3 className="text-(--slightly-muted-foreground)">Rewards</h3>
            <h1 className="font-mono">
              308.25 <span className="text-muted-foreground">$POKT</span>
            </h1>
            <p className="flex flex-row gap-2">
              <span className="text-(--slightly-muted-foreground)">
                Past 24hs
              </span>
              <ChangeIndicator change={-0.13} />
              <span className="text-muted-foreground">vs. Yesterday</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
