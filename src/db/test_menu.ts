import { db } from "./conn";
import {
  user,
  menuItem,
  order,
  orderItem,
  review,
  tableSeating,
  reservation,
  payment,
  inventory,
} from "./schema";
import type {
  InsertUser,
  InsertMenuItem,
  InsertOrder,
  InsertOrderItem,
  InsertReview,
  InsertTableSeating,
  InsertReservation,
  InsertPayment,
  InsertInventory,
  UpdateUser,
  UpdateMenuItem,
  UpdateOrderStatus,
  UpdateInventory,
} from "./schemaTypes";
import { eq, and } from "drizzle-orm";

async function main() {
  // Insert a new user (customer)
  const payloadUser: InsertUser = {
    name: "John Doe",
    password: "password123",
    role: "customer",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    loyaltyPoints: 0,
  };

  const [userInserted] = await db.insert(user).values(payloadUser).returning();
  console.log("User inserted: ", userInserted);

  // Update user information
  const updateUserPayload: UpdateUser = {
    name: "John Smith",
    loyaltyPoints: 100,
  };

  const [userUpdated] = await db
    .update(user)
    .set(updateUserPayload)
    .where(eq(user.id, userInserted.id))
    .returning();
  console.log("User updated: ", userUpdated);

  // Insert a new menu item
  const payloadMenuItem: InsertMenuItem = {
    name: "Cheeseburger",
    description: "Delicious cheeseburger with fries",
    price: 8.99,
    category: "Main Course",
    isAvailable: true,
  };

  const [menuItemInserted] = await db
    .insert(menuItem)
    .values(payloadMenuItem)
    .returning();
  console.log("Menu item inserted: ", menuItemInserted);

  // Update menu item
  const updateMenuItemPayload: UpdateMenuItem = {
    price: 9.99,
    isAvailable: false,
  };

  const [menuItemUpdated] = await db
    .update(menuItem)
    .set(updateMenuItemPayload)
    .where(eq(menuItem.id, menuItemInserted.id))
    .returning();
  console.log("Menu item updated: ", menuItemUpdated);

  // Insert a newtableSeating
  const payloadTable: InsertTableSeating = {
    number: 1,
    capacity: 4,
    isOccupied: false,
  };

  const [tableInserted] = await db
    .insert(tableSeating)
    .values(payloadTable)
    .returning();
  console.log("Table inserted: ", tableInserted);

  // Insert a new reservation
  const payloadReservation: InsertReservation = {
    userId: userInserted.id,
    tableId: tableInserted.id,
    date: new Date(),
    time: new Date(),
    numberOfGuests: 2,
    status: "confirmed",
  };

  const [reservationInserted] = await db
    .insert(reservation)
    .values(payloadReservation)
    .returning();
  console.log("Reservation inserted: ", reservationInserted);

  // Insert a new order for the user
  const payloadOrder: InsertOrder = {
    userId: userInserted.id,
    tableId: tableInserted.id,
    status: "pending",
    totalAmount: 8.99,
    specialInstructions: "No onions, please",
  };

  const [orderInserted] = await db
    .insert(order)
    .values(payloadOrder)
    .returning();
  console.log("Order inserted: ", orderInserted);

  // Update order status
  const updateOrderStatusPayload: UpdateOrderStatus = {
    status: "preparing",
  };

  const [orderUpdated] = await db
    .update(order)
    .set(updateOrderStatusPayload)
    .where(eq(order.id, orderInserted.id))
    .returning();
  console.log("Order status updated: ", orderUpdated);

  // Insert order items for the order
  const payloadOrderItem: InsertOrderItem = {
    orderId: orderInserted.id,
    menuItemId: menuItemInserted.id,
    quantity: 1,
    price: 8.99,
    specialInstructions: "Extra cheese",
  };

  const [orderItemInserted] = await db
    .insert(orderItem)
    .values(payloadOrderItem)
    .returning();
  console.log("Order item inserted: ", orderItemInserted);

  // Insert a payment for the order
  const payloadPayment: InsertPayment = {
    orderId: orderInserted.id,
    amount: 8.99,
    status: "completed",
    method: "credit_card",
    transactionId: "txn_123456",
  };

  const [paymentInserted] = await db
    .insert(payment)
    .values(payloadPayment)
    .returning();
  console.log("Payment inserted: ", paymentInserted);

  // Insert inventory for the menu item
  const payloadInventory: InsertInventory = {
    menuItemId: menuItemInserted.id,
    quantity: 100,
    unit: "pieces",
  };

  const [inventoryInserted] = await db
    .insert(inventory)
    .values(payloadInventory)
    .returning();
  console.log("Inventory inserted: ", inventoryInserted);

  // Update inventory
  const updateInventoryPayload: UpdateInventory = {
    quantity: 90,
    lastRestocked: new Date(),
  };

  const [inventoryUpdated] = await db
    .update(inventory)
    .set(updateInventoryPayload)
    .where(eq(inventory.id, inventoryInserted.id))
    .returning();
  console.log("Inventory updated: ", inventoryUpdated);

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
    .returning();
  console.log("Review inserted: ", reviewInserted);

  // Fetch all users with role "customer"
  const customerUsers = await db.query.user.findMany({
    columns: {
      name: true,
      email: true,
      loyaltyPoints: true,
    },
    where: (user, { eq }) => eq(user.role, "customer"),
  });
  console.log("Customer users: ", customerUsers);

  // Fetch all menu items
  const allMenuItems = await db.query.menuItem.findMany({
    columns: {
      name: true,
      price: true,
      isAvailable: true,
    },
  });
  console.log("All menu items: ", allMenuItems);

  // Fetch orders and their items
  const ordersWithItems = await db.query.order.findMany({
    with: {
      items: true,
      payment: true,
    },
  });
  console.log("Orders with items and payments: ", ordersWithItems);

  // Fetch reservations for a specific date
  const today = new Date();
  const reservations = await db.query.reservation.findMany({
    where: and(
      eq(reservation.date, today),
      eq(reservation.status, "confirmed"),
    ),
    with: {
      user: true,
      tableSeating: true,
    },
  });
  console.log("Today's reservations: ", reservations);

  // Fetch inventory items with low stock
  const lowStockItems = await db.query.inventory.findMany({
    where: (inventory, { lt }) => lt(inventory.quantity, 10),
    with: {
      menuItem: true,
    },
  });
  console.log("Low stock items: ", lowStockItems);

  // Delete the inserted review
  const deletedReview = await db
    .delete(review)
    .where(eq(review.id, reviewInserted.id))
    .returning({ deletedId: review.id });
  console.log("Deleted review: ", deletedReview);

  // Delete the inserted payment
  const deletedPayment = await db
    .delete(payment)
    .where(eq(payment.id, paymentInserted.id))
    .returning({ deletedId: payment.id });
  console.log("Deleted payment: ", deletedPayment);

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

  // Delete the inserted reservation
  const deletedReservation = await db
    .delete(reservation)
    .where(eq(reservation.id, reservationInserted.id))
    .returning({ deletedId: reservation.id });
  console.log("Deleted reservation: ", deletedReservation);

  // Delete the inserted inventory
  const deletedInventory = await db
    .delete(inventory)
    .where(eq(inventory.id, inventoryInserted.id))
    .returning({ deletedId: inventory.id });
  console.log("Deleted inventory: ", deletedInventory);

  // Delete the inserted menu item
  const deletedMenuItem = await db
    .delete(menuItem)
    .where(eq(menuItem.id, menuItemInserted.id))
    .returning({ deletedId: menuItem.id });
  console.log("Deleted menu item: ", deletedMenuItem);

  // Delete the insertedtableSeating
  const deletedTable = await db
    .delete(tableSeating)
    .where(eq(tableSeating.id, tableInserted.id))
    .returning({ deletedId: tableSeating.id });
  console.log("Deleted tableSeating: ", deletedTable);

  // Delete the inserted user
  const deletedUser = await db
    .delete(user)
    .where(eq(user.id, userInserted.id))
    .returning({ deletedId: user.id });
  console.log("Deleted user: ", deletedUser);
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
