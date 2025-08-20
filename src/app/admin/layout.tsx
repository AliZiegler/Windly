import { auth } from "@/auth";
import { isAdmin } from "@/app/actions/UserActions";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
export default async function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    const userId = session?.user?.id || "null";
    const isUserAdmin = await isAdmin(userId);

    if (!userId || !isUserAdmin) {
        return (
            <main className="text-center text-4xl mt-10 bg-[#222831] text-white min-h-screen">
                <h1 className="text-[100px] mb-20">🫨</h1>
                <h2 className="mb-10">Stop Right There!!</h2>
                <p>This Page Is Only Accessible To Mr. Ziegler</p>
            </main>
        );
    }
    return (
        <div className="h-screen w-full flex px-3 bg-[#222831] text-[#FCECDD]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
