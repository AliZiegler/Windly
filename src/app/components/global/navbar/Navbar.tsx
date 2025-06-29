import { Suspense } from "react";
import FilterSkeleton from "@/app/components/global/FilterSkeleton";
import Image from "next/image";
import WindlyLogo from "@/app/components/global/navbar/WindlyLogo.tsx";
import Search from "@/app/components/global/navbar/Search.tsx";
export default function Navbar() {
    return (
        <nav className="flex justify-evenly items-center w-full h-[80px] bg-[#393E46]">
            <WindlyLogo />
            <Suspense fallback={<FilterSkeleton />}>
                <Search />
            </Suspense>
            <Image
                src="/images/loginIcon.png"
                alt="login icon"
                width="70"
                height="70"
                className="cursor-pointer"
            />
        </nav>
    );
}
