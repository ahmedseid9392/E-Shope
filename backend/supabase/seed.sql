-- Sample data for local development. Run automatically by `supabase db reset`.

insert into categories (name, slug) values
  ('Clothing', 'clothing'),
  ('Electronics', 'electronics'),
  ('Home & Living', 'home-living')
on conflict (slug) do nothing;

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select
  'Sample T-Shirt', 'sample-t-shirt', 'A comfortable everyday t-shirt.', 450.00, 350.00, 50,
  (select id from categories where slug = 'clothing'),
  '{}', true
where not exists (select 1 from products where slug = 'sample-t-shirt');

insert into products (name, slug, description, price, stock, category_id, image_urls, is_active)
select
  'Sample Bluetooth Speaker', 'sample-bluetooth-speaker', 'Portable speaker, 10h battery.', 2200.00, 20,
  (select id from categories where slug = 'electronics'),
  '{}', true
where not exists (select 1 from products where slug = 'sample-bluetooth-speaker');

insert into products (name, slug, description, price, stock, category_id, image_urls, is_active)
select
  'Sample Ceramic Mug', 'sample-ceramic-mug', 'Hand-glazed ceramic mug, 350ml.', 180.00, 100,
  (select id from categories where slug = 'home-living'),
  '{}', true
where not exists (select 1 from products where slug = 'sample-ceramic-mug');

-- ─────────────────────────────────────────────────────────────────────────────
-- Extra sample products — more items in every category, for testing browsing,
-- filtering, and the color/size options on the product detail page.
-- Images are placeholder photos (picsum.photos, deterministic by seed name) —
-- swap them for real product photos before going to production.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Clothing (with colors + sizes) ──────────────────────────────────────────
insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Classic Crewneck T-Shirt', 'classic-crewneck-tshirt', '100% combed cotton, pre-shrunk.', 480.00, null, 80,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/tshirt-crew/800/800'],
  array['Black', 'White', 'Navy', 'Gray'], array['S', 'M', 'L', 'XL'], true
where not exists (select 1 from products where slug = 'classic-crewneck-tshirt');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Slim Fit Denim Jeans', 'slim-fit-denim-jeans', 'Stretch denim, tapered leg.', 1350.00, 1100.00, 40,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/denim-jeans/800/800'],
  array['Blue', 'Black'], array['30', '32', '34', '36'], true
where not exists (select 1 from products where slug = 'slim-fit-denim-jeans');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Everyday Hoodie', 'everyday-hoodie', 'Fleece-lined pullover hoodie.', 950.00, null, 60,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/hoodie-1/800/800'],
  array['Black', 'Gray', 'Maroon'], array['S', 'M', 'L', 'XL', 'XXL'], true
where not exists (select 1 from products where slug = 'everyday-hoodie');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Lightweight Bomber Jacket', 'lightweight-bomber-jacket', 'Water-resistant shell, ribbed cuffs.', 2100.00, 1800.00, 25,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/bomber-jacket/800/800'],
  array['Black', 'Olive'], array['M', 'L', 'XL'], true
where not exists (select 1 from products where slug = 'lightweight-bomber-jacket');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Linen Summer Shirt', 'linen-summer-shirt', 'Breathable linen blend, relaxed fit.', 720.00, null, 55,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/linen-shirt/800/800'],
  array['White', 'Sky Blue', 'Sand'], array['S', 'M', 'L', 'XL'], true
where not exists (select 1 from products where slug = 'linen-summer-shirt');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Athletic Jogger Pants', 'athletic-jogger-pants', 'Tapered joggers with zip pockets.', 680.00, null, 70,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/joggers-1/800/800'],
  array['Black', 'Gray', 'Navy'], array['S', 'M', 'L', 'XL'], true
where not exists (select 1 from products where slug = 'athletic-jogger-pants');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Wool Blend Overcoat', 'wool-blend-overcoat', 'Tailored overcoat for cold weather.', 3200.00, 2750.00, 15,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/overcoat-1/800/800'],
  array['Camel', 'Charcoal', 'Black'], array['M', 'L', 'XL'], true
where not exists (select 1 from products where slug = 'wool-blend-overcoat');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, colors, sizes, is_active)
select 'Cotton Ankle Socks (3-Pack)', 'cotton-ankle-socks-3-pack', 'Cushioned sole, breathable cotton.', 220.00, null, 150,
  (select id from categories where slug = 'clothing'),
  array['https://picsum.photos/seed/ankle-socks/800/800'],
  array['White', 'Black', 'Mixed'], array['One Size'], true
where not exists (select 1 from products where slug = 'cotton-ankle-socks-3-pack');

