import AccountSideBar from "@/app/components/account/AccountSideBar.tsx";
import { auth } from "@/auth";
import AutoSignIn from "@/app/components/global/AutoSignIn";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) {
        return <AutoSignIn />;
    }
    return (
        <div className="flex gap-10 my-20 m-7">
            <AccountSideBar />
            {children}
        </div>
    );
}
