import Header from "@/app/(landing)/components/Header";
import Footer from "@/app/(landing)/components/Footer";

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-row justify-center min-h-screen bg-(--black-1)">
            <div className="w-[958px] border-x border-(--black-dividers)">
                <Header />
                {children}
                <Footer />
            </div>
        </div>
    );
}
