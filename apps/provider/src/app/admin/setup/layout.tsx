import type {Metadata} from "next";
import {SessionProvider} from "next-auth/react";
import "@/app/globals.css";
import {ThemeProvider} from "@/app/theme";
import { WalletConnectionProvider } from '@/app/context/WalletConnectionProvider'
import {ApplicationSettingsProvider} from "@/app/context/ApplicationSettings";
import {AppTopBar} from "@igniter/ui/components/AppTopBar/index";
import CurrentUser from "@/components/CurrentUser";
import QueryClientProvider from "@/app/context/QueryClientProvider";
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: "Igniter",
  description: "Light up your earnings with Igniter",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <QueryClientProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ApplicationSettingsProvider>
            <WalletConnectionProvider
              protocol={'shannon'}
              expectedIdentity={session?.user?.identity}
            >
              <AppTopBar>
                <CurrentUser/>
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
    </QueryClientProvider>
  );
}
