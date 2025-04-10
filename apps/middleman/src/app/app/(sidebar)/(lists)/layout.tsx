export default function ListLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-30 py-10">{children}</div>
    </div>
  );
}
