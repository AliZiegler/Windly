import Image from "next/image"
import Link from "next/link"
import { signIn, auth } from "@/auth"

export default async function SignIn() {
    const session = await auth()

    return (
        <span>
            {!session?.user ? (
                <form
                    action={async () => {
                        "use server"
                        await signIn("google")
                    }}
                >
                    <button type="submit">
                        <Image
                            src="/images/loginIcon.png"
                            alt="login icon"
                            width={70}
                            height={70}
                            className="cursor-pointer"
                        />
                    </button>
                </form>
            ) : (
                <Link href="/account">
                    <Image
                        src={session.user.image || "/images/placeholder.png"}
                        alt="user avatar"
                        width={65}
                        height={65}
                        className="cursor-pointer rounded-full"
                    />
                </Link>
            )}
        </span>
    )
}
