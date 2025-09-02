import { userExists } from "@/app/actions/AdminActions";
import UserAccountInformation from "@/app/components/admin/users/UserAccountInformation";
import { notFound } from "next/navigation";
type Props = {
    params: Promise<{ id: string }>;
}
export default async function ViewUser({ params }: Props) {
    const { id } = await params
    const isAUser = await userExists(id)
    if (!isAUser) {
        notFound()
    }
    return (
        <div className="w-full">
            <UserAccountInformation id={id} />
        </div>
    );
}
