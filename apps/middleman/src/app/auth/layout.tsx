export default function AuthLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
   return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      {children}
    </div>
   );
}
