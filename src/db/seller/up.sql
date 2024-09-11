CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       phone_number VARCHAR(20) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       last_login TIMESTAMP WITH TIME ZONE,
                       is_active BOOLEAN DEFAULT TRUE,
                       role VARCHAR(20) NOT NULL DEFAULT 'new_staff'
);

CREATE TABLE user_profiles (
                               profile_id SERIAL PRIMARY KEY,
                               user_id INTEGER REFERENCES users(user_id),
                               full_name VARCHAR(100),
                               business_name VARCHAR(100),
                               business_address TEXT,
                               business_registration_number VARCHAR(50),
                               tax_id VARCHAR(50),
                               bank_account_name VARCHAR(100),
                               bank_account_number VARCHAR(50),
                               bank_name VARCHAR(100),
                               profile_image_url VARCHAR(255),
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
                       role_id SERIAL PRIMARY KEY,
                       role_name VARCHAR(50) UNIQUE NOT NULL,
                       description TEXT
);

CREATE TABLE user_roles (
                            user_id INTEGER REFERENCES users(user_id),
                            role_id INTEGER REFERENCES roles(role_id),
                            PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
                             permission_id SERIAL PRIMARY KEY,
                             permission_name VARCHAR(50) UNIQUE NOT NULL,
                             description TEXT
);

CREATE TABLE role_permissions (
                                  role_id INTEGER REFERENCES roles(role_id),
                                  permission_id INTEGER REFERENCES permissions(permission_id),
                                  PRIMARY KEY (role_id, permission_id)
);

-- Marketing Management

CREATE TABLE banners (
                         banner_id SERIAL PRIMARY KEY,
                         user_id INTEGER REFERENCES users(user_id),
                         image_url VARCHAR(255) NOT NULL,
                         link_url VARCHAR(255),
                         start_date DATE NOT NULL,
                         end_date DATE NOT NULL,
                         slot_time TIME NOT NULL,
                         location VARCHAR(100) NOT NULL,
                         status VARCHAR(20) NOT NULL DEFAULT 'pending',
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
                           campaign_id SERIAL PRIMARY KEY,
                           name VARCHAR(100) NOT NULL,
                           description TEXT,
                           start_date DATE NOT NULL,
                           end_date DATE NOT NULL,
                           status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
);

