import { Analytics } from "@vercel/analytics/next"
import "@/app/globals.css";
import Navbar from "@/app/components/global/navbar/Navbar";
import { Ubuntu } from "next/font/google";
import { isCallerBanned } from "@/app/actions/AdminActions";
import type { Metadata } from "next";
import BanCountdown from "@/app/components/global/BanCountDown";
import SignOut from "@/app/components/global/SignOut";

export const metadata: Metadata = {
    title: "Windly",
    description: "A shop created using Next.js!",
};

const ubuntu = Ubuntu({ weight: "400", subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const banStatus = await isCallerBanned();
    return (
        <html lang="en" className={`${ubuntu.className} h-full`} suppressHydrationWarning>
            <body className="h-screen bg-[#222831] text-[#FCECDD]">
                <Navbar />
                {banStatus.banned ?
                    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                        <h1 className="text-2xl font-bold text-red-500 text-center">You are banned</h1>
                        {'reason' in banStatus && (
                            <h2 className="text-xl font-semibold text-red-400 text-center">{banStatus.reason}</h2>
                        )}
                        {'expiresAt' in banStatus && banStatus.expiresAt && (
                            <>
                                <h3 className="text-lg text-red-300 text-center">
                                    Expires: {new Date(banStatus.expiresAt).toLocaleDateString()}
                                </h3>
                                <BanCountdown expiresAt={banStatus.expiresAt} />
                            </>
                        )}
                        <SignOut />
                    </div>
                    :
                    children
                }
                <Analytics />
            </body>
        </html>
    );
}
