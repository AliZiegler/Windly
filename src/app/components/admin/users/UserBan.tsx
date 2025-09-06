"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { banUser } from "@/app/actions/AdminActions";
import { banUserAtom } from "@/app/components/global/Jotai";
import { useAtom } from "jotai";
import { CircleAlert, X, Shield, Clock, AlertTriangle } from "lucide-react";

export default function BanUserPopup() {
    const [banUserId, setBanUserId] = useAtom(banUserAtom);
    const isOpen = !!banUserId;
    const onClose = () => setBanUserId(null);

    const router = useRouter();
    const [reason, setReason] = useState("");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setReason("");
        setExpiresAt(null);
        setError(null);
        onClose();
    };

    if (!isOpen || !banUserId) return null;

    async function handleBan(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!banUserId) {
                setError("Cannot ban user: User ID is missing.");
                return;
            }
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="relative bg-gradient-to-br from-[#1a1f28] to-[#22272f] border border-red-500/20 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-red-500/20 to-red-600/20 border-b border-red-500/30 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-xl">
                                <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Ban User</h2>
                                <p className="text-sm text-red-300/80">This action requires careful consideration</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleBan} className="p-6 space-y-6">
                    {/* Warning Banner */}
                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="text-amber-300 font-medium">Warning</p>
                            <p className="text-amber-200/80">This will restrict the user&apos;s access to the platform.</p>
                        </div>
                    </div>

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
                            className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-gray-300 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-red-500/50 hover:shadow-lg hover:shadow-red-500/25"}
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
