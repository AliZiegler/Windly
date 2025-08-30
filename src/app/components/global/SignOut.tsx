import { signOut } from "@/auth"
import { LogOut } from "lucide-react"

export default async function SignOut({ className }: { className?: string }) {
    return (
        <span>
            <form
                action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" })
                }}
            >
                <button
                    type="submit"
                    className={className || "cursor-pointer h-8 w-32 bg-red-500 hover:bg-red-600 duration-200 rounded-md flex items-center gap-2 pl-1"}>
                    <LogOut size={25} color="black" />
                    <b>Sign Out</b>
                </button>
            </form>

        </span>
    )
}
