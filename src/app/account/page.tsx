import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { userTable } from "@/db/schema";
import { setUserRole } from "@/app/actions/UserActions";
import Image from "next/image"
import EditableUserField from "@/app/components/account/EditableUserField"
import SignOut from "@/app/components/global/SignOut"
import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";
import { redirect } from "next/navigation";
async function handleMakeSeller() {
    "use server";
    await setUserRole("seller");
    redirect("/account")
}
async function handleMakeUser() {
    "use server";
    await setUserRole("user");
    redirect("/account")
}

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
        <div className="w-full max-w-[1400px] mx-auto min-w-[300px] bg-none flex flex-col gap-6 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FCECDD]">Account Information</h1>

            <div className="bg-midnight border-1 border-gray-600 rounded-lg overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full p-4 border-b border-gray-600">
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
                    border-gray-600 hover:bg-[#404752] transition-colors"
                />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 border-b border-gray-600">
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
                   border-gray-600 hover:bg-[#404752] transition-colors"
                />

                <EditableUserField
                    label="Date of Birth"
                    field="birthday"
                    value={user.birthday}
                    inputType="date"
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 
                   border-b border-gray-600 hover:bg-[#404752] transition-colors"
                />

                <EditableUserField
                    label="Gender"
                    field="gender"
                    value={user.gender}
                    options={['Male', 'Female']}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 
                   border-b border-gray-600 hover:bg-gray-400 transition-colors"
                />

                <EditableUserField
                    label="Role"
                    field="role"
                    value={user.role}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full p-4 hover:bg-[#404752] transition-colors"
                    showEditButton={user.role !== "admin"}
                />
            </div>

            <div className="mt-4 flex gap-3 items-center">
                <SignOut />
                {user.role !== "admin" &&
                    <form action={user.role === "user" ? handleMakeSeller : handleMakeUser}>
                        <Button className="cursor-pointer text-md text-black font-bold h-8 w-32 bg-golden hover:bg-golden/80 duration-200 
                        rounded-md flex items-center">
                            {user.role === "user" ? <ShoppingBag color="black" /> : <User color="black" />}
                            {user.role === "user" ? "Make Seller" : "Make User"}
                        </Button>
                    </form>
                }
            </div>
        </div>
    );
}
