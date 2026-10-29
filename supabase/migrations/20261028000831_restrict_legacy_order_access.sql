begin;
revoke select, update, delete, truncate, references, trigger on public.permit_orders from anon, authenticated;
-- Retain INSERT temporarily for the existing live intake; the new workflow migration removes it.
commit;
