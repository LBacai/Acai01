-- 1. ATIVAR REALTIME (Para o Painel Admin atualizar sozinho)
-- Adiciona a tabela 'orders' à publicação do supabase_realtime
alter publication supabase_realtime add table orders;

-- 2. GARANTIR PERMISSÕES PÚBLICAS (Para o Cliente ver o cardápio e pedir)
-- Removemos políticas antigas para evitar duplicidade e recriamos as corretas

-- Produtos e Categorias (Leitura Pública)
drop policy if exists "Public Read Products" on products;
create policy "Public Read Products" on products for select to anon, authenticated using (true);

drop policy if exists "Public Read Categories" on categories;
create policy "Public Read Categories" on categories for select to anon, authenticated using (true);

drop policy if exists "Public Read Addons" on addons;
create policy "Public Read Addons" on addons for select to anon, authenticated using (true);

drop policy if exists "Public Read Product Addons" on product_addons;
create policy "Public Read Product Addons" on product_addons for select to anon, authenticated using (true);

-- Checkout (Permitir criar pedidos sem login)
drop policy if exists "Public Insert Customers" on customers;
create policy "Public Insert Customers" on customers for insert to anon, authenticated with check (true);

drop policy if exists "Public Insert Addresses" on addresses;
create policy "Public Insert Addresses" on addresses for insert to anon, authenticated with check (true);

drop policy if exists "Public Insert Orders" on orders;
create policy "Public Insert Orders" on orders for insert to anon, authenticated with check (true);

drop policy if exists "Public Insert Order Items" on order_items;
create policy "Public Insert Order Items" on order_items for insert to anon, authenticated with check (true);

-- Rastreamento e Admin (Leitura de Pedidos)
drop policy if exists "Read Orders" on orders;
create policy "Read Orders" on orders for select to anon, authenticated using (true);

drop policy if exists "Read Order Items" on order_items;
create policy "Read Order Items" on order_items for select to anon, authenticated using (true);

drop policy if exists "Admin Update Orders" on orders;
create policy "Admin Update Orders" on orders for update to authenticated using (true);

-- Endereços e Clientes (Leitura para Admin)
drop policy if exists "Read Customers" on customers;
create policy "Read Customers" on customers for select to anon, authenticated using (true);

drop policy if exists "Read Addresses" on addresses;
create policy "Read Addresses" on addresses for select to anon, authenticated using (true);
