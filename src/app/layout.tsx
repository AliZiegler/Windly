import "@/app/globals.css";
import Navbar from "@/app/components/global/navbar/Navbar";
import { Ubuntu } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Windly",
    description: "A shop created using Next.js!",
};
const ubuntu = Ubuntu({ weight: "400", subsets: ["latin"] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${ubuntu.className} h-full`} suppressHydrationWarning>
            <body className="h-screen bg-[#222831] text-[#FCECDD]">
                <Navbar />
                {children}
            </body>
        </html>
    );
}
