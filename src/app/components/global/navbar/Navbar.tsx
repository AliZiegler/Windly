import { Suspense } from "react";
import SignIn from "@/app/components/global/navbar/SignIn";
import WindlyLogo from "@/app/components/global/navbar/WindlyLogo.tsx";
import Search from "@/app/components/global/navbar/Search.tsx";
import CartIcon from "@/app/components/global/navbar/CartIcon.tsx";
import { getAllProductCategories } from "@/app/actions/AdminActions";

export default async function Navbar() {
    const categories = await getAllProductCategories();
    return (
        <nav className="w-full bg-[#393E46]">
            <div className="hidden md:flex justify-evenly items-center w-full h-[80px]">
                <WindlyLogo />

                <Suspense fallback={<div>Loading...</div>}>
                    <Search categories={categories} />
                </Suspense>
                <span className="flex gap-8 items-center justify-center">
                    <SignIn />
                    <CartIcon />
                </span>
            </div>

            <div className="md:hidden">
                <div className="flex justify-between items-center px-4 py-3 h-[70px]">
                    <WindlyLogo />
                    <span className="flex gap-4 items-center">
                        <SignIn />
                        <CartIcon />
                    </span>
                </div>
                <div className="px-4 pb-3 mt-2">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Search categories={categories} />
                    </Suspense>
                </div>
            </div>
        </nav>
    );
}
