import {
  pgEnum,
  pgTable,
  timestamp,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
const roleEnum = pgEnum("role", ["adminss", "customer"]);

const valueMap = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
] as const;

const typeEnum = pgEnum("type", valueMap);

export const user = pgTable("user", {
  id: serial("id"),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  roleEnum: roleEnum("role"),
  typeEnum: typeEnum("type"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const hobbies = pgTable("hobbies", {
  id: serial("id"),
  hobby: text("name"),
  description: text("description"),
});

export const insertHobbiesSchema = createInsertSchema(hobbies, {});

export const insertUserSchema = createInsertSchema(user, {
  name: z.string().min(10, {
    message: "name must be a long name",
  }),
});
export const selectUserSchema = createSelectSchema(user);
export type CreateHobbies = z.infer<typeof insertHobbiesSchema>;
export type CreateUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

const schema = {
  user,
  hobbies,
};

const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });
