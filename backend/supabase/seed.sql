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
