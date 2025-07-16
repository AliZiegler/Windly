import { Suspense } from "react";
import Sidebar from "@/app/components/home/sidebar/Sidebar";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex flex-col bg-[#222831] text-[#FCECDD]">
            <div className="flex">
                <Suspense fallback={<div className="w-[260px] p-5">Loading filters…</div>}>
                    <Sidebar />
                </Suspense>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
