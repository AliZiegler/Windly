import UserAccountInformation from "@/app/components/admin/users/UserAccountInformation";
type Props = {
    params: Promise<{ id: string }>;
}
export default async function ViewUser({ params }: Props) {
    const { id } = await params
    return (
        <div className="w-full">
            <UserAccountInformation id={id} />
        </div>
    );
}
