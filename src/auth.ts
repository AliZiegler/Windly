import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { userTable, accountTable, sessionTable } from "@/db/schema"
export const googleScopes = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/user.birthday.read",
    "https://www.googleapis.com/auth/user.gender.read",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
]

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: userTable,
        accountsTable: accountTable,
        sessionsTable: sessionTable,
    }),
    providers: [
        Google({
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: googleScopes.join(" "),
                },
            },
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    gender: profile.gender,
                    birthday: profile.birthday,
                    phone: profile.phoneNumbers?.[0]?.value
                }
            },
        }),
    ],
})
