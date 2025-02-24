export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center align-center h-screen">
      <div className="m-auto flex flex-col items-center w-full p-4 rounded-lg max-w-[800] gap-6">
        {children}
      </div>
    </div>
  );
}
