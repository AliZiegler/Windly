"use server"
import { urlString } from "@/app/components/global/Atoms";
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { userTable, productTable, reviewTable, addressTable } from "@/db/schema";
import type { InsertAddress } from "@/db/schema";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = ['name', 'phone', 'birthday', 'gender'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

export async function updateUserField(field: AllowedField, value: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        if (!ALLOWED_FIELDS.includes(field)) {
            throw new Error(`Invalid field. Allowed fields: ${ALLOWED_FIELDS.join(', ')}`);
        }

        if (field === 'name' && (!value || value.trim().length === 0)) {
            throw new Error("Name cannot be empty");
        }

        const updateData: Partial<Record<AllowedField, string | undefined>> = {};

        // Handle different field types appropriately
        if (field === 'name') {
            // Name is required (notNull), so we don't allow empty values
            updateData[field] = value.trim();
        } else {
            // Other fields can be empty/undefined
            updateData[field] = value.trim() || undefined;
        }

        await db
            .update(userTable)
            .set(updateData)
            .where(eq(userTable.id, session.user.id));

        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error('Error updating user field:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function updateUserName(name: string) {
    return updateUserField('name', name);
}

export async function updateUserPhone(phone: string) {
    return updateUserField('phone', phone);
}

export async function updateUserBirthday(birthday: string) {
    return updateUserField('birthday', birthday);
}

export async function updateUserGender(gender: string) {
    return updateUserField('gender', gender);
}

export async function updateWishlist(productId: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1);

        if (users.length === 0) {
            throw new Error("User not found");
        }

        // Convert productId to number if your product table uses integer IDs
        if (isNaN(productId)) {
            throw new Error("Invalid product ID");
        }

        const productExists = await db
            .select({ id: productTable.id })
            .from(productTable)
            .where(eq(productTable.id, productId))
            .limit(1);

        if (productExists.length === 0) {
            throw new Error("Product not found");
        }

        // Parse the JSON string to get the actual array
        const currentWishlist: number[] = JSON.parse(users[0].wishlist || "[]");
        const wishlist = [...currentWishlist];

        // Toggle productId in wishlist array (keep as string in wishlist)
        const idx = wishlist.indexOf(productId);
        if (idx !== -1) {
            wishlist.splice(idx, 1);
        } else {
            wishlist.push(productId);
        }

        // Convert back to JSON string before persisting
        await db
            .update(userTable)
            .set({ wishlist: JSON.stringify(wishlist) })
            .where(eq(userTable.id, session.user.id));
        revalidatePath("/account/wishlist");

        return {
            success: true,
            wishlist, // Return the actual array, not the JSON string
        };
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
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

        revalidatePath(`/${urlString(productName?.name)}`);

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

export async function getProductReviews(productId: number) {
    try {
        const reviews = await db
            .select({
                id: reviewTable.id,
                rating: reviewTable.rating,
                review: reviewTable.review,
                createdAt: reviewTable.createdAt,
                userName: userTable.name,
                userImage: userTable.image
            })
            .from(reviewTable)
            .innerJoin(userTable, eq(reviewTable.userId, userTable.id))
            .where(eq(reviewTable.productId, productId))
            .orderBy(reviewTable.createdAt); // Most recent first

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
export async function addAddress(address: InsertAddress) {
    const insertValues = { ...address, updatedAt: new Date().toISOString() };
    try {
        await db.insert(addressTable).values(insertValues);
        revalidatePath("/user/addresses");
        return { success: true };
    } catch (error) {
        console.error("Error adding address:", error);
        return { success: false, error: "Failed to add address. Please try again." };
    }
}
