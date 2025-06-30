import "@/app/globals.css";
import { Suspense } from "react";
import { Ubuntu } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/app/components/global/navbar/Navbar";
import Sidebar from "@/app/components/home/sidebar/Sidebar";

export const metadata: Metadata = {
    title: "Windly",
    description: "A shop created using Next.js!",
};

const ubuntu = Ubuntu({ weight: "400", subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${ubuntu.className} h-full`}
            suppressHydrationWarning
        >
            <body className="h-screen flex flex-col bg-[#222831] text-[#FCECDD]">
                <Navbar />
                <div className="flex">
                    <Suspense fallback={<div className="w-[260px] p-5">Loading filters…</div>}>
                        <Sidebar />
                    </Suspense>
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
