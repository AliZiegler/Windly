import { auth } from "@/auth";
import { reviewTable, productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { reverseUrlString } from "@/app/components/global/Atoms";
import ReviewDetails from "@/app/components/account/ReviewDetails";
import ReviewEdit from "@/app/components/account/ReviewEdit";

type PageProps = {
    params: Promise<{ name: string }>,
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ params, searchParams }: PageProps) {
    const { name } = await params;
    const isEdit = (await searchParams).edit === "true";
    const productName = reverseUrlString(name);
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Not logged in</div>;
    }

    const userId = session.user.id;

    const rawReviews = await db.select({
        id: reviewTable.id,
        rating: reviewTable.rating,
        review: reviewTable.review,
        createdAt: reviewTable.createdAt,
        updatedAt: reviewTable.updatedAt,
        description: productTable.description
    }).from(reviewTable)
        .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
        .where(and(eq(reviewTable.userId, session.user.id), eq(productTable.name, productName)));

    if (rawReviews.length === 0) {
        return <div>No review found</div>;
    }

    const rawReview = rawReviews[0];

    const fReview = {
        id: rawReview.id,
        rating: rawReview.rating,
        review: rawReview.review,
        createdAt: new Date(rawReview.createdAt),
        updatedAt: new Date(rawReview.updatedAt),
        description: rawReview.description
    };

    if (isEdit) {
        return (
            <ReviewEdit
                productName={productName}
                name={name}
                fReview={fReview}
                userId={userId}
            />
        );
    }

    return (
        <ReviewDetails
            productName={productName}
            name={name}
            fReview={fReview}
        />
    );
}
