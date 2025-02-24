import Logo from "./poktscan_logo_dark.svg";
import Link from "next/link";
import PlaceholderLogo from "@/app/assets/logo/placeholder_logo.svg";
import PriceWidget from "./PriceWidget";
import CurrencySelector from "./CurrencySelector";
import UserMenu from "./UserMenu";

export default async function AppBar() {
  return (
    <header
      className={
        "px-3 lg:px-6 sticky z-[50] border-b border-(--border) top-0 flex flex-row items-center justify-between"
      }
    >
      <div
        className={
          "h-(--header-height) w-full flex items-center justify-between"
        }
      >
        <div>
          <PlaceholderLogo />
        </div>
        <div className="w-full md:w-auto flex flex-row items-center gap-10 justify-end">
          <PriceWidget />
          <CurrencySelector />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
