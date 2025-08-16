import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { userTable, accountTable, sessionTable } from "@/db/schema"

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
                    access_type: "offline",
                    response_type: "code",
                    prompt: "select_account",
                },
            },
        }),
    ],
})
