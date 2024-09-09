import {
  pgEnum,
  pgTable,
  timestamp,
  serial,
  text,
  uuid,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { z } from "zod";
import { Pool } from "pg";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Define enums
export const roleEnum = pgEnum("role", ["admin", "customer", "staff"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "served",
  "completed",
  "cancelled",
]);

// User table
export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu table
export const menuItem = pgTable("menu_item", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order table
export const order = pgTable("order", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: real("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order item table (association between order and menu items)
export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id").notNull(),
  menuItemId: uuid("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// Review table
export const review = pgTable("review", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  menuItemId: uuid("menu_item_id").notNull(),
  rating: integer("rating").notNull(), // rating from 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
  reviews: many(review),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  menuItem: one(menuItem, {
    fields: [orderItem.menuItemId],
    references: [menuItem.id],
  }),
}));

export const menuItemRelations = relations(menuItem, ({ many }) => ({
  reviews: many(review),
  orderItems: many(orderItem),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  menuItem: one(menuItem, {
    fields: [review.menuItemId],
    references: [menuItem.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email(),
  password: z.string().min(6),
});

export const tusers = pgTable("tusers", {
  id: serial("id").primaryKey(),
  name: text("name"),
});
export const tusersRelations = relations(tusers, ({ many }) => ({
  posts: many(tposts),
}));
export const tposts = pgTable("tposts", {
  id: serial("id").primaryKey(),
  content: text("content"),
  authorId: integer("author_id"),
});

export const tpostsRelations = relations(tposts, ({ one }) => ({
  author: one(tusers, {
    fields: [tposts.authorId],
    references: [tusers.id],
  }),
}));

export const insertMenuItemSchema = createInsertSchema(menuItem);
export const insertOrderSchema = createInsertSchema(order);
export const insertOrderItemSchema = createInsertSchema(orderItem);
export const insertReviewSchema = createInsertSchema(review);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export const selectUserSchema = createSelectSchema(user);
export const selectMenuItemSchema = createSelectSchema(menuItem);
export const selectOrderSchema = createSelectSchema(order);
export const selectOrderItemSchema = createSelectSchema(orderItem);
export const selectReviewSchema = createSelectSchema(review);

// Database setup
const schema = {
  user,
  menuItem,
  order,
  orderItem,
  review,
};

const queryClient = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(queryClient, { schema });
