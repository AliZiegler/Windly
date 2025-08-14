import { db } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { productTable, reviewTable, userTable, helpfulTable } from "@/db/schema";
import { requireAuth } from "./UserActions";
import { urlString } from "@/app/components/global/Atoms";
import { revalidatePath } from "next/cache";
import type { UpdateReview } from "@/app/components/global/Types";
interface SqliteError extends Error {
    code: string;
}
function isSqliteError(e: unknown): e is SqliteError {
    return (
        e instanceof Error &&
        typeof (e).message === "string"
    );
}
export async function addReview(
    productId: number,
    userId: string,
    rating: number,
    reviewText: string
) {
    try {
        if (!productId || !userId || !rating || !reviewText) {
            return { success: false, error: "All fields are required" };
        }

        if (rating < 0.5 || rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        if (reviewText.length < 10) {
            return { success: false, error: "Review must be at least 10 characters" };
        }

        const existingReview = await db
            .select()
            .from(reviewTable)
            .where(and(eq(reviewTable.productId, productId), eq(reviewTable.userId, userId)))
            .get();

        if (existingReview) {
            return { success: false, error: "You have already reviewed this product" };
        }

        const productName = await db.select({ name: productTable.name }).from(productTable).where(eq(productTable.id, productId)).get();
        if (!productName) {
            return { success: false, error: "Product not found" };
        }
        const user = await db
            .select({ name: userTable.name })
            .from(userTable)
            .where(eq(userTable.id, userId))
            .get();

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const newReview = await db
            .insert(reviewTable)
            .values({
                productId,
                userId,
                rating,
                review: reviewText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .returning();

        const allProductReviews = await db
            .select({ rating: reviewTable.rating })
            .from(reviewTable)
            .where(eq(reviewTable.productId, productId));

        const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;

        await db
            .update(productTable)
            .set({
                rating: Number(avgRating.toFixed(1)),
                lastUpdated: new Date().toISOString()
            })
            .where(eq(productTable.id, productId));

        revalidatePath("/[name]");
        revalidatePath("/account/reviews");

        return {
            success: true,
            review: newReview[0],
            message: "Review added successfully!"
        };

    } catch (error) {
        console.error("Error adding review:", error);
        return {
            success: false,
            error: "Failed to add review. Please try again."
        };
    }
}

export async function markReviewHelpful(
    reviewId: number
): Promise<{ success: boolean; error?: string }> {
    const userId = await requireAuth();
    try {
        if (!userId) {
            return { success: false, error: "You must be signed in to vote." };
        }

        const result = await db.transaction(async (tx) => {
            try {
                await tx.insert(helpfulTable).values({ reviewId, userId });

                await tx
                    .update(reviewTable)
                    .set({ helpfulCount: sql`${reviewTable.helpfulCount} + 1` })
                    .where(eq(reviewTable.id, reviewId));

                return { success: true };
            } catch (err: unknown) {
                if (
                    isSqliteError(err) &&
                    (err.message.includes("UNIQUE constraint failed") ||
                        err.code === "SQLITE_CONSTRAINT_UNIQUE")
                ) {
                    throw new Error("ALREADY_VOTED");
                }
                throw err;
            }
        });

        revalidatePath("/[name]/reviews");
        return result;

    } catch (err: unknown) {
        if (err instanceof Error && err.message === "ALREADY_VOTED") {
            return { success: false, error: "You've already marked this review as helpful." };
        }

        console.error("Error marking review as helpful:", err);
        return { success: false, error: "Failed to mark review as helpful. Please try again." };
    }
}

export async function getProductReviews(identifier: number | string) {
    try {
        let productId: number;

        if (typeof identifier === "string") {
            const product = await db
                .select({ id: productTable.id })
                .from(productTable)
                .where(eq(productTable.name, identifier))
                .get();

            if (!product) {
                return { success: false, error: "Product not found" };
            }

            productId = product.id;
        } else {
            productId = identifier;
        }

        const reviews = await db
            .select({
                id: reviewTable.id,
                rating: reviewTable.rating,
                review: reviewTable.review,
                createdAt: reviewTable.createdAt,
                updatedAt: reviewTable.updatedAt,
                userName: userTable.name,
                userImage: userTable.image,
                helpfulCount: reviewTable.helpfulCount
            })
            .from(reviewTable)
            .innerJoin(userTable, eq(reviewTable.userId, userTable.id))
            .where(eq(reviewTable.productId, productId))
            .orderBy(reviewTable.createdAt);

        return { success: true, reviews };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

export async function getUserReviews(userId: string) {
    try {
        const reviews = await db
            .select({
                id: reviewTable.id,
                rating: reviewTable.rating,
                review: reviewTable.review,
                createdAt: reviewTable.createdAt,
                updatedAt: reviewTable.updatedAt,
                helpfulCount: reviewTable.helpfulCount,
                productId: reviewTable.productId,
                productName: productTable.name,
                productImage: productTable.img,
            })
            .from(reviewTable)
            .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
            .where(eq(reviewTable.userId, userId))
            .orderBy(reviewTable.createdAt);

        return { success: true, reviews };
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return { success: false, error: "Failed to fetch user reviews" };
    }
}
export async function getUserHelpfulReviewsIds(userId: string) {
    try {
        const reviews = await db
            .select({ reviewId: helpfulTable.reviewId })
            .from(helpfulTable)
            .where(eq(helpfulTable.userId, userId));
        return { success: true, reviews };
    } catch (error) {
        console.error("Error fetching user helpful reviews:", error);
        return { success: false, error: "Failed to fetch user helpful reviews" };
    }
}

export async function canUserReview(productId: number, userId: string) {
    try {
        const existingReview = await db
            .select()
            .from(reviewTable)
            .where(and(eq(reviewTable.productId, productId,), eq(reviewTable.userId, userId)))
            .get();

        return { canReview: !existingReview };
    } catch (error) {
        console.error("Error checking review permission:", error);
        return { canReview: false };
    }
}
export async function updateReview(input: UpdateReview, reviewId: number, userId: string) {
    const updateValues = {
        ...input,
        updatedAt: new Date().toISOString(),
    }
    try {
        const review = await db.select({ userId: reviewTable.userId, productId: reviewTable.productId }).from(reviewTable).where(eq(reviewTable.id, reviewId)).get();
        const doesUserOwnReview = review?.userId === userId;
        if (!doesUserOwnReview) {
            return { success: false, error: "You do not own this review" };
        }
        const productName = await db.select({ name: productTable.name }).from(productTable).where(eq(productTable.id, review.productId)).get();
        if (!productName) {
            return { success: false, error: "Product not found" };
        }
        await db.update(reviewTable).set(updateValues).where(eq(reviewTable.id, reviewId));
        revalidatePath("/account/reviews");
        revalidatePath(`/${urlString(productName.name)}`);
        revalidatePath(`/account/reviews/${urlString(productName.name)}`);
        return { success: true };
    } catch (error) {
        console.error("Error", error);
        return { success: false, error: "Failed to update review. Please try again." };
    }
}
