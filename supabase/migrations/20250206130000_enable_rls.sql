/*
  # Enable RLS and Security Policies
  
  ## Description
  Enables Row Level Security on all public tables to fix security advisories.
  Sets up policies for:
  - Public Read Access: Products, Categories (Catalog)
  - Public Write Access: Orders, Customers (Guest Checkout)
  - Admin Access: Full control for authenticated users (Simulating Admin)

  ## Security Implications
  - RLS Status: Enabled on all tables
  - Impact: High (Restricts direct DB access)
*/

-- 1. Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies (Catalog)
CREATE POLICY "Public can view categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public can view addons" ON addons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view product_addons" ON product_addons FOR SELECT TO anon, authenticated USING (true);

-- 3. Public Write Policies (Checkout Flow)
CREATE POLICY "Public can create customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can create addresses" ON addresses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can create order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Admin Policies (Authenticated Users)
-- Note: In a production app, you would check for a specific role (e.g., auth.jwt() ->> 'role' = 'admin')
-- For this MVP, we assume any logged-in user via Supabase Auth is an admin/staff.

CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access addons" ON addons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access product_addons" ON product_addons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access addresses" ON addresses FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL TO authenticated USING (true);
