import {ArrowBackIcon, XIcon} from "@igniter/ui/assets";

export interface ActivityHeaderProps {
    onBack?: () => void;
    title: string;
    subtitle: string;
}

export function ActivityHeader({onBack, title, subtitle}: Readonly<ActivityHeaderProps>) {
    const classes = onBack
        ? "flex flex-row items-center justify-between"
        : "flex flex-row-reverse";

    return (
        <div className="flex flex-col gap-4.5">
            <div className={classes}>
                {onBack &&
                    <span className="flex flex-row gap-4.5 items-center text-[var(--color-white-3)]  hover:cursor-pointer group" onClick={onBack}>
                        <ArrowBackIcon className="fill-current text-[var(--color-white-2)] hover:text-[var(--color-white-4)] hover:cursor-pointer group-hover:text-[var(--color-white-4)]" />
                        <span className="text-[14px] group-hover:text-[var(--color-white-4)]">
                            Go Back
                        </span>
                    </span>
                }
                <XIcon
                    className="fill-current text-[var(--color-white-2)] hover:text-[var(--color-white-4)] hover:cursor-pointer"/>
            </div>
            <div className="flex flex-col">
                    <span
                        className="font-[Jost] text-[30px] font-normal leading-normal tracking-normal text-[var(--color-white-1)] mb-2">
                        {title}
                    </span>
                <span className="text-[14px] font-normal leading-[1.43] text-[var(--color-white-3)]">
                    {subtitle}
                    </span>
            </div>
        </div>
    );
}
