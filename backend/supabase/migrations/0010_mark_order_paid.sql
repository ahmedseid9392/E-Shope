-- Marks an order paid, records the payment, and decrements stock for each
-- item — all inside one transaction, so a crash partway through can never
-- leave stock decremented without the order marked paid, or vice versa.
--
-- Idempotent on purpose: Chapa can and does redeliver the same webhook/
-- callback more than once (network retries, the user also landing on the
-- return page, etc). If the order is no longer 'pending' when this runs,
-- it's a no-op that just makes sure the payment row reflects the event,
-- rather than double-decrementing stock or inserting a duplicate payment.
--
-- security definer + a fixed search_path so this can be called by the admin
-- client (service role) regardless of RLS on orders/payments/products —
-- those tables intentionally have no client-facing write policy for
-- payments, and only admins can update orders directly.
create or replace function mark_order_paid(
  p_order_id uuid,
  p_tx_ref text,
  p_chapa_reference text,
  p_amount numeric
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from orders where id = p_order_id for update;

  if v_status is null then
    raise exception 'Order % not found', p_order_id;
  end if;

  if v_status <> 'pending' then
    insert into payments (order_id, tx_ref, chapa_reference, status, amount)
    values (p_order_id, p_tx_ref, p_chapa_reference, 'success', p_amount)
    on conflict (tx_ref) do update
      set chapa_reference = excluded.chapa_reference,
          status = excluded.status;
    return false;
  end if;

  update orders set status = 'paid' where id = p_order_id;

  insert into payments (order_id, tx_ref, chapa_reference, status, amount)
  values (p_order_id, p_tx_ref, p_chapa_reference, 'success', p_amount)
  on conflict (tx_ref) do update
    set chapa_reference = excluded.chapa_reference,
        status = excluded.status,
        amount = excluded.amount;

  update products
  set stock = greatest(products.stock - order_items.quantity, 0)
  from order_items
  where order_items.order_id = p_order_id
    and products.id = order_items.product_id;

  return true;
end;
$$;
