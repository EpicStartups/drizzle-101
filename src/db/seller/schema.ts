import {
  pgEnum,
  pgTable,
  timestamp,
  text,
  uuid,
  real,
  boolean,
  date,
  index,
  uniqueIndex,
  integer,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

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
export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull(),
    githubId: text("github_id"),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: roleEnum("role").notNull(),
    phoneNumber: text("phone_number"),
    loyaltyPoints: integer("loyalty_points").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
      phoneIdx: index("phone_idx").on(table.phoneNumber),
    };
  },
);

export const users = pgTable("users", {
  user_id: uuid("user_id").primaryKey().defaultRandom().notNull(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  phone_number: text("phone_number").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  last_login: timestamp("last_login"),
  is_active: boolean("is_active").default(true),
  role: roleEnum("role").notNull(),
});

export const user_profiles = pgTable("user_profiles", {
  profile_id: uuid("profile_id").primaryKey().defaultRandom().notNull(),
  user_id: uuid("user_id").references(() => users.user_id),
  full_name: text("full_name"),
  business_name: text("business_name"),
  business_address: text("business_address"),
  business_registration_number: text("business_registration_number"),
  tax_id: text("tax_id"),
  bank_account_name: text("bank_account_name"),
  bank_account_number: text("bank_account_number"),
  bank_name: text("bank_name"),
  profile_image_url: text("profile_image_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const roles = pgTable("roles", {
  role_id: uuid("role_id").primaryKey().defaultRandom().notNull(),
  role_name: text("role_name").unique().notNull(),
  description: text("description"),
});

export const user_roles = pgTable("user_roles", {
  user_id: uuid("user_id").references(() => users.user_id),
  role_id: uuid("role_id").references(() => roles.role_id),
});

export const permissions = pgTable("permissions", {
  permission_id: uuid("permission_id").primaryKey().defaultRandom().notNull(),
  permission_name: text("permission_name").unique().notNull(),
  description: text("description"),
});

export const role_permissions = pgTable("role_permissions", {
  role_id: uuid("role_id").references(() => roles.role_id),
  permission_id: uuid("permission_id").references(
    () => permissions.permission_id,
  ),
});

export const banners = pgTable("banners", {
  banner_id: uuid("banner_id").primaryKey().defaultRandom().notNull(),
  user_id: uuid("user_id").references(() => users.user_id),
  image_url: text("image_url").notNull(),
  link_url: text("link_url"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  slot_time: timestamp("slot_time").notNull(),
  location: text("location").notNull(),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  campaign_id: uuid("campaign_id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  status: text("status").default("upcoming"),
});

export const campaign_participants = pgTable("campaign_participants", {
  participant_id: uuid("participant_id").primaryKey().defaultRandom().notNull(),
  campaign_id: uuid("campaign_id").references(() => campaigns.campaign_id),
  user_id: uuid("user_id").references(() => users.user_id),
  joined_at: timestamp("joined_at").defaultNow(),
});

export const delivery_channels = pgTable("delivery_channels", {
  channel_id: uuid("channel_id").primaryKey().defaultRandom().notNull(),
  user_id: uuid("user_id").references(() => users.user_id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const delivery_zones = pgTable("delivery_zones", {
  zone_id: uuid("zone_id").primaryKey().defaultRandom().notNull(),
  channel_id: uuid("channel_id").references(() => delivery_channels.channel_id),
  name: text("name").notNull(),
  polygon: text("polygon").notNull(),
  delivery_timeframe: text("delivery_timeframe"),
  special_instructions: text("special_instructions"),
});

export const shipping_rates = pgTable("shipping_rates", {
  rate_id: uuid("rate_id").primaryKey().defaultRandom().notNull(),
  zone_id: uuid("zone_id").references(() => delivery_zones.zone_id),
  min_weight: real("min_weight"),
  max_weight: real("max_weight"),
  price: real("price").notNull(),
});

export const categories = pgTable("categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom().notNull(),
  parent_category_id: uuid("parent_category_id").references(
    (): AnyPgColumn => categories.category_id,
  ),
  name: text("name").notNull(),
  description: text("description"),
  is_approved: boolean("is_approved").default(false),
});

export const brands = pgTable("brands", {
  brand_id: uuid("brand_id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  is_approved: boolean("is_approved").default(false),
});

export const products = pgTable(
  "products",
  {
    product_id: uuid("product_id").primaryKey().defaultRandom().notNull(),
    user_id: uuid("user_id").references(() => users.user_id),
    category_id: uuid("category_id").references(() => categories.category_id),
    brand_id: uuid("brand_id").references(() => brands.brand_id),
    name: text("name").notNull(),
    description: text("description"),
    sku: text("sku").unique().notNull(),
    barcode: text("barcode"),
    retail_price: real("retail_price").notNull(),
    wholesale_price: real("wholesale_price"),
    carton_price: real("carton_price"),
    weight: real("weight"),
    dimensions: text("dimensions"),
    stock_quantity: integer("stock_quantity").default(0),
    low_stock_threshold: integer("low_stock_threshold").default(10),
    is_active: boolean("is_active").default(true),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.user_id),
      categoryIdx: index("category_idx").on(table.category_id),
      brandIdx: index("brand_idx").on(table.brand_id),
    };
  },
);

export const product_images = pgTable("product_images", {
  image_id: uuid("image_id").primaryKey().defaultRandom().notNull(),
  product_id: uuid("product_id").references(() => products.product_id),
  image_url: text("image_url").notNull(),
  is_primary: boolean("is_primary").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const product_views = pgTable("product_views", {
  view_id: uuid("view_id").primaryKey().defaultRandom().notNull(),
  product_id: uuid("product_id").references(() => products.product_id),
  user_id: uuid("user_id").references(() => users.user_id),
  viewed_at: timestamp("viewed_at").defaultNow(),
});

export const invoices = pgTable(
  "invoices",
  {
    invoice_id: uuid("invoice_id").primaryKey().defaultRandom().notNull(),
    user_id: uuid("user_id").references(() => users.user_id),
    customer_id: uuid("customer_id").references(() => users.user_id),
    invoice_number: text("invoice_number").unique().notNull(),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    total_amount: real("total_amount").notNull(),
    status: text("status").default("unpaid"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.user_id),
      customerIdx: index("customer_idx").on(table.customer_id),
    };
  },
);

export const invoice_items = pgTable("invoice_items", {
  item_id: uuid("item_id").primaryKey().defaultRandom().notNull(),
  invoice_id: uuid("invoice_id").references(() => invoices.invoice_id),
  product_id: uuid("product_id").references(() => products.product_id),
  quantity: uuid("quantity").notNull(),
  unit_price: real("unit_price").notNull(),
  total_price: real("total_price").notNull(),
});

export const payments = pgTable("payments", {
  payment_id: uuid("payment_id").primaryKey().defaultRandom().notNull(),
  invoice_id: uuid("invoice_id").references(() => invoices.invoice_id),
  amount: real("amount").notNull(),
  payment_date: date("payment_date").notNull(),
  payment_method: text("payment_method").notNull(),
  transaction_id: text("transaction_id"),
  status: paymentStatusEnum("status").default("pending"),
});

export const credit_limits = pgTable("credit_limits", {
  credit_id: uuid("credit_id").primaryKey().defaultRandom().notNull(),
  user_id: uuid("user_id").references(() => users.user_id),
  customer_id: uuid("customer_id").references(() => users.user_id),
  credit_limit: real("credit_limit").notNull(),
  current_balance: real("current_balance").default(0),
  last_updated: timestamp("last_updated").defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    order_id: uuid("order_id").primaryKey().defaultRandom().notNull(),
    user_id: uuid("user_id").references(() => users.user_id),
    customer_id: uuid("customer_id").references(() => users.user_id),
    order_number: text("order_number").unique().notNull(),
    order_date: timestamp("order_date").defaultNow(),
    total_amount: real("total_amount").notNull(),
    status: orderStatusEnum("status").default("pending"),
    shipping_address: text("shipping_address").notNull(),
    billing_address: text("billing_address").notNull(),
    delivery_channel_id: uuid("delivery_channel_id").references(
      () => delivery_channels.channel_id,
    ),
    tracking_number: text("tracking_number"),
    estimated_delivery_date: date("estimated_delivery_date"),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.user_id),
      customerIdx: index("customer_idx").on(table.customer_id),
    };
  },
);

export const order_items = pgTable("order_items", {
  item_id: uuid("item_id").primaryKey().defaultRandom().notNull(),
  order_id: uuid("order_id").references(() => orders.order_id),
  product_id: uuid("product_id").references(() => products.product_id),
  quantity: uuid("quantity").notNull(),
  unit_price: real("unit_price").notNull(),
  total_price: real("total_price").notNull(),
});

export const shipments = pgTable("shipments", {
  shipment_id: uuid("shipment_id").primaryKey().defaultRandom().notNull(),
  order_id: uuid("order_id").references(() => orders.order_id),
  shipping_method: text("shipping_method").notNull(),
  tracking_number: text("tracking_number"),
  ship_date: date("ship_date"),
  estimated_delivery_date: date("estimated_delivery_date"),
  actual_delivery_date: date("actual_delivery_date"),
  status: text("status").default("preparing"),
});

export const support_tickets = pgTable(
  "support_tickets",
  {
    ticket_id: uuid("ticket_id").primaryKey().defaultRandom().notNull(),
    user_id: uuid("user_id").references(() => users.user_id),
    customer_id: uuid("customer_id").references(() => users.user_id),
    order_id: uuid("order_id").references(() => orders.order_id),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    status: text("status").default("open"),
    priority: text("priority").default("medium"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.user_id),
      customerIdx: index("customer_idx").on(table.customer_id),
    };
  },
);

export const ticket_responses = pgTable("ticket_responses", {
  response_id: uuid("response_id").primaryKey().defaultRandom().notNull(),
  ticket_id: uuid("ticket_id").references(() => support_tickets.ticket_id),
  responder_id: uuid("responder_id").references(() => users.user_id),
  response_text: text("response_text").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const returns = pgTable("returns", {
  return_id: uuid("return_id").primaryKey().defaultRandom().notNull(),
  order_id: uuid("order_id").references(() => orders.order_id),
  user_id: uuid("user_id").references(() => users.user_id),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const return_items = pgTable("return_items", {
  return_item_id: uuid("return_item_id").primaryKey().defaultRandom().notNull(),
  return_id: uuid("return_id").references(() => returns.return_id),
  product_id: uuid("product_id").references(() => products.product_id),
  quantity: uuid("quantity").notNull(),
  reason: text("reason").notNull(),
});

export const refunds = pgTable("refunds", {
  refund_id: uuid("refund_id").primaryKey().defaultRandom().notNull(),
  return_id: uuid("return_id").references(() => returns.return_id),
  amount: real("amount").notNull(),
  refund_date: date("refund_date").notNull(),
  status: text("status").default("pending"),
  refund_method: text("refund_method").notNull(),
});

export const reviews = pgTable(
  "reviews",
  {
    review_id: uuid("review_id").primaryKey().defaultRandom().notNull(),
    product_id: uuid("product_id").references(() => products.product_id),
    user_id: uuid("user_id").references(() => users.user_id),
    rating: uuid("rating").notNull(),
    review_text: text("review_text"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      productIdx: index("product_idx").on(table.product_id),
      userIdx: index("user_idx").on(table.user_id),
    };
  },
);

export const review_responses = pgTable("review_responses", {
  response_id: uuid("response_id").primaryKey().defaultRandom().notNull(),
  review_id: uuid("review_id").references(() => reviews.review_id),
  user_id: uuid("user_id").references(() => users.user_id),
  response_text: text("response_text").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
