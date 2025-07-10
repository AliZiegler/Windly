import Image from "next/image"
import { signOut } from "@/auth"

export default async function SignOut() {
    return (
        <span>
            <form
                action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" })
                }}
            >
                <button type="submit" className="cursor-pointer h-8 w-32 bg-red-500 rounded-md flex items-center gap-2 pl-1">
                    <Image
                        src="/images/logoutIcon.webp"
                        alt="login icon"
                        width={30}
                        height={30}
                        className="cursor-pointer"
                    />
                    <b>Sign Out</b>
                </button>
            </form>

        </span>
    )
}
