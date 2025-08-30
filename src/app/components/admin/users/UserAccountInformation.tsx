import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { userTable } from "@/db/schema";
import Image from "next/image"
import { makeAdmin } from "@/app/actions/AdminActions";
import { Shield } from "lucide-react";
import ReadOnlyUserField from "@/app/components/account/ReadOnlyUserField"
import SignOut from "@/app/components/global/SignOut"

export default async function AccountInformation({ id }: { id: string }) {
    const [user] = await db.select({
        name: userTable.name,
        image: userTable.image,
        email: userTable.email,
        phone: userTable.phone,
        birthday: userTable.birthday,
        gender: userTable.gender
    }).from(userTable).where(eq(userTable.id, id));

    return (
        <div className="w-full max-w-7xl mx-auto min-w-[300px] bg-none flex flex-col gap-6 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FCECDD]">Account Information</h1>

            <div className="bg-[#393e46] border-2 border-[#1e232b] rounded-lg overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full p-4 border-b border-[#1e232b]">
                    <Image
                        src={user.image || "/images/placeholder.png"}
                        alt="Profile Picture"
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-[#FCECDD]">Profile Picture</h2>
                    </div>
                </div>

                {/* Name */}
                <ReadOnlyUserField
                    label="Name"
                    field="name"
                    value={user.name}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 
                    border-b border-[#1e232b] hover:bg-[#404752] transition-colors"
                />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b border-[#1e232b]">
                    <div>
                        <h2 className="text-lg font-light text-[#FCECDD]">Email</h2>
                        <p className="text-[#FCECDD] font-bold">{user.email}</p>
                    </div>
                </div>

                <ReadOnlyUserField
                    label="Phone Number"
                    field="phone"
                    value={user.phone}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b border-[#1e232b] 
                    hover:bg-[#404752] transition-colors"
                />

                <ReadOnlyUserField
                    label="Date of Birth"
                    field="birthday"
                    value={user.birthday}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b border-[#1e232b] 
                    hover:bg-[#404752] transition-colors"
                />

                <ReadOnlyUserField
                    label="Gender"
                    field="gender"
                    value={user.gender}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 hover:bg-[#404752] transition-colors"
                />
            </div>

            <div className="mt-4 flex gap-3">
                <SignOut />
                <span>
                    <form
                        action={async () => {
                            "use server"
                            await makeAdmin(id)
                            redirect("/admin/users")
                        }}
                    >
                        <button
                            type="submit"
                            className="cursor-pointer h-8 max-w-52 bg-blue-500 hover:bg-blue-600 duration-200 rounded-md flex items-center gap-2 p-2">
                            <Shield size={25} color="black" />
                            <b>Make {user.name} Admin</b>
                        </button>
                    </form>

                </span>
            </div>
        </div>
    );
}
