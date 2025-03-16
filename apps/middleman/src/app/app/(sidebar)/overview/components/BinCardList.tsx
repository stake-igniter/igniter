import NodesIcon from "@/app/assets/icons/dark/nodes.svg";

interface BinCardProps {
  value: string;
  label: string;
  count: number;
}

const BinCard: React.FC<BinCardProps> = ({ value, label, count }) => {
  return (
    <div className="bg-secondary rounded-md p-3 min-h-[108px] min-w-[108px]">
      <div className="flex flex-col gap-2 h-full justify-between">
        <div className="flex flex-col">
          <p className="font-mono">{value}</p>
          <p className="text-muted-foreground">{label}</p>
        </div>
        <div className="flex flex-row justify-between">
          <span className="font-mono">{count}</span>
          <NodesIcon />
        </div>
      </div>
    </div>
  );
};

interface BinCardListProps {
  bins: Array<{ value: string; label: string; count: number }>;
}

const BinCardList: React.FC<BinCardListProps> = ({ bins }) => {
  return (
    <div className="flex flex-row gap-2 h-full justify-between">
      {bins.map((bin, index) => (
        <BinCard
          key={index}
          value={bin.value}
          label={bin.label}
          count={bin.count}
        />
      ))}
    </div>
  );
};

export default BinCardList;