-- ── Electronics ──────────────────────────────────────────────────────────────
insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Wireless Noise-Cancelling Headphones', 'wireless-nc-headphones', 'Over-ear, 30h battery, active ANC.', 4200.00, 3600.00, 30,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/headphones-1/800/800'], true
where not exists (select 1 from products where slug = 'wireless-nc-headphones');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'USB-C Fast Charger (65W)', 'usb-c-fast-charger-65w', 'GaN charger, compact, multi-port.', 950.00, null, 90,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/usb-charger/800/800'], true
where not exists (select 1 from products where slug = 'usb-c-fast-charger-65w');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Smartwatch Fitness Tracker', 'smartwatch-fitness-tracker', 'Heart rate, GPS, 7-day battery.', 3800.00, 3200.00, 35,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/smartwatch-1/800/800'], true
where not exists (select 1 from products where slug = 'smartwatch-fitness-tracker');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Mechanical Keyboard (RGB)', 'mechanical-keyboard-rgb', 'Hot-swappable switches, RGB backlight.', 2600.00, null, 22,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/mech-keyboard/800/800'], true
where not exists (select 1 from products where slug = 'mechanical-keyboard-rgb');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Portable Power Bank 20000mAh', 'portable-power-bank-20000', 'Dual-port fast charging power bank.', 1450.00, 1200.00, 60,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/power-bank/800/800'], true
where not exists (select 1 from products where slug = 'portable-power-bank-20000');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select '4K Action Camera', '4k-action-camera', 'Waterproof housing, image stabilization.', 5200.00, null, 12,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/action-camera/800/800'], true
where not exists (select 1 from products where slug = '4k-action-camera');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Wireless Ergonomic Mouse', 'wireless-ergonomic-mouse', 'Vertical grip, silent clicks.', 890.00, null, 75,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/ergo-mouse/800/800'], true
where not exists (select 1 from products where slug = 'wireless-ergonomic-mouse');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select '27-inch 4K Monitor', '27-inch-4k-monitor', 'IPS panel, HDR10, USB-C input.', 12500.00, 10900.00, 10,
  (select id from categories where slug = 'electronics'),
  array['https://picsum.photos/seed/4k-monitor/800/800'], true
where not exists (select 1 from products where slug = '27-inch-4k-monitor');

-- ── Home & Living ────────────────────────────────────────────────────────────
insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Linen Throw Pillow Cover', 'linen-throw-pillow-cover', 'Soft linen blend, hidden zipper, 45x45cm.', 320.00, null, 100,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/throw-pillow/800/800'], true
where not exists (select 1 from products where slug = 'linen-throw-pillow-cover');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Cast Iron Skillet (12-inch)', 'cast-iron-skillet-12in', 'Pre-seasoned, oven-safe cast iron.', 1100.00, 950.00, 40,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/cast-iron/800/800'], true
where not exists (select 1 from products where slug = 'cast-iron-skillet-12in');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Scented Soy Candle Set', 'scented-soy-candle-set', 'Set of 3, hand-poured soy wax.', 480.00, null, 90,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/soy-candle/800/800'], true
where not exists (select 1 from products where slug = 'scented-soy-candle-set');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Bamboo Cutting Board Set', 'bamboo-cutting-board-set', 'Set of 3, organic bamboo, juice groove.', 650.00, 520.00, 65,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/cutting-board/800/800'], true
where not exists (select 1 from products where slug = 'bamboo-cutting-board-set');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Cotton Bath Towel Set', 'cotton-bath-towel-set', 'Set of 4, 100% combed cotton, quick-dry.', 780.00, null, 55,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/bath-towel/800/800'], true
where not exists (select 1 from products where slug = 'cotton-bath-towel-set');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Ceramic Plant Pot (Set of 3)', 'ceramic-plant-pot-set-3', 'Matte finish, drainage hole + tray.', 560.00, 470.00, 45,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/plant-pot/800/800'], true
where not exists (select 1 from products where slug = 'ceramic-plant-pot-set-3');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Memory Foam Bath Mat', 'memory-foam-bath-mat', 'Non-slip base, quick-absorbing top.', 390.00, null, 80,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/bath-mat/800/800'], true
where not exists (select 1 from products where slug = 'memory-foam-bath-mat');

insert into products (name, slug, description, price, sale_price, stock, category_id, image_urls, is_active)
select 'Stainless Steel Cookware Set', 'stainless-steel-cookware-set', '10-piece set, induction-compatible.', 4500.00, 3900.00, 18,
  (select id from categories where slug = 'home-living'),
  array['https://picsum.photos/seed/cookware-set/800/800'], true
where not exists (select 1 from products where slug = 'stainless-steel-cookware-set');
