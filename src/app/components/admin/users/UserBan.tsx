"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { banUserAtom } from "@/app/components/global/Jotai";
import { banUser } from "@/app/actions/AdminActions";
import { getUserById } from "@/app/actions/UserActions";
import { CircleAlert, X, Shield, Clock } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import { userTable } from "@/db/schema";
import Image from "next/image";

type User = InferSelectModel<typeof userTable>;

export default function BanUserPopup() {
    const [banUserId, setBanUserId] = useAtom(banUserAtom);
    const isOpen = !!banUserId;
    const onClose = () => setBanUserId(null);

    const router = useRouter();
    const [reason, setReason] = useState("");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(false);

    const handleClose = () => {
        setReason("");
        setExpiresAt(null);
        setError(null);
        setUser(null);
        onClose();
    };

    useEffect(() => {
        if (banUserId) {
            setUserLoading(true);
            getUserById(banUserId)
                .then((u) => setUser(u))
                .catch(() => setError("Failed to fetch user info"))
                .finally(() => setUserLoading(false));
        }
    }, [banUserId]);

    if (!isOpen || !banUserId) return null;

    async function handleBan(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!banUserId) return;
            const res = await banUser(banUserId, reason, expiresAt || null);
            if (!res.success) {
                setError(res.error || "Failed to ban user");
            } else {
                handleClose();
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="relative bg-midnight border border-red-500/20 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="relative bg-red-500/20 border-b border-red-500/30 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-xl">
                                <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Ban User</h2>
                                <p className="text-sm text-red-300/80">
                                    This action requires careful consideration
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200 cursor-pointer"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleBan} className="p-6 space-y-6">
                    {userLoading ? (
                        <p className="text-sm text-gray-400">Loading user...</p>
                    ) : user ? (
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-gray-700/40">
                            {user.image && (
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                            <CircleAlert className="w-4 h-4 text-red-400" />
                            Ban Reason *
                        </label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-24 px-4 py-3 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50 transition-all"
                            placeholder="Enter detailed reason for the ban..."
                        />
                    </div>

                    {/* Expiration Date Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                            <Clock className="w-4 h-4 text-blue-400" />
                            Expiration Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={expiresAt || ""}
                            onChange={(e) => setExpiresAt(e.target.value || null)}
                            className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>💡</span>
                            Leave empty for a permanent ban
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <CircleAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <div>
                                    <p className="text-red-300 font-medium text-sm">Error occurred</p>
                                    <p className="text-red-200/80 text-xs">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-gray-300 
                            rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason.trim()}
                            className={`
                flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${loading || !reason.trim()
                                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600/50"
                                    :
                                    "bg-red-500 text-white hover:bg-red-600 border border-red-500/50 cursor-pointer hover:shadow-lg hover:shadow-red-500/25"
                                }
              `}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Banning...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Ban User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
