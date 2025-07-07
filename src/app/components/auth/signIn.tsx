import Image from "next/image"
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
                <Image
                    src={session.user.image || "/images/placeholder.png"}
                    alt="user avatar"
                    width={70}
                    height={70}
                    className="cursor-pointer"
                />
            )}
        </span>
    )
}
