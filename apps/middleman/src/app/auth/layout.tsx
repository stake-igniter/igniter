
import "@/app/globals.css";
import {SessionProvider} from "next-auth/react";
import {Jost, Overpass_Mono} from "next/font/google";
import {auth} from "@/auth";
import {WalletConnectionProvider} from "@igniter/ui/context/WalletConnection/index";

const jost = Jost({
  variable: "--font-jost",
  weight: ["400", "600", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const overpass_mono = Overpass_Mono({
  variable: "--font-overpass-mono",
  weight: ["400", "600", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

export default async function AuthLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
   const session = await auth();

   return (
     <html
       lang="en"
       className={`${overpass_mono.variable} ${jost.variable} overflow-hidden`}
       suppressHydrationWarning
     >
     <body>
     <SessionProvider>
       <WalletConnectionProvider
         expectedIdentity={session?.user?.identity}
       >
        <div className="flex flex-col items-center justify-center w-full h-screen">
          {children}
        </div>
       </WalletConnectionProvider>
       </SessionProvider>
     </body>
    </html>
   );
}
