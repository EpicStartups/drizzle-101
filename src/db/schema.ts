import {
  pgEnum,
  pgTable,
  timestamp,
  text,
  uuid,
  integer,
  real,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define enums
export const roleEnum = pgEnum("role", ["admin", "customer", "staff"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "served",
  "completed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "debit_card",
  "mobile_payment",
]);

// User table
export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  phoneNumber: text("phone_number"),
  loyaltyPoints: integer("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu table
export const menuItem = pgTable("menu_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table table
export const table = pgTable("table", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  isOccupied: boolean("is_occupied").default(false),
});

// Order table
export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  tableId: uuid("table_id").references(() => table.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: real("total_amount").notNull(),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order item table (association between order and menu items)
export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItem.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  specialInstructions: text("special_instructions"),
});

// Review table
export const review = pgTable("review", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItem.id),
  rating: integer("rating").notNull(), // rating from 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reservation table
export const reservation = pgTable("reservation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  tableId: uuid("table_id")
    .notNull()
    .references(() => table.id),
  date: date("date", { mode: "date" }).notNull(),
  time: timestamp("time").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  status: text("status").notNull(), // e.g., "confirmed", "cancelled", "completed"
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment table
export const payment = pgTable("payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id),
  amount: real("amount").notNull(),
  status: paymentStatusEnum("status").notNull(),
  method: paymentMethodEnum("method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItem.id),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // e.g., "kg", "liters", "pieces"
  lastRestocked: timestamp("last_restocked").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
  reviews: many(review),
  reservations: many(reservation),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  table: one(table, {
    fields: [order.tableId],
    references: [table.id],
  }),
  items: many(orderItem),
  payment: many(payment),
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

export const menuItemRelations = relations(menuItem, ({ many, one }) => ({
  reviews: many(review),
  orderItems: many(orderItem),
  inventory: one(inventory),
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

export const tableRelations = relations(table, ({ many }) => ({
  orders: many(order),
  reservations: many(reservation),
}));

export const reservationRelations = relations(reservation, ({ one }) => ({
  user: one(user, {
    fields: [reservation.userId],
    references: [user.id],
  }),
  table: one(table, {
    fields: [reservation.tableId],
    references: [table.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  menuItem: one(menuItem, {
    fields: [inventory.menuItemId],
    references: [menuItem.id],
  }),
}));

// Database schema
const schema = {
  user,
  menuItem,
  order,
  orderItem,
  review,
  table,
  reservation,
  payment,
  inventory,
  userRelations,
  orderRelations,
  orderItemRelations,
  menuItemRelations,
  reviewRelations,
  tableRelations,
  reservationRelations,
  paymentRelations,
  inventoryRelations,
};

export default schema;

/**
 * schema should handle menu ordering items. every item can be categorized and tagged.each item has user reviews.
 * every user review can be a text, rating and upload of photo. the user can also store and audio recording of their review.
 * the user can also store a video review of the item.
 * the system also has promotions for each menu item.
 * this logic will be used for each promotion to determine the final price of the item. for example: promotions can be if the user spends up to 100, then they get 10% off.
 * if they buy specific items, then discount of 20%. if they buy 2 items, then they get 1 free. if they buy 3 items, then they get 2 free.
 * these logics can be managed by the admin and stored as a string value.  of promotion and the string.
 * for each menu item, they can also apply a discount to that item.
 *
 *
 */

/**
 * fundamentally the user can engage with the app. they can view their menu items. they can give a review
 * about the menu. they can also state what is their budget and what they would like to order. the app will then
 * recommend them. it's like a omakase app where the app will just recommend to the user based on the user's
 * preferences and what they like. the app will learn to manage the user's tastes and preferences.
 * ultimately it can also serve as a guide for that the user will like. the user experience is they simply scan the QR,
 * and they can talk to the AI. they can ask questions about what's good. the system will immediately give the feedback
 * on the list of all the food based on the user's budget. This system will recommend everything immediately. the user
 * can give feedback on the recommendations and the AI will learn to swap it out based on the user's feedback.
 * at a generic level, the AI is keeping the state of the user, and also getting the input of the user's preferences.
 * then the AI is updating the state accordingly to the feedback whilst always taking into account the fundamental_rules when providing
 * recommendations.
 * the user just states what they like, what's their budget and they can just talk away. the system will show in the chat interface
 * all the various foods and the user can keep on asking questions abou what they will like.
 * if there's multiple people who are sharing, then everyone can place their preferences. users can also view the menu to see
 * what the restaurant has. but at the end of the day, the each user can state what they will like.
 *
 * this is an italian restaurant.
 * john looks at the menu. he's craving for something
 * jane is quite full. she wants something light.
 * mark is happy to just try everyone's food and taste a bit.
 * lukas is on a budget. he wants something affordable.
 * the group agrees to order their own food. but then have some sharing as well. they all tell the AI their preferences in a group chat.
 * the AI then asks them some followup questions like budget, or any other dietary requirements.
 * they all say no. then the AI recommends a menu for each person together with the sharing items they can, whilst maintaining within
 * the budget.
 *
 * they give their feedback on the food. john likes his. jane does not like her's because of the taste she has. she does not like squid which
 * the AI recommended to her.
 * the AI updates the menu item list again for them to see. each of them is chatting with the AI and the AI is updating everyone in the group chat.
 * they can click the link and see their food items. the AI types out all the food recommendations for everyone again, taking into account their feedback.
 * the AI knows how to describe each food well. The users can click into the food, and see the individual food item as well as the feedbacks from others.
 * they also see that this is a new food. since the app has a gamification element, everytime they review the food they will get extra points which they can use
 * to redeem discounts
 * every point is worth RM1 which they can use for discounts at other restaurants. every restaurant will get their points refreshed on a monthly basis so that they
 * can allocate to customers. also it allows restaurants to choose which items they want to have more points for.
 * they can also purchase point packs so that they can have more points to give to customers.fundamentally customers will earn these points by creating a good review
 * of the food. after the user eats the food, they will be given the option to rate other people's reviews of their particular food.
 *
 */

/**
 * how ab tests work is fundamentally you will have a winner and a loser.
 * the number of rounds the AB test takes will ultimately determine the winner.
 * fundamentally, every contestant will need to be played off against everyone else. the winners with the other winners.
 * the losers with the other losers. they will do these games until there's a ratio of 50 50, whereby 50% winners and 50% losers.
 * from the perspective of a food review, there's 100 reviews of foods. the games are played whereby each food is pitted against the others.
 * assume the scenario whereby everyone is shown one paring of food and only one. thus after one round, there will be 50% winners and 50% losers.
 * play this the second time whereby among the winners, they are pitted against each other.
 * so this for up to X number of rounds until there's a review with the magical number of Y upvotes. this review has been proven to be valid
 * the Y upvotes requirement is based on a formula whereby there needs to be at least 20% of the reviews being valid for this particular review.
 * the fundamental goal of this review system is so that only the best reviews win. in this way, we can assume that the game is played until 20% of the reviews win.
 * the review needs to have at least 60% of it's showing as positive. the review is time based whereby after a specific time period, the reviews are calculated
 * and the winner is choosen. this is because if a restaurant does not have enough customers there won't be enough reviews.
 * the system will basically take the review against all other reviews and chooses the top 20%. fundamentally however, the reivew will always be shown against other reviews
 * that have similar stats to it. which means win ratios. it shows how many times the review has been shown and what's its win rate. then find similar reviews with a similar win rate
 * as the way to match them up together
 *
 * for the same of a website, we just show two options. these 2 options are pitted against each other. after a time period, the option that has the best stats will
 * be choosen.
 *
 * to have multiple variations of a site shown, we will store the contestants together in the system and it's always tracking the win. it's based on time. once the time limit is up
 * then it will automatically run. there cannot be more than 2 contestants per game id. the contestants are automatically pitted against each other. the client will just call the api to get
 * the new games, and automatically there will be new games with the relevant contestants. From a website perspective, the AI will generate 2 sites, and store them as contestants in the game.
 * the client is submitting who wins the games. after x amount of time, then the winner is choosen
 */
