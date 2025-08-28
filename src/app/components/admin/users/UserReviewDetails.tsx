import { reviewTable, productTable, userTable } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { reverseUrlString } from "@/app/components/global/Atoms";
import ReviewDetails from "@/app/components/account/ReviewDetails";

type PageProps = {
    id: string;
    name: string
}

export default async function Page({ id, name }: PageProps) {
    const productName = reverseUrlString(name);

    const [rawReview] = await db.select({
        id: reviewTable.id,
        userName: userTable.name,
        rating: reviewTable.rating,
        review: reviewTable.review,
        createdAt: reviewTable.createdAt,
        updatedAt: reviewTable.updatedAt,
        description: productTable.description
    }).from(reviewTable)
        .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
        .innerJoin(userTable, eq(reviewTable.userId, userTable.id))
        .where(and(eq(reviewTable.userId, id), eq(productTable.name, productName)));

    if (!rawReview) {
        return <div>No review found</div>;
    }
    const fReview = {
        id: rawReview.id,
        rating: rawReview.rating,
        userName: rawReview.userName,
        review: rawReview.review,
        createdAt: new Date(rawReview.createdAt),
        updatedAt: new Date(rawReview.updatedAt),
        description: rawReview.description
    };

    return (
        <ReviewDetails
            productName={productName}
            name={name}
            fReview={fReview}
            isAdmin={true}
        />
    );
}
