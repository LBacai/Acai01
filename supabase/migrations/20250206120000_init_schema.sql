/*
  # Toledos Açaí - Schema Inicial e Seed Data
  
  ## Query Description:
  Criação de todas as tabelas necessárias para o funcionamento do app e inserção de dados iniciais para teste.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Reversible: true
*/

-- Limpeza (se necessário, cuidado em prod)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_addons CASCADE;
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 1. Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Addons (Complementos)
CREATE TABLE addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Product Addons (Relacionamento N:N)
CREATE TABLE product_addons (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES addons(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, addon_id)
);

-- 5. Customers
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- 6. Addresses
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  cep text,
  street text,
  number text,
  district text,
  city text DEFAULT 'Guarulhos',
  state text DEFAULT 'SP',
  complement text,
  active boolean DEFAULT true
);

-- 7. Coupons
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text CHECK (discount_type IN ('percent','fixed')) NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  active boolean DEFAULT true,
  valid_from timestamptz,
  valid_to timestamptz
);

-- 8. Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  address_id uuid REFERENCES addresses(id),
  total numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) DEFAULT 0,
  coupon_id uuid REFERENCES coupons(id),
  payment_method text DEFAULT 'pix',
  status text DEFAULT 'pending', -- pending, preparing, delivering, completed, cancelled
  created_at timestamptz DEFAULT now()
);

-- 9. Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  extras jsonb -- Para armazenar personalizações
);

-- 10. Admin Users
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL, -- Em produção, use hash real
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS (Row Level Security) - Básico para começar
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas de Leitura (Qualquer um pode ver produtos)
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public addons are viewable by everyone" ON addons FOR SELECT USING (true);

-- Políticas de Pedidos (Permitir inserção anônima para checkout)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create addresses" ON addresses FOR INSERT WITH CHECK (true);

-- SEED DATA (Dados Iniciais)
INSERT INTO categories (name, slug) VALUES 
('Açaí Tradicional', 'acai-tradicional'),
('Açaí Trufado', 'acai-trufado'),
('Bebidas', 'bebidas');

DO $$
DECLARE
  cat_trad uuid;
  cat_truf uuid;
  cat_beb uuid;
BEGIN
  SELECT id INTO cat_trad FROM categories WHERE slug = 'acai-tradicional';
  SELECT id INTO cat_truf FROM categories WHERE slug = 'acai-trufado';
  SELECT id INTO cat_beb FROM categories WHERE slug = 'bebidas';

  INSERT INTO products (name, description, price, image_url, category_id) VALUES
  ('Copo 300ml', 'Açaí puro e cremoso, monte do seu jeito.', 15.00, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=1000', cat_trad),
  ('Copo 500ml', 'O tamanho ideal para sua fome.', 22.00, 'https://images.unsplash.com/photo-1490323914169-4f7f26db0986?auto=format&fit=crop&q=80&w=1000', cat_trad),
  ('Barca 1L', 'Para dividir com a galera (ou não).', 45.00, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=1000', cat_trad),
  ('Açaí com Nutella', 'Copo 500ml com muita Nutella original.', 28.00, 'https://images.unsplash.com/photo-1490323914169-4f7f26db0986?auto=format&fit=crop&q=80&w=1000', cat_truf),
  ('Água Mineral', '500ml sem gás', 4.00, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&q=80&w=1000', cat_beb);

  INSERT INTO addons (name, price) VALUES
  ('Leite Ninho', 3.00),
  ('Morango', 4.00),
  ('Banana', 2.00),
  ('Paçoca', 2.00),
  ('Granola', 0.00);

END $$;
