export const runtime = 'edge';
import { auth } from "@/auth"
import Image from "next/image"
import SignOut from "@/app/components/global/SignOut"
import AutoSignIn from "@/app/components/global/AutoSignIn"
export default async function page() {
    const session = await auth();
    if (!session?.user) {
        return <AutoSignIn />;
    }
    return (
        <div className="w-5xl h-[550px] bg-none  ml-auto mr-auto my-20 flex flex-col gap-5">
            <h1 className="text-2xl">Account Information</h1>
            <ul className="bg-[#393e46] border-2 border-[#1e232b]">
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <Image src={session.user.image!} alt="Profile Picture" width={100} height={100} className="rounded-full p-2.5" />
                    <h2 className="text-xl font-bold p-2.5">Profile Picture</h2>
                </li>
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <span className="flex flex-col m-2.5">
                        <h2 className="text-lg font-light">Name</h2>
                        <p className="text-[#FCECDD] font-bold">{session.user.name}</p>
                    </span>
                </li>
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <span className="flex flex-col m-2.5">
                        <h2 className="text-lg font-light">Email</h2>
                        <p className="text-[#FCECDD] font-bold">{session.user.email}</p>
                    </span>
                </li>
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <span className="flex flex-col m-2.5">
                        <h2 className="text-lg font-light">Phone Number</h2>
                        <p className="text-[#FCECDD] font-bold">-</p>
                    </span>
                </li>
                <li className="flex items-center gap-3 w-full h-auto border border-[#1e232b]">
                    <span className="flex flex-col m-2.5">
                        <h2 className="text-lg font-light">Gender</h2>
                        <p className="text-[#FCECDD] font-bold">-</p>
                    </span>
                </li>
            </ul>
            <SignOut />
        </div>
    );
}
