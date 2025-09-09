"use client";
import { UserX } from "lucide-react";
import { useSetAtom } from "jotai";
import { banUserAtom } from "@/app/components/global/Jotai";

export default function UserBanShowButton({ userId, size = 20 }: { userId: string, size?: number }) {
    const setBanUserId = useSetAtom(banUserAtom);

    const onClick = () => {
        setBanUserId(userId);
    };

    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 cursor-pointer group"
            title="Ban User"
        >
            <UserX size={size} className="text-red-400 group-hover:text-red-300 transition-colors" />
        </button>
    );
}
