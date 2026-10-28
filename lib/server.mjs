import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
export const required = (key) => { const value = process.env[key]?.trim(); if (!value) throw new Error(`Missing server configuration: ${key}`); return value; };
export function database() { return createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } }); }
export function stripeClient() { const mode = required('STRIPE_MODE'); const key = required('STRIPE_SECRET_KEY'); if (!['test','live'].includes(mode) || !key.includes(`_${mode}_`)) throw new Error('Stripe mode and key do not match'); return new Stripe(key); }
export function siteUrl() { const url = new URL(required('SITE_URL')); if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('SITE_URL must use HTTPS'); return url.origin; }
export async function requireAdmin(req) {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw Object.assign(new Error('Please sign in.'), { status: 401 });
  const db = database();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) throw Object.assign(new Error('Please sign in again.'), { status: 401 });
  const allowed = required('ADMIN_USER_IDS').split(',').map((id) => id.trim());
  if (!allowed.includes(data.user.id)) throw Object.assign(new Error('Admin access required.'), { status: 403 });
  return { db, user: data.user };
}
export function failure(error) { const status = error.status || 503; console.error('Request failed', error.status || 'server'); return Response.json({ error: status < 500 ? error.message : 'Service unavailable. Please contact movingforwardpermitting@gmail.com.' }, { status }); }
export async function jsonBody(req) { const raw = await req.text(); if (raw.length > 100000) throw Object.assign(new Error('Request too large.'), { status: 413 }); try { return JSON.parse(raw); } catch { throw Object.assign(new Error('Invalid request.'), { status: 400 }); } }
export const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
