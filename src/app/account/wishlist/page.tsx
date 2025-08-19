import { auth } from "@/auth";
import { db } from "@/lib/db";
import { productTable, wishlistTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { urlString } from "@/app/components/global/Atoms";
import Image from "next/image";
import Link from "next/link";
import HeartButton from "@/app/components/global/Heart";
import { Heart } from "lucide-react";

export default async function Page() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-semibold text-gray-200 mb-4">Authentication Required</h2>
                    <p className="text-gray-400">Please sign in to view your wishlist</p>
                </div>
            </div>
        );
    }

    const wishlistItems = await db
        .select({
            productId: wishlistTable.productId,
            productName: productTable.name,
        })
        .from(wishlistTable)
        .innerJoin(productTable, eq(wishlistTable.productId, productTable.id))
        .where(eq(wishlistTable.userId, session.user.id));

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-8">My Wishlist</h1>
                    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-center">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-400 max-w-md">Start adding products you love to see them here</p>
                    </div>
                </div>
            </div>
        );
    }

    const DisplayProducts = wishlistItems.map((item) => (
        <div
            key={item.productId}
            className="group relative bg-gradient-to-br from-[#2d3440] to-[#252a35] border border-gray-600/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30"
        >
            <div className="absolute top-4 right-4 z-10">
                <div className="p-2 bg-black/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-black/40">
                    <HeartButton productId={item.productId} isWishlisted={true} size={20} />
                </div>
            </div>

            <Link href={`/${urlString(item.productName)}`} className="block mb-4">
                <div className="relative aspect-square w-full bg-gray-800/50 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300">
                    <Image
                        src="/images/placeholder.png"
                        alt={item.productName}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            </Link>

            <Link
                href={`/${urlString(item.productName)}`}
                className="block text-base sm:text-lg font-medium text-gray-200 hover:text-[#00CAFF] transition-colors duration-200 line-clamp-2"
            >
                {item.productName}
            </Link>
        </div>
    ));

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">My Wishlist</h1>
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full">
                        <span className="text-sm text-blue-300 font-medium">
                            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                    {DisplayProducts}
                </div>
            </div>
        </div>
    );
}
