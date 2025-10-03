import {LoaderIcon} from "@igniter/ui/assets";

export function ActivityContentLoading() {
  return (
    <div className="flex flex-row w-full items-center justify-center">
      <LoaderIcon className="animate-spin"/>
    </div>
  );
}
