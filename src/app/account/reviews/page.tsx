export const runtime = 'edge';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { reviewTable, productTable } from '@/db/schema';
import Link from 'next/link';
import { urlString } from '@/app/components/global/Atoms';
import Stars from '@/app/components/global/ReactStars';


const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
});

export default async function Reviews() {
    const session = await auth();
    if (!session?.user?.id) {
        return <div>Not logged in</div>;
    }

    const reviews = await db
        .select({
            id: reviewTable.id,
            productId: reviewTable.productId,
            rating: reviewTable.rating,
            reviewText: reviewTable.review,
            createdAt: reviewTable.createdAt,
            productName: productTable.name,
        })
        .from(reviewTable)
        .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
        .where(eq(reviewTable.userId, session.user.id));

    if (reviews.length === 0) {
        return <h1 className="font-bold text-xl">My Reviews</h1>;
    }
    const displayReviews = reviews.map(({ id, createdAt, productName, rating, reviewText }) => {
        const formattedDate = dateFormatter.format(new Date(createdAt));
        const trimmedReview =
            reviewText.length > 50 ? reviewText.slice(0, 47) + '...' : reviewText;

        return (
            <tr key={id} className="odd:bg-[#1c2129] even:bg-[#222831]">
                <td className="p-2 align-top">{formattedDate}</td>
                <td className="p-2 align-top">
                    <Link href={`/${urlString(productName)}`} className='hover:text-[#00CAFF] duration-200'>{productName}</Link>
                </td>
                <td className="p-2 align-top">
                    <Stars value={rating} edit={false} count={5} size={25} />
                </td>
                <td className="p-2 align-top">{trimmedReview}</td>
                <td className="p-2 align-top">
                    <Link href={`/account/reviews/${urlString(productName)}`}>View Details</Link>
                </td>
            </tr>
        );
    })

    return (
        <div className="flex flex-col w-full pr-4 gap-3">
            <h1 className="font-bold text-xl">My Reviews</h1>
            <table className="min-w-full text-left">
                <thead className="bg-[#1e232b] h-10 border-y-2 border-[#1c2129]">
                    <tr>
                        <th className="w-[15%] p-2">Date</th>
                        <th className="w-1/2 p-2">Product Name</th>
                        <th className="p-2 w-[10%]">Rating</th>
                        <th className="p-2 w-[15%]">Review</th>
                        <th className="p-2 w-[10%]">Action</th>
                    </tr>
                </thead>
                <tbody className="border-b-2 border-[#1c2129]">
                    {...displayReviews}
                </tbody>
            </table>
        </div>
    );
}
