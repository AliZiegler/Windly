import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/global/ReactStars";
import { SquarePen } from "lucide-react";

type ReviewDetailsProps = {
    productName: string;
    name: string;
    fReview: {
        id: number;
        userName: string;
        rating: number;
        review: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    };
    isAdmin?: boolean;
};

export default function ReviewDetails({ productName, name, fReview, isAdmin }: ReviewDetailsProps) {
    const { rating, review, createdAt, updatedAt, description, userName } = fReview;

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const formattedDate = formatDate(createdAt);
    const formattedUpdateDate = formatDate(updatedAt);
    const isUpdated = createdAt.getTime() !== updatedAt.getTime();

    return (
        <div className="w-full mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="font-bold text-2xl sm:text-3xl text-white">Review Details</h1>
            </div>

            <div className="bg-midnight border-2 border-navbar rounded-lg overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <Link
                                href={`/${name}`}
                                className="block group overflow-hidden rounded-lg bg-white/5 aspect-square w-full max-w-[300px] mx-auto lg:mx-0 lg:w-[300px]"
                            >
                                <Image
                                    src="/images/placeholder.png"
                                    width={300}
                                    height={300}
                                    alt={`${productName} product image`}
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-4"
                                />
                            </Link>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            <div>
                                <Link
                                    href={`/${name}`}
                                    className="group block"
                                >
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 
                                        group-hover:text-[#00CAFF] transition-colors duration-200 line-clamp-2">
                                        {productName}
                                    </h2>
                                </Link>
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-3">
                                    {description}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                                <span className="text-lg sm:text-xl font-medium text-white">
                                    {isAdmin ? `${userName}'s` : "Your"} Rating:
                                </span>
                                <div className="flex items-center">
                                    <Stars value={rating} edit={false} count={5} size={28} />
                                    <span className="ml-2 text-lg font-medium text-[#00CAFF]">
                                        {rating}/5
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-navbar"></div>

                {/* Review Section */}
                <div className="p-4 sm:p-6">
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{isAdmin ? `${userName}'s` : "Your"} Review</h3>
                            <div className="text-sm text-gray-400">
                                <span>Submitted on {formattedDate}</span>
                                {isUpdated && (
                                    <span className="block sm:inline sm:ml-2 sm:before:content-['•'] sm:before:mx-2">
                                        Updated on {formattedUpdateDate}
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isAdmin && (
                            <Link
                                href="?edit=true"
                                className="inline-flex items-center justify-center bg-[#ffb100] hover:bg-[#e09d00] text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffb100] focus:ring-offset-2 focus:ring-offset-[#393e46] active:scale-95"
                            >
                                <SquarePen className="w-4 h-4 mr-2" />
                                Edit Review
                            </Link>
                        )}
                    </div>

                    {/* Review Content */}
                    <div className="bg-[#2a2f38] border border-navbar rounded-lg p-4 sm:p-5">
                        <div className="text-base sm:text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
                            {review}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
