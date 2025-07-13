"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { userTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = ['name', 'phone', 'birthday', 'gender', 'image'] as const;
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

        const updateData: Partial<Record<AllowedField, string | null>> = {};
        updateData[field] = value.trim() || null;

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
export async function updateUserImage(image: string) {
    return updateUserField('image', image);
}
