import Image from "next/image";
import Link from "next/link";
import { signIn, auth } from "@/auth";
import { CircleUserRound } from "lucide-react";

export default async function SignIn() {
    const session = await auth();

    const sizeClasses = "w-16 h-16 lg:w-[70px] lg:h-[70px]";

    return (
        <span className="inline-block">
            {!session?.user ? (
                <form
                    action={async () => {
                        "use server";
                        await signIn("google");
                    }}
                >
                    <button type="submit" className="transition-transform hover:scale-105 cursor-pointer">
                        <div className={`${sizeClasses} relative`}>
                            <CircleUserRound
                                size={60}
                                strokeWidth={1}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </button>
                </form>
            ) : (
                <Link href="/account" prefetch
                    title="View your account"
                    className="inline-block transition-transform hover:scale-105 cursor-pointer">
                    <div className={`${sizeClasses} relative rounded-full overflow-hidden`}>
                        <Image
                            src={session.user.image || "/images/placeholder.png"}
                            alt="user avatar"
                            fill
                            className="object-cover"
                        />
                    </div>
                </Link>
            )}
        </span>
    );
}
