import { db } from "./conn";
import { user, menuItem, order, orderItem, review } from "./schema";
import type {
  InsertUser,
  InsertMenuItem,
  InsertOrder,
  InsertOrderItem,
  InsertReview,
} from "./schemaTypes";
import { eq } from "drizzle-orm";

async function main() {
  // Insert a new user (customer)
  const payloadUser: InsertUser = {
    name: "John Doe",
    password: "password123",
    role: "customer",
    email: "john.doe@example.com",
  };

  const [userInserted] = await db.insert(user).values(payloadUser).returning();

  console.log("User inserted: ", userInserted);

  // Insert a new menu item
  const payloadMenuItem: InsertMenuItem = {
    name: "Cheeseburger",
    description: "Delicious cheeseburger with fries",
    price: 8.99,
    category: "Main Course",
  };

  const [menuItemInserted] = await db
    .insert(menuItem)
    .values(payloadMenuItem)
    .returning();

  console.log("Menu item inserted: ", menuItemInserted);

  // Insert a new order for the user
  const payloadOrder: InsertOrder = {
    userId: userInserted.id,
    status: "pending",
    totalAmount: 8.99,
  };

  const [orderInserted] = await db
    .insert(order)
    .values(payloadOrder)
    .returning({
      id: order.id,
      totalAmount: order.totalAmount,
    });

  console.log("Order inserted: ", orderInserted);

  // Insert order items for the order
  const payloadOrderItem: InsertOrderItem = {
    orderId: orderInserted.id,
    menuItemId: menuItemInserted.id,
    quantity: 1,
    price: 8.99,
  };

  const orderItemInserted = await db
    .insert(orderItem)
    .values(payloadOrderItem)
    .returning({
      id: orderItem.id,
      quantity: orderItem.quantity,
    });

  console.log("Order item inserted: ", orderItemInserted);

  // Insert a review for the menu item
  const payloadReview: InsertReview = {
    userId: userInserted.id,
    menuItemId: menuItemInserted.id,
    rating: 5,
    comment: "The cheeseburger was amazing!",
  };

  const [reviewInserted] = await db
    .insert(review)
    .values(payloadReview)
    .returning({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
    });

  console.log("Review inserted: ", reviewInserted);

  // Fetch all users with role "customer"
  const customerUsers = await db.query.user.findMany({
    columns: {
      name: true,
      email: true,
    },
    where: (user, { eq }) => eq(user.role, "customer"),
  });

  console.log("Customer users: ", customerUsers);

  // Fetch all menu items
  const allMenuItems = await db.query.menuItem.findMany({
    columns: {
      name: true,
      price: true,
    },
  });
  console.log("All menu items: ", allMenuItems);

  // Fetch orders and their items
  const ordersWithItems = await db.query.order.findMany({
    with: {
      items: true,
    },
  });

  console.log("Orders with items: ", ordersWithItems);

  // Delete the inserted review
  const deletedReview = await db
    .delete(review)
    .where(eq(review.id, reviewInserted.id))
    .returning({ deletedId: review.id });

  console.log("Deleted review: ", deletedReview);

  // Delete the inserted order and its items
  const deletedOrderItems = await db
    .delete(orderItem)
    .where(eq(orderItem.orderId, orderInserted.id))
    .returning({ deletedId: orderItem.id });

  const deletedOrder = await db
    .delete(order)
    .where(eq(order.id, orderInserted.id))
    .returning({ deletedId: order.id });

  console.log("Deleted order items: ", deletedOrderItems);
  console.log("Deleted order: ", deletedOrder);

  // Delete the inserted menu item
  const deletedMenuItem = await db
    .delete(menuItem)
    .where(eq(menuItem.id, menuItemInserted.id))
    .returning();

  console.log("Deleted menu item: ", deletedMenuItem);

  // Delete the inserted user
  const deletedUser = await db
    .delete(user)
    .where(eq(user.id, userInserted.id))
    .returning({ deletedId: user.id });

  console.log("Deleted user: ", deletedUser);
}

main();
