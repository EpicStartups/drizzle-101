import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import schema from "@/db/schema";
import { user, sessionTable } from "@/db/schema";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

const queryClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(queryClient, { schema });
export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, user);
