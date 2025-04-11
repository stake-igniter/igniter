import { ArrowBackIcon, XIcon } from "@igniter/ui/assets";

export interface ActivityHeaderProps {
    onBack?: () => void;
    onClose: () => void;
    isDisabled?: boolean;
    title: string;
    subtitle: string;
}

export function ActivityHeader({
                                   onBack,
                                   title,
                                   subtitle,
                                   onClose,
                                   isDisabled,
                               }: Readonly<ActivityHeaderProps>) {
    const classes = onBack
        ? "flex flex-row items-center justify-between"
        : "flex flex-row-reverse";

    return (
        <div className="flex flex-col gap-4.5">
            <div className={classes}>
                {onBack && (
                    <span
                        className={`flex flex-row gap-4.5 items-center text-[var(--color-white-3)] group ${
                            isDisabled ? "cursor-not-allowed opacity-60" : "hover:cursor-pointer"
                        }`}
                        onClick={!isDisabled ? onBack : undefined}
                    >
            <ArrowBackIcon
                className={`fill-current text-[var(--color-white-2)] group-hover:text-[var(--color-white-4)] ${
                    isDisabled ? "cursor-not-allowed" : "hover:cursor-pointer"
                }`}
            />
            <span
                className={`text-[14px] ${
                    isDisabled ? "" : "group-hover:text-[var(--color-white-4)]"
                }`}
            >
              Go Back
            </span>
          </span>
                )}

                <XIcon
                    className={`fill-current text-[var(--color-white-2)] ${
                        isDisabled
                            ? "cursor-not-allowed opacity-60"
                            : "hover:text-[var(--color-white-4)] hover:cursor-pointer"
                    }`}
                    onClick={!isDisabled ? onClose : undefined}
                />
            </div>

            <div className="flex flex-col">
        <span className="font-[Jost] text-[30px] font-normal leading-normal tracking-normal text-[var(--color-white-1)] mb-2">
          {title}
        </span>
                <span className="text-[14px] font-normal leading-[1.43] text-[var(--color-white-3)]">
          {subtitle}
        </span>
            </div>
        </div>
    );
}
