export const runtime = 'edge';
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { userTable } from "@/db/schema";
import Image from "next/image"
import EditableUserField from "@/app/components/account/EditableUserField"
import SignOut from "@/app/components/global/SignOut"
import AutoSignIn from "@/app/components/global/AutoSignIn"
export default async function page() {
    const session = await auth();
    if (!session?.user?.id) {
        return <AutoSignIn />;
    }
    const user = await db.select().from(userTable).where(eq(userTable.id, session.user.id)).then((user) => user[0]);
    return (
        <div className="w-5xl h-[550px] bg-none flex flex-col gap-5">
            <h1 className="text-2xl">Account Information</h1>
            <ul className="bg-[#393e46] border-2 border-[#1e232b]">
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <Image src={user.image || "/images/placeholder.png"} alt="Profile Picture" width={100} height={100} className="rounded-full p-2.5" />
                    <h2 className="text-xl font-bold p-2.5">Profile Picture</h2>
                </li>
                <EditableUserField
                    label="Name"
                    field="name"
                    value={user.name}
                    className="flex justify-start items-center gap-3 w-full h-auto border border-[#1e232b]"
                />
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <span className="flex flex-col m-2.5">
                        <h2 className="text-lg font-light">Email</h2>
                        <p className="text-[#FCECDD] font-bold">{user.email}</p>
                    </span>
                </li>
                <EditableUserField
                    label="Phone Number"
                    field="phone"
                    value={user.phone}
                    inputType="tel"
                    placeholder="Enter phone number"
                    className="flex items-center gap-3 w-full h-auto border border-[#1e232b]"
                />
                <EditableUserField
                    label="Date of Birth"
                    field="birthday"
                    value={user.birthday}
                    inputType="date"
                    className="flex items-center gap-3 w-full h-auto border border-[#1e232b]"
                />

                <EditableUserField
                    label="Gender"
                    field="gender"
                    value={user.gender}
                    options={['Male', 'Female']}
                    className="flex items-center gap-3 w-full h-auto border border-[#1e232b]"
                />
            </ul>
            <SignOut />
        </div>
    );
}
