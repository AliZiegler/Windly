import AccountSideBar from "@/app/components/account/AccountSideBar.tsx";
import { auth } from "@/auth";
import AutoSignIn from "@/app/components/global/AutoSignIn";
import AccontLinks from "@/app/components/account/AccountLinks";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) {
        return <AutoSignIn />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-10 my-20 m-7">
            <span className="hidden lg:block">
                <AccountSideBar />
            </span>
            <span className="lg:hidden self-center">
                <AccontLinks />
            </span>
            {children}
        </div>
    );
}
