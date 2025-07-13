import "@/app/globals.css";
import { Ubuntu } from "next/font/google";
import type { Metadata } from "next";
import AccountSideBar from "@/app/components/account/AccountSideBar.tsx";

export const metadata: Metadata = {
    title: "Windly",
    description: "A shop created using Next.js!",
};
const ubuntu = Ubuntu({ weight: "400", subsets: ["latin"] });
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${ubuntu.className} h-full`} suppressHydrationWarning>
            <body className="h-screen bg-[#222831] text-[#FCECDD]">
                <div className="flex gap-10 my-20 m-7">
                    <AccountSideBar />
                    {children}
                </div>
            </body>
        </html>
    );
}
