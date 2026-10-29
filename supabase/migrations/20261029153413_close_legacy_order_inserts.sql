-- New production intake writes only through authenticated server code.
revoke insert on table public.permit_orders from anon, authenticated;
