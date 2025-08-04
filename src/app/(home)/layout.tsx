import { Suspense } from "react";
import Sidebar from "@/app/components/home/sidebar/Sidebar";
import MobileSidebar from "@/app/components/home/sidebar/MobileSidebar";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex flex-col bg-[#222831] text-[#FCECDD]">
            <span className="md:hidden">
                <Suspense fallback={<div className="w-[260px] p-5">Loading filters…</div>}>
                    <MobileSidebar />
                </Suspense>
            </span>
            <div className="flex">
                <Suspense fallback={<div className="w-[260px] p-5">Loading filters…</div>}>
                    <span className="hidden md:block">
                        <Sidebar />
                    </span>
                </Suspense>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
