import { auth } from "@/auth";
import Link from "next/link";
import AutoSignIn from "@/app/components/global/AutoSignIn";
export default async function CartIcon({ itemCount = 0 }) {
    const session = await auth();
    if (!session?.user?.id) {
        return <AutoSignIn />;
    }
    return (
        <Link href="/cart" prefetch>
            <div className="flex items-center justify-center relative cursor-pointer">
                <div className="w-14 h-14 flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        width="32"
                        height="32"
                        className="text-white"
                    >
                        <g id="cart">
                            <path
                                fill="currentColor"
                                d="M29.46 10.14A2.94 2.94 0 0 0 27.1 9H10.22L8.76 6.35A2.67 2.67 0 0 0 6.41 5H3a1 1 0 0 0 0 2h3.41a.68.68 0 0 1 .6.31l1.65 3 .86 9.32a3.84 3.84 0 0 0 4 3.38h10.37a3.92 3.92 0 0 0 3.85-2.78l2.17-7.82a2.58 2.58 0 0 0-.45-2.27zM28 11.86l-2.17 7.83A1.93 1.93 0 0 1 23.89 21H13.48a1.89 1.89 0 0 1-2-1.56L10.73 11H27.1a1 1 0 0 1 .77.35.59.59 0 0 1 .13.51z"
                            />
                            <circle fill="currentColor" cx="14" cy="26" r="2" />
                            <circle fill="currentColor" cx="24" cy="26" r="2" />
                        </g>
                    </svg>
                </div>
                {itemCount > 0 && (
                    <div className="absolute -top-0 -right-1 rounded-full bg-[#ffb100] w-6 h-6 flex items-center justify-center text-white text-sm font-medium">
                        {itemCount > 99 ? '99+' : itemCount}
                    </div>
                )}
            </div>
        </Link>
    );
}
