-- Per-requested-permit delivery: each state/permit item can be emailed as it arrives.
-- No customer access to this table; all writes and delivery operations use the server service role.
begin;
create table if not exists public.permit_item_deliveries (
  id bigint generated always as identity primary key,
  order_number uuid not null,
  item_index integer not null check (item_index >= 0 and item_index < 100),
  state text not null,
  permit_type text not null,
  file_paths jsonb not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued','sent')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  created_by uuid not null,
  unique(order_number,item_index),
  check (jsonb_typeof(file_paths) = 'array' and jsonb_array_length(file_paths) between 1 and 20)
);
create index if not exists permit_item_deliveries_order_idx on public.permit_item_deliveries(order_number);
alter table public.permit_item_deliveries enable row level security;
revoke all on public.permit_item_deliveries from public, anon, authenticated;
grant select,insert,update,delete on public.permit_item_deliveries to service_role;
grant usage,select on sequence public.permit_item_deliveries_id_seq to service_role;

-- Lock the parent order so concurrent deliveries cannot overwrite its aggregate status.
-- Enqueue one notification atomically with the recorded item delivery. A second attempt
-- for the same item is rejected, preventing accidental duplicate customer emails.
create or replace function public.queue_permit_item_delivery(
  p_order uuid, p_index integer, p_state text, p_type text,
  p_files jsonb, p_admin uuid, p_recipient text, p_subject text, p_html text
) returns boolean
language plpgsql security invoker set search_path = public
as $$
declare
  v_order public.permit_orders%rowtype;
  v_total integer;
  v_recorded integer;
begin
  select * into v_order from public.permit_orders
    where order_number = p_order for update;
  if not found or v_order.payment_status <> 'paid'
     or v_order.order_status not in ('processing','issued','partially_delivered','delivery_queued') then
    raise exception 'Order is not ready for individual permit delivery';
  end if;
  if (v_order.quote->>'stripeMode') is distinct from 'live' then
    raise exception 'Only confirmed live payments can release issued permits';
  end if;
  v_total := jsonb_array_length(coalesce(v_order.order_items,'[]'::jsonb));
  if p_index < 0 or p_index >= v_total then
    raise exception 'Permit item index is not part of the order';
  end if;
  if (v_order.order_items->p_index->>'state') is distinct from p_state
     or (v_order.order_items->p_index->>'permitType') is distinct from p_type then
    raise exception 'Permit item did not match the approved order';
  end if;
  if nullif(trim(p_recipient),'') is null or p_recipient is distinct from v_order.contact_email then
    raise exception 'Delivery recipient is not the approved customer';
  end if;
  if jsonb_typeof(p_files) is distinct from 'array'
    or jsonb_array_length(p_files) < 1 or jsonb_array_length(p_files) > 20 then
    raise exception 'Issued PDFs are required';
  end if;
  insert into public.permit_item_deliveries
    (order_number,item_index,state,permit_type,file_paths,created_by)
  values (p_order,p_index,p_state,p_type,p_files,p_admin);
  insert into public.permit_mail_queue (message_key,recipient,subject,html)
  values ('item-delivery-'||p_order::text||'-'||p_index::text,
          p_recipient,p_subject,p_html);
  select count(*) into v_recorded from public.permit_item_deliveries
    where order_number=p_order;
  update public.permit_orders set
    order_status = case when v_recorded = v_total then 'delivery_queued' else 'partially_delivered' end,
    last_updated_by = p_admin,
    updated_at = now()
  where order_number=p_order;
  return true;
end;
$$;
revoke all on function public.queue_permit_item_delivery(uuid,integer,text,text,jsonb,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.queue_permit_item_delivery(uuid,integer,text,text,jsonb,uuid,text,text,text) to service_role;

-- Called only after the email provider accepts the individual item's delivery email.
-- An order is fully delivered only when every item email has been accepted.
create or replace function public.mark_permit_item_delivery_sent(
  p_order uuid, p_index integer
) returns boolean
language plpgsql security invoker set search_path = public
as $$
declare
  v_order public.permit_orders%rowtype;
  v_total integer;
  v_sent integer;
begin
  select * into v_order from public.permit_orders
    where order_number=p_order for update;
  if not found or v_order.payment_status <> 'paid' then
    raise exception 'Paid order not found';
  end if;
  update public.permit_item_deliveries
  set delivery_status='sent', sent_at=coalesce(sent_at,now())
  where order_number=p_order and item_index=p_index;
  if not found then raise exception 'Item delivery record not found'; end if;
  v_total := jsonb_array_length(coalesce(v_order.order_items,'[]'::jsonb));
  select count(*) into v_sent from public.permit_item_deliveries
    where order_number=p_order and delivery_status='sent';
  update public.permit_orders
  set order_status=case when v_total > 0 and v_sent=v_total
                        then 'delivery_sent' else 'partially_delivered' end,
      delivery_sent_at=case when v_total > 0 and v_sent=v_total then coalesce(delivery_sent_at,now())
                             else delivery_sent_at end,
      updated_at=now()
  where order_number=p_order;
  return true;
end;
$$;
revoke all on function public.mark_permit_item_delivery_sent(uuid,integer) from public, anon, authenticated;
grant execute on function public.mark_permit_item_delivery_sent(uuid,integer) to service_role;
commit;
