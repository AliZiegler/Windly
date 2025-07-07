import { auth } from "@/auth";
import { Suspense } from "react";
import FilterSkeleton from "@/app/components/global/FilterSkeleton";
import SignIn from "@/app/components/auth/signIn";
import WindlyLogo from "@/app/components/global/navbar/WindlyLogo.tsx";
import Search from "@/app/components/global/navbar/Search.tsx";
export default async function Navbar() {
    const session = await auth();
    console.log(session);
    return (
        <nav className="flex justify-evenly items-center w-full h-[80px] bg-[#393E46]">
            <WindlyLogo />
            <Suspense fallback={<FilterSkeleton />}>
                <Search />
            </Suspense>
            <SignIn />
        </nav>
    );
}
