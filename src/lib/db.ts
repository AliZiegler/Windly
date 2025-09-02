import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is not set');
}

const client = createClient({
    url: url,
    authToken: authToken,
})

export const db = drizzle(client)
export { db as default }
