import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  menuItem,
  order,
  orderItem,
  review,
  user,
  tableSeating,
  reservation,
  payment,
  inventory,
} from "@/db/schema";

// Insert schemas
export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email(),
  password: z.string().min(6),
});
export const insertMenuItemSchema = createInsertSchema(menuItem);
export const insertOrderSchema = createInsertSchema(order);
export const insertOrderItemSchema = createInsertSchema(orderItem);
export const insertReviewSchema = createInsertSchema(review);
export const insertTableSeatingSchema = createInsertSchema(tableSeating);
export const insertReservationSchema = createInsertSchema(reservation);
export const insertPaymentSchema = createInsertSchema(payment);
export const insertInventorySchema = createInsertSchema(inventory);

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertTableSeating = z.infer<typeof insertTableSeatingSchema>;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

// Select schemas
export const selectUserSchema = createSelectSchema(user);
export const selectMenuItemSchema = createSelectSchema(menuItem);
export const selectOrderSchema = createSelectSchema(order);
export const selectOrderItemSchema = createSelectSchema(orderItem);
export const selectReviewSchema = createSelectSchema(review);
export const selectTableSchema = createSelectSchema(tableSeating);
export const selectReservationSchema = createSelectSchema(reservation);
export const selectPaymentSchema = createSelectSchema(payment);
export const selectInventorySchema = createSelectSchema(inventory);

// Select types
export type SelectUser = z.infer<typeof selectUserSchema>;
export type SelectMenuItem = z.infer<typeof selectMenuItemSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
export type SelectOrderItem = z.infer<typeof selectOrderItemSchema>;
export type SelectReview = z.infer<typeof selectReviewSchema>;
export type SelectTable = z.infer<typeof selectTableSchema>;
export type SelectReservation = z.infer<typeof selectReservationSchema>;
export type SelectPayment = z.infer<typeof selectPaymentSchema>;
export type SelectInventory = z.infer<typeof selectInventorySchema>;

// Additional schemas for specific operations or validations
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = createInsertSchema(user, {
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  loyaltyPoints: z.number().int().optional(),
}).partial();

export const updateMenuItemSchema = createInsertSchema(menuItem).partial();

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "served", "completed", "cancelled"]),
});

export const createReservationSchema = createInsertSchema(reservation, {
  date: z.coerce.date(),
  time: z.coerce.date(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int(),
  lastRestocked: z.coerce.date(),
});

// Export types for additional schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type CreateReservation = z.infer<typeof createReservationSchema>;
export type UpdateInventory = z.infer<typeof updateInventorySchema>;
