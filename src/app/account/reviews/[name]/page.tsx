export const runtime = 'edge';
import Image from "next/image";
import { auth } from "@/auth";
import { reviewTable, productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { reverseUrlString } from "@/app/components/global/Atoms";
import Link from "next/link";
import Stars from "@/app/components/global/ReactStars";

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const productName = reverseUrlString(name);
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Not logged in</div>;
    }

    const reviews = await db.select({
        rating: reviewTable.rating,
        review: reviewTable.review,
        createdAt: reviewTable.createdAt,
        description: productTable.description
    }).from(reviewTable)
        .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
        .where(and(eq(reviewTable.userId, session.user.id), eq(productTable.name, productName)));

    if (reviews.length === 0) {
        return <div>No review found</div>;
    }

    const firstReview = reviews[0];
    const { rating, review, createdAt, description } = firstReview
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleString();

    return (
        <div className="w-full flex flex-col gap-3 pr-4">
            <h1 className="font-bold text-xl">Review Details</h1>
            <span className="flex flex-col gap-3 w-full border-2 bg-[#393e46] border-[#1c2129] p-5">
                <span className="flex gap-3 mb-5">
                    <Link href={`/${name}`} className="cursor-pointer">
                        <Image src="/images/placeholder.png" width={350} height={350} alt="Product Image" className="w-[473px] h-[350px]" />
                    </Link>
                    <span className="flex flex-col gap-7 w-full h-[350px] pt-10 pl-5">
                        <span>
                            <Link href={`/${name}`} className="cursor-pointer hover:text-[#00CAFF] duration-200">
                                <h2 className="text-3xl font-bold mb-0.5">{productName}</h2>
                            </Link>
                            <b className="text-md font-light text-gray-300">{description}</b>
                        </span>
                        <span className="flex gap-5">
                            <b className="text-xl font-light mt-2.5">Your Rating:</b>
                            <Stars value={rating} edit={false} count={5} size={30} />
                        </span>
                    </span>
                </span>
                <p>Your Review (submitted on {formattedDate})</p>
                <div className="text-lg font-light w-full h-auto p-3 border-1 border-[#1c2129]">{review}</div>
            </span>
        </div>
    );
}
