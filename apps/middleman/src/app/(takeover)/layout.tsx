import "@/app/globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/theme";
import {WalletConnectionProvider} from "@igniter/ui/context/WalletConnection/index";
import {ApplicationSettingsProvider} from "@/app/context/ApplicationSettings";
import {AppTopBar} from "@igniter/ui/components/AppTopBar/index";
import CurrentUser from "@/app/components/CurrentUser";
import {jost, overpass_mono} from "@/styles/layout";
import PriceWidget from "@/app/components/PriceWidget";
import CurrencySelector from "@igniter/ui/components/AppTopBar/CurrencySelector";

export default function TakeOverLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${overpass_mono.variable} ${jost.variable} overflow-hidden`}
      suppressHydrationWarning
    >
    <body>
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ApplicationSettingsProvider>
          <WalletConnectionProvider>
            <AppTopBar>
              <PriceWidget />
              <CurrencySelector />
              <CurrentUser />
            </AppTopBar>
            <div className="flex flex-1">
              <div className={"w-full h-full flex"}>
                <div className="flex flex-col w-full gap-6 h-screen overflow-y-scroll">
                  {children}
                </div>
              </div>
            </div>
          </WalletConnectionProvider>
        </ApplicationSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
    </body>
    </html>
  );
}
