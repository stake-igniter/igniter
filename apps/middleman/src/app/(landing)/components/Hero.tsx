

export default function Hero() {
    return (
        <div className="flex flex-row items-center justify-center w-full h-[430px] bg-grid border-[var(--black-dividers)]">
            <div className="flex flex-col w-[519px] h-full">
                <div className="flex flex-col gap-1">
                    <span className="font-[var(--font-sans)] mt-[86px] text-[50px] text-white text-center">
                        Non-Custodial Staking
                    </span>
                    <div>
                        <span className="font-[var(--font-sans)] mt-[86px] text-[50px] text-white text-center">
                            Made Easy For
                        </span>
                        <span className="inline-flex items-center justify-center ml-[16px] w-[177px] h-[67px] opacity-15 bg-gradient-to-b from-[#e470d9] to-[#967ff4]">
                            <span className="font-[var(--font-mono)] text-[50px] bg-gradient-to-b from-[#e470d9] to-[#967ff4] bg-clip-text">
                                $POKT
                            </span>
                        </span>
                    </div>
                    <span className="font-[var(--font-sans)] text-[18px] mt-[35px] leading-[1.83] text-[var(--color-white-3)] text-center">
                      Effortlessly stake your tokens across multiple providers using Igniter. Ignite your potential and make your tokens work for you.
                    </span>
                </div>
            </div>
        </div>
    );
}
