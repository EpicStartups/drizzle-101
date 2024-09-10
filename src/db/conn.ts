import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import schema from "@/db/schema";

const queryClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(queryClient, { schema });
