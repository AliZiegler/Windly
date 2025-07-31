import { Suspense } from "react";
import FilterSkeleton from "@/app/components/global/FilterSkeleton";
import SignIn from "@/app/components/global/navbar/SignIn";
import WindlyLogo from "@/app/components/global/navbar/WindlyLogo.tsx";
import Search from "@/app/components/global/navbar/Search.tsx";
import CartIcon from "@/app/components/global/navbar/CartIcon.tsx";
export default async function Navbar() {
    return (
        <nav className="flex justify-evenly items-center w-full h-[80px] bg-[#393E46]">
            <WindlyLogo />
            <Suspense fallback={<FilterSkeleton />}>
                <Search />
            </Suspense>
            <span className="flex gap-8 items-center justify-center">
                <SignIn />
                <CartIcon />
            </span>
        </nav>
    );
}
