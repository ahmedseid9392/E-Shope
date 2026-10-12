
-- Atomically create a pending order and its line items.
-- The caller's identity comes from the authenticated Supabase session.

create or replace function public.create_pending_order_from_cart(
  p_shipping_address jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders;
  v_total numeric(12, 2);
begin
  if v_user_id is null then
    raise exception 'Not authenticated.';
  end if;

  if jsonb_typeof(p_shipping_address) is distinct from 'object'
     or coalesce(trim(p_shipping_address ->> 'full_name'), '') = ''
     or coalesce(trim(p_shipping_address ->> 'phone'), '') = ''
     or coalesce(trim(p_shipping_address ->> 'address_line'), '') = ''
  then
    raise exception 'A valid shipping address is required.';
  end if;

  if not exists (
    select 1
    from public.cart_items ci
    where ci.user_id = v_user_id
  ) then
    raise exception 'Your cart is empty.';
  end if;

  -- Lock the relevant product rows in a consistent order.
  -- This prevents stock changing while this transaction validates the cart.
  perform p.id
  from public.products p
  where p.id in (
    select distinct ci.product_id
    from public.cart_items ci
    where ci.user_id = v_user_id
  )
  order by p.id
  for update;

  -- Validate active products and aggregate quantities across cart variants.
  if exists (
    select 1
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.user_id = v_user_id
      and (
        p.is_active = false
        or p.stock < (
          select coalesce(sum(ci2.quantity), 0)
          from public.cart_items ci2
          where ci2.user_id = v_user_id
            and ci2.product_id = ci.product_id
        )
      )
  ) then
    raise exception
      'One or more cart items are unavailable or exceed available stock.';
  end if;

  -- Calculate prices in the database, not from client-supplied totals.
  select round(sum(
    coalesce(p.sale_price, p.price) * ci.quantity
  ), 2)::numeric(12, 2)
  into v_total
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = v_user_id;

  if v_total is null or v_total < 0 then
    raise exception 'Unable to calculate the order total.';
  end if;

  insert into public.orders (
    user_id,
    status,
    total,
    shipping_address
  )
  values (
    v_user_id,
    'pending',
    v_total,
    p_shipping_address
  )
  returning * into v_order;

  insert into public.order_items (
    order_id,
    product_id,
    quantity,
    price_at_purchase,
    color,
    size
  )
  select
    v_order.id,
    p.id,
    ci.quantity,
    coalesce(p.sale_price, p.price),
    ci.color,
    ci.size
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = v_user_id;

  return v_order;
end;
$function$;

-- Do not expose this privileged function to anonymous callers.
revoke all on function public.create_pending_order_from_cart(jsonb)
  from public, anon;

grant execute on function public.create_pending_order_from_cart(jsonb)
  to authenticated;