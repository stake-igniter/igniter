import ChangeUpIcon from "@/app/assets/icons/dark/change_up.svg";
import ChangeDownIcon from "@/app/assets/icons/dark/change_down.svg";
import { roundAndSeparate } from "@/lib/utils";

interface ChangeIndicatorProps {
  change: number;
  isPercentage?: boolean;
}

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  change,
  isPercentage = true,
}) => {
  const changeValue = `${roundAndSeparate(Math.abs(change), 2)}${isPercentage ? "%" : ""}`;
  const icon = change > 0 ? <ChangeUpIcon /> : <ChangeDownIcon />;

  let changeColor: string;

  if (change > 0) {
    changeColor = "text-(--success-foreground)";
  } else if (change < 0) {
    changeColor = "text-(--destructive-foreground)";
  } else {
    changeColor = "text-neutral-400";
  }

  return (
    <span
      className={`${changeColor} flex flex-row items-center gap-2 font-mono`}
    >
      <span className="-mt-1">{icon}</span>
      {changeValue}
    </span>
  );
};

export default ChangeIndicator;
