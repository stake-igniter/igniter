import {ComponentType} from "react";
import Link from "next/link";
import {PlaceholderLogo} from "@igniter/ui/assets";
import EngagementLinks from "@/app/components/EngagementLinks";
import GithubIcon from "@/app/assets/icons/dark/socials/github.svg";
import DiscordIcon from "@/app/assets/icons/dark/socials/discord.svg";
import XIcon from "@/app/assets/icons/dark/socials/x.svg";


export interface FooterProps {
    logoIcon?: ComponentType;
}

export default function Footer({ logoIcon: LogoIcon } : Readonly<FooterProps>) {
    return (
        <div className="flex flex-row items-center px-[24px] justify-between w-full h-[78px] bg-[var(--color-black-1)] border-b border-[var(--black-dividers)]">
            <span className="inline-block font-sans text-sm font-normal text-[var(--color-white-4)]">
              © Soothe Inc.
            </span>
            { LogoIcon ? <LogoIcon /> : <PlaceholderLogo /> }
            <div>
                {/*<EngagementLinks links={[*/}
                {/*    { name: "Github", Icon: GithubIcon, url: "#" },*/}
                {/*    { name: "Discord", Icon: DiscordIcon, url: "#" },*/}
                {/*    { name: "X", Icon: XIcon, url: "#" },*/}
                {/*]} />*/}
            </div>
        </div>
    );
}
