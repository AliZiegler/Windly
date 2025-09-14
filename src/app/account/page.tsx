import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { userTable } from "@/db/schema";
import Image from "next/image"
import EditableUserField from "@/app/components/account/EditableUserField"
import SignOut from "@/app/components/global/SignOut"

export default async function Page() {
    const session = await auth();
    if (!session?.user?.id) {
        return <div>Unauthorized</div>;
    }
    const [user] = await db.select({
        name: userTable.name,
        image: userTable.image,
        email: userTable.email,
        phone: userTable.phone,
        birthday: userTable.birthday,
        gender: userTable.gender,
        role: userTable.role
    }).from(userTable).where(eq(userTable.id, session.user.id));

    return (
        <div className="w-full max-w-7xl mx-auto min-w-[300px] bg-none flex flex-col gap-6 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FCECDD]">Account Information</h1>

            <div className="bg-midnight border-2 border-[#393e46] rounded-lg overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full p-4 border-b border-[#393e46]">
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

                <EditableUserField
                    label="Name"
                    field="name"
                    value={user.name}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b 
                    border-[#393e46] hover:bg-[#404752] transition-colors"
                />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b border-[#393e46]">
                    <div>
                        <h2 className="text-lg font-light text-[#FCECDD]">Email</h2>
                        <p className="text-[#FCECDD] font-bold">{user.email}</p>
                    </div>
                </div>

                <EditableUserField
                    label="Phone Number"
                    field="phone"
                    value={user.phone}
                    inputType="tel"
                    placeholder="Enter phone number"
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b 
                   border-[#393e46] hover:bg-[#404752] transition-colors"
                />

                <EditableUserField
                    label="Date of Birth"
                    field="birthday"
                    value={user.birthday}
                    inputType="date"
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 
                   border-b border-[#393e46] hover:bg-[#404752] transition-colors"
                />

                <EditableUserField
                    label="Gender"
                    field="gender"
                    value={user.gender}
                    options={['Male', 'Female']}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 
                   border-b border-[#393e46] hover:bg-[#404752] transition-colors"
                />

                <EditableUserField
                    label="Role"
                    field="role"
                    value={user.role}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 hover:bg-[#404752] transition-colors"
                    showEditButton={user.role !== "admin"}
                />
            </div>

            <div className="mt-4">
                <SignOut />
            </div>
        </div>
    );
}
