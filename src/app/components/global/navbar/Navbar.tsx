import SignIn from "@/app/components/global/navbar/SignIn";
import WindlyLogo from "@/app/components/global/navbar/WindlyLogo.tsx";
import Search from "@/app/components/global/navbar/Search.tsx";
import CartIcon from "@/app/components/global/navbar/CartIcon.tsx";

export default function Navbar() {
    return (
        <nav className="w-full bg-[#393E46]">
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-evenly items-center w-full h-[80px]">
                <WindlyLogo />
                <Search />
                <span className="flex gap-8 items-center justify-center">
                    <SignIn />
                    <CartIcon />
                </span>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                <div className="flex justify-between items-center px-4 py-3 h-[70px]">
                    <WindlyLogo />
                    <span className="flex gap-4 items-center">
                        <SignIn />
                        <CartIcon />
                    </span>
                </div>
                <div className="px-4 pb-3 mt-2">
                    <Search className="w-full" />
                </div>
            </div>
        </nav>
    );
}
