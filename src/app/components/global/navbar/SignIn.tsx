import Image from "next/image";
import Link from "next/link";
import { signIn, auth } from "@/auth";

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
                    <button type="submit" className="transition-transform hover:scale-105">
                        <div className={`${sizeClasses} relative`}>
                            <Image
                                src="/images/loginIcon.png"
                                alt="login icon"
                                fill
                                className="object-contain cursor-pointer"
                            />
                        </div>
                    </button>
                </form>
            ) : (
                <Link href="/account" className="inline-block transition-transform hover:scale-105">
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