CREATE TABLE campaign_participants (
                                       participant_id SERIAL PRIMARY KEY,
                                       campaign_id INTEGER REFERENCES campaigns(campaign_id),
                                       user_id INTEGER REFERENCES users(user_id),
                                       joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Management

CREATE TABLE delivery_channels (
                                   channel_id SERIAL PRIMARY KEY,
                                   user_id INTEGER REFERENCES users(user_id),
                                   name VARCHAR(100) NOT NULL,
                                   type VARCHAR(50) NOT NULL,
                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_zones (
                                zone_id SERIAL PRIMARY KEY,
                                channel_id INTEGER REFERENCES delivery_channels(channel_id),
                                name VARCHAR(100) NOT NULL,
                                polygon GEOMETRY(POLYGON, 4326),
                                delivery_timeframe VARCHAR(100),
                                special_instructions TEXT
);

CREATE TABLE shipping_rates (
                                rate_id SERIAL PRIMARY KEY,
                                zone_id INTEGER REFERENCES delivery_zones(zone_id),
                                min_weight DECIMAL(10, 2),
                                max_weight DECIMAL(10, 2),
                                price DECIMAL(10, 2) NOT NULL
);

-- Product Management

CREATE TABLE categories (
                            category_id SERIAL PRIMARY KEY,
                            parent_category_id INTEGER REFERENCES categories(category_id),
                            name VARCHAR(100) NOT NULL,
                            description TEXT,
                            is_approved BOOLEAN DEFAULT FALSE
);

CREATE TABLE brands (
                        brand_id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        is_approved BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
                          product_id SERIAL PRIMARY KEY,
                          user_id INTEGER REFERENCES users(user_id),
                          category_id INTEGER REFERENCES categories(category_id),
                          brand_id INTEGER REFERENCES brands(brand_id),
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          sku VARCHAR(50) UNIQUE NOT NULL,
                          barcode VARCHAR(50),
                          retail_price DECIMAL(10, 2) NOT NULL,
                          wholesale_price DECIMAL(10, 2),
                          carton_price DECIMAL(10, 2),
                          weight DECIMAL(10, 2),
                          dimensions VARCHAR(50),
                          stock_quantity INTEGER NOT NULL DEFAULT 0,
                          low_stock_threshold INTEGER DEFAULT 10,
                          is_active BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
                                image_id SERIAL PRIMARY KEY,
                                product_id INTEGER REFERENCES products(product_id),
                                image_url VARCHAR(255) NOT NULL,
                                is_primary BOOLEAN DEFAULT FALSE,
                                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_views (
                               view_id SERIAL PRIMARY KEY,
                               product_id INTEGER REFERENCES products(product_id),
                               user_id INTEGER REFERENCES users(user_id),
                               viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Finance Management

CREATE TABLE invoices (
                          invoice_id SERIAL PRIMARY KEY,
                          user_id INTEGER REFERENCES users(user_id),
                          customer_id INTEGER REFERENCES users(user_id),
                          invoice_number VARCHAR(50) UNIQUE NOT NULL,
                          issue_date DATE NOT NULL,
                          due_date DATE NOT NULL,
                          total_amount DECIMAL(10, 2) NOT NULL,
                          status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
                               item_id SERIAL PRIMARY KEY,
                               invoice_id INTEGER REFERENCES invoices(invoice_id),
                               product_id INTEGER REFERENCES products(product_id),
                               quantity INTEGER NOT NULL,
                               unit_price DECIMAL(10, 2) NOT NULL,
                               total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE payments (
                          payment_id SERIAL PRIMARY KEY,
                          invoice_id INTEGER REFERENCES invoices(invoice_id),
                          amount DECIMAL(10, 2) NOT NULL,
                          payment_date DATE NOT NULL,
                          payment_method VARCHAR(50) NOT NULL,
                          transaction_id VARCHAR(100),
                          status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

CREATE TABLE credit_limits (
                               credit_id SERIAL PRIMARY KEY,
                               user_id INTEGER REFERENCES users(user_id),
                               customer_id INTEGER REFERENCES users(user_id),
                               credit_limit DECIMAL(10, 2) NOT NULL,
                               current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
                               last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fulfillment Management

CREATE TABLE orders (
                        order_id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(user_id),
                        customer_id INTEGER REFERENCES users(user_id),
                        order_number VARCHAR(50) UNIQUE NOT NULL,
                        order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        total_amount DECIMAL(10, 2) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'pending',
                        shipping_address TEXT NOT NULL,
                        billing_address TEXT NOT NULL,
                        delivery_channel_id INTEGER REFERENCES delivery_channels(channel_id),
                        tracking_number VARCHAR(100),
                        estimated_delivery_date DATE
);

CREATE TABLE order_items (
                             item_id SERIAL PRIMARY KEY,
                             order_id INTEGER REFERENCES orders(order_id),
                             product_id INTEGER REFERENCES products(product_id),
                             quantity INTEGER NOT NULL,
                             unit_price DECIMAL(10, 2) NOT NULL,
                             total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE shipments (
                           shipment_id SERIAL PRIMARY KEY,
                           order_id INTEGER REFERENCES orders(order_id),
                           shipping_method VARCHAR(50) NOT NULL,
                           tracking_number VARCHAR(100),
                           ship_date DATE,
                           estimated_delivery_date DATE,
                           actual_delivery_date DATE,
                           status VARCHAR(20) NOT NULL DEFAULT 'preparing'
);

-- After-Sales Customer Service

CREATE TABLE support_tickets (
                                 ticket_id SERIAL PRIMARY KEY,
                                 user_id INTEGER REFERENCES users(user_id),
                                 customer_id INTEGER REFERENCES users(user_id),
                                 order_id INTEGER REFERENCES orders(order_id),
                                 subject VARCHAR(255) NOT NULL,
                                 description TEXT NOT NULL,
                                 status VARCHAR(20) NOT NULL DEFAULT 'open',
                                 priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_responses (
                                  response_id SERIAL PRIMARY KEY,
                                  ticket_id INTEGER REFERENCES support_tickets(ticket_id),
                                  responder_id INTEGER REFERENCES users(user_id),
                                  response_text TEXT NOT NULL,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE returns (
                         return_id SERIAL PRIMARY KEY,
                         order_id INTEGER REFERENCES orders(order_id),
                         user_id INTEGER REFERENCES users(user_id),
                         reason TEXT NOT NULL,
                         status VARCHAR(20) NOT NULL DEFAULT 'pending',
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE return_items (
                              return_item_id SERIAL PRIMARY KEY,
                              return_id INTEGER REFERENCES returns(return_id),
                              product_id INTEGER REFERENCES products(product_id),
                              quantity INTEGER NOT NULL,
                              reason TEXT
);

CREATE TABLE refunds (
                         refund_id SERIAL PRIMARY KEY,
                         return_id INTEGER REFERENCES returns(return_id),
                         amount DECIMAL(10, 2) NOT NULL,
                         refund_date DATE NOT NULL,
                         status VARCHAR(20) NOT NULL DEFAULT 'pending',
                         refund_method VARCHAR(50) NOT NULL
);

CREATE TABLE reviews (
                         review_id SERIAL PRIMARY KEY,
                         product_id INTEGER REFERENCES products(product_id),
                         user_id INTEGER REFERENCES users(user_id),
                         rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         review_text TEXT,
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_responses (
                                  response_id SERIAL PRIMARY KEY,
                                  review_id INTEGER REFERENCES reviews(review_id),
                                  user_id INTEGER REFERENCES users(user_id),
                                  response_text TEXT NOT NULL,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Triggers for automatic updates

-- Update product stock when an order is placed
CREATE OR REPLACE FUNCTION update_product_stock()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_item_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_user_update
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
EXECUTE FUNCTION update_last_login();

-- Automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_modtime
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON products
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_support_tickets_modtime
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_returns_modtime
    BEFORE UPDATE ON returns
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
