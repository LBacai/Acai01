-- ====================================================================
-- 1. LIMPEZA (CUIDADO: Isso apaga dados existentes para recriar a estrutura)
-- ====================================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_addons CASCADE;
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ====================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ====================================================================

-- Categorias
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Produtos
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

-- Adicionais (Ex: Leite Ninho, Morango)
CREATE TABLE addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Relacionamento Produto <-> Adicionais
CREATE TABLE product_addons (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES addons(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, addon_id)
);

-- Clientes (Dados do Checkout)
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Endereços
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  cep text,
  street text,
  number text,
  district text,
  city text DEFAULT 'Guarulhos',
  state text DEFAULT 'SP',
  created_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  address_id uuid REFERENCES addresses(id),
  total numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) DEFAULT 0,
  status text DEFAULT 'pending', -- pending, preparing, delivery, completed, cancelled
  payment_method text, -- pix, card, money
  created_at timestamptz DEFAULT now()
);

-- Itens do Pedido
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  extras jsonb -- Para salvar quais adicionais foram escolhidos neste item
);

-- ====================================================================
-- 3. SEGURANÇA (Row Level Security)
-- ====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas:
-- Leitura Pública (Qualquer um vê o cardápio)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Addons" ON addons FOR SELECT USING (true);
CREATE POLICY "Public Read ProductAddons" ON product_addons FOR SELECT USING (true);

-- Escrita Restrita (Só Admin altera cardápio)
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Addons" ON addons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All ProductAddons" ON product_addons FOR ALL USING (auth.role() = 'authenticated');

-- Checkout (Qualquer um pode criar pedidos/clientes)
CREATE POLICY "Public Insert Customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Addresses" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert OrderItems" ON order_items FOR INSERT WITH CHECK (true);

-- Leitura de Pedidos (Público pode ler seu próprio pedido se tiver o ID, Admin vê tudo)
CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true); 
CREATE POLICY "Public Read OrderItems" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public Read Customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Read Addresses" ON addresses FOR SELECT USING (true);

-- Admin Gerencia Pedidos (Atualizar status)
CREATE POLICY "Admin Update Orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- ====================================================================
-- 4. DADOS INICIAIS (SEED)
-- ====================================================================

-- Inserir Categorias
INSERT INTO categories (name, slug) VALUES
('Açaí', 'acai'),
('Sorvetes', 'sorvetes'),
('Bebidas', 'bebidas');

-- Inserir Adicionais
INSERT INTO addons (name, price) VALUES
('Leite Ninho', 3.00),
('Nutella', 5.00),
('Morango', 4.00),
('Banana', 2.00),
('Paçoca', 1.50),
('Granola', 1.00),
('Leite Condensado', 2.00),
('Confete', 2.50);

-- Inserir Produtos (Açaí)
WITH cat AS (SELECT id FROM categories WHERE slug = 'acai' LIMIT 1)
INSERT INTO products (name, description, price, image_url, category_id) VALUES
('Copo 300ml', 'Açaí puro ou batido com banana/morango. Escolha seus adicionais.', 12.00, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat)),
('Copo 500ml', 'O tamanho ideal para sua fome. Açaí cremoso.', 18.00, 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat)),
('Copo 700ml', 'Para quem ama açaí de verdade.', 24.00, 'https://images.unsplash.com/photo-1588710929895-6ee8a0a446d3?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat)),
('Barca 1L', 'A famosa barca! Serve até 3 pessoas. Acompanha 3 frutas e 4 adicionais.', 45.00, 'https://images.unsplash.com/photo-1626078299034-75618589f8e4?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat));

-- Inserir Produtos (Bebidas)
WITH cat AS (SELECT id FROM categories WHERE slug = 'bebidas' LIMIT 1)
INSERT INTO products (name, description, price, image_url, category_id) VALUES
('Água Mineral', '500ml', 3.00, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat)),
('Coca-Cola Lata', '350ml', 6.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', (SELECT id FROM cat));

-- Vincular TODOS os adicionais a TODOS os produtos da categoria Açaí
INSERT INTO product_addons (product_id, addon_id)
SELECT p.id, a.id
FROM products p, addons a
WHERE p.category_id = (SELECT id FROM categories WHERE slug = 'acai');
