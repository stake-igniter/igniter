import SootheNameLogo from '@/app/assets/icons/dark/institutions/soothe.svg';
import PoktscanNameLogo from '@/app/assets/icons/dark/institutions/poktscan.svg';
import PocketNameLogo from '@/app/assets/icons/dark/institutions/pocket.svg';

export default function About() {
    return (
        <div className="flex flex-col h-[521px] bg-[var(--color-black-1)] border-b border-[var(--black-dividers)]">
            <div className="h-[329px] px-[59px] pt-[67px]">
                <div>
                    <span className="font-[var(--font-sans)] text-[30px] leading-[1.6] text-white">
                        We Are Open Source
                    </span>
                </div>
                <div>
                    <span className="font-[var(--font-sans)] text-[27px] leading-[1.63] text-[var(--color-white-3)]">
                        Igniter is being developed by Soothe.
                    </span>
                </div>
            </div>
            <div className="dashed-path-divider" />
            <div className="flex flex-row h-[192px]">
                <div className="relative flex flex-col w-[329px] h-full">
                    <div className="absolute top-[14px] right-[16px]">
                        <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-white-4)] uppercase">
                            product
                        </span>
                    </div>
                    <div className="flex justify-center items-center w-full h-full">
                        <SootheNameLogo />
                    </div>
                </div>
                <div className="relative flex flex-col w-[329px] h-full border-x border-[var(--black-dividers)]">
                    <div className="absolute top-[14px] right-[16px]">
                        <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-white-4)] uppercase">
                            explorer
                        </span>
                    </div>
                    <div className="flex justify-center items-center w-full h-full">
                        <PoktscanNameLogo />
                    </div>
                </div>
                <div className="relative flex flex-col w-[329px] h-full">
                    <div className="absolute top-[14px] right-[16px]">
                        <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-white-4)] uppercase">
                            partner
                        </span>
                    </div>
                    <div className="flex justify-center items-center w-full h-full">
                        <PocketNameLogo />
                    </div>
                </div>
            </div>
        </div>
    );
}
