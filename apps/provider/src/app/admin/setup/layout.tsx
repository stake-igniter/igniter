import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import { WalletConnectionProvider } from "@igniter/ui/context/WalletConnection/index";
import { ApplicationSettingsProvider } from "@/app/context/ApplicationSettings";
import { AppTopBar } from "@igniter/ui/components/AppTopBar/index";
import CurrentUser from "@/components/CurrentUser";

export const metadata: Metadata = {
  title: "Igniter",
  description: "Light up your earnings with Igniter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
              <CurrentUser />
            </AppTopBar>
            <div className="flex flex-1">
              <div className={"w-full h-full flex overflow-x-hidden"}>
                <div className="flex flex-col w-full gap-6">{children}</div>
              </div>
            </div>
          </WalletConnectionProvider>
        </ApplicationSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
